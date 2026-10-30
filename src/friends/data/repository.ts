/**
 * Friends Data Repository & useFriends Hook (Firebase Firestore + Storage Integration)
 * Directly connects Friends Universe to Firestore database and Firebase Storage.
 */

import { useState, useEffect, useCallback } from 'react';
import {
  Friend,
  CategoryKey,
  FriendsConfigSettings,
  DEFAULT_FRIENDS_SETTINGS,
  PhotoInput,
  resolveImageUrl,
  FriendRequest,
  isFriendPublic,
} from './friends';
import {
  db,
  storage,
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  isUserAdmin,
  auth,
} from '../../firebase';
import { compressImage } from '../../utils/imageCompressor';
import {
  uploadToSupabaseStorage,
  deleteFromSupabaseStorage,
  SUPABASE_STORAGE_BUCKET,
} from '../../supabase';
import { uploadToCloudinary, getCloudinaryConfig } from '../../services/cloudinary';

// Local storage helper for instant cold starts
const getCachedFriendsFromStorage = (): Friend[] | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('mohit_cached_friends');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return null;
};

const saveFriendsToStorage = (list: Friend[]) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('mohit_cached_friends', JSON.stringify(list));
  } catch {}
};

// In-memory cache to prevent redundant Firestore queries
let cachedFriends: Friend[] | null = getCachedFriendsFromStorage();
let cachedSettings: FriendsConfigSettings | null = null;
let cacheTimestamp = cachedFriends ? Date.now() : 0;
const CACHE_DURATION_MS = 60 * 1000; // 1 minute cache

export interface FriendsRepository {
  list(category?: CategoryKey, forceRefresh?: boolean, options?: { includeUnlisted?: boolean }): Promise<Friend[]>;
  filterByCategory(list: Friend[], category?: CategoryKey, options?: { includeUnlisted?: boolean }): Friend[];
  get(id: string): Promise<Friend | null>;
  create(friend: Omit<Friend, 'id'>, privateFields?: Record<string, any>, customId?: string): Promise<Friend>;
  update(id: string, patch: Partial<Friend>, privateFieldsPatch?: Record<string, any>): Promise<Friend>;
  remove(id: string): Promise<boolean>;
  getPrivateData(friendId: string): Promise<Record<string, any> | null>;
  getSettings(): Promise<FriendsConfigSettings>;
  updateSettings(settings: Partial<FriendsConfigSettings>): Promise<FriendsConfigSettings>;
  uploadPhoto(file: File, friendId: string): Promise<{ url: string; path: string }>;
  deletePhoto(storagePath: string): Promise<boolean>;
  createRequest(req: FriendRequest): Promise<void>;
  listRequests(statusFilter?: string): Promise<FriendRequest[]>;
  checkPendingUpdateRequest(profileId: string): Promise<FriendRequest | null>;
  approveRequest(
    requestId: string,
    adminCategory?: 'normal' | 'hidden',
    assignedCategories?: string[],
    adminNotes?: string
  ): Promise<Friend | null>;
  rejectRequest(requestId: string, adminNotes?: string): Promise<void>;
  deleteRequest(requestId: string): Promise<void>;
}

/**
 * Recursively cleans an object to ensure no `undefined` values reach Firestore setDoc()
 */
export function sanitizeFirestoreData<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return null as any;
  }
  if (Array.isArray(obj)) {
    return obj
      .filter((item) => item !== undefined)
      .map((item) => sanitizeFirestoreData(item)) as any;
  }
  if (typeof obj === 'object') {
    // Preserve Firestore serverTimestamp and Timestamp objects
    if ((obj as any)._methodName || typeof (obj as any).toMillis === 'function') {
      return obj;
    }
    const clean: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        clean[key] = sanitizeFirestoreData(value);
      }
    }
    return clean as any;
  }
  return obj;
}

export class FirebaseFriendsRepository implements FriendsRepository {
  private friendsCollection = 'friends';
  private privateCollection = 'friendsPrivate';
  private configCollection = 'friendsConfig';
  private requestsCollection = 'friendRequests';
  private settingsDocId = 'settings';

