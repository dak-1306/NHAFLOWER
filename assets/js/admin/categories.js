/**
 * NHAFLOWER - Categories Management JavaScript
 * Quản lý danh mục cho admin panel
 */

let categoriesTable;
let isEditMode = false;

// Document ready
$(document).ready(function () {
  initializeCategoriesTable();
  bindEvents();
  loadCategories();
});

/**
 * Initialize DataTable for categories
 */
function initializeCategoriesTable() {
  categoriesTable = $("#categoriesTable").DataTable({
    language: {
      url: "https://cdn.datatables.net/plug-ins/1.13.7/i18n/vi.json",
    },
    responsive: true,
    processing: true,
    serverSide: false,
    pageLength: 10,
    lengthMenu: [
      [10, 25, 50, -1],
      [10, 25, 50, "Tất cả"],
    ],
    order: [[0, "asc"]], // Sort by ID ascending
    columnDefs: [
      {
        targets: [4], // Actions column
        orderable: false,
        searchable: false,
      },
    ],    drawCallback: function (settings) {
      // Re-initialize tooltips after table draw
      $('[data-toggle="tooltip"]').tooltip();
    },
  });
}

/**
 * Bind event handlers
 */
function bindEvents() {
  // Category form submission
  $("#saveCategoryBtn").on("click", function (e) {
    e.preventDefault();
    saveCategory();
  });

  // Form validation on input
  $("#categoryName").on("input", function () {
    validateCategoryName($(this).val());
  });

  // Search functionality
  $(".navbar-search input").on("keyup", function () {
    if (categoriesTable) {
      categoriesTable.search(this.value).draw();
    }
  });
  // Modal events - improved accessibility
  $("#categoryModal").on("show.bs.modal", function () {
    // Remove aria-hidden when modal is showing
    $(this).removeAttr('aria-hidden');
  });
  
  $("#categoryModal").on("shown.bs.modal", function () {
    // Focus on name input when modal opens
    $("#categoryName").focus();
  });

  $("#categoryModal").on("hidden.bs.modal", function () {
    // Reset form when modal closes and restore aria-hidden
    resetCategoryForm();
    $(this).attr('aria-hidden', 'true');
  });
}

/**
 * Load categories from API
 */
function loadCategories() {
    // Sử dụng API loai_hoa để có field names đúng với categories management
      $.ajax({
        url: '../api/loai_hoa.php?action=get',
        type: 'GET',
        dataType: 'json',
        success: function(response) {
            // Handle both structured API response and direct array
            let data = [];
            if (response && response.success && response.data) {
                data = response.data;
            } else if (Array.isArray(response)) {
                data = response;
            } else {
                console.error('Invalid response format:', response);
                showError('Dữ liệu trả về không hợp lệ');
                return;
            }
            
            if (Array.isArray(data)) {
                displayCategories(data);
            } else {
                showError('Dữ liệu trả về không hợp lệ');
            }
        },
        error: function(xhr, status, error) {
            console.error('Error loading categories:', error);
            showError('Không thể tải dữ liệu danh mục. Vui lòng thử lại.');
        }
    });
}

/**
 * Display categories in DataTable
 */
function displayCategories(categories) {
  // Clear existing data
  categoriesTable.clear();

  if (!categories || categories.length === 0) {
    categoriesTable.draw();
    return;
  }
  
  // Add rows to DataTable - sử dụng field names từ loai_hoa API
  categories.forEach(function (category) {
    // Ensure we have valid category data
    if (!category.id_loaihoa) {
      console.warn('Invalid category data:', category);
      return;
    }
    
    // Escape data to prevent XSS
    const categoryId = parseInt(category.id_loaihoa);
    const categoryName = escapeHtml(category.ten_loai || 'N/A');
    const categoryDesc = escapeHtml(category.mo_ta || 'Không có mô tả');
    
    const actions = `
      <div class="btn-group" role="group">
        <button type="button" 
                class="btn btn-info btn-sm" 
                onclick="editCategory(${categoryId}, '${categoryName.replace(/'/g, "\\'")}', '${categoryDesc.replace(/'/g, "\\'")}')" 
                data-toggle="tooltip" 
                data-placement="top"
                title="Sửa danh mục">
          <i class="fas fa-edit"></i>
        </button>
        <button type="button" 
                class="btn btn-danger btn-sm" 
                onclick="deleteCategory(${categoryId})" 
                data-toggle="tooltip" 
                data-placement="top"
                title="Xóa danh mục">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    `;

    categoriesTable.row.add([
      categoryId,
      categoryName,
      categoryDesc,
      "0", // Will need to count products later - placeholder
      actions,
    ]);
  });

  categoriesTable.draw();

  // Re-initialize tooltips after table is drawn
  setTimeout(() => {
    $('[data-toggle="tooltip"]').tooltip();
  }, 100);
}

