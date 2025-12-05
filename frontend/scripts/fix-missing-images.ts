import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

async function fixMissingImages() {
  console.log('🔍 Buscando NFTs sem imagem...\n')

  // Fetch all NFTs with empty image_url
  const { data: nfts, error } = await supabase
    .from('nfts')
    .select('*')
    .or('image_url.is.null,image_url.eq.')

  if (error) {
    console.error('❌ Erro ao buscar NFTs:', error)
    return
  }

  if (!nfts || nfts.length === 0) {
    console.log('✅ Todos os NFTs já têm imagem!')
    return
  }

  console.log(`📊 Encontrados ${nfts.length} NFTs sem imagem\n`)

  for (const nft of nfts) {
    console.log(`🔧 Processando NFT #${nft.token_id}...`)
    console.log(`   metadata_url: ${nft.metadata_url}`)

    // Try to get image from metadata_url
    let imageUrl = ''
    const metadataUrl = nft.metadata_url

    if (!metadataUrl) {
      console.log('   ⚠️  Sem metadata_url, pulando...\n')
      continue
    }

    // Extract CID from different formats
    let cid = ''
    
    // Format: /api/ipfs/CID
    const apiMatch = metadataUrl.match(/^\/api\/ipfs\/(.+)$/)
    if (apiMatch) {
      cid = apiMatch[1]
    }
    
    // Format: ipfs://CID
    if (metadataUrl.startsWith('ipfs://')) {
      cid = metadataUrl.replace('ipfs://', '').replace(/^ipfs\//, '')
    }

    if (cid && cid !== 'QmTestConsoleMint') {
      // Try to fetch metadata to get image field
      try {
        const metadataGateway = `https://gateway.pinata.cloud/ipfs/${cid}`
        console.log(`   📡 Fetching metadata from: ${metadataGateway}`)
        
        const res = await fetch(metadataGateway, {
          headers: {
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_PINATA_JWT || ''}`
          },
          signal: AbortSignal.timeout(10000)
        })

        if (res.ok) {
          const metadata = await res.json()
          console.log(`   ✅ Metadata fetched:`, metadata)
          
          if (metadata.image) {
            let imgCid = ''
            
            // Extract CID from image field
            if (metadata.image.startsWith('/api/ipfs/')) {
              imgCid = metadata.image.replace('/api/ipfs/', '')
            } else if (metadata.image.startsWith('ipfs://')) {
              imgCid = metadata.image.replace('ipfs://', '').replace(/^ipfs\//, '')
            } else if (metadata.image.startsWith('http')) {
              imageUrl = metadata.image
            } else {
              // Assume it's a bare CID
              imgCid = metadata.image
            }

            if (imgCid) {
              imageUrl = `https://gateway.pinata.cloud/ipfs/${imgCid}`
            }
          }
        } else {
          console.log(`   ⚠️  HTTP ${res.status} fetching metadata`)
        }
      } catch (err: any) {
        console.log(`   ⚠️  Failed to fetch metadata: ${err.message}`)
      }
    }

    // Update the NFT with image_url
    if (imageUrl) {
      console.log(`   💾 Atualizando image_url para: ${imageUrl}`)
      
      const { error: updateError } = await supabase
        .from('nfts')
        .update({ image_url: imageUrl })
        .eq('id', nft.id)

      if (updateError) {
        console.error(`   ❌ Erro ao atualizar:`, updateError)
      } else {
        console.log(`   ✅ NFT #${nft.token_id} atualizado!\n`)
      }
    } else {
      console.log(`   ⚠️  Não foi possível extrair image_url\n`)
    }

    // Small delay to avoid rate limits
    await new Promise(r => setTimeout(r, 1000))
  }

  console.log('\n✨ Processo concluído!')
}

fixMissingImages().catch(console.error)
