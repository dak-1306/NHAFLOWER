// sidebar-loader.js: Tự động load sidebar-profile.html vào #sidebar-container trên các trang profile

$(function () {
  $("#sidebar-container").load("sidebar-profile.html", function () {
    // Sau khi sidebar được load, lấy dữ liệu user thật từ API
    const userLocal = JSON.parse(
      localStorage.getItem("nhaflower_user") || "null"
    );
    const baseManager = new BaseProfileManager();
    if (userLocal && userLocal.id_taikhoan) {
      $.ajax({
        url: `/NHAFLOWER/auth/profile.php?id_taikhoan=${userLocal.id_taikhoan}`,
        method: "GET",
        dataType: "json",
        success: function (res) {
          if (res.success && res.data) {
            baseManager.updateSidebarInfo(res.data);
          } else {
            baseManager.updateSidebarInfo(userLocal);
          }
        },
        error: function () {
          baseManager.updateSidebarInfo(userLocal);
        },
      });
    } else {
      baseManager.updateSidebarInfo(userLocal);
    }
  });
});