  async list(category?: CategoryKey, forceRefresh = false, options?: { includeUnlisted?: boolean }): Promise<Friend[]> {
    const now = Date.now();
    if (!forceRefresh && cachedFriends && now - cacheTimestamp < CACHE_DURATION_MS) {
      return this.filterByCategory(cachedFriends, category, options);
    }

    try {
      const snap = await getDocs(collection(db, this.friendsCollection));
      const list: Friend[] = [];

      snap.forEach((d) => {
        const data = d.data();
        list.push({
          id: d.id,
          name: data.name || '',
          nickname: data.nickname || null,
          username: data.username || data.user || null,
          user: data.username || data.user || null,
          fullName: data.fullName || null,
          bio: data.bio || null,
          avatar: data.avatar || '',
          heroPhotos: Array.isArray(data.heroPhotos) ? data.heroPhotos : (Array.isArray(data.photos) ? data.photos : []),
          photos: Array.isArray(data.photos) ? data.photos : [],
          gallery: Array.isArray(data.gallery) ? data.gallery : [],
          categories: Array.isArray(data.categories) ? data.categories : (Array.isArray(data.cats) ? data.cats : []),
          cats: Array.isArray(data.categories) ? data.categories : (Array.isArray(data.cats) ? data.cats : []),
          ffName: data.ffName || null,
          ffUid: data.ffUid || null,
          role: data.role || null,
          dob: data.dob || null,
          dobShowYear: data.dobShowYear !== false,
          whatsapp: data.whatsapp || null,
          instagram: data.instagram || null,
          location: data.location || null,
          hobbies: data.hobbies || data.hobby || null,
          hobby: data.hobbies || data.hobby || null,
          dream: data.dream || data.goal || null,
          goal: data.dream || data.goal || null,
          skills: Array.isArray(data.skills)
            ? data.skills
            : typeof data.skills === 'string'
            ? data.skills.split(',').map((s: string) => s.trim()).filter(Boolean)
            : null,
          projects: Array.isArray(data.projects)
            ? data.projects
            : typeof data.projects === 'string'
            ? data.projects.split(',').map((p: string) => p.trim()).filter(Boolean)
            : null,
          referredBy: data.referredBy || data.relation || null,
          relation: data.referredBy || data.relation || null,
          visibilitySettings: data.visibilitySettings || null,
          links: Array.isArray(data.links) ? data.links : [],
          accent: data.accent || '#00F2FE',
          online: data.online ?? null,
          order: typeof data.order === 'number' ? data.order : 999,
          isVisible: data.isVisible !== false,
          isUnlisted: data.isUnlisted === true,
          listingVisibility: data.listingVisibility || (data.isUnlisted ? 'hidden' : 'normal'),
          adminCategory: data.adminCategory || (data.isUnlisted ? 'hidden' : 'normal'),
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        });
      });

      // Sort by order ascending
      list.sort((a, b) => (a.order || 0) - (b.order || 0));

      cachedFriends = list;
      cacheTimestamp = now;
      saveFriendsToStorage(list);

      return this.filterByCategory(list, category, options);
    } catch (err: any) {
      console.warn('Firestore friends list warning:', err?.message || err);
      throw err;
    }
  }

  filterByCategory(list: Friend[], category?: CategoryKey, options?: { includeUnlisted?: boolean }): Friend[] {
    const includeUnlisted = options?.includeUnlisted === true;
    const baseList = includeUnlisted ? list : list.filter((f) => isFriendPublic(f));

    if (!category || category === 'all') {
      return baseList;
    }
    if (category === 'online') {
      return baseList.filter((f) => f.online === true);
    }
    return baseList.filter((f) => {
      const cats = f.categories || f.cats || [];
      return cats.includes(category);
    });
  }

