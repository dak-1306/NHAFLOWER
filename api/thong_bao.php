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

sendResponse(false, 'Hành động không hợp lệ');
?>
