import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../../context/LanguageContext';
import { sound } from '../audio/SoundEffects';
import {
  auth,
  signInWithEmailAndPassword,
  signInWithPopup,
  googleProvider,
  signOut,
  onAuthStateChanged,
  User,
  db,
  doc,
  getDoc
} from '../../firebase';
import {
  Shield,
  Key,
  Lock,
  Unlock,
  X,
  Layers,
  Sparkles,
  Code2,
  MapPin,
  Image as ImageIcon,
  Heart,
  FileText,
  Palette,
  Volume2,
  Mail,
  MessageSquare,
  Fingerprint,
  Database,
  LogOut,
  AlertCircle,
  Users,
  Eye,
  EyeOff,
  CheckCircle2,
  UploadCloud
} from 'lucide-react';

import { AdminSkillsManager } from './AdminSkillsManager';
import { AdminProjectManager } from './AdminProjectManager';
import { AdminJourneyManager } from './AdminJourneyManager';
import { AdminImagesManager } from './AdminImagesManager';
import { AdminCloudinaryUpload } from './AdminCloudinaryUpload';
import { AdminFriendsManager } from './AdminFriendsManager';
import { AdminFamilyManager } from './AdminFamilyManager';
import { AdminContentManager } from './AdminContentManager';
import { AdminThemeCustomizer } from './AdminThemeCustomizer';
import { AdminAudioManager } from './AdminAudioManager';
import { AdminContactManager } from './AdminContactManager';
import { AdminGuestbookManager } from './AdminGuestbookManager';
import { AdminSecurityManager } from './AdminSecurityManager';
import { AdminBackupManager } from './AdminBackupManager';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AdminTab =
  | 'skills'
  | 'projects'
  | 'journey'
  | 'images'
  | 'cloudinary_upload'
  | 'friends'
  | 'family'
  | 'content'
  | 'theme'
  | 'audio'
  | 'contact'
  | 'guestbook'
  | 'security'
  | 'backup';

const ALLOWED_ADMIN_EMAILS = [
  'mohityadav802316@gmail.com',
  'yadavshiv16478@gmail.com'
];

