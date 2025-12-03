import { ethers } from "hardhat";

async function main() {
  const nftAddress = process.env.NFT_CONTRACT_ADDRESS;
  const marketplaceAddress = process.env.MARKETPLACE_CONTRACT_ADDRESS;

  if (!nftAddress || !marketplaceAddress) {
    console.error("⚠️  Set NFT_CONTRACT_ADDRESS and MARKETPLACE_CONTRACT_ADDRESS in .env");
    process.exit(1);
  }

  const [signer] = await ethers.getSigners();
  console.log("👤 Interacting with account:", signer.address);

  // Connect to contracts
  const nft = await ethers.getContractAt("ArcNFT", nftAddress);
  const marketplace = await ethers.getContractAt("ArcMarketplace", marketplaceAddress);

  console.log("\n🎨 Minting test NFT...");
  
  const tokenURI = "ipfs://QmExample123/metadata.json"; // Replace with real URI
  const tx = await nft.mint(tokenURI);
  const receipt = await tx.wait();
  
  console.log("✅ NFT minted successfully!");
  console.log("Transaction hash:", receipt?.hash);

  // Get tokenId from event
  const totalMinted = await nft.totalMinted();
  const tokenId = totalMinted;
  console.log("🎫 Token ID:", tokenId.toString());

  // Approve marketplace
  console.log("\n🔓 Approving marketplace...");
  const approveTx = await nft.setApprovalForAll(marketplaceAddress, true);
  await approveTx.wait();
  console.log("✅ Marketplace approved");

  // List NFT
  const price = ethers.parseEther("0.1"); // 0.1 ETH
  console.log("\n📋 Listing NFT on marketplace...");
  const listTx = await marketplace.listItem(nftAddress, tokenId, price);
  await listTx.wait();
  console.log("✅ NFT listed successfully!");
  console.log("💰 Price:", ethers.formatEther(price), "ETH");

  console.log("\n🎉 Interaction completed!");
  console.log("\n📊 Summary:");
  console.log("- NFT minted:", tokenId.toString());
  console.log("- Listed for:", ethers.formatEther(price), "ETH");
  console.log("- Marketplace approved");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
