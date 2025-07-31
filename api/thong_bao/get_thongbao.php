<?php
include("connect.php");
$id = $_GET['id_thongbao'];
$sql = "SELECT * FROM thongbao WHERE id_thongbao = $id";
$result = mysqli_query($conn, $sql);
echo json_encode(mysqli_fetch_assoc($result));
?>
