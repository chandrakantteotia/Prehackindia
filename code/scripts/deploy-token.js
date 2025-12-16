// Hardhat deployment script for SHARP Token
const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying SHARP Token to Polygon...\n");

  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // Deploy contract
  console.log("\n📝 Deploying SharpToken contract...");
  const SharpToken = await hre.ethers.getContractFactory("SharpToken");
  const token = await SharpToken.deploy();

  await token.deployed();

  console.log("\n✅ SharpToken deployed to:", token.address);
  console.log("Transaction hash:", token.deployTransaction.hash);

  // Wait for confirmations
  console.log("\n⏳ Waiting for confirmations...");
  await token.deployTransaction.wait(5);

  console.log("\n📊 Contract Details:");
  console.log("- Name:", await token.name());
  console.log("- Symbol:", await token.symbol());
  console.log("- Total Supply:", hre.ethers.utils.formatEther(await token.totalSupply()), "SHARP");
  console.log("- Max Supply:", hre.ethers.utils.formatEther(await token.MAX_SUPPLY()), "SHARP");
  console.log("- Decimals:", await token.decimals());

  // Verify on Polygonscan
  if (hre.network.name !== "localhost" && hre.network.name !== "hardhat") {
    console.log("\n🔍 Verifying on Polygonscan...");
    try {
      await hre.run("verify:verify", {
        address: token.address,
        constructorArguments: [],
      });
      console.log("✅ Contract verified on Polygonscan!");
    } catch (error) {
      console.log("⚠️ Verification failed:", error.message);
      console.log("You can manually verify later using:");
      console.log(`npx hardhat verify --network ${hre.network.name} ${token.address}`);
    }
  }

  // Save deployment info
  const fs = require("fs");
  const deploymentInfo = {
    network: hre.network.name,
    contractAddress: token.address,
    deployerAddress: deployer.address,
    txHash: token.deployTransaction.hash,
    blockNumber: token.deployTransaction.blockNumber,
    timestamp: new Date().toISOString(),
    polygonscanUrl: `https://polygonscan.com/address/${token.address}`
  };

  fs.writeFileSync(
    "./deployment-info.json",
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("\n💾 Deployment info saved to deployment-info.json");
  console.log("\n🎉 Deployment Complete!");
  console.log("\n📋 Next Steps:");
  console.log("1. Update firebase-config.js with contract address");
  console.log("2. Set reward pool address: await token.setRewardPool(BACKEND_WALLET)");
  console.log("3. Update Firebase Functions with contract address");
  console.log("4. Test reward distribution");
  console.log(`\n🔗 View on Polygonscan: ${deploymentInfo.polygonscanUrl}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
