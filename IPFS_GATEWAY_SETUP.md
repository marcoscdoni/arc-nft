# IPFS Gateway Setup Guide

## Problem: Rate Limiting & CORS Errors

When using Pinata's free tier, the default `gateway.pinata.cloud` has rate limits and may return:
- `429 Too Many Requests`
- `ERR_BLOCKED_BY_RESPONSE.NotSameOrigin` (CORS)

This prevents avatar/banner images from displaying after page refresh.

## Solutions

### Option 1: Dedicated Pinata Gateway (Recommended)

1. **Get a Dedicated Gateway**:
   - Login to [Pinata.cloud](https://app.pinata.cloud/)
   - Go to **Gateways** section
   - Create a new gateway (e.g., `yourproject.mypinata.cloud`)
   - Copy the gateway domain

2. **Configure Environment Variable**:
   ```bash
   # frontend/.env.local
   NEXT_PUBLIC_PINATA_GATEWAY_DOMAIN=yourproject.mypinata.cloud
   ```

3. **Benefits**:
   - No rate limits
   - Faster load times
   - Custom subdomain
   - Better reliability

### Option 2: Public IPFS Gateways (Fallback)

Use alternative public gateways (also has rate limits but different pools):

```bash
# frontend/.env.local
NEXT_PUBLIC_PINATA_GATEWAY_DOMAIN=ipfs.io
# OR
NEXT_PUBLIC_PINATA_GATEWAY_DOMAIN=cloudflare-ipfs.com
```

### Option 3: Next.js API Proxy (Advanced)

Create a proxy route to bypass CORS:

```typescript
// frontend/app/api/ipfs/[...path]/route.ts
export async function GET(
  req: Request,
  { params }: { params: { path: string[] } }
) {
  const ipfsPath = params.path.join('/');
  const response = await fetch(`https://gateway.pinata.cloud/ipfs/${ipfsPath}`);
  const blob = await response.blob();
  
  return new Response(blob, {
    headers: {
      'Content-Type': response.headers.get('Content-Type') || 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
```

Then use: `https://yourdomain.com/api/ipfs/${cid}` instead of Pinata gateway.

## Implementation Details

### 1. Configurable Gateway Domain

**File**: `frontend/lib/nft-storage.ts`

```typescript
const gatewayDomain = process.env.NEXT_PUBLIC_PINATA_GATEWAY_DOMAIN || 'gateway.pinata.cloud';
return `https://${gatewayDomain}/ipfs/${cid}`;
```

### 2. Next.js Image Configuration

**File**: `frontend/next.config.ts`

```typescript
images: {
  remotePatterns: [
    { protocol: 'https', hostname: 'gateway.pinata.cloud' },
    { protocol: 'https', hostname: '*.mypinata.cloud' },
    { protocol: 'https', hostname: 'ipfs.io' },
    { protocol: 'https', hostname: 'cloudflare-ipfs.com' },
  ],
}
```

### 3. Image Component Usage

**File**: `frontend/app/[locale]/profile/page.tsx`

```tsx
import Image from 'next/image';

<Image 
  src={avatarPreview} 
  alt="Avatar"
  fill
  className="object-cover"
  unoptimized  // Required for IPFS URLs
/>
```

## Testing

1. **Upload Avatar**: Test upload works and CID is returned
2. **Check Database**: Verify `avatar_url` saved correctly in Supabase
3. **Refresh Page**: Avatar should display without CORS/429 errors
4. **Browser Console**: No errors, image loads successfully
5. **Network Tab**: Check response headers and status codes

## Troubleshooting

### Still Getting 429 Errors?
- Switch to dedicated gateway or alternative gateway
- Check Pinata account limits
- Clear browser cache

### Images Not Loading?
- Verify `NEXT_PUBLIC_PINATA_GATEWAY_DOMAIN` is set correctly
- Check `next.config.ts` includes gateway hostname
- Ensure `unoptimized` prop is set on Image component
- Check browser Network tab for actual URL being requested

### CORS Errors Persist?
- Use Next.js API proxy option
- Verify gateway supports CORS (Pinata gateways do)
- Check browser console for specific CORS headers missing

## Gateway Comparison

| Gateway | Rate Limit | CORS | Speed | Cost |
|---------|-----------|------|-------|------|
| `gateway.pinata.cloud` | ⚠️ Yes | ✅ | Fast | Free |
| Dedicated Pinata | ✅ None | ✅ | Fastest | Paid |
| `ipfs.io` | ⚠️ Yes | ✅ | Medium | Free |
| `cloudflare-ipfs.com` | ⚠️ Yes | ✅ | Fast | Free |
| Next.js Proxy | ✅ None | ✅ | Medium | Your hosting |

## Best Practices

1. **Production**: Use dedicated Pinata gateway
2. **Development**: Free gateway.pinata.cloud is fine (low traffic)
3. **Caching**: Next.js Image component handles caching automatically
4. **Fallbacks**: Configure multiple gateways for redundancy
5. **Monitoring**: Track gateway response times and errors

## Resources

- [Pinata Gateway Docs](https://docs.pinata.cloud/gateways)
- [IPFS Gateway Checker](https://ipfs.github.io/public-gateway-checker/)
- [Next.js Image Optimization](https://nextjs.org/docs/app/api-reference/components/image)
