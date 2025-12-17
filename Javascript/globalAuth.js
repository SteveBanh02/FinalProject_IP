$(document).ready(function () {
  // Update account link based on authentication status
  // Get current user from localStorage
  const user = JSON.parse(localStorage.getItem("MyCanadaDeals_user"));

  const accountLink = $(".account a");
  const accountText = $(".account span");

  if (user) {
    accountLink.attr("href", "UserPage.html");
    accountText.text(user.name || user.email.split("@")[0]);
  } else {
    accountLink.attr("href", "LoginPage.html");
    accountText.text("Sign In");
  }
});
