<?php
include_once("../../config/connect.php");
$data = json_decode(file_get_contents("php://input"));

$id_khachhang = $data->id_khachhang;
$id_sanpham = $data->id_sanpham;
$sao = $data->sao;
$noi_dung = $data->noi_dung;

$stmt = $conn->prepare("INSERT INTO danhgia (id_khachhang, id_sanpham, sao, noi_dung, ngay_danhgia) VALUES (?, ?, ?, ?, NOW())");
$stmt->bind_param("iiis", $id_khachhang, $id_sanpham, $sao, $noi_dung);
$stmt->execute();

echo json_encode(["status" => "success"]);
?>
