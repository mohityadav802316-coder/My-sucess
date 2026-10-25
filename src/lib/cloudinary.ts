/**
 * Cloudinary SDK Initialization & Photo Upload Handler
 * Uses VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET
 * to securely handle direct photo uploads and URL transformations.
 */

import { Cloudinary } from '@cloudinary/url-gen';
import { auto } from '@cloudinary/url-gen/actions/resize';
import { autoGravity } from '@cloudinary/url-gen/qualifiers/gravity';

// Ensure valid Cloudinary credentials and clean up stale legacy presets
if (typeof window !== 'undefined') {
  const storedPreset = localStorage.getItem('cybermohit_cloudinary_upload_preset');
  if (!storedPreset || storedPreset === 'ml_default' || storedPreset === 'my_unsigned_preset') {
    localStorage.setItem('cybermohit_cloudinary_upload_preset', 'ML-mohit');
  }
  const storedCloud = localStorage.getItem('cybermohit_cloudinary_cloud_name');
  if (!storedCloud || storedCloud === 'my_cloud_name') {
    localStorage.setItem('cybermohit_cloudinary_cloud_name', 'xdwssllt');
  }
}

export const CLOUDINARY_CLOUD_NAME: string = 'xdwssllt';
export const CLOUDINARY_UPLOAD_PRESET: string = 'ML-mohit';

// Initialize the Cloudinary SDK instance
export const cld = new Cloudinary({
  cloud: {
    cloudName: CLOUDINARY_CLOUD_NAME,
  },
  url: {
    secure: true,
  },
});

export interface CloudinaryUploadResponse {
  url: string;
  secureUrl: string;
  publicId: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
}

/**
 * Handles photo uploads directly to Cloudinary using unsigned upload preset
 * @param file - File or Blob object to upload
 * @param folder - Destination folder on Cloudinary
 * @returns Upload result with secure CDN URL and metadata
 */
export async function uploadPhoto(
  file: File | Blob,
  folder = 'cybermohit_portfolio'
): Promise<CloudinaryUploadResponse> {
  const cloudName = 'xdwssllt';
  let uploadPreset = 'ML-mohit';

  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('cybermohit_cloudinary_upload_preset');
    if (stored && stored !== 'ml_default' && stored !== 'my_unsigned_preset') {
      uploadPreset = stored;
    } else {
      localStorage.setItem('cybermohit_cloudinary_upload_preset', 'ML-mohit');
      uploadPreset = 'ML-mohit';
    }
  }

  const endpoint = `https://api.cloudinary.com/v1_1/${cloudName.trim()}/image/upload`;
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset.trim());
  if (folder) {
    formData.append('folder', folder);
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    let errorDetail = 'Cloudinary अपलोड में समस्या आई';
    try {
      const errJson = await response.json();
      errorDetail = errJson.error?.message || errorDetail;
    } catch {}
    if (errorDetail.toLowerCase().includes('unsigned')) {
      throw new Error(
        `Cloudinary Error: Upload preset must be whitelisted for unsigned uploads (कृपया Cloudinary Settings > Upload में जाकर प्रीसेट '${uploadPreset}' का Signing Mode 'Unsigned' करें)`
      );
    }
    throw new Error(`Cloudinary Error: ${errorDetail}`);
  }

  const data = await response.json();

  return {
    url: data.url,
    secureUrl: data.secure_url,
    publicId: data.public_id,
    format: data.format,
    width: data.width,
    height: data.height,
    bytes: data.bytes,
  };
}

/**
 * Returns an optimized CDN URL with automatic format and quality delivery
 * @param publicIdOrUrl - Cloudinary publicId or full image URL
 * @param width - Desired width for responsive delivery
 */
export function getOptimizedUrl(publicIdOrUrl: string, width = 800): string {
  if (!publicIdOrUrl) return '';

  // Direct remote or already transformed URL
  if (publicIdOrUrl.startsWith('http://') || publicIdOrUrl.startsWith('https://')) {
    if (publicIdOrUrl.includes('cloudinary.com') && !publicIdOrUrl.includes('f_auto')) {
      return publicIdOrUrl.replace('/upload/', `/upload/f_auto,q_auto,w_${width}/`);
    }
    return publicIdOrUrl;
  }

  try {
    const img = cld.image(publicIdOrUrl);
    img.format('auto').quality('auto').resize(auto().gravity(autoGravity()).width(width));
    return img.toURL();
  } catch {
    return publicIdOrUrl;
  }
}

// Backward-compatible aliases
export const uploadToCloudinary = uploadPhoto;
export const getOptimizedImageUrl = getOptimizedUrl;
