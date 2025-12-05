import { createPublicClient, http } from 'viem'
import { CONTRACTS, ARC_CHAIN_ID } from './contracts'
import ArcNFTAbi from './abis/ArcNFT.json'

// Cliente público para leitura da blockchain
const publicClient = createPublicClient({
  chain: {
    id: ARC_CHAIN_ID,
    name: 'Arc Testnet',
    network: 'arc-testnet',
    nativeCurrency: {
      decimals: 18,
      name: 'ARC',
      symbol: 'ARC',
    },
    rpcUrls: {
      default: { http: ['https://rpc.testnet.arc.network'] },
      public: { http: ['https://rpc.testnet.arc.network'] },
    },
  },
  transport: http(),
})

// Função para buscar metadados do IPFS
async function fetchMetadata(metadataUrl: string): Promise<any> {
  try {
    let gatewayUrl = metadataUrl
    if (metadataUrl.startsWith('ipfs://')) {
      const cid = metadataUrl.replace('ipfs://', '')
      gatewayUrl = `https://gateway.pinata.cloud/ipfs/${cid}`
    }

    const response = await fetch(gatewayUrl, { 
      signal: AbortSignal.timeout(10000),
      cache: 'force-cache',
    })
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error(`Failed to fetch metadata from ${metadataUrl}:`, error)
    return null
  }
}

// Normalizar URL IPFS para gateway
function normalizeIpfsUrl(url: string): string {
  if (url.startsWith('ipfs://')) {
    const cid = url.replace('ipfs://', '')
    return `https://gateway.pinata.cloud/ipfs/${cid}`
  }
  return url
}

// Buscar NFTs de um owner direto da blockchain
export async function getOwnedNFTsFromBlockchain(ownerAddress: string) {
  try {
    console.log('🔗 Buscando NFTs da blockchain para:', ownerAddress)

    // Buscar balance do owner
    const balance = await publicClient.readContract({
      address: CONTRACTS.NFT as `0x${string}`,
      abi: ArcNFTAbi,
      functionName: 'balanceOf',
      args: [ownerAddress as `0x${string}`],
    }) as bigint

    const balanceNum = Number(balance)
    console.log(`📊 Balance: ${balanceNum} NFTs`)

    if (balanceNum === 0) {
      return []
    }

    // Buscar cada token ID do owner usando tokenOfOwnerByIndex
    const nfts = []
    for (let i = 0; i < balanceNum; i++) {
      try {
        const tokenId = await publicClient.readContract({
          address: CONTRACTS.NFT as `0x${string}`,
          abi: ArcNFTAbi,
          functionName: 'tokenOfOwnerByIndex',
          args: [ownerAddress as `0x${string}`, BigInt(i)],
        }) as bigint

        const tokenURI = await publicClient.readContract({
          address: CONTRACTS.NFT as `0x${string}`,
          abi: ArcNFTAbi,
          functionName: 'tokenURI',
          args: [tokenId],
        }) as string

        // Buscar metadados
        const metadata = await fetchMetadata(tokenURI)

        nfts.push({
          id: `${CONTRACTS.NFT}-${tokenId}`,
          token_id: Number(tokenId),
          contract_address: CONTRACTS.NFT.toLowerCase(),
          owner_address: ownerAddress.toLowerCase(),
          creator_address: ownerAddress.toLowerCase(), // Não temos como saber o creator original
          name: metadata?.name || `NFT #${tokenId}`,
          description: metadata?.description || '',
          image_url: normalizeIpfsUrl(metadata?.image || ''),
          metadata_url: tokenURI,
          metadata_json: metadata,
          royalty_percentage: metadata?.attributes?.find((a: any) => 
            a.trait_type === 'Royalty'
          )?.value || 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
      } catch (err) {
        console.error(`Erro ao buscar NFT #${i}:`, err)
      }
    }

    return nfts
  } catch (error) {
    console.error('Erro ao buscar NFTs da blockchain:', error)
    return []
  }
}

// Buscar NFTs criados por um endereço (via eventos Transfer da blockchain)
export async function getCreatedNFTsFromBlockchain(creatorAddress: string) {
  try {
    console.log('🔗 Buscando NFTs criados da blockchain para:', creatorAddress)

    // Em vez de buscar eventos (que pode exceder o limite do RPC),
    // vamos usar uma abordagem mais simples: buscar todos os NFTs do contrato
    // e verificar quais pertencem ao creator
    
    const totalSupply = await publicClient.readContract({
      address: CONTRACTS.NFT as `0x${string}`,
      abi: ArcNFTAbi,
      functionName: 'totalSupply',
    }) as bigint

    const total = Number(totalSupply)
    console.log(`📊 Total NFTs no contrato: ${total}`)

    if (total === 0) {
      return []
    }

    // Limitar a 50 NFTs para não sobrecarregar
    const maxToCheck = Math.min(total, 50)
    const nfts = []

    for (let i = 0; i < maxToCheck; i++) {
      try {
        const tokenId = await publicClient.readContract({
          address: CONTRACTS.NFT as `0x${string}`,
          abi: ArcNFTAbi,
          functionName: 'tokenByIndex',
          args: [BigInt(i)],
        }) as bigint

        // Verificar owner atual
        const currentOwner = await publicClient.readContract({
          address: CONTRACTS.NFT as `0x${string}`,
          abi: ArcNFTAbi,
          functionName: 'ownerOf',
          args: [tokenId],
        }) as string

        const tokenURI = await publicClient.readContract({
          address: CONTRACTS.NFT as `0x${string}`,
          abi: ArcNFTAbi,
          functionName: 'tokenURI',
          args: [tokenId],
        }) as string

        const metadata = await fetchMetadata(tokenURI)

        nfts.push({
          id: `${CONTRACTS.NFT}-${tokenId}`,
          token_id: Number(tokenId),
          contract_address: CONTRACTS.NFT.toLowerCase(),
          owner_address: currentOwner.toLowerCase(),
          creator_address: creatorAddress.toLowerCase(),
          name: metadata?.name || `NFT #${tokenId}`,
          description: metadata?.description || '',
          image_url: normalizeIpfsUrl(metadata?.image || ''),
          metadata_url: tokenURI,
          metadata_json: metadata,
          royalty_percentage: metadata?.attributes?.find((a: any) => 
            a.trait_type === 'Royalty'
          )?.value || 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
      } catch (err) {
        console.error(`Erro ao buscar NFT #${i}:`, err)
      }
    }

    return nfts
  } catch (error) {
    console.error('Erro ao buscar NFTs criados da blockchain:', error)
    return []
  }
}
