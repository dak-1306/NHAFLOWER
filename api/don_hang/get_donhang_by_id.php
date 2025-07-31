<?php
include_once("../../config/connect.php");
$id = $_GET['id'];

$sql = "SELECT dh.*, kh.ten_khachhang 
        FROM DonHang dh 
        JOIN KhachHang kh ON dh.id_khachhang = kh.id_khachhang 
        WHERE dh.id_donhang = $id";
$result = mysqli_query($conn, $sql);

if ($row = mysqli_fetch_assoc($result)) {
    echo json_encode($row);
} else {
    echo json_encode(['message' => 'Không tìm thấy đơn hàng']);
}
?>
