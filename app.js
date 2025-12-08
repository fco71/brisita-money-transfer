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

// Partner selectors
const localPartnerSelect = document.getElementById("local-partner");
const destPartnerSelect = document.getElementById("dest-partner");
const localPartnerNote = document.getElementById("local-partner-note");
const destPartnerNote = document.getElementById("dest-partner-note");

// Partner comparison container
const partnerComparisonContainer =
  document.getElementById("partner-comparison");

// -----------------------------
// Firebase handles
// -----------------------------
const app = firebase.app();
const auth = firebase.auth();
const db = firebase.firestore();

// -----------------------------
// Partner configuration (demo)
// -----------------------------
// Fee/Spread values are in *recipient currency* for demo purposes.
const LOCAL_PARTNERS = {
  bitcoinrd: {
    id: "bitcoinrd",
    name: "BitcoinRD",
    spreadBps: 90, // 0.90%
    feeFixed: 0.8,
    note: "Local DOP specialist with ATM network.",
  },
  spectrocoin: {
    id: "spectrocoin",
    name: "SpectroCoin",
    spreadBps: 70,
    feeFixed: 0.6,
    note: "Multi-currency exchange with DR coverage.",
  },
  internal: {
    id: "internal",
    name: "Brisita (internal)",
    spreadBps: 50,
    feeFixed: 0.4,
    note: "Internal routing once licensed as an exchange.",
  },
};

const DEST_PARTNERS = {
  bitpanda: {
    id: "bitpanda",
    name: "Bitpanda",
    spreadBps: 60,
    feeFixed: 0.7,
    note: "Retail-friendly EUR off-ramp with SEPA payouts.",
  },
  bvnk: {
    id: "bvnk",
    name: "BVNK",
    spreadBps: 45,
    feeFixed: 0.9,
    note: "B2B stablecoin + fiat rails platform.",
  },
  internal: {
    id: "internal",
    name: "Brisita (internal)",
    spreadBps: 40,
    feeFixed: 0.5,
    note: "Future internal EUR treasury & payout engine.",
  },
};

// Predefined routes used in comparison card.
// They all deliver the same recipient amount; only routes differ.
const ROUTES = [
  {
    id: "standard",
    label: "Standard route",
    localPartnerId: "bitcoinrd",
    destPartnerId: "bitpanda",
    description: "Default DOP→BTC and BTC→EUR route.",
    primary: true,
  },
  {
    id: "alt-local",
    label: "Alt local on-ramp",
    localPartnerId: "spectrocoin",
    destPartnerId: "bitpanda",
    description: "Same EUR off-ramp, different local on-ramp.",
    primary: false,
  },
  {
    id: "alt-eur",
    label: "Alt EUR off-ramp",
    localPartnerId: "bitcoinrd",
    destPartnerId: "bvnk",
    description: "Same DOP partner, different EUR off-ramp.",
    primary: false,
  },
  {
    id: "internal",
    label: "Brisita internal route",
    localPartnerId: "internal",
    destPartnerId: "internal",
    description: "Future internal liquidity on both sides.",
    primary: false,
  },
];

// -----------------------------
// Exchange rates (live via exchangerate.host)
// -----------------------------
let exchangeRates = {};
let ratesLastUpdated = null;

const SUPPORTED_CURRENCIES = ["USD", "EUR", "GBP", "JPY", "CAD", "MXN", "DOP"];

