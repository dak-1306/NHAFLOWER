// NHAFLOWER Products Management - Fixed Version
var productsTable;

$(document).ready(function() {
    // Initialize DataTable
    productsTable = $('#productsTable').DataTable({
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
        "processing": true,
        "columnDefs": [
            {
                "targets": [1],
                "orderable": false,
                "searchable": false
            },
            {
                "targets": [7],
                "orderable": false,
                "searchable": false
            }
        ]
    });

    // Load initial data
    loadProducts();
    loadCategories();

    // Initialize event handlers with namespace to prevent conflicts
    initializeEventHandlers();
});

function initializeEventHandlers() {
    // Remove any existing handlers with our namespace first
    $(document).off('.products');
    $('.modal').off('.products');
    
    // Add Product Button - use namespace to prevent conflicts
    $(document).on('click.products', '#addProductBtn', function(e) {
        e.preventDefault();
        e.stopPropagation();
        addProduct();
    });

    // Update Product Button
    $(document).on('click.products', '#updateProductBtn', function(e) {
        e.preventDefault();
        e.stopPropagation();
        updateProduct();
    });

    // Image upload area clicks - prevent trigger loops
    $(document).on('click.products', '#imageUploadArea', function(e) {
        e.preventDefault();
        e.stopPropagation();
        // Use direct access instead of trigger to avoid loops
        document.getElementById('productImageInput').click();
    });

    $(document).on('click.products', '#editImageUploadArea', function(e) {
        e.preventDefault();
        e.stopPropagation();
        document.getElementById('editProductImageInput').click();
    });

    // File input changes - no triggers, direct handling only
    $(document).on('change.products', '#productImageInput', function(e) {
        e.stopPropagation();
        handleImagePreview(this, '#imagePreview', '#previewImg');
    });

    $(document).on('change.products', '#editProductImageInput', function(e) {
        e.stopPropagation();
        handleImagePreview(this, '#editImagePreview', '#editPreviewImg');
    });

    // Remove image button
    $(document).on('click.products', '#removeImageBtn', function(e) {
        e.preventDefault();
        e.stopPropagation();
        $('#imagePreview').addClass('d-none');
        $('#productImageInput').val('');
    });

    // Modal events with namespace
    $('#addProductModal').on('hidden.bs.modal.products', function() {
        resetProductForm('#addProductForm');
    });

    $('#editProductModal').on('hidden.bs.modal.products', function() {
        resetProductForm('#editProductForm');
        $('#editImagePreview').empty();
    });

    // Drag and drop with namespace
    $(document).on('dragover.products', '.image-upload-area', function(e) {
        e.preventDefault();
        e.stopPropagation();
        $(this).addClass('dragover');
    });

    $(document).on('dragleave.products', '.image-upload-area', function(e) {
        e.preventDefault();
        e.stopPropagation();
        $(this).removeClass('dragover');
    });

    $(document).on('drop.products', '.image-upload-area', function(e) {
        e.preventDefault();
        e.stopPropagation();
        $(this).removeClass('dragover');
        
        var files = e.originalEvent.dataTransfer.files;
        if (files.length > 0) {
            var targetInput = $(this).find('input[type="file"]')[0];
            if (targetInput) {
                // Directly set files without triggering events
                targetInput.files = files;
                var previewContainer = targetInput.id.includes('edit') ? '#editImagePreview' : '#imagePreview';
                var previewImg = targetInput.id.includes('edit') ? '#editPreviewImg' : '#previewImg';
                handleImagePreview(targetInput, previewContainer, previewImg);
            }
        }
    });
}

