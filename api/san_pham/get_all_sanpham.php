<?php
include_once("../../config/connect.php");
$sql = "SELECT * FROM sanpham ORDER BY id_sanpham DESC";
$result = mysqli_query($conn, $sql);

$data = [];
while ($row = mysqli_fetch_assoc($result)) {
    $data[] = $row;
}
echo json_encode($data);
?>
