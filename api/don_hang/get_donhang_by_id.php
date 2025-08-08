<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

include_once("../../config/connect.php");

try {
    if (!isset($_GET['id']) || empty($_GET['id'])) {
        throw new Exception('ID đơn hàng là bắt buộc');
    }

    $id = intval($_GET['id']);

    $sql = "SELECT dh.*, kh.ten as ten_khachhang 
            FROM donhang dh 
            LEFT JOIN khachhang kh ON dh.id_khachhang = kh.id_khachhang 
            WHERE dh.id_donhang = ?";
    
    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        throw new Exception("Prepare failed: " . $conn->error);
    }
    
    $stmt->bind_param("i", $id);
    if (!$stmt->execute()) {
        throw new Exception("Execute failed: " . $stmt->error);
    }
    
    $result = $stmt->get_result();

    if ($row = $result->fetch_assoc()) {
        echo json_encode([
            'success' => true,
            'data' => $row
        ], JSON_UNESCAPED_UNICODE);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Không tìm thấy đơn hàng'
        ], JSON_UNESCAPED_UNICODE);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Lỗi hệ thống: ' . $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
} finally {
    // Close resources
    if (isset($stmt)) $stmt->close();
    if (isset($conn)) $conn->close();
}
?>