  async get(id: string): Promise<Friend | null> {
    if (!id) return null;
    try {
      const docRef = doc(db, this.friendsCollection, id);
      const snap = await getDoc(docRef);
      if (!snap.exists()) return null;
      const data = snap.data();
      return {
        id: snap.id,
        name: data.name || '',
        nickname: data.nickname || null,
        username: data.username || data.user || null,
        user: data.username || data.user || null,
        fullName: data.fullName || null,
        bio: data.bio || null,
        avatar: data.avatar || '',
        heroPhotos: Array.isArray(data.heroPhotos) ? data.heroPhotos : (Array.isArray(data.photos) ? data.photos : []),
        photos: Array.isArray(data.photos) ? data.photos : [],
        gallery: Array.isArray(data.gallery) ? data.gallery : [],
        categories: Array.isArray(data.categories) ? data.categories : (Array.isArray(data.cats) ? data.cats : []),
        cats: Array.isArray(data.categories) ? data.categories : (Array.isArray(data.cats) ? data.cats : []),
        ffName: data.ffName || null,
        ffUid: data.ffUid || null,
        role: data.role || null,
        dob: data.dob || null,
        dobShowYear: data.dobShowYear !== false,
        whatsapp: data.whatsapp || null,
        instagram: data.instagram || null,
        location: data.location || null,
        hobbies: data.hobbies || data.hobby || null,
        hobby: data.hobbies || data.hobby || null,
        dream: data.dream || data.goal || null,
        goal: data.dream || data.goal || null,
        skills: Array.isArray(data.skills)
          ? data.skills
          : typeof data.skills === 'string'
          ? data.skills.split(',').map((s: string) => s.trim()).filter(Boolean)
          : null,
        projects: Array.isArray(data.projects)
          ? data.projects
          : typeof data.projects === 'string'
          ? data.projects.split(',').map((p: string) => p.trim()).filter(Boolean)
          : null,
        referredBy: data.referredBy || data.relation || null,
        relation: data.referredBy || data.relation || null,
        visibilitySettings: data.visibilitySettings || null,
        links: Array.isArray(data.links) ? data.links : [],
        accent: data.accent || '#00F2FE',
        online: data.online ?? null,
        order: typeof data.order === 'number' ? data.order : 999,
        isVisible: data.isVisible !== false,
        isUnlisted: data.isUnlisted === true,
        listingVisibility: data.listingVisibility || (data.isUnlisted ? 'hidden' : 'normal'),
        adminCategory: data.adminCategory || (data.isUnlisted ? 'hidden' : 'normal'),
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      };
    } catch (err: any) {
      console.warn(`Firestore get friend ${id} warning:`, err?.message || err);
      throw err;
    }
  }

