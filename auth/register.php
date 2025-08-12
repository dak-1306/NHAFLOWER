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
$required_fields = ['email', 'mat_khau', 'ten', 'sdt', 'dia_chi', 'ngay_sinh'];
foreach ($required_fields as $field) {
    if (!isset($data[$field]) || empty(trim($data[$field]))) {
        echo json_encode([
            "success" => false,
            "message" => "Trường {$field} là bắt buộc"
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }
}

// Get and sanitize input
$email = trim($data['email']);
$mat_khau = trim($data['mat_khau']);
$ten = trim($data['ten']);
$sdt = trim($data['sdt']);
$dia_chi = trim($data['dia_chi']);
$ngay_sinh = trim($data['ngay_sinh']);

// Validate email format
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode([
        "success" => false,
        "message" => "Email không đúng định dạng"
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// Validate password length
if (strlen($mat_khau) < 6) {
    echo json_encode([
        "success" => false,
        "message" => "Mật khẩu phải có ít nhất 6 ký tự"
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// Validate phone number format (Vietnamese phone)
if (!preg_match('/^(0[3|5|7|8|9])+([0-9]{8})$/', $sdt)) {
    echo json_encode([
        "success" => false,
        "message" => "Số điện thoại không đúng định dạng"
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// Validate birth date
$birth_date = DateTime::createFromFormat('Y-m-d', $ngay_sinh);
if (!$birth_date) {
    echo json_encode([
        "success" => false,
        "message" => "Ngày sinh không đúng định dạng"
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// Check age (must be at least 13 years old)
$today = new DateTime();
$age = $today->diff($birth_date)->y;
if ($age < 13) {
    echo json_encode([
        "success" => false,
        "message" => "Bạn phải từ 13 tuổi trở lên để đăng ký"
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    // Start transaction
    $conn->autocommit(FALSE);
    
    // Check if email already exists
    $checkEmailSql = "SELECT id_taikhoan FROM taikhoan WHERE email = ?";
    $checkStmt = $conn->prepare($checkEmailSql);
    $checkStmt->bind_param("s", $email);
    $checkStmt->execute();
    $result = $checkStmt->get_result();
    
    if ($result->num_rows > 0) {
        echo json_encode([
            "success" => false,
            "message" => "Email đã được sử dụng"
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }
    
    // Hash password
    $mat_khau_hash = password_hash($mat_khau, PASSWORD_DEFAULT);
    
    // Insert into taikhoan table
    $sqlTaiKhoan = "INSERT INTO taikhoan (email, mat_khau, vai_tro, trang_thai) VALUES (?, ?, 'khach', 1)";
    $stmtTaiKhoan = $conn->prepare($sqlTaiKhoan);
    $stmtTaiKhoan->bind_param("ss", $email, $mat_khau_hash);
    
    if (!$stmtTaiKhoan->execute()) {
        throw new Exception("Lỗi tạo tài khoản: " . $stmtTaiKhoan->error);
    }
    
    $id_taikhoan = $conn->insert_id;
    
    // Insert into khachhang table
    $sqlKhachHang = "INSERT INTO khachhang (id_taikhoan, ten, sdt, dia_chi, ngay_sinh) VALUES (?, ?, ?, ?, ?)";
    $stmtKhachHang = $conn->prepare($sqlKhachHang);
    $stmtKhachHang->bind_param("issss", $id_taikhoan, $ten, $sdt, $dia_chi, $ngay_sinh);
    
    if (!$stmtKhachHang->execute()) {
        throw new Exception("Lỗi tạo thông tin khách hàng: " . $stmtKhachHang->error);
    }
    
    // Commit transaction
    $conn->commit();
    
    // Generate auth token
    $token = bin2hex(random_bytes(32));
    
    // Return success response
    echo json_encode([
        "success" => true,
        "message" => "Đăng ký thành công",
        "data" => [
            "id_taikhoan" => $id_taikhoan,
            "email" => $email,
            "ten" => $ten,
            "vai_tro" => "khach",
            "token" => $token
        ]
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    // Rollback transaction on error
    $conn->rollback();
    
    echo json_encode([
        "success" => false,
        "message" => "Lỗi hệ thống: " . $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
} finally {
    // Close statements and connection
    if (isset($stmtTaiKhoan)) $stmtTaiKhoan->close();
    if (isset($stmtKhachHang)) $stmtKhachHang->close();
    if (isset($checkStmt)) $checkStmt->close();
    $conn->close();
}
?>
