// -----------------------------
// Global state
// -----------------------------
let currentUser = null;
// false = SIGN UP (Get Started), true = LOGIN (Sign In)
let isLoginMode = false;

// Charts
let volumeChart = null;
let currencyChart = null;
let historyChart = null;

// -----------------------------
// DOM elements
// -----------------------------
const authSection = document.getElementById("auth-section");
const appSection = document.getElementById("app-section");

const authForm = document.getElementById("auth-form");
const loginBtn = document.getElementById("login-btn");
const signupBtn = document.getElementById("signup-btn");
const logoutBtn = document.getElementById("logout-btn");
const userMenu = document.getElementById("user-menu");
const userAvatar = document.getElementById("user-avatar");
const toggleAuth = document.getElementById("toggle-auth");
const authTitle = document.getElementById("auth-title");
const authSubmit = document.getElementById("auth-submit");
const toggleText = document.getElementById("toggle-text");

const transferForm = document.getElementById("transfer-form");
const balanceSpan = document.getElementById("balance");
const txCountSpan = document.getElementById("tx-count");
const transactionList = document.getElementById("transaction-list");
const totalAmountSpan = document.getElementById("total-amount");
const totalAmountDisplaySpan = document.getElementById("total-amount-display");

// Exchange rate DOM
const fromCurrencySelect = document.getElementById("from-currency");
const toCurrencySelect = document.getElementById("to-currency");
const amountInput = document.getElementById("amount");
const exchangeRateSpan = document.getElementById("exchange-rate");
const sendAmountSpan = document.getElementById("send-amount");
const receiveAmountSpan = document.getElementById("receive-amount");

// Confirmation modal DOM
const confirmationModal = document.getElementById("confirmation-modal");
const confirmFromCurrencySpan =
  document.getElementById("confirm-from-currency");
const confirmToCurrencySpan = document.getElementById("confirm-to-currency");
const confirmSendAmountSpan = document.getElementById("confirm-send-amount");
const confirmReceiveAmountSpan =
  document.getElementById("confirm-receive-amount");
const confirmRateSpan = document.getElementById("confirm-rate");
const confirmAddressSpan = document.getElementById("confirm-address");
const confirmTotalSpan = document.getElementById("confirm-total");
const confirmTransferBtn = document.getElementById("confirm-transfer-btn");
const cancelTransferBtn = document.getElementById("cancel-transfer-btn");
const closeConfirmationModalBtn = document.getElementById(
  "close-confirmation-modal"
);

const notificationEl = document.getElementById("notification");

// Blockchain-related buttons
const walletConnectBtn = document.getElementById("wallet-connect-btn");

// Exchange breakdown DOM
const step1LocalAmount = document.getElementById("step1-local-amount");
const step1LocalFee = document.getElementById("step1-local-fee");
const step1LocalCodeSpan = document.getElementById("step1-local-code");
const step1Label = document.getElementById("step1-label");
const step2CryptoAmount = document.getElementById("step2-crypto-amount");
const step2CryptoFee = document.getElementById("step2-crypto-fee");
const step3NetworkFee = document.getElementById("step3-network-fee");
const step4RecAmount = document.getElementById("step4-rec-amount");
const step4PlatformFee = document.getElementById("step4-platform-fee");
const step4Buffer = document.getElementById("step4-buffer");

// -----------------------------
// Firebase handles (from firebase-config.js)
// -----------------------------
const app = firebase.app();
const auth = firebase.auth();
const db = firebase.firestore();

// -----------------------------
// Exchange rates
// -----------------------------
let exchangeRates = {};
let ratesLastUpdated = null;

const SUPPORTED_CURRENCIES = ["USD", "EUR", "GBP", "JPY", "CAD", "MXN", "DOP"];

