<?php
include '../config.php';

$sql = "SELECT dh.*, kh.ten_khachhang 
        FROM DonHang dh 
        JOIN KhachHang kh ON dh.id_khachhang = kh.id_khachhang";
$result = mysqli_query($conn, $sql);

$data = [];
while ($row = mysqli_fetch_assoc($result)) {
    $data[] = $row;
}

echo json_encode($data);
?>
