<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

include_once("../../config/connect.php");
$data = json_decode(file_get_contents("php://input"), true);

// Validation
if (empty($data['ten_khachhang']) || empty($data['so_dien_thoai']) || 
    empty($data['dia_chi']) || empty($data['id_taikhoan'])) {
    echo json_encode([
        "success" => false, 
        "error" => "Vui lòng điền đầy đủ thông tin"
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

$ten = $conn->real_escape_string($data['ten_khachhang']);
$sdt = $conn->real_escape_string($data['so_dien_thoai']);
$diachi = $conn->real_escape_string($data['dia_chi']);
$idtk = intval($data['id_taikhoan']);

// Kiểm tra tài khoản tồn tại
$checkAccount = $conn->query("SELECT id_taikhoan FROM taikhoan WHERE id_taikhoan = $idtk");
if ($checkAccount->num_rows === 0) {
    echo json_encode([
        "success" => false, 
        "error" => "Tài khoản không tồn tại"
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// Kiểm tra tài khoản đã được sử dụng chưa
$checkUsed = $conn->query("SELECT id_khachhang FROM KhachHang WHERE id_taikhoan = $idtk");
if ($checkUsed->num_rows > 0) {
    echo json_encode([
        "success" => false, 
        "error" => "Tài khoản này đã được liên kết với khách hàng khác"
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

$sql = "INSERT INTO KhachHang (ten, sdt, dia_chi, id_taikhoan)
        VALUES ('$ten', '$sdt', '$diachi', $idtk)";

if ($conn->query($sql)) {
    echo json_encode([
        "success" => true,
        "id" => $conn->insert_id,
        "message" => "Thêm khách hàng thành công"
    ], JSON_UNESCAPED_UNICODE);
} else {
    echo json_encode([
        "success" => false, 
        "error" => $conn->error
    ], JSON_UNESCAPED_UNICODE);
}
?>