async function fetchExchangeRates() {
  try {
    const response = await fetch(
      "https://api.exchangerate-api.com/v4/latest/USD"
    );
    const data = await response.json();
    const rates = data.rates;

    // Add DOP for demo if missing
    if (!rates.DOP) {
      rates.DOP = 60.0;
    }

    exchangeRates = {};
    SUPPORTED_CURRENCIES.forEach((from) => {
      exchangeRates[from] = {};
      SUPPORTED_CURRENCIES.forEach((to) => {
        if (from === to) {
          exchangeRates[from][to] = 1;
        } else {
          const fromToUsd = 1 / rates[from];
          const usdToTo = rates[to];
          exchangeRates[from][to] = fromToUsd * usdToTo;
        }
      });
    });

    ratesLastUpdated = new Date();
    console.log("Exchange rates updated:", ratesLastUpdated);
    return true;
  } catch (error) {
    console.error("Error fetching exchange rates:", error);

    // Minimal fallback if nothing
    if (Object.keys(exchangeRates).length === 0) {
      exchangeRates = {
        USD: {
          EUR: 0.92,
          GBP: 0.79,
          JPY: 149.5,
          CAD: 1.36,
          MXN: 17.2,
          DOP: 60.0,
          USD: 1,
        },
      };
      SUPPORTED_CURRENCIES.forEach((cur) => {
        if (!exchangeRates[cur]) {
          exchangeRates[cur] = {};
        }
        SUPPORTED_CURRENCIES.forEach((to) => {
          if (cur === to) {
            exchangeRates[cur][to] = 1;
          } else if (
            exchangeRates[cur] &&
            typeof exchangeRates[cur][to] === "number"
          ) {
            // already set
          } else if (exchangeRates.USD && exchangeRates.USD[to]) {
            const fromToUsd =
              cur === "USD" ? 1 : 1 / (exchangeRates.USD[cur] || 1);
            const usdToTo = exchangeRates.USD[to];
            exchangeRates[cur][to] = fromToUsd * usdToTo;
          }
        });
      });
    }
    return false;
  }
}

// Periodic refresh
setInterval(fetchExchangeRates, 10 * 60 * 1000);
fetchExchangeRates();

// -----------------------------
// Auth state observer
// -----------------------------
auth.onAuthStateChanged((user) => {
  if (user) {
    currentUser = user;
    showApp();
    loadUserData();
    loadTransactions();
  } else {
    currentUser = null;
    showAuth();
  }
});

// -----------------------------
// UI Helpers
// -----------------------------
function showAuth() {
  authSection.style.display = "flex";
  appSection.style.display = "none";
  loginBtn.style.display = "inline-block";
  signupBtn.style.display = "inline-block";
  userMenu.style.display = "none";
}

function showApp() {
  authSection.style.display = "none";
  appSection.style.display = "block";
  loginBtn.style.display = "none";
  signupBtn.style.display = "none";
  userMenu.style.display = "flex";
}

function showNotification(message, type = "success") {
  if (!notificationEl) return;
  notificationEl.textContent = message;
  notificationEl.className = "notification show";
  if (type === "success") {
    notificationEl.classList.add("notification-success");
  } else {
    notificationEl.classList.add("notification-error");
  }
  setTimeout(() => {
    notificationEl.className = "notification";
  }, 3000);
}

// Toggle login/signup mode
function toggleAuthMode() {
  // Single source of truth for flipping the mode
  isLoginMode = !isLoginMode;

  if (isLoginMode) {
    // LOGIN mode
    authTitle.textContent = "Welcome Back";
    authSubmit.textContent = "Sign In";
    toggleText.textContent = "Don't have an account?";
    toggleAuth.textContent = "Get Started";
  } else {
    // SIGN UP mode
    authTitle.textContent = "Get Started";
    authSubmit.textContent = "Create Account";
    toggleText.textContent = "Already have an account?";
    toggleAuth.textContent = "Sign in";
  }
}

// -----------------------------
// Event listeners (auth)
// -----------------------------
loginBtn.addEventListener("click", () => {
  // If we’re not already in login mode, switch to it
  if (!isLoginMode) {
    toggleAuthMode();
  }
});

signupBtn.addEventListener("click", () => {
  // If we’re in login mode, switch back to signup
  if (isLoginMode) {
    toggleAuthMode();
  }
});

