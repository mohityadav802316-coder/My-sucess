/**
 * Firebase SDK Integration Module
 * Connected to Firebase Firestore and Firebase Authentication.
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword as fbSignInWithEmail,
  signInWithPopup as fbSignInWithPopup,
  signOut as fbSignOut,
  onAuthStateChanged as fbOnAuthStateChanged,
  updatePassword as fbUpdatePassword,
  createUserWithEmailAndPassword as fbCreateUser,
  reauthenticateWithCredential as fbReauthenticate,
  EmailAuthProvider as fbEmailAuthProvider,
  sendPasswordResetEmail as fbSendPasswordReset,
  GoogleAuthProvider,
  type User as FirebaseUser,
} from 'firebase/auth';
import {
  initializeFirestore,
  getFirestore,
  setLogLevel,
  doc,
  getDoc,
  getDocFromServer,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  getDocs,
  onSnapshot,
  collection,
} from 'firebase/firestore';
import {
  getStorage,
  ref,
  uploadBytes,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase App singleton
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Suppress non-critical Firestore network timeout warnings in dev console
setLogLevel('error');

// Database instance with experimentalAutoDetectLongPolling for best WebSocket + iframe compatibility
let firestoreDb;
try {
  firestoreDb = initializeFirestore(
    app,
    {
      experimentalAutoDetectLongPolling: true,
    },
    firebaseConfig.firestoreDatabaseId
  );
} catch {
  firestoreDb = getFirestore(app, firebaseConfig.firestoreDatabaseId);
}

export const db = firestoreDb;
export const auth = getAuth(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

// Authorized Administrator Emails
export const AUTHORIZED_ADMIN_EMAILS = [
  'yadavshiv16478@gmail.com',
  'mohityadav802316@gmail.com',
];

export type User = FirebaseUser;

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export async function testFirestoreConnection(): Promise<boolean> {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return false;
  }
  try {
    const probeTimeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Connection probe timeout')), 4000)
    );
    await Promise.race([
      getDocFromServer(doc(db, 'test', 'connection')),
      probeTimeout,
    ]);
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      // Graceful offline operation handled automatically by Firebase offline cache
      return false;
    }
    return false;
  }
}

// Initial boot probe (deferred until page has finished loading and network is idle)
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    const runProbe = () => {
      testFirestoreConnection().catch(() => {});
    };
    if ('requestIdleCallback' in window) {
      (window as unknown as { requestIdleCallback: (cb: () => void) => void }).requestIdleCallback(runProbe);
    } else {
      setTimeout(runProbe, 3000);
    }
  });
}

export function isUserAdmin(user: User | null): boolean {
  if (!user || !user.email) return false;
  return AUTHORIZED_ADMIN_EMAILS.includes(user.email.toLowerCase());
}

// Auth wrappers
export const signInWithEmailAndPassword = fbSignInWithEmail;
export const signInWithPopup = fbSignInWithPopup;
export const signOut = fbSignOut;
export const onAuthStateChanged = fbOnAuthStateChanged;
export const updatePassword = fbUpdatePassword;
export const createUserWithEmailAndPassword = fbCreateUser;
export const reauthenticateWithCredential = fbReauthenticate;
export const EmailAuthProvider = fbEmailAuthProvider;
export const sendPasswordResetEmail = fbSendPasswordReset;

// Re-export Firestore primitives
export {
  doc,
  getDoc,
  getDocFromServer,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  getDocs,
  onSnapshot,
  collection,
};

// Re-export Storage primitives
export {
  ref,
  uploadBytes,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
};
