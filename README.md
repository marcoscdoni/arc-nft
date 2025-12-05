# ArcGallery

NFT marketplace running on Arc Layer 1 (Circle's blockchain).

## What's inside

The project has two main contracts:

**ArcNFT** - the NFT contract itself. You can mint NFTs here, first 5 are free per wallet, then there's a small fee. Also handles royalties (2.5% goes to creators on secondary sales) and supports batch minting.

**ArcMarketplace** - where people can list, buy, and trade NFTs. Has listings with fixed prices, offers for NFTs not listed, and auctions with time limits. Marketplace takes a 2.5% cut that can be adjusted.

Everything uses IPFS for metadata and works with standard wallets like MetaMask.

## Getting started

You'll need Node.js (18 or newer) and a wallet with some Arc testnet tokens. Get tokens from the faucet at https://faucet.arc-testnet.circle.com

## Installation

Clone the repo and install dependencies:

```bash
npm install
```

Create a `.env` file (copy from `.env.example`):

```bash
cp .env.example .env
```

Add your private key to `.env`:
```env
PRIVATE_KEY=your_private_key_here
ARC_TESTNET_RPC_URL=https://rpc.arc-testnet.circle.com
```

Don't commit this file! Your private key should stay private.

Compile the contracts:

```bash
npm run compile
```

## Running tests

## Running tests

```bash
npm test
```

Tests cover minting (free and paid), batch operations, listings, buying, offers, auctions, and the royalty/fee system.

## Deploying

Make sure you have testnet tokens first - get them from https://faucet.arc-testnet.circle.com

Then run:

```bash
npm run deploy:testnet
```

This deploys both contracts and saves the addresses to `deployments/arc-testnet.json`. You can verify the contracts on the explorer later if you want.

## Using the contracts

There's an interaction script that mints an NFT, approves the marketplace, and lists it:

## Using the contracts

There's an interaction script that mints an NFT, approves the marketplace, and lists it:

```bash
npm run interact
```

Or you can use the Hardhat console directly:

```bash
npx hardhat console --network arcTestnet
```

Quick example:

```javascript
const nft = await ethers.getContractAt("ArcNFT", "NFT_ADDRESS");
const marketplace = await ethers.getContractAt("ArcMarketplace", "MARKETPLACE_ADDRESS");

// mint an NFT
await nft.mint("ipfs://your_metadata_uri");

// check your NFTs
const tokens = await nft.tokensOfOwner("YOUR_ADDRESS");

// approve marketplace to handle your NFTs
await nft.setApprovalForAll("MARKETPLACE_ADDRESS", true);

// list it for 0.1 ETH
const price = ethers.parseEther("0.1");
await marketplace.listItem("NFT_ADDRESS", 1, price);
```

## Project structure

## Project structure

```
arc-gallery/
├── contracts/           # Solidity contracts
├── scripts/             # Deploy and interaction scripts
├── test/                # Contract tests
├── deployments/         # Deployment addresses
└── frontend/            # Next.js web app
```

## Arc Testnet info

- RPC: https://rpc.arc-testnet.circle.com
- Chain ID: 62298
- Explorer: https://arcscan.net
- Faucet: https://faucet.arc-testnet.circle.com

## Common issues

**"Insufficient payment for mint"** - After the first 5 free mints, you need to pay 0.01 ETH per mint.

**"Marketplace not approved"** - Call `setApprovalForAll` on the NFT contract before listing.

**"Insufficient funds"** - Get more tokens from the faucet.

**Transaction stuck** - Try increasing gas price in `hardhat.config.ts` or check the explorer.

## Metadata format

NFT metadata should be JSON on IPFS:

## Metadata format

NFT metadata should be JSON on IPFS:

```json
{
  "name": "My Cool NFT",
  "description": "Something interesting about this NFT",
  "image": "ipfs://QmExample.../image.png",
  "attributes": [
    {"trait_type": "Background", "value": "Blue"},
    {"trait_type": "Rarity", "value": "Rare"}
  ]
}
```

## What's next

Working on:
- Finishing the Next.js frontend
- Adding support for multiple collections
- IPFS integration (probably Pinata or NFT.Storage)
- Better analytics

## License

MIT - do whatever you want with it.

---

Built for Arc Layer 1