toggleAuth.addEventListener("click", (e) => {
  e.preventDefault();
  toggleAuthMode();
});

logoutBtn.addEventListener("click", async () => {
  try {
    await auth.signOut();
    console.log("User signed out");
  } catch (error) {
    console.error("Logout error:", error);
    showNotification("Error logging out: " + error.message, "error");
  }
});

// Auth form submit
authForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  const originalText = authSubmit.textContent;
  authSubmit.disabled = true;
  authSubmit.textContent = isLoginMode ? "Signing in..." : "Creating account...";
  authSubmit.style.opacity = "0.7";

  try {
    if (isLoginMode) {
      // LOGIN
      await auth.signInWithEmailAndPassword(email, password);
      console.log("User logged in");
    } else {
      // SIGN UP
      const userCredential = await auth.createUserWithEmailAndPassword(
        email,
        password
      );

      await db.collection("users").doc(userCredential.user.uid).set({
        email: email,
        balance: 1000.0, // demo starter balance
        currency: "USD",
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
      console.log("User signed up");
    }
    authForm.reset();
  } catch (error) {
    console.error("Auth error:", error);
    showNotification("Error: " + error.message, "error");
  } finally {
    authSubmit.disabled = false;
    authSubmit.textContent = originalText;
    authSubmit.style.opacity = "1";
  }
});

// -----------------------------
// Wallet connect (blockchain.js)
// -----------------------------
document.addEventListener("DOMContentLoaded", () => {
  if (walletConnectBtn) {
    walletConnectBtn.addEventListener("click", async () => {
      try {
        if (window.blockchainConnected) {
          await window.disconnectWallet();
        } else {
          await window.connectWallet();
        }
      } catch (err) {
        console.error("Wallet error:", err);
        showNotification("Wallet error: " + err.message, "error");
      }
    });
  }
});

// -----------------------------
// Transfer flow
// -----------------------------
transferForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!currentUser) {
    showNotification("Please login first", "error");
    return;
  }
  if (!validateTransferForm()) {
    return;
  }
  await showConfirmationModal();
});

function validateTransferForm() {
  const amount = parseFloat(amountInput.value);
  const recipientAddress = document
    .getElementById("recipient-address")
    .value.trim();

  if (!amount || amount <= 0) {
    showNotification("Please enter a valid amount.", "error");
    return false;
  }
  if (!recipientAddress) {
    showNotification("Please enter a recipient wallet address.", "error");
    return false;
  }
  return true;
}

async function showConfirmationModal() {
  const fromCurrency = fromCurrencySelect.value;
  const toCurrency = toCurrencySelect.value;
  const amount = parseFloat(amountInput.value);
  const recipientAddress = document
    .getElementById("recipient-address")
    .value.trim();

  await fetchExchangeRates();
  const rate = exchangeRates[fromCurrency]?.[toCurrency] || 1;
  const receiveAmount = amount * rate;
  const blockchainFee = 2.5;
  const total = amount + blockchainFee;

  confirmFromCurrencySpan.textContent = `${amount.toFixed(2)} ${fromCurrency}`;
  confirmToCurrencySpan.textContent = toCurrency;
  confirmSendAmountSpan.textContent = `${amount.toFixed(
    2
  )} ${fromCurrency}`;
  confirmReceiveAmountSpan.textContent = `${receiveAmount.toFixed(
    2
  )} ${toCurrency}`;
  confirmRateSpan.textContent = `1 ${fromCurrency} = ${rate.toFixed(
    4
  )} ${toCurrency}`;
  confirmAddressSpan.textContent = recipientAddress;
  confirmTotalSpan.textContent = `$${total.toFixed(2)} USD`;

  confirmationModal.style.display = "flex";
  document.body.style.overflow = "hidden";

  const originalText = confirmTransferBtn.textContent;
  confirmTransferBtn.onclick = async function () {
    confirmTransferBtn.disabled = true;
    confirmTransferBtn.textContent = "Processing...";
    try {
      const transaction = {
        userId: currentUser.uid,
        fromCurrency,
        toCurrency,
        sendAmount: amount,
        receiveAmount,
        exchangeRate: rate,
        recipientAddress,
        blockchainFee,
        status: "pending",
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        blockchainTxHash: "pending",
        blockchainNetwork: "ethereum-testnet",
      };

      const docRef = await db.collection("transactions").add(transaction);
      console.log("Transaction created:", docRef.id);

      const userRef = db.collection("users").doc(currentUser.uid);
      await userRef.update({
        balance: firebase.firestore.FieldValue.increment(
          -(amount + blockchainFee)
        ),
      });

      // Simulate blockchain confirmation
      setTimeout(async () => {
        await db.collection("transactions").doc(docRef.id).update({
          status: "completed",
          blockchainTxHash:
            "0x" + Math.random().toString(16).substring(2, 42),
          completedAt: firebase.firestore.FieldValue.serverTimestamp(),
        });
        showNotification("Transaction confirmed on blockchain!", "success");
        loadTransactions();
      }, 2500);

      transferForm.reset();
      updateExchangeCalculation();
      closeConfirmationModal();
      showNotification("Transfer initiated successfully!", "success");
      loadUserData();
      updateCharts();
    } catch (error) {
      console.error("Transfer error:", error);
      showNotification(
        "Error processing transfer: " + error.message,
        "error"
      );
    } finally {
      confirmTransferBtn.disabled = false;
      confirmTransferBtn.textContent = originalText;
    }
  };
}

