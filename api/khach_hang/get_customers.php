<?php
include '../config/connection.php';
$sql = "SELECT * FROM KhachHang";
$result = $conn->query($sql);

$customers = array();
while ($row = $result->fetch_assoc()) {
    $customers[] = $row;
}
echo json_encode($customers);
?>
