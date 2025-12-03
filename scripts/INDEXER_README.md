# Arc NFT Indexer

Real-time blockchain indexer that syncs NFT and marketplace events from Arc Layer 1 to Supabase database.

## Overview

The indexer listens to smart contract events and automatically updates the Supabase database with:
- New NFT mints
- NFT transfers
- Marketplace listings
- NFT sales
- Listing cancellations

## Setup

### 1. Get Supabase Service Role Key

1. Go to https://supabase.com/dashboard/project/byptgmzcsdnrbouzzinn
2. Click **Settings** → **API**
3. Copy the **service_role** key (NOT the anon key)
4. This key has admin privileges - keep it secret!

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
# Supabase (use service_role key for backend)
SUPABASE_URL=https://byptgmzcsdnrbouzzinn.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Arc Layer 1 Configuration
ARC_RPC_URL=https://rpc.arc.network
NFT_CONTRACT_ADDRESS=0xYourNFTContractAddress
MARKETPLACE_CONTRACT_ADDRESS=0xYourMarketplaceContractAddress
```

### 3. Install Dependencies

The indexer uses the same dependencies as the main project:

```bash
npm install
```

### 4. Run the Indexer

```bash
# Development mode with auto-reload
npx tsx watch scripts/indexer.ts

# Production mode
npx tsx scripts/indexer.ts
```

## How It Works

### Event Listeners

The indexer subscribes to these smart contract events:

**ArcNFT Contract:**
- `NFTMinted(tokenId, owner, metadataURI)` → Fetches metadata and creates NFT record
- `Transfer(from, to, tokenId)` → Updates NFT ownership

**ArcMarketplace Contract:**
- `ListingCreated(listingId, seller, tokenId, price, tokenAddress)` → Creates listing
- `NFTSold(listingId, buyer, seller, tokenId, price)` → Records sale and updates ownership
- `ListingCancelled(listingId)` → Marks listing as inactive

### Data Flow

```
Blockchain Event → Indexer → Fetch IPFS Metadata → Update Supabase
```

### Metadata Processing

When an NFT is minted:
1. Indexer receives `NFTMinted` event with metadata URI
2. Fetches JSON metadata from IPFS (via Pinata gateway)
3. Extracts name, description, image URL, attributes
4. Stores complete data in `nfts` table

### Real-time Updates

- Events are processed in real-time as they occur on-chain
- Supabase database is immediately updated
- Frontend queries Supabase for instant data (no blockchain calls needed)

## Benefits

✅ **Fast queries** - Database queries are 100x faster than blockchain RPC calls  
✅ **No rate limits** - Supabase has generous free tier (500MB DB)  
✅ **Search & filters** - SQL queries enable advanced search  
✅ **Historical data** - Complete sales history and analytics  
✅ **Lower costs** - Fewer RPC calls to Arc Layer 1  

## Deployment

### Option 1: Local Server

Run on your local machine or server:

```bash
pm2 start scripts/indexer.ts --name arc-indexer --interpreter tsx
pm2 save
pm2 startup
```

### Option 2: Cloud Service

Deploy to Railway, Render, or Fly.io:

1. Add `scripts/indexer.ts` as the start command
2. Set environment variables in dashboard
3. Deploy!

### Option 3: Serverless

For production, consider using a cron job to backfill missed events:

```typescript
// Add to scripts/backfill.ts
async function backfillEvents(fromBlock: number, toBlock: number) {
  const events = await nftContract.queryFilter(
    nftContract.filters.NFTMinted(),
    fromBlock,
    toBlock
  );
  
  for (const event of events) {
    await handleNFTMinted(event.args[0], event.args[1], event.args[2], event);
  }
}
```

## Monitoring

Add logging to track indexer health:

```bash
# Check indexer logs
pm2 logs arc-indexer

# Monitor process
pm2 monit
```

## Cost

| Component | Free Tier | Notes |
|-----------|-----------|-------|
| Supabase | 500MB database | Enough for ~50k NFTs |
| Arc RPC | Unlimited | Native blockchain access |
| IPFS Gateway | Unlimited | Pinata/IPFS.io gateways |

**Total: $0/month** for small/medium marketplaces!

## Troubleshooting

### Indexer not starting

- Check `.env` file exists with correct keys
- Verify contract addresses are correct
- Ensure RPC URL is accessible

### Events not being indexed

- Check contract addresses match deployed contracts
- Verify Supabase service role key has insert permissions
- Check console for error messages

### Metadata fetch failures

- IPFS gateway might be slow - add retry logic
- Metadata URI might be invalid - add validation
- Consider caching metadata locally

## Future Enhancements

- [ ] Add backfill script for historical events
- [ ] Implement retry logic for failed transactions
- [ ] Add metrics and monitoring (Prometheus/Grafana)
- [ ] Support multiple NFT collections
- [ ] Add websocket notifications to frontend
- [ ] Implement event deduplication
- [ ] Add database migrations

## Resources

- [Supabase Realtime](https://supabase.com/docs/guides/realtime)
- [Ethers.js Event Listeners](https://docs.ethers.org/v6/api/contract/#ContractEvent)
- [Arc Layer 1 Docs](https://docs.arc.network)
