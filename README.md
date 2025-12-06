# Brisita - International Money Transfer MVP

A blockchain-powered international currency transfer web application built with Firebase.

## 🚀 Features

- **User Authentication**: Email/password signup and login using Firebase Auth
- **International Transfers**: Support for multiple currencies (USD, EUR, GBP, JPY, CAD, MXN)
- **Real-time Exchange Rates**: Dynamic currency conversion calculations
- **Blockchain Integration**: Placeholder for blockchain transaction processing
- **Transaction History**: View all past transfers with status tracking
- **User Dashboard**: Account balance and transaction overview
- **Responsive Design**: Works on desktop and mobile devices

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Firebase (Authentication, Firestore)
- **Blockchain**: Placeholder for future Ethereum/Web3 integration
- **Hosting**: Firebase Hosting (optional)

## 📋 Prerequisites

Before you begin, ensure you have:
- A [Firebase account](https://firebase.google.com/)
- Node.js and npm installed (for local development server)
- Git installed

## 🔧 Setup Instructions

### 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" and follow the setup wizard
3. Once created, click on the web icon (</>) to add a web app
4. Register your app and copy the configuration object

### 2. Enable Firebase Services

1. **Authentication**:
   - Go to Authentication → Sign-in method
   - Enable "Email/Password" provider

2. **Firestore Database**:
   - Go to Firestore Database → Create database
   - Start in **test mode** for development (change to production rules later)
   - Choose a location closest to your users

### 3. Configure the App

1. Open `firebase-config.js`
2. Replace the placeholder values with your Firebase config:

```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

### 4. Set Up Firestore Security Rules

In Firebase Console, go to Firestore → Rules and add:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /transactions/{transactionId} {
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
    }
  }
}
```

### 5. Install Dependencies and Run

```bash
# Install dependencies
npm install

# Start local development server
npm start
```

The app will open at `http://localhost:8080`

## 📁 Project Structure

```
brisita/
├── index.html           # Main HTML file
├── styles.css           # Styling
├── app.js              # Main application logic
├── firebase-config.js  # Firebase configuration
├── package.json        # Project dependencies
├── .gitignore         # Git ignore rules
└── README.md          # This file
```

## 🎯 Next Steps for Development

### Phase 1: Core Improvements
- [ ] Add input validation and error handling
- [ ] Implement real exchange rate API (e.g., exchangerate-api.io)
- [ ] Add loading states and better UX feedback
- [ ] Create proper Firestore indexes for queries
- [ ] Implement server-side balance updates (Cloud Functions)

### Phase 2: Blockchain Integration
- [ ] Integrate Web3.js or Ethers.js
- [ ] Connect to Ethereum testnet (Sepolia/Goerli)
- [ ] Implement wallet connection (MetaMask)
- [ ] Create smart contracts for transfers
- [ ] Add transaction confirmation on blockchain

### Phase 3: Enhanced Features
- [ ] KYC/AML verification integration
- [ ] Multi-factor authentication
- [ ] Transaction limits and fraud detection
- [ ] Email notifications
- [ ] Advanced transaction filtering
- [ ] Export transaction history

### Phase 4: Production Ready
- [ ] Implement proper security rules
- [ ] Add rate limiting
- [ ] Set up monitoring and analytics
- [ ] Create admin dashboard
- [ ] Add compliance features
- [ ] Performance optimization

## 🔐 Security Considerations

⚠️ **Important**: This is an MVP. Before going to production:

1. Update Firestore security rules to production mode
2. Never commit `firebase-config.js` with real keys to public repos
3. Implement server-side transaction validation
4. Add rate limiting and fraud detection
5. Implement proper KYC/AML compliance
6. Use environment variables for sensitive data
7. Enable Firebase App Check
8. Implement proper error logging

## 📝 Database Schema

### Users Collection
```javascript
{
  email: string,
  balance: number,
  currency: string,
  createdAt: timestamp
}
```

### Transactions Collection
```javascript
{
  userId: string,
  fromCurrency: string,
  toCurrency: string,
  sendAmount: number,
  receiveAmount: number,
  exchangeRate: number,
  recipientAddress: string,
  blockchainFee: number,
  status: string, // 'pending' | 'completed' | 'failed'
  timestamp: timestamp,
  blockchainTxHash: string,
  blockchainNetwork: string,
  completedAt: timestamp (optional)
}
```

## 🤝 Contributing

This is an MVP project. Contributions, issues, and feature requests are welcome!

## 📄 License

MIT License - feel free to use this project for learning or as a starting point for your own application.

## ⚠️ Disclaimer

This is a proof of concept/MVP. Do not use in production without proper security audits, compliance checks, and legal consultation. Always comply with local financial regulations.
