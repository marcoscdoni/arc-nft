import { NextRequest, NextResponse } from 'next/server';

/**
 * IPFS Proxy API Route for Pinata
 * 
 * Proxies IPFS content from Pinata gateway with authentication
 * to handle private files uploaded to Pinata
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ cid: string }> }
) {
  try {
    const { cid } = await context.params;
    
    console.log('[IPFS Proxy] Fetching CID:', cid);
    
    // Validate CID format (basic check)
    if (!cid || cid.length < 10) {
      console.error('[IPFS Proxy] Invalid CID:', cid);
      return NextResponse.json(
        { error: 'Invalid IPFS CID' },
        { status: 400 }
      );
    }

    // Fetch from Pinata gateway with authentication
    const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${cid}`;
    const pinataJwt = process.env.NEXT_PUBLIC_PINATA_JWT;
    
    console.log('[IPFS Proxy] Fetching from:', ipfsUrl);
    console.log('[IPFS Proxy] Has JWT:', !!pinataJwt);
    
    const headers: HeadersInit = {
      'User-Agent': 'ArcNFT/1.0',
    };
    
    // Add JWT authentication to bypass Cloudflare CAPTCHA
    if (pinataJwt) {
      headers['Authorization'] = `Bearer ${pinataJwt}`;
    }
    
    const response = await fetch(ipfsUrl, {
      headers,
      // Cache for 1 year (IPFS content is immutable)
      next: { revalidate: 31536000 },
    });
    
    console.log('[IPFS Proxy] Pinata response status:', response.status);

    if (!response.ok) {
      console.error(`IPFS fetch failed for CID ${cid}: ${response.status} ${response.statusText}`);
      
      // Fallback to public IPFS gateway if Pinata fails
      console.log(`Trying fallback gateway for CID ${cid}`);
      const fallbackUrl = `https://ipfs.io/ipfs/${cid}`;
      const fallbackResponse = await fetch(fallbackUrl, {
        headers: { 'User-Agent': 'ArcNFT/1.0' },
        next: { revalidate: 31536000 },
      });
      
      if (!fallbackResponse.ok) {
        return NextResponse.json(
          { error: `IPFS fetch failed: ${response.statusText}` },
          { status: response.status }
        );
      }
      
      const contentType = fallbackResponse.headers.get('content-type') || 'application/octet-stream';
      const data = await fallbackResponse.arrayBuffer();
      
      return new NextResponse(data, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=31536000, immutable',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
        },
      });
    }

    // Get content type from IPFS response
    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    const data = await response.arrayBuffer();

    // Return with proper caching headers
    return new NextResponse(data, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
      },
    });
  } catch (error) {
    console.error('IPFS proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch IPFS content' },
      { status: 500 }
    );
  }
}

// Handle CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