export const AdminModal: React.FC<AdminModalProps> = ({ isOpen, onClose }) => {
  const { mode } = useLanguage();

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAdminAuthorized, setIsAdminAuthorized] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<AdminTab>('skills');

  // Login form states (Email & Password only)
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);

  // Monitor Firebase Auth state securely
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setAuthLoading(true);
      if (user) {
        setCurrentUser(user);
        // Verify authorization
        const isEmailMatch = ALLOWED_ADMIN_EMAILS.includes(user.email || '');
        if (isEmailMatch) {
          setIsAdminAuthorized(true);
        } else {
          // Check if admin document exists in Firestore
          try {
            const adminDoc = await getDoc(doc(db, 'admins', user.uid));
            if (adminDoc.exists()) {
              setIsAdminAuthorized(true);
            } else {
              setIsAdminAuthorized(false);
            }
          } catch {
            setIsAdminAuthorized(false);
          }
        }
      } else {
        setCurrentUser(null);
        setIsAdminAuthorized(false);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifying(true);
    setErrorMsg(null);

    const email = emailInput.trim();
    const password = passwordInput;

    if (!email || !password) {
      setErrorMsg('Please enter both administrative email and password.');
      setVerifying(false);
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Check admin privilege
      let authorized = ALLOWED_ADMIN_EMAILS.includes(user.email || '');
      if (!authorized) {
        try {
          const adminDoc = await getDoc(doc(db, 'admins', user.uid));
          if (adminDoc.exists()) {
            authorized = true;
          }
        } catch {}
      }

      if (!authorized) {
        await signOut(auth);
        sound.playAlert();
        setErrorMsg('Access Denied: This account does not possess administrator privileges.');
        return;
      }

      sound.playSuccess();
      setPasswordInput('');
    } catch (err: any) {
      sound.playAlert();
      console.error('Firebase Auth Login Error:', err);
      if (
        err.code === 'auth/invalid-credential' ||
        err.code === 'auth/user-not-found' ||
        err.code === 'auth/wrong-password'
      ) {
        setErrorMsg('Invalid email address or password.');
      } else if (err.code === 'auth/too-many-requests') {
        setErrorMsg('Account access temporarily blocked due to multiple failed attempts. Please retry later.');
      } else if (err.code === 'auth/invalid-email') {
        setErrorMsg('Please provide a valid email address.');
      } else {
        setErrorMsg(`Authentication failed: ${err.message || 'Please check your connection.'}`);
      }
    } finally {
      setVerifying(false);
    }
  };

  const handleGoogleLogin = async () => {
    sound.playClick();
    setVerifying(true);
    setErrorMsg(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      let authorized = ALLOWED_ADMIN_EMAILS.includes(user.email || '');
      if (!authorized) {
        try {
          const adminDoc = await getDoc(doc(db, 'admins', user.uid));
          if (adminDoc.exists()) authorized = true;
        } catch {}
      }
      if (!authorized) {
        await signOut(auth);
        sound.playAlert();
        setErrorMsg(`प्रवेश अस्वीकृत: ${user.email} व्यवस्थापक सूची में नहीं है।`);
        return;
      }
      sound.playSuccess();
    } catch (err: any) {
      sound.playAlert();
      setErrorMsg(err.message || 'Google Sign-In विफल हुआ।');
    } finally {
      setVerifying(false);
    }
  };

  const handleLogout = async () => {
    sound.playClick();
    try {
      await signOut(auth);
    } catch (err) {
      console.warn('Logout error:', err);
    }
  };

  const tabs: { id: AdminTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'skills', label: 'Skills Stack', icon: Layers },
    { id: 'projects', label: 'Projects', icon: Code2 },
    { id: 'journey', label: 'Milestones', icon: MapPin },
    { id: 'cloudinary_upload', label: 'Cloudinary CDN', icon: UploadCloud },
    { id: 'images', label: 'Media & 3D Orbit', icon: ImageIcon },
    { id: 'friends', label: 'Friends Universe', icon: Users },
    { id: 'family', label: 'Family Vault', icon: Heart },
    { id: 'content', label: 'Content & Bio', icon: FileText },
    { id: 'theme', label: 'Theme Studio', icon: Palette },
    { id: 'audio', label: 'Audio Engine', icon: Volume2 },
    { id: 'contact', label: 'Contact Transmissions', icon: Mail },
    { id: 'guestbook', label: 'Guestbook Moderation', icon: MessageSquare },
    { id: 'security', label: 'Admin Security', icon: Fingerprint },
    { id: 'backup', label: 'Backup & Restore', icon: Database },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/90 backdrop-blur-2xl overflow-y-auto">
      <div className="relative w-full max-w-6xl my-auto rounded-3xl bg-slate-950 border border-amber-500/40 shadow-[0_0_60px_rgba(245,158,11,0.25)] overflow-hidden flex flex-col max-h-[94vh]">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-amber-500/20 bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 via-rose-500 to-amber-600 p-0.5 shadow-lg shadow-amber-500/30 flex items-center justify-center">
              <Shield className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <h2 className="font-cyber font-bold text-lg text-white tracking-wider flex items-center gap-2">
                CYBERNETIC COMMAND CONSOLE
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono">
                  ADMIN v4.1
                </span>
              </h2>
              <p className="text-xs font-mono text-slate-400">
                Authorized Personnel Only • Secure Firebase Authentication
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAdminAuthorized && currentUser && (
              <div className="flex items-center gap-2 mr-2">
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setActiveTab('cloudinary_upload');
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono border transition cursor-pointer ${
                    activeTab === 'cloudinary_upload'
                      ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400 shadow-md shadow-cyan-500/20'
                      : 'bg-cyan-950/40 hover:bg-cyan-900/50 text-cyan-300 border-cyan-500/40'
                  }`}
                  title="Upload Photos to Cloudinary CDN"
                >
                  <UploadCloud className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="hidden sm:inline">+ Cloudinary Upload</span>
                </button>
                <span className="hidden md:inline text-[11px] font-mono text-slate-400 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
                  <span className="text-emerald-400 font-bold mr-1.5">●</span>
                  {currentUser.email}
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-rose-950/60 text-slate-400 hover:text-rose-300 border border-slate-800 text-xs font-mono cursor-pointer transition"
                  title="Sign out of Admin Session"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            )}

            <button
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Loading / Auth Gate or Dashboard */}
        {authLoading ? (
          <div className="p-16 flex flex-col items-center justify-center flex-1 text-center space-y-3 font-mono text-xs text-slate-400">
            <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
            <span>Verifying cryptographic credentials...</span>
          </div>
        ) : !isAdminAuthorized ? (
          <div className="p-8 sm:p-12 flex flex-col items-center justify-center flex-1 max-w-md mx-auto text-center space-y-6">
            <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-xl shadow-amber-500/10">
              <Lock className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h3 className="font-cyber font-bold text-xl text-white tracking-wide">
                Admin Authentication Required
              </h3>
              <p className="text-xs font-mono text-slate-400 leading-relaxed">
                Enter your registered administrator email and password to access the control plane.
              </p>
            </div>

            {errorMsg && (
              <div className="w-full p-3 rounded-xl bg-rose-950/60 border border-rose-500/50 text-rose-300 font-mono text-xs flex items-center gap-2 text-left">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Google 1-Click Authentication */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={verifying}
              className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-semibold text-xs flex items-center justify-center gap-2.5 transition shadow-lg shadow-white/10 cursor-pointer disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>1-Click Sign In with Google</span>
            </button>

            <div className="flex items-center gap-3 w-full my-2">
              <div className="flex-1 h-px bg-slate-800" />
              <span className="text-[10px] font-mono text-slate-500 uppercase">OR EMAIL &amp; PASSWORD</span>
              <div className="flex-1 h-px bg-slate-800" />
            </div>

            <form onSubmit={handleLogin} className="w-full space-y-4">
              <div className="space-y-1 text-left">
                <label className="text-[11px] font-mono text-slate-400">Admin Email</label>
                <input
                  type="email"
                  required
                  autoFocus
                  autoComplete="username"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="admin@example.com"
                  className="w-full px-4 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-white font-mono text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                />
              </div>

              <div className="space-y-1 text-left">
                <label className="text-[11px] font-mono text-slate-400">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full px-4 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-white font-mono text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-300 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={verifying}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-slate-950 font-cyber font-bold text-xs uppercase tracking-wider transition shadow-lg shadow-amber-500/25 cursor-pointer disabled:opacity-50"
              >
                {verifying ? 'Authenticating via Firebase Auth...' : 'Sign In as Administrator'}
              </button>
            </form>

            <div className="text-[11px] font-mono text-slate-500 flex items-center justify-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-amber-400/70" />
              <span>Protected by Firebase Auth & Security Rules</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
            {/* Sidebar Tabs */}
            <div className="w-full md:w-60 border-b md:border-b-0 md:border-r border-slate-800/80 bg-slate-950/90 flex md:flex-col overflow-x-auto md:overflow-y-auto p-2 sm:p-3 gap-1 scrollbar-none shrink-0">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      sound.playClick();
                      setActiveTab(tab.id);
                    }}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl font-mono text-xs whitespace-nowrap cursor-pointer transition text-left ${
                      isActive
                        ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                        : 'text-slate-400 hover:text-white hover:bg-slate-900'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Active Content Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-950/60">
              {activeTab === 'skills' && <AdminSkillsManager />}
              {activeTab === 'projects' && <AdminProjectManager />}
              {activeTab === 'journey' && <AdminJourneyManager />}
              {activeTab === 'cloudinary_upload' && <AdminCloudinaryUpload />}
              {activeTab === 'images' && <AdminImagesManager />}
              {activeTab === 'friends' && <AdminFriendsManager />}
              {activeTab === 'family' && <AdminFamilyManager />}
              {activeTab === 'content' && <AdminContentManager />}
              {activeTab === 'theme' && <AdminThemeCustomizer />}
              {activeTab === 'audio' && <AdminAudioManager />}
              {activeTab === 'contact' && <AdminContactManager />}
              {activeTab === 'guestbook' && <AdminGuestbookManager />}
              {activeTab === 'security' && <AdminSecurityManager />}
              {activeTab === 'backup' && <AdminBackupManager />}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
