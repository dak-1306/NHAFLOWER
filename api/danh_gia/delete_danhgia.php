<?php
include '../connect.php';
$id = $_GET['id'];

$conn->query("DELETE FROM danhgia WHERE id_danhgia = $id");
echo json_encode(["status" => "deleted"]);
?>
