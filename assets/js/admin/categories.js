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
    ],
    drawCallback: function (settings) {
      // Re-initialize tooltips after table draw
      $('[data-toggle="tooltip"]').tooltip();
    },
  });

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

  // Modal events
  $("#categoryModal").on("show.bs.modal", function () {
    // Focus on name input when modal opens
    setTimeout(function () {
      $("#categoryName").focus();
    }, 500);
  });

  $("#categoryModal").on("hidden.bs.modal", function () {
    // Reset form when modal closes
    resetCategoryForm();
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
  } // Add rows to DataTable - sử dụng field names từ loai_hoa API
  categories.forEach(function (category) {
    const actions = `
            <div class="btn-group" role="group">
                <button type="button" class="btn btn-info btn-sm" onclick="editCategory(${
                  category.id_loaihoa
                }, '${escapeHtml(category.ten_loai)}', '${escapeHtml(
      category.mo_ta || ""
    )}')" data-toggle="tooltip" title="Sửa danh mục">
                    <i class="fas fa-edit"></i>
                </button>
                <button type="button" class="btn btn-danger btn-sm" onclick="deleteCategory(${
                  category.id_loaihoa
                })" data-toggle="tooltip" title="Xóa danh mục">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;

    categoriesTable.row.add([
      category.id_loaihoa,
      category.ten_loai || "N/A",
      category.mo_ta || "Không có mô tả",
      "0", // Will need to count products later
      actions,
    ]);
  });

  categoriesTable.draw();

  // Initialize tooltips
  $('[data-toggle="tooltip"]').tooltip();
}

/**
 * Show add category modal
 */
function showAddCategoryModal() {
  isEditMode = false;
  $("#modalTitle").text("Thêm danh mục mới");
  $("#categoryId").val("");
  $("#categoryModal").modal("show");
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
  $("#categoryModal").modal("show");
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
        ten_loai: categoryName,
        mo_ta: categoryDescription
    };    let apiUrl, method;
    if (isEditMode) {
        apiUrl = '../api/loai_hoa.php?action=update&id=' + categoryId;
        method = 'POST';
    } else {
        apiUrl = '../api/loai_hoa.php?action=add';
        method = 'POST';
    }$.ajax({
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
    Swal.fire({
        title: 'Xác nhận xóa',
        text: 'Bạn có chắc chắn muốn xóa danh mục này?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#e91e63',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Xóa',
        cancelButtonText: 'Hủy'
    }).then((result) => {
        if (result.isConfirmed) {            $.ajax({
                url: '../api/loai_hoa.php?action=delete&id=' + categoryId,
                type: 'POST',
                dataType: 'json',
                data: { id: categoryId },
                success: function(response) {
                    if (response.message && (response.message.includes('thành công') || response.message.includes('success'))) {
                        showSuccess('Xóa danh mục thành công!');
                        loadCategories(); // Reload the table
                    } else if (response.error) {
                        showError('Lỗi xóa danh mục: ' + response.error);
                    } else {
                        showError('Có lỗi xảy ra khi xóa danh mục');
                    }
                },
                error: function(xhr, status, error) {
                    console.error('Error deleting category:', error);
                    showError('Không thể xóa danh mục.');
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
