import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../../context/LanguageContext';
import { sound } from '../audio/SoundEffects';
import { FamilyMember } from '../../types';
import { hashPasswordWithSalt } from '../../utils/crypto';
import { db, collection, getDocs, doc, getDoc, auth } from '../../firebase';
import { FamilyMemberHeroProfile } from './FamilyMemberHeroProfile';
import {
  Lock,
  Unlock,
  Key,
  ShieldAlert,
  ShieldCheck,
  Heart,
  X,
  Sparkles,
  AlertTriangle,
  User,
  Clock,
  Eye,
  EyeOff
} from 'lucide-react';

interface FamilyVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SESSION_KEY = 'cybermohit_family_vault_token';
const ATTEMPTS_KEY = 'cybermohit_vault_failed_attempts';
const LOCKOUT_KEY = 'cybermohit_vault_lockout_until';
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 5 * 60 * 1000; // 5 minutes

export const defaultFamilyMembers: FamilyMember[] = [
  {
    id: 'sample_father',
    name: 'Father (पिताजी)',
    nameHi: 'पिताजी',
    relation: 'Father',
    relationHi: 'पिता',
    bio: 'Family pillar, unwavering guidance and encouragement.',
    bioHi: 'परिवार के मजबूत स्तम्भ और हमेशा मार्गदर्शन करने वाले।',
    photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80',
    photos: [
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80',
    ],
    order: 1,
  },
  {
    id: 'sample_mother',
    name: 'Mother (माताजी)',
    nameHi: 'माताजी',
    relation: 'Mother',
    relationHi: 'माँ',
    bio: 'Endless love, warmth, blessings and strength.',
    bioHi: 'स्नेह, वात्सल्य और जीवन की हर मुश्किल में साथ देने वाली।',
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80',
    photos: [
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80',
    ],
    order: 2,
  },
];

