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
    $sql = "SELECT * FROM loaihoa ORDER BY id_loaihoa DESC";
    $result = mysqli_query($conn, $sql);
    $data = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $data[] = $row;
    }
    sendResponse(true, 'Lấy danh sách loại hoa thành công', $data);
}

if ($action === 'get_by_id') {
    $id = $_GET['id_loaihoa'] ?? 0;
    $sql = "SELECT * FROM loaihoa WHERE id_loaihoa = $id";
    $result = mysqli_query($conn, $sql);
    $row = mysqli_fetch_assoc($result);
    if ($row) sendResponse(true, 'Lấy loại hoa thành công', $row);
    else sendResponse(false, 'Không tìm thấy loại hoa');
}

if ($action === 'add' || $action === 'post') {    $data = $_POST;
    $ten_loai = $data['ten_loai'] ?? '';
    // Note: mo_ta column doesn't exist in database schema, so we ignore it
    if (empty(trim($ten_loai))) sendResponse(false, 'Tên danh mục không được để trống');
    if (strlen($ten_loai) > 100) sendResponse(false, 'Tên danh mục không được vượt quá 100 ký tự');
    // Check for duplicate
    $checkSql = "SELECT id_loaihoa FROM loaihoa WHERE ten_loai = '$ten_loai'";
    $checkResult = mysqli_query($conn, $checkSql);
    if (mysqli_num_rows($checkResult) > 0) sendResponse(false, 'Tên danh mục đã tồn tại');
    $sql = "INSERT INTO loaihoa (ten_loai) VALUES ('$ten_loai')";
    if (mysqli_query($conn, $sql)) {
        sendResponse(true, 'Thêm loại hoa thành công');
    } else {
        sendResponse(false, mysqli_error($conn));
    }
}

if ($action === 'update' || $action === 'put') {
    $data = $_POST;
    $id = $data['id_loaihoa'] ?? 0;
    $ten_loai = $data['ten_loai'] ?? '';
    $sql = "UPDATE loaihoa SET ten_loai = '$ten_loai' WHERE id_loaihoa = $id";
    if (mysqli_query($conn, $sql)) {
        sendResponse(true, 'Cập nhật thành công');
    } else {
        sendResponse(false, mysqli_error($conn));
    }
}

if ($action === 'delete') {
    // Get ID from multiple sources for flexibility
    $id = $_POST['id_loaihoa'] ?? $_POST['id'] ?? $_GET['id'] ?? $_GET['id_loaihoa'] ?? 0;
    $id = intval($id); // Ensure it's an integer
    
    // Debug logging
    error_log("Delete category request - ID: $id, POST: " . json_encode($_POST) . ", GET: " . json_encode($_GET));
    
    if (!$id || $id <= 0) {
        error_log("Invalid category ID for deletion: $id");
        sendResponse(false, 'ID danh mục không hợp lệ');
    }
    
    // First check if category exists
    $checkExistSql = "SELECT id_loaihoa, ten_loai FROM loaihoa WHERE id_loaihoa = $id";
    $checkExistResult = mysqli_query($conn, $checkExistSql);
    
    if (!$checkExistResult) {
        error_log("Database error when checking category existence: " . mysqli_error($conn));
        sendResponse(false, 'Lỗi cơ sở dữ liệu: ' . mysqli_error($conn));
    }
    
    if (mysqli_num_rows($checkExistResult) === 0) {
        error_log("Category not found for ID: $id");
        sendResponse(false, 'Không tìm thấy danh mục với ID: ' . $id);
    }
    
    $categoryInfo = mysqli_fetch_assoc($checkExistResult);
    
    // Check if category is being used by any products
    $checkUsageSql = "SELECT COUNT(*) as count FROM sanpham WHERE id_loaihoa = $id";
    $checkUsageResult = mysqli_query($conn, $checkUsageSql);
    
    if (!$checkUsageResult) {
        error_log("Database error when checking category usage: " . mysqli_error($conn));
        sendResponse(false, 'Lỗi cơ sở dữ liệu: ' . mysqli_error($conn));
    }
    
    $usageRow = mysqli_fetch_assoc($checkUsageResult);
    if ($usageRow['count'] > 0) {
        error_log("Cannot delete category ID $id - has {$usageRow['count']} products");
        sendResponse(false, 'Không thể xóa danh mục "' . $categoryInfo['ten_loai'] . '" vì đang có ' . $usageRow['count'] . ' sản phẩm thuộc danh mục này');
    }
    
    // Perform the deletion
    $deleteSql = "DELETE FROM loaihoa WHERE id_loaihoa = $id";
    $deleteResult = mysqli_query($conn, $deleteSql);
    
    if (!$deleteResult) {
        error_log("Database error when deleting category: " . mysqli_error($conn));
        sendResponse(false, 'Lỗi cơ sở dữ liệu khi xóa: ' . mysqli_error($conn));
    }
    
    $affectedRows = mysqli_affected_rows($conn);
    if ($affectedRows > 0) {
        error_log("Successfully deleted category ID: $id, Name: " . $categoryInfo['ten_loai']);
        sendResponse(true, 'Đã xóa thành công danh mục "' . $categoryInfo['ten_loai'] . '"');
    } else {
        error_log("No rows affected when deleting category ID: $id");
        sendResponse(false, 'Không có dữ liệu nào được xóa. Danh mục có thể đã được xóa trước đó.');
    }
}

sendResponse(false, 'Hành động không hợp lệ');
?>