// Load products data
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
                        var statusBadge = getStatusBadge(product.trang_thai, product.so_luong);
                        var imageHtml = product.hinh_anh ? 
                            `<img src="../uploads/products/${product.hinh_anh}" class="product-image-preview" alt="${product.ten_hoa}">` :
                            `<div class="product-image-preview d-flex align-items-center justify-content-center bg-light"><i class="fas fa-image text-muted"></i></div>`;
                        
                        var priceFormatted = new Intl.NumberFormat('vi-VN', {
                            style: 'currency',
                            currency: 'VND'
                        }).format(product.gia);

                        productsTable.row.add([
                            product.id_sanpham,
                            imageHtml,
                            product.ten_hoa,
                            product.ten_loai || 'Chưa phân loại',
                            priceFormatted,
                            product.so_luong,
                            statusBadge,
                            `<div class="btn-group" role="group">
                                <button class="btn btn-edit btn-sm" onclick="editProduct(${product.id_sanpham})" title="Chỉnh sửa">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn btn-delete btn-sm" onclick="deleteProduct(${product.id_sanpham}, '${product.ten_hoa}')" title="Xóa">
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
            showAlert('error', 'Không thể tải danh sách sản phẩm. Vui lòng thử lại.');
        }
    });
}

// Load categories for dropdown
function loadCategories() {
    $.ajax({
        url: '../api/loai_hoa.php?action=get',
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
                $('select[name="id_loaihoa"]').html('<option value="">Không có danh mục</option>');
            }
        },
        error: function(xhr, status, error) {
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
    var form = document.getElementById('addProductForm');
    
    // Get form data
    var ten_hoa = form.querySelector('[name="ten_hoa"]').value.trim();
    var id_loaihoa = form.querySelector('[name="id_loaihoa"]').value;
    var gia = form.querySelector('[name="gia"]').value;
    var so_luong = form.querySelector('[name="so_luong"]').value;
    var mo_ta = form.querySelector('[name="mo_ta"]').value.trim();
    var trang_thai = form.querySelector('[name="trang_thai"]').value;

    // Validate required fields
    if (!ten_hoa) {
        showAlert('error', 'Tên sản phẩm không được để trống');
        return;
    }

    if (!id_loaihoa) {
        showAlert('error', 'Vui lòng chọn danh mục');
        return;
    }

    if (!gia || gia <= 0) {
        showAlert('error', 'Vui lòng nhập giá hợp lệ');
        return;
    }

    if (!so_luong || so_luong < 0) {
        showAlert('error', 'Vui lòng nhập số lượng hợp lệ');
        return;
    }

    // Check image file
    var imageFile = document.getElementById('productImageInput').files[0];
    if (!imageFile) {
        showAlert('error', 'Vui lòng chọn hình ảnh sản phẩm');
        return;
    }

    // Validate image file
    var allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(imageFile.type)) {
        showAlert('error', 'Chỉ chấp nhận file ảnh (JPEG, PNG, GIF, WebP)');
        return;
    }

    if (imageFile.size > 5 * 1024 * 1024) {
        showAlert('error', 'File ảnh không được vượt quá 5MB');
        return;
    }

    // Build FormData
    formData.append('ten_hoa', ten_hoa);
    formData.append('id_loaihoa', id_loaihoa);
    formData.append('gia', gia);
    formData.append('so_luong', so_luong);
    formData.append('mo_ta', mo_ta);
    formData.append('trang_thai', trang_thai);
    formData.append('hinh_anh', imageFile);

    // Show loading state
    var addBtn = $('#addProductBtn');
    addBtn.prop('disabled', true).html('<i class="fas fa-spinner fa-spin mr-1"></i>Đang lưu...');

    // Send AJAX request
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
            var errorMessage = 'Có lỗi xảy ra khi thêm sản phẩm';
            
            try {
                var errorResponse = JSON.parse(xhr.responseText);
                if (errorResponse.message) {
                    errorMessage = errorResponse.message;
                }
            } catch (e) {
                if (xhr.status === 0) {
                    errorMessage = 'Không thể kết nối với server. Kiểm tra XAMPP có đang chạy không.';
                } else if (xhr.status === 413) {
                    errorMessage = 'File quá lớn. Vui lòng chọn file nhỏ hơn.';
                } else if (xhr.status === 500) {
                    errorMessage = 'Lỗi server. Kiểm tra PHP error log.';
                } else if (xhr.status === 404) {
                    errorMessage = 'Không tìm thấy API endpoint.';
                } else {
                    errorMessage = `Lỗi HTTP ${xhr.status}: ${error}`;
                }
            }
            
            showAlert('error', errorMessage);
        },
        complete: function() {
            addBtn.prop('disabled', false).html('<i class="fas fa-save mr-1"></i>Lưu');
        }
    });
}

// Edit product
function editProduct(productId) {
    $.ajax({
        url: '../api/products.php?id=' + productId,
        type: 'GET',
        dataType: 'json',
        success: function(response) {
            if (response.success && response.data) {
                var product = response.data;
                
                // Fill form with product data
                $('#editProductId').val(product.id_sanpham);
                $('#editProductName').val(product.ten_hoa);
                $('#editProductCategory').val(product.id_loaihoa);
                $('#editProductPrice').val(product.gia);
                $('#editProductStock').val(product.so_luong);
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
            showAlert('error', 'Có lỗi xảy ra khi tải thông tin sản phẩm');
        }
    });
}

// Update product
function updateProduct() {
    if (!validateProductForm('#editProductForm')) {
        return;
    }

    var formData = new FormData();
    var productId = $('#editProductId').val();
    
    // Get form data
    formData.append('id_sanpham', productId);
    formData.append('ten_hoa', $('#editProductName').val());
    formData.append('id_loaihoa', $('#editProductCategory').val());
    formData.append('gia', $('#editProductPrice').val());
    formData.append('so_luong', $('#editProductStock').val());
    formData.append('mo_ta', $('#editProductDescription').val());
    formData.append('trang_thai', $('#editProductStatus').val());
    
    // Add image file if selected
    var imageFile = $('#editProductImageInput')[0].files[0];
    if (imageFile) {
        formData.append('hinh_anh', imageFile);
    }

    // Check if current image should be removed
    if ($('#removeCurrentImageFlag').length > 0) {
        formData.append('remove_image', '1');
    }

    // Show loading
    var updateBtn = $('#updateProductBtn');
    updateBtn.prop('disabled', true).html('<i class="fas fa-spinner fa-spin mr-1"></i>Đang cập nhật...');

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
            var errorMessage = 'Có lỗi xảy ra khi cập nhật sản phẩm';
            
            try {
                var errorResponse = JSON.parse(xhr.responseText);
                if (errorResponse.message) {
                    errorMessage = errorResponse.message;
                }
            } catch (e) {
                // Use default error message
            }
            
            showAlert('error', errorMessage);
        },
        complete: function() {
            updateBtn.prop('disabled', false).html('<i class="fas fa-save mr-1"></i>Cập nhật');
        }
    });
}

// Delete product
function deleteProduct(productId, productName) {
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
                    showAlert('error', 'Có lỗi xảy ra khi xóa sản phẩm');
                }
            });
        }
    });
}

// Handle image preview
function handleImagePreview(input, previewContainer, previewImg) {
    if (input.files && input.files[0]) {
        var file = input.files[0];
        
        // Validate file type
        if (!file.type.match('image.*')) {
            showAlert('error', 'Vui lòng chọn file hình ảnh hợp lệ');
            $(input).val('');
            return;
        }
        
        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            showAlert('error', 'File hình ảnh không được vượt quá 5MB');
            $(input).val('');
            return;
        }

        var reader = new FileReader();
        reader.onload = function(e) {
            $(previewContainer).removeClass('d-none');
            
            if (!$(previewImg).length) {
                $(previewContainer).html(`
                    <img id="${previewImg.substring(1)}" class="img-thumbnail" style="max-width: 200px;">
                    <button type="button" class="btn btn-sm btn-danger ml-2" id="removeImageBtn">
                        <i class="fas fa-times"></i> Xóa
                    </button>
                `);
            }
            $(previewImg).attr('src', e.target.result);
        };
        reader.readAsDataURL(file);
    }
}

// Validate product form
function validateProductForm(formSelector) {
    var isValid = true;
    var form = $(formSelector);
    
    if (!form.length) {
        return false;
    }
    
    // Clear previous errors
    form.find('.is-invalid').removeClass('is-invalid');
    form.find('.invalid-feedback').remove();
    
    // Validate required fields
    form.find('[required]').each(function() {
        var field = $(this);
        var value = field.val() ? field.val().trim() : '';
        
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
    var stock = form.find('input[name="so_luong"]').val();
    if (stock && parseInt(stock) < 0) {
        form.find('input[name="so_luong"]').addClass('is-invalid');
        form.find('input[name="so_luong"]').after('<div class="invalid-feedback">Số lượng phải lớn hơn hoặc bằng 0</div>');
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
        $('#productImageInput').val('');
        $('#imageUploadArea').removeClass('border-danger');
    }
}

// Get status badge HTML
function getStatusBadge(status, stock) {
    if (parseInt(stock) === 0) {
        return '<span class="badge status-out-of-stock">Hết hàng</span>';
    } else if (status === 'active') {
        return '<span class="badge status-active">Có sẵn</span>';
    } else {
        return '<span class="badge status-inactive">Không hoạt động</span>';
    }
}

// Remove current image
function removeCurrentImage() {
    $('#editImagePreview').html('<p class="text-muted">Hình ảnh sẽ bị xóa khi lưu</p>');
    // Add a hidden field to indicate image should be removed
    if ($('#removeCurrentImageFlag').length === 0) {
        $('#editProductForm').append('<input type="hidden" id="removeCurrentImageFlag" name="remove_image" value="1">');
    }
}

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

// Make functions globally accessible
window.addProduct = addProduct;
window.editProduct = editProduct;
window.updateProduct = updateProduct;
window.deleteProduct = deleteProduct;
window.removeCurrentImage = removeCurrentImage;
