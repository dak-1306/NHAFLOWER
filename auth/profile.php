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

// Include database connection
include_once(__DIR__ . "/../config/connect.php");

// Get method
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // Get profile info
    if (!isset($_GET['id_taikhoan'])) {
        echo json_encode([
            "success" => false,
            "message" => "ID tài khoản là bắt buộc"
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }
    
    $id_taikhoan = intval($_GET['id_taikhoan']);
    
    try {
        // Query to get user profile
        $sql = "SELECT t.id_taikhoan, t.email, t.vai_tro,
                       k.ten, k.sdt, k.dia_chi, k.ngay_sinh
                FROM taikhoan t 
                LEFT JOIN khachhang k ON t.id_taikhoan = k.id_taikhoan 
                WHERE t.id_taikhoan = ? AND t.trang_thai = 1";
        
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $id_taikhoan);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows === 0) {
            echo json_encode([
                "success" => false,
                "message" => "Không tìm thấy thông tin người dùng"
            ], JSON_UNESCAPED_UNICODE);
            exit;
        }
        
        $user = $result->fetch_assoc();
        
        echo json_encode([
            "success" => true,
            "data" => $user
        ], JSON_UNESCAPED_UNICODE);
        
    } catch (Exception $e) {
        echo json_encode([
            "success" => false,
            "message" => "Lỗi hệ thống: " . $e->getMessage()
        ], JSON_UNESCAPED_UNICODE);
    }
    
} elseif ($method === 'PUT') {
    // Update profile info
    $input = file_get_contents("php://input");
    $data = json_decode($input, true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        echo json_encode([
            "success" => false,
            "message" => "Dữ liệu JSON không hợp lệ"
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }
    
    // Validate required fields
    $required_fields = ['id_taikhoan', 'ten', 'sdt', 'dia_chi', 'ngay_sinh'];
    foreach ($required_fields as $field) {
        if (!isset($data[$field])) {
            echo json_encode([
                "success" => false,
                "message" => "Trường {$field} là bắt buộc"
            ], JSON_UNESCAPED_UNICODE);
            exit;
        }
    }
    
    $id_taikhoan = intval($data['id_taikhoan']);
    $ten = trim($data['ten']);
    $sdt = trim($data['sdt']);
    $dia_chi = trim($data['dia_chi']);
    $ngay_sinh = trim($data['ngay_sinh']);
    
    // Validate phone number format
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
    
    try {
        // Update khachhang table
        $sql = "UPDATE khachhang SET ten = ?, sdt = ?, dia_chi = ?, ngay_sinh = ? WHERE id_taikhoan = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("ssssi", $ten, $sdt, $dia_chi, $ngay_sinh, $id_taikhoan);
        
        if ($stmt->execute()) {
            echo json_encode([
                "success" => true,
                "message" => "Cập nhật thông tin thành công"
            ], JSON_UNESCAPED_UNICODE);
        } else {
            throw new Exception("Lỗi cập nhật thông tin: " . $stmt->error);
        }
        
    } catch (Exception $e) {
        echo json_encode([
            "success" => false,
            "message" => "Lỗi hệ thống: " . $e->getMessage()
        ], JSON_UNESCAPED_UNICODE);
    }
    
} else {
    echo json_encode([
        "success" => false,
        "message" => "Phương thức không được hỗ trợ"
    ], JSON_UNESCAPED_UNICODE);
}

// Close connection
if (isset($stmt)) $stmt->close();
$conn->close();
?>
