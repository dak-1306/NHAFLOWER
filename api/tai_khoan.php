<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

include_once(__DIR__ . '/../config/connect.php');

$method = $_SERVER['REQUEST_METHOD'];
$action = isset($_GET['action']) ? $_GET['action'] : strtolower($method);

function sendResponse($success, $message, $data = null) {
    $res = ['success' => $success, 'message' => $message];
    if ($data !== null) $res['data'] = $data;
    echo json_encode($res, JSON_UNESCAPED_UNICODE);
    exit;
}

if ($action === 'get' || $action === 'get_all') {
    $result = $conn->query("SELECT * FROM taikhoan");
    $data = [];
    while ($row = $result->fetch_assoc()) {
        $data[] = $row;
    }
    sendResponse(true, 'Lấy danh sách tài khoản thành công', $data);
}

if ($action === 'add' || $action === 'post') {
    $input = file_get_contents("php://input");
    $data = json_decode($input, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        sendResponse(false, 'Invalid JSON data: ' . json_last_error_msg());
    }
    if (empty($data['email']) || empty($data['mat_khau'])) {
        sendResponse(false, 'Email và mật khẩu không được để trống');
    }
    $email = $conn->real_escape_string($data['email']);
    $mat_khau = password_hash($data['mat_khau'], PASSWORD_DEFAULT);
    $vai_tro = $conn->real_escape_string($data['vai_tro'] ?? 'khach');
    $trang_thai = intval($data['trang_thai'] ?? 1);
    $checkEmail = $conn->query("SELECT id_taikhoan FROM taikhoan WHERE email = '$email'");
    if ($checkEmail->num_rows > 0) {
        sendResponse(false, 'Email đã được sử dụng');
    }
    $sql = "INSERT INTO taikhoan (email, mat_khau, vai_tro, trang_thai) VALUES ('$email', '$mat_khau', '$vai_tro', $trang_thai)";
    if ($conn->query($sql)) {
        sendResponse(true, 'Thêm tài khoản thành công');
    } else {
        sendResponse(false, $conn->error);
    }
}

if ($action === 'update' || $action === 'put') {
    $input = file_get_contents("php://input");
    $data = json_decode($input, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        sendResponse(false, 'Invalid JSON data: ' . json_last_error_msg());
    }
    $id = $data['id_taikhoan'] ?? 0;
    $email = $data['email'] ?? '';
    $vai_tro = $data['vai_tro'] ?? '';
    $trang_thai = $data['trang_thai'] ?? 1;
    $sql = "UPDATE taikhoan SET email=?, vai_tro=?, trang_thai=? WHERE id_taikhoan=?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ssii", $email, $vai_tro, $trang_thai, $id);
    if ($stmt->execute()) {
        sendResponse(true, 'Cập nhật tài khoản thành công');
    } else {
        sendResponse(false, $stmt->error);
    }
}

if ($action === 'delete') {
    $input = file_get_contents("php://input");
    $data = json_decode($input, true);
    $id = $data['id_taikhoan'] ?? ($_GET['id'] ?? 0);
    if (!$id) sendResponse(false, 'Thiếu id_taikhoan');
    $sql = "DELETE FROM taikhoan WHERE id_taikhoan = $id";
    if ($conn->query($sql)) {
        sendResponse(true, 'Xóa tài khoản thành công');
    } else {
        sendResponse(false, $conn->error);
    }
}

sendResponse(false, 'Hành động không hợp lệ');
?>
