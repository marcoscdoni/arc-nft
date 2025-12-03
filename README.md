# 🎨 Arc NFT Marketplace

Complete NFT Marketplace for **Arc Layer 1** (Circle's new blockchain).

## 🌟 Features

### NFT Contract (ArcNFT)
- ✅ **Free minting**: First 5 NFTs free per address
- ✅ **Batch minting**: Mint multiple NFTs at once
- ✅ **Automatic royalties**: 2.5% for creators
- ✅ **IPFS metadata**: Full support for decentralized URIs
- ✅ **Complete ERC721**: Compatible with OpenSea/Rarible standards

### Marketplace (ArcMarketplace)
- ✅ **Listings**: List NFTs with fixed price
- ✅ **Buy/Sell**: Buy listed NFTs instantly
- ✅ **Offers**: Make offers on unlisted NFTs
- ✅ **Auctions**: Create auctions with deadline and minimum bid
- ✅ **Automatic royalties**: Paid automatically on each sale
- ✅ **Platform fee**: 2.5% (configurable)
- ✅ **Statistics**: Total sales and volume

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- MetaMask or compatible wallet
- Arc testnet tokens (for gas fees)

## 🚀 Installation

1. **Clone and install dependencies**:
```bash
npm install
```

2. **Configure environment variables**:
```bash
cp .env.example .env
```

Edit `.env` and add:
```env
# Your private key (NEVER share or commit!)
PRIVATE_KEY=your_private_key_here

# Arc Testnet RPC (already configured)
ARC_TESTNET_RPC_URL=https://rpc.arc-testnet.circle.com

# Optional: For contract verification
ARCSCAN_API_KEY=your_api_key_here
```

3. **Compile contracts**:
```bash
npm run compile
```

## 🧪 Tests

Run the complete test suite:

```bash
npm test
```

Tests include:
- ✅ Free and paid minting
- ✅ Batch minting
- ✅ Listings and purchases
- ✅ Offers system
- ✅ Auctions
- ✅ Royalties and fees
- ✅ Statistics

## 📦 Deploy to Arc Testnet

### 1. Get testnet tokens

Visit Arc's faucet to get test tokens:
- 🔗 Faucet: [https://faucet.arc-testnet.circle.com](https://faucet.arc-testnet.circle.com)
- 🔗 Explorer: [https://arcscan.net](https://arcscan.net)

### 2. Run deployment

```bash
npm run deploy:testnet
```

The script will:
1. Deploy ArcNFT contract
2. Deploy ArcMarketplace contract
3. Save addresses to `deployments/arc-testnet.json`
4. Show instructions for next steps

### 3. Update .env

After deployment, update your `.env` with the addresses:
```env
NFT_CONTRACT_ADDRESS=0x...
MARKETPLACE_CONTRACT_ADDRESS=0x...
```

### 4. Verify contracts (Optional)

```bash
npx hardhat verify --network arcTestnet YOUR_NFT_ADDRESS
npx hardhat verify --network arcTestnet YOUR_MARKETPLACE_ADDRESS
```

## 💻 Interacting with Contracts

### Quick Interaction Script

```bash
npm run interact
```

This script will:
1. Mint a test NFT
2. Approve the marketplace
3. List the NFT for sale

### Via Hardhat Console

```bash
npx hardhat console --network arcTestnet
```

```javascript
// Connect to contracts
const nft = await ethers.getContractAt("ArcNFT", "NFT_ADDRESS");
const marketplace = await ethers.getContractAt("ArcMarketplace", "MARKETPLACE_ADDRESS");

// Mint NFT
const tx = await nft.mint("ipfs://your_metadata_uri");
await tx.wait();

// View your NFTs
const tokens = await nft.tokensOfOwner("YOUR_ADDRESS");
console.log("Your NFTs:", tokens.toString());

// Approve marketplace
await nft.setApprovalForAll("MARKETPLACE_ADDRESS", true);

// List NFT
const price = ethers.parseEther("0.1"); // 0.1 ETH
await marketplace.listItem("NFT_ADDRESS", 1, price);

// View listings
const listing = await marketplace.getListing("NFT_ADDRESS", 1);
console.log("Price:", ethers.formatEther(listing.price));
```

## 📊 Project Structure

```
arc-projeto/
├── contracts/
│   ├── ArcNFT.sol              # ERC721 NFT Contract
│   └── ArcMarketplace.sol      # Marketplace Contract
├── scripts/
│   ├── deploy.ts               # Deployment script
│   └── interact.ts             # Interaction script
├── test/
│   ├── ArcNFT.test.ts          # NFT tests
│   └── ArcMarketplace.test.ts  # Marketplace tests
├── deployments/                # Deployed addresses
├── hardhat.config.ts           # Hardhat configuration
├── package.json
└── README.md
```

## 🔧 Arc Testnet Settings

| Parameter | Value |
|-----------|-------|
| Network Name | Arc Testnet |
| RPC URL | https://rpc.arc-testnet.circle.com |
| Chain ID | 62298 |
| Currency Symbol | ETH |
| Block Explorer | https://arcscan.net |

## 📝 Metadata Example (IPFS)

```json
{
  "name": "Arc NFT #1",
  "description": "NFT from Arc Marketplace collection",
  "image": "ipfs://QmExample.../image.png",
  "attributes": [
    {
      "trait_type": "Background",
      "value": "Blue"
    },
    {
      "trait_type": "Rarity",
      "value": "Common"
    }
  ]
}
```

## 🛠️ Troubleshooting

### Error: "Insufficient payment for mint"
- Make sure to send the correct value after the 5 free mints
- Current value: 0.01 ETH

### Error: "Marketplace not approved"
- Approve the marketplace before listing: `nft.setApprovalForAll(marketplaceAddress, true)`

### Error: "Insufficient funds"
- Get more testnet tokens from the faucet

### Transaction pending for too long
- Increase gas price in hardhat.config.ts
- Check status in explorer

## 🔐 Security

⚠️ **IMPORTANT**:
- NEVER share your PRIVATE_KEY
- NEVER commit `.env` files
- Use different addresses for testnet and mainnet
- Test extensively before using in production

## 📚 Resources

- 🌐 [Arc Documentation](https://developers.circle.com/arc)
- 📖 [Hardhat Docs](https://hardhat.org/docs)
- 🎨 [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts)
- 🔗 [Solidity Docs](https://docs.soliditylang.org)

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a branch for your feature
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

MIT License - see [LICENSE](LICENSE) for details

## ⭐ Roadmap

- [ ] Complete Next.js frontend
- [ ] Multi-collection support
- [ ] Reputation system
- [ ] Lazy minting
- [ ] IPFS integration (Pinata/NFT.Storage)
- [ ] Analytics dashboard
- [ ] Mobile app

---

**Built for Arc Layer 1** 🚀
