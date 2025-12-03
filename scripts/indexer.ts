import { createClient } from '@supabase/supabase-js';
import { ethers } from 'ethers';
import ArcNFTABI from '../frontend/lib/abis/ArcNFT.json';
import ArcMarketplaceABI from '../frontend/lib/abis/ArcMarketplace.json';

// Supabase configuration (use service role key for backend)
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Arc Layer 1 RPC and contract addresses
const RPC_URL = process.env.ARC_RPC_URL || 'https://rpc.arc.network';
const NFT_CONTRACT_ADDRESS = process.env.NFT_CONTRACT_ADDRESS!;
const MARKETPLACE_CONTRACT_ADDRESS = process.env.MARKETPLACE_CONTRACT_ADDRESS!;

// Initialize provider and contracts
const provider = new ethers.JsonRpcProvider(RPC_URL);
const nftContract = new ethers.Contract(NFT_CONTRACT_ADDRESS, ArcNFTABI.abi, provider);
const marketplaceContract = new ethers.Contract(MARKETPLACE_CONTRACT_ADDRESS, ArcMarketplaceABI.abi, provider);

// Fetch and parse metadata from IPFS
async function fetchMetadata(metadataUrl: string): Promise<any> {
  try {
    const gatewayUrl = metadataUrl.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/');
    const response = await fetch(gatewayUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch metadata: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching metadata:', error);
    return null;
  }
}

// Event handlers
async function handleNFTMinted(tokenId: bigint, owner: string, metadataURI: string, event: any) {
  console.log(`NFT Minted: Token ${tokenId} to ${owner}`);

  try {
    // Fetch metadata
    const metadata = await fetchMetadata(metadataURI);
    const imageUrl = metadata?.image?.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/') || '';

    // Insert NFT into database
    const { error } = await supabase.from('nfts').insert({
      token_id: Number(tokenId),
      contract_address: NFT_CONTRACT_ADDRESS.toLowerCase(),
      owner_address: owner.toLowerCase(),
      creator_address: owner.toLowerCase(), // Creator is the minter
      name: metadata?.name || `NFT #${tokenId}`,
      description: metadata?.description || '',
      image_url: imageUrl,
      metadata_url: metadataURI,
      metadata_json: metadata,
      royalty_percentage: metadata?.attributes?.find((a: any) => a.trait_type === 'Royalty')?.value || 0,
      minted_at: new Date().toISOString(),
    });

    if (error) {
      console.error('Error inserting NFT:', error);
    } else {
      console.log(`NFT ${tokenId} indexed successfully`);
    }
  } catch (error) {
    console.error('Error handling NFT minted event:', error);
  }
}

async function handleNFTTransfer(from: string, to: string, tokenId: bigint, event: any) {
  // Skip mint events (from = zero address)
  if (from === ethers.ZeroAddress) return;

  console.log(`NFT Transfer: Token ${tokenId} from ${from} to ${to}`);

  try {
    // Update NFT owner
    const { error } = await supabase
      .from('nfts')
      .update({
        owner_address: to.toLowerCase(),
        last_transfer_at: new Date().toISOString(),
      })
      .eq('contract_address', NFT_CONTRACT_ADDRESS.toLowerCase())
      .eq('token_id', Number(tokenId));

    if (error) {
      console.error('Error updating NFT owner:', error);
    } else {
      console.log(`NFT ${tokenId} owner updated to ${to}`);
    }
  } catch (error) {
    console.error('Error handling NFT transfer event:', error);
  }
}

async function handleListingCreated(
  listingId: bigint,
  seller: string,
  tokenId: bigint,
  price: bigint,
  tokenAddress: string,
  event: any
) {
  console.log(`Listing Created: #${listingId} - Token ${tokenId} for ${ethers.formatUnits(price, 6)} USDC`);

  try {
    // Get NFT ID from database
    const { data: nft } = await supabase
      .from('nfts')
      .select('id')
      .eq('contract_address', NFT_CONTRACT_ADDRESS.toLowerCase())
      .eq('token_id', Number(tokenId))
      .single();

    if (!nft) {
      console.error(`NFT ${tokenId} not found in database`);
      return;
    }

    // Insert listing
    const { error } = await supabase.from('listings').insert({
      listing_id: Number(listingId),
      nft_id: nft.id,
      seller_address: seller.toLowerCase(),
      price: ethers.formatUnits(price, 6),
      token_address: tokenAddress.toLowerCase(),
      is_active: true,
    });

    if (error) {
      console.error('Error inserting listing:', error);
    } else {
      console.log(`Listing ${listingId} indexed successfully`);
    }
  } catch (error) {
    console.error('Error handling listing created event:', error);
  }
}

async function handleNFTSold(
  listingId: bigint,
  buyer: string,
  seller: string,
  tokenId: bigint,
  price: bigint,
  event: any
) {
  console.log(`NFT Sold: Token ${tokenId} for ${ethers.formatUnits(price, 6)} USDC`);

  try {
    // Get NFT ID
    const { data: nft } = await supabase
      .from('nfts')
      .select('id')
      .eq('contract_address', NFT_CONTRACT_ADDRESS.toLowerCase())
      .eq('token_id', Number(tokenId))
      .single();

    // Mark listing as inactive
    await supabase
      .from('listings')
      .update({
        is_active: false,
        sold_at: new Date().toISOString(),
      })
      .eq('listing_id', Number(listingId));

    // Record sale
    if (nft) {
      await supabase.from('sales').insert({
        nft_id: nft.id,
        listing_id: Number(listingId),
        seller_address: seller.toLowerCase(),
        buyer_address: buyer.toLowerCase(),
        price: ethers.formatUnits(price, 6),
        token_address: ethers.ZeroAddress, // Update with actual token address if available
        transaction_hash: event.transactionHash,
      });
    }

    console.log(`Sale recorded for listing ${listingId}`);
  } catch (error) {
    console.error('Error handling NFT sold event:', error);
  }
}

async function handleListingCancelled(listingId: bigint, event: any) {
  console.log(`Listing Cancelled: #${listingId}`);

  try {
    await supabase
      .from('listings')
      .update({
        is_active: false,
        cancelled_at: new Date().toISOString(),
      })
      .eq('listing_id', Number(listingId));

    console.log(`Listing ${listingId} cancelled`);
  } catch (error) {
    console.error('Error handling listing cancelled event:', error);
  }
}

// Main indexer function
async function startIndexer() {
  console.log('🚀 Starting Arc NFT Indexer...');
  console.log(`NFT Contract: ${NFT_CONTRACT_ADDRESS}`);
  console.log(`Marketplace Contract: ${MARKETPLACE_CONTRACT_ADDRESS}`);
  console.log(`Supabase URL: ${supabaseUrl}\n`);

  try {
    // Listen to NFT events
    nftContract.on('NFTMinted', handleNFTMinted);
    nftContract.on('Transfer', handleNFTTransfer);

    // Listen to Marketplace events
    marketplaceContract.on('ListingCreated', handleListingCreated);
    marketplaceContract.on('NFTSold', handleNFTSold);
    marketplaceContract.on('ListingCancelled', handleListingCancelled);

    console.log('✅ Indexer started successfully!');
    console.log('📡 Listening for blockchain events...\n');
  } catch (error) {
    console.error('❌ Error starting indexer:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down indexer...');
  nftContract.removeAllListeners();
  marketplaceContract.removeAllListeners();
  process.exit(0);
});

// Start the indexer
startIndexer();
