// Blockchain Integration Module
// Handles Web3 wallet connection and blockchain transactions

let web3 = null;
let connectedAccount = null;
let blockchainConnected = false;

// Initialize Web3
async function initWeb3() {
    if (typeof window.ethereum !== 'undefined') {
        try {
            web3 = new Web3(window.ethereum);
            console.log('Web3 initialized');
            return true;
        } catch (error) {
            console.error('Error initializing Web3:', error);
            return false;
        }
    } else {
        console.log('MetaMask not detected');
        return false;
    }
}

// Connect wallet
async function connectWallet() {
    if (!web3) {
        await initWeb3();
    }

    if (!web3) {
        showNotification('Please install MetaMask to connect your wallet', 'error');
        return null;
    }

    try {
        // Request account access
        const accounts = await window.ethereum.request({ 
            method: 'eth_requestAccounts' 
        });
        
        connectedAccount = accounts[0];
        blockchainConnected = true;
        
        // Get network info
        const chainId = await web3.eth.getChainId();
        const networkName = getNetworkName(chainId);
        
        showNotification(`Wallet connected: ${connectedAccount.substring(0, 6)}...${connectedAccount.substring(38)}`, 'success');
        console.log('Connected to:', networkName, 'Network ID:', chainId);
        
        // Update UI
        updateWalletUI();
        
        return connectedAccount;
    } catch (error) {
        console.error('Error connecting wallet:', error);
        showNotification('Failed to connect wallet: ' + error.message, 'error');
        return null;
    }
}

// Disconnect wallet
function disconnectWallet() {
    connectedAccount = null;
    blockchainConnected = false;
    updateWalletUI();
    showNotification('Wallet disconnected', 'info');
}

// Get network name
function getNetworkName(chainId) {
    const networks = {
        1: 'Ethereum Mainnet',
        11155111: 'Sepolia Testnet',
        5: 'Goerli Testnet',
        137: 'Polygon Mainnet',
        80001: 'Polygon Mumbai Testnet',
        56: 'BSC Mainnet',
        97: 'BSC Testnet'
    };
    return networks[chainId] || `Unknown Network (${chainId})`;
}

// Update wallet UI
function updateWalletUI() {
    const walletBtn = document.getElementById('wallet-connect-btn');
    const walletInfo = document.getElementById('wallet-info');
    
    if (walletBtn) {
        if (blockchainConnected) {
            walletBtn.textContent = 'Disconnect Wallet';
            walletBtn.classList.remove('btn-primary');
            walletBtn.classList.add('btn-secondary');
        } else {
            walletBtn.textContent = 'Connect Wallet';
            walletBtn.classList.remove('btn-secondary');
            walletBtn.classList.add('btn-primary');
        }
    }
    
    if (walletInfo) {
        if (blockchainConnected && connectedAccount) {
            walletInfo.innerHTML = `
                <div class="wallet-connected">
                    <span class="wallet-icon">🔗</span>
                    <span class="wallet-address">${connectedAccount.substring(0, 6)}...${connectedAccount.substring(38)}</span>
                </div>
            `;
            walletInfo.style.display = 'flex';
        } else {
            walletInfo.style.display = 'none';
        }
    }
}

// Get wallet balance
async function getWalletBalance(address) {
    if (!web3) return null;
    
    try {
        const balance = await web3.eth.getBalance(address);
        const ethBalance = web3.utils.fromWei(balance, 'ether');
        return parseFloat(ethBalance);
    } catch (error) {
        console.error('Error getting balance:', error);
        return null;
    }
}

// Send blockchain transaction (simplified for demo)
async function sendBlockchainTransaction(toAddress, amount) {
    if (!web3 || !connectedAccount) {
        throw new Error('Wallet not connected');
    }

    try {
        // Get current gas price
        const gasPrice = await web3.eth.getGasPrice();
        
        // Prepare transaction
        const tx = {
            from: connectedAccount,
            to: toAddress,
            value: web3.utils.toWei(amount.toString(), 'ether'),
            gas: 21000,
            gasPrice: gasPrice
        };

        // Send transaction
        const receipt = await web3.eth.sendTransaction(tx);
        
        console.log('Transaction successful:', receipt.transactionHash);
        return receipt.transactionHash;
    } catch (error) {
        console.error('Transaction failed:', error);
        throw error;
    }
}

// Verify transaction on blockchain
async function verifyTransaction(txHash) {
    if (!web3) return null;
    
    try {
        const receipt = await web3.eth.getTransactionReceipt(txHash);
        return receipt;
    } catch (error) {
        console.error('Error verifying transaction:', error);
        return null;
    }
}

// Listen for account changes
if (typeof window.ethereum !== 'undefined') {
    window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
            disconnectWallet();
        } else if (accounts[0] !== connectedAccount) {
            connectedAccount = accounts[0];
            updateWalletUI();
            showNotification('Wallet account changed', 'info');
        }
    });

    window.ethereum.on('chainChanged', (chainId) => {
        window.location.reload();
    });
}

// Initialize Web3 on load
initWeb3();
