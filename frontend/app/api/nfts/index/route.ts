import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      tokenId,
      contractAddress,
      ownerAddress,
      creatorAddress,
      name,
      description,
      imageUrl,
      metadataUrl,
      metadataJson,
      royaltyPercentage
    } = body

    // Validate required fields
    if (!tokenId || !contractAddress || !ownerAddress || !name || !imageUrl || !metadataUrl) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create admin client with service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      }
    })

    // Normalize image URL - use ipfs.io gateway (public, no CAPTCHA)
    function normalizeImageForStorage(u?: string | null) {
      if (!u) return ''
      const s = u.trim()
      if (s === '') return ''
      
      // Extract CID from any IPFS gateway or path
      if (s.includes('/ipfs/')) {
        const cid = s.split('/ipfs/')[1].split('?')[0]
        return `https://ipfs.io/ipfs/${cid}`
      }
      
      // ipfs:// protocol
      if (s.startsWith('ipfs://')) {
        const cid = s.replace('ipfs://', '').replace(/^ipfs\//, '')
        return `https://ipfs.io/ipfs/${cid}`
      }
      
      // Bare CID
      if (/^(Qm|baf)/i.test(s)) {
        return `https://ipfs.io/ipfs/${s}`
      }
      
      return s
    }

    // Check if NFT already exists
    const { data: existing } = await supabase
      .from('nfts')
      .select('*')
      .eq('contract_address', contractAddress.toLowerCase())
      .eq('token_id', tokenId)
      .single()

    if (existing) {
      // Update owner if changed
      if (existing.owner_address.toLowerCase() !== ownerAddress.toLowerCase()) {
        const { data, error } = await supabase
          .from('nfts')
          .update({
            owner_address: ownerAddress.toLowerCase(),
            last_transfer_at: new Date().toISOString(),
          })
          .eq('id', existing.id)
          .select()
          .single()

        if (error) {
          console.error('Update error:', error)
          return NextResponse.json({ error: error.message }, { status: 500 })
        }
        return NextResponse.json(data)
      }
      
      return NextResponse.json(existing)
    }

    // Insert new NFT
    const { data, error } = await supabase
      .from('nfts')
      .insert({
        token_id: tokenId,
        contract_address: contractAddress.toLowerCase(),
        owner_address: ownerAddress.toLowerCase(),
        creator_address: creatorAddress.toLowerCase(),
        name,
        description: description || '',
        image_url: normalizeImageForStorage(imageUrl),
        metadata_url: metadataUrl,
        metadata_json: metadataJson,
        royalty_percentage: royaltyPercentage || 0,
        minted_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error('Insert error:', error)
      return NextResponse.json(
        { error: error.message, details: error.details },
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
