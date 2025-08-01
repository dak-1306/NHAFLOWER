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

// Chỉ chấp nhận POST method
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode([
        "success" => false, 
        "error" => "Method not allowed. Use POST."
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// Sửa path include để chắc chắn
include_once(__DIR__ . "/../../config/connect.php");

// Thêm error handling cho JSON decode
$input = file_get_contents("php://input");
$data = json_decode($input, true);

// Log để debug
error_log("CREATE CUSTOMER API CALLED");
error_log("Input length: " . strlen($input));
error_log("Input data: " . substr($input, 0, 200));
error_log("JSON decode success: " . (is_array($data) ? "YES" : "NO"));

// Kiểm tra JSON decode thành công
if (json_last_error() !== JSON_ERROR_NONE) {
    $error = "Invalid JSON data: " . json_last_error_msg();
    error_log("JSON Error: " . $error);
    echo json_encode([
        "success" => false, 
        "error" => $error
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// Validation
if (empty($data['ten_khachhang']) || empty($data['so_dien_thoai']) || 
    empty($data['dia_chi']) || empty($data['id_taikhoan'])) {
    echo json_encode([
        "success" => false, 
        "error" => "Vui lòng điền đầy đủ thông tin"
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// Thêm validation cho dữ liệu
if (!is_numeric($data['id_taikhoan'])) {
    echo json_encode([
        "success" => false, 
        "error" => "ID tài khoản không hợp lệ"
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

$ten = $conn->real_escape_string($data['ten_khachhang']);
$sdt = $conn->real_escape_string($data['so_dien_thoai']);
$diachi = $conn->real_escape_string($data['dia_chi']);
$idtk = intval($data['id_taikhoan']);
$ngay_sinh = isset($data['ngay_sinh']) && !empty($data['ngay_sinh']) ? 
    "'" . $conn->real_escape_string($data['ngay_sinh']) . "'" : "NULL";

// Kiểm tra tài khoản tồn tại
$checkAccount = $conn->query("SELECT id_taikhoan FROM taikhoan WHERE id_taikhoan = $idtk");
if ($checkAccount->num_rows === 0) {
    echo json_encode([
        "success" => false, 
        "error" => "Tài khoản không tồn tại"
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// Kiểm tra tài khoản đã được sử dụng chưa
$checkUsed = $conn->query("SELECT id_khachhang FROM KhachHang WHERE id_taikhoan = $idtk");
if ($checkUsed->num_rows > 0) {
    echo json_encode([
        "success" => false, 
        "error" => "Tài khoản này đã được liên kết với khách hàng khác"
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

$sql = "INSERT INTO KhachHang (ten, sdt, dia_chi, ngay_sinh, id_taikhoan)
        VALUES ('$ten', '$sdt', '$diachi', $ngay_sinh, $idtk)";

if ($conn->query($sql)) {
    echo json_encode([
        "success" => true,
        "id" => $conn->insert_id,
        "message" => "Thêm khách hàng thành công"
    ], JSON_UNESCAPED_UNICODE);
} else {
    echo json_encode([
        "success" => false, 
        "error" => $conn->error
    ], JSON_UNESCAPED_UNICODE);
}
?>
