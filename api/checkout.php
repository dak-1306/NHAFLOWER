<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once 'config/connection.php';
$response = ['success' => false, 'message' => '', 'data' => null];

// Nhận dữ liệu từ frontend
$id_khachhang = $_POST['id_khachhang'] ?? null;
$dia_chi_giao = $_POST['dia_chi_giao'] ?? null;
$products = isset($_POST['products']) ? json_decode($_POST['products'], true) : null;

if (!$id_khachhang || !$dia_chi_giao || !$products || !is_array($products) || count($products) == 0) {
    $response['message'] = 'Thiếu thông tin đơn hàng';
    http_response_code(400);
    echo json_encode($response, JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    $conn->begin_transaction();
    // Insert vào donhang
    $sql = "INSERT INTO donhang (id_khachhang, ngay_dat, dia_chi_giao, trang_thai) VALUES (?, NOW(), ?, 'cho')";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('is', $id_khachhang, $dia_chi_giao);
    $stmt->execute();
    $id_donhang = $conn->insert_id;

    // Insert vào chitietdonhang và cập nhật tồn kho sản phẩm
    $item_sql = "INSERT INTO chitietdonhang (id_donhang, id_sanpham, so_luong, don_gia) VALUES (?, ?, ?, ?)";
    $item_stmt = $conn->prepare($item_sql);
    $update_stock_sql = "UPDATE sanpham SET so_luong = so_luong - ? WHERE id_sanpham = ? AND so_luong >= ?";
    $update_stock_stmt = $conn->prepare($update_stock_sql);
    foreach ($products as $item) {
        $id_sanpham = $item['id'];
        $so_luong = $item['quantity'];
        $don_gia = $item['price'];
        $item_stmt->bind_param('iiid', $id_donhang, $id_sanpham, $so_luong, $don_gia);
        $item_stmt->execute();
        // Cập nhật tồn kho sản phẩm
        $update_stock_stmt->bind_param('iii', $so_luong, $id_sanpham, $so_luong);
        $update_stock_stmt->execute();
        // Kiểm tra nếu không cập nhật được tồn kho (số lượng không đủ)
        if ($update_stock_stmt->affected_rows === 0) {
            throw new Exception("Sản phẩm ID $id_sanpham không đủ số lượng tồn kho");
        }
    }
    $conn->commit();
    $response['success'] = true;
    $response['message'] = 'Đặt hàng thành công';
    $response['data'] = ['id_donhang' => $id_donhang];
} catch (Exception $e) {
    $conn->rollback();
    $response['message'] = 'Lỗi tạo đơn hàng: ' . $e->getMessage();
    http_response_code(500);
}
echo json_encode($response, JSON_UNESCAPED_UNICODE);
