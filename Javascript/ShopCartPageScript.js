let cart = [];
const shippingCost = 0.0; // Free shipping

$(document).ready(function () {
  loadCart();
  displayCart();
  updateCartCount();
  calculateTotals();

  // Apply discount button
  $("#apply-discount").on("click", applyDiscount);

  // Checkout button
  $("#checkout-btn").on("click", proceedToCheckout);
});

// Load cart from localStorage (persistent storage)
// This function ensures cart items persist across page reloads
function loadCart() {
  try {
    const savedCart = localStorage.getItem("lumina_cart");
    if (savedCart) {
      cart = JSON.parse(savedCart);
      console.log("Cart loaded successfully:", cart.length, "items");
    } else {
      console.log("No saved cart found, starting with empty cart");
      cart = [];
    }
  } catch (error) {
    console.error("Error loading cart:", error);
    cart = [];
  }
}

// Save cart to localStorage (persistent storage)
function saveCart() {
  try {
    localStorage.setItem("lumina_cart", JSON.stringify(cart));
    console.log("Cart saved:", cart);
  } catch (error) {
    console.error("Error saving cart:", error);
  }
}

// Check if user is logged in
function isUserLoggedIn() {
  try {
    const userData = localStorage.getItem("lumina_user");
    if (userData) {
      const user = JSON.parse(userData);
      // Check if user has required fields (email, name, etc.)
      return user && user.email && user.email.length > 0;
    }
    return false;
  } catch (error) {
    console.error("Error checking login status:", error);
    return false;
  }
}

// Update cart count in header
function updateCartCount() {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  $(".cart-count").text(totalItems);
}

// Display cart items
function displayCart() {
  const cartItemsList = $("#cart-items-list");
  const summaryItems = $("#summary-items");

  if (cart.length === 0) {
    cartItemsList.html(`
      <div class="empty-cart">
        <i class="fas fa-shopping-cart"></i>
        <h3>Your cart is empty</h3>
        <p>Add some items to get started!</p>
      </div>
    `);
    summaryItems.html(
      '<p style="text-align: center; color: #999;">No items</p>'
    );
    $("#checkout-btn").prop("disabled", true);
    return;
  }

  $("#checkout-btn").prop("disabled", false);

  // Display cart items
  cartItemsList.empty();
  cart.forEach((item, index) => {
    const itemHtml = `
      <div class="cart-item" data-index="${index}">
        <div class="item-image">
          <img src="${item.image}" alt="${item.name}" />
        </div>
        <div class="item-details">
          <div class="item-name">${item.name}</div>
          <div class="item-price">$${parseFloat(item.price).toFixed(2)}</div>
        </div>
        <div class="item-controls">
          <div class="quantity-controls">
            <button class="qty-btn qty-decrease" data-index="${index}">−</button>
            <span class="quantity-display">${item.quantity}</span>
            <button class="qty-btn qty-increase" data-index="${index}">+</button>
          </div>
          <button class="remove-btn" data-index="${index}">Remove</button>
        </div>
      </div>
    `;
    cartItemsList.append(itemHtml);
  });

  // Display summary items
  summaryItems.empty();
  cart.forEach((item) => {
    const summaryHtml = `
      <div class="summary-item">
        <div class="summary-item-image">
          <img src="${item.image}" alt="${item.name}" />
        </div>
        <div class="summary-item-details">
          <div class="summary-item-name">${item.name}</div>
          <div class="summary-item-desc">${item.category || "Product"}</div>
        </div>
        <div class="summary-item-price">$${parseFloat(item.price).toFixed(
          2
        )}</div>
      </div>
    `;
    summaryItems.append(summaryHtml);
  });

  // Attach event handlers
  attachEventHandlers();
}

// Attach event handlers to cart items
function attachEventHandlers() {
  // Quantity decrease
  $(".qty-decrease").on("click", function () {
    const index = $(this).data("index");
    decreaseQuantity(index);
  });

  // Quantity increase
  $(".qty-increase").on("click", function () {
    const index = $(this).data("index");
    increaseQuantity(index);
  });

  // Remove item
  $(".remove-btn").on("click", function () {
    const index = $(this).data("index");
    removeItem(index);
  });
}

// Decrease quantity
function decreaseQuantity(index) {
  if (cart[index].quantity > 1) {
    cart[index].quantity--;
    saveCart();
    displayCart();
    updateCartCount();
    calculateTotals();
  }
}

// Increase quantity
function increaseQuantity(index) {
  cart[index].quantity++;
  saveCart();
  displayCart();
  updateCartCount();
  calculateTotals();
}

// Remove item from cart
function removeItem(index) {
  cart.splice(index, 1);
  saveCart();
  displayCart();
  updateCartCount();
  calculateTotals();

  showNotification("Item removed from cart");
}

// Calculate totals
function calculateTotals() {
  const subtotal = cart.reduce((sum, item) => {
    return sum + parseFloat(item.price) * item.quantity;
  }, 0);

  const total = subtotal + shippingCost; // Will be same as subtotal since shipping is $0.00

  $("#subtotal").text(`${subtotal.toFixed(2)}`);
  $("#subtotal-display").text(`${subtotal.toFixed(2)}`);
  $("#shipping").text("FREE");
  $("#shipping-cost").text("FREE");
  $("#total").text(`${total.toFixed(2)}`);
}