  async create(friendData: Omit<Friend, 'id'>, privateFields?: Record<string, any>, customId?: string): Promise<Friend> {
    const friendId = customId || `fr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const publicDocRef = doc(db, this.friendsCollection, friendId);

    const docToSave = sanitizeFirestoreData({
      ...friendData,
      id: friendId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    await setDoc(publicDocRef, docToSave);

    // Save private fields in friendsPrivate collection if provided
    if (privateFields && Object.keys(privateFields).length > 0) {
      const privateDocRef = doc(db, this.privateCollection, friendId);
      await setDoc(privateDocRef, sanitizeFirestoreData({
        friendId,
        privateFields,
        updatedAt: serverTimestamp(),
      }));
    }

    cachedFriends = null; // Invalidate cache
    return { ...friendData, id: friendId };
  }

  async update(id: string, patch: Partial<Friend>, privateFieldsPatch?: Record<string, any>): Promise<Friend> {
    const publicDocRef = doc(db, this.friendsCollection, id);

    const dataToUpdate: Record<string, any> = sanitizeFirestoreData({
      ...patch,
      updatedAt: serverTimestamp(),
    });
    delete dataToUpdate.id;

    await setDoc(publicDocRef, dataToUpdate, { merge: true });

    if (privateFieldsPatch) {
      const privateDocRef = doc(db, this.privateCollection, id);
      await setDoc(
        privateDocRef,
        sanitizeFirestoreData({
          friendId: id,
          privateFields: privateFieldsPatch,
          updatedAt: serverTimestamp(),
        }),
        { merge: true }
      );
    }

    cachedFriends = null; // Invalidate cache
    const updated = await this.get(id);
    if (!updated) throw new Error(`Friend ${id} not found after update`);
    return updated;
  }

  async remove(id: string): Promise<boolean> {
    try {
      // 1. Fetch friend data to find any uploaded photos in Storage
      const friend = await this.get(id);

      // 2. Delete public document
      await deleteDoc(doc(db, this.friendsCollection, id));

      // 3. Delete private document if exists
      try {
        await deleteDoc(doc(db, this.privateCollection, id));
      } catch (e) {
        // ignore if private doc doesn't exist
      }

      // 4. Delete uploaded Storage photos if path is saved
      if (friend) {
        const photosToDelete: string[] = [];
        if (typeof friend.avatar !== 'string' && friend.avatar?.path) {
          photosToDelete.push(friend.avatar.path);
        }
        (friend.heroPhotos || []).forEach((p) => {
          if (typeof p !== 'string' && p?.path) photosToDelete.push(p.path);
        });
        (friend.gallery || []).forEach((p) => {
          if (typeof p !== 'string' && p?.path) photosToDelete.push(p.path);
        });

        for (const storagePath of photosToDelete) {
          try {
            await this.deletePhoto(storagePath);
          } catch (e) {
            console.warn(`Failed to delete storage photo ${storagePath}:`, e);
          }
        }
      }

      cachedFriends = null; // Invalidate cache
      return true;
    } catch (err: any) {
      console.warn(`Firestore delete friend ${id} warning:`, err?.message || err);
      throw err;
    }
  }

  async getPrivateData(friendId: string): Promise<Record<string, any> | null> {
    try {
      const snap = await getDoc(doc(db, this.privateCollection, friendId));
      if (!snap.exists()) return null;
      return snap.data().privateFields || null;
    } catch (err: any) {
      console.warn(`Firestore read private data for ${friendId} warning:`, err?.message || err);
      return null;
    }
  }

  async getSettings(): Promise<FriendsConfigSettings> {
    if (cachedSettings) return cachedSettings;
    try {
      const snap = await getDoc(doc(db, this.configCollection, this.settingsDocId));
      if (snap.exists()) {
        const data = snap.data() as FriendsConfigSettings;
        cachedSettings = {
          ...DEFAULT_FRIENDS_SETTINGS,
          ...data,
          categories: data.categories || DEFAULT_FRIENDS_SETTINGS.categories,
          features: { ...DEFAULT_FRIENDS_SETTINGS.features, ...(data.features || {}) },
          themeColors: { ...DEFAULT_FRIENDS_SETTINGS.themeColors, ...(data.themeColors || {}) },
          labels: { ...DEFAULT_FRIENDS_SETTINGS.labels, ...(data.labels || {}) },
        };
        return cachedSettings;
      }
    } catch (err) {
      console.warn('Could not read friendsConfig/settings from Firestore, using defaults:', err);
    }
    return DEFAULT_FRIENDS_SETTINGS;
  }

  async updateSettings(settingsPatch: Partial<FriendsConfigSettings>): Promise<FriendsConfigSettings> {
    const current = await this.getSettings();
    const updated: FriendsConfigSettings = {
      ...current,
      ...settingsPatch,
      updatedAt: serverTimestamp(),
    };

    await setDoc(doc(db, this.configCollection, this.settingsDocId), updated, { merge: true });
    cachedSettings = updated;
    return updated;
  }

  async uploadPhoto(file: File, friendId: string): Promise<{ url: string; path: string }> {
    // 1. Client-side compression before uploading (phone memory friendly, ~1600px max)
    const compressedFile = await compressImage(file, 1600, 1600, 0.82);

    // 2. Generate clean, safe path in Supabase Storage
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
    const storagePath = `friends/${friendId}/${timestamp}_${safeName}`;

    // 3. Primary Flow: Cloudinary CDN if configured
    const cld = getCloudinaryConfig();
    if (cld.isConfigured) {
      try {
        const cldRes = await uploadToCloudinary(file, `friends_${friendId}`);
        return { url: cldRes.secureUrl, path: cldRes.publicId };
      } catch (cldErr) {
        console.warn('Cloudinary upload fallback to secondary storage:', cldErr);
      }
    }

    // Secondary Flow: Upload to Supabase/Local or Firebase Storage
    try {
      const res = await uploadToSupabaseStorage(compressedFile, storagePath, {
        bucket: SUPABASE_STORAGE_BUCKET,
      });

      console.log(`Supabase upload success: ${res.publicUrl}`);
      return { url: res.publicUrl, path: res.path };
    } catch (supabaseErr: any) {
      console.warn('Supabase storage upload error:', supabaseErr?.message || supabaseErr);
      
      // Fallback: If Firebase Storage is activated, try Firebase Storage
      try {
        const storageRef = ref(storage, storagePath);
        await uploadBytes(storageRef, compressedFile);
        const fbUrl = await getDownloadURL(storageRef);
        console.log(`Fallback to Firebase Storage success: ${fbUrl}`);
        return { url: fbUrl, path: storagePath };
      } catch (fbErr: any) {
        // Re-throw the explicit Supabase error message with actionable details
        throw supabaseErr;
      }
    }
  }

  async deletePhoto(storagePath: string): Promise<boolean> {
    if (!storagePath) return false;

    // 1. Attempt delete from Supabase Storage
    try {
      const deleted = await deleteFromSupabaseStorage(storagePath);
      if (deleted) return true;
    } catch (e) {
      console.warn(`Supabase delete warning:`, e);
    }

    // 2. Fallback: attempt delete from Firebase Storage if legacy path
    try {
      const storageRef = ref(storage, storagePath);
      await deleteObject(storageRef);
      return true;
    } catch (err: any) {
      return false;
    }
  }

  // --- FRIEND CREATION & EDIT REQUESTS ---

  async createRequest(req: FriendRequest): Promise<void> {
    const docRef = doc(db, this.requestsCollection, req.id);

    // Ensure profileId is generated if not provided
    const profileId =
      req.profileId ||
      (req.type === 'new_profile'
        ? `fr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
        : null);

