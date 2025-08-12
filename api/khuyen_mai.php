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
    $sql = "SELECT * FROM KhuyenMai ORDER BY id_khuyenmai DESC";
    $result = mysqli_query($conn, $sql);
    $data = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $data[] = $row;
    }
    sendResponse(true, 'Lấy danh sách khuyến mãi thành công', $data);
}

if ($action === 'get_by_id') {
    $id = $_GET['id'] ?? 0;
    $sql = "SELECT * FROM KhuyenMai WHERE id_khuyenmai = $id";
    $result = mysqli_query($conn, $sql);
    $row = mysqli_fetch_assoc($result);
    if ($row) sendResponse(true, 'Lấy khuyến mãi thành công', $row);
    else sendResponse(false, 'Không tìm thấy khuyến mãi');
}

if ($action === 'add' || $action === 'post') {
    $data = json_decode(file_get_contents("php://input"), true);
    if (!$data) sendResponse(false, 'Dữ liệu không hợp lệ');
    $ten_km = $conn->real_escape_string($data['ten_km']);
    $phan_tram = intval($data['phan_tram']);
    $ngay_bd = $conn->real_escape_string($data['ngay_batdau']);
    $ngay_kt = $conn->real_escape_string($data['ngay_kt']);
    $sql = "INSERT INTO KhuyenMai (ten_km, phan_tram, ngay_batdau, ngay_kt) VALUES ('$ten_km', $phan_tram, '$ngay_bd', '$ngay_kt')";
    if (mysqli_query($conn, $sql)) {
        sendResponse(true, 'Thêm khuyến mãi thành công');
    } else {
        sendResponse(false, mysqli_error($conn));
    }
}

if ($action === 'update' || $action === 'put') {
    $data = json_decode(file_get_contents("php://input"), true);
    $id = $data['id_khuyenmai'] ?? 0;
    $ten_km = $conn->real_escape_string($data['ten_km']);
    $phan_tram = intval($data['phan_tram']);
    $ngay_bd = $conn->real_escape_string($data['ngay_batdau']);
    $ngay_kt = $conn->real_escape_string($data['ngay_kt']);
    $sql = "UPDATE KhuyenMai SET ten_km = '$ten_km', phan_tram = $phan_tram, ngay_batdau = '$ngay_bd', ngay_kt = '$ngay_kt' WHERE id_khuyenmai = $id";
    if (mysqli_query($conn, $sql)) {
        sendResponse(true, 'Cập nhật thành công');
    } else {
        sendResponse(false, mysqli_error($conn));
    }
}

if ($action === 'delete') {
    $id = $_GET['id'] ?? 0;
    $sql = "DELETE FROM KhuyenMai WHERE id_khuyenmai = $id";
    if (mysqli_query($conn, $sql)) {
        sendResponse(true, 'Xóa khuyến mãi thành công');
    } else {
        sendResponse(false, mysqli_error($conn));
    }
}

sendResponse(false, 'Hành động không hợp lệ');
?>
