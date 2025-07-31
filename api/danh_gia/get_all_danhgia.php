<?php
include '../connect.php';

$sql = "SELECT dg.*, kh.ten_khachhang, sp.ten_hoa 
        FROM danhgia dg 
        JOIN khachhang kh ON dg.id_khachhang = kh.id_khachhang
        JOIN sanpham sp ON dg.id_sanpham = sp.id_sanpham";
$result = $conn->query($sql);

$data = [];
while ($row = $result->fetch_assoc()) {
    $data[] = $row;
}
echo json_encode($data);
?>