/**
 * Show add category modal
 */
function showAddCategoryModal() {
  isEditMode = false;
  $("#modalTitle").text("Thêm danh mục mới");
  $("#categoryId").val("");
  // Properly handle modal show to avoid aria-hidden conflicts
  $("#categoryModal").modal({
    backdrop: true,
    keyboard: true,
    focus: true
  });
}

/**
 * Edit category
 */
function editCategory(id, name, description) {
  isEditMode = true;
  $("#modalTitle").text("Chỉnh sửa danh mục");
  $("#categoryId").val(id);
  $("#categoryName").val(name);
  $("#categoryDescription").val(description);
  // Properly handle modal show to avoid aria-hidden conflicts
  $("#categoryModal").modal({
    backdrop: true,
    keyboard: true,
    focus: true
  });
}

/**
 * Save category (add or update)
 */
function saveCategory() {
  const categoryId = $("#categoryId").val();
  const categoryName = $("#categoryName").val().trim();
  const categoryDescription = $("#categoryDescription").val().trim();
  // Validate input
  if (!validateCategoryName(categoryName)) {
    return;
  }
  const formData = {
    ten_loai: categoryName
    // Note: mo_ta field doesn't exist in database schema, so we don't send it
  };

  let apiUrl, method;
  if (isEditMode) {
    apiUrl = '../api/loai_hoa.php?action=update&id=' + categoryId;
    method = 'POST';
  } else {
    apiUrl = '../api/loai_hoa.php?action=add';
    method = 'POST';
  }

  $.ajax({
        url: apiUrl,
        type: method,
        data: formData, // Send as form data, not JSON
        success: function(response) {
            console.log('Server response:', response); // Debug log
            
            // Handle both old and new response formats
            if (typeof response === 'string') {
                if (response.includes('success')) {
                    $('#categoryModal').modal('hide');
                    const message = isEditMode ? 'Cập nhật danh mục thành công!' : 'Thêm danh mục thành công!';
                    showSuccess(message);
                    loadCategories();
                } else {
                    showError('Lỗi: ' + response);
                }
            } else if (typeof response === 'object') {
                if (response.success) {
                    $('#categoryModal').modal('hide');
                    const message = isEditMode ? 'Cập nhật danh mục thành công!' : 'Thêm danh mục thành công!';
                    showSuccess(message);
                    loadCategories();
                } else {
                    showError('Lỗi: ' + (response.message || 'Có lỗi xảy ra'));
                }
            } else {
                showError('Phản hồi không hợp lệ từ server');
            }
        },
      error: function(xhr, status, error) {
          console.error('Error saving category:', xhr.responseText);
          let errorMessage = 'Không thể lưu danh mục. ';
          
          if (xhr.responseText) {
              try {
                  const errorResponse = JSON.parse(xhr.responseText);
                  errorMessage += errorResponse.message || xhr.responseText;
              } catch (e) {
                  errorMessage += xhr.responseText;
              }
          } else {
              errorMessage += 'Vui lòng thử lại.';
          }
          
          showError(errorMessage);
      }
  });
}

/**
 * Delete category
 */
