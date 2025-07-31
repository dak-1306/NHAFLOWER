<?php
include("connect.php");
$ten_loai = $_POST['ten_loai'];

$sql = "INSERT INTO loaihoa (ten_loai) VALUES ('$ten_loai')";
echo mysqli_query($conn, $sql) ? "success" : "error";
?>
