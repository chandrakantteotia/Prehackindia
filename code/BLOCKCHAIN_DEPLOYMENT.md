# 🚀 SHARP Warriors - Blockchain Deployment Guide

Complete guide to deploy the SHARP token and enable on-chain rewards.

---

## 📋 Prerequisites

### 1. Required Software
```bash
# Install Node.js dependencies for smart contracts
cd contracts
npm install
```

### 2. Required Accounts & Keys

#### a) Polygon Wallet
- Create a wallet on MetaMask
- Export your private key (Keep it SECRET!)
- Get testnet MATIC from [Mumbai Faucet](https://faucet.polygon.technology/)

#### b) API Keys
- **Alchemy/Infura**: Get RPC URL from [alchemy.com](https://www.alchemy.com/) or [infura.io](https://infura.io/)
- **PolygonScan**: Get API key from [polygonscan.com/apis](https://polygonscan.com/apis)

---

## 🔐 Step 1: Environment Configuration

Create a `.env` file in the root directory:

```env
# Deployer Wallet (used to deploy contract)
PRIVATE_KEY=your_wallet_private_key_here

# RPC URLs
MUMBAI_RPC_URL=https://polygon-mumbai.g.alchemy.com/v2/YOUR_API_KEY
POLYGON_RPC_URL=https://polygon-mainnet.g.alchemy.com/v2/YOUR_API_KEY

# Polygonscan API Key (for contract verification)
POLYGONSCAN_API_KEY=your_polygonscan_api_key_here

# Admin Wallet (used by Firebase Functions to distribute rewards)
ADMIN_WALLET_PRIVATE_KEY=your_admin_wallet_private_key_here

# Firebase Functions Configuration
SHARP_TOKEN_CONTRACT_ADDRESS=will_be_set_after_deployment
RPC_URL=https://polygon-mainnet.g.alchemy.com/v2/YOUR_API_KEY
```

⚠️ **CRITICAL SECURITY NOTES:**
- NEVER commit `.env` file to Git
- Keep private keys SECRET
- Use different wallets for deployment and rewards distribution
- Fund the admin wallet with MATIC for gas fees

---

## 🎯 Step 2: Deploy to Mumbai Testnet (Recommended First)

### 2.1 Install Dependencies
```bash
npm install --save-dev hardhat @openzeppelin/contracts dotenv @nomiclabs/hardhat-etherscan
```

### 2.2 Get Mumbai Test MATIC
- Visit [Mumbai Faucet](https://faucet.polygon.technology/)
- Enter your wallet address
- Request test MATIC

### 2.3 Deploy Contract
```bash
# Deploy to Mumbai testnet
npx hardhat run scripts/deploy-token.js --network mumbai
```

### 2.4 Expected Output
```
🚀 Deploying SHARP Token to mumbai...
📦 Contract deployed to: 0xYourContractAddressHere
⏳ Waiting for block confirmations...
✅ Contract verified on PolygonScan
💾 Deployment info saved to deployment-mumbai.json
```

### 2.5 Test the Contract
```bash
# Check contract on Mumbai PolygonScan
# https://mumbai.polygonscan.com/address/YOUR_CONTRACT_ADDRESS

# Test token balance
npx hardhat console --network mumbai
> const SharpToken = await ethers.getContractFactory("SharpToken")
> const token = await SharpToken.attach("YOUR_CONTRACT_ADDRESS")
> await token.totalSupply()
> await token.balanceOf("YOUR_WALLET_ADDRESS")
```

---

## 🌐 Step 3: Deploy to Polygon Mainnet

### 3.1 Fund Mainnet Wallet
- Buy MATIC on exchanges (Coinbase, Binance, etc.)
- Transfer MATIC to your deployer wallet
- Recommended: ~10 MATIC for deployment

### 3.2 Deploy to Mainnet
```bash
# Deploy to Polygon mainnet
npx hardhat run scripts/deploy-token.js --network polygon
```

### 3.3 Save Contract Address
After successful deployment, copy the contract address from `deployment-polygon.json`

---

## ⚙️ Step 4: Configure Firebase Functions

### 4.1 Set Firebase Functions Config
```bash
# Navigate to functions directory
cd functions

# Install dependencies
npm install ethers

# Set configuration (replace with your values)
firebase functions:config:set \
  web3.private_key="YOUR_ADMIN_WALLET_PRIVATE_KEY" \
  web3.token_address="YOUR_DEPLOYED_CONTRACT_ADDRESS" \
  web3.rpc_url="https://polygon-mainnet.g.alchemy.com/v2/YOUR_API_KEY"

# Verify configuration
firebase functions:config:get
```

### 4.2 Deploy Firebase Functions
```bash
# Deploy all functions
firebase deploy --only functions

# Or deploy specific function
firebase deploy --only functions:submitScore
```

### 4.3 Expected Output
```
✔  functions[submitScore(us-central1)] Successful create operation.
✔  functions[processTournament(us-central1)] Successful create operation.
✔  functions[getUserStats(us-central1)] Successful create operation.
```

---

## 🎮 Step 5: Update Frontend Configuration

### 5.1 Update web3-integration.js
Open `public/js/web3-integration.js` and update:

```javascript
// Line ~5: Update contract address
const SHARP_TOKEN_ADDRESS = '0xYourDeployedContractAddress';

// Line ~8: Update network (Mumbai testnet = 80001, Polygon mainnet = 137)
const REQUIRED_CHAIN_ID = 137; // Use 137 for mainnet, 80001 for testnet
```

### 5.2 Update Network Name
```javascript
// Line ~9
const NETWORK_NAME = 'Polygon'; // or 'Mumbai Testnet'
```

### 5.3 Add Contract ABI (if needed)
The minimal ABI is already included, but for full functionality, you can add the complete ABI from `artifacts/contracts/SharpToken.sol/SharpToken.json`

---

## 💰 Step 6: Fund Admin Wallet

The admin wallet (used by Firebase Functions) needs MATIC for gas fees and SHARP tokens to distribute.

### 6.1 Transfer MATIC
```bash
# Send ~5 MATIC to admin wallet for gas fees
# Use MetaMask or any wallet to send MATIC
```

### 6.2 Transfer SHARP Tokens
```javascript
// Using Hardhat console
npx hardhat console --network polygon

const SharpToken = await ethers.getContractFactory("SharpToken");
const token = await SharpToken.attach("YOUR_CONTRACT_ADDRESS");

// Transfer 100,000 SHARP to admin wallet
const amount = ethers.parseUnits("100000", 18);
await token.transfer("ADMIN_WALLET_ADDRESS", amount);
```

---

## 🧪 Step 7: Testing

### 7.1 Test Score Submission
1. Open your website
2. Connect wallet with MetaMask
3. Play a game (Color Rush or Memory Game)
4. Submit score
5. Check console for transaction details

### 7.2 Verify Transaction
```bash
# Check transaction on PolygonScan
https://polygonscan.com/tx/YOUR_TX_HASH

# Check token balance
https://polygonscan.com/token/YOUR_CONTRACT_ADDRESS?a=YOUR_WALLET_ADDRESS
```

### 7.3 Test Firebase Functions
```bash
# Check Firebase Functions logs
firebase functions:log --only submitScore

# Expected output:
# ✅ Score submitted successfully
# 💰 Reward calculated: X SHARP
# 🔗 Transaction hash: 0x...
```

---

## 📊 Step 8: Monitoring & Maintenance

### 8.1 Monitor Gas Prices
```bash
# Check current gas prices
https://polygonscan.com/gastracker

# Adjust gas settings in functions/index.js if needed
const tx = await tokenContract.transfer(toAddress, amountInWei, {
  gasLimit: 100000,
  maxFeePerGas: ethers.parseUnits("50", "gwei")
});
```

### 8.2 Monitor Admin Wallet Balance
```bash
# Check MATIC balance
https://polygonscan.com/address/ADMIN_WALLET_ADDRESS

# Check SHARP balance
https://polygonscan.com/token/CONTRACT_ADDRESS?a=ADMIN_WALLET_ADDRESS
```

### 8.3 Refill When Needed
- Keep at least 1 MATIC in admin wallet
- Keep at least 10,000 SHARP tokens for rewards
- Set up alerts for low balance

---

## 🔄 Step 9: Update Contract (if needed)

If you need to update the contract:

1. **Update Solidity code** in `contracts/SharpToken.sol`
2. **Redeploy contract** using steps 2-3
3. **Update Firebase config** with new address
4. **Update frontend** with new address
5. **Transfer tokens** to new contract admin wallet

⚠️ Note: ERC20 tokens cannot be upgraded. You'll need to deploy a new contract and migrate users.

---

## 📝 Troubleshooting

### Issue: "Transaction Failed"
- **Check gas fees**: Ensure admin wallet has MATIC
- **Check token balance**: Ensure admin wallet has SHARP tokens
- **Check network**: Verify RPC URL is correct

### Issue: "Contract Not Verified"
```bash
# Manually verify contract
npx hardhat verify --network polygon YOUR_CONTRACT_ADDRESS
```

### Issue: "Insufficient Permissions"
- Check Firestore rules in Firebase Console
- Ensure authenticated users can read/write

### Issue: "Rate Limit Exceeded"
- Firebase Functions have rate limits
- Upgrade to Blaze plan for production
- Consider batching transactions

---

## 🎉 Success Checklist

- ✅ Smart contract deployed to Polygon
- ✅ Contract verified on PolygonScan
- ✅ Firebase Functions configured with contract address
- ✅ Firebase Functions deployed successfully
- ✅ Frontend updated with contract address
- ✅ Admin wallet funded with MATIC and SHARP
- ✅ Test transaction successful
- ✅ Rewards distribution working
- ✅ Transaction tracking visible on PolygonScan

---

## 🔗 Useful Links

- **Mumbai Faucet**: https://faucet.polygon.technology/
- **Mumbai Explorer**: https://mumbai.polygonscan.com/
- **Polygon Explorer**: https://polygonscan.com/
- **Alchemy Dashboard**: https://dashboard.alchemy.com/
- **Hardhat Docs**: https://hardhat.org/docs
- **OpenZeppelin Contracts**: https://docs.openzeppelin.com/contracts/

---

## 📞 Support

If you encounter issues:
1. Check Firebase Functions logs: `firebase functions:log`
2. Check browser console for errors
3. Verify all environment variables are set
4. Ensure wallet has sufficient MATIC for gas

---

## 🔒 Security Best Practices

1. ✅ Never share private keys
2. ✅ Use separate wallets for deployment and rewards
3. ✅ Keep `.env` file in `.gitignore`
4. ✅ Use environment variables in production
5. ✅ Enable 2FA on all accounts
6. ✅ Regular security audits for smart contracts
7. ✅ Monitor wallet balances and transactions
8. ✅ Set up alerts for suspicious activity

---

**Ready to go live? Follow these steps carefully and your SHARP Warriors platform will have fully functional blockchain rewards!** 🎮🚀
