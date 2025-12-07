// Global state
let currentUser = null;
let isLoginMode = false;

// DOM Elements
const authSection = document.getElementById('auth-section');
const appSection = document.getElementById('app-section');
const authForm = document.getElementById('auth-form');
const loginBtn = document.getElementById('login-btn');
const signupBtn = document.getElementById('signup-btn');
const logoutBtn = document.getElementById('logout-btn');
const userMenu = document.getElementById('user-menu');
const userAvatar = document.getElementById('user-avatar');
const toggleAuth = document.getElementById('toggle-auth');
const authTitle = document.getElementById('auth-title');
const authSubmit = document.getElementById('auth-submit');
const toggleText = document.getElementById('toggle-text');
const transferForm = document.getElementById('transfer-form');
const balanceSpan = document.getElementById('balance');
const txCountSpan = document.getElementById('tx-count');
const transactionList = document.getElementById('transaction-list');
const totalAmountSpan = document.getElementById('total-amount');

// Exchange rate calculation
const fromCurrencySelect = document.getElementById('from-currency');
const toCurrencySelect = document.getElementById('to-currency');
const amountInput = document.getElementById('amount');
const exchangeRateSpan = document.getElementById('exchange-rate');
const sendAmountSpan = document.getElementById('send-amount');
const receiveAmountSpan = document.getElementById('receive-amount');

// Mock exchange rates (in production, use real API)
const exchangeRates = {
    'USD': { 'EUR': 0.92, 'GBP': 0.79, 'JPY': 149.50, 'CAD': 1.36, 'MXN': 17.20, 'USD': 1 },
    'EUR': { 'USD': 1.09, 'GBP': 0.86, 'JPY': 162.50, 'CAD': 1.48, 'MXN': 18.70, 'EUR': 1 },
    'GBP': { 'USD': 1.27, 'EUR': 1.16, 'JPY': 189.20, 'CAD': 1.72, 'MXN': 21.80, 'GBP': 1 },
    'JPY': { 'USD': 0.0067, 'EUR': 0.0062, 'GBP': 0.0053, 'CAD': 0.0091, 'MXN': 0.115, 'JPY': 1 },
    'CAD': { 'USD': 0.74, 'EUR': 0.68, 'GBP': 0.58, 'JPY': 110.00, 'MXN': 12.65, 'CAD': 1 },
    'MXN': { 'USD': 0.058, 'EUR': 0.053, 'GBP': 0.046, 'JPY': 8.70, 'CAD': 0.079, 'MXN': 1 }
};

// Authentication State Observer
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

// Toggle between login and signup
function toggleAuthMode() {
    isLoginMode = !isLoginMode;
    if (isLoginMode) {
        authTitle.textContent = 'Welcome Back';
        authSubmit.textContent = 'Sign In';
        toggleText.textContent = "Don't have an account?";
        toggleAuth.textContent = 'Get Started';
    } else {
        authTitle.textContent = 'Get Started';
        authSubmit.textContent = 'Create Account';
        toggleText.textContent = 'Already have an account?';
        toggleAuth.textContent = 'Sign in';
    }
}

// Event Listeners
loginBtn.addEventListener('click', () => {
    isLoginMode = true;
    toggleAuthMode();
});

signupBtn.addEventListener('click', () => {
    isLoginMode = false;
    toggleAuthMode();
});

toggleAuth.addEventListener('click', (e) => {
    e.preventDefault();
    toggleAuthMode();
});

logoutBtn.addEventListener('click', async () => {
    try {
        await auth.signOut();
        console.log('User signed out');
    } catch (error) {
        console.error('Logout error:', error);
        alert('Error logging out: ' + error.message);
    }
});

// Auth Form Submit
authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        if (isLoginMode) {
            await auth.signInWithEmailAndPassword(email, password);
            console.log('User logged in');
        } else {
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            // Initialize user data in Firestore
            await db.collection('users').doc(userCredential.user.uid).set({
                email: email,
                balance: 1000.00, // Starting balance for demo
                currency: 'USD',
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            console.log('User signed up');
        }
        authForm.reset();
    } catch (error) {
        console.error('Auth error:', error);
        alert('Error: ' + error.message);
    }
});

// Transfer Form Submit
transferForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!currentUser) {
        alert('Please login first');
        return;
    }

    const fromCurrency = fromCurrencySelect.value;
    const toCurrency = toCurrencySelect.value;
    const amount = parseFloat(amountInput.value);
    const recipientAddress = document.getElementById('recipient-address').value;
    const rate = exchangeRates[fromCurrency][toCurrency];
    const receiveAmount = amount * rate;
    const blockchainFee = 2.50;

    try {
        // Create transaction in Firestore
        const transaction = {
            userId: currentUser.uid,
            fromCurrency: fromCurrency,
            toCurrency: toCurrency,
            sendAmount: amount,
            receiveAmount: receiveAmount,
            exchangeRate: rate,
            recipientAddress: recipientAddress,
            blockchainFee: blockchainFee,
            status: 'pending',
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            // Blockchain placeholder data
            blockchainTxHash: 'pending',
            blockchainNetwork: 'ethereum-testnet'
        };

        const docRef = await db.collection('transactions').add(transaction);
        console.log('Transaction created:', docRef.id);

        // Update user balance (in production, this should be done server-side)
        const userRef = db.collection('users').doc(currentUser.uid);
        await userRef.update({
            balance: firebase.firestore.FieldValue.increment(-(amount + blockchainFee))
        });

        // Simulate blockchain confirmation after 3 seconds
        setTimeout(async () => {
            await db.collection('transactions').doc(docRef.id).update({
                status: 'completed',
                blockchainTxHash: '0x' + Math.random().toString(16).substring(2, 42),
                completedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        }, 3000);

        transferForm.reset();
        updateExchangeCalculation();
        alert('Transfer initiated! Check transaction history for updates.');
        loadTransactions();
        loadUserData();
    } catch (error) {
        console.error('Transfer error:', error);
        alert('Error processing transfer: ' + error.message);
    }
});

