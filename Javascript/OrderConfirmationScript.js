$(document).ready(function () {
  loadOrderData();
  updateCartCount();
  initializeSearch(); // Initialize search functionality
});

// SEARCH FUNCTIONALITY
/**
 * Handle search input and redirect to product list page with search query
 */
function handleSearch() {
  const searchInput = $("#search-input");
  const searchQuery = searchInput.val().trim(); // Get trimmed search query

  // Only proceed if search query is not empty
  if (searchQuery) {
    // Redirect to ListProduct page with search query parameter
    window.location.href = `ListProduct.html?search=${encodeURIComponent(
      searchQuery
    )}`;
  }
}

/**
 * Set up search bar event listeners
 */
function initializeSearch() {
  const searchInput = $("#search-input");

  // Handle Enter key press in search input
  searchInput.on("keypress", function (e) {
    // Check if Enter key (key code 13) is pressed
    if (e.which === 13) {
      // Enter key
      e.preventDefault();
      handleSearch();
    }
  });
}

// Load order data from localStorage
function loadOrderData() {
  try {
    const orderData = localStorage.getItem("lumina_order");

    if (!orderData) {
      // No order found, redirect to home
      showNoOrderMessage();
      return;
    }

    const order = JSON.parse(orderData);
    displayOrderConfirmation(order);
  } catch (error) {
    console.error("Error loading order data:", error);
    showNoOrderMessage();
  }
}

// Display order confirmation
function displayOrderConfirmation(order) {
  // Generate order number
  const orderNumber = generateOrderNumber();
  $("#order-number").text(orderNumber);

  // Display shipping information
  $("#shipping-email").text(order.email || "N/A");
  $("#shipping-phone").text(order.phone || "N/A");
  $("#shipping-address").text(order.address || "N/A");
  $("#shipping-city").text(order.city || "N/A");

  // Display cart items
  displayCartItems(order.cart);

  // Display pricing with FREE shipping
  $("#subtotal").text(`$${order.subtotal.toFixed(2)}`);
  $("#subtotal-display").text(`$${order.subtotal.toFixed(2)}`);

  // Display shipping as FREE
  if (order.shipping === 0 || order.shipping === 0.0) {
    $("#shipping-cost").text("FREE");
    $("#shipping-display").text("FREE");
  } else {
    // Fallback in case old orders had shipping cost
    $("#shipping-cost").text(`$${order.shipping.toFixed(2)}`);
    $("#shipping-display").text(`$${order.shipping.toFixed(2)}`);
  }

  $("#total").text(`$${order.total.toFixed(2)}`);

  // Display shipping method name
  const shippingMethodName = getShippingMethodName(order.shippingMethod);
  $("#shipping-method-name").text(shippingMethodName);

  // Send confirmation email (mock)
  sendConfirmationEmail(order, orderNumber);
}

// Display cart items in order summary
function displayCartItems(cart) {
  const cartContainer = $("#cart-items");

  if (!cart || cart.length === 0) {
    cartContainer.html(
      '<p style="text-align: center; color: #999;">No items</p>'
    );
    return;
  }

  cartContainer.empty();
  cart.forEach((item) => {
    const itemHtml = `
      <div class="cart-item">
        <div class="item-image">
          <img src="${item.image}" alt="${item.name}" />
        </div>
        <div class="item-details">
          <div class="item-name">${item.name}</div>
          <div class="item-description">${item.category || "Product"}</div>
          <div class="item-price">$${parseFloat(item.price).toFixed(2)}</div>
        </div>
      </div>
    `;
    cartContainer.append(itemHtml);
  });
}

// Generate mock order number
function generateOrderNumber() {
  const prefix = "LUMINA";
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `#${prefix}${timestamp.toString().slice(-5)}${random
    .toString()
    .padStart(4, "0")}`;
}

// Get shipping method display name (all are free now)
function getShippingMethodName(method) {
  const methods = {
    standard: "Standard Shipping (FREE)",
    express: "Express Shipping (FREE)",
    overnight: "Overnight Shipping (FREE)",
  };
  return methods[method] || "Standard Shipping (FREE)";
}

// Mock send confirmation email
function sendConfirmationEmail(order, orderNumber) {
  console.log("Confirmation email sent to:", order.email);
  console.log("Order Number:", orderNumber);
  console.log("Order Details:", order);
}

// Show "no order" message
function showNoOrderMessage() {
  $(".confirmation-details").html(`
    <div class="success-header" style="text-align: center;">
      <div class="success-icon" style="background: #ef4444; margin: 0 auto;">
        <i class="fas fa-times"></i>
      </div>
      <h1 class="confirmation-title">No Order Found</h1>
      <p class="confirmation-message">
        We couldn't find any order information. Please complete your checkout first.
      </p>
      <div style="margin-top: 30px;">
        <a href="HomePage.html" class="btn-primary" style="display: inline-block;">Return to Home</a>
      </div>
    </div>
  `);

  $(".order-summary").html(`
    <h2 class="section-title">Order Summary</h2>
    <p style="text-align: center; color: #999; padding: 40px 0;">No items to display</p>
  `);
}

// Update cart count (should be 0 after order)
function updateCartCount() {
  $(".cart-count").text("0");
}

// Clear order data when leaving page (optional)
$(window).on("beforeunload", function () {
  // Optionally clear order data after viewing confirmation
  // localStorage.removeItem('lumina_order');
});
