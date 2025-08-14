// profile-notifications.js
// Hiển thị thông báo từ bảng thongbao (dữ liệu thật)

$(document).ready(function () {
  const userData = JSON.parse(localStorage.getItem("nhaflower_user") || "null");
  const baseManager = new BaseProfileManager();

  baseManager.updateSidebarInfo(userData);
  loadNotifications();
});

/**
 * Gọi API lấy danh sách thông báo
 */
function loadNotifications() {
  const $list = $("#notification-list");

  // Hiển thị trạng thái loading
  $list.html('<div class="loading-state">Đang tải thông báo...</div>');

  $.ajax({
    url: "/api/thong_bao.php?action=get_notifications",
    method: "GET",
    dataType: "json",
    timeout: 8000,
    success: function (res) {
      if (res && (res.data || res).length) {
        renderNotifications(res.data || res);
      } else {
        $list.html('<div class="empty-state">Không có thông báo nào.</div>');
      }
    },
    error: function () {
      $list.html('<div class="empty-state">Không thể tải thông báo.</div>');
    },
  });
}

/**
 * Render danh sách thông báo ra HTML
 * @param {Array} list - Danh sách thông báo
 */
function renderNotifications(list) {
  const $list = $("#notification-list");

  if (!Array.isArray(list) || list.length === 0) {
    $list.html('<div class="empty-state">Không có thông báo nào.</div>');
    return;
  }

  const html = list
    .map((item) => {
      const unreadClass = item.unread ? " unread" : "";
      return `
        <div class="notification-item${unreadClass}">
          <div class="notification-icon"><i class="fas fa-bell"></i></div>
          <div class="notification-content">
            <div class="notification-title">${escapeHTML(
              item.tieu_de || ""
            )}</div>
            <div class="notification-message">${escapeHTML(
              item.noi_dung || ""
            )}</div>
            <div class="notification-time">${
              item.ngay_gui ? formatDate(item.ngay_gui) : ""
            }</div>
          </div>
        </div>
      `;
    })
    .join("");

  $list.html(html);
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
