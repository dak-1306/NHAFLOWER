<?php
include("connect.php");
$sql = "SELECT * FROM loaihoa ORDER BY id_loaihoa DESC";
$result = mysqli_query($conn, $sql);

$data = [];
while ($row = mysqli_fetch_assoc($result)) {
    $data[] = $row;
}
echo json_encode($data);
?>
