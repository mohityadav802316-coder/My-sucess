import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Friend, FriendPhoto, FriendRequest, resolveImageUrl } from '../data/friends';
import { friendsRepository } from '../data/repository';
import { sound } from '../../components/audio/SoundEffects';
import {
  X,
  Upload,
  Check,
  AlertTriangle,
  Copy,
  MessageCircle,
  Sparkles,
  User,
  Phone,
  Gamepad2,
  MapPin,
  Heart,
  Rocket,
  Palette,
  ExternalLink,
  ShieldCheck,
  Clock,
} from 'lucide-react';

const ADMIN_WHATSAPP_NUMBER = '919153086540';

const PRESET_ACCENTS = [
  { name: 'Electric Cyan', hex: '#00F2FE' },
  { name: 'Neon Purple', hex: '#9B5CFF' },
  { name: 'Warm Gold', hex: '#FFB53D' },
  { name: 'Cyber Lime', hex: '#B6FF2B' },
  { name: 'Hot Pink', hex: '#FF2BD6' },
  { name: 'Electric Orange', hex: '#FF6A00' },
  { name: 'Emerald', hex: '#10B981' },
];

interface CreateOrEditProfileModalProps {
  isOpen: boolean;
  mode: 'create' | 'edit';
  friend?: Friend | null;
  onClose: () => void;
  onSuccess?: (requestId: string) => void;
}

