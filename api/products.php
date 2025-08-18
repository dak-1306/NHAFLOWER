<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 0); // Don't display errors to avoid breaking JSON
ini_set('log_errors', 1);

// Set JSON header first
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Capture any output that might break JSON
ob_start();

include_once __DIR__ . '/config/connection.php';

// Function to send JSON response
function sendResponse($success, $message, $data = null) {
    // Clear any output that might break JSON
    ob_clean();
    
    $response = [
        'success' => $success,
        'message' => $message
    ];
    
    if ($data !== null) {
        $response['data'] = $data;
    }
    
    // Ensure clean JSON output
    echo json_encode($response, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit;
}

// Function to validate required fields
function validateRequired($data, $fields) {
    foreach ($fields as $field) {
        if (!isset($data[$field])) {
            return "Trường {$field} không được để trống (không tồn tại)";
        }
        
        $value = $data[$field];
        if ($value === null || $value === '' || (is_string($value) && trim($value) === '')) {
            return "Trường {$field} không được để trống (giá trị rỗng)";
        }
    }
    return null;
}

// Function to handle file upload
function handleFileUpload($file) {
    $uploadDir = '../uploads/products/';
    
    // Create upload directory if it doesn't exist
    if (!is_dir($uploadDir)) {
        if (!mkdir($uploadDir, 0777, true)) {
            return ['error' => 'Không thể tạo thư mục upload'];
        }
    }
    
    // Check basic upload error first
    if ($file['error'] !== UPLOAD_ERR_OK) {
        $errorMessages = [
            UPLOAD_ERR_INI_SIZE => 'File vượt quá upload_max_filesize',
            UPLOAD_ERR_FORM_SIZE => 'File vượt quá MAX_FILE_SIZE',
            UPLOAD_ERR_PARTIAL => 'File chỉ upload một phần',
            UPLOAD_ERR_NO_FILE => 'Không có file nào được upload',
            UPLOAD_ERR_NO_TMP_DIR => 'Không có thư mục tạm',
            UPLOAD_ERR_CANT_WRITE => 'Không thể ghi vào đĩa',
            UPLOAD_ERR_EXTENSION => 'Upload bị dừng bởi extension'
        ];
        $errorMsg = $errorMessages[$file['error']] ?? 'Lỗi upload không xác định';
        return ['error' => $errorMsg];
    }
    
    // Check if temp file exists
    if (!file_exists($file['tmp_name'])) {
        return ['error' => 'File tạm không tồn tại'];
    }
    
    $allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    $maxSize = 5 * 1024 * 1024; // 5MB
    
    if (!in_array($file['type'], $allowedTypes)) {
        return ['error' => 'Chỉ chấp nhận file ảnh (JPEG, PNG, GIF, WebP)'];
    }
    
    if ($file['size'] > $maxSize) {
        return ['error' => 'File ảnh không được vượt quá 5MB'];
    }
    
    // Generate unique filename
    $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
    $filename = 'product_' . time() . '_' . rand(1000, 9999) . '.' . $extension;
    $targetPath = $uploadDir . $filename;
    
    if (move_uploaded_file($file['tmp_name'], $targetPath)) {
        return ['success' => true, 'filename' => $filename];
    } else {
        return ['error' => 'Không thể di chuyển file upload. Kiểm tra quyền thư mục.'];
    }
}

// Function to delete file
function deleteFile($filename) {
    if ($filename && file_exists('../uploads/products/' . $filename)) {
        unlink('../uploads/products/' . $filename);
    }
}

$method = $_SERVER['REQUEST_METHOD'];

try {
    switch ($method) {
        case 'GET':
            if (isset($_GET['id'])) {
                // Get single product
                $id = intval($_GET['id']);
                $sql = "SELECT s.*, l.ten_loai as ten_danhmuc 
                        FROM sanpham s 
                        LEFT JOIN loaihoa l ON s.id_loaihoa = l.id_loaihoa 
                        WHERE s.id_sanpham = ?";
                
                $stmt = $conn->prepare($sql);
                $stmt->bind_param("i", $id);
                $stmt->execute();
                $result = $stmt->get_result();                if ($row = $result->fetch_assoc()) {
                    // Map field names to frontend expectations
                    $product = [
                        'id_sanpham' => $row['id_sanpham'],
                        'ten_hoa' => $row['ten_hoa'],
                        'ten_sanpham' => $row['ten_hoa'], // Add mapping for JavaScript compatibility
                        'gia' => $row['gia'],
                        'mo_ta' => $row['mo_ta'],
                        'so_luong' => $row['so_luong'],
                        'so_luong_ton_kho' => $row['so_luong'], // Map both field names
                        'id_loaihoa' => $row['id_loaihoa'],
                        'ten_danhmuc' => $row['ten_danhmuc'],
                        'hinh_anh' => $row['hinh_anh'],
                        'trang_thai' => $row['trang_thai'] ?: 'active', // Use actual database value
                        'id_khuyenmai' => $row['id_khuyenmai']
                    ];
                    sendResponse(true, 'Lấy thông tin sản phẩm thành công', $product);
                } else {
                    sendResponse(false, 'Không tìm thấy sản phẩm');
                }
            } else {
                // Get all products
                $sql = "SELECT s.*, l.ten_loai as ten_danhmuc 
                        FROM sanpham s 
                        LEFT JOIN loaihoa l ON s.id_loaihoa = l.id_loaihoa 
                        ORDER BY s.id_sanpham DESC";
                
                $result = $conn->query($sql);
                $products = [];                while ($row = $result->fetch_assoc()) {
                    // Map field names to frontend expectations
                    $products[] = [
                        'id_sanpham' => $row['id_sanpham'],
                        'ten_hoa' => $row['ten_hoa'],
                        'ten_sanpham' => $row['ten_hoa'], // Add mapping for JavaScript compatibility
                        'gia' => $row['gia'],
                        'mo_ta' => $row['mo_ta'],
                        'so_luong' => $row['so_luong'],
                        'so_luong_ton_kho' => $row['so_luong'], // Map both field names
                        'id_loaihoa' => $row['id_loaihoa'],
                        'ten_danhmuc' => $row['ten_danhmuc'] ?: 'Chưa phân loại',
                        'hinh_anh' => $row['hinh_anh'],
                        'trang_thai' => $row['trang_thai'] ?: 'active', // Use actual database value
                        'id_khuyenmai' => $row['id_khuyenmai']
                    ];
                }
                
                sendResponse(true, 'Lấy danh sách sản phẩm thành công', $products);
            }
            break;
            
        case 'POST':
            // Check if this is an update (has id_sanpham) or create
            if (isset($_POST['id_sanpham']) && !empty($_POST['id_sanpham'])) {
                // UPDATE PRODUCT
                $id = intval($_POST['id_sanpham']);
                  // Validate required fields
                $requiredFields = ['ten_hoa', 'gia', 'so_luong'];
                $error = validateRequired($_POST, $requiredFields);
                if ($error) {
                    sendResponse(false, $error);
                }
                
                // Get current product info
                $stmt = $conn->prepare("SELECT hinh_anh FROM sanpham WHERE id_sanpham = ?");
                $stmt->bind_param("i", $id);
                $stmt->execute();
                $result = $stmt->get_result();
                $currentProduct = $result->fetch_assoc();
                
                if (!$currentProduct) {
                    sendResponse(false, 'Sản phẩm không tồn tại');
                }
                
                $currentImage = $currentProduct['hinh_anh'];
                $newImage = $currentImage;
                
                // Handle image upload
                if (isset($_FILES['hinh_anh']) && $_FILES['hinh_anh']['error'] === UPLOAD_ERR_OK) {
                    $uploadResult = handleFileUpload($_FILES['hinh_anh']);
                    if (isset($uploadResult['error'])) {
                        sendResponse(false, $uploadResult['error']);
                    }
                    $newImage = $uploadResult['filename'];
                    
                    // Delete old image
                    if ($currentImage && $currentImage !== $newImage) {
                        deleteFile($currentImage);
                    }
                } elseif (isset($_POST['remove_image']) && $_POST['remove_image'] == '1') {
                    // Remove current image
                    deleteFile($currentImage);
                    $newImage = null;
                }
                  // Update product
                $sql = "UPDATE sanpham SET 
                            ten_hoa = ?, 
                            gia = ?, 
                            mo_ta = ?, 
                            so_luong = ?, 
                            id_loaihoa = ?, 
                            hinh_anh = ?
                        WHERE id_sanpham = ?";
                  $stmt = $conn->prepare($sql);
                $ten_hoa = trim($_POST['ten_hoa']);
                $gia = floatval($_POST['gia']);
                $mo_ta = trim($_POST['mo_ta'] ?? '');
                $so_luong = intval($_POST['so_luong']);
                $id_loaihoa = !empty($_POST['id_loaihoa']) ? intval($_POST['id_loaihoa']) : null;
                
                $stmt->bind_param("sdsiisi", $ten_hoa, $gia, $mo_ta, $so_luong, $id_loaihoa, $newImage, $id);
                
                if ($stmt->execute()) {
                    sendResponse(true, 'Cập nhật sản phẩm thành công');
                } else {
                    sendResponse(false, 'Lỗi cập nhật sản phẩm: ' . $conn->error);
                }            } else {
                // CREATE PRODUCT
                // Validate required fields
                $requiredFields = ['ten_hoa', 'gia', 'so_luong'];
                $error = validateRequired($_POST, $requiredFields);
                if ($error) {
                    error_log("DEBUG: Validation error: " . $error);
                    sendResponse(false, $error);
                }
                
                // Check if image is uploaded
                if (!isset($_FILES['hinh_anh']) || $_FILES['hinh_anh']['error'] !== UPLOAD_ERR_OK) {
                    sendResponse(false, 'Vui lòng chọn hình ảnh sản phẩm');
                }
                
                // Handle image upload
                $uploadResult = handleFileUpload($_FILES['hinh_anh']);
                if (isset($uploadResult['error'])) {
                    sendResponse(false, $uploadResult['error']);
                }
                  // Insert product
                $sql = "INSERT INTO sanpham (ten_hoa, gia, mo_ta, so_luong, id_loaihoa, hinh_anh) 
                        VALUES (?, ?, ?, ?, ?, ?)";
                  $stmt = $conn->prepare($sql);
                $ten_hoa = trim($_POST['ten_hoa']);
                $gia = floatval($_POST['gia']);
                $mo_ta = trim($_POST['mo_ta'] ?? '');
                $so_luong = intval($_POST['so_luong']);
                $id_loaihoa = !empty($_POST['id_loaihoa']) ? intval($_POST['id_loaihoa']) : null;
                $hinh_anh = $uploadResult['filename'];
                
                $stmt->bind_param("sdsiss", $ten_hoa, $gia, $mo_ta, $so_luong, $id_loaihoa, $hinh_anh);
                
                if ($stmt->execute()) {
                    sendResponse(true, 'Thêm sản phẩm thành công');
                } else {
                    sendResponse(false, 'Lỗi thêm sản phẩm: ' . $conn->error);
                }
            }
            break;

        case 'DELETE':
            // Delete product
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($input['id_sanpham']) || empty($input['id_sanpham'])) {
                sendResponse(false, 'ID sản phẩm không hợp lệ');
            }
            
            $id = intval($input['id_sanpham']);
            
            // Get product image before deleting
            $stmt = $conn->prepare("SELECT hinh_anh FROM sanpham WHERE id_sanpham = ?");
            $stmt->bind_param("i", $id);
            $stmt->execute();
            $result = $stmt->get_result();
            $product = $result->fetch_assoc();
            
            if (!$product) {
                sendResponse(false, 'Sản phẩm không tồn tại');
            }
            
            // Check if product is in any orders
            $stmt = $conn->prepare("SELECT COUNT(*) as count FROM chitietdonhang WHERE id_sanpham = ?");
            $stmt->bind_param("i", $id);
            $stmt->execute();
            $result = $stmt->get_result();
            $orderCheck = $result->fetch_assoc();
            
            if ($orderCheck['count'] > 0) {
                sendResponse(false, 'Không thể xóa sản phẩm này vì đã có trong đơn hàng. Bạn có thể đặt trạng thái không hoạt động thay thế.');
            }
            
            // Delete product
            $stmt = $conn->prepare("DELETE FROM sanpham WHERE id_sanpham = ?");
            $stmt->bind_param("i", $id);
            
            if ($stmt->execute()) {
                // Delete associated image
                if ($product['hinh_anh']) {
                    deleteFile($product['hinh_anh']);
                }
                sendResponse(true, 'Xóa sản phẩm thành công');
            } else {
                sendResponse(false, 'Lỗi xóa sản phẩm: ' . $conn->error);
            }
            break;
              default:
            sendResponse(false, 'Phương thức không được hỗ trợ');
    }
    
} catch (Exception $e) {
    error_log("PRODUCTS API ERROR: " . $e->getMessage());
    error_log("Stack trace: " . $e->getTraceAsString());
    sendResponse(false, 'Lỗi server: ' . $e->getMessage());
} catch (Error $e) {
    error_log("PRODUCTS API FATAL ERROR: " . $e->getMessage());
    error_log("Stack trace: " . $e->getTraceAsString());
    sendResponse(false, 'Lỗi nghiêm trọng: ' . $e->getMessage());
}

// Close connection if it exists
if (isset($conn) && $conn) {
    $conn->close();
}

// Final safety net - if we get here without sending response, send error
if (ob_get_length()) {
    ob_clean();
}
sendResponse(false, 'Phản hồi API không hợp lệ');
?>