function closeConfirmationModal() {
  confirmationModal.style.display = "none";
  document.body.style.overflow = "auto";
}

cancelTransferBtn.addEventListener("click", closeConfirmationModal);
closeConfirmationModalBtn.addEventListener("click", closeConfirmationModal);

// -----------------------------
// Exchange calculation + breakdown
// -----------------------------
async function updateExchangeCalculation() {
  const fromCurrency = fromCurrencySelect.value;
  const toCurrency = toCurrencySelect.value;
  const amount = parseFloat(amountInput.value) || 0;

  await fetchExchangeRates();
  const rate = exchangeRates[fromCurrency]?.[toCurrency] || 1;
  const receiveAmount = amount * rate;
  const blockchainFee = 2.5;
  const total = amount + blockchainFee;

  exchangeRateSpan.textContent = rate.toFixed(4);
  sendAmountSpan.textContent = `$${amount.toFixed(2)}`;
  receiveAmountSpan.textContent = receiveAmount.toFixed(2);
  totalAmountSpan.textContent = `$${total.toFixed(2)}`;
  totalAmountDisplaySpan.textContent = `$${total.toFixed(2)}`;

  updateTransferBreakdown();
}

// Multi-corridor demo breakdown
function updateTransferBreakdown() {
  const fromCurrency = fromCurrencySelect.value;
  const toCurrency = toCurrencySelect.value;
  const amount = parseFloat(amountInput.value) || 0;

  if (
    !step1LocalAmount ||
    !step2CryptoAmount ||
    !step3NetworkFee ||
    !step4RecAmount
  ) {
    return;
  }

  const corridors = [
    {
      id: "DOP-EUR",
      from: "DOP",
      to: "EUR",
      localCode: "DOP",
      localSymbol: "RD$",
      recipientSymbol: "€",
      demoRateLocalPer100Recipient: 7440, // 100 EUR -> 7,440 DOP
      demoBTCRateRecipient: 60000,
      labelDeposit: "You fund your Brisita balance in Dominican pesos.",
    },
    {
      id: "USD-EUR",
      from: "USD",
      to: "EUR",
      localCode: "USD",
      localSymbol: "$",
      recipientSymbol: "€",
      demoRateLocalPer100Recipient: 110, // 100 EUR -> 110 USD (demo)
      demoBTCRateRecipient: 60000,
      labelDeposit: "You fund your Brisita balance in US dollars.",
    },
    {
      id: "USD-DOP",
      from: "USD",
      to: "DOP",
      localCode: "USD",
      localSymbol: "$",
      recipientSymbol: "RD$",
      demoRateLocalPer100Recipient: 2, // 100 DOP -> ~2 USD (demo)
      demoBTCRateRecipient: 60000,
      labelDeposit: "You fund your Brisita balance in US dollars.",
    },
  ];

  const corridor = corridors.find(
    (c) => c.from === fromCurrency && c.to === toCurrency
  );

  if (!amount || !corridor) {
    step1LocalAmount.textContent = "RD$ 0.00";
    step1LocalFee.textContent = "RD$ 0.00";
    step2CryptoAmount.textContent = "0.00000000 BTC";
    step2CryptoFee.textContent = "€ 0.00";
    step3NetworkFee.textContent = "€ 0.00";
    step4RecAmount.textContent = "€ 0.00";
    step4PlatformFee.textContent = "€ 0.00";
    step4Buffer.textContent = "€ 0.00";
    if (step1LocalCodeSpan) step1LocalCodeSpan.textContent = "DOP";
    if (step1Label)
      step1Label.textContent =
        "You fund your Brisita balance in local currency.";
    return;
  }

  const thirdPartyFeePerStep = 1.0; // recipient currency
  const stepsCount = 3; // buy, transfer, sell
  const totalThirdPartyFees = thirdPartyFeePerStep * stepsCount;

  const platformFee = 2.0; // recipient currency
  const volatilityBufferPercent = 0.01;
  const buffer = amount * volatilityBufferPercent;

  const requiredRecipient =
    amount + totalThirdPartyFees + platformFee + buffer;

  const localPerUnitRecipient =
    corridor.demoRateLocalPer100Recipient / 100.0;
  const requiredLocal = requiredRecipient * localPerUnitRecipient;
  const cryptoAmount =
    requiredRecipient / corridor.demoBTCRateRecipient;

  step1LocalAmount.textContent = `${corridor.localSymbol} ${requiredLocal.toFixed(
    2
  )}`;
  step1LocalFee.textContent = `${corridor.localSymbol} 0.00`;

  step2CryptoAmount.textContent = `${cryptoAmount.toFixed(8)} BTC`;
  step2CryptoFee.textContent = `${corridor.recipientSymbol} ${thirdPartyFeePerStep.toFixed(
    2
  )}`;

  step3NetworkFee.textContent = `${corridor.recipientSymbol} ${thirdPartyFeePerStep.toFixed(
    2
  )}`;

  step4RecAmount.textContent = `${corridor.recipientSymbol} ${amount.toFixed(
    2
  )}`;
  step4PlatformFee.textContent = `${corridor.recipientSymbol} ${platformFee.toFixed(
    2
  )}`;
  step4Buffer.textContent = `${corridor.recipientSymbol} ${buffer.toFixed(
    2
  )}`;

  if (step1LocalCodeSpan) {
    step1LocalCodeSpan.textContent = corridor.localCode;
  }
  if (step1Label) {
    step1Label.textContent = corridor.labelDeposit;
  }
}

