<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

include_once("../../config/connect.php");
$sql = "SELECT * FROM KhachHang";
$result = $conn->query($sql);

$customers = array();
while ($row = $result->fetch_assoc()) {
    $customers[] = $row;
}
echo json_encode($customers);
?>
