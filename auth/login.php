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

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode([
        "success" => false,
        "message" => "Chỉ cho phép phương thức POST"
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// Include database connection
include_once(__DIR__ . "/../api/config/connection.php");

// Get input data
$input = file_get_contents("php://input");
$data = json_decode($input, true);

// Kiểm tra JSON decode thành công
if (json_last_error() !== JSON_ERROR_NONE) {
    echo json_encode([
        "success" => false,
        "message" => "Dữ liệu JSON không hợp lệ"
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// Validate required fields
if (!isset($data['email']) || !isset($data['mat_khau'])) {
    echo json_encode([
        "success" => false,
        "message" => "Email và mật khẩu là bắt buộc"
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

$email = trim($data['email']);
$mat_khau = trim($data['mat_khau']);

// Validate email format
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode([
        "success" => false,
        "message" => "Email không đúng định dạng"
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    // Query to get user info with customer details
    $sql = "SELECT t.id_taikhoan, t.email, t.mat_khau, t.vai_tro, t.trang_thai, 
                   k.id_khachhang, k.ten, k.sdt, k.dia_chi, k.ngay_sinh
            FROM taikhoan t 
            LEFT JOIN khachhang k ON t.id_taikhoan = k.id_taikhoan 
            WHERE t.email = ? AND t.trang_thai = 1";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        echo json_encode([
            "success" => false,
            "message" => "Email hoặc mật khẩu không đúng"
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }
    
    $user = $result->fetch_assoc();
    
    // Verify password
    if (!password_verify($mat_khau, $user['mat_khau'])) {
        echo json_encode([
            "success" => false,
            "message" => "Email hoặc mật khẩu không đúng"
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }
    
    // Generate auth token
    $token = bin2hex(random_bytes(32));
    
    // Return success response (không trả về mật khẩu)
    unset($user['mat_khau']);
    
    echo json_encode([
        "success" => true,
        "message" => "Đăng nhập thành công",
        "data" => [
            "id_taikhoan" => $user['id_taikhoan'],
            "id_khachhang" => $user['id_khachhang'],
            "email" => $user['email'],
            "ten" => $user['ten'],
            "sdt" => $user['sdt'],
            "dia_chi" => $user['dia_chi'],
            "ngay_sinh" => $user['ngay_sinh'],
            "vai_tro" => $user['vai_tro'],
            "token" => $token
        ]
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "message" => "Lỗi hệ thống: " . $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
} finally {
    // Close statement and connection
    if (isset($stmt)) $stmt->close();
    $conn->close();
}
?>