    const dataToSave: Record<string, any> = {
      id: req.id,
      type: req.type,
      status: 'pending',
      submittedAt: serverTimestamp(),
      applicantName: req.applicantName || '',
      applicantContact: req.applicantContact || '',
      profileData: req.profileData || {},
    };

    if (profileId) {
      dataToSave.profileId = profileId;
    }
    if (req.originalData) {
      dataToSave.originalData = req.originalData;
    }
    if (req.adminCategory) {
      dataToSave.adminCategory = req.adminCategory;
    }
    if (req.assignedCategories) {
      dataToSave.assignedCategories = req.assignedCategories;
    }
    if (req.adminNotes) {
      dataToSave.adminNotes = req.adminNotes;
    }

    const sanitized = sanitizeFirestoreData(dataToSave);
    await setDoc(docRef, sanitized);
  }

  async listRequests(statusFilter?: string): Promise<FriendRequest[]> {
    const snap = await getDocs(collection(db, this.requestsCollection));
    const list: FriendRequest[] = [];
    snap.forEach((d) => {
      const data = d.data();
      list.push({
        id: d.id,
        type: data.type,
        profileId: data.profileId,
        status: data.status,
        submittedAt: data.submittedAt,
        reviewedAt: data.reviewedAt,
        applicantName: data.applicantName || '',
        applicantContact: data.applicantContact || '',
        profileData: data.profileData || {},
        originalData: data.originalData || {},
        adminCategory: data.adminCategory,
        assignedCategories: data.assignedCategories,
        adminNotes: data.adminNotes,
      });
    });

    list.sort((a, b) => {
      const tA = a.submittedAt?.toMillis ? a.submittedAt.toMillis() : (a.submittedAt ? new Date(a.submittedAt).getTime() : 0);
      const tB = b.submittedAt?.toMillis ? b.submittedAt.toMillis() : (b.submittedAt ? new Date(b.submittedAt).getTime() : 0);
      return tB - tA;
    });

    if (statusFilter && statusFilter !== 'all') {
      return list.filter((r) => r.status === statusFilter);
    }
    return list;
  }

  async checkPendingUpdateRequest(profileId: string): Promise<FriendRequest | null> {
    if (!profileId) return null;
    try {
      const snap = await getDocs(collection(db, this.requestsCollection));
      for (const d of snap.docs) {
        const data = d.data();
        if (data.profileId === profileId && data.status === 'pending') {
          return {
            id: d.id,
            type: data.type,
            profileId: data.profileId,
            status: data.status,
            submittedAt: data.submittedAt,
            applicantName: data.applicantName || '',
            applicantContact: data.applicantContact || '',
            profileData: data.profileData || {},
            originalData: data.originalData || {},
          };
        }
      }
    } catch (e) {
      console.warn('Error checking pending update request:', e);
    }
    return null;
  }

  async approveRequest(
    requestId: string,
    adminCategory: 'normal' | 'hidden' = 'normal',
    assignedCategories: string[] = ['prefer'],
    adminNotes?: string
  ): Promise<Friend | null> {
    const reqDocRef = doc(db, this.requestsCollection, requestId);
    const snap = await getDoc(reqDocRef);
    if (!snap.exists()) throw new Error('अनुरोध नहीं मिला (Request not found)');
    const reqData = snap.data() as FriendRequest;

    let resultFriend: Friend | null = null;
    if (reqData.type === 'new_profile') {
      const p = reqData.profileData || {};
      const newFriend: Omit<Friend, 'id'> = {
        name: p.name || reqData.applicantName || 'Friend',
        nickname: p.nickname || null,
        username: p.username || null,
        user: p.username || null,
        fullName: p.fullName || p.name || null,
        bio: p.bio || null,
        avatar: p.avatar || '',
        heroPhotos: Array.isArray(p.heroPhotos) ? p.heroPhotos : [],
        photos: [],
        gallery: Array.isArray(p.gallery) ? p.gallery : [],
        categories: assignedCategories.length > 0 ? assignedCategories : ['prefer'],
        cats: assignedCategories.length > 0 ? assignedCategories : ['prefer'],
        ffName: p.ffName || null,
        ffUid: p.ffUid || null,
        role: p.role || null,
        dob: p.dob || null,
        dobShowYear: p.dobShowYear !== false,
        whatsapp: p.whatsapp || reqData.applicantContact || null,
        instagram: p.instagram || null,
        location: p.location || null,
        city: p.city || null,
        state: p.state || null,
        hobbies: p.hobbies || null,
        hobby: p.hobbies || null,
        dream: p.dream || null,
        goal: p.dream || null,
        skills: p.skills || null,
        projects: p.projects || null,
        referredBy: p.referredBy || null,
        relation: p.referredBy || null,
        visibilitySettings: p.visibilitySettings || undefined,
        links: Array.isArray(p.links) ? p.links : [],
        accent: p.accent || '#00F2FE',
        order: 999,
        isVisible: true,
        isUnlisted: adminCategory === 'hidden',
        listingVisibility: adminCategory === 'hidden' ? 'hidden' : 'normal',
        adminCategory: adminCategory || 'normal',
        online: null,
      };
      const targetId = reqData.profileId || (reqData.profileData as any)?.id;
      resultFriend = await this.create(newFriend, undefined, targetId);
    } else if (reqData.type === 'profile_update' && reqData.profileId) {
      const p = reqData.profileData || {};
      const patch: Partial<Friend> = { ...p };
      if (adminCategory) {
        patch.isUnlisted = adminCategory === 'hidden';
        patch.listingVisibility = adminCategory === 'hidden' ? 'hidden' : 'normal';
        patch.adminCategory = adminCategory;
      }
      if (assignedCategories && assignedCategories.length > 0) {
        patch.categories = assignedCategories;
        patch.cats = assignedCategories;
      }
      resultFriend = await this.update(reqData.profileId, patch);
    }

    await setDoc(
      reqDocRef,
      sanitizeFirestoreData({
        status: 'approved',
        reviewedAt: serverTimestamp(),
        adminCategory,
        assignedCategories,
        adminNotes: adminNotes || '',
      }),
      { merge: true }
    );

    return resultFriend;
  }

  async rejectRequest(requestId: string, adminNotes?: string): Promise<void> {
    const reqDocRef = doc(db, this.requestsCollection, requestId);
    await setDoc(
      reqDocRef,
      {
        status: 'rejected',
        reviewedAt: serverTimestamp(),
        adminNotes: adminNotes || '',
      },
      { merge: true }
    );
  }

  async deleteRequest(requestId: string): Promise<void> {
    await deleteDoc(doc(db, this.requestsCollection, requestId));
  }
}

