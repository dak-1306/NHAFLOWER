<?php
include_once("../../config/connect.php");
$data = json_decode(file_get_contents("php://input"));

$id = $data->id_taikhoan;
$email = $data->email;
$vai_tro = $data->vai_tro;
$trang_thai = $data->trang_thai;

$stmt = $conn->prepare("UPDATE taikhoan SET email=?, vai_tro=?, trang_thai=? WHERE id_taikhoan=?");
$stmt->bind_param("ssii", $email, $vai_tro, $trang_thai, $id);
$stmt->execute();

echo json_encode(["status" => "success"]);
?>
