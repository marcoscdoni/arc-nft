import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
const PINATA_JWT = process.env.NEXT_PUBLIC_PINATA_JWT

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

async function fetchMetadata(url: string): Promise<any> {
  try {
    // Normalize URL
    let fetchUrl = url
    
    if (url.startsWith('/api/ipfs/')) {
      const cid = url.replace('/api/ipfs/', '')
      fetchUrl = `https://gateway.pinata.cloud/ipfs/${cid}`
    } else if (url.startsWith('ipfs://')) {
      const cid = url.replace('ipfs://', '').replace(/^ipfs\//, '')
      fetchUrl = `https://gateway.pinata.cloud/ipfs/${cid}`
    }
    
    const headers: Record<string, string> = {}
    if (PINATA_JWT && fetchUrl.includes('gateway.pinata.cloud')) {
      headers['Authorization'] = `Bearer ${PINATA_JWT}`
    }
    
    const res = await fetch(fetchUrl, { 
      headers,
      signal: AbortSignal.timeout(10000)
    })
    
    if (!res.ok) return null
    return await res.json()
  } catch (e) {
    console.error(`Failed to fetch ${url}:`, e)
    return null
  }
}

async function main() {
  console.log('🔍 Atualizando image_url para usar gateway ipfs.io...\n')
  
  const { data: nfts, error } = await supabase
    .from('nfts')
    .select('*')
  
  if (error) {
    console.error('Erro ao buscar NFTs:', error)
    process.exit(1)
  }
  
  if (!nfts || nfts.length === 0) {
    console.log('✅ Nenhum NFT encontrado!')
    return
  }
  
  console.log(`📊 Encontrados ${nfts.length} NFTs\n`)
  
  for (const nft of nfts) {
    console.log(`🔧 NFT #${nft.token_id} (${nft.name})`)
    console.log(`   image_url atual: ${nft.image_url}`)
    
    // Skip if already using ipfs.io
    if (nft.image_url?.startsWith('https://ipfs.io/ipfs/')) {
      console.log(`   ✅ Já usa ipfs.io gateway\n`)
      continue
    }
    
    let newImageUrl = nft.image_url
    
    // If empty, try to fetch from metadata
    if (!nft.image_url || nft.image_url.trim() === '') {
      console.log(`   ⚠️  image_url vazio, buscando metadata...`)
      const metadata = await fetchMetadata(nft.metadata_url)
      
      if (!metadata || !metadata.image) {
        console.log(`   ❌ Não foi possível obter metadata.image\n`)
        continue
      }
      
      newImageUrl = metadata.image
      console.log(`   📦 metadata.image: ${newImageUrl}`)
    }
    
    // Normalize to ipfs.io format
    let normalizedUrl = newImageUrl
    
    if (normalizedUrl.includes('/ipfs/')) {
      const cid = normalizedUrl.split('/ipfs/')[1].split('?')[0]
      normalizedUrl = `https://ipfs.io/ipfs/${cid}`
    } else if (normalizedUrl.startsWith('ipfs://')) {
      const cid = normalizedUrl.replace('ipfs://', '').replace(/^ipfs\//, '')
      normalizedUrl = `https://ipfs.io/ipfs/${cid}`
    } else if (/^(Qm|baf)/i.test(normalizedUrl)) {
      normalizedUrl = `https://ipfs.io/ipfs/${normalizedUrl}`
    }
    
    const { error: updateError } = await supabase
      .from('nfts')
      .update({ image_url: normalizedUrl })
      .eq('id', nft.id)
    
    if (updateError) {
      console.log(`   ❌ Erro ao atualizar: ${updateError.message}\n`)
    } else {
      console.log(`   ✅ Atualizado para: ${normalizedUrl}\n`)
    }
    
    // Rate limiting
    await new Promise(r => setTimeout(r, 500))
  }
  
  console.log('✨ Concluído!')
}

main().catch(console.error)