function deleteCategory(categoryId) {
    console.log('Attempting to delete category ID:', categoryId); // Debug log
    
    // Validate categoryId
    if (!categoryId || categoryId <= 0) {
        Swal.fire({
            title: 'Lỗi!',
            text: 'ID danh mục không hợp lệ',
            icon: 'error',
            confirmButtonColor: '#e91e63'
        });
        return;
    }
    
    Swal.fire({
        title: 'Xác nhận xóa',
        text: 'Bạn có chắc chắn muốn xóa danh mục này? Hành động này không thể hoàn tác.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Có, xóa ngay!',
        cancelButtonText: 'Hủy bỏ',
        reverseButtons: true
    }).then((result) => {
        if (result.isConfirmed) {
            // Show loading
            Swal.fire({
                title: 'Đang xóa...',
                text: 'Vui lòng đợi trong giây lát',
                icon: 'info',
                allowOutsideClick: false,
                showConfirmButton: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });
            
            $.ajax({
                url: '../api/loai_hoa.php?action=delete',
                type: 'POST',
                data: { 
                    id_loaihoa: parseInt(categoryId),
                    id: parseInt(categoryId)  // Send both for compatibility
                },
                timeout: 10000, // 10 second timeout
                success: function(response) {
                    console.log('Delete response:', response); // Debug log
                    
                    // Handle different response types
                    let parsedResponse;
                    if (typeof response === 'string') {
                        try {
                            parsedResponse = JSON.parse(response);
                        } catch (e) {
                            parsedResponse = { success: false, message: response };
                        }
                    } else {
                        parsedResponse = response;
                    }
                    
                    if (parsedResponse.success) {
                        Swal.fire({
                            title: 'Thành công!',
                            text: parsedResponse.message || 'Danh mục đã được xóa thành công',
                            icon: 'success',
                            confirmButtonColor: '#28a745',
                            timer: 2000,
                            showConfirmButton: false
                        }).then(() => {
                            loadCategories(); // Reload the table
                        });
                    } else {
                        Swal.fire({
                            title: 'Lỗi!',
                            text: parsedResponse.message || 'Có lỗi xảy ra khi xóa danh mục',
                            icon: 'error',
                            confirmButtonColor: '#dc3545'
                        });
                    }
                },
                error: function(xhr, status, error) {
                    console.error('Error deleting category:', {
                        status: status,
                        error: error,
                        responseText: xhr.responseText
                    });
                    
                    let errorMessage = 'Không thể xóa danh mục. ';
                    
                    if (status === 'timeout') {
                        errorMessage = 'Yêu cầu bị hết thời gian chờ. Vui lòng thử lại.';
                    } else if (xhr.responseText) {
                        try {
                            const errorResponse = JSON.parse(xhr.responseText);
                            errorMessage += errorResponse.message || xhr.responseText;
                        } catch (e) {
                            errorMessage += xhr.responseText;
                        }
                    } else {
                        errorMessage += 'Vui lòng kiểm tra kết nối mạng và thử lại.';
                    }
                    
                    Swal.fire({
                        title: 'Lỗi kết nối!',
                        text: errorMessage,
                        icon: 'error',
                        confirmButtonColor: '#dc3545'
                    });
                }
            });
        }
    });
}

/**
 * Validate category name
 */
function validateCategoryName(name) {
  const $nameInput = $("#categoryName");
  const $feedback = $nameInput.siblings(".invalid-feedback");

  if (!name || name.length < 2) {
    $nameInput.addClass("is-invalid");
    $feedback.text("Tên danh mục phải có ít nhất 2 ký tự");
    return false;
  }

  if (name.length > 100) {
    $nameInput.addClass("is-invalid");
    $feedback.text("Tên danh mục không được quá 100 ký tự");
    return false;
  }

  $nameInput.removeClass("is-invalid").addClass("is-valid");
  return true;
}

/**
 * Reset category form
 */
function resetCategoryForm() {
  $("#categoryForm")[0].reset();
  $("#categoryId").val("");
  $("#categoryName").removeClass("is-valid is-invalid");
  $("#categoryDescription").removeClass("is-valid is-invalid");
  isEditMode = false;
}

// Utility Functions

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
  if (!text) return "";
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Show loading state
 */
function showLoading() {
  // DataTables sẽ tự xử lý loading state với "processing": true
  // Không cần thêm hàng loading thủ công
}

/**
 * Hide loading state
 */
function hideLoading() {
  // DataTables sẽ tự ẩn loading state
}

/**
 * Show success message
 */
function showSuccess(message) {
  Swal.fire({
    icon: "success",
    title: "Thành công!",
    text: message,
    timer: 2000,
    showConfirmButton: false,
  });
}

/**
 * Show error message
 */
function showError(message) {
  Swal.fire({
    icon: "error",
    title: "Lỗi!",
    text: message,
    confirmButtonColor: "#e91e63",
  });
}
