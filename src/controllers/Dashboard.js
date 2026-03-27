import { database, getbeneficiaries, finduserbyaccount, findbeneficiarieByid } from "../models/database.js";

const user = JSON.parse(sessionStorage.getItem("currentUser"));

// ======================= GUARD ======================= //
if (!user) {
  
  window.location.href = "/index.html";
}

// ======================= DOM ======================= //
const greetingName = document.getElementById("greetingName");
const currentDate = document.getElementById("currentDate");
const solde = document.getElementById("availableBalance");
const incomeElement = document.getElementById("monthlyIncome");
const expensesElement = document.getElementById("monthlyExpenses");
const activecards = document.getElementById("activeCards");
const transactionsList = document.getElementById("recentTransactionsList");

const transferBtn = document.getElementById("quickTransfer");
const transferSection = document.getElementById("transferPopup");
const closeTransferBtn = document.getElementById("closeTransferBtn");
const cancelTransferBtn = document.getElementById("cancelTransferBtn");

const beneficiarySelect = document.getElementById("beneficiary");
const sourceCard = document.getElementById("sourceCard");
const submitTransferBtn = document.getElementById("submitTransferBtn");

const topupBtn = document.getElementById("quickTopup");
const topupSection = document.getElementById("topupPopup");
const closeTopupBtn = document.getElementById("closeTopupBtn");
const cancelTopupBtn = document.getElementById("cancelTopupBtn");
const submitTopupBtn = document.getElementById("submitTopupBtn");
const topupCard = document.getElementById("topupCard");

// ======================= EVENTS ======================= //
transferBtn.addEventListener("click", openTransfer);
closeTransferBtn.addEventListener("click", closeTransfer);
cancelTransferBtn.addEventListener("click", closeTransfer);
submitTransferBtn.addEventListener("click", handleTransfer);

topupBtn.addEventListener("click", openTopup);
closeTopupBtn.addEventListener("click", closeTopup);
cancelTopupBtn.addEventListener("click", closeTopup);
submitTopupBtn.addEventListener("click", handleTopup);
// ======================= DASHBOARD ======================= //
function getDashboardData() {
  const monthlyIncome = user.wallet.transactions
    .filter(t => t.type === "credit")
    .reduce((total, t) => total + t.amount, 0);

  const monthlyExpenses = user.wallet.transactions
    .filter(t => t.type === "debit")
    .reduce((total, t) => total + t.amount, 0);

  return {
    userName: user.name,
    currentDate: new Date().toLocaleDateString("fr-FR"),
    balance: `${user.wallet.balance} ${user.wallet.currency}`,
    cards: user.wallet.cards.length,
    income: `${monthlyIncome} MAD`,
    expenses: `${monthlyExpenses} MAD`,
  };
}

function renderDashboard() {
  const data = getDashboardData();

  greetingName.textContent = data.userName;
  currentDate.textContent = data.currentDate;
  solde.textContent = data.balance;
  incomeElement.textContent = data.income;
  expensesElement.textContent = data.expenses;
  activecards.textContent = data.cards;

  transactionsList.innerHTML = "";

  user.wallet.transactions.forEach(t => {
    const div = document.createElement("div");
    div.className = "transaction-item";
    div.innerHTML = `
      <div>${t.date}</div>
      <div>${t.amount} MAD</div>
      <div>${t.type}</div>
    `;
    transactionsList.appendChild(div);
  });
}

renderDashboard();

// ======================= POPUP ======================= //
function openTransfer() {
  transferSection.style.display = "block";
  document.body.classList.add("popup-open");
}

function closeTransfer() {
  transferSection.style.display = "none";
  document.body.classList.remove("popup-open");
}
function openTopup() {
  topupSection.style.display = "block";
  document.body.classList.add("popup-open");
}

function closeTopup() {
  topupSection.style.display = "none";
  document.body.classList.remove("popup-open");
}
// ======================= DATA LOAD ======================= //
function renderBeneficiaries() {
  const beneficiaries = getbeneficiaries(user.id);

  beneficiaries.forEach(b => {
    const option = document.createElement("option");
    option.value = b.id;
    option.textContent = b.name;
    beneficiarySelect.appendChild(option);
  });
}

function renderCards() {
  user.wallet.cards.forEach(card => {
    const option = document.createElement("option");
    option.value = card.numcards;
    option.textContent = `${card.type} **** ${card.numcards}`;
    sourceCard.appendChild(option);
  });
}

