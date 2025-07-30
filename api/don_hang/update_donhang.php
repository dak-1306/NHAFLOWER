<?php
include '../config.php';

$data = json_decode(file_get_contents("php://input"), true);

$id = $data['id_donhang'];
$diachi = $data['dia_chi_giao'];
$trangthai = $data['trang_thai'];

$sql = "UPDATE DonHang 
        SET dia_chi_giao = '$diachi', trang_thai = '$trangthai' 
        WHERE id_donhang = $id";

if (mysqli_query($conn, $sql)) {
    echo json_encode(['message' => 'Cập nhật thành công']);
} else {
    echo json_encode(['error' => mysqli_error($conn)]);
}
?>
