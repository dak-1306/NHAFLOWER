<?php
/**
 * NHAFLOWER - Orders Management API
 * API quản lý đơn hàng cho admin
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once 'config/connection.php';

// Use the existing connection from connection.php
// $conn is already available from connection.php

$method = $_SERVER['REQUEST_METHOD'];
$response = ['success' => false, 'message' => '', 'data' => null];

try {
    switch ($method) {
        case 'GET':
            handleGetOrders($conn, $response);
            break;
        case 'POST':
            handlePostRequest($conn, $response);
            break;
        case 'PUT':
            handlePutRequest($conn, $response);
            break;
        case 'DELETE':
            handleDeleteRequest($conn, $response);
            break;
        default:
            $response['message'] = 'Phương thức không được hỗ trợ';
            http_response_code(405);
            break;
    }
} catch (Exception $e) {
    $response['success'] = false;
    $response['message'] = 'Lỗi server: ' . $e->getMessage();
    http_response_code(500);
}

echo json_encode($response, JSON_UNESCAPED_UNICODE);

/**
 * Handle GET requests - Get orders with filters
 */
function handleGetOrders($conn, &$response) {
    $filters = [];
    $params = [];
    $types = '';
    
    // Build base query
    $sql = "SELECT 
                dh.ma_don_hang,
                dh.ma_khach_hang,
                dh.ngay_dat_hang,
                dh.tong_tien,
                dh.trang_thai_don_hang,
                dh.trang_thai_thanh_toan,
                dh.phuong_thuc_thanh_toan,
                dh.dia_chi_giao_hang,
                dh.ghi_chu,
                kh.ten_khach_hang,
                kh.email,
                kh.so_dien_thoai
            FROM don_hang dh
            LEFT JOIN khach_hang kh ON dh.ma_khach_hang = kh.ma_khach_hang";
    
    // Apply filters
    if (!empty($_GET['status'])) {
        $filters[] = "dh.trang_thai_don_hang = ?";
        $params[] = $_GET['status'];
        $types .= 's';
    }
    
    if (!empty($_GET['date_from'])) {
        $filters[] = "DATE(dh.ngay_dat_hang) >= ?";
        $params[] = $_GET['date_from'];
        $types .= 's';
    }
    
    if (!empty($_GET['date_to'])) {
        $filters[] = "DATE(dh.ngay_dat_hang) <= ?";
        $params[] = $_GET['date_to'];
        $types .= 's';
    }
    
    if (!empty($_GET['customer_id'])) {
        $filters[] = "dh.ma_khach_hang = ?";
        $params[] = $_GET['customer_id'];
        $types .= 'i';
    }
    
    if (!empty($_GET['search'])) {
        $filters[] = "(kh.ten_khach_hang LIKE ? OR dh.ma_don_hang LIKE ? OR kh.email LIKE ?)";
        $searchTerm = '%' . $_GET['search'] . '%';
        $params[] = $searchTerm;
        $params[] = $searchTerm;
        $params[] = $searchTerm;
        $types .= 'sss';
    }
    
    // Add WHERE clause if filters exist
    if (!empty($filters)) {
        $sql .= " WHERE " . implode(" AND ", $filters);
    }
    
    // Add ORDER BY
    $sql .= " ORDER BY dh.ngay_dat_hang DESC";
    
    // Add LIMIT if specified
    if (!empty($_GET['limit'])) {
        $sql .= " LIMIT ?";
        $params[] = (int)$_GET['limit'];
        $types .= 'i';
    }
    
    $stmt = $conn->prepare($sql);
    
    if (!empty($params)) {
        $stmt->bind_param($types, ...$params);
    }
    
    $stmt->execute();
    $result = $stmt->get_result();
    $orders = [];
    
    while ($row = $result->fetch_assoc()) {
        $orders[] = $row;
    }
    
    $response['success'] = true;
    $response['data'] = $orders;
    $response['message'] = 'Lấy danh sách đơn hàng thành công';
}

/**
 * Handle POST requests
 */
function handlePostRequest($conn, &$response) {
    $action = $_POST['action'] ?? '';
    
    switch ($action) {
        case 'update_status':
            updateOrderStatus($conn, $response);
            break;
        case 'create_order':
            createOrder($conn, $response);
            break;
        default:
            $response['message'] = 'Hành động không hợp lệ';
            http_response_code(400);
            break;
    }
}

/**
 * Handle PUT requests
 */
function handlePutRequest($conn, &$response) {
    parse_str(file_get_contents("php://input"), $putData);
    updateOrder($conn, $response, $putData);
}

/**
 * Handle DELETE requests
 */
function handleDeleteRequest($conn, &$response) {
    parse_str(file_get_contents("php://input"), $deleteData);
    
    if (empty($deleteData['ma_don_hang'])) {
        $response['message'] = 'Thiếu mã đơn hàng';
        http_response_code(400);
        return;
    }
    
    deleteOrder($conn, $response, $deleteData['ma_don_hang']);
}

