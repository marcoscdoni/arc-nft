import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  console.log("🚀 Starting deployment to Arc Testnet...\n");

  const [deployer] = await ethers.getSigners();
  const balance = await ethers.provider.getBalance(deployer.address);

  console.log("📍 Deploying with account:", deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "ETH\n");

  // Deploy ArcNFT
  console.log("📦 Deploying ArcNFT...");
  const ArcNFT = await ethers.getContractFactory("ArcNFT");
  const nft = await ArcNFT.deploy();
  await nft.waitForDeployment();
  const nftAddress = await nft.getAddress();
  console.log("✅ ArcNFT deployed to:", nftAddress);

  // Deploy ArcMarketplace
  console.log("\n📦 Deploying ArcMarketplace...");
  const ArcMarketplace = await ethers.getContractFactory("ArcMarketplace");
  const marketplace = await ArcMarketplace.deploy();
  await marketplace.waitForDeployment();
  const marketplaceAddress = await marketplace.getAddress();
  console.log("✅ ArcMarketplace deployed to:", marketplaceAddress);

  // Save addresses to file
  const deploymentInfo = {
    network: "Arc Testnet",
    chainId: 62298,
    timestamp: new Date().toISOString(),
    contracts: {
      ArcNFT: nftAddress,
      ArcMarketplace: marketplaceAddress,
    },
    deployer: deployer.address,
  };

  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }

  fs.writeFileSync(
    path.join(deploymentsDir, "arc-testnet.json"),
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("\n✨ Deployment completed successfully!");
  console.log("\n📋 Information saved in: deployments/arc-testnet.json");
  console.log("\n🔗 Next steps:");
  console.log("1. Update .env file with contract addresses");
  console.log("2. Verify contracts in explorer (if available):");
  console.log(`   npx hardhat verify --network arcTestnet ${nftAddress}`);
  console.log(`   npx hardhat verify --network arcTestnet ${marketplaceAddress}`);
  console.log("3. Interact with contracts using the frontend");
  console.log("\n💡 Contract addresses:");
  console.log(`NFT_CONTRACT_ADDRESS=${nftAddress}`);
  console.log(`MARKETPLACE_CONTRACT_ADDRESS=${marketplaceAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
