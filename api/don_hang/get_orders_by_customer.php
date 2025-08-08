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
    // Get user ID from query parameter
    $id_khachhang = isset($_GET['id_khachhang']) ? intval($_GET['id_khachhang']) : null;

    if ($id_khachhang) {
        // Get orders for specific customer
        $sql = "SELECT dh.*, kh.ten as ten_khachhang 
                FROM donhang dh 
                LEFT JOIN khachhang kh ON dh.id_khachhang = kh.id_khachhang 
                WHERE dh.id_khachhang = ? 
                ORDER BY dh.ngay_dat DESC";
        
        $stmt = $conn->prepare($sql);
        if (!$stmt) {
            throw new Exception("Prepare failed: " . $conn->error);
        }
        
        $stmt->bind_param("i", $id_khachhang);
        if (!$stmt->execute()) {
            throw new Exception("Execute failed: " . $stmt->error);
        }
        
        $result = $stmt->get_result();
    } else {
        // Get all orders if no customer ID specified
        $sql = "SELECT dh.*, kh.ten as ten_khachhang 
                FROM donhang dh 
                LEFT JOIN khachhang kh ON dh.id_khachhang = kh.id_khachhang
                ORDER BY dh.ngay_dat DESC";
        $result = mysqli_query($conn, $sql);
        
        if (!$result) {
            throw new Exception("Query failed: " . mysqli_error($conn));
        }
    }

    $data = [];
    if ($result) {
        while ($row = mysqli_fetch_assoc($result)) {
            $data[] = $row;
        }
    }

    echo json_encode($data, JSON_UNESCAPED_UNICODE);

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
