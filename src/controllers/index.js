document.addEventListener("DOMContentLoaded", () => {
  const loginBtn  = document.getElementById("Loginbtn");
  const signinBtn = document.getElementById("Signinbtn");

  loginBtn.addEventListener("click", () => {
    window.location.href = "login.html";
  });

  signinBtn.addEventListener("click", () => {
    window.location.href = "signin.html";
  });
});