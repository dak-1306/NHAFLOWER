// Filter functionality
document.addEventListener("DOMContentLoaded", function () {
  const filterBtns = document.querySelectorAll(".filter-btn");
  const productCards = document.querySelectorAll(".product-card");

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", function () {
      // Remove active class from all buttons
      filterBtns.forEach((b) => b.classList.remove("active"));
      // Add active class to clicked button
      this.classList.add("active");

      const category = this.getAttribute("data-category");

      // Filter products
      productCards.forEach((card) => {
        if (
          category === "all" ||
          card.getAttribute("data-category") === category
        ) {
          card.style.display = "block";
        } else {
          card.style.display = "none";
        }
      });
    });
  });

  // Add hover effect for product cards
  productCards.forEach((card) => {
    card.style.cursor = "pointer";
    card.addEventListener("mouseenter", function () {
      this.style.transform = "translateY(-5px)";
      this.style.boxShadow = "0 10px 25px rgba(139, 90, 150, 0.15)";
    });

    card.addEventListener("mouseleave", function () {
      this.style.transform = "translateY(0)";
      this.style.boxShadow = "none";
    });
  });
});

// Navigate to product detail page
function goToProductDetail(productId) {
  window.location.href = `detail_product.html?id=${productId}`;
}

// Add to cart from list page
function addToCartFromList(productId) {
  // Prevent navigation when clicking add to cart button
  event.stopPropagation();

  // Get product info
  const productCard = event.target.closest(".product-card");
  const productName = productCard.querySelector(".product-name").textContent;
  const productPrice = productCard.querySelector(".product-price").textContent;

  // Add to cart logic here
  console.log(`Adding product ${productId} to cart:`, {
    id: productId,
    name: productName,
    price: productPrice,
  });

  // Show success message
  showSuccessNotification(`Đã thêm "${productName}" vào giỏ hàng!`);
}

// Show success notification
function showSuccessNotification(message) {
  // Create notification element
  const notification = document.createElement("div");
  notification.className = "alert alert-success position-fixed";
  notification.style.cssText = `
    top: 100px; 
    right: 20px; 
    z-index: 9999; 
    min-width: 300px;
    opacity: 0;
    transition: opacity 0.3s ease;
  `;
  notification.innerHTML = `
    <i class="fas fa-check-circle"></i> ${message}
    <button type="button" class="close" onclick="this.parentElement.remove()">
      <span>&times;</span>
    </button>
  `;

  // Add to page
  document.body.appendChild(notification);

  // Show with animation
  setTimeout(() => {
    notification.style.opacity = "1";
  }, 100);

  // Auto remove after 3 seconds
  setTimeout(() => {
    notification.style.opacity = "0";
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 300);
  }, 3000);
}

// Header navigation functions
function showSearchModal() {
  const searchTerm = prompt("Tìm kiếm sản phẩm:");
  if (searchTerm) {
    const productCards = document.querySelectorAll(".product-card");
    const filterBtns = document.querySelectorAll(".filter-btn");

    productCards.forEach((card) => {
      const productName = card
        .querySelector(".product-name")
        .textContent.toLowerCase();
      if (productName.includes(searchTerm.toLowerCase())) {
        card.style.display = "block";
      } else {
        card.style.display = "none";
      }
    });

    // Update filter buttons
    filterBtns.forEach((b) => b.classList.remove("active"));
  }
}

function showUserProfile() {
  alert("Chuyển đến trang thông tin cá nhân");
  // Sau này có thể redirect đến profile.html
  // window.location.href = "profile.html";
}

function showCart() {
  alert("Chuyển đến giỏ hàng");
  // Sau này có thể redirect đến cart.html
  // window.location.href = "cart.html";
}

function showCategories() {
  alert("Hiển thị danh mục sản phẩm");
}