function renderTopupCards() {
  user.wallet.cards.forEach(card => {
    const option = document.createElement("option");
    option.value = card.numcards;
    option.textContent = `${card.type} **** ${card.numcards}`;
    topupCard.appendChild(option);
  });
}

renderTopupCards();

renderBeneficiaries();
renderCards();

// ======================= ASYNC HELPERS ======================= //
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function checkUser(userId) {
  await delay(500);
  const beneficiary = database.users.find(u => u.id === userId);
  if (!beneficiary) throw "Beneficiary not found";
  return beneficiary;
}
async function checkBalance(expediteur, amount) {
  await delay(500);
  if (expediteur.wallet.balance < amount) {
    throw "Insufficient balance";
  }
}

async function updateBalance(expediteur, destinataire, amount) {
  await delay(200);
  expediteur.wallet.balance -= amount;
  destinataire.wallet.balance += amount;
}

async function addTransactions(expediteur, destinataire, amount) {
  await delay(300);

  const now = Date.now();

  const debit = {
    id: now,
    type: "debit",
    amount,
    date: new Date().toLocaleString(),
    to: destinataire.name
  };

  const credit = {
    id: now + 1,
    type: "credit",
    amount,
    date: new Date().toLocaleString(),
    from: expediteur.name
  };

  expediteur.wallet.transactions.push(debit);
  destinataire.wallet.transactions.push(credit);
}

// ======================= MAIN TRANSFER ======================= //
async function transfer(expediteur, account, amount) {
  try {
    console.log("Starting transfer...");

    const destinataire = await checkUser(account);
    console.log("Step 1: User found");

    await checkBalance(expediteur, amount);
    console.log("Step 2: Balance OK");

    await updateBalance(expediteur, destinataire, amount);
    console.log("Step 3: Balance updated");

    await addTransactions(expediteur, destinataire, amount);
    console.log("Step 4: Transactions added");

    sessionStorage.setItem("currentUser", JSON.stringify(expediteur));
sessionStorage.setItem(`user_${destinataire.id}`, JSON.stringify(destinataire));

    renderDashboard();
    closeTransfer();

    

  } catch (error) {
    console.error(error);
    
  }
}

// ======================= HANDLER ======================= //
function handleTransfer(e) {
  e.preventDefault();

  const beneficiaryId = beneficiarySelect.value;
  const beneficiaryData = findbeneficiarieByid(user.id, beneficiaryId);

  if (!beneficiaryData) {
    
    return;
  }

  const amount = Number(document.getElementById("amount").value);

  if (amount <= 0 || isNaN(amount)) {
    
    return;
  }

  transfer(user, beneficiaryData.id, amount);

}
// ======================= RECHARGE ======================= //
function validateAmount(amount) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (!amount || isNaN(amount) || amount <= 0) {
        reject("Montant invalide : doit être supérieur à zéro.");
      } else if (amount < 10) {
        reject("Montant minimum : 10 MAD.");
      } else if (amount > 10000) {
        reject("Montant maximum : 10 000 MAD.");
      } else {
        resolve(amount);
      }
    }, 300);
  });
}

function validateCard(numcards) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const card = user.wallet.cards.find(c => c.numcards === numcards);
      if (!card) {
        reject("Moyen de paiement introuvable.");
        return;
      }
      const [day, month, year] = card.expiry.split("-").map(Number);
      const expiry = new Date(2000 + year, month - 1, day);
      if (expiry < new Date()) {
        reject("Cette carte est expirée.");
        return;
      }
      resolve(card);
    }, 400);
  });
}

function processRecharge(amount) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        user.wallet.balance += amount;
        const transaction = {
          id: Date.now(),
          type: "recharge",
          amount,
          date: new Date().toLocaleString(),
          status: "success"
        };
        user.wallet.transactions.push(transaction);
        sessionStorage.setItem("currentUser", JSON.stringify(user));
        resolve(transaction);
      } catch (e) {
        user.wallet.transactions.push({
          id: Date.now(),
          type: "recharge",
          amount,
          date: new Date().toLocaleString(),
          status: "failed"
        });
        reject("Échec du rechargement.");
      }
    }, 500);
  });
}

async function recharge(numcards, amount) {
  try {
    await validateAmount(amount);
    await validateCard(numcards);
    await processRecharge(amount);
    renderDashboard();
    closeTopup();
    alert("succes ");
    
  } catch (error) {
    
  }
}

function handleTopup(e) {
  e.preventDefault();
  const numcards = topupCard.value;
  const amount = Number(document.getElementById("topupAmount").value);
  recharge(numcards, amount);
}
