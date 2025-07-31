<?php
include_once("../../config/connect.php");
$result = $conn->query("SELECT * FROM taikhoan");
$data = [];
while ($row = $result->fetch_assoc()) {
    $data[] = $row;
}
echo json_encode($data);
?>
