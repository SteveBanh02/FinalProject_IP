$(document).ready(function () {
  const user = JSON.parse(localStorage.getItem("lumina_user"));

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
