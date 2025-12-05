import { createClient } from '@supabase/supabase-js'
import { ethers } from 'ethers'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

// Resolve __dirname in ESM
const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Load ABI via filesystem to avoid ESM JSON import issues
const arcAbiPath = path.resolve(__dirname, '../lib/abis/ArcNFT.json')
const ArcNFTABI = JSON.parse(fs.readFileSync(arcAbiPath, 'utf8'))

// Load environment variables from frontend/.env.local or project root .env if present
dotenv.config({ path: path.resolve(__dirname, '../.env.local') })
dotenv.config({ path: path.resolve(__dirname, '../../.env') })

// Configuração
const RPC_URL = process.env.ARC_RPC_URL || 'https://rpc.testnet.arc.network'
const NFT_CONTRACT_ADDRESS = process.env.NFT_CONTRACT_ADDRESS || '0x88FEB9dcDbAbE6f3e2fEdCC643B183Ea061f6402'
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
const PINATA_JWT = process.env.NEXT_PUBLIC_PINATA_JWT

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
const provider = new ethers.JsonRpcProvider(RPC_URL)
const nftContract = new ethers.Contract(NFT_CONTRACT_ADDRESS, ArcNFTABI, provider)

// App base (used to resolve leading-slash URIs)
const APP_BASE = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

function ipfsGatewaysForCid(cid: string) {
  return [
    `https://gateway.pinata.cloud/ipfs/${cid}`,
    `https://ipfs.io/ipfs/${cid}`,
    `https://cloudflare-ipfs.com/ipfs/${cid}`,
  ]
}

function normalizeMetadataCandidates(metadataUrl: string): string[] {
  if (!metadataUrl) return []

  // Already an absolute URL
  if (metadataUrl.startsWith('http://') || metadataUrl.startsWith('https://')) {
    return [metadataUrl]
  }

  // ipfs://CID or ipfs://ipfs/CID
  if (metadataUrl.startsWith('ipfs://')) {
    let cid = metadataUrl.replace('ipfs://', '')
    if (cid.startsWith('ipfs/')) cid = cid.replace('ipfs/', '')
    return ipfsGatewaysForCid(cid)
  }

  // Leading slash (e.g. /api/ipfs/...) — resolve against app base
  // Leading slash (e.g. /api/ipfs/...) — prefer converting our proxy path to
  // public IPFS gateways if it's the IPFS proxy path, otherwise resolve against app base
  if (metadataUrl.startsWith('/')) {
    const apiMatch = metadataUrl.match(/^\/api\/ipfs\/(.+)$/)
    if (apiMatch) {
      const cid = apiMatch[1]
      return ipfsGatewaysForCid(cid).concat([APP_BASE.replace(/\/$/, '') + metadataUrl])
    }
    return [APP_BASE.replace(/\/$/, '') + metadataUrl]
  }

  // Bare CID or path like bafkrei... or Qm... -> try IPFS gateways
  const cidLike = /^[A-Za-z0-9]+$/
  if (cidLike.test(metadataUrl) || metadataUrl.startsWith('Qm') || metadataUrl.startsWith('baf')) {
    return ipfsGatewaysForCid(metadataUrl)
  }

  // Fallback: try as relative to app base
  return [APP_BASE.replace(/\/$/, '') + '/' + metadataUrl.replace(/^\//, '')]
}

// Função para buscar metadados do IPFS com retries e fallback de gateways
async function fetchMetadata(metadataUrl: string): Promise<any> {
  const candidates = normalizeMetadataCandidates(metadataUrl)
  if (!candidates.length) return null

  for (const url of candidates) {
    // Try each candidate with a small retry loop
    const maxAttempts = 2 // Reduzido de 3 para 2
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const timeoutMs = 15000 // 15s fixo (não aumentar)
        
        // Add Pinata auth if using Pinata gateway
        const headers: Record<string, string> = {}
        if (url.includes('gateway.pinata.cloud') && PINATA_JWT) {
          headers['Authorization'] = `Bearer ${PINATA_JWT}`
        }
        
        const res = await fetch(url, { 
          signal: AbortSignal.timeout(timeoutMs),
          headers
        })
        
        if (!res.ok) {
          if (res.status === 429) {
            // Rate limited - wait longer before retry
            if (attempt < maxAttempts) {
              await new Promise(r => setTimeout(r, 5000)) // 5s wait
            }
            throw new Error(`HTTP ${res.status}`)
          }
          throw new Error(`HTTP ${res.status}`)
        }
        
        const contentType = res.headers.get('content-type') || ''
        if (contentType.includes('application/json') || contentType.includes('text/json')) {
          return await res.json()
        }
        // Try to parse text as JSON as a fallback
        const text = await res.text()
        try {
          return JSON.parse(text)
        } catch (e) {
          throw new Error('Response is not JSON')
        }
      } catch (err: any) {
        const errMsg = err?.message || String(err)
        // Don't log every single timeout/429, just track it
        if (!errMsg.includes('429') && !errMsg.includes('timeout')) {
          console.warn(`  fetch attempt ${attempt} failed for ${url}:`, errMsg)
        }
        // Only wait between attempts if not a 429 (already waited above)
        if (attempt < maxAttempts && !errMsg.includes('429')) {
          await new Promise(r => setTimeout(r, attempt * 2000))
        }
      }
    }
  }

  // Only log failed URLs that aren't timing out
  console.error(`⚠️  Could not fetch metadata from ${metadataUrl}`)
  return null
}

