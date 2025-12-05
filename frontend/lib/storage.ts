/**
 * Storage Integration
 * 
 * Handles file uploads:
 * - Profile images (avatar/banner) -> Supabase Storage (simple, fast, free)
 * - NFT images/metadata -> IPFS via Pinata (permanent, decentralized)
 */

import { createSupabaseClient } from '@/lib/supabase'

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

/**
 * Upload profile image to Supabase Storage
 * @param file - Image file to upload
 * @param userId - User ID for folder organization
 * @param type - Type of image (avatar or banner)
 * @param onProgress - Optional callback for upload progress
 * @returns Public URL of uploaded image
 */
export async function uploadProfileImage(
  file: File,
  userId: string,
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

    const supabase = createSupabaseClient();

    // Simulate initial progress
    if (onProgress) {
      onProgress({ loaded: 0, total: file.size, percentage: 0 });
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${type}-${Date.now()}.${fileExt}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (error) {
      console.error('Supabase upload error:', error);
      throw error;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(data.path);

    // Simulate progress completion
    if (onProgress) {
      onProgress({ loaded: file.size, total: file.size, percentage: 100 });
    }

    return publicUrl;
  } catch (error) {
    console.error('Error uploading profile image:', error);
    throw new Error('Failed to upload profile image');
  }
}
