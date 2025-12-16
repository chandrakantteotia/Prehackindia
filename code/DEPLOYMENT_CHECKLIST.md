# 🚀 Quick Deployment Checklist

Follow these steps to deploy SHARP token and enable blockchain rewards.

## ✅ Pre-Deployment (5 minutes)

- [ ] Install Node.js dependencies: `npm install --save-dev hardhat @openzeppelin/contracts dotenv`
- [ ] Create `.env` file with your private key and RPC URL
- [ ] Get Mumbai testnet MATIC from [faucet.polygon.technology](https://faucet.polygon.technology/)
- [ ] Get Alchemy/Infura RPC URL from [alchemy.com](https://www.alchemy.com/)
- [ ] Get PolygonScan API key from [polygonscan.com/apis](https://polygonscan.com/apis)

## 🧪 Mumbai Testnet Deployment (10 minutes)

- [ ] Run: `npx hardhat run scripts/deploy-token.js --network mumbai`
- [ ] Copy contract address from terminal output
- [ ] Wait for verification to complete
- [ ] Test on Mumbai PolygonScan: `https://mumbai.polygonscan.com/address/YOUR_ADDRESS`

## 🌐 Polygon Mainnet Deployment (15 minutes)

- [ ] Buy 10 MATIC from exchange (Coinbase, Binance)
- [ ] Transfer MATIC to your deployer wallet
- [ ] Run: `npx hardhat run scripts/deploy-token.js --network polygon`
- [ ] Copy contract address from terminal
- [ ] Verify on PolygonScan: `https://polygonscan.com/address/YOUR_ADDRESS`

## ⚙️ Firebase Configuration (5 minutes)

```bash
cd functions
npm install ethers
firebase functions:config:set \
  web3.token_address="YOUR_CONTRACT_ADDRESS" \
  web3.rpc_url="YOUR_RPC_URL" \
  web3.private_key="YOUR_ADMIN_WALLET_PRIVATE_KEY"
firebase deploy --only functions
```

## 🎨 Frontend Configuration (2 minutes)

Edit `public/js/web3-integration.js`:
```javascript
SHARP_TOKEN_ADDRESS: 'YOUR_CONTRACT_ADDRESS_HERE',
CHAIN_ID: 137, // 137 for mainnet, 80001 for testnet
```

## 💰 Fund Admin Wallet (5 minutes)

- [ ] Send 5 MATIC to admin wallet for gas fees
- [ ] Transfer 100,000 SHARP tokens to admin wallet:
  ```javascript
  npx hardhat console --network polygon
  const token = await ethers.getContractAt("SharpToken", "CONTRACT_ADDRESS")
  await token.transfer("ADMIN_WALLET_ADDRESS", ethers.parseUnits("100000", 18))
  ```

## 🧪 Test Everything (5 minutes)

- [ ] Open your website
- [ ] Connect wallet with MetaMask
- [ ] Play a game (Color Rush or Memory)
- [ ] Submit score
- [ ] Check transaction on PolygonScan
- [ ] Verify SHARP balance increased

## 🎉 Go Live!

- [ ] Update Firebase authorized domains
- [ ] Deploy to production: `firebase deploy`
- [ ] Monitor transactions: Check admin wallet balance
- [ ] Set up alerts for low MATIC/SHARP balance

---

**Total Time: ~45 minutes**

For detailed instructions, see [BLOCKCHAIN_DEPLOYMENT.md](./BLOCKCHAIN_DEPLOYMENT.md)

### 📞 Quick Troubleshooting

**"Insufficient funds"** → Get more MATIC  
**"Contract not verified"** → Run `npx hardhat verify --network polygon YOUR_ADDRESS`  
**"Transaction failed"** → Check admin wallet has MATIC + SHARP  
**"Cannot read properties of undefined"** → Update contract address in web3-integration.js

### 🔗 Important Links

- Mumbai Faucet: https://faucet.polygon.technology/
- Alchemy Dashboard: https://dashboard.alchemy.com/
- PolygonScan: https://polygonscan.com/
- Firebase Console: https://console.firebase.google.com/