// Exchange rate calculation
function updateExchangeCalculation() {
    const fromCurrency = fromCurrencySelect.value;
    const toCurrency = toCurrencySelect.value;
    const amount = parseFloat(amountInput.value) || 0;
    const rate = exchangeRates[fromCurrency][toCurrency];
    const receiveAmount = amount * rate;
    const blockchainFee = 2.50;
    const total = amount + blockchainFee;

    exchangeRateSpan.textContent = rate.toFixed(4);
    sendAmountSpan.textContent = `$${amount.toFixed(2)}`;
    receiveAmountSpan.textContent = `${receiveAmount.toFixed(2)}`;
    totalAmountSpan.textContent = `$${total.toFixed(2)}`;
}

fromCurrencySelect.addEventListener('change', updateExchangeCalculation);
toCurrencySelect.addEventListener('change', updateExchangeCalculation);
amountInput.addEventListener('input', updateExchangeCalculation);

// Show/Hide sections
function showAuth() {
    authSection.style.display = 'flex';
    appSection.style.display = 'none';
    loginBtn.style.display = 'inline-block';
    signupBtn.style.display = 'inline-block';
    userMenu.style.display = 'none';
}

function showApp() {
    authSection.style.display = 'none';
    appSection.style.display = 'block';
    loginBtn.style.display = 'none';
    signupBtn.style.display = 'none';
    userMenu.style.display = 'flex';
}

// Load user data
async function loadUserData() {
    if (!currentUser) return;

    try {
        const userDoc = await db.collection('users').doc(currentUser.uid).get();
        if (userDoc.exists) {
            const userData = userDoc.data();
            const email = userData.email;
            userAvatar.textContent = email.charAt(0).toUpperCase();
            balanceSpan.textContent = `$${userData.balance.toFixed(2)}`;
        }
    } catch (error) {
        console.error('Error loading user data:', error);
    }
}

// Load transactions
async function loadTransactions() {
    if (!currentUser) return;

    try {
        const snapshot = await db.collection('transactions')
            .where('userId', '==', currentUser.uid)
            .orderBy('timestamp', 'desc')
            .limit(10)
            .get();

        if (snapshot.empty) {
            transactionList.innerHTML = `
                <div class="no-transactions">
                    <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                        <circle cx="32" cy="32" r="32" fill="#f3f4f6"/>
                        <path d="M32 20v24M20 32h24" stroke="#9ca3af" stroke-width="3" stroke-linecap="round"/>
                    </svg>
                    <p>No transactions yet</p>
                    <span>Your transfer history will appear here</span>
                </div>
            `;
            txCountSpan.textContent = '0';
            return;
        }

        transactionList.innerHTML = '';
        txCountSpan.textContent = snapshot.size;
        snapshot.forEach((doc) => {
            const tx = doc.data();
            const txElement = createTransactionElement(tx);
            transactionList.appendChild(txElement);
        });
    } catch (error) {
        console.error('Error loading transactions:', error);
        transactionList.innerHTML = '<div class="no-transactions"><p>Error loading transactions</p></div>';
    }
}

// Create transaction element
function createTransactionElement(tx) {
    const div = document.createElement('div');
    div.className = `transaction-item ${tx.status}`;
    
    const date = tx.timestamp ? tx.timestamp.toDate().toLocaleString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
    }) : 'Pending';
    const statusIcon = tx.status === 'completed' ? '✓' : '⏱';
    
    div.innerHTML = `
        <div class="transaction-icon">${statusIcon}</div>
        <div class="transaction-info">
            <h4>${tx.fromCurrency} → ${tx.toCurrency}</h4>
            <p>${date}</p>
            <p class="transaction-status">To: ${tx.recipientAddress.substring(0, 12)}...</p>
        </div>
        <div class="transaction-amount">
            <div class="transaction-amount-sent">-${tx.sendAmount.toFixed(2)} ${tx.fromCurrency}</div>
            <div class="transaction-amount-received">+${tx.receiveAmount.toFixed(2)} ${tx.toCurrency}</div>
        </div>
    `;
    
    return div;
}

// Listen for real-time transaction updates
if (currentUser) {
    db.collection('transactions')
        .where('userId', '==', currentUser.uid)
        .onSnapshot((snapshot) => {
            snapshot.docChanges().forEach((change) => {
                if (change.type === 'modified') {
                    loadTransactions();
                }
            });
        });
}

// Initialize exchange calculation
updateExchangeCalculation();