export const FamilyVaultModal: React.FC<FamilyVaultModalProps> = ({ isOpen, onClose }) => {
  const { mode } = useLanguage();

  // Authentication & Session State
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [lockoutRemaining, setLockoutRemaining] = useState(0);

  // Family Members Data
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);

  // Check existing session & lockout on open
  useEffect(() => {
    if (!isOpen) return;

    // Check Lockout
    const checkLockout = () => {
      const lockoutUntil = Number(localStorage.getItem(LOCKOUT_KEY) || 0);
      const now = Date.now();
      if (lockoutUntil > now) {
        setLockoutRemaining(Math.ceil((lockoutUntil - now) / 1000));
      } else {
        setLockoutRemaining(0);
        localStorage.removeItem(LOCKOUT_KEY);
      }
    };
    checkLockout();
    const interval = setInterval(checkLockout, 1000);

    // Check Session Token
    const sessionStr = sessionStorage.getItem(SESSION_KEY);
    if (sessionStr) {
      try {
        const session = JSON.parse(sessionStr);
        if (session.expiresAt && Date.now() < session.expiresAt) {
          setIsUnlocked(true);
          loadFamilyMembers();
        } else {
          sessionStorage.removeItem(SESSION_KEY);
          setIsUnlocked(false);
        }
      } catch {
        sessionStorage.removeItem(SESSION_KEY);
      }
    }

    return () => clearInterval(interval);
  }, [isOpen]);

  const loadFamilyMembers = async () => {
    setLoadingMembers(true);
    try {
      const snap = await getDocs(collection(db, 'family_members'));
      if (!snap.empty) {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as FamilyMember));
        list.sort((a, b) => (a.order || 0) - (b.order || 0));
        setMembers(list);
      } else {
        // Fallback default sample members if none created yet
        setMembers(defaultFamilyMembers);
      }
    } catch (err) {
      console.warn('Family members fetch note (Zero-Trust Rules active):', err);
      setMembers(defaultFamilyMembers);
    } finally {
      setLoadingMembers(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isVerifying || lockoutRemaining > 0) return;

    if (!passwordInput.trim()) {
      setAuthError(mode === 'hi' ? 'कृपया पासवर्ड दर्ज करें।' : 'Please enter the vault password.');
      return;
    }

    sound.playClick();
    setIsVerifying(true);
    setAuthError('');

    try {
      // Check if logged in as Admin first (admin always has master clearance)
      if (auth.currentUser && ['mohityadav802316@gmail.com', 'yadavshiv16478@gmail.com'].includes(auth.currentUser.email || '')) {
        handleSuccessUnlock();
        return;
      }

      const vaultDoc = await getDoc(doc(db, 'settings', 'family_vault'));
      const vaultData = vaultDoc.data();

      // If admin has set a salted password hash in Firestore
      if (vaultData && vaultData.passwordHash && vaultData.passwordSalt) {
        const computedHash = await hashPasswordWithSalt(passwordInput.trim(), vaultData.passwordSalt);
        if (computedHash === vaultData.passwordHash) {
          handleSuccessUnlock();
          return;
        }
      } else {
        setAuthError(
          mode === 'hi'
            ? 'वॉल्ट का पासवर्ड एडमिन पैनल में अभी कॉन्फ़िगर नहीं किया गया है।'
            : 'Family Vault password has not been configured yet in Admin Panel.'
        );
        setIsVerifying(false);
        return;
      }

      // Password Incorrect
      handleFailedAttempt();
    } catch (err: any) {
      console.error('Vault verification error:', err);
      handleFailedAttempt();
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSuccessUnlock = () => {
    sound.playSuccess();
    localStorage.removeItem(ATTEMPTS_KEY);
    localStorage.removeItem(LOCKOUT_KEY);
    setLockoutRemaining(0);
    setAuthError('');

    const sessionToken = {
      unlockedAt: Date.now(),
      expiresAt: Date.now() + 30 * 60 * 1000,
    };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(sessionToken));
    setIsUnlocked(true);
    loadFamilyMembers();
  };

  const handleFailedAttempt = () => {
    const current = Number(localStorage.getItem(ATTEMPTS_KEY) || 0) + 1;
    localStorage.setItem(ATTEMPTS_KEY, String(current));

    if (current >= MAX_ATTEMPTS) {
      const lockoutTime = Date.now() + LOCKOUT_DURATION_MS;
      localStorage.setItem(LOCKOUT_KEY, String(lockoutTime));
      setLockoutRemaining(Math.ceil(LOCKOUT_DURATION_MS / 1000));
      setAuthError(
        mode === 'hi'
          ? 'अधिक गलत प्रयासों के कारण वॉल्ट 5 मिनट के लिए लॉक कर दिया गया है।'
          : 'Too many incorrect attempts. Locked out for 5 minutes.'
      );
    } else {
      setAuthError(
        mode === 'hi'
          ? `गलत पासवर्ड! शेष प्रयास: ${MAX_ATTEMPTS - current}`
          : `Incorrect password! Remaining attempts: ${MAX_ATTEMPTS - current}`
      );
    }
  };

  const handleLockVault = () => {
    sound.playClick();
    sessionStorage.removeItem(SESSION_KEY);
    setIsUnlocked(false);
    setSelectedMember(null);
    setPasswordInput('');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl flex items-center justify-center p-3 sm:p-6 overflow-y-auto select-none"
      >
        <div className="relative w-full max-w-5xl my-4 sm:my-8 bg-slate-950/95 border border-rose-500/40 rounded-3xl p-4 sm:p-8 shadow-[0_0_60px_rgba(244,63,94,0.25)] flex flex-col justify-between max-h-[92vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-rose-500/20 mb-6 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-400">
                {isUnlocked ? <Unlock className="w-5 h-5 text-emerald-400" /> : <Lock className="w-5 h-5" />}
              </div>
              <div>
                <h2 className="font-cyber font-black text-white text-base sm:text-xl flex items-center gap-2">
                  <span>{mode === 'hi' ? 'परिवार वॉल्ट (Locked Folder)' : 'Family Vault — Locked Folder'}</span>
                  {isUnlocked && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      Unlocked (30m)
                    </span>
                  )}
                </h2>
                <p className="text-[11px] font-mono text-slate-400">
                  {mode === 'hi'
                    ? 'क्रिप्टोग्राफिक हैश द्वारा सुरक्षित निजी पारिवारिक सर्कल।'
                    : 'Encrypted private family circle protected by salted cryptographic hash.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isUnlocked && (
                <button
                  onClick={handleLockVault}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-rose-500/40 hover:border-rose-400 text-rose-300 text-xs font-mono transition cursor-pointer"
                  title="Lock Vault Now"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{mode === 'hi' ? 'लॉक करें' : 'Lock Vault'}</span>
                </button>
              )}
              <button
                onClick={() => {
                  sound.playClick();
                  onClose();
                }}
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* If Member Profile is selected, show 3D Hero Profile */}
          {selectedMember ? (
            <FamilyMemberHeroProfile
              member={selectedMember}
              onBack={() => setSelectedMember(null)}
            />
          ) : !isUnlocked ? (
            /* LOCKED PASSWORD CHALLENGE */
            <div className="max-w-md mx-auto w-full py-10 space-y-6 text-center">
              <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-2 border-rose-500/40 border-dashed animate-spin" style={{ animationDuration: '12s' }} />
                <div className="absolute inset-2 rounded-full border border-amber-500/50 animate-pulse" />
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-600 to-amber-600 flex items-center justify-center text-white shadow-[0_0_25px_rgba(244,63,94,0.6)]">
                  <Lock className="w-7 h-7" />
                </div>
              </div>

              <div className="space-y-1">
                <h3 className="font-cyber font-bold text-white text-lg sm:text-xl">
                  {mode === 'hi' ? 'वॉल्ट पासवर्ड दर्ज करें' : 'Enter Vault Password'}
                </h3>
                <p className="text-xs font-mono text-slate-400">
                  {mode === 'hi'
                    ? 'पारिवारिक सदस्यों को देखने के लिए अधिकृत पासकी दर्ज करें।'
                    : 'Provide the authorized passkey to reveal the 3D family circle.'}
                </p>
              </div>

              {lockoutRemaining > 0 ? (
                <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/50 text-rose-300 text-xs font-mono space-y-2">
                  <div className="flex items-center justify-center gap-2 font-bold">
                    <Clock className="w-4 h-4 animate-spin" />
                    <span>
                      {mode === 'hi' ? 'दर सीमा सक्रिय' : 'Rate Limit Lockout Active'}
                    </span>
                  </div>
                  <p>
                    {mode === 'hi'
                      ? `कृपया प्रतीक्षा करें: ${Math.floor(lockoutRemaining / 60)}m ${lockoutRemaining % 60}s`
                      : `Please wait before trying again: ${Math.floor(lockoutRemaining / 60)}m ${lockoutRemaining % 60}s`}
                  </p>
                </div>
              ) : (
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      placeholder={mode === 'hi' ? 'पासवर्ड लिखें...' : 'Enter vault password...'}
                      className="w-full px-4 py-3.5 pr-12 rounded-2xl bg-slate-900 border border-rose-500/40 text-white font-mono text-sm focus:outline-none focus:border-rose-400 shadow-inner"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {authError && (
                    <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs font-mono text-left flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                      <span>{authError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isVerifying}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 via-amber-600 to-rose-600 hover:from-rose-500 hover:to-amber-500 text-white font-cyber font-bold text-xs uppercase tracking-wider transition-all duration-200 shadow-xl shadow-rose-600/30 active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                  >
                    {isVerifying ? (mode === 'hi' ? 'सत्यापित हो रहा है...' : 'Verifying Key...') : (mode === 'hi' ? 'वॉल्ट अनलॉक करें →' : 'Unlock Family Vault →')}
                  </button>
                </form>
              )}
            </div>
          ) : (
            /* UNLOCKED FAMILY MEMBERS DIRECTORY */
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-cyber font-bold text-white text-lg flex items-center gap-2">
                    <Heart className="w-4 h-4 text-rose-400 fill-rose-500" />
                    <span>{mode === 'hi' ? 'परिवार सदस्य' : 'Family Members Circle'}</span>
                  </h3>
                  <p className="text-xs font-mono text-slate-400">
                    {mode === 'hi'
                      ? 'किसी भी सदस्य पर क्लिक करके उनका 3D हीरो प्रोफाइल देखें।'
                      : 'Click any family member to view their interactive 3D hero profile and photos.'}
                  </p>
                </div>
                <span className="text-xs font-mono px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-amber-300">
                  {members.length} {mode === 'hi' ? 'सदस्य' : 'Members'}
                </span>
              </div>

              {loadingMembers ? (
                <div className="py-20 text-center font-mono text-xs text-amber-300 animate-pulse">
                  Loading encrypted family records...
                </div>
              ) : members.length === 0 ? (
                <div className="py-16 text-center text-xs font-mono text-slate-400 space-y-2">
                  <p>{mode === 'hi' ? 'कोई सदस्य नहीं मिला। Admin Panel से जोड़ें।' : 'No family members found yet. Add them from Admin Panel.'}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {members.map((member) => (
                    <motion.div
                      key={member.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        sound.playClick();
                        setSelectedMember(member);
                      }}
                      className="p-5 rounded-2xl bg-slate-900/80 border border-rose-500/30 hover:border-rose-400 transition cursor-pointer shadow-lg hover:shadow-rose-500/20 group relative overflow-hidden"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-950 border border-rose-500/40 shrink-0 shadow-md flex items-center justify-center">
                          {member.photoUrl && member.photoUrl.trim() !== '' ? (
                            <img
                              src={member.photoUrl || undefined}
                              alt={member.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                            />
                          ) : (
                            <User className="w-8 h-8 text-rose-400" />
                          )}
                        </div>
                        <div className="space-y-1 flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-cyber font-bold text-white text-base truncate">
                              {mode === 'hi' && member.nameHi ? member.nameHi : member.name}
                            </span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 shrink-0">
                              {mode === 'hi' && member.relationHi ? member.relationHi : member.relation}
                            </span>
                          </div>
                          <p className="text-[11px] font-sans text-slate-300 line-clamp-2">
                            {mode === 'hi' && member.bioHi ? member.bioHi : member.bio}
                          </p>
                          <div className="pt-1 flex items-center justify-between text-[10px] font-mono text-amber-300">
                            <span>✨ 3D Profile & Photos</span>
                            <span>{member.photos?.length || 1} Shots →</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
