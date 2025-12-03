import { ethers } from "hardhat";

async function main() {
  const nftAddress = process.env.NFT_CONTRACT_ADDRESS;
  const marketplaceAddress = process.env.MARKETPLACE_CONTRACT_ADDRESS;

  if (!nftAddress || !marketplaceAddress) {
    console.error("⚠️  Set NFT_CONTRACT_ADDRESS and MARKETPLACE_CONTRACT_ADDRESS in .env");
    process.exit(1);
  }

  const [signer] = await ethers.getSigners();
  const nft = await ethers.getContractAt("ArcNFT", nftAddress);
  const marketplace = await ethers.getContractAt("ArcMarketplace", marketplaceAddress);

  console.log("🏛️ Creating NFT Auction");
  console.log("========================\n");

  // Check if has NFTs
  const myTokens = await nft.tokensOfOwner(signer.address);
  
  if (myTokens.length === 0) {
    console.log("⚠️  You don't have any NFTs. Minting one...");
    const tx = await nft.mint("ipfs://QmAuctionNFT/metadata.json");
    await tx.wait();
    console.log("✅ NFT minted!\n");
  }

  // Get first token
  const updatedTokens = await nft.tokensOfOwner(signer.address);
  const tokenId = updatedTokens[0];
  
  console.log("🎫 Selected token:", tokenId.toString());

  // Approve marketplace if needed
  const isApproved = await nft.isApprovedForAll(signer.address, marketplaceAddress);
  if (!isApproved) {
    console.log("🔓 Approving marketplace...");
    const approveTx = await nft.setApprovalForAll(marketplaceAddress, true);
    await approveTx.wait();
    console.log("✅ Approved\n");
  }

  // Auction settings
  const startPrice = ethers.parseEther("0.01"); // 0.01 ETH starting
  const duration = 24 * 60 * 60; // 24 hours

  console.log("⚙️ Auction Settings:");
  console.log("  Starting Price:", ethers.formatEther(startPrice), "ETH");
  console.log("  Duration:", duration / 3600, "hours\n");

  // Create auction
  console.log("🏛️ Creating auction...");
  const tx = await marketplace.createAuction(
    nftAddress,
    tokenId,
    startPrice,
    duration
  );
  
  const receipt = await tx.wait();
  console.log("✅ Auction created successfully!");
  console.log("Transaction hash:", receipt?.hash);

  // Check auction
  const auction = await marketplace.getAuction(nftAddress, tokenId);
  const endTime = new Date(Number(auction.endTime) * 1000);
  
  console.log("\n📋 Auction Details:");
  console.log("  Token ID:", tokenId.toString());
  console.log("  Starting Price:", ethers.formatEther(auction.startPrice), "ETH");
  console.log("  Ends at:", endTime.toLocaleString());
  console.log("  Status:", auction.active ? "Active ✅" : "Inactive ❌");

  console.log("\n💡 Tip: Other users can bid with:");
  console.log(`  marketplace.placeBid("${nftAddress}", ${tokenId}, { value: ethers.parseEther("0.02") })`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