// Export singleton instance connected to Firebase
export const friendsRepository: FriendsRepository = new FirebaseFriendsRepository();

export interface UseFriendsResult {
  friends: Friend[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Custom React hook for live data from Firestore with real-time onSnapshot support
 */
export function useFriends(category?: CategoryKey, options?: { includeUnlisted?: boolean }): UseFriendsResult {
  const includeUnlisted = options?.includeUnlisted === true;

  // Initialize from cache immediately if present to eliminate flicker
  const [friends, setFriends] = useState<Friend[]>(() => {
    if (cachedFriends && cachedFriends.length > 0) {
      return friendsRepository.filterByCategory(cachedFriends, category, { includeUnlisted });
    }
    return [];
  });

  const [isLoading, setIsLoading] = useState<boolean>(() => {
    const current = cachedFriends || getCachedFriendsFromStorage();
    return !(current && current.length > 0);
  });
  const [error, setError] = useState<Error | null>(null);

  const fetchFriends = async () => {
    try {
      const current = cachedFriends || getCachedFriendsFromStorage();
      if (!current || current.length === 0) {
        setIsLoading(true);
      }
      setError(null);
      const data = await friendsRepository.list(category, true, { includeUnlisted });
      setFriends(data);
    } catch (err: any) {
      console.warn('Friends Firestore list warning:', err?.message || err);
      const isPerm = String(err?.message || err).toLowerCase().includes('permission');
      setError(
        new Error(
          isPerm
            ? 'Firebase Rules: कृपया Firebase Console में जाकर Firestore Rules पब्लिश करें ताकि दोस्त लोड हो सकें।'
            : (err instanceof Error ? err.message : String(err))
        )
      );
      if (friends.length === 0) {
        setFriends([]); // Strictly empty array on error if no cache exists
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // 1. Subscribe to real-time updates from Firestore
    const current = cachedFriends || getCachedFriendsFromStorage();
    if (!current || current.length === 0) {
      setIsLoading(true);
    }
    setError(null);

    // Failsafe timer (3.0s): ensure spinner never hangs indefinitely
    const safetyTimer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    let unsubscribe = () => {};

    try {
      unsubscribe = onSnapshot(
        collection(db, 'friends'),
        (snapshot) => {
          clearTimeout(safetyTimer);
          const list: Friend[] = [];
          snapshot.forEach((d) => {
            const data = d.data();
            list.push({
              id: d.id,
              name: data.name || '',
              nickname: data.nickname || null,
              username: data.username || data.user || null,
              user: data.username || data.user || null,
              fullName: data.fullName || null,
              bio: data.bio || null,
              avatar: data.avatar || '',
              heroPhotos: Array.isArray(data.heroPhotos) ? data.heroPhotos : (Array.isArray(data.photos) ? data.photos : []),
              photos: Array.isArray(data.photos) ? data.photos : [],
              gallery: Array.isArray(data.gallery) ? data.gallery : [],
              categories: Array.isArray(data.categories) ? data.categories : (Array.isArray(data.cats) ? data.cats : []),
              cats: Array.isArray(data.categories) ? data.categories : (Array.isArray(data.cats) ? data.cats : []),
              ffName: data.ffName || null,
              ffUid: data.ffUid || null,
              role: data.role || null,
              dob: data.dob || null,
              dobShowYear: data.dobShowYear !== false,
              whatsapp: data.whatsapp || null,
              instagram: data.instagram || null,
              location: data.location || null,
              city: data.city || null,
              state: data.state || null,
              hobbies: data.hobbies || data.hobby || null,
              hobby: data.hobbies || data.hobby || null,
              dream: data.dream || data.goal || null,
              goal: data.dream || data.goal || null,
              skills: Array.isArray(data.skills)
                ? data.skills
                : typeof data.skills === 'string'
                ? data.skills.split(',').map((s: string) => s.trim()).filter(Boolean)
                : null,
              projects: Array.isArray(data.projects)
                ? data.projects
                : typeof data.projects === 'string'
                ? data.projects.split(',').map((p: string) => p.trim()).filter(Boolean)
                : null,
              referredBy: data.referredBy || data.relation || null,
              relation: data.referredBy || data.relation || null,
              visibilitySettings: data.visibilitySettings || null,
              links: Array.isArray(data.links) ? data.links : [],
              accent: data.accent || '#00F2FE',
              online: data.online ?? null,
              order: typeof data.order === 'number' ? data.order : 999,
              isVisible: data.isVisible !== false,
              isUnlisted: data.isUnlisted === true,
              listingVisibility: data.listingVisibility || (data.isUnlisted ? 'hidden' : 'normal'),
              adminCategory: data.adminCategory || (data.isUnlisted ? 'hidden' : 'normal'),
              createdAt: data.createdAt,
              updatedAt: data.updatedAt,
            });
          });

          list.sort((a, b) => (a.order || 0) - (b.order || 0));
          cachedFriends = list;
          cacheTimestamp = Date.now();
          saveFriendsToStorage(list);

          const filtered = friendsRepository.filterByCategory(list, category, { includeUnlisted });
          setFriends(filtered);
          setIsLoading(false);
        },
        (err) => {
          clearTimeout(safetyTimer);
          console.warn('Firestore friends subscription warning:', err?.message || err);
          const errMsg = String(err?.message || err).toLowerCase();
          const isPerm = errMsg.includes('permission');
          const isUnavailable = errMsg.includes('unavailable') || errMsg.includes('offline');

          if (isPerm) {
            setError(
              new Error(
                'Firebase Rules: कृपया Firebase Console में जाकर Firestore Rules पब्लिश करें ताकि दोस्त लोड हो सकें।'
              )
            );
            setFriends([]);
          } else if (!isUnavailable) {
            setError(err instanceof Error ? err : new Error(String(err)));
          }
          setIsLoading(false);
        }
      );
    } catch (err: any) {
      clearTimeout(safetyTimer);
      console.warn('Failed to attach friends snapshot listener:', err);
      setIsLoading(false);
    }

    return () => {
      clearTimeout(safetyTimer);
      unsubscribe();
    };
  }, [category, includeUnlisted]);

  return {
    friends,
    isLoading,
    error,
    refetch: fetchFriends,
  };
}

export function useFriend(id: string | null): {
  friend: Friend | null;
  isLoading: boolean;
  error: Error | null;
} {
  const [friend, setFriend] = useState<Friend | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(!!id);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!id) {
      setFriend(null);
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setError(null);

    friendsRepository
      .get(id)
      .then((data) => {
        if (isMounted) {
          setFriend(data);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error(String(err)));
          setFriend(null);
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  return { friend, isLoading, error };
}

export function useFriendsConfig(): {
  settings: FriendsConfigSettings;
  isLoading: boolean;
  refreshSettings: () => Promise<void>;
} {
  const [settings, setSettings] = useState<FriendsConfigSettings>(DEFAULT_FRIENDS_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const data = await friendsRepository.getSettings();
      setSettings(data);
    } catch (e) {
      console.warn('Using default friends settings:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return { settings, isLoading, refreshSettings: fetchSettings };
}

export function useFriendRequests(statusFilter?: string): {
  requests: FriendRequest[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
} {
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchRequests = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await friendsRepository.listRequests(statusFilter);
      setRequests(data);
      setError(null);
    } catch (e: any) {
      setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    let unsubscribe: () => void = () => {};
    try {
      unsubscribe = onSnapshot(
        collection(db, 'friendRequests'),
        (snap) => {
          const list: FriendRequest[] = [];
          snap.forEach((d) => {
            const data = d.data();
            list.push({
              id: d.id,
              type: data.type,
              profileId: data.profileId,
              status: data.status,
              submittedAt: data.submittedAt,
              reviewedAt: data.reviewedAt,
              applicantName: data.applicantName || '',
              applicantContact: data.applicantContact || '',
              profileData: data.profileData || {},
              originalData: data.originalData || {},
              adminCategory: data.adminCategory,
              assignedCategories: data.assignedCategories,
              adminNotes: data.adminNotes,
            });
          });
          list.sort((a, b) => {
            const tA = a.submittedAt?.toMillis ? a.submittedAt.toMillis() : (a.submittedAt ? new Date(a.submittedAt).getTime() : 0);
            const tB = b.submittedAt?.toMillis ? b.submittedAt.toMillis() : (b.submittedAt ? new Date(b.submittedAt).getTime() : 0);
            return tB - tA;
          });
          if (statusFilter && statusFilter !== 'all') {
            setRequests(list.filter((r) => r.status === statusFilter));
          } else {
            setRequests(list);
          }
          setIsLoading(false);
        },
        (err) => {
          console.warn('FriendRequests onSnapshot warning:', err);
          fetchRequests();
        }
      );
    } catch {
      fetchRequests();
    }
    return () => unsubscribe();
  }, [statusFilter, fetchRequests]);

  return { requests, isLoading, error, refetch: fetchRequests };
}

