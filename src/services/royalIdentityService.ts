/**
 * royalIdentityService.ts
 * Manages the Royal Full-Screen PNG Identity experience data and storage.
 * Integrates with Cloudinary for fast CDN image hosting and Firebase Firestore
 * for metadata, ordering, and real-time state synchronization.
 */

import { db, doc, getDoc, setDoc, onSnapshot, serverTimestamp } from '../firebase';
import { uploadToCloudinary } from './cloudinary';
import { RoyalIdentityConfig, RoyalIdentityImage } from '../types';

const STORAGE_KEY = 'mohit_royal_identity';
const SETTINGS_DOC_ID = 'royal_identity';

export const DEFAULT_ROYAL_CONFIG: RoyalIdentityConfig = {
  activeImageId: undefined,
  autoRotate: false,
  rotateInterval: 6,
  enableWheelTransition: true,
  images: [],
};

// Safe cached reader
export function getLocalRoyalConfig(): RoyalIdentityConfig {
  if (typeof window === 'undefined') return DEFAULT_ROYAL_CONFIG;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_ROYAL_CONFIG;
    const parsed = JSON.parse(raw);
    return {
      activeImageId: parsed.activeImageId,
      autoRotate: parsed.autoRotate ?? false,
      rotateInterval: parsed.rotateInterval ?? 6,
      enableWheelTransition: parsed.enableWheelTransition ?? true,
      images: Array.isArray(parsed.images) ? parsed.images : [],
    };
  } catch {
    return DEFAULT_ROYAL_CONFIG;
  }
}

// Save locally
export function saveLocalRoyalConfig(config: RoyalIdentityConfig): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    window.dispatchEvent(new CustomEvent('mohit_royal_identity_update', { detail: config }));
  } catch (e) {
    console.warn('[RoyalIdentity] Local save failed:', e);
  }
}

/**
 * Real-time listener for Royal Identity configuration
 */
export function subscribeRoyalIdentity(
  callback: (config: RoyalIdentityConfig) => void
): () => void {
  // Emit initial local cache immediately for zero-delay render
  const initial = getLocalRoyalConfig();
  callback(initial);

  if (typeof window === 'undefined') return () => {};

  try {
    const ref = doc(db, 'settings', SETTINGS_DOC_ID);
    const unsubscribe = onSnapshot(
      ref,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          const config: RoyalIdentityConfig = {
            activeImageId: data.activeImageId,
            autoRotate: data.autoRotate ?? false,
            rotateInterval: data.rotateInterval ?? 6,
            enableWheelTransition: data.enableWheelTransition ?? true,
            images: Array.isArray(data.images) ? data.images : [],
          };
          saveLocalRoyalConfig(config);
          callback(config);
        } else {
          // If no doc in firestore yet, keep local fallback
          callback(getLocalRoyalConfig());
        }
      },
      (error) => {
        console.warn('[RoyalIdentity] Snapshot listener warning:', error);
        callback(getLocalRoyalConfig());
      }
    );

    return unsubscribe;
  } catch (err) {
    console.warn('[RoyalIdentity] Listener init error:', err);
    return () => {};
  }
}

/**
 * Fetch the latest Royal Identity config once from Firestore
 */
export async function fetchRoyalIdentityConfig(): Promise<RoyalIdentityConfig> {
  try {
    const ref = doc(db, 'settings', SETTINGS_DOC_ID);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const data = snap.data();
      const config: RoyalIdentityConfig = {
        activeImageId: data.activeImageId,
        autoRotate: data.autoRotate ?? false,
        rotateInterval: data.rotateInterval ?? 6,
        enableWheelTransition: data.enableWheelTransition ?? true,
        images: Array.isArray(data.images) ? data.images : [],
      };
      saveLocalRoyalConfig(config);
      return config;
    }
  } catch (err) {
    console.warn('[RoyalIdentity] fetch error, using local:', err);
  }
  return getLocalRoyalConfig();
}

/**
 * Commit updated Royal Identity configuration to Firestore and cache
 */
