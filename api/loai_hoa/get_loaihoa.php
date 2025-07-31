<?php
include("connect.php");
$id = $_GET['id_loaihoa'];
$sql = "SELECT * FROM loaihoa WHERE id_loaihoa = $id";
$result = mysqli_query($conn, $sql);
echo json_encode(mysqli_fetch_assoc($result));
?>
