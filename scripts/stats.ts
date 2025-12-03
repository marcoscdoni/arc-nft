import { ethers } from "hardhat";

async function main() {
  const nftAddress = process.env.NFT_CONTRACT_ADDRESS;
  const marketplaceAddress = process.env.MARKETPLACE_CONTRACT_ADDRESS;

  if (!nftAddress || !marketplaceAddress) {
    console.error("⚠️  Defina NFT_CONTRACT_ADDRESS e MARKETPLACE_CONTRACT_ADDRESS no .env");
    process.exit(1);
  }

  const [signer] = await ethers.getSigners();
  const nft = await ethers.getContractAt("ArcNFT", nftAddress);
  const marketplace = await ethers.getContractAt("ArcMarketplace", marketplaceAddress);

  console.log("📊 Estatísticas do Marketplace Arc");
  console.log("=====================================\n");

  // Stats gerais
  const totalSales = await marketplace.totalSales();
  const totalVolume = await marketplace.totalVolume();
  const platformFee = await marketplace.platformFee();

  console.log("💰 Volume Total:", ethers.formatEther(totalVolume), "ETH");
  console.log("🛒 Total de Vendas:", totalSales.toString());
  console.log("💵 Taxa da Plataforma:", (Number(platformFee) / 100).toFixed(2) + "%");

  // Stats do NFT
  const totalMinted = await nft.totalMinted();
  const mintPrice = await nft.mintPrice();
  
  console.log("\n🎨 Estatísticas NFT");
  console.log("=====================");
  console.log("📦 Total Mintado:", totalMinted.toString());
  console.log("💰 Preço de Mint:", ethers.formatEther(mintPrice), "ETH");

  // Stats pessoais
  const myTokens = await nft.tokensOfOwner(signer.address);
  const myBalance = await nft.balanceOf(signer.address);
  const myFreeMints = await nft.freeMintCount(signer.address);

  console.log("\n👤 Your Statistics");
  console.log("====================");
  console.log("🎫 NFTs you own:", myBalance.toString());
  console.log("🆓 Free mints used:", myFreeMints.toString() + "/5");
  
  if (myTokens.length > 0) {
    console.log("🎨 Your Token IDs:", myTokens.toString());
  }

  // Check some active listings (sample)
  console.log("\n🔍 Checking listings...");
  let activeListings = 0;
  
  for (let i = 1; i <= Number(totalMinted) && i <= 10; i++) {
    try {
      const listing = await marketplace.getListing(nftAddress, i);
      if (listing.active) {
        activeListings++;
        console.log(`  - Token #${i}: ${ethers.formatEther(listing.price)} ETH (seller: ${listing.seller.slice(0, 10)}...)`);
      }
    } catch (e) {
      // Token may not exist
    }
  }
  
  if (activeListings === 0) {
    console.log("  No active listings found in first 10 tokens");
  }

  console.log("\n✨ Report complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