// Apply discount code (mock functionality)
function applyDiscount() {
  const code = $("#discount-code").val().trim().toUpperCase();

  if (!code) {
    showNotification("Please enter a discount code", "error");
    return;
  }

  // Mock discount codes
  const validCodes = {
    SAVE10: 10,
    SAVE20: 20,
    FREESHIP: "free-shipping",
  };

  if (validCodes[code]) {
    if (validCodes[code] === "free-shipping") {
      showNotification("Free shipping applied!", "success");
    } else {
      showNotification(`${validCodes[code]}% discount applied!`, "success");
    }
    $("#discount-code").val("");
  } else {
    showNotification("Invalid discount code", "error");
  }
}

// Proceed to checkout - Only for registered users
function proceedToCheckout() {
  if (cart.length === 0) {
    showNotification("Your cart is empty", "error");
    return;
  }

  // Check if user is logged in
  if (!isUserLoggedIn()) {
    showNotification("Please sign in to proceed to checkout", "error");

    // Show login prompt with options
    showLoginPrompt();
    return;
  }

  // User is logged in, proceed to checkout
  window.location.href = "CheckoutPage.html";
}

// Show login prompt modal
function showLoginPrompt() {
  // Remove existing modal if any
  $(".login-modal-overlay").remove();

  const modalHtml = `
    <div class="login-modal-overlay">
      <div class="login-modal">
        <div class="modal-header">
          <h2>Sign In Required</h2>
          <button class="modal-close">&times;</button>
        </div>
        <div class="modal-body">
          <p>You need to be signed in to proceed to checkout.</p>
          <div class="modal-actions">
            <a href="LoginPage.html" class="btn-primary">Sign In</a>
            <a href="RegisterPage.html" class="btn-secondary">Create Account</a>
          </div>
        </div>
      </div>
    </div>
  `;

  $("body").append(modalHtml);

  // Add modal styles
  if (!$("#login-modal-style").length) {
    $("head").append(`
      <style id="login-modal-style">
        .login-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 9999;
          animation: fadeIn 0.3s ease-out;
        }
        
        .login-modal {
          background: white;
          border-radius: 12px;
          padding: 0;
          max-width: 450px;
          width: 90%;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
          animation: slideUp 0.3s ease-out;
        }
        
        .modal-header {
          padding: 25px 30px;
          border-bottom: 1px solid #e5e7eb;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .modal-header h2 {
          margin: 0;
          font-size: 24px;
          color: #1f2937;
        }
        
        .modal-close {
          background: none;
          border: none;
          font-size: 32px;
          color: #6b7280;
          cursor: pointer;
          line-height: 1;
          padding: 0;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .modal-close:hover {
          color: #1f2937;
        }
        
        .modal-body {
          padding: 30px;
        }
        
        .modal-body p {
          margin: 0 0 25px 0;
          font-size: 16px;
          color: #4b5563;
          text-align: center;
        }
        
        .modal-actions {
          display: flex;
          gap: 15px;
          flex-direction: column;
        }
        
        .btn-primary, .btn-secondary {
          padding: 14px 24px;
          border-radius: 8px;
          text-decoration: none;
          text-align: center;
          font-weight: 600;
          font-size: 16px;
          transition: all 0.3s ease;
          display: block;
        }
        
        .btn-primary {
          background-color: #2563eb;
          color: white;
          border: 2px solid #2563eb;
        }
        
        .btn-primary:hover {
          background-color: #1d4ed8;
          border-color: #1d4ed8;
        }
        
        .btn-secondary {
          background-color: white;
          color: #2563eb;
          border: 2px solid #2563eb;
        }
        
        .btn-secondary:hover {
          background-color: #eff6ff;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from {
            transform: translateY(50px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      </style>
    `);
  }

  // Close modal handlers
  $(".modal-close, .login-modal-overlay").on("click", function (e) {
    if (e.target === this) {
      $(".login-modal-overlay").fadeOut(300, function () {
        $(this).remove();
      });
    }
  });
}

// Show notification
function showNotification(message, type = "success") {
  // Remove existing notification
  $(".notification").remove();

  const bgColor = type === "success" ? "#22c55e" : "#ef4444";
  const icon = type === "success" ? "fa-check-circle" : "fa-exclamation-circle";

  const notification = $(`
    <div class="notification">
      <i class="fas ${icon}"></i>
      <span>${message}</span>
    </div>
  `);

  $("body").append(notification);

  // Add CSS if not exists
  if (!$("#notification-style").length) {
    $("head").append(`
      <style id="notification-style">
        .notification {
          position: fixed;
          top: 100px;
          right: 20px;
          background-color: ${bgColor};
          color: white;
          padding: 15px 25px;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          display: flex;
          align-items: center;
          gap: 10px;
          z-index: 1000;
          animation: slideIn 0.3s ease-out;
        }
        
        @keyframes slideIn {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        .notification i {
          font-size: 20px;
        }
      </style>
    `);
  } else {
    $(".notification").css("background-color", bgColor);
  }

  // Auto remove after 3 seconds
  setTimeout(() => {
    notification.fadeOut(300, function () {
      $(this).remove();
    });
  }, 3000);
}