export const CreateOrEditProfileModal: React.FC<CreateOrEditProfileModalProps> = ({
  isOpen,
  mode,
  friend,
  onClose,
  onSuccess,
}) => {
  // Form fields
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [username, setUsername] = useState('');
  const [tagline, setTagline] = useState('');
  const [bio, setBio] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [ffName, setFfName] = useState('');
  const [ffUid, setFfUid] = useState('');
  const [instagram, setInstagram] = useState('');
  const [hobbies, setHobbies] = useState('');
  const [dream, setDream] = useState('');
  const [accent, setAccent] = useState('#00F2FE');

  // Single photo state
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [existingPhotoUrl, setExistingPhotoUrl] = useState<string>('');

  // UI status states
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [checkingPending, setCheckingPending] = useState(false);
  const [existingPendingRequest, setExistingPendingRequest] = useState<FriendRequest | null>(null);

  // Success state
  const [submittedRequestId, setSubmittedRequestId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState(false);

  // Initialize or reset form on open/mode change
  useEffect(() => {
    if (!isOpen) {
      setSubmittedRequestId(null);
      setFormError(null);
      setPhotoFile(null);
      setPhotoPreview('');
      setExistingPendingRequest(null);
      return;
    }

    if (mode === 'edit' && friend) {
      setName(friend.name || '');
      setNickname(friend.nickname || '');
      setUsername(friend.username || friend.user || '');
      setTagline(friend.tagline || friend.role || '');
      setBio(friend.bio || '');
      setWhatsapp(friend.whatsapp || friend.phone || '');
      setCity(friend.city || '');
      setState(friend.state || '');
      setFfName(friend.ffName || '');
      setFfUid(friend.ffUid || '');
      setInstagram(friend.instagram || '');
      setHobbies(friend.hobbies || friend.hobby || '');
      setDream(friend.dream || friend.goal || '');
      setAccent(friend.accent || '#00F2FE');

      const currentImg = resolveImageUrl(friend.avatar);
      setExistingPhotoUrl(currentImg);
      setPhotoPreview(currentImg);

      // Duplicate prevention check
      setCheckingPending(true);
      friendsRepository
        .checkPendingUpdateRequest(friend.id)
        .then((pendingReq) => {
          setExistingPendingRequest(pendingReq);
        })
        .finally(() => {
          setCheckingPending(false);
        });
    } else {
      // Create mode
      setName('');
      setNickname('');
      setUsername('');
      setTagline('');
      setBio('');
      setWhatsapp('');
      setCity('');
      setState('');
      setFfName('');
      setFfUid('');
      setInstagram('');
      setHobbies('');
      setDream('');
      setAccent('#00F2FE');
      setExistingPhotoUrl('');
      setPhotoPreview('');
      setExistingPendingRequest(null);
    }
  }, [isOpen, mode, friend]);

  if (!isOpen) return null;

  // Single photo selection & validation
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setFormError('कृपया केवल फोटो (JPG, PNG, WebP) चुनें।');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setFormError('फोटो का साइज़ 10MB से कम होना चाहिए।');
      return;
    }

    setFormError(null);
    setPhotoFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPhotoPreview(objectUrl);
    sound.playClick();
  };

  const generateWhatsAppUrl = (requestId: string, applicantName: string, phoneNum: string) => {
    const isEdit = mode === 'edit';
    const submissionTime = new Date().toLocaleString('hi-IN', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'medium',
      timeStyle: 'short',
    });

    let text = '';
    if (isEdit) {
      text =
        `नमस्ते CyberMohit Admin! 🔄\n\n` +
        `मैंने Friends Universe में अपनी प्रोफाइल अपडेट करने का अनुरोध भेजा है:\n\n` +
        `📌 Request ID: ${requestId}\n` +
        `📋 प्रकार: Profile Update Request (प्रोफ़ाइल अपडेट)\n` +
        `👤 प्रोफाइल नाम: ${applicantName}\n` +
        `🆔 प्रोफाइल ID: ${friend?.id || '—'}\n` +
        `📱 मोबाइल / संपर्क: ${phoneNum || '—'}\n` +
        `⏰ तारीख और समय: ${submissionTime}\n\n` +
        `कृपया Admin Panel में इस अपडेट अनुरोध की समीक्षा करके इसे Approve करें। धन्यवाद!`;
    } else {
      text =
        `नमस्ते CyberMohit Admin! 🔥\n\n` +
        `मैंने Friends Universe में नया प्रोफाइल बनाने का अनुरोध भेजा है:\n\n` +
        `📌 Request ID: ${requestId}\n` +
        `📋 प्रकार: New Profile Request (नया प्रोफाइल)\n` +
        `👤 पूरा नाम: ${applicantName}\n` +
        `📱 मोबाइल / संपर्क: ${phoneNum || '—'}\n` +
        `🎮 Free Fire: ${ffName || '—'}${ffUid ? ` (UID: ${ffUid})` : ''}\n` +
        `📍 स्थान: ${city || '—'}${state ? ', ' + state : ''}\n` +
        `⏰ तारीख और समय: ${submissionTime}\n\n` +
        `कृपया Admin Panel में मेरी नई प्रोफाइल की समीक्षा करके इसे Approve करें। धन्यवाद!`;
    }
    return `https://wa.me/${ADMIN_WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
  };

  const handleCopyRequestId = async () => {
    if (!submittedRequestId) return;
    try {
      await navigator.clipboard.writeText(submittedRequestId);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2500);
      sound.playClick();
    } catch {
      window.prompt('Request ID:', submittedRequestId);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const cleanName = name.trim();
    if (!cleanName || cleanName.length < 2) {
      setFormError('कृपया अपना पूरा नाम लिखें (कम से कम 2 अक्षर)।');
      sound.playAlert();
      return;
    }

    const cleanWhatsapp = whatsapp.trim();
    if (!cleanWhatsapp || cleanWhatsapp.replace(/\D/g, '').length < 10) {
      setFormError('कृपया सही 10-अंकों का WhatsApp या फोन नंबर लिखें ताकि Admin आपसे संपर्क कर सके।');
      sound.playAlert();
      return;
    }

    if (mode === 'create' && !photoFile && !existingPhotoUrl) {
      setFormError('कृपया अपनी एक प्रोफ़ाइल फोटो अपलोड करें।');
      sound.playAlert();
      return;
    }

    setIsSubmitting(true);
    sound.playClick();

    try {
      const timestamp = Date.now();
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const prefix = mode === 'edit' ? 'REQ-UPD' : 'REQ-NEW';
      const requestId = `${prefix}-${timestamp.toString(36).toUpperCase()}-${randomSuffix}`;

      // Generate consistent profile ID using existing project convention (fr_<timestamp>_<random>)
      const targetProfileId =
        mode === 'edit' && friend
          ? friend.id
          : `fr_${timestamp}_${Math.random().toString(36).substring(2, 7)}`;

      // Upload photo if new file selected
      let uploadedPhotoUrl = existingPhotoUrl;
      let uploadedPhotoPath: string | undefined = undefined;

      if (photoFile) {
        setIsUploading(true);
        const uploadRes = await friendsRepository.uploadPhoto(photoFile, targetProfileId);
        uploadedPhotoUrl = uploadRes.url;
        uploadedPhotoPath = uploadRes.path;
        setIsUploading(false);
      }

      // Prepare avatar object without undefined properties
      const avatarObj: FriendPhoto = uploadedPhotoUrl
        ? {
            url: uploadedPhotoUrl,
            source: 'upload',
            visible: true,
            ...(uploadedPhotoPath ? { path: uploadedPhotoPath } : {}),
          }
        : {
            url: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(cleanName)}&backgroundColor=00f2fe,9b5cff`,
            source: 'url',
            visible: true,
          };

      // Prepare profile data
      const profileData: Partial<Friend> = {
        id: targetProfileId,
        name: cleanName,
        nickname: nickname.trim() || null,
        username: username.trim() || null,
        user: username.trim() || null,
        fullName: cleanName,
        tagline: tagline.trim() || null,
        role: tagline.trim() || null,
        bio: bio.trim() || null,
        whatsapp: cleanWhatsapp,
        phone: cleanWhatsapp,
        city: city.trim() || null,
        state: state.trim() || null,
        location: city.trim() ? `${city.trim()}${state.trim() ? ', ' + state.trim() : ''}` : null,
        ffName: ffName.trim() || null,
        ffUid: ffUid.trim() || null,
        instagram: instagram.trim() ? instagram.trim().replace(/^@/, '') : null,
        hobbies: hobbies.trim() || null,
        hobby: hobbies.trim() || null,
        dream: dream.trim() || null,
        goal: dream.trim() || null,
        accent: accent || '#00F2FE',
        avatar: avatarObj,
        heroPhotos: [avatarObj],
      };

      const requestPayload: FriendRequest = {
        id: requestId,
        type: mode === 'edit' ? 'profile_update' : 'new_profile',
        profileId: targetProfileId,
        status: 'pending',
        submittedAt: new Date().toISOString(),
        applicantName: cleanName,
        applicantContact: cleanWhatsapp,
        profileData,
        ...(mode === 'edit' && friend ? { originalData: friend } : {}),
      };

      // Action A: Save to Firestore database (Pending Approval in Admin Panel)
      await friendsRepository.createRequest(requestPayload);
      sound.playSuccess();
      setSubmittedRequestId(requestId);

      if (onSuccess) {
        onSuccess(requestId);
      }

      // Action B: Seamlessly launch WhatsApp with pre-filled details in one click
      const waUrl = generateWhatsAppUrl(requestId, cleanName, cleanWhatsapp);
      try {
        const link = document.createElement('a');
        link.href = waUrl;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch {
        try {
          window.open(waUrl, '_blank');
        } catch {
          // Handled in confirmation screen with backup button
        }
      }
    } catch (err: any) {
      sound.playAlert();
      setFormError(`अनुरोध भेजने में समस्या आई: ${err.message || err}`);
    } finally {
      setIsSubmitting(false);
      setIsUploading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 overflow-y-auto overflow-x-hidden bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 font-sans select-none"
    >
      <div
        className="relative w-full max-w-2xl bg-[#090d1a] border border-[#1f2b46] rounded-2xl sm:rounded-3xl shadow-[0_0_50px_rgba(0,242,254,0.15)] overflow-hidden text-slate-100 flex flex-col my-auto max-h-[92vh]"
        style={{
          boxShadow: `0 0 40px ${accent}25, inset 0 0 20px ${accent}10`,
        }}
      >
        {/* Glowing Top Neon Line */}
        <div
          className="h-1.5 w-full bg-gradient-to-r from-transparent via-[#00f2fe] to-transparent animate-pulse"
          style={{
            backgroundImage: `linear-gradient(to right, transparent, ${accent}, transparent)`,
          }}
        />

        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-[#1f2b46]/80 bg-[#0c1222]/80">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                backgroundColor: `${accent}20`,
                border: `1px solid ${accent}60`,
                boxShadow: `0 0 12px ${accent}40`,
              }}
            >
              {mode === 'edit' ? (
                <Sparkles className="w-5 h-5" style={{ color: accent }} />
              ) : (
                <User className="w-5 h-5" style={{ color: accent }} />
              )}
            </div>
            <div>
              <h2 className="font-bold text-base sm:text-lg font-cyber text-white flex items-center gap-2">
                {mode === 'edit' ? 'प्रोफ़ाइल अपडेट अनुरोध' : 'अपनी प्रोफ़ाइल बनाएं'}
              </h2>
              <p className="text-xs text-slate-400">
                {mode === 'edit'
                  ? 'बदलाव सबमिट करें, Admin रिव्यू के बाद प्रोफाइल अपडेट होगी'
                  : 'जानकारी भरें और Admin स्वीकृति के लिए भेजें'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-2 rounded-full bg-slate-900 border border-slate-700 hover:border-rose-500 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto px-5 sm:px-6 py-5 flex-grow space-y-5">
          {/* SUCCESS SCREEN */}
          {submittedRequestId ? (
            <div className="py-6 flex flex-col items-center text-center space-y-5 animate-in fade-in zoom-in-95 duration-300">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center bg-emerald-500/10 border-2 border-emerald-400 text-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.4)]"
              >
                <Check className="w-8 h-8 stroke-[3]" />
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl font-bold font-cyber text-emerald-400">
                  {mode === 'edit' ? 'अपडेट अनुरोध सफलतापूर्वक भेजा गया!' : 'प्रोफ़ाइल अनुरोध सफलतापूर्वक भेजा गया!'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto mt-2 leading-relaxed">
                  आपका अनुरोध Admin Panel में सुरक्षित रूप से दर्ज हो गया है (Status: Pending)। साथ ही Admin के WhatsApp पर आवश्यक विवरण के साथ संदेश भी खोल दिया गया है।
                </p>
              </div>

              {/* Request ID Card */}
              <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col gap-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                  आपका यूनिक Request ID:
                </span>
                <div className="flex items-center justify-between gap-2 bg-slate-950 px-3.5 py-2.5 rounded-xl border border-cyan-500/30 font-mono text-cyan-300 text-sm font-bold">
                  <span className="truncate">{submittedRequestId}</span>
                  <button
                    type="button"
                    onClick={handleCopyRequestId}
                    className="flex items-center gap-1 text-xs px-2.5 py-1 rounded bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 border border-cyan-400/30 transition-all cursor-pointer"
                  >
                    {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedId ? 'कॉपी हो गया' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {/* WhatsApp Action Button */}
              <div className="w-full max-w-md flex flex-col gap-2.5 pt-2">
                <a
                  href={generateWhatsAppUrl(submittedRequestId, name, whatsapp)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => sound.playClick()}
                  className="w-full flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-slate-950 font-bold text-sm shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all cursor-pointer active:scale-95"
                >
                  <MessageCircle className="w-5 h-5 fill-current" />
                  <span>Admin को WhatsApp पर सूचित करें (Open WhatsApp)</span>
                </a>

                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    onClose();
                  }}
                  className="w-full px-5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-semibold transition-all cursor-pointer"
                >
                  हो गया / बंद करें (Done)
                </button>
              </div>
            </div>
          ) : checkingPending ? (
            <div className="py-12 flex flex-col items-center justify-center text-center gap-3">
              <Clock className="w-8 h-8 text-cyan-400 animate-spin" />
              <p className="text-xs text-slate-400 font-mono">
                जांच रहे हैं कि कोई पिछला अनुरोध पेंडिंग तो नहीं है...
              </p>
            </div>
          ) : existingPendingRequest ? (
            /* DUPLICATE PENDING NOTICE */
            <div className="py-6 flex flex-col items-center text-center space-y-4">
              <div className="w-14 h-14 rounded-full flex items-center justify-center bg-amber-500/15 border-2 border-amber-400 text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.3)]">
                <AlertTriangle className="w-7 h-7" />
              </div>

              <div>
                <h3 className="text-lg sm:text-xl font-bold font-cyber text-amber-300">
                  आपका एक अपडेट अनुरोध पहले से पेंडिंग है!
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto mt-2 leading-relaxed">
                  इस प्रोफ़ाइल के लिए पहले से एक अपडेट अनुरोध सबमिट किया जा चुका है और वह Admin की समीक्षा का इंतज़ार कर रहा है। दोबारा फॉर्म भरने की आवश्यकता नहीं है।
                </p>
              </div>

              {/* Existing Request Card */}
              <div className="w-full max-w-md bg-slate-900/90 border border-amber-500/30 rounded-2xl p-4 flex flex-col gap-2 text-left">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-mono">पेंडिंग Request ID:</span>
                  <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono text-[11px] font-bold">
                    PENDING REVIEW
                  </span>
                </div>
                <div className="font-mono text-cyan-300 text-sm font-bold bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  {existingPendingRequest.id}
                </div>
              </div>

              {/* Direct WhatsApp to Admin */}
              <div className="w-full max-w-md flex flex-col gap-2 pt-2">
                <a
                  href={`https://wa.me/${ADMIN_WHATSAPP_NUMBER}?text=${encodeURIComponent(
                    `नमस्ते CyberMohit Admin! मेरा अपडेट अनुरोध (${existingPendingRequest.id}) पेंडिंग है। कृपया समीक्षा करें।`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 text-slate-950 font-bold text-xs shadow-lg transition-all"
                >
                  <MessageCircle className="w-4 h-4 fill-current" />
                  <span>Admin से WhatsApp पर बात करें</span>
                </a>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-400 hover:text-white text-xs cursor-pointer"
                >
                  बंद करें (Close)
                </button>
              </div>
            </div>
          ) : (
            /* MAIN FORM */
            <form onSubmit={handleSubmit} className="space-y-5">
              {formError && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-rose-950/80 border border-rose-500 text-rose-300 text-xs font-medium">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* 1. SINGLE PROFILE PHOTO UPLOAD */}
              <div className="p-4 rounded-2xl bg-[#0c1222] border border-[#1f2b46] flex flex-col sm:flex-row items-center gap-4">
                <div
                  className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full p-[2px] shrink-0"
                  style={{
                    background: `linear-gradient(135deg, ${accent}, #9B5CFF)`,
                    boxShadow: `0 0 15px ${accent}40`,
                  }}
                >
                  {photoPreview ? (
                    <img
                      src={photoPreview}
                      alt="Profile preview"
                      className="w-full h-full rounded-full object-cover bg-slate-950"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-slate-950 flex flex-col items-center justify-center text-slate-500">
                      <User className="w-8 h-8 opacity-40" />
                      <span className="text-[10px] mt-1">फोटो नहीं</span>
                    </div>
                  )}

                  {photoFile && (
                    <span className="absolute bottom-0 right-0 bg-emerald-500 text-slate-950 p-1 rounded-full text-xs font-bold border-2 border-slate-950">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </span>
                  )}
                </div>

                <div className="flex-1 flex flex-col gap-2 text-center sm:text-left">
                  <span className="text-xs font-bold font-mono text-cyan-300">
                    प्रोफ़ाइल फोटो (Profile Photo) *
                  </span>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {mode === 'edit'
                      ? 'यदि आप फोटो बदलना चाहते हैं तो नई फोटो चुनें, अन्यथा वर्तमान फोटो सुरक्षित रहेगी।'
                      : 'अपनी एक साफ़ और सुंदर फोटो अपलोड करें (अधिकतम 10MB)।'}
                  </p>

                  <label className="inline-flex items-center justify-center sm:justify-start gap-2 px-4 py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-300 hover:text-cyan-200 text-xs font-semibold cursor-pointer transition-all active:scale-95 w-fit mx-auto sm:mx-0">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{photoFile ? 'दूसरी फोटो चुनें' : 'फोटो अपलोड करें (Select Photo)'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoSelect}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* 2. BASIC REQUIRED DETAILS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-mono text-slate-300 mb-1">
                    पूरा नाम (Full Name) *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="उदा. राहुल कुमार"
                    required
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-300 mb-1">
                    निकनेम (Nickname)
                  </label>
                  <input
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="उदा. रॉकी"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-300 mb-1">
                    WhatsApp या फोन नंबर * (Admin संपर्क हेतु)
                  </label>
                  <input
                    type="tel"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="10 अंकों का नंबर"
                    required
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-300 mb-1">
                    यूज़रनेम (Username Handle)
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="उदा. rahul_pro"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              {/* 3. TAGLINE & BIO */}
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-mono text-slate-300 mb-1">
                    टैगलाइन / भूमिका (Tagline / Role)
                  </label>
                  <input
                    type="text"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    placeholder="उदा. Free Fire Pro Player • Tech Enthusiast"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-300 mb-1">
                    अपने बारे में (Bio / About You)
                  </label>
                  <textarea
                    rows={2}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="कुछ शब्द अपने बारे में लिखें..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400 resize-none"
                  />
                </div>
              </div>

              {/* 4. FREE FIRE & GAMING */}
              <div className="p-3.5 rounded-2xl bg-amber-950/20 border border-amber-500/30 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2 flex items-center gap-2 text-xs font-mono font-bold text-amber-300">
                  <Gamepad2 className="w-4 h-4 text-amber-400" />
                  <span>Free Fire गेमिंग जानकारी (वैकल्पिक)</span>
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">
                    Free Fire IGN (Game Name)
                  </label>
                  <input
                    type="text"
                    value={ffName}
                    onChange={(e) => setFfName(e.target.value)}
                    placeholder="उदा. 𝕶𝖎𝖓𝖌_𝕭𝖔𝖘𝖘"
                    className="w-full bg-slate-900/90 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">
                    Free Fire UID
                  </label>
                  <input
                    type="text"
                    value={ffUid}
                    onChange={(e) => setFfUid(e.target.value)}
                    placeholder="उदा. 1234567890"
                    className="w-full bg-slate-900/90 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* 5. LOCATION & SOCIAL */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-slate-300 mb-1">
                    शहर (City)
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="उदा. पटना, दिल्ली"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-300 mb-1">
                    राज्य (State)
                  </label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="उदा. बिहार"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-300 mb-1">
                    Instagram Handle
                  </label>
                  <input
                    type="text"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    placeholder="@username"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              {/* 6. HOBBIES & DREAMS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-slate-300 mb-1 flex items-center gap-1.5">
                    <Heart className="w-3.5 h-3.5 text-rose-400" />
                    <span>शौक (Hobbies / Passions)</span>
                  </label>
                  <input
                    type="text"
                    value={hobbies}
                    onChange={(e) => setHobbies(e.target.value)}
                    placeholder="उदा. गेमिंग, कोडिंग, क्रिकेट"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-300 mb-1 flex items-center gap-1.5">
                    <Rocket className="w-3.5 h-3.5 text-purple-400" />
                    <span>सपना / लक्ष्य (Dream / Goal)</span>
                  </label>
                  <input
                    type="text"
                    value={dream}
                    onChange={(e) => setDream(e.target.value)}
                    placeholder="उदा. Pro Esports Player, Software Engineer"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              {/* 7. CUSTOM NEON ACCENT PICKER */}
              <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Palette className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-mono font-bold text-slate-300">
                    प्रोफ़ाइल ग्लो थीम रंग (Accent Color):
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {PRESET_ACCENTS.map((preset) => (
                    <button
                      key={preset.hex}
                      type="button"
                      onClick={() => {
                        setAccent(preset.hex);
                        sound.playClick();
                      }}
                      title={preset.name}
                      className={`w-7 h-7 rounded-full border-2 transition-all cursor-pointer ${
                        accent.toLowerCase() === preset.hex.toLowerCase()
                          ? 'scale-110 border-white shadow-[0_0_12px_rgba(255,255,255,0.7)]'
                          : 'border-transparent opacity-70 hover:opacity-100 hover:scale-105'
                      }`}
                      style={{ backgroundColor: preset.hex }}
                    />
                  ))}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    onClose();
                  }}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-400 hover:text-white text-xs font-semibold cursor-pointer transition-colors"
                >
                  रद्द करें (Cancel)
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting || isUploading}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 hover:from-cyan-400 hover:to-pink-400 text-slate-950 font-bold text-xs shadow-[0_0_20px_rgba(0,242,254,0.4)] transition-all cursor-pointer active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                      <span>{isUploading ? 'फोटो अपलोड हो रही है...' : 'सबमिट हो रहा है...'}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>
                        {mode === 'edit'
                          ? 'अपडेट सबमिट करें (Admin + WhatsApp)'
                          : 'Submit for Approval (Admin + WhatsApp)'}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