async function fetchExchangeRates() {
  try {
    const response = await fetch(
      "https://api.exchangerate.host/latest?base=USD"
    );
    const data = await response.json();
    const rates = data.rates || {};

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
          const fromRate = rates[from];
          const toRate = rates[to];
          if (!fromRate || !toRate) {
            exchangeRates[from][to] = 1;
          } else {
            const fromToUsd = 1 / fromRate;
            const usdToTo = toRate;
            exchangeRates[from][to] = fromToUsd * usdToTo;
          }
        }
      });
    });

    ratesLastUpdated = new Date();
    console.log("Exchange rates updated:", ratesLastUpdated);
    return true;
  } catch (error) {
    console.error("Error fetching exchange rates:", error);

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

function toggleAuthMode() {
  isLoginMode = !isLoginMode;

  if (isLoginMode) {
    authTitle.textContent = "Welcome Back";
    authSubmit.textContent = "Sign In";
    toggleText.textContent = "Don't have an account?";
    toggleAuth.textContent = "Get Started";
  } else {
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
  if (!isLoginMode) {
    toggleAuthMode();
  }
});

signupBtn.addEventListener("click", () => {
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
      await auth.signInWithEmailAndPassword(email, password);
      console.log("User logged in");
    } else {
      const userCredential = await auth.createUserWithEmailAndPassword(
        email,
        password
      );

      await db.collection("users").doc(userCredential.user.uid).set({
        email: email,
        balance: 1000.0,
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
// Wallet connect
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
// Corridor & pricing helpers
// -----------------------------
const CORRIDORS = [
  {
    id: "DOP-EUR",
    from: "DOP",
    to: "EUR",
    localCode: "DOP",
    localSymbol: "RD$",
    recipientSymbol: "€",
    demoRateLocalPer100Recipient: 7440, // 100 EUR ~ 7,440 DOP (demo)
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
    demoRateLocalPer100Recipient: 110, // 100 EUR ~ 110 USD (demo)
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
    demoRateLocalPer100Recipient: 2, // 100 DOP ~ 2 USD (demo)
    demoBTCRateRecipient: 60000,
    labelDeposit: "You fund your Brisita balance in US dollars.",
  },
];

function findCorridor(from, to) {
  return CORRIDORS.find((c) => c.from === from && c.to === to) || null;
}

// Core pricing function used by both breakdown + comparison
function computeRoutePricing(corridor, amount, localPartner, destPartner) {
  const baseThirdPartyFeePerStep = 1.0; // base fee per leg (recipient currency)
  const stepsCount = 3; // buy, transfer, sell
  const platformFee = 2.0; // Brisita flat fee (recipient currency)
  const volatilityBufferPercent = 0.01;

  const combinedSpreadBps =
    (localPartner.spreadBps + destPartner.spreadBps) / 10000;
  const spreadAmount = amount * combinedSpreadBps;

  const localExtraFee = localPartner.feeFixed;
  const destExtraFee = destPartner.feeFixed;

  const totalThirdPartyFees =
    baseThirdPartyFeePerStep * stepsCount + localExtraFee + destExtraFee;

  const buffer = amount * volatilityBufferPercent;

  const requiredRecipient =
    amount + spreadAmount + totalThirdPartyFees + platformFee + buffer;

  const localPerUnitRecipient =
    corridor.demoRateLocalPer100Recipient / 100.0;
  const requiredLocal = requiredRecipient * localPerUnitRecipient;
  const cryptoAmount =
    requiredRecipient / corridor.demoBTCRateRecipient;

  const step2Fee = baseThirdPartyFeePerStep + localExtraFee;
  const step3Fee = baseThirdPartyFeePerStep + destExtraFee;

  return {
    requiredLocal,
    requiredRecipient,
    cryptoAmount,
    step2Fee,
    step3Fee,
    platformFee,
    buffer,
    spreadAmount,
    combinedSpreadBps,
    totalThirdPartyFees,
  };
}

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

  const corridor = findCorridor(fromCurrency, toCurrency);

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
    if (partnerComparisonContainer) {
      partnerComparisonContainer.innerHTML = "";
    }
    return;
  }

  const localPartner =
    LOCAL_PARTNERS[localPartnerSelect?.value || "bitcoinrd"] ||
    LOCAL_PARTNERS.bitcoinrd;
  const destPartner =
    DEST_PARTNERS[destPartnerSelect?.value || "bitpanda"] ||
    DEST_PARTNERS.bitpanda;

  if (localPartnerNote) localPartnerNote.textContent = localPartner.note;
  if (destPartnerNote) destPartnerNote.textContent = destPartner.note;

  const pricing = computeRoutePricing(
    corridor,
    amount,
    localPartner,
    destPartner
  );

  const corrLocalSymbol = corridor.localSymbol;
  const corrRecipientSymbol = corridor.recipientSymbol;

  step1LocalAmount.textContent = `${corrLocalSymbol} ${pricing.requiredLocal.toFixed(
    2
  )}`;
  step1LocalFee.textContent = `${corrLocalSymbol} 0.00`;

  step2CryptoAmount.textContent = `${pricing.cryptoAmount.toFixed(8)} BTC`;
  step2CryptoFee.textContent = `${corrRecipientSymbol} ${pricing.step2Fee.toFixed(
    2
  )}`;

  step3NetworkFee.textContent = `${corrRecipientSymbol} ${pricing.step3Fee.toFixed(
    2
  )}`;

  step4RecAmount.textContent = `${corrRecipientSymbol} ${amount.toFixed(2)}`;
  step4PlatformFee.textContent = `${corrRecipientSymbol} ${pricing.platformFee.toFixed(
    2
  )}`;
  step4Buffer.textContent = `${corrRecipientSymbol} ${pricing.buffer.toFixed(
    2
  )}`;

  if (step1LocalCodeSpan) {
    step1LocalCodeSpan.textContent = corridor.localCode;
  }
  if (step1Label) {
    step1Label.textContent = corridor.labelDeposit;
  }

  updatePartnerComparison(corridor, amount, pricing.requiredLocal);
}

// Optional comparison: show different routes for same amount
function updatePartnerComparison(corridor, amount, currentRequiredLocal) {
  if (!partnerComparisonContainer) return;

  if (!amount || !corridor) {
    partnerComparisonContainer.innerHTML = "";
    return;
  }

  const rows = [];
  const corridorId = `${corridor.from}-${corridor.to}`;

  // For corridors we don't explicitly want to compare, keep it simple.
  const showComparisonFor =
    corridorId === "DOP-EUR" || corridorId === "USD-EUR";
  if (!showComparisonFor) {
    partnerComparisonContainer.innerHTML = "";
    return;
  }

  ROUTES.forEach((route) => {
    const localPartner =
      LOCAL_PARTNERS[route.localPartnerId] || LOCAL_PARTNERS.bitcoinrd;
    const destPartner =
      DEST_PARTNERS[route.destPartnerId] || DEST_PARTNERS.bitpanda;

    const pricing = computeRoutePricing(corridor, amount, localPartner, destPartner);

    rows.push({
      route,
      localPartner,
      destPartner,
      pricing,
    });
  });

  const bestLocalCost = Math.min(
    ...rows.map((r) => r.pricing.requiredLocal)
  );

  const headerHtml = `
    <div class="partner-comparison-header">
      <h4>Partner options for this transfer</h4>
      <p>Optional · Switch route to see how required deposit and fees change.</p>
    </div>
    <div class="partner-comparison-table">
      <div class="partner-comparison-row header">
        <div>Route</div>
        <div>Local deposit</div>
        <div>vs. best</div>
        <div></div>
      </div>
  `;

  const rowsHtml = rows
    .map((r) => {
      const isPrimary = isCurrentRouteSelected(r.route);
      const diff = r.pricing.requiredLocal - bestLocalCost;
      let diffLabel = "Best price";
      let diffClass = "partner-comparison-diff";

      if (Math.abs(diff) < 0.01) {
        diffLabel = "Best price";
      } else if (diff > 0) {
        diffLabel = `+${diff.toFixed(2)} ${corridor.localSymbol}`;
        diffClass += " positive";
      } else {
        diffLabel = `${diff.toFixed(2)} ${corridor.localSymbol}`;
        diffClass += " negative";
      }

      const buttonLabel = isPrimary ? "Selected" : "Use this route";

      return `
        <div class="partner-comparison-row data ${
          isPrimary ? "primary" : ""
        }" data-route-id="${r.route.id}">
          <div class="partner-comparison-route">
            <span>${r.route.label}</span>
            <span>${r.localPartner.name} → ${r.destPartner.name}</span>
          </div>
          <div class="partner-comparison-cost">
            ${corridor.localSymbol} ${r.pricing.requiredLocal.toFixed(2)}
          </div>
          <div class="${diffClass}">
            ${diffLabel}
          </div>
          <div>
            <button type="button" class="partner-comparison-btn">
              ${buttonLabel}
            </button>
          </div>
        </div>
      `;
    })
    .join("");

  partnerComparisonContainer.innerHTML = headerHtml + rowsHtml + "</div>";

  // Attach click handlers to "Use this route"
  const rowElements = partnerComparisonContainer.querySelectorAll(
    ".partner-comparison-row.data"
  );
  rowElements.forEach((rowEl) => {
    const routeId = rowEl.getAttribute("data-route-id");
    const button = rowEl.querySelector(".partner-comparison-btn");
    if (!routeId || !button) return;

    button.addEventListener("click", () => {
      const route = ROUTES.find((r) => r.id === routeId);
      if (!route) return;

      // Update partner dropdowns and recalc — this is the key UX piece:
      // it's not an extra step, just an optional optimization.
      if (localPartnerSelect) {
        localPartnerSelect.value = route.localPartnerId;
      }
      if (destPartnerSelect) {
        destPartnerSelect.value = route.destPartnerId;
      }
      updateExchangeCalculation();
    });
  });
}

function isCurrentRouteSelected(route) {
  const currentLocal = localPartnerSelect?.value || "bitcoinrd";
  const currentDest = destPartnerSelect?.value || "bitpanda";
  return (
    route.localPartnerId === currentLocal &&
    route.destPartnerId === currentDest
  );
}

// -----------------------------
// Swap currencies
// -----------------------------
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

fromCurrencySelect.addEventListener("change", updateExchangeCalculation);
toCurrencySelect.addEventListener("change", updateExchangeCalculation);
amountInput.addEventListener("input", updateExchangeCalculation);

// Recalculate when partner changes
if (localPartnerSelect) {
  localPartnerSelect.addEventListener("change", updateExchangeCalculation);
}
if (destPartnerSelect) {
  destPartnerSelect.addEventListener("change", updateExchangeCalculation);
}

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