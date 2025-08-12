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
    $sql = "SELECT * FROM khachhang";
    $result = $conn->query($sql);
    
    if (!$result) {
        sendResponse(false, 'Lỗi database: ' . $conn->error);
    }
    
    $customers = array();
    while ($row = $result->fetch_assoc()) {
        $customers[] = $row;
    }
    sendResponse(true, 'Lấy danh sách khách hàng thành công', $customers);
}

if ($action === 'get_by_id') {
    $id = $_GET['id'] ?? 0;
    $sql = "SELECT * FROM khachhang WHERE id_khachhang = $id";
    $result = $conn->query($sql);
    $row = $result->fetch_assoc();
    if ($row) sendResponse(true, 'Lấy khách hàng thành công', $row);
    else sendResponse(false, 'Không tìm thấy khách hàng');
}

if ($action === 'add' || $action === 'post') {
    $data = json_decode(file_get_contents("php://input"), true);
    if (!$data) sendResponse(false, 'Dữ liệu không hợp lệ');
    if (empty($data['ten_khachhang']) || empty($data['so_dien_thoai']) || empty($data['dia_chi']) || empty($data['id_taikhoan'])) {
        sendResponse(false, 'Vui lòng điền đầy đủ thông tin');
    }
    $ten = $conn->real_escape_string($data['ten_khachhang']);
    $sdt = $conn->real_escape_string($data['so_dien_thoai']);
    $diachi = $conn->real_escape_string($data['dia_chi']);
    $id_taikhoan = intval($data['id_taikhoan']);
    $ngay_sinh = isset($data['ngay_sinh']) && !empty($data['ngay_sinh']) ? "'" . $conn->real_escape_string($data['ngay_sinh']) . "'" : "NULL";
    $sql = "INSERT INTO khachhang (ten, sdt, dia_chi, id_taikhoan, ngay_sinh) VALUES ('$ten', '$sdt', '$diachi', $id_taikhoan, $ngay_sinh)";
    if ($conn->query($sql)) {
        sendResponse(true, 'Tạo khách hàng thành công');
    } else {
        sendResponse(false, $conn->error);
    }
}

if ($action === 'update' || $action === 'put') {
    $id = $_GET['id'] ?? 0;
    $data = json_decode(file_get_contents("php://input"), true);
    $ten = $conn->real_escape_string($data['ten_khachhang']);
    $sdt = $conn->real_escape_string($data['so_dien_thoai']);
    $diachi = $conn->real_escape_string($data['dia_chi']);
    $ngay_sinh = isset($data['ngay_sinh']) && !empty($data['ngay_sinh']) ? "'" . $conn->real_escape_string($data['ngay_sinh']) . "'" : "NULL";
    $sql = "UPDATE khachhang SET ten = '$ten', sdt = '$sdt', dia_chi = '$diachi', ngay_sinh = $ngay_sinh WHERE id_khachhang = $id";
    if ($conn->query($sql)) {
        sendResponse(true, 'Cập nhật thành công');
    } else {
        sendResponse(false, $conn->error);
    }
}

if ($action === 'delete') {
    $id = $_GET['id'] ?? 0;
    $sql = "DELETE FROM khachhang WHERE id_khachhang = $id";
    if ($conn->query($sql)) {
        sendResponse(true, 'Xóa khách hàng thành công');
    } else {
        sendResponse(false, $conn->error);
    }
}

sendResponse(false, 'Hành động không hợp lệ');
?>
