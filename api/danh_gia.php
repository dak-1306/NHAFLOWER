<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

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
    // Lấy tất cả đánh giá
    $sql = "SELECT dg.*, kh.ten_khachhang, sp.ten_hoa 
            FROM danhgia dg 
            JOIN khachhang kh ON dg.id_khachhang = kh.id_khachhang
            JOIN sanpham sp ON dg.id_sanpham = sp.id_sanpham";
    $result = $conn->query($sql);
    $data = [];
    while ($row = $result->fetch_assoc()) {
        $data[] = $row;
    }
    sendResponse(true, 'Lấy danh sách đánh giá thành công', $data);
}

if ($action === 'add' || $action === 'post') {
    $data = json_decode(file_get_contents("php://input"));
    if (!$data) sendResponse(false, 'Dữ liệu không hợp lệ');
    $id_khachhang = $data->id_khachhang ?? null;
    $id_sanpham = $data->id_sanpham ?? null;
    $sao = $data->sao ?? null;
    $noi_dung = $data->noi_dung ?? '';
    if (!$id_khachhang || !$id_sanpham || !$sao) sendResponse(false, 'Thiếu thông tin');
    $stmt = $conn->prepare("INSERT INTO danhgia (id_khachhang, id_sanpham, sao, noi_dung, ngay_danhgia) VALUES (?, ?, ?, ?, NOW())");
    $stmt->bind_param("iiis", $id_khachhang, $id_sanpham, $sao, $noi_dung);
    $stmt->execute();
    sendResponse(true, 'Thêm đánh giá thành công');
}

if ($action === 'delete') {
    $id = $_GET['id'] ?? null;
    if (!$id) sendResponse(false, 'Thiếu id đánh giá');
    $conn->query("DELETE FROM danhgia WHERE id_danhgia = $id");
    sendResponse(true, 'Xóa đánh giá thành công');
}

sendResponse(false, 'Hành động không hợp lệ');
?>
