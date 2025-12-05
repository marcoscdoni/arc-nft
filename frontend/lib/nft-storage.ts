// Using Cloudflare R2 for reliable, free storage
// Documentation: https://developers.cloudflare.com/r2/

import { uploadToR2 } from './r2-storage';

export interface NFTMetadata {
  name: string;
  description: string;
  image: string; // IPFS URL after image upload
  attributes?: Array<{
    trait_type: string;
    value: string | number;
  }>;
  external_url?: string;
  animation_url?: string;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

/**
 * Upload image file to R2
 * Returns the public URL for the uploaded image
 */
export async function uploadImage(
  file: File | Blob,
  onProgress?: (progress: UploadProgress) => void
): Promise<string> {
  try {
    // Convert File/Blob to Buffer for server-side upload
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Simulate progress
    if (onProgress) {
      onProgress({ loaded: 0, total: file.size, percentage: 0 });
    }
    
    // Note: For client-side, we'll need to use an API route
    // This is a placeholder that will be called from the server
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch('/api/upload-image', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Upload failed: ${response.status} - ${error}`);
    }
    
    const result = await response.json();
    
    // Simulate progress for better UX
    if (onProgress) {
      onProgress({ loaded: file.size, total: file.size, percentage: 100 });
    }
    
    return result.imageUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw new Error('Failed to upload image');
  }
}

/**
 * Upload complete NFT metadata to R2
 * This includes the image URL and all other metadata
 */
export async function uploadMetadata(
  metadata: NFTMetadata,
  onProgress?: (progress: UploadProgress) => void
): Promise<string> {
  try {
    // Convert metadata to JSON string
    const metadataJson = JSON.stringify(metadata, null, 2);
    
    const response = await fetch('/api/upload-metadata', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ metadata }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Metadata upload failed: ${response.status} - ${error}`);
    }

    const result = await response.json();
    
    // Simulate progress
    if (onProgress) {
      const size = new Blob([metadataJson]).size;
      onProgress({ loaded: size, total: size, percentage: 100 });
    }

    return result.metadataUrl;
  } catch (error) {
    console.error('Error uploading metadata:', error);
    throw new Error('Failed to upload metadata');
  }
}

/**
 * Complete flow: upload image first, then upload metadata with image URL
 * Returns imageUrl (gateway HTTP) and metadataUrl (ipfs:// for contract)
 */
export async function uploadNFT(
  imageFile: File | Blob,
  metadata: Omit<NFTMetadata, 'image'>,
  onImageProgress?: (progress: UploadProgress) => void,
  onMetadataProgress?: (progress: UploadProgress) => void
): Promise<{ imageUrl: string; metadataUrl: string }> {
  try {
    // Step 1: Upload image
    const imageUrl = await uploadImage(imageFile, onImageProgress);
    
    // Step 2: Upload metadata with image URL
    const completeMetadata: NFTMetadata = {
      ...metadata,
      image: imageUrl,
    };
    
    const metadataUrl = await uploadMetadata(completeMetadata, onMetadataProgress);
    
    return { imageUrl, metadataUrl };
  } catch (error) {
    console.error('Error in complete NFT upload flow:', error);
    throw error;
  }
}

/**
 * Fetch metadata from R2 URL
 * Useful for displaying NFT details
 */
export async function fetchMetadata(url: string): Promise<NFTMetadata> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch metadata: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching metadata:', error);
    throw new Error('Failed to fetch NFT metadata');
  }
}

/**
 * Check if R2 is properly configured
 */
export function isConfigured(): boolean {
  return !!(
    process.env.R2_ENDPOINT &&
    process.env.R2_ACCESS_KEY_ID &&
    process.env.R2_SECRET_ACCESS_KEY &&
    process.env.R2_BUCKET_NAME &&
    process.env.R2_PUBLIC_URL
  );
}
