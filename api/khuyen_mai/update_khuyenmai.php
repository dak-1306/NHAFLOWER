<?php
include_once("../../config/connect.php");

$data = json_decode(file_get_contents("php://input"), true);

$id = $data['id_khuyenmai'];
$ten_km = $data['ten_km'];
$phan_tram = $data['phan_tram'];
$ngay_bd = $data['ngay_batdau'];
$ngay_kt = $data['ngay_kt'];

$sql = "UPDATE KhuyenMai 
        SET ten_km = '$ten_km', phan_tram = $phan_tram, 
            ngay_batdau = '$ngay_bd', ngay_kt = '$ngay_kt'
        WHERE id_khuyenmai = $id";

if (mysqli_query($conn, $sql)) {
    echo json_encode(['message' => 'Cập nhật thành công']);
} else {
    echo json_encode(['error' => mysqli_error($conn)]);
}
?>
