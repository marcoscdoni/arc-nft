import { ethers } from "hardhat";

async function main() {
  const nftAddress = process.env.NFT_CONTRACT_ADDRESS;

  if (!nftAddress) {
    console.error("⚠️  Set NFT_CONTRACT_ADDRESS in .env");
    process.exit(1);
  }

  const [signer] = await ethers.getSigners();
  console.log("👤 Minting with account:", signer.address);

  const nft = await ethers.getContractAt("ArcNFT", nftAddress);

  // Array of URIs for minting
  const tokenURIs = [
    "ipfs://QmExample1/metadata1.json",
    "ipfs://QmExample2/metadata2.json",
    "ipfs://QmExample3/metadata3.json",
    "ipfs://QmExample4/metadata4.json",
    "ipfs://QmExample5/metadata5.json",
  ];

  console.log(`\n🎨 Batch Minting ${tokenURIs.length} NFTs...`);
  
  const tx = await nft.batchMint(tokenURIs);
  console.log("⏳ Waiting for confirmation...");
  
  const receipt = await tx.wait();
  console.log("✅ Batch mint completed!");
  console.log("Transaction hash:", receipt?.hash);

  const totalMinted = await nft.totalMinted();
  console.log("\n📊 Total NFTs minted:", totalMinted.toString());

  const myTokens = await nft.tokensOfOwner(signer.address);
  console.log("🎫 Your NFTs:", myTokens.toString());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
