<?php
include("connect.php");
$id = $_GET['id_sanpham'];
$sql = "SELECT * FROM sanpham WHERE id_sanpham = $id";
$result = mysqli_query($conn, $sql);
echo json_encode(mysqli_fetch_assoc($result));
?>
