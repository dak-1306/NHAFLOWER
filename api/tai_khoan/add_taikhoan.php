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

// Sửa path include - đã sai từ đầu!
include_once(__DIR__ . "/../../config/connect.php");

// Thêm error handling cho JSON decode
$input = file_get_contents("php://input");
$data = json_decode($input, true);

// Kiểm tra JSON decode thành công
if (json_last_error() !== JSON_ERROR_NONE) {
    echo json_encode([
        "success" => false, 
        "error" => "Invalid JSON data: " . json_last_error_msg()
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// Validation
if (empty($data['email']) || empty($data['mat_khau'])) {
    echo json_encode([
        "success" => false, 
        "error" => "Email và mật khẩu không được để trống"
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

$email = $conn->real_escape_string($data['email']);
$mat_khau = password_hash($data['mat_khau'], PASSWORD_DEFAULT);
$vai_tro = $conn->real_escape_string($data['vai_tro'] ?? 'khach');
$trang_thai = intval($data['trang_thai'] ?? 1);

// Kiểm tra email đã tồn tại chưa
$checkEmail = $conn->query("SELECT id_taikhoan FROM taikhoan WHERE email = '$email'");
if ($checkEmail->num_rows > 0) {
    echo json_encode([
        "success" => false, 
        "error" => "Email đã được sử dụng"
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

$stmt = $conn->prepare("INSERT INTO taikhoan (email, mat_khau, vai_tro, trang_thai) VALUES (?, ?, ?, ?)");
$stmt->bind_param("sssi", $email, $mat_khau, $vai_tro, $trang_thai);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "id" => $conn->insert_id], JSON_UNESCAPED_UNICODE);
} else {
    echo json_encode(["success" => false, "error" => $conn->error], JSON_UNESCAPED_UNICODE);
}
?>