// Função para indexar um NFT
async function indexNFT(tokenId: number) {
  try {
    // Verificar se já está indexado
    const { data: existing } = await supabase
      .from('nfts')
      .select('id, image_url')
      .eq('contract_address', NFT_CONTRACT_ADDRESS.toLowerCase())
      .eq('token_id', tokenId)
      .single()

    if (existing) {
      console.log(`⏭️  NFT #${tokenId} já indexado, verificando imagem...`)
      // If existing record has no image_url, try to fetch and update it
      if (!existing.image_url || existing.image_url === '') {
        try {
          // Fetch tokenURI and metadata to get image
          const tokenURI = await nftContract.tokenURI(tokenId)
          const metadata = await fetchMetadata(tokenURI)
          
          if (metadata && metadata.image) {
            const imgCandidates = normalizeMetadataCandidates(metadata.image)
            const newImage = imgCandidates.length ? imgCandidates[0] : ''
            if (newImage) {
              const { error: updErr } = await supabase
                .from('nfts')
                .update({ image_url: newImage })
                .eq('id', existing.id)

              if (updErr) console.error(`Erro ao atualizar image_url para NFT #${tokenId}:`, updErr)
              else console.log(`🔁 Atualizada image_url para NFT #${tokenId}`)
            }
          }
        } catch (e) {
          console.error('Erro ao tentar atualizar image_url do NFT existente:', e)
        }
      }

      return
    }

    // Buscar dados on-chain
    console.log(`📡 Buscando dados do NFT #${tokenId}...`)
    
    const [owner, tokenURI] = await Promise.all([
      nftContract.ownerOf(tokenId),
      nftContract.tokenURI(tokenId)
    ])

    console.log(`  Owner: ${owner}`)
    console.log(`  TokenURI: ${tokenURI}`)

    // Buscar metadados
    const metadata = await fetchMetadata(tokenURI)
    
    if (!metadata) {
      console.warn(`⚠️  Não foi possível buscar metadados para NFT #${tokenId}`)
      // Continua mesmo sem metadados
    }

    // Normalizar image URL
    let imageUrl = metadata?.image || ''
    if (imageUrl) {
      // Reuse normalization logic for image field
      const imgCandidates = normalizeMetadataCandidates(imageUrl)
      imageUrl = imgCandidates.length ? imgCandidates[0] : imageUrl
    }

    // Extrair royalty dos atributos
    const royalty = metadata?.attributes?.find((a: any) => 
      a.trait_type === 'Royalty' || a.trait_type === 'royalty'
    )?.value || 0

    // Inserir no Supabase
    const { error } = await supabase.from('nfts').insert({
      token_id: tokenId,
      contract_address: NFT_CONTRACT_ADDRESS.toLowerCase(),
      owner_address: owner.toLowerCase(),
      creator_address: owner.toLowerCase(), // Assumimos que o owner atual é o creator
      name: metadata?.name || `NFT #${tokenId}`,
      description: metadata?.description || '',
      image_url: imageUrl,
      metadata_url: tokenURI,
      metadata_json: metadata,
      royalty_percentage: parseFloat(royalty) || 0,
      minted_at: new Date().toISOString(),
    })

    if (error) {
      console.error(`❌ Erro ao inserir NFT #${tokenId}:`, error)
    } else {
      console.log(`✅ NFT #${tokenId} indexado com sucesso!`)
    }
  } catch (error: any) {
    console.error(`❌ Erro ao processar NFT #${tokenId}:`, error.message)
  }
}

// Função principal
async function main() {
  console.log('🚀 Iniciando sincronização de NFTs...')
  console.log(`📍 Contrato: ${NFT_CONTRACT_ADDRESS}`)
  console.log(`🌐 RPC: ${RPC_URL}\n`)

  try {
    // Buscar o total de NFTs mintados
    const totalSupply = await nftContract.totalSupply()
    const total = Number(totalSupply)
    
    console.log(`📊 Total de NFTs para sincronizar: ${total}\n`)

    if (total === 0) {
      console.log('ℹ️  Nenhum NFT encontrado no contrato.')
      return
    }

    // Indexar cada NFT
    for (let i = 0; i < total; i++) {
      const tokenId = await nftContract.tokenByIndex(i)
      await indexNFT(Number(tokenId))
      
      // Delay maior para evitar rate limiting (1.5s entre cada NFT)
      if (i < total - 1) {
        await new Promise(resolve => setTimeout(resolve, 1500))
      }
    }

    console.log('\n✨ Sincronização concluída!')
  } catch (error: any) {
    console.error('❌ Erro durante sincronização:', error)
    process.exit(1)
  }
}

// Executar
main().catch(console.error)
