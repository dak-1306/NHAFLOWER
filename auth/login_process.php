<?php
session_start();
require_once '../includes/config.php';

if ($_POST) {
    $username = $_POST['username'] ?? '';
    $password = $_POST['password'] ?? '';
    
    // Validate input
    if (empty($username) || empty($password)) {
        $_SESSION['error'] = 'Vui lòng nhập đầy đủ thông tin!';
        header('Location: ../user/login.html');
        exit;
    }
    
    try {
        // Tìm user trong database (giả định có bảng users)
        $stmt = $pdo->prepare("SELECT id, username, password, role FROM users WHERE username = ?");
        $stmt->execute([$username]);
        $user = $stmt->fetch();
        
        if ($user && password_verify($password, $user['password'])) {
            // Đăng nhập thành công
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['username'] = $user['username'];
            $_SESSION['role'] = $user['role'];
            
            // Chuyển hướng theo role
            if ($user['role'] === 'admin') {
                header('Location: ../admin/index.html');
            } else {
                header('Location: ../user/home.html');
            }
            exit;
        } else {
            $_SESSION['error'] = 'Tên đăng nhập hoặc mật khẩu không đúng!';
            header('Location: ../user/login.html');
            exit;
        }
    } catch (PDOException $e) {
        $_SESSION['error'] = 'Lỗi hệ thống. Vui lòng thử lại sau!';
        header('Location: ../user/login.html');
        exit;
    }
} else {
    header('Location: ../user/login.html');
    exit;
}
?>
