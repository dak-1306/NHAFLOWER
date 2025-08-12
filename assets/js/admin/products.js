$(document).ready(function() {
    // Initialize DataTable với empty tbody
    var productsTable = $('#productsTable').DataTable({
        "language": {
            "sProcessing": "Đang xử lý...",
            "sLengthMenu": "Hiển thị _MENU_ mục trên mỗi trang",
            "sZeroRecords": "Không tìm thấy sản phẩm nào",
            "sInfo": "Hiển thị _START_ đến _END_ của _TOTAL_ sản phẩm",
            "sInfoEmpty": "Hiển thị 0 đến 0 của 0 sản phẩm",
            "sInfoFiltered": "(được lọc từ _MAX_ sản phẩm)",
            "sSearch": "Tìm kiếm:",
            "oPaginate": {
                "sFirst": "Đầu",
                "sPrevious": "Trước",
                "sNext": "Tiếp",
                "sLast": "Cuối"
            }
        },
        "pageLength": 10,
        "responsive": true,
        "processing": true, // Hiển thị loading indicator của DataTables
        "columnDefs": [
            {
                "targets": [1], // Image column
                "orderable": false,
                "searchable": false
            },
            {
                "targets": [7], // Actions column
                "orderable": false,
                "searchable": false
            }
        ]
    });

    // Load initial data
    loadProducts();
    loadCategories();

    // Event handlers
    $('#addProductBtn').click(addProduct);
    $('#updateProductBtn').click(updateProduct);

    // Form validation
    $('#addProductForm').on('submit', function(e) {
        e.preventDefault();
        addProduct();
    });

    $('#editProductForm').on('submit', function(e) {
        e.preventDefault();
        updateProduct();
    });    // Load products data
    function loadProducts() {
        $.ajax({
            url: '../api/products.php',
            type: 'GET',
            dataType: 'json',
            success: function(response) {
                if (response.success) {
                    productsTable.clear();
                    
                    if (response.data && response.data.length > 0) {
                        $.each(response.data, function(index, product) {
                            var statusBadge = getStatusBadge(product.trang_thai, product.so_luong_ton_kho);
                            var imageHtml = product.hinh_anh ? 
                                `<img src="../uploads/products/${product.hinh_anh}" class="product-image-preview" alt="${product.ten_sanpham}">` :
                                `<div class="product-image-preview d-flex align-items-center justify-content-center bg-light"><i class="fas fa-image text-muted"></i></div>`;
                            
                            var priceFormatted = new Intl.NumberFormat('vi-VN', {
                                style: 'currency',
                                currency: 'VND'
                            }).format(product.gia);

                            productsTable.row.add([
                                product.id_sanpham,
                                imageHtml,
                                product.ten_sanpham,
                                product.ten_danhmuc || 'Chưa phân loại',
                                priceFormatted,
                                product.so_luong_ton_kho,
                                statusBadge,
                                `<div class="btn-group" role="group">
                                    <button class="btn btn-edit btn-sm" onclick="editProduct(${product.id_sanpham})" title="Chỉnh sửa">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="btn btn-delete btn-sm" onclick="deleteProduct(${product.id_sanpham}, '${product.ten_sanpham}')" title="Xóa">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>`
                            ]);
                        });
                    }
                    
                    productsTable.draw();
                } else {
                    showAlert('error', 'Lỗi tải dữ liệu: ' + (response.message || 'Có lỗi xảy ra'));
                }
            },
            error: function(xhr, status, error) {
                console.error('Error loading products:', error);
                showAlert('error', 'Không thể tải danh sách sản phẩm. Vui lòng thử lại.');
            }
        });
    }

    // Load categories for dropdown
    function loadCategories() {
        $.ajax({
            url: '../api/loai_hoa/get_all_loaihoa.php',
            type: 'GET',
            dataType: 'json',
            success: function(response) {
                if (response.success && response.data) {
                    var categoryOptions = '<option value="">Chọn danh mục</option>';
                    $.each(response.data, function(index, category) {
                        categoryOptions += `<option value="${category.id_loaihoa}">${category.ten_loai}</option>`;
                    });
                    
                    $('select[name="id_loaihoa"]').html(categoryOptions);
                } else {
                    console.log('No categories found or error loading categories');
                    $('select[name="id_loaihoa"]').html('<option value="">Không có danh mục</option>');
                }
            },
            error: function(xhr, status, error) {
                console.error('Error loading categories:', error);
                $('select[name="id_loaihoa"]').html('<option value="">Lỗi tải danh mục</option>');
            }
        });
    }

    // Add new product
    function addProduct() {
        if (!validateProductForm('#addProductForm')) {
            return;
        }

        var formData = new FormData();
        
        // Get form data - sử dụng đúng tên fields
        formData.append('ten_hoa', $('input[name="ten_hoa"]').val());
        formData.append('id_loaihoa', $('select[name="id_loaihoa"]').val());
        formData.append('gia', $('input[name="gia"]').val());
        formData.append('so_luong', $('input[name="so_luong"]').val());
        formData.append('mo_ta', $('textarea[name="mo_ta"]').val());
        
        // Add image file
        var imageFile = $('#productImageInput')[0].files[0];
        if (imageFile) {
            formData.append('hinh_anh', imageFile);
        }

        // Show loading
        $('#addProductBtn').prop('disabled', true).html('<i class="fas fa-spinner fa-spin mr-1"></i>Đang lưu...');

        $.ajax({
            url: '../api/products.php',
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            dataType: 'json',
            success: function(response) {
                if (response.success) {
                    showAlert('success', 'Thêm sản phẩm thành công!');
                    $('#addProductModal').modal('hide');
                    resetProductForm('#addProductForm');
                    loadProducts();
                } else {
                    showAlert('error', 'Lỗi: ' + (response.message || 'Có lỗi xảy ra khi thêm sản phẩm'));
                }
            },
            error: function(xhr, status, error) {
                console.error('Error adding product:', error);
                var errorMessage = 'Có lỗi xảy ra khi thêm sản phẩm';
                
                if (xhr.responseJSON && xhr.responseJSON.message) {
                    errorMessage = xhr.responseJSON.message;
                }
                
                showAlert('error', errorMessage);
            },
            complete: function() {
                $('#addProductBtn').prop('disabled', false).html('<i class="fas fa-save mr-1"></i>Lưu');
            }
        });
    }

    // Edit product
    window.editProduct = function(productId) {
        $.ajax({
            url: '../api/products.php?id=' + productId,
            type: 'GET',
            dataType: 'json',
            success: function(response) {
                if (response.success && response.data) {
                    var product = response.data;
                    
                    // Fill form with product data
                    $('#editProductId').val(product.id_sanpham);
                    $('#editProductName').val(product.ten_sanpham);
                    $('#editProductCategory').val(product.id_danhmuc);
                    $('#editProductPrice').val(product.gia);
                    $('#editProductStock').val(product.so_luong_ton_kho);
                    $('#editProductDescription').val(product.mo_ta);
                    $('#editProductStatus').val(product.trang_thai);
                    
                    // Show current image
                    if (product.hinh_anh) {
                        $('#editImagePreview').html(`
                            <img id="editPreviewImg" src="../uploads/products/${product.hinh_anh}" class="img-thumbnail" style="max-width: 200px;">
                            <button type="button" class="btn btn-sm btn-danger ml-2" onclick="removeCurrentImage()">
                                <i class="fas fa-times"></i> Xóa hình hiện tại
                            </button>
                        `);
                    } else {
                        $('#editImagePreview').html('<p class="text-muted">Chưa có hình ảnh</p>');
                    }
                    
                    // Load categories for edit form
                    loadCategories();
                    
                    // Show modal
                    $('#editProductModal').modal('show');
                } else {
                    showAlert('error', 'Không thể tải thông tin sản phẩm');
                }
            },
            error: function(xhr, status, error) {
                console.error('Error loading product:', error);
                showAlert('error', 'Có lỗi xảy ra khi tải thông tin sản phẩm');
            }
        });
    };

    // Update product
    function updateProduct() {
        if (!validateProductForm('#editProductForm')) {
            return;
        }

        var formData = new FormData();
        var productId = $('#editProductId').val();
        
        // Get form data
        formData.append('id_sanpham', productId);
        formData.append('ten_sanpham', $('#editProductName').val());
        formData.append('id_danhmuc', $('#editProductCategory').val());
        formData.append('gia', $('#editProductPrice').val());
        formData.append('so_luong_ton_kho', $('#editProductStock').val());
        formData.append('mo_ta', $('#editProductDescription').val());
        formData.append('trang_thai', $('#editProductStatus').val());
        
        // Add image file if selected
        var imageFile = $('#editProductImageInput')[0].files[0];
        if (imageFile) {
            formData.append('hinh_anh', imageFile);
        }

        // Show loading
        $('#updateProductBtn').prop('disabled', true).html('<i class="fas fa-spinner fa-spin mr-1"></i>Đang cập nhật...');

        $.ajax({
            url: '../api/products.php',
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            dataType: 'json',
            success: function(response) {
                if (response.success) {
                    showAlert('success', 'Cập nhật sản phẩm thành công!');
                    $('#editProductModal').modal('hide');
                    loadProducts();
                } else {
                    showAlert('error', 'Lỗi: ' + (response.message || 'Có lỗi xảy ra khi cập nhật sản phẩm'));
                }
            },
            error: function(xhr, status, error) {
                console.error('Error updating product:', error);
                var errorMessage = 'Có lỗi xảy ra khi cập nhật sản phẩm';
                
                if (xhr.responseJSON && xhr.responseJSON.message) {
                    errorMessage = xhr.responseJSON.message;
                }
                
                showAlert('error', errorMessage);
            },
            complete: function() {
                $('#updateProductBtn').prop('disabled', false).html('<i class="fas fa-save mr-1"></i>Cập nhật');
            }
        });
    }

    // Delete product
    window.deleteProduct = function(productId, productName) {
        Swal.fire({
            title: 'Xác nhận xóa?',
            text: `Bạn có chắc chắn muốn xóa sản phẩm "${productName}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Xóa',
            cancelButtonText: 'Hủy'
        }).then((result) => {
            if (result.isConfirmed) {
                $.ajax({
                    url: '../api/products.php',
                    type: 'DELETE',
                    data: JSON.stringify({ id_sanpham: productId }),
                    contentType: 'application/json',
                    dataType: 'json',
                    success: function(response) {
                        if (response.success) {
                            showAlert('success', 'Xóa sản phẩm thành công!');
                            loadProducts();
                        } else {
                            showAlert('error', 'Lỗi: ' + (response.message || 'Có lỗi xảy ra khi xóa sản phẩm'));
                        }
                    },
                    error: function(xhr, status, error) {
                        console.error('Error deleting product:', error);
                        showAlert('error', 'Có lỗi xảy ra khi xóa sản phẩm');
                    }
                });
            }
        });
    };

    // Validate product form
    function validateProductForm(formSelector) {
        var isValid = true;
        var form = $(formSelector);
        
        // Clear previous errors
        form.find('.is-invalid').removeClass('is-invalid');
        form.find('.invalid-feedback').remove();
        
        // Validate required fields
        form.find('[required]').each(function() {
            var field = $(this);
            var value = field.val().trim();
            
            if (!value) {
                field.addClass('is-invalid');
                field.after('<div class="invalid-feedback">Trường này không được để trống</div>');
                isValid = false;
            }
        });
        
        // Validate price
        var price = form.find('input[name="gia"]').val();
        if (price && parseInt(price) < 0) {
            form.find('input[name="gia"]').addClass('is-invalid');
            form.find('input[name="gia"]').after('<div class="invalid-feedback">Giá phải lớn hơn hoặc bằng 0</div>');
            isValid = false;
        }
        
        // Validate stock
        var stock = form.find('input[name="so_luong_ton_kho"]').val();
        if (stock && parseInt(stock) < 0) {
            form.find('input[name="so_luong_ton_kho"]').addClass('is-invalid');
            form.find('input[name="so_luong_ton_kho"]').after('<div class="invalid-feedback">Số lượng phải lớn hơn hoặc bằng 0</div>');
            isValid = false;
        }
        
        return isValid;
    }

    // Reset product form
    function resetProductForm(formSelector) {
        var form = $(formSelector);
        form[0].reset();
        form.find('.is-invalid').removeClass('is-invalid');
        form.find('.invalid-feedback').remove();
        
        if (formSelector === '#addProductForm') {
            $('#imagePreview').addClass('d-none');
            $('#imageUploadArea').removeClass('border-danger');
        }
    }

    // Get status badge HTML
    function getStatusBadge(status, stock) {
        if (parseInt(stock) === 0) {
            return '<span class="badge status-out-of-stock">Hết hàng</span>';
        } else {
            return '<span class="badge status-active">Có sẵn</span>';
        }
    }

    // Remove current image
    window.removeCurrentImage = function() {
        $('#editImagePreview').html('<p class="text-muted">Hình ảnh sẽ bị xóa khi lưu</p>');
        // Add a hidden field to indicate image should be removed
        if ($('#removeCurrentImageFlag').length === 0) {
            $('#editProductForm').append('<input type="hidden" id="removeCurrentImageFlag" name="remove_image" value="1">');
        }
    };

    // Show alert message
    function showAlert(type, message) {
        var alertClass = type === 'success' ? 'alert-success' : 'alert-danger';
        var alertIcon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
        
        var alertHtml = `
            <div class="alert ${alertClass} alert-dismissible fade show" role="alert">
                <i class="fas ${alertIcon} mr-2"></i>
                ${message}
                <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
        `;
        
        // Remove existing alerts
        $('.container-fluid .alert').remove();
        
        // Add new alert
        $('.container-fluid').prepend(alertHtml);
        
        // Auto remove after 5 seconds
        setTimeout(function() {
            $('.alert').fadeOut();
        }, 5000);
    }

    // Modal reset on hide
    $('#addProductModal').on('hidden.bs.modal', function() {
        resetProductForm('#addProductForm');
    });

    $('#editProductModal').on('hidden.bs.modal', function() {
        resetProductForm('#editProductForm');
        $('#editImagePreview').empty();
        $('#removeCurrentImageFlag').remove();
    });
});
