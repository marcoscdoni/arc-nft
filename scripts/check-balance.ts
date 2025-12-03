import { ethers } from "hardhat";

async function main() {
  const [signer] = await ethers.getSigners();
  const balance = await ethers.provider.getBalance(signer.address);
  const network = await ethers.provider.getNetwork();
  
  console.log("🔍 Configuration Check");
  console.log("==============================\n");
  
  console.log("📍 Address:", signer.address);
  console.log("🌐 Network:", network.name);
  console.log("🔗 Chain ID:", network.chainId.toString());
  console.log("💰 Balance:", ethers.formatEther(balance), "ETH");
  
  if (balance === 0n) {
    console.log("\n⚠️  WARNING: Zero balance!");
    console.log("\n📝 Next steps:");
    console.log("1. Visit: https://faucet.arc-testnet.circle.com");
    console.log("2. Paste your address:", signer.address);
    console.log("3. Request testnet tokens");
    console.log("4. Wait ~1 minute");
    console.log("5. Run this script again");
  } else {
    console.log("\n✅ Everything configured correctly!");
    console.log("\n🚀 You're ready to:");
    console.log("- Deploy: npm run deploy:testnet");
    console.log("- Test: npm test");
    console.log("- Interact: npx hardhat run scripts/interact.ts --network arcTestnet");
  }
  
  // Check if it's Arc Testnet
  if (network.chainId !== 62298n) {
    console.log("\n⚠️  You're not on Arc Testnet!");
    console.log("Expected Chain ID: 62298");
    console.log("Current Chain ID:", network.chainId.toString());
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Error:", error.message);
    process.exit(1);
  });
