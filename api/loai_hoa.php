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

if ($action === 'add' || $action === 'post') {
    $data = $_POST;
    $ten_loai = $data['ten_loai'] ?? '';
    $mo_ta = $data['mo_ta'] ?? '';
    if (empty(trim($ten_loai))) sendResponse(false, 'Tên danh mục không được để trống');
    if (strlen($ten_loai) > 100) sendResponse(false, 'Tên danh mục không được vượt quá 100 ký tự');
    // Check for duplicate
    $checkSql = "SELECT id_loaihoa FROM loaihoa WHERE ten_loai = '$ten_loai'";
    $checkResult = mysqli_query($conn, $checkSql);
    if (mysqli_num_rows($checkResult) > 0) sendResponse(false, 'Tên danh mục đã tồn tại');
    $sql = "INSERT INTO loaihoa (ten_loai, mo_ta) VALUES ('$ten_loai', '$mo_ta')";
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
    $id = $_POST['id_loaihoa'] ?? 0;
    $sql = "DELETE FROM loaihoa WHERE id_loaihoa = $id";
    if (mysqli_query($conn, $sql)) {
        sendResponse(true, 'Xóa loại hoa thành công');
    } else {
        sendResponse(false, mysqli_error($conn));
    }
}

sendResponse(false, 'Hành động không hợp lệ');
?>
