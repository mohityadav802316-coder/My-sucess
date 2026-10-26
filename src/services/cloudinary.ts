/**
 * Cloudinary Photo Upload & CDN Delivery Service
 * Combines Cloudinary Unsigned Uploads for lightning-fast CDN photo hosting
 * with Firebase Firestore for structured data, metadata, and text persistence.
 */

import { Cloudinary } from '@cloudinary/url-gen';
import { auto } from '@cloudinary/url-gen/actions/resize';
import { autoGravity } from '@cloudinary/url-gen/qualifiers/gravity';
import { compressImage } from '../utils/imageCompressor';

export interface CloudinaryConfig {
  cloudName: string;
  uploadPreset: string;
  isConfigured: boolean;
}

const STORAGE_KEY_CLOUD_NAME = 'cybermohit_cloudinary_cloud_name';
const STORAGE_KEY_PRESET = 'cybermohit_cloudinary_upload_preset';

// Default configuration with fallback
export function getCloudinaryConfig(): CloudinaryConfig {
  let cloudName = 'xdwssllt';
  let uploadPreset = 'ML-mohit';

  if (typeof window !== 'undefined') {
    const storedPreset = localStorage.getItem(STORAGE_KEY_PRESET);
    if (storedPreset && storedPreset !== 'ml_default' && storedPreset !== 'my_unsigned_preset') {
      uploadPreset = storedPreset;
    } else {
      localStorage.setItem(STORAGE_KEY_PRESET, 'ML-mohit');
      uploadPreset = 'ML-mohit';
    }

    const storedCloud = localStorage.getItem(STORAGE_KEY_CLOUD_NAME);
    if (storedCloud && storedCloud !== 'my_cloud_name') {
      cloudName = storedCloud;
    } else {
      localStorage.setItem(STORAGE_KEY_CLOUD_NAME, 'xdwssllt');
      cloudName = 'xdwssllt';
    }
  }

  return {
    cloudName: cloudName.trim(),
    uploadPreset: uploadPreset.trim(),
    isConfigured: true,
  };
}

export function saveCloudinaryConfig(cloudName: string, uploadPreset: string): void {
  if (typeof window !== 'undefined') {
    if (cloudName.trim()) {
      localStorage.setItem(STORAGE_KEY_CLOUD_NAME, cloudName.trim());
    } else {
      localStorage.removeItem(STORAGE_KEY_CLOUD_NAME);
    }

    if (uploadPreset.trim()) {
      localStorage.setItem(STORAGE_KEY_PRESET, uploadPreset.trim());
    } else {
      localStorage.removeItem(STORAGE_KEY_PRESET);
    }
  }
}

/**
 * Initialize Cloudinary instance for URL transformations
 */
export function getCloudinaryInstance(): Cloudinary | null {
  const { cloudName, isConfigured } = getCloudinaryConfig();
  if (!isConfigured || !cloudName) return null;

  return new Cloudinary({
    cloud: {
      cloudName,
    },
    url: {
      secure: true,
    },
  });
}

/**
 * Generate an optimized responsive CDN URL with auto-format and auto-quality
 */
export function getOptimizedImageUrl(publicIdOrUrl: string, width = 800): string {
  if (!publicIdOrUrl) return '';

  // If it's already a full Cloudinary or remote URL
  if (publicIdOrUrl.startsWith('http://') || publicIdOrUrl.startsWith('https://')) {
    // Inject Cloudinary auto-optimization params if it's a Cloudinary asset
    if (publicIdOrUrl.includes('cloudinary.com') && !publicIdOrUrl.includes('f_auto')) {
      return publicIdOrUrl.replace('/upload/', `/upload/f_auto,q_auto,w_${width}/`);
    }
    return publicIdOrUrl;
  }

  const cld = getCloudinaryInstance();
  if (!cld) return publicIdOrUrl;

  const image = cld.image(publicIdOrUrl);
  image.format('auto').quality('auto').resize(auto().gravity(autoGravity()).width(width));
  return image.toURL();
}

export interface CloudinaryUploadResult {
  url: string;
  secureUrl: string;
  publicId: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
}

/**
 * Direct Unsigned Client-Side Upload to Cloudinary API
 * Compresses the image on client first, then streams directly to Cloudinary CDN.
 */
export async function uploadToCloudinary(
  file: File,
  folder = 'cybermohit_portfolio'
): Promise<CloudinaryUploadResult> {
  const { cloudName, uploadPreset, isConfigured } = getCloudinaryConfig();

  if (!isConfigured) {
    throw new Error(
      'Cloudinary config missing: Please set Cloud Name and Upload Preset in Admin Panel.'
    );
  }

  // Pre-compress to avoid uploading unnecessary massive camera megabytes
  const optimizedFile = await compressImage(file, 1800, 1800, 0.88);

  const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
  const formData = new FormData();
  formData.append('file', optimizedFile);
  formData.append('upload_preset', uploadPreset);
  if (folder) {
    formData.append('folder', folder);
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    let errorDetail = 'Cloudinary upload request failed';
    try {
      const errJson = await response.json();
      errorDetail = errJson.error?.message || errorDetail;
    } catch {}
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

export interface CloudinaryAudioUploadResult {
  url: string;
  secureUrl: string;
  publicId: string;
  format: string;
  duration?: number;
  bytes: number;
}

/**
 * Direct Unsigned Audio / MP3 Upload to Cloudinary API
 * Cloudinary classifies audio under resource_type 'video' or 'auto'.
 * Uploads directly to Cloudinary without Firebase or Supabase.
 */
export async function uploadAudioToCloudinary(
  file: File,
  folder = 'portfolio_audio'
): Promise<CloudinaryAudioUploadResult> {
  const { cloudName, uploadPreset, isConfigured } = getCloudinaryConfig();

  if (!isConfigured) {
    throw new Error('Cloudinary config missing: Please set Cloud Name and Upload Preset in Admin Panel.');
  }

  // Cloudinary uses /video/upload for audio files (mp3, wav, ogg, m4a)
  const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`;
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);
  formData.append('resource_type', 'video');
  if (folder) {
    formData.append('folder', folder);
  }

  let response = await fetch(endpoint, {
    method: 'POST',
    body: formData,
  });

  // Fallback to /auto/upload if /video/upload rejected
  if (!response.ok) {
    let errorDetail = 'Cloudinary video endpoint failed';
    try {
      const errJson = await response.json();
      errorDetail = errJson.error?.message || errorDetail;
    } catch {}

    const autoEndpoint = `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`;
    const autoFormData = new FormData();
    autoFormData.append('file', file);
    autoFormData.append('upload_preset', uploadPreset);
    if (folder) {
      autoFormData.append('folder', folder);
    }

    const autoResp = await fetch(autoEndpoint, {
      method: 'POST',
      body: autoFormData,
    });

    if (!autoResp.ok) {
      let autoError = errorDetail;
      try {
        const autoJson = await autoResp.json();
        autoError = autoJson.error?.message || autoError;
      } catch {}
      throw new Error(`Cloudinary Audio Upload Error: ${autoError}`);
    }

    response = autoResp;
  }

  const data = await response.json();

  return {
    url: data.url,
    secureUrl: data.secure_url,
    publicId: data.public_id,
    format: data.format || file.name.split('.').pop() || 'mp3',
    duration: data.duration,
    bytes: data.bytes || file.size,
  };
}