// Swap currencies
const swapBtn = document.getElementById("swap-currencies");
if (swapBtn) {
  swapBtn.addEventListener("click", () => {
    const from = fromCurrencySelect.value;
    const to = toCurrencySelect.value;
    fromCurrencySelect.value = to;
    toCurrencySelect.value = from;
    updateExchangeCalculation();
  });
}

// Recalculate when inputs change
fromCurrencySelect.addEventListener("change", updateExchangeCalculation);
toCurrencySelect.addEventListener("change", updateExchangeCalculation);
amountInput.addEventListener("input", updateExchangeCalculation);

// -----------------------------
// Load user data
// -----------------------------
async function loadUserData() {
  if (!currentUser) return;
  try {
    const userDoc = await db.collection("users").doc(currentUser.uid).get();
    if (userDoc.exists) {
      const userData = userDoc.data();
      const email = userData.email || "";
      userAvatar.textContent = email.charAt(0).toUpperCase();
      if (typeof userData.balance === "number") {
        balanceSpan.textContent = `$${userData.balance.toFixed(2)}`;
      } else {
        balanceSpan.textContent = "$0.00";
      }
    }
    if (!volumeChart) {
      initializeCharts();
    }
    updateCharts();
  } catch (error) {
    console.error("Error loading user data:", error);
  }
}

