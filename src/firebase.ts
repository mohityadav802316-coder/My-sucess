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

// Database instance with experimentalForceLongPolling for iframe & Cloud Run sandbox compatibility
let firestoreDb;
try {
  firestoreDb = initializeFirestore(
    app,
    {
      experimentalForceLongPolling: true,
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
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error) {
      console.warn('Firestore connection notice (offline cache active):', error.message);
    }
    return false;
  }
}

// Initial boot probe (deferred until network idle)
if (typeof window !== 'undefined') {
  setTimeout(() => {
    testFirestoreConnection().catch(() => {});
  }, 1000);
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
