<?php
session_start();

// Xóa tất cả session
session_unset();
session_destroy();

// Chuyển hướng về trang chủ
header('Location: ../user/home.html');
exit;
?>
