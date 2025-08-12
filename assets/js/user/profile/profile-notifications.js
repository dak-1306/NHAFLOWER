// profile-notifications.js
// Hiển thị thông báo từ bảng thongbao (dữ liệu thật)

$(document).ready(function () {
  // Gọi API lấy danh sách thông báo
  $.ajax({
    url: "/api/thong_bao.php?action=get_notifications",
    method: "GET",
    dataType: "json",
    success: function (data) {
      renderNotifications(data.data || data);
    },
    error: function () {
      $("#notification-list").html(
        '<div class="empty-state">Không thể tải thông báo.</div>'
      );
    },
  });
});

function renderNotifications(list) {
  if (!list || !Array.isArray(list) || list.length === 0) {
    $("#notification-list").html(
      '<div class="empty-state">Không có thông báo nào.</div>'
    );
    return;
  }
  let html = "";
  list.forEach(function (item) {
    html += `<div class="notification-item${item.unread ? " unread" : ""}">
      <div class="notification-icon"><i class="fas fa-bell"></i></div>
      <div class="notification-content">
        <div class="notification-title">${item.tieu_de || ""}</div>
        <div class="notification-message">${item.noi_dung || ""}</div>
        <div class="notification-time">${
          item.ngay_gui ? formatDate(item.ngay_gui) : ""
        }</div>
      </div>
    </div>`;
  });
  $("#notification-list").html(html);
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleString("vi-VN");
}