export async function saveRoyalIdentityConfig(config: RoyalIdentityConfig): Promise<void> {
  // Normalize display orders
  const sanitizedImages = (config.images || []).map((img, idx) => ({
    ...img,
    displayOrder: typeof img.displayOrder === 'number' ? img.displayOrder : idx + 1,
    isEnabled: img.isEnabled ?? true,
  }));

  const cleanConfig: RoyalIdentityConfig = {
    ...config,
    images: sanitizedImages,
  };

  // Immediate local cache
  saveLocalRoyalConfig(cleanConfig);

  try {
    const ref = doc(db, 'settings', SETTINGS_DOC_ID);
    await setDoc(
      ref,
      {
        ...cleanConfig,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (err) {
    console.error('[RoyalIdentity] Save to Firestore failed:', err);
    throw err;
  }
}

/**
 * Upload a transparent background PNG file to Cloudinary and append to Royal Identity list
 */
export async function uploadRoyalIdentityPNG(
  file: File,
  title?: string
): Promise<RoyalIdentityImage> {
  // Cloudinary upload directly
  const uploadResult = await uploadToCloudinary(file, 'royal_identity');

  const currentConfig = await fetchRoyalIdentityConfig();
  const nextOrder = (currentConfig.images.length || 0) + 1;

  const newImage: RoyalIdentityImage = {
    id: `royal_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    url: uploadResult.secureUrl || uploadResult.url,
    title: title?.trim() || file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ') || `Royal Pose ${nextOrder}`,
    displayOrder: nextOrder,
    isEnabled: true,
    isMainActive: currentConfig.images.length === 0, // Auto-make active if first
    aspectRatio: uploadResult.width && uploadResult.height ? uploadResult.width / uploadResult.height : undefined,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const updatedImages = [...currentConfig.images, newImage];
  const updatedConfig: RoyalIdentityConfig = {
    ...currentConfig,
    activeImageId: currentConfig.activeImageId || newImage.id,
    images: updatedImages,
  };

  await saveRoyalIdentityConfig(updatedConfig);
  return newImage;
}

/**
 * Update a specific Royal Image
 */
export async function updateRoyalIdentityImage(
  imageId: string,
  updates: Partial<RoyalIdentityImage>
): Promise<void> {
  const currentConfig = await fetchRoyalIdentityConfig();
  const updatedImages = currentConfig.images.map((img) =>
    img.id === imageId ? { ...img, ...updates, updatedAt: new Date().toISOString() } : img
  );

  let activeId = currentConfig.activeImageId;
  if (updates.isMainActive) {
    activeId = imageId;
  }

  await saveRoyalIdentityConfig({
    ...currentConfig,
    activeImageId: activeId,
    images: updatedImages,
  });
}

/**
 * Delete a Royal Image
 */
export async function deleteRoyalIdentityImage(imageId: string): Promise<void> {
  const currentConfig = await fetchRoyalIdentityConfig();
  const updatedImages = currentConfig.images.filter((img) => img.id !== imageId);

  let activeId = currentConfig.activeImageId;
  if (activeId === imageId) {
    const firstEnabled = updatedImages.find((img) => img.isEnabled);
    activeId = firstEnabled ? firstEnabled.id : updatedImages[0]?.id;
  }

  await saveRoyalIdentityConfig({
    ...currentConfig,
    activeImageId: activeId,
    images: updatedImages,
  });
}

/**
 * Reorder Royal Images
 */
export async function reorderRoyalIdentityImages(
  orderedImages: RoyalIdentityImage[]
): Promise<void> {
  const currentConfig = await fetchRoyalIdentityConfig();
  const reindexed = orderedImages.map((img, index) => ({
    ...img,
    displayOrder: index + 1,
  }));

  await saveRoyalIdentityConfig({
    ...currentConfig,
    images: reindexed,
  });
}

/**
 * Set an image as the active primary image
 */
export async function setActiveRoyalIdentityImage(imageId: string): Promise<void> {
  const currentConfig = await fetchRoyalIdentityConfig();
  const updatedImages = currentConfig.images.map((img) => ({
    ...img,
    isMainActive: img.id === imageId,
  }));

  await saveRoyalIdentityConfig({
    ...currentConfig,
    activeImageId: imageId,
    images: updatedImages,
  });
}
