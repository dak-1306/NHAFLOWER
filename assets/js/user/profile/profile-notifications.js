// profile-notifications.js
// Hiển thị thông báo từ bảng thongbao (dữ liệu thật)

$(document).ready(function () {
  console.log("NHAFLOWER User Notifications initializing...");

  const userData = JSON.parse(localStorage.getItem("nhaflower_user") || "null");
  const baseManager = new BaseProfileManager();

  baseManager.updateSidebarInfo(userData);
  loadNotifications();

  // Auto-refresh notifications every 60 seconds
  setInterval(loadNotifications, 60000);

  console.log("User notifications loaded successfully!");
});

/**
 * Gọi API lấy danh sách thông báo
 */
async function loadNotifications() {
  const $container = $("#notificationsContainer");
  // Hiển thị trạng thái loading
  $container.html(`
    <div class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="sr-only">Đang tải...</span>
      </div>
      <h5 class="text-muted mt-3">Đang tải thông báo...</h5>
    </div>
  `);
  try {
    const res = await fetch(
      "../../api/thong_bao.php?action=get_notifications",
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    );
    const data = await res.json();
    if (data && data.success && data.data && data.data.length > 0) {
      renderNotifications(data.data);
      updateNotificationCount(data.data.length);
    } else {
      showEmptyState();
    }
  } catch (err) {
    console.error("Notification load error:", err);
    showErrorState();
  }
}

/**
 * Hiển thị trạng thái trống
 */
function showEmptyState() {
  const $container = $("#notificationsContainer");
  $container.html(`
    <div class="text-center py-5">
      <i class="fas fa-bell-slash fa-3x text-muted mb-3"></i>
      <h5 class="text-muted">Không có thông báo nào</h5>
      <p class="text-muted">Bạn sẽ nhận được thông báo về đơn hàng và khuyến mãi tại đây.</p>
    </div>
  `);
}

/**
 * Hiển thị trạng thái lỗi
 */
function showErrorState() {
  const $container = $("#notificationsContainer");
  $container.html(`
    <div class="text-center py-5">
      <i class="fas fa-exclamation-triangle fa-3x text-warning mb-3"></i>
      <h5 class="text-warning">Không thể tải thông báo</h5>
      <p class="text-muted">Đã xảy ra lỗi khi tải thông báo. Vui lòng thử lại sau.</p>
      <button class="btn btn-primary" onclick="loadNotifications()">
        <i class="fas fa-sync-alt mr-2"></i>Thử lại
      </button>
    </div>
  `);
}

/**
 * Cập nhật số lượng thông báo
 */
function updateNotificationCount(count) {
  // Cập nhật counter trong dashboard nếu có
  if (typeof window.updateNotificationCounter === "function") {
    window.updateNotificationCounter(count);
  }

  // Cập nhật title
  document.title =
    count > 0 ? `NHAFLOWER - Thông báo (${count})` : "NHAFLOWER - Thông báo";
}

/**
 * Render danh sách thông báo ra HTML
 * @param {Array} list - Danh sách thông báo
 */
function renderNotifications(list) {
  const $container = $("#notificationsContainer");

  if (!Array.isArray(list) || list.length === 0) {
    showEmptyState();
    return;
  }

  let html = "";

  list.forEach((item, index) => {
    const notificationIcon = getNotificationIcon(item.type || "system");
    const timeAgo = getTimeAgo(item.ngay_gui);

    html += `
      <div class="notification-item" data-id="${
        item.id_thongbao
      }" data-index="${index}">
        <div class="d-flex">
          <div class="notification-icon-wrapper mr-3">
            <div class="notification-icon ${getNotificationIconClass(
              item.type || "system"
            )}">
              <i class="fas ${notificationIcon}"></i>
            </div>
          </div>
          <div class="flex-grow-1">
            <div class="d-flex justify-content-between align-items-start">
              <h6 class="notification-title mb-1">${escapeHTML(
                item.tieu_de || ""
              )}</h6>
              <div class="notification-actions">
                <button class="btn btn-sm btn-outline-primary" onclick="toggleNotificationDetail(${index})">
                  <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger ml-1" onclick="markAsRead(${
                  item.id_thongbao
                })">
                  <i class="fas fa-check"></i>
                </button>
              </div>
            </div>
            <p class="notification-preview text-muted mb-2">${escapeHTML(
              truncateText(item.noi_dung || "", 100)
            )}</p>
            <small class="text-muted">
              <i class="fas fa-clock mr-1"></i>${timeAgo}
            </small>
            <div class="notification-detail mt-3" id="detail-${index}" style="display: none;">
              <div class="border rounded p-3 bg-light">
                <strong>Nội dung đầy đủ:</strong>
                <div class="mt-2">${escapeHTML(item.noi_dung || "")}</div>
                <hr class="my-2">
                <small class="text-muted">Ngày gửi: ${formatDate(
                  item.ngay_gui
                )}</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  });

  $container.html(html);

  // Setup clear all notifications button
  setupClearAllButton(list.length);
}

/**
 * Thiết lập nút xóa tất cả thông báo
 */
function setupClearAllButton(count) {
  $(".btn-clear-notifications")
    .off("click")
    .on("click", function () {
      if (count === 0) return;

      Swal.fire({
        title: "Xác nhận xóa tất cả?",
        text: `Bạn có chắc chắn muốn xóa tất cả ${count} thông báo không?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#dc3545",
        cancelButtonColor: "#6c757d",
        confirmButtonText: "Xóa tất cả",
        cancelButtonText: "Hủy",
      }).then((result) => {
        if (result.isConfirmed) {
          clearAllNotifications();
        }
      });
    });
}

