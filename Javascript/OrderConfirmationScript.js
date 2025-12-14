$(document).ready(function () {
  loadOrderData();
  updateCartCount();
});

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

  // Display pricing
  $("#subtotal").text(`$${order.subtotal.toFixed(2)}`);
  $("#subtotal-display").text(`$${order.subtotal.toFixed(2)}`);
  $("#shipping-cost").text(`$${order.shipping.toFixed(2)}`);
  $("#shipping-display").text(`$${order.shipping.toFixed(2)}`);
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

// Get shipping method display name
function getShippingMethodName(method) {
  const methods = {
    standard: "Standard Shipping",
    express: "Express Shipping",
    overnight: "Overnight Shipping",
  };
  return methods[method] || "Standard Shipping";
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