/**
 * Update order status
 */
function updateOrderStatus($conn, &$response) {
    $ma_don_hang = $_POST['ma_don_hang'] ?? '';
    $trang_thai = $_POST['trang_thai_don_hang'] ?? '';
    $ghi_chu = $_POST['ghi_chu'] ?? '';
    
    if (empty($ma_don_hang) || empty($trang_thai)) {
        $response['message'] = 'Thiếu thông tin cần thiết';
        http_response_code(400);
        return;
    }
    
    // Validate status
    $valid_statuses = ['pending', 'confirmed', 'shipping', 'completed', 'cancelled'];
    if (!in_array($trang_thai, $valid_statuses)) {
        $response['message'] = 'Trạng thái không hợp lệ';
        http_response_code(400);
        return;
    }
    
    $conn->begin_transaction();
    
    try {
        // Update order status
        $sql = "UPDATE don_hang SET 
                    trang_thai_don_hang = ?, 
                    ngay_cap_nhat = CURRENT_TIMESTAMP
                WHERE ma_don_hang = ?";
        
        $stmt = $conn->prepare($sql);
        $stmt->bind_param('si', $trang_thai, $ma_don_hang);
        $stmt->execute();
        
        if ($stmt->affected_rows === 0) {
            throw new Exception('Không tìm thấy đơn hàng hoặc không có thay đổi');
        }
        
        // Add status change log if note provided
        if (!empty($ghi_chu)) {
            $log_sql = "INSERT INTO don_hang_log (ma_don_hang, trang_thai_cu, trang_thai_moi, ghi_chu, ngay_thay_doi) 
                       SELECT ?, (SELECT trang_thai_don_hang FROM don_hang WHERE ma_don_hang = ? LIMIT 1), ?, ?, CURRENT_TIMESTAMP";
            
            // Note: This assumes a log table exists, if not, we'll skip logging
            try {
                $log_stmt = $conn->prepare($log_sql);
                $log_stmt->bind_param('iiss', $ma_don_hang, $ma_don_hang, $trang_thai, $ghi_chu);
                $log_stmt->execute();
            } catch (Exception $e) {
                // Log table doesn't exist, continue without logging
            }
        }
        
        $conn->commit();
        
        $response['success'] = true;
        $response['message'] = 'Cập nhật trạng thái đơn hàng thành công';
        
    } catch (Exception $e) {
        $conn->rollback();
        $response['message'] = 'Lỗi cập nhật trạng thái: ' . $e->getMessage();
        http_response_code(500);
    }
}

/**
 * Create new order
 */
function createOrder($conn, &$response) {
    $required_fields = ['ma_khach_hang', 'tong_tien', 'products'];
    
    foreach ($required_fields as $field) {
        if (empty($_POST[$field])) {
            $response['message'] = 'Thiếu thông tin: ' . $field;
            http_response_code(400);
            return;
        }
    }
    
    $conn->begin_transaction();
    
    try {
        // Insert order
        $sql = "INSERT INTO don_hang (
                    ma_khach_hang, 
                    tong_tien, 
                    trang_thai_don_hang, 
                    trang_thai_thanh_toan,
                    phuong_thuc_thanh_toan,
                    dia_chi_giao_hang,
                    ghi_chu,
                    ngay_dat_hang
                ) VALUES (?, ?, 'pending', 'pending', ?, ?, ?, CURRENT_TIMESTAMP)";
        
        $stmt = $conn->prepare($sql);
        $stmt->bind_param('idsss',
            $_POST['ma_khach_hang'],
            $_POST['tong_tien'],
            $_POST['phuong_thuc_thanh_toan'] ?? 'cash',
            $_POST['dia_chi_giao_hang'] ?? '',
            $_POST['ghi_chu'] ?? ''
        );
        
        $stmt->execute();
        $order_id = $conn->insert_id;
        
        // Insert order items
        $products = json_decode($_POST['products'], true);
        if (!$products) {
            throw new Exception('Dữ liệu sản phẩm không hợp lệ');
        }
        
        $item_sql = "INSERT INTO chi_tiet_don_hang (ma_don_hang, ma_san_pham, so_luong, gia) VALUES (?, ?, ?, ?)";
        $item_stmt = $conn->prepare($item_sql);
        
        foreach ($products as $product) {
            $item_stmt->bind_param('iiid',
                $order_id,
                $product['ma_san_pham'],
                $product['so_luong'],
                $product['gia']
            );
            $item_stmt->execute();
        }
        
        $conn->commit();
        
        $response['success'] = true;
        $response['message'] = 'Tạo đơn hàng thành công';
        $response['data'] = ['ma_don_hang' => $order_id];
        
    } catch (Exception $e) {
        $conn->rollback();
        $response['message'] = 'Lỗi tạo đơn hàng: ' . $e->getMessage();
        http_response_code(500);
    }
}

