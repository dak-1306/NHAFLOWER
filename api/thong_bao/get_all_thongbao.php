<?php
include("connect.php");
$sql = "SELECT * FROM thongbao ORDER BY ngay_gui DESC";
$result = mysqli_query($conn, $sql);

$data = [];
while ($row = mysqli_fetch_assoc($result)) {
    $data[] = $row;
}
echo json_encode($data);
?>
