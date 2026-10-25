/**
 * Local Autonomous Database & Standalone Storage Engine
 * Replaces external Firebase and Supabase cloud backends with zero data loss.
 * Stored locally in localStorage with immediate in-memory caching and real-time pub/sub listeners.
 */

export interface LocalDocument {
  id: string;
  [key: string]: any;
}

export type ListenerCallback = (snapshot: any) => void;

class LocalDatabaseEngine {
  private memoryStore: Map<string, Map<string, LocalDocument>> = new Map();
  private listeners: Map<string, Set<ListenerCallback>> = new Map();
  private isInitialized = false;

  constructor() {
    this.init();
  }

  private getStorageKey(collectionName: string): string {
    return `cybermohit_db_${collectionName}`;
  }

  private init() {
    if (this.isInitialized || typeof window === 'undefined') return;

    // Default Seed Data
    const defaultSettings = {
      id: 'general',
      profile: {
        name: 'Mohit Yadav',
        nameHi: 'मोहित यादव',
        title: 'Future AI Engineer | Python Developer',
        titleHi: 'भावी AI इंजीनियर | पायथन डेवलपर',
        tagline: 'Crafting intelligent systems & neural digital solutions.',
        bio: 'Class 12 (BSEB) Science student turning curiosities into high-impact AI, Python, and web systems.',
        bioHi: 'कक्षा 12 (BSEB) विज्ञान का छात्र, जो जिज्ञासा को वास्तविक AI, पायथन और वेब सिस्टम में बदल रहा है।',
      },
      hero: {
        heroTitle: 'MOHIT YADAV',
        heroSubtitle: 'Future AI Engineer | Python Developer | Web & App Creator',
        heroBioEn: "I'm an aspiring AI Engineer and Python developer passionate about building applications, websites, AI-powered tools, and futuristic digital experiences.",
        heroBioHi: 'मैं एक उत्साही AI इंजीनियर और पायथन डेवलपर हूँ जो उपयोगी ऐप्स और AI उपकरण बनाने के लिए समर्पित हूँ।',
        orbitCycleInterval: 2.5,
        autoRotateSpeed: 0.8,
      },
      contact: {
        email: 'mohityadav802316@gmail.com',
        githubUrl: 'https://github.com',
        whatsappNumber: '+918023160000',
        instagramUrl: 'https://instagram.com/mohityadav',
        location: 'Bihar, India',
        locationHi: 'बिहार, भारत',
        responseAvailability: 'Open for learning collaborations and tech discussions',
        responseAvailabilityHi: 'तकनीकी सहयोग और चर्चा के लिए हमेशा उपलब्ध',
      },
      theme: {
        neonColor: 'cyan',
        glowIntensity: 'balanced',
        fontFamily: 'rajdhani',
        backgroundStyle: 'particles',
        soundEnabledByDefault: false,
      },
      scenes: {
        activeScenes: {
          hero: true,
          techConsole: true,
          about: true,
          skills: true,
          roadmap: true,
          projects: true,
          guestbook: true,
          gallery: true,
          vision: true,
          contact: true,
        },
      },
      music: {
        enabled: true,
        audioUrl: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=ambient-cyberpunk-114294.mp3',
        volume: 0.35,
        title: 'Cyberpunk Ambient Dream',
        loop: true,
        fadeInSeconds: 3,
      },
      magicSmoke: {
        enabled: true,
        intensity: 'medium',
      },
      familyVault: {
        hasPasswordSet: false,
      },
      lowDataMode: false,
    };

    const defaultImages: LocalDocument[] = [
      {
        id: 'img_hero_main',
        title: 'Mohit Yadav - Core Avatar',
        caption: 'Future AI Engineer & Python Developer',
        captionHi: 'भावी AI इंजीनियर व पायथन डेवलपर',
        downloadUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
        storagePath: 'portfolio/mohit_avatar.jpg',
        section: 'profile',
        category: 'personal',
        displayOrder: 0,
        isPublished: true,
        isMainProfile: true,
        isHeroOrbit: true,
        orbitIndex: 0,
        createdAt: { seconds: Math.floor(Date.now() / 1000) },
      },
      {
        id: 'img_orbit_1',
        title: 'Neural Lab Snapshot',
        caption: 'Python & AI Engineering Workspace',
        captionHi: 'पायथन व AI लैब',
        downloadUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80',
        storagePath: 'portfolio/orbit_1.jpg',
        section: 'gallery',
        category: 'personal',
        displayOrder: 1,
        isPublished: true,
        isMainProfile: false,
        isHeroOrbit: true,
        orbitIndex: 1,
        createdAt: { seconds: Math.floor(Date.now() / 1000) - 100 },
      },
      {
        id: 'img_orbit_2',
        title: 'Cyberpunk Code Matrix',
        caption: 'Machine Learning Models & Algorithms',
        captionHi: 'मशीन लर्निंग कोड मैट्रिक्स',
        downloadUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80',
        storagePath: 'portfolio/orbit_2.jpg',
        section: 'gallery',
        category: 'personal',
        displayOrder: 2,
        isPublished: true,
        isMainProfile: false,
        isHeroOrbit: true,
        orbitIndex: 2,
        createdAt: { seconds: Math.floor(Date.now() / 1000) - 200 },
      },
      {
        id: 'img_orbit_3',
        title: 'Multiverse Deep Space',
        caption: 'Creative Technology & AI Generative Art',
        captionHi: 'क्रिएटिव टेक्नोलॉजी व AI कला',
        downloadUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
        storagePath: 'portfolio/orbit_3.jpg',
        section: 'gallery',
        category: 'personal',
        displayOrder: 3,
        isPublished: true,
        isMainProfile: false,
        isHeroOrbit: true,
        orbitIndex: 3,
        createdAt: { seconds: Math.floor(Date.now() / 1000) - 300 },
      },
    ];

    const defaultFamily: LocalDocument[] = [
      {
        id: 'member_mohit',
        name: 'Mohit Yadav',
        nameHi: 'मोहित यादव',
        relation: 'Self',
        relationHi: 'स्वयं',
        bio: 'Creator, AI Engineer and dedicated student.',
        bioHi: 'निर्माता, भावी AI इंजीनियर और छात्र।',
        photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
        photos: ['https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80'],
        order: 1,
        createdAt: { seconds: Math.floor(Date.now() / 1000) },
      },
      {
        id: 'member_shiv',
        name: 'Shiv Yadav',
        nameHi: 'शिव यादव',
        relation: 'Family Mentor',
        relationHi: 'मार्गदर्शक / परिवार',
        bio: 'Guardian and technical support advisor.',
        bioHi: 'पारिवारिक मार्गदर्शक व सहयोगी।',
        photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
        photos: ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80'],
        order: 2,
        createdAt: { seconds: Math.floor(Date.now() / 1000) },
      },
    ];

    const defaultGuestbook: LocalDocument[] = [
      {
        id: 'gb_welcome',
        name: 'Portfolio Terminal',
        message: 'Welcome to Mohit Yadav\'s Cyberpunk AI Portfolio! Feel free to leave a transmission.',
        status: 'approved',
        createdAt: { seconds: Math.floor(Date.now() / 1000) },
      },
    ];

    const defaultFriends: LocalDocument[] = [
      {
        id: 'friend_alex',
        name: 'Aarav Sharma',
        nickname: 'Matrix',
        role: 'AI Researcher & Study Partner',
        bio: 'Collaborating on deep learning networks and mathematics.',
        avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80',
        categories: ['academic', 'all'],
        order: 1,
        isVisible: true,
        links: [{ platform: 'github', label: 'GitHub', url: 'https://github.com' }],
        heroPhotos: ['https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80'],
        gallery: [],
        createdAt: { seconds: Math.floor(Date.now() / 1000) },
      },
      {
        id: 'friend_rohit',
        name: 'Rohit Kumar',
        nickname: 'Cypher',
        role: 'Full-Stack Collaborator',
        bio: 'Co-building real-time web applications and tools.',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80',
        categories: ['squad', 'all'],
        order: 2,
        isVisible: true,
        links: [{ platform: 'x', label: 'Twitter', url: 'https://x.com' }],
        heroPhotos: ['https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80'],
        gallery: [],
        createdAt: { seconds: Math.floor(Date.now() / 1000) },
      },
    ];

    this.ensureCollection('settings', [defaultSettings]);
    this.ensureCollection('images', defaultImages);
    this.ensureCollection('family_members', defaultFamily);
    this.ensureCollection('guestbook', defaultGuestbook);
    this.ensureCollection('friends', defaultFriends);
    this.ensureCollection('messages', []);

    this.isInitialized = true;
  }

