<?php
include_once("../../config/connect.php");

$sql = "SELECT * FROM KhuyenMai ORDER BY id_khuyenmai DESC";
$result = mysqli_query($conn, $sql);

$data = [];
while ($row = mysqli_fetch_assoc($result)) {
    $data[] = $row;
}

echo json_encode($data);
?>
