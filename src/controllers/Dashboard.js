import { database } from "../models/database.js";

// ── Auth ──────────────────────────────────────────────────────────────────────
const stored = sessionStorage.getItem("currentUser");
if (!stored) window.location.href = "login.html";

const user = JSON.parse(stored);
const { name, wallet } = user;
const { currency, cards, transactions } = wallet;

// ── Utils ─────────────────────────────────────────────────────────────────────
const $   = (id) => document.getElementById(id);
const fmt = (n)  => Number(n).toLocaleString("fr-MA", { minimumFractionDigits: 2 }) + " " + currency;

// ── Overview ──────────────────────────────────────────────────────────────────
$("greetingName").textContent     = name;
$("availableBalance").textContent = fmt(wallet.balance);
$("activeCards").textContent      = cards.length;
$("monthlyIncome").textContent    = fmt(transactions.filter(t => t.type === "credit").reduce((s, t) => s + t.amount, 0));
$("monthlyExpenses").textContent  = fmt(transactions.filter(t => t.type === "debit").reduce((s, t) => s + t.amount, 0));
$("currentDate").textContent      = new Date().toLocaleDateString("fr-MA", { weekday:"long", day:"numeric", month:"long", year:"numeric" });

// ── Transfer ────────────────────────────────────────────────────────────────
const beneficiary = $("beneficiary");
if (beneficiary) {
  beneficiary.innerHTML = `<option value="" disabled selected>Choisir un bénéficiaire</option>`
    + database.users.filter(u => u.name !== name).map(u => `<option value="${u.id}">${u.name}</option>`).join("");
}

const sourceCard = $("sourceCard");
if (sourceCard) {
  sourceCard.innerHTML = `<option value="" disabled selected>Sélectionner une carte</option>`
    + cards.map(c => `<option value="${c.numcards}">${c.type.toUpperCase()} **** ${c.numcards.slice(-4)}</option>`).join("");
}

$("quickTransfer")?.addEventListener("click", () => $("transfer-section").classList.remove("hidden"));
$("closeTransferBtn")?.addEventListener("click",  () => $("transfer-section").classList.add("hidden"));
$("cancelTransferBtn")?.addEventListener("click", () => $("transfer-section").classList.add("hidden"));

$("transferForm")?.addEventListener("submit", (e) => {
  e.preventDefault();
  const amount = Number($("amount").value);
  const error  = $("transferError");


  // Deduct from current user
  wallet.balance -= amount;
  $("availableBalance").textContent = fmt(wallet.balance);

  
  // Update sessionStorage
  sessionStorage.setItem("currentUser", JSON.stringify(user));


});