/**
 * Update order
 */
function updateOrder($conn, &$response, $data) {
    if (empty($data['ma_don_hang'])) {
        $response['message'] = 'Thiếu mã đơn hàng';
        http_response_code(400);
        return;
    }
    
    $fields = [];
    $params = [];
    $types = '';
    
    // Build update fields
    $updatable_fields = [
        'trang_thai_don_hang' => 's',
        'trang_thai_thanh_toan' => 's',
        'phuong_thuc_thanh_toan' => 's',
        'dia_chi_giao_hang' => 's',
        'ghi_chu' => 's'
    ];
    
    foreach ($updatable_fields as $field => $type) {
        if (isset($data[$field])) {
            $fields[] = "$field = ?";
            $params[] = $data[$field];
            $types .= $type;
        }
    }
    
    if (empty($fields)) {
        $response['message'] = 'Không có dữ liệu để cập nhật';
        http_response_code(400);
        return;
    }
    
    $fields[] = "ngay_cap_nhat = CURRENT_TIMESTAMP";
    
    $sql = "UPDATE don_hang SET " . implode(', ', $fields) . " WHERE ma_don_hang = ?";
    $params[] = $data['ma_don_hang'];
    $types .= 'i';
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param($types, ...$params);
    $stmt->execute();
    
    if ($stmt->affected_rows > 0) {
        $response['success'] = true;
        $response['message'] = 'Cập nhật đơn hàng thành công';
    } else {
        $response['message'] = 'Không tìm thấy đơn hàng hoặc không có thay đổi';
        http_response_code(404);
    }
}

/**
 * Delete order
 */
function deleteOrder($conn, &$response, $order_id) {
    $conn->begin_transaction();
    
    try {
        // Check if order can be deleted (e.g., not completed or shipped)
        $check_sql = "SELECT trang_thai_don_hang FROM don_hang WHERE ma_don_hang = ?";
        $check_stmt = $conn->prepare($check_sql);
        $check_stmt->bind_param('i', $order_id);
        $check_stmt->execute();
        $result = $check_stmt->get_result();
        
        if ($result->num_rows === 0) {
            throw new Exception('Không tìm thấy đơn hàng');
        }
        
        $order = $result->fetch_assoc();
        
        // Don't allow deletion of completed orders
        if (in_array($order['trang_thai_don_hang'], ['completed', 'shipping'])) {
            throw new Exception('Không thể xóa đơn hàng đã hoàn thành hoặc đang giao');
        }
        
        // Delete order details first
        $delete_details_sql = "DELETE FROM chi_tiet_don_hang WHERE ma_don_hang = ?";
        $delete_details_stmt = $conn->prepare($delete_details_sql);
        $delete_details_stmt->bind_param('i', $order_id);
        $delete_details_stmt->execute();
        
        // Delete order
        $delete_order_sql = "DELETE FROM don_hang WHERE ma_don_hang = ?";
        $delete_order_stmt = $conn->prepare($delete_order_sql);
        $delete_order_stmt->bind_param('i', $order_id);
        $delete_order_stmt->execute();
        
        if ($delete_order_stmt->affected_rows === 0) {
            throw new Exception('Không thể xóa đơn hàng');
        }
        
        $conn->commit();
        
        $response['success'] = true;
        $response['message'] = 'Xóa đơn hàng thành công';
        
    } catch (Exception $e) {
        $conn->rollback();
        $response['message'] = 'Lỗi xóa đơn hàng: ' . $e->getMessage();
        http_response_code(500);
    }
}

/**
 * Validate order data
 */
function validateOrderData($data) {
    $errors = [];
    
    if (empty($data['ma_khach_hang'])) {
        $errors[] = 'Thiếu mã khách hàng';
    }
    
    if (empty($data['tong_tien']) || !is_numeric($data['tong_tien']) || $data['tong_tien'] <= 0) {
        $errors[] = 'Tổng tiền không hợp lệ';
    }
    
    if (!empty($data['trang_thai_don_hang'])) {
        $valid_statuses = ['pending', 'confirmed', 'shipping', 'completed', 'cancelled'];
        if (!in_array($data['trang_thai_don_hang'], $valid_statuses)) {
            $errors[] = 'Trạng thái đơn hàng không hợp lệ';
        }
    }
    
    if (!empty($data['trang_thai_thanh_toan'])) {
        $valid_payment_statuses = ['pending', 'paid', 'failed', 'refunded'];
        if (!in_array($data['trang_thai_thanh_toan'], $valid_payment_statuses)) {
            $errors[] = 'Trạng thái thanh toán không hợp lệ';
        }
    }
    
    return $errors;
}
?>