  private ensureCollection(collectionName: string, defaultDocs: LocalDocument[]) {
    const key = this.getStorageKey(collectionName);
    const existingRaw = localStorage.getItem(key);
    let map = new Map<string, LocalDocument>();

    if (existingRaw) {
      try {
        const parsed = JSON.parse(existingRaw);
        if (Array.isArray(parsed)) {
          parsed.forEach((doc) => map.set(doc.id, doc));
        } else if (typeof parsed === 'object') {
          Object.values(parsed).forEach((doc: any) => {
            if (doc && doc.id) map.set(doc.id, doc);
          });
        }
      } catch {
        map = new Map();
      }
    }

    // Populate defaults if collection is empty
    if (map.size === 0) {
      defaultDocs.forEach((doc) => map.set(doc.id, doc));
      this.saveCollectionToStorage(collectionName, map);
    }

    this.memoryStore.set(collectionName, map);
  }

  private saveCollectionToStorage(collectionName: string, map: Map<string, LocalDocument>) {
    if (typeof window === 'undefined') return;
    try {
      const arr = Array.from(map.values());
      localStorage.setItem(this.getStorageKey(collectionName), JSON.stringify(arr));
    } catch (e) {
      console.warn(`[LocalDatabase] Error saving ${collectionName} to localStorage:`, e);
    }
  }

