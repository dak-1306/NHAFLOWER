<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

include_once __DIR__ . '/config/connection.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = isset($_GET['action']) ? $_GET['action'] : strtolower($method);

function sendResponse($success, $message, $data = null) {
    $res = ['success' => $success, 'message' => $message];
    if ($data !== null) $res['data'] = $data;
    echo json_encode($res, JSON_UNESCAPED_UNICODE);
    exit;
}

if ($action === 'get' || $action === 'get_all') {
    // Lấy tất cả đơn hàng
    $sql = "SELECT dh.*, kh.ten as ten_khachhang FROM donhang dh LEFT JOIN khachhang kh ON dh.id_khachhang = kh.id_khachhang";
    $result = mysqli_query($conn, $sql);
    
    if (!$result) {
        sendResponse(false, 'Lỗi database: ' . mysqli_error($conn));
    }
    
    $data = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $data[] = $row;
    }
    sendResponse(true, 'Lấy danh sách đơn hàng thành công', $data);
}

if ($action === 'get_by_id') {
    $id = isset($_GET['id']) ? intval($_GET['id']) : null;
    if (!$id) sendResponse(false, 'Thiếu id đơn hàng');
    $sql = "SELECT dh.*, kh.ten as ten_khachhang FROM donhang dh LEFT JOIN khachhang kh ON dh.id_khachhang = kh.id_khachhang WHERE dh.id_donhang = $id";
    $result = mysqli_query($conn, $sql);
    $row = mysqli_fetch_assoc($result);
    if ($row) sendResponse(true, 'Lấy đơn hàng thành công', $row);
    else sendResponse(false, 'Không tìm thấy đơn hàng');
}

if ($action === 'get_by_customer') {
    $id_khachhang = isset($_GET['id_khachhang']) ? intval($_GET['id_khachhang']) : null;
    if (!$id_khachhang) sendResponse(false, 'Thiếu id_khachhang');
    $sql = "SELECT dh.*, kh.ten as ten_khachhang FROM donhang dh LEFT JOIN khachhang kh ON dh.id_khachhang = kh.id_khachhang WHERE dh.id_khachhang = $id_khachhang ORDER BY dh.ngay_dat DESC";
    $result = mysqli_query($conn, $sql);
    $data = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $data[] = $row;
    }
    sendResponse(true, 'Lấy đơn hàng theo khách hàng thành công', $data);
}

if ($action === 'add' || $action === 'post') {
    $data = json_decode(file_get_contents("php://input"), true);
    if (!$data) sendResponse(false, 'Dữ liệu không hợp lệ');
    $id_kh = $data['id_khachhang'] ?? null;
    $ngay = $data['ngay_dat'] ?? null;
    $diachi = $data['dia_chi_giao'] ?? '';
    $trangthai = $data['trang_thai'] ?? '';
    if (!$id_kh || !$ngay || !$diachi || !$trangthai) sendResponse(false, 'Thiếu thông tin');
    $sql = "INSERT INTO donhang (id_khachhang, ngay_dat, dia_chi_giao, trang_thai) VALUES ($id_kh, '$ngay', '$diachi', '$trangthai')";
    if (mysqli_query($conn, $sql)) {
        sendResponse(true, 'Đơn hàng đã được tạo');
    } else {
        sendResponse(false, mysqli_error($conn));
    }
}

if ($action === 'update' || $action === 'put') {
    $data = json_decode(file_get_contents("php://input"), true);
    if (!$data) sendResponse(false, 'Dữ liệu không hợp lệ');
    $id = $data['id_donhang'] ?? null;
    $diachi = $data['dia_chi_giao'] ?? '';
    $trangthai = $data['trang_thai'] ?? '';
    if (!$id) sendResponse(false, 'Thiếu id đơn hàng');
    $sql = "UPDATE donhang SET dia_chi_giao = '$diachi', trang_thai = '$trangthai' WHERE id_donhang = $id";
    if (mysqli_query($conn, $sql)) {
        sendResponse(true, 'Cập nhật thành công');
    } else {
        sendResponse(false, mysqli_error($conn));
    }
}

if ($action === 'delete') {
    $id = isset($_GET['id']) ? intval($_GET['id']) : null;
    if (!$id) sendResponse(false, 'Thiếu id đơn hàng');
    $sql = "DELETE FROM donhang WHERE id_donhang = $id";
    if (mysqli_query($conn, $sql)) {
        sendResponse(true, 'Xóa đơn hàng thành công');
    } else {
        sendResponse(false, mysqli_error($conn));
    }
}

sendResponse(false, 'Hành động không hợp lệ');
?>
