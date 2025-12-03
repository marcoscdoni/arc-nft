# Useful Scripts for Daily Activities

This directory contains scripts to facilitate your daily interactions on Arc Testnet.

## Available Scripts

### 1. deploy.ts
Complete deployment of NFT and Marketplace contracts.

### 2. interact.ts
Basic interaction script (mint + list).

### 3. batch-mint.ts
Mint multiple NFTs at once.

### 4. create-auction.ts
Create auctions automatically.

### 5. stats.ts
View marketplace statistics.

## How to Use

```bash
# Deploy
npm run deploy:testnet

# Basic interaction
npx hardhat run scripts/interact.ts --network arcTestnet

# Batch mint
npx hardhat run scripts/batch-mint.ts --network arcTestnet

# Create auction
npx hardhat run scripts/create-auction.ts --network arcTestnet

# View stats
npx hardhat run scripts/stats.ts --network arcTestnet
```
