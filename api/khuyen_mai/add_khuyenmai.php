<?php
include '../config.php';

$data = json_decode(file_get_contents("php://input"), true);

$ten_km = $data['ten_km'];
$phan_tram = $data['phan_tram'];
$ngay_bd = $data['ngay_batdau'];
$ngay_kt = $data['ngay_kt'];

$sql = "INSERT INTO KhuyenMai (ten_km, phan_tram, ngay_batdau, ngay_kt) 
        VALUES ('$ten_km', $phan_tram, '$ngay_bd', '$ngay_kt')";

if (mysqli_query($conn, $sql)) {
    echo json_encode(['message' => 'Thêm khuyến mãi thành công']);
} else {
    echo json_encode(['error' => mysqli_error($conn)]);
}
?>
