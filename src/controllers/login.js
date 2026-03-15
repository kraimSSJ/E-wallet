import finduserbymail from '../models/database.js';

const $ = (id) => document.getElementById(id);

const affihcheError = (msg) => {
  const el = $("error");
  el.textContent    = msg;
  el.style.color    = "red";
  el.style.display  = "block";
  el.style.fontSize = "0.9rem";
  el.style.marginBottom = "10px";
};

$("display").addEventListener("click", () => {
  const hidden = $("password").type === "password";
  $("password").type       = hidden ? "text" : "password";
  $("display").textContent = hidden ? "🙈" : "👁";
});

$("submitbtn").addEventListener("click", () => {
  const email    = $("mail").value.trim();
  const password = $("password").value.trim();

  if (!email || !password) {
    affihcheError("Veuillez remplir tous les champs.");
    return;
  }

  const user = finduserbymail(email, password);

  if (!user) {
   affihcheError("Email ou mot de passe incorrect.");
    $("password").value = "";
    $("password").focus();
    return;
  }

  sessionStorage.setItem("currentUser", JSON.stringify(user));
  window.location.href = "/src/view/dashboard.html";
});