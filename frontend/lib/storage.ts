/**
 * Storage Integration
 * 
 * Handles file uploads:
 * - Profile images (avatar/banner) -> Cloudflare R2 (fast, scalable, permanent)
 * - NFT images/metadata -> IPFS via Pinata (decentralized)
 */

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

/**
 * Upload profile image to Cloudflare R2 via API route
 * @param file - Image file to upload
 * @param walletAddress - Wallet address for folder organization
 * @param type - Type of image (avatar or banner)
 * @param onProgress - Optional callback for upload progress
 * @returns Public URL of uploaded image
 */
export async function uploadProfileImage(
  file: File,
  walletAddress: string,
  type: 'avatar' | 'banner',
  onProgress?: (progress: UploadProgress) => void
): Promise<string> {
  try {
    // Validate file size (2MB for avatar, 5MB for banner)
    const maxSize = type === 'avatar' ? 2 * 1024 * 1024 : 5 * 1024 * 1024;
    if (file.size > maxSize) {
      const maxSizeMB = maxSize / (1024 * 1024);
      throw new Error(`File size exceeds ${maxSizeMB}MB limit`);
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      throw new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed');
    }

    // Simulate initial progress
    if (onProgress) {
      onProgress({ loaded: 0, total: file.size, percentage: 0 });
    }

    // Upload via API route (R2 requires server-side)
    const formData = new FormData();
    formData.append('file', file);
    formData.append('walletAddress', walletAddress);
    formData.append('type', type);

    const response = await fetch('/api/upload-profile', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Upload failed');
    }

    const { url } = await response.json();

    // Simulate progress completion
    if (onProgress) {
      onProgress({ loaded: file.size, total: file.size, percentage: 100 });
    }

    return url;
  } catch (error) {
    console.error('Error uploading profile image:', error);
    throw new Error('Failed to upload profile image');
  }
}