// -----------------------------
// Load transactions
// -----------------------------
async function loadTransactions() {
  if (!currentUser) return;
  try {
    const snapshot = await db
      .collection("transactions")
      .where("userId", "==", currentUser.uid)
      .orderBy("timestamp", "desc")
      .limit(10)
      .get();

    transactionList.innerHTML = "";

    if (snapshot.empty) {
      const li = document.createElement("li");
      li.className = "tx-empty";
      li.innerHTML = `
        <p>No transactions yet</p>
        <p class="tx-empty-sub">Your transfer history will appear here once you send money.</p>
      `;
      transactionList.appendChild(li);
      txCountSpan.textContent = "0";
      totalAmountSpan.textContent = "$0.00";
      return;
    }

    let count = 0;
    let totalSent = 0;

    snapshot.forEach((doc) => {
      const tx = doc.data();
      count++;
      totalSent += tx.sendAmount || 0;

      const li = document.createElement("li");
      li.className = "tx-item";
      li.innerHTML = `
        <div class="tx-meta">
          <span class="tx-amount">${tx.sendAmount.toFixed(
            2
          )} ${tx.fromCurrency} → ${tx.receiveAmount.toFixed(
        2
      )} ${tx.toCurrency}</span>
          <span class="tx-time">${
            tx.timestamp
              ? tx.timestamp.toDate().toLocaleString()
              : "Pending..."
          }</span>
        </div>
        <span class="tx-status ${tx.status}">${tx.status}</span>
      `;
      transactionList.appendChild(li);
    });

    txCountSpan.textContent = String(count);
    totalAmountSpan.textContent = `$${totalSent.toFixed(2)}`;
  } catch (error) {
    console.error("Error loading transactions:", error);
  }
}

// -----------------------------
// Charts (demo only)
// -----------------------------
function initializeCharts() {
  const volumeCtx = document.getElementById("volume-chart")?.getContext("2d");
  const currencyCtx =
    document.getElementById("currency-chart")?.getContext("2d");
  const historyCtx =
    document.getElementById("history-chart")?.getContext("2d");

  if (!volumeCtx || !currencyCtx || !historyCtx) return;

  volumeChart = new Chart(volumeCtx, {
    type: "bar",
    data: {
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      datasets: [
        {
          label: "Volume (USD)",
          data: [0, 0, 0, 0, 0, 0, 0],
        },
      ],
    },
    options: {
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { color: "#9ca3af" } },
        y: { ticks: { color: "#9ca3af" } },
      },
    },
  });

  currencyChart = new Chart(currencyCtx, {
    type: "doughnut",
    data: {
      labels: ["USD", "EUR", "Other"],
      datasets: [
        {
          data: [60, 25, 15],
        },
      ],
    },
    options: {
      plugins: {
        legend: {
          labels: { color: "#e5e7eb", font: { size: 10 } },
        },
      },
    },
  });

  historyChart = new Chart(historyCtx, {
    type: "line",
    data: {
      labels: ["T-4", "T-3", "T-2", "T-1", "Today"],
      datasets: [
        {
          label: "Transfers",
          data: [0, 0, 0, 0, 0],
          fill: false,
        },
      ],
    },
    options: {
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { color: "#9ca3af" } },
        y: { ticks: { color: "#9ca3af" } },
      },
    },
  });
}

function updateCharts() {
  if (!volumeChart || !historyChart) return;

  volumeChart.data.datasets[0].data = volumeChart.data.datasets[0].data.map(
    () => Math.floor(Math.random() * 500)
  );
  volumeChart.update();

  historyChart.data.datasets[0].data =
    historyChart.data.datasets[0].data.map(() =>
      Math.floor(Math.random() * 10)
    );
  historyChart.update();
}

// -----------------------------
// Initial calculation
// -----------------------------
updateExchangeCalculation();
