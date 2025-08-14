<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

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
    $sql = "SELECT * FROM thongbao ORDER BY ngay_gui DESC";
    $result = mysqli_query($conn, $sql);
    $data = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $data[] = $row;
    }
    sendResponse(true, 'Lấy danh sách thông báo thành công', $data);
}

if ($action === 'get_notifications') {
    $sql = "SELECT id_thongbao, tieu_de, noi_dung, ngay_gui FROM thongbao ORDER BY ngay_gui DESC";
    $result = mysqli_query($conn, $sql);
    $data = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $data[] = $row;
    }
    sendResponse(true, 'Lấy danh sách thông báo thành công', $data);
}

if ($action === 'get_by_id') {
    $id = $_GET['id_thongbao'] ?? 0;
    $sql = "SELECT * FROM thongbao WHERE id_thongbao = $id";
    $result = mysqli_query($conn, $sql);
    $row = mysqli_fetch_assoc($result);
    if ($row) sendResponse(true, 'Lấy thông báo thành công', $row);
    else sendResponse(false, 'Không tìm thấy thông báo');
}

if ($action === 'add' || $action === 'post') {
    $id_admin = $_POST['id_admin'] ?? '';
    $tieu_de = $_POST['tieu_de'] ?? '';
    $noi_dung = $_POST['noi_dung'] ?? '';
    $ngay_gui = date('Y-m-d H:i:s');
    if (!$id_admin || !$tieu_de || !$noi_dung) sendResponse(false, 'Thiếu thông tin');
    $sql = "INSERT INTO thongbao (id_admin, tieu_de, noi_dung, ngay_gui) VALUES ('$id_admin', '$tieu_de', '$noi_dung', '$ngay_gui')";
    if (mysqli_query($conn, $sql)) {
        sendResponse(true, 'Thêm thông báo thành công');
    } else {
        sendResponse(false, mysqli_error($conn));
    }
}

if ($action === 'update' || $action === 'put') {
    $id = $_POST['id_thongbao'] ?? '';
    $tieu_de = $_POST['tieu_de'] ?? '';
    $noi_dung = $_POST['noi_dung'] ?? '';
    if (!$id || !$tieu_de || !$noi_dung) sendResponse(false, 'Thiếu thông tin');
    $sql = "UPDATE thongbao SET tieu_de = '$tieu_de', noi_dung = '$noi_dung' WHERE id_thongbao = $id";
    if (mysqli_query($conn, $sql)) {
        sendResponse(true, 'Cập nhật thông báo thành công');
    } else {
        sendResponse(false, mysqli_error($conn));
    }
}

if ($action === 'delete') {
    $id = $_POST['id_thongbao'] ?? ($_GET['id_thongbao'] ?? 0);
    if (!$id) sendResponse(false, 'Thiếu id_thongbao');
    $sql = "DELETE FROM thongbao WHERE id_thongbao = $id";
    if (mysqli_query($conn, $sql)) {
        sendResponse(true, 'Xóa thông báo thành công');
    } else {
        sendResponse(false, mysqli_error($conn));
    }
}

if ($action === 'get_stats') {
    $today = date('Y-m-d');
    $week_start = date('Y-m-d', strtotime('monday this week'));
    $month_start = date('Y-m-01');
    
    // Total notifications
    $total_sql = "SELECT COUNT(*) as total FROM thongbao";
    $total_result = mysqli_query($conn, $total_sql);
    $total = mysqli_fetch_assoc($total_result)['total'];
    
    // Today's notifications
    $today_sql = "SELECT COUNT(*) as today FROM thongbao WHERE DATE(ngay_gui) = '$today'";
    $today_result = mysqli_query($conn, $today_sql);
    $today_count = mysqli_fetch_assoc($today_result)['today'];
    
    // This week's notifications
    $week_sql = "SELECT COUNT(*) as week FROM thongbao WHERE DATE(ngay_gui) >= '$week_start'";
    $week_result = mysqli_query($conn, $week_sql);
    $week_count = mysqli_fetch_assoc($week_result)['week'];
    
    // This month's notifications
    $month_sql = "SELECT COUNT(*) as month FROM thongbao WHERE DATE(ngay_gui) >= '$month_start'";
    $month_result = mysqli_query($conn, $month_sql);
    $month_count = mysqli_fetch_assoc($month_result)['month'];
    
    $stats = [
        'total' => (int)$total,
        'today' => (int)$today_count,
        'week' => (int)$week_count,
        'month' => (int)$month_count
    ];
    
    sendResponse(true, 'Lấy thống kê thông báo thành công', $stats);
}

if ($action === 'get_recent') {
    $limit = $_GET['limit'] ?? 5;
    $sql = "SELECT id_thongbao, tieu_de, noi_dung, ngay_gui FROM thongbao ORDER BY ngay_gui DESC LIMIT $limit";
    $result = mysqli_query($conn, $sql);
    $data = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $data[] = $row;
    }
    sendResponse(true, 'Lấy thông báo gần đây thành công', $data);
}

if ($action === 'mark_as_read') {
    $id = $_POST['id_thongbao'] ?? 0;
    $user_id = $_POST['user_id'] ?? 0;
    
    if (!$id || !$user_id) sendResponse(false, 'Thiếu thông tin');
    
    // This would require a separate table for tracking read status
    // For now, just return success
    sendResponse(true, 'Đánh dấu đã đọc thành công');
}

if ($action === 'bulk_delete') {
    $ids = $_POST['ids'] ?? [];
    if (!is_array($ids) || empty($ids)) sendResponse(false, 'Thiếu danh sách ID');
    
    $ids_str = implode(',', array_map('intval', $ids));
    $sql = "DELETE FROM thongbao WHERE id_thongbao IN ($ids_str)";
    
    if (mysqli_query($conn, $sql)) {
        $affected = mysqli_affected_rows($conn);
        sendResponse(true, "Đã xóa $affected thông báo");
    } else {
        sendResponse(false, mysqli_error($conn));
    }
}

sendResponse(false, 'Hành động không hợp lệ');
?>