  private getCollectionMap(collectionName: string): Map<string, LocalDocument> {
    this.init();
    let map = this.memoryStore.get(collectionName);
    if (!map) {
      map = new Map();
      const existingRaw = typeof window !== 'undefined' ? localStorage.getItem(this.getStorageKey(collectionName)) : null;
      if (existingRaw) {
        try {
          const parsed = JSON.parse(existingRaw);
          if (Array.isArray(parsed)) {
            parsed.forEach((doc) => map!.set(doc.id, doc));
          }
        } catch {}
      }
      this.memoryStore.set(collectionName, map);
    }
    return map;
  }

  public getDoc(collectionName: string, docId: string): LocalDocument | null {
    const map = this.getCollectionMap(collectionName);
    const doc = map.get(docId);
    return doc ? { ...doc } : null;
  }

  public getCollection(collectionName: string): LocalDocument[] {
    const map = this.getCollectionMap(collectionName);
    return Array.from(map.values()).map((d) => ({ ...d }));
  }

  public setDoc(collectionName: string, docId: string, data: any, merge = true): LocalDocument {
    const map = this.getCollectionMap(collectionName);
    const existing = map.get(docId);
    const updated: LocalDocument = merge && existing
      ? { ...existing, ...data, id: docId, updatedAt: { seconds: Math.floor(Date.now() / 1000) } }
      : { ...data, id: docId, updatedAt: { seconds: Math.floor(Date.now() / 1000) } };

    if (!updated.createdAt) {
      updated.createdAt = { seconds: Math.floor(Date.now() / 1000) };
    }

    map.set(docId, updated);
    this.saveCollectionToStorage(collectionName, map);
    this.notify(collectionName, docId);
    return updated;
  }

  public deleteDoc(collectionName: string, docId: string): boolean {
    const map = this.getCollectionMap(collectionName);
    const existed = map.delete(docId);
    if (existed) {
      this.saveCollectionToStorage(collectionName, map);
      this.notify(collectionName, docId);
    }
    return existed;
  }

  public addDoc(collectionName: string, data: any): LocalDocument {
    const id = data.id || `${collectionName}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    return this.setDoc(collectionName, id, data, false);
  }

  public subscribe(key: string, callback: ListenerCallback): () => void {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    const set = this.listeners.get(key)!;
    set.add(callback);

    return () => {
      set.delete(callback);
    };
  }

  private notify(collectionName: string, docId?: string) {
    // Notify collection-level subscribers
    const colKey = `col:${collectionName}`;
    const colSubscribers = this.listeners.get(colKey);
    if (colSubscribers) {
      const items = this.getCollection(collectionName);
      colSubscribers.forEach((cb) => {
        try {
          cb(items);
        } catch (e) {
          console.warn('[LocalDatabase Listener Error]:', e);
        }
      });
    }

    // Notify document-level subscribers
    if (docId) {
      const docKey = `doc:${collectionName}/${docId}`;
      const docSubscribers = this.listeners.get(docKey);
      if (docSubscribers) {
        const item = this.getDoc(collectionName, docId);
        docSubscribers.forEach((cb) => {
          try {
            cb(item);
          } catch (e) {
            console.warn('[LocalDatabase Doc Listener Error]:', e);
          }
        });
      }
    }
  }
}

export const localDB = new LocalDatabaseEngine();
