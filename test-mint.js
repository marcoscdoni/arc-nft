const { createWalletClient, http, publicActions } = require('viem');
const { privateKeyToAccount } = require('viem/accounts');

// Arc Testnet config
const arcTestnet = {
  id: 5042002,
  name: 'Arc Testnet',
  network: 'arc-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'USDC',
    symbol: 'USDC',
  },
  rpcUrls: {
    default: { http: ['https://rpc.testnet.arc.network'] },
    public: { http: ['https://rpc.testnet.arc.network'] },
  },
  blockExplorers: {
    default: { name: 'ArcscanExplorer', url: 'https://testnet.arcscan.app' },
  },
};

const NFT_ADDRESS = '0x88FEB9dcDbAbE6f3e2fEdCC643B183Ea061f6402';
const ArcNFTAbi = require('./artifacts/contracts/ArcNFT.sol/ArcNFT.json').abi;

async function testMint() {
  console.log('🧪 Testing mint transaction...\n');
  
  // Create a test account (you'll need to set this env var with a test private key)
  const privateKey = process.env.TEST_PRIVATE_KEY;
  if (!privateKey) {
    console.error('❌ Set TEST_PRIVATE_KEY environment variable');
    console.log('Example: export TEST_PRIVATE_KEY=0x...');
    process.exit(1);
  }
  
  const account = privateKeyToAccount(privateKey);
  console.log('📍 Using account:', account.address);
  
  // Create wallet client
  const client = createWalletClient({
    account,
    chain: arcTestnet,
    transport: http(),
  }).extend(publicActions);
  
  // Check balance
  const balance = await client.getBalance({ address: account.address });
  console.log('💰 Balance:', balance.toString(), 'wei\n');
  
  // Prepare mint transaction
  const testTokenURI = 'ipfs://QmTest123';
  console.log('🎨 Minting with tokenURI:', testTokenURI);
  
  try {
    // Simulate first
    console.log('📋 Simulating transaction...');
    const { request } = await client.simulateContract({
      address: NFT_ADDRESS,
      abi: ArcNFTAbi,
      functionName: 'mint',
      args: [testTokenURI],
      account,
    });
    console.log('✅ Simulation successful\n');
    
    // Send transaction
    console.log('📤 Sending transaction...');
    const hash = await client.writeContract(request);
    console.log('✅ Transaction hash:', hash);
    console.log('🔗 Explorer:', `https://testnet.arcscan.app/tx/${hash}\n`);
    
    // Wait for receipt
    console.log('⏳ Waiting for confirmation...');
    const receipt = await client.waitForTransactionReceipt({ hash });
    console.log('✅ Transaction confirmed!');
    console.log('📦 Block:', receipt.blockNumber);
    console.log('⛽ Gas used:', receipt.gasUsed.toString());
    console.log('✅ Status:', receipt.status);
    
    // Parse logs to get token ID
    if (receipt.logs && receipt.logs.length > 0) {
      console.log('\n📜 Transaction logs:');
      receipt.logs.forEach((log, i) => {
        console.log(`Log ${i}:`, {
          address: log.address,
          topics: log.topics,
          data: log.data,
        });
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.cause) {
      console.error('Cause:', error.cause);
    }
    process.exit(1);
  }
}

testMint().catch(console.error);