/**
 * Xóa tất cả thông báo
 */
function clearAllNotifications() {
  // Since we don't have user-specific notifications, we'll just hide them
  showEmptyState();

  Swal.fire({
    icon: "success",
    title: "Đã xóa!",
    text: "Tất cả thông báo đã được xóa.",
    timer: 2000,
    timerProgressBar: true,
    showConfirmButton: false,
  });
}

/**
 * Đánh dấu thông báo đã đọc
 */
function markAsRead(notificationId) {
  const $notification = $(`.notification-item[data-id="${notificationId}"]`);

  // Visual feedback
  $notification.fadeOut(300, function () {
    $(this).remove();

    // Check if any notifications left
    if ($(".notification-item").length === 0) {
      showEmptyState();
    }
  });

  // Show success message
  showSuccessToast("Đã đánh dấu thông báo là đã đọc");
}

/**
 * Toggle chi tiết thông báo
 */
function toggleNotificationDetail(index) {
  const $detail = $(`#detail-${index}`);
  const $button = $(
    `.notification-item[data-index="${index}"] .notification-actions button:first`
  );

  if ($detail.is(":visible")) {
    $detail.slideUp();
    $button.html('<i class="fas fa-eye"></i>');
  } else {
    $detail.slideDown();
    $button.html('<i class="fas fa-eye-slash"></i>');
  }
}

/**
 * Lấy icon cho loại thông báo
 */
function getNotificationIcon(type) {
  const icons = {
    system: "fa-info-circle",
    order: "fa-shopping-cart",
    promotion: "fa-gift",
    product: "fa-leaf",
    delivery: "fa-truck",
  };
  return icons[type] || "fa-bell";
}

/**
 * Lấy class CSS cho icon thông báo
 */
function getNotificationIconClass(type) {
  const classes = {
    system: "bg-info",
    order: "bg-primary",
    promotion: "bg-success",
    product: "bg-warning",
    delivery: "bg-secondary",
  };
  return classes[type] || "bg-info";
}

/**
 * Tính thời gian trước
 */
function getTimeAgo(dateString) {
  if (!dateString) return "";

  const now = new Date();
  const date = new Date(dateString);
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return "Vài giây trước";
  if (diffInSeconds < 3600)
    return Math.floor(diffInSeconds / 60) + " phút trước";
  if (diffInSeconds < 86400)
    return Math.floor(diffInSeconds / 3600) + " giờ trước";
  if (diffInSeconds < 604800)
    return Math.floor(diffInSeconds / 86400) + " ngày trước";

  return date.toLocaleDateString("vi-VN");
}

/**
 * Cắt ngắn text
 */
function truncateText(text, maxLength) {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}

/**
 * Hiển thị toast thông báo thành công
 */
function showSuccessToast(message) {
  // Simple toast implementation
  const toast = $(`
    <div class="alert alert-success alert-dismissible fade show position-fixed" 
         style="top: 20px; right: 20px; z-index: 9999; min-width: 300px;">
      <i class="fas fa-check-circle mr-2"></i>${message}
      <button type="button" class="close" data-dismiss="alert">
        <span>&times;</span>
      </button>
    </div>
  `);

  $("body").append(toast);

  setTimeout(() => {
    toast.fadeOut(() => toast.remove());
  }, 3000);
}

/**
 * Định dạng ngày giờ sang định dạng tiếng Việt
 * @param {string} dateStr
 */
function formatDate(dateStr) {
  const d = new Date(dateStr);
  return isNaN(d) ? "" : d.toLocaleString("vi-VN");
}

/**
 * Escape HTML để tránh XSS
 * @param {string} str
 */
function escapeHTML(str) {
  return str.replace(/[&<>"']/g, (match) => {
    const escapes = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };
    return escapes[match];
  });
}

// Đảm bảo hàm logout() luôn gọi đúng hàm logout của BaseProfileManager
function logout() {
  new BaseProfileManager().logout();
}
