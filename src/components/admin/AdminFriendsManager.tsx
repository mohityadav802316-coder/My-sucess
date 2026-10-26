import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { sound } from '../audio/SoundEffects';
import {
  Friend,
  FriendPhoto,
  FriendSocialLink,
  resolveImageUrl,
  DEFAULT_CATEGORIES,
  CategoryItem,
} from '../../friends/data/friends';
import {
  friendsRepository,
  useFriends,
  useFriendsConfig,
} from '../../friends/data/repository';
import { FullProfileModal } from '../../friends/components/FullProfileModal';
import {
  Users,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  Upload,
  Eye,
  EyeOff,
  Search,
  CheckCircle2,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  Palette,
  Sparkles,
  Link as LinkIcon,
  Crown,
  Gamepad2,
  Calendar,
  Image as ImageIcon,
  Lock,
  ExternalLink,
  RotateCw,
  MessageCircle,
  Phone,
} from 'lucide-react';

const PRESET_ACCENT_COLORS = [
  { name: 'Electric Cyan', hex: '#00F2FE' },
  { name: 'Neon Purple', hex: '#9B5CFF' },
  { name: 'Warm Gold', hex: '#FFB53D' },
  { name: 'Shocking Magenta', hex: '#FF2BD6' },
  { name: 'Cyber Lime', hex: '#B6FF2B' },
  { name: 'Electric Orange', hex: '#FF6A00' },
  { name: 'Rose Red', hex: '#F43F5E' },
  { name: 'Emerald Green', hex: '#10B981' },
];

export const AdminFriendsManager: React.FC = () => {
  const { mode } = useLanguage();
  const { friends, isLoading, refetch } = useFriends('all');
  const { settings } = useFriendsConfig();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Edit / Add Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFriend, setEditingFriend] = useState<Friend | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  // Delete Confirmation State
  const [friendToDelete, setFriendToDelete] = useState<Friend | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Visitor Preview State
  const [previewFriend, setPreviewFriend] = useState<Friend | null>(null);

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formNickname, setFormNickname] = useState('');
  const [formUsername, setFormUsername] = useState('');
  const [formBio, setFormBio] = useState('');
  const [formAccent, setFormAccent] = useState('#00F2FE');
  const [formCategories, setFormCategories] = useState<string[]>(['prefer']);
  const [formDob, setFormDob] = useState('');
  const [formDobShowYear, setFormDobShowYear] = useState(true);
  const [formFfName, setFormFfName] = useState('');
  const [formFfUid, setFormFfUid] = useState('');
  const [formRole, setFormRole] = useState('');
  const [formWhatsapp, setFormWhatsapp] = useState('');
  const [formIsVisible, setFormIsVisible] = useState(true);
  const [formOrder, setFormOrder] = useState(1);

  // Privacy Toggles (true = public, false = private stored in friendsPrivate)
  const [isBioPublic, setIsBioPublic] = useState(true);
  const [isDobPublic, setIsDobPublic] = useState(true);
  const [isFfPublic, setIsFfPublic] = useState(true);
  const [isRolePublic, setIsRolePublic] = useState(true);

  // Photos State
  const [avatarUrl, setAvatarUrl] = useState('');
  const [avatarPath, setAvatarPath] = useState<string | undefined>(undefined);
  const [heroPhotos, setHeroPhotos] = useState<FriendPhoto[]>([]);
  const [gallery, setGallery] = useState<FriendPhoto[]>([]);
  const [newPhotoUrlInput, setNewPhotoUrlInput] = useState('');
  const [newPhotoTarget, setNewPhotoTarget] = useState<'avatar' | 'hero' | 'gallery'>('gallery');

  // Social Links State
  const [links, setLinks] = useState<FriendSocialLink[]>([]);

  // Validation Warnings
  const [formError, setFormError] = useState<string | null>(null);

  // Active Category Options from Settings or Defaults
  const categoryOptions = useMemo(() => {
    return settings.categories || DEFAULT_CATEGORIES;
  }, [settings.categories]);

  // Filtered Friends List
  const filteredFriends = useMemo(() => {
    let list = [...friends];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          (f.nickname && f.nickname.toLowerCase().includes(q)) ||
          (f.username && f.username.toLowerCase().includes(q)) ||
          (f.role && f.role.toLowerCase().includes(q))
      );
    }
    if (filterCategory !== 'all') {
      list = list.filter((f) => {
        const cats = f.categories || f.cats || [];
        return cats.includes(filterCategory);
      });
    }
    return list;
  }, [friends, searchQuery, filterCategory]);

  const showStatus = (text: string, type: 'success' | 'error' = 'success') => {
    setStatusMessage({ type, text });
    setTimeout(() => setStatusMessage(null), 3500);
  };

  // Complete Form State Reset Helper
  const resetForm = () => {
    setEditingFriend(null);
    setFormName('');
    setFormNickname('');
    setFormUsername('');
    setFormBio('');
    setFormAccent('#00F2FE');
    setFormCategories(['prefer']);
    setFormDob('');
    setFormDobShowYear(true);
    setFormFfName('');
    setFormFfUid('');
    setFormRole('');
    setFormWhatsapp('');
    setFormIsVisible(true);
    setFormOrder(friends.length + 1);

    setIsBioPublic(true);
    setIsDobPublic(true);
    setIsFfPublic(true);
    setIsRolePublic(true);

    setAvatarUrl('');
    setAvatarPath(undefined);
    setHeroPhotos([]);
    setGallery([]);
    setLinks([]);
    setFormError(null);
    setIsDirty(false);
    setNewPhotoUrlInput('');
    setUploadProgress(null);
  };

  // Open Form to Add New Friend
  const handleAddNew = () => {
    sound.playClick();
    resetForm();
    setIsModalOpen(true);
  };

  // Open Form to Edit Existing Friend
  const handleEdit = async (f: Friend) => {
    sound.playClick();
    resetForm();
    setEditingFriend(f);
    setFormName(f.name);
    setFormNickname(f.nickname || '');
    setFormUsername(f.username || f.user || '');
    setFormBio(f.bio || '');
    setFormAccent(f.accent || '#00F2FE');
    setFormCategories(f.categories || f.cats || ['prefer']);
    setFormDob(f.dob || '');
    setFormDobShowYear(f.dobShowYear !== false);
    setFormFfName(f.ffName || '');
    setFormFfUid(f.ffUid || '');
    setFormRole(f.role || '');
    setFormWhatsapp(f.whatsapp || '');
    setFormIsVisible(f.isVisible !== false);
    setFormOrder(f.order || 1);

    // Default privacy flags
    let bioPub = true;
    let dobPub = true;
    let ffPub = true;
    let rolePub = true;

    // Check if private collection has hidden fields
    try {
      const priv = await friendsRepository.getPrivateData(f.id);
      if (priv) {
        if (priv.bio) {
          setFormBio(priv.bio);
          bioPub = false;
        }
        if (priv.dob) {
          setFormDob(priv.dob);
          dobPub = false;
        }
        if (priv.ffName || priv.ffUid) {
          if (priv.ffName) setFormFfName(priv.ffName);
          if (priv.ffUid) setFormFfUid(priv.ffUid);
          ffPub = false;
        }
        if (priv.role) {
          setFormRole(priv.role);
          rolePub = false;
        }
      }
    } catch (e) {
      // ignore
    }

    setIsBioPublic(bioPub);
    setIsDobPublic(dobPub);
    setIsFfPublic(ffPub);
    setIsRolePublic(rolePub);

    // Photos
    const av = typeof f.avatar === 'string' ? f.avatar : (f.avatar?.url || '');
    const avP = typeof f.avatar === 'object' ? f.avatar?.path : undefined;
    setAvatarUrl(av);
    setAvatarPath(avP);

    const heroes: FriendPhoto[] = (f.heroPhotos || f.photos || []).map((p) =>
      typeof p === 'string' ? { url: p, source: 'url' } : p
    );
    setHeroPhotos(heroes);

    const gals: FriendPhoto[] = (f.gallery || []).map((p) =>
      typeof p === 'string' ? { url: p, source: 'url' } : p
    );
    setGallery(gals);

    setLinks(f.links || []);
    setFormError(null);
    setIsDirty(false);
    setIsModalOpen(true);
  };

  // Close Form with Unsaved Warning and Reset
  const handleCloseModal = () => {
    if (isDirty) {
      if (!window.confirm('बिना Save किए बाहर जाने पर बदलाव मिट जाएँगे। क्या आप बाहर जाना चाहते हैं?')) {
        return;
      }
    }
    sound.playClick();
    setIsModalOpen(false);
    resetForm();
  };

  // Toggle Visibility directly from list
  const handleToggleVisibility = async (f: Friend) => {
    sound.playClick();
    try {
      await friendsRepository.update(f.id, { isVisible: !f.isVisible });
      showStatus(`${f.name} की दृश्यता (Visibility) अपडेट की गई।`);
      refetch();
    } catch (err: any) {
      sound.playAlert();
      showStatus(`अपडेट विफल: ${err.message}`, 'error');
    }
  };

  // Move Friend Order Up or Down
  const handleMoveOrder = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= filteredFriends.length) return;

    sound.playClick();
    const currentFriend = filteredFriends[index];
    const targetFriend = filteredFriends[targetIndex];

    try {
      const currentOrder = currentFriend.order || index + 1;
      const targetOrder = targetFriend.order || targetIndex + 1;

      await friendsRepository.update(currentFriend.id, { order: targetOrder });
      await friendsRepository.update(targetFriend.id, { order: currentOrder });

      showStatus(`क्रम (Order) बदला गया।`);
      refetch();
    } catch (err: any) {
      sound.playAlert();
      showStatus(`क्रम बदलने में समस्या: ${err.message}`, 'error');
    }
  };

  // Add Photo via URL or Google Drive link
  const handleAddPhotoFromUrl = () => {
    if (!newPhotoUrlInput.trim()) return;
    sound.playClick();

    const resolved = resolveImageUrl(newPhotoUrlInput.trim());
    const photoObj: FriendPhoto = {
      url: resolved,
      source: 'url',
      visible: true,
      order: Date.now(),
    };

    if (newPhotoTarget === 'avatar') {
      setAvatarUrl(resolved);
      setAvatarPath(undefined);
    } else if (newPhotoTarget === 'hero') {
      if (heroPhotos.length >= 2) {
        alert('Hero Photos अधिकतम 2 ही हो सकती हैं।');
        return;
      }
      if (heroPhotos.some((p) => p.url === resolved)) {
        alert('यह फोटो पहले से Hero Photos में मौजूद है।');
        return;
      }
      setHeroPhotos([...heroPhotos, photoObj]);
    } else {
      setGallery([...gallery, photoObj]);
    }

    setNewPhotoUrlInput('');
    setIsDirty(true);
    showStatus('फोटो जोड़ी गई!');
  };

  // Upload Photo from Device
  const handleUploadFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    sound.playClick();
    setUploadProgress(10);
    setFormError(null);
    const friendId = editingFriend?.id || `draft_${Date.now()}`;

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setUploadProgress(Math.round(((i + 1) / files.length) * 85));

        const { url, path } = await friendsRepository.uploadPhoto(file, friendId);
        
        // Strict verification: only store if a valid url was returned
        if (!url) {
          throw new Error('फोटो अपलोड होने के बाद URL प्राप्त नहीं हो सका।');
        }

        const photoObj: FriendPhoto = {
          url,
          path,
          source: 'upload',
          alt: file.name,
          visible: true,
          order: Date.now() + i,
        };

        if (newPhotoTarget === 'avatar' && i === 0) {
          setAvatarUrl(url);
          setAvatarPath(path);
        } else if (newPhotoTarget === 'hero') {
          setHeroPhotos((prev) => {
            if (prev.length >= 2) return prev;
            return [...prev, photoObj];
          });
        } else {
          setGallery((prev) => [...prev, photoObj]);
        }
      }

      setUploadProgress(100);
      setTimeout(() => setUploadProgress(null), 800);
      setIsDirty(true);
      showStatus('फोटो सफलतापूर्वक अपलोड व कंप्रेस की गई!');
    } catch (err: any) {
      sound.playAlert();
      setUploadProgress(null);
      const code = err?.code || 'storage/upload-failed';
      const msg = err?.message || String(err);
      setFormError(`फोटो अपलोड विफल [${code}]: ${msg}`);
      showStatus(`अपलोड विफल [${code}]`, 'error');
    }
  };

  // Delete Photo from Hero or Gallery
  const handleDeletePhoto = async (photo: FriendPhoto, from: 'hero' | 'gallery') => {
    sound.playClick();
    if (from === 'hero') {
      setHeroPhotos(heroPhotos.filter((p) => p.url !== photo.url));
    } else {
      setGallery(gallery.filter((p) => p.url !== photo.url));
    }

    if (photo.path) {
      try {
        await friendsRepository.deletePhoto(photo.path);
      } catch (e) {
        // ignore
      }
    }

    setIsDirty(true);
    showStatus('फोटो हटाई गई।');
  };

  // Add New Social Link
  const handleAddSocialLink = () => {
    sound.playClick();
    setLinks([
      ...links,
      {
        id: `link_${Date.now()}`,
        platform: 'instagram',
        label: 'Instagram',
        url: 'https://',
        visible: true,
      },
    ]);
    setIsDirty(true);
  };

  // Update Social Link with smart auto-detection
  const handleUpdateSocialLink = (index: number, patch: Partial<FriendSocialLink>) => {
    const updated = [...links];
    let newLink = { ...updated[index], ...patch };

    // Auto-detect platform and clean label if user pasted/typed a recognized domain
    if (patch.url && patch.url !== updated[index].url) {
      const lower = patch.url.toLowerCase();
      if (lower.includes('instagram.com') || lower.includes('instagr.am')) {
        newLink.platform = 'instagram';
        if (!newLink.label || newLink.label === 'Custom' || newLink.label === 'Label') newLink.label = 'Instagram';
      } else if (lower.includes('facebook.com') || lower.includes('fb.com') || lower.includes('fb.me')) {
        newLink.platform = 'facebook';
        if (!newLink.label || newLink.label === 'Custom' || newLink.label === 'Label') newLink.label = 'Facebook';
      } else if (lower.includes('youtube.com') || lower.includes('youtu.be')) {
        newLink.platform = 'youtube';
        if (!newLink.label || newLink.label === 'Custom' || newLink.label === 'Label') newLink.label = 'YouTube';
      } else if (lower.includes('twitter.com') || lower.includes('x.com')) {
        newLink.platform = 'x';
        if (!newLink.label || newLink.label === 'Custom' || newLink.label === 'Label') newLink.label = 'X (Twitter)';
      } else if (lower.includes('snapchat.com')) {
        newLink.platform = 'snapchat';
        if (!newLink.label || newLink.label === 'Custom' || newLink.label === 'Label') newLink.label = 'Snapchat';
      } else if (lower.includes('github.com')) {
        newLink.platform = 'github';
        if (!newLink.label || newLink.label === 'Custom' || newLink.label === 'Label') newLink.label = 'GitHub';
      } else if (lower.includes('linkedin.com')) {
        newLink.platform = 'linkedin';
        if (!newLink.label || newLink.label === 'Custom' || newLink.label === 'Label') newLink.label = 'LinkedIn';
      } else if (lower.includes('t.me') || lower.includes('telegram.me')) {
        newLink.platform = 'telegram';
        if (!newLink.label || newLink.label === 'Custom' || newLink.label === 'Label') newLink.label = 'Telegram';
      } else if (lower.includes('discord.gg') || lower.includes('discord.com')) {
        newLink.platform = 'discord';
        if (!newLink.label || newLink.label === 'Custom' || newLink.label === 'Label') newLink.label = 'Discord';
      }
    }

    updated[index] = newLink;
    setLinks(updated);
    setIsDirty(true);
  };

  // Remove Social Link
  const handleRemoveSocialLink = (index: number) => {
    sound.playClick();
    setLinks(links.filter((_, i) => i !== index));
    setIsDirty(true);
  };

  // Save Friend Form
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const cleanName = formName.trim();

    // 1. Validation: Name required with explicit Hindi + English reason
    if (!cleanName) {
      setFormError('त्रुटि: दोस्त का नाम (Name) लिखना अनिवार्य है ताकि सूची, प्रोफाइल और 3D दृश्य में पहचान हो सके।');
      sound.playAlert();
      return;
    }

    // 2. Validation: At least one category required
    if (formCategories.length === 0) {
      setFormError('त्रुटि: कम से कम 1 श्रेणी (Category) चुनना अनिवार्य है (उदा. Prefer, MY SQUAD, Free Fire) ताकि दोस्त सही टैब में प्रदर्शित हो।');
      sound.playAlert();
      return;
    }

    // 3. Duplicate username check warning
    if (formUsername.trim()) {
      const cleanU = formUsername.trim().toLowerCase();
      const duplicate = friends.find(
        (f) =>
          f.id !== editingFriend?.id &&
          (f.username || f.user || '').toLowerCase() === cleanU
      );
      if (duplicate) {
        const confirmSave = window.confirm(
          `चेतावनी: यह Username (${formUsername}) पहले से "${duplicate.name}" के पास है। क्या आप फिर भी सुरक्षित करना चाहते हैं?`
        );
        if (!confirmSave) return;
      }
    }

    // 4. Social links validation: https only
    for (const link of links) {
      if (link.url && !/^https:\/\//i.test(link.url.trim())) {
        setFormError(`त्रुटि: लिंक "${link.label || 'Link'}" में https:// होना अनिवार्य है (जैसे https://instagram.com/...)।`);
        sound.playAlert();
        return;
      }
    }

    setIsSaving(true);

    try {
      // Separate public fields from private fields
      const privateFields: Record<string, any> = {};

      const publicBio = isBioPublic ? formBio.trim() : null;
      if (!isBioPublic && formBio.trim()) privateFields.bio = formBio.trim();

      const publicDob = isDobPublic ? formDob.trim() : null;
      if (!isDobPublic && formDob.trim()) privateFields.dob = formDob.trim();

      const publicFfName = isFfPublic ? formFfName.trim() : null;
      const publicFfUid = isFfPublic ? formFfUid.trim() : null;
      if (!isFfPublic && (formFfName.trim() || formFfUid.trim())) {
        privateFields.ffName = formFfName.trim();
        privateFields.ffUid = formFfUid.trim();
      }

      const publicRole = isRolePublic ? formRole.trim() : null;
      if (!isRolePublic && formRole.trim()) privateFields.role = formRole.trim();

      // Clean avatar object: use upload, URL, or clean default cyber avatar
      const avatarObj: FriendPhoto = avatarPath
        ? { url: avatarUrl, path: avatarPath, source: 'upload' }
        : avatarUrl.trim()
        ? { url: avatarUrl.trim(), source: 'url' }
        : {
            url: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(cleanName)}&backgroundColor=00f2fe,9b5cff`,
            source: 'url',
          };

      const friendPayload: Omit<Friend, 'id'> = {
        name: cleanName,
        nickname: formNickname.trim() || null,
        username: formUsername.trim() || null,
        user: formUsername.trim() || null,
        fullName: cleanName,
        bio: publicBio,
        avatar: avatarObj,
        heroPhotos: heroPhotos.slice(0, 2),
        gallery: gallery,
        categories: formCategories.length > 0 ? formCategories : ['prefer'],
        ffName: publicFfName,
        ffUid: publicFfUid,
        role: publicRole,
        dob: publicDob,
        dobShowYear: formDobShowYear,
        whatsapp: formWhatsapp.trim() || null,
        links: links.map((l) => ({ ...l, url: l.url.trim() })),
        accent: formAccent,
        order: Number(formOrder) || 1,
        isVisible: formIsVisible,
        online: null, // real online tracking not manual
      };

      if (editingFriend) {
        await friendsRepository.update(editingFriend.id, friendPayload, privateFields);
        showStatus(`"${cleanName}" की जानकारी सफलतापूर्वक अपडेट कर दी गई!`);
      } else {
        await friendsRepository.create(friendPayload, privateFields);
        showStatus(`नया दोस्त "${cleanName}" सफलतापूर्वक जोड़ा गया!`);
      }

      sound.playSuccess();
      setIsModalOpen(false);
      resetForm();
      await refetch();
    } catch (err: any) {
      sound.playAlert();
      setFormError(`Save करने में त्रुटि: ${err.message || err}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Delete Friend Confirmation Handler
  const handleConfirmDelete = async () => {
    if (!friendToDelete) return;
    setIsDeleting(true);
    sound.playClick();

    try {
      await friendsRepository.remove(friendToDelete.id);
      sound.playSuccess();
      showStatus(`"${friendToDelete.name}" को सफलतापूर्वक हटा दिया गया।`);
      setFriendToDelete(null);
      refetch();
    } catch (err: any) {
      sound.playAlert();
      showStatus(`हटाने में समस्या: ${err.message}`, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 text-slate-100 font-sans">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h3 className="font-cyber font-bold text-lg text-cyan-300 flex items-center gap-2">
            <Users className="w-5 h-5 text-cyan-400" />
            <span>FRIENDS UNIVERSE MANAGER</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            दोस्त जोड़ें, संपादित करें, फोटो अपलोड करें और प्राइवेसी कंट्रोल्स प्रबंधित करें।
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => refetch()}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white cursor-pointer transition-colors"
            title="रिफ्रेश करें"
          >
            <RotateCw className="w-4 h-4" />
          </button>

          <button
            onClick={handleAddNew}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-slate-950 font-bold text-xs cursor-pointer shadow-lg shadow-cyan-500/20 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>+ नया दोस्त जोड़ें</span>
          </button>
        </div>
      </div>

      {/* Status Feedback Toast */}
      {statusMessage && (
        <div
          className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-xs font-mono transition-all animate-in fade-in duration-200 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
              : 'bg-rose-950/80 border-rose-500/50 text-rose-300'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Search */}
        <div className="relative sm:col-span-2">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="नाम, निकनेम या यूजरनेम से खोजें..."
            className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Category Filter */}
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-500 cursor-pointer"
        >
          <option value="all">सभी श्रेणियाँ (All)</option>
          {categoryOptions.map((c) => (
            <option key={c.key} value={c.key}>
              {c.emoji} {c.label}
            </option>
          ))}
        </select>
      </div>

      {/* Friends Cards Table / Grid */}
      <div className="flex flex-col gap-2.5">
        {isLoading ? (
          <div className="text-center py-12 text-slate-500 text-xs font-mono">
            डेटा लोड हो रहा है...
          </div>
        ) : filteredFriends.length === 0 ? (
          <div className="text-center py-16 px-4 rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 text-slate-400">
            <Users className="w-10 h-10 mx-auto text-slate-600 mb-2" />
            <p className="text-sm font-semibold text-slate-300">
              {searchQuery ? 'कोई दोस्त नहीं मिला' : 'अभी कोई दोस्त नहीं जुड़ा है'}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              ऊपर "+ नया दोस्त जोड़ें" बटन दबाकर पहला दोस्त जोड़ें।
            </p>
          </div>
        ) : (
          filteredFriends.map((f, idx) => {
            const isSquad = (f.categories || f.cats || []).includes('squad');
            const accent = f.accent || (isSquad ? '#FFB53D' : '#00F2FE');

            return (
              <div
                key={f.id}
                className="flex items-center justify-between gap-3 p-3 sm:p-4 rounded-2xl bg-slate-900/70 border border-slate-800/90 hover:border-slate-700 transition-all group"
              >
                {/* Left: Reorder Arrows & Avatar */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex flex-col gap-1 text-slate-500">
                    <button
                      onClick={() => handleMoveOrder(idx, 'up')}
                      disabled={idx === 0}
                      className="p-1 hover:text-cyan-400 disabled:opacity-20 cursor-pointer"
                      title="ऊपर ले जाएँ"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleMoveOrder(idx, 'down')}
                      disabled={idx === filteredFriends.length - 1}
                      className="p-1 hover:text-cyan-400 disabled:opacity-20 cursor-pointer"
                      title="नीचे ले जाएँ"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* 48px Profile Photo with accent border */}
                  <div
                    className="relative w-12 h-12 rounded-full p-0.5 shrink-0"
                    style={{
                      background: `linear-gradient(135deg, ${accent}, #9B5CFF)`,
                    }}
                  >
                    <img
                      src={resolveImageUrl(f.avatar)}
                      alt={f.name}
                      className="w-full h-full rounded-full object-cover bg-slate-950"
                    />
                    {isSquad && (
                      <span className="absolute -top-1 -right-1 text-[11px] bg-slate-950 rounded-full border border-amber-400 px-0.5">
                        👑
                      </span>
                    )}
                  </div>

                  {/* Name and Meta */}
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-white truncate">
                        {f.name}
                      </span>
                      {f.nickname && (
                        <span className="text-xs text-slate-400 truncate">
                          ({f.nickname})
                        </span>
                      )}
                      {!f.isVisible && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-950/70 text-rose-300 border border-rose-800 font-mono">
                          Hidden
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400 flex-wrap">
                      <span className="font-mono text-[11px] text-cyan-400/80">
                        {f.username || f.user || 'No username'}
                      </span>
                      {f.role && (
                        <span className="text-[11px] text-slate-500 truncate hidden sm:inline">
                          &bull; {f.role}
                        </span>
                      )}
                      {f.ffUid && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30 font-mono hidden md:inline">
                          FF: {f.ffUid}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                  {/* Visibility Toggle */}
                  <button
                    onClick={() => handleToggleVisibility(f)}
                    className={`p-2 rounded-xl border text-xs cursor-pointer transition-colors ${
                      f.isVisible
                        ? 'bg-slate-950 text-slate-400 hover:text-emerald-300 border-slate-800'
                        : 'bg-rose-950/40 text-rose-300 border-rose-800'
                    }`}
                    title={f.isVisible ? 'छिपाएँ (Hide)' : 'दिखाएँ (Make Visible)'}
                  >
                    {f.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>

                  {/* Visitor Preview Button */}
                  <button
                    onClick={() => setPreviewFriend(f)}
                    className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-cyan-300 cursor-pointer transition-colors"
                    title="Visitor की तरह देखें (Preview)"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>

                  {/* Edit Button */}
                  <button
                    onClick={() => handleEdit(f)}
                    className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-amber-300 cursor-pointer transition-colors"
                    title="संपादित करें (Edit)"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  {/* Delete Button */}
                  <button
                    onClick={() => setFriendToDelete(f)}
                    className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-rose-400 cursor-pointer transition-colors"
                    title="हटाएँ (Delete)"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* =========================================================================
          ADD / EDIT FRIEND MODAL (Comprehensive Form)
      ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-xl overflow-y-auto">
          <div className="relative w-full max-w-3xl my-auto rounded-3xl bg-slate-950 border border-cyan-500/40 shadow-[0_0_60px_rgba(0,242,254,0.15)] flex flex-col max-h-[92vh] overflow-hidden">
            {/* Modal Top Bar */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/80">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-950 font-bold"
                  style={{ backgroundColor: formAccent }}
                >
                  <Users className="w-4 h-4" />
                </div>
                <h4 className="font-cyber font-bold text-sm text-white tracking-wider">
                  {editingFriend ? `संपादित करें: ${editingFriend.name}` : '+ नया दोस्त जोड़ें'}
                </h4>
              </div>

              <button
                onClick={handleCloseModal}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
              {/* Validation Error Banner */}
              {formError && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-300 text-xs font-mono">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{formError}</span>
                </div>
              )}

              {/* SECTION 1: BASIC INFORMATION */}
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
                <h5 className="text-xs font-mono font-bold text-cyan-300 uppercase tracking-widest flex items-center justify-between">
                  <span>1. मूल जानकारी (Basic Info)</span>
                  <span className="text-[10px] text-rose-400 font-mono font-bold">* लाल चिह्न वाले फील्ड्स अनिवार्य हैं</span>
                </h5>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name */}
                  <div>
                    <label className="block text-[11px] font-mono text-slate-300 mb-1">
                      नाम (Full / Display Name) <span className="text-rose-400 font-bold">* [अनिवार्य / Required]</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formName}
                      onChange={(e) => {
                        setFormName(e.target.value);
                        setIsDirty(true);
                      }}
                      placeholder="उदा. करण सिंह"
                      className={`w-full bg-slate-950 border rounded-xl px-3 py-2 text-xs text-white focus:outline-none transition-all ${
                        !formName.trim() && formError
                          ? 'border-rose-500 focus:border-rose-400 ring-1 ring-rose-500/50'
                          : 'border-slate-800 focus:border-cyan-500'
                      }`}
                    />
                    <p className="text-[10px] text-slate-500 mt-1">
                      दोस्त का नाम लिखना अनिवार्य है ताकि वह सूची, प्रोफाइल और 3D में प्रदर्शित हो सके।
                    </p>
                  </div>

                  {/* Nickname */}
                  <div>
                    <label className="block text-[11px] font-mono text-slate-400 mb-1">
                      निकनेम (Nickname) <span className="text-slate-600">(ऐच्छिक / Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={formNickname}
                      onChange={(e) => {
                        setFormNickname(e.target.value);
                        setIsDirty(true);
                      }}
                      placeholder="उदा. कान्हा"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  {/* Username */}
                  <div>
                    <label className="block text-[11px] font-mono text-slate-400 mb-1">
                      यूजरनेम (Username) <span className="text-slate-600">(ऐच्छिक / Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={formUsername}
                      onChange={(e) => {
                        setFormUsername(e.target.value);
                        setIsDirty(true);
                      }}
                      placeholder="@karan_sniper"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  {/* Accent Color */}
                  <div>
                    <label className="block text-[11px] font-mono text-slate-400 mb-1 flex items-center justify-between">
                      <span>दोस्त का रंग (Accent Color)</span>
                      <span className="font-mono text-cyan-300">{formAccent}</span>
                    </label>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {PRESET_ACCENT_COLORS.map((c) => (
                        <button
                          key={c.hex}
                          type="button"
                          onClick={() => {
                            setFormAccent(c.hex);
                            setIsDirty(true);
                          }}
                          className={`w-6 h-6 rounded-full border-2 cursor-pointer transition-transform ${
                            formAccent.toLowerCase() === c.hex.toLowerCase()
                              ? 'scale-125 border-white shadow-md'
                              : 'border-transparent hover:scale-110'
                          }`}
                          style={{ backgroundColor: c.hex }}
                          title={c.name}
                        ></button>
                      ))}
                      <input
                        type="color"
                        value={formAccent}
                        onChange={(e) => {
                          setFormAccent(e.target.value);
                          setIsDirty(true);
                        }}
                        className="w-7 h-7 rounded-lg bg-transparent cursor-pointer border border-slate-800 p-0"
                        title="कस्टम हेक्स रंग चुनें"
                      />
                    </div>
                  </div>
                </div>

                {/* Bio & Privacy Toggle */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-mono text-slate-400">
                      परिचय (Bio / Description) <span className="text-slate-600">(ऐच्छिक / Optional)</span>
                    </label>
                    {/* Public / Private Switch */}
                    <button
                      type="button"
                      onClick={() => {
                        setIsBioPublic(!isBioPublic);
                        setIsDirty(true);
                      }}
                      className={`flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full border cursor-pointer transition-colors ${
                        isBioPublic
                          ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                          : 'bg-amber-950/60 border-amber-500/40 text-amber-300'
                      }`}
                      title={isBioPublic ? 'सबको दिखेगा' : 'सिर्फ Admin को दिखेगा (friendsPrivate)'}
                    >
                      {isBioPublic ? <Eye className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                      <span>{isBioPublic ? 'सबको दिखे' : 'निजी (Private)'}</span>
                    </button>
                  </div>
                  <textarea
                    rows={2}
                    value={formBio}
                    onChange={(e) => {
                      setFormBio(e.target.value);
                      setIsDirty(true);
                    }}
                    placeholder="दोस्त के बारे में कुछ शब्द..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 resize-none"
                  />
                </div>
              </div>

              {/* SECTION 2: CATEGORIES & SETTINGS */}
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <h5 className="text-xs font-mono font-bold text-cyan-300 uppercase tracking-widest flex items-center gap-1.5">
                    <span>2. श्रेणियाँ (Categories)</span>
                    <span className="text-rose-400 font-bold">* [कम से कम 1 अनिवार्य]</span>
                  </h5>
                  <span className="text-[10px] text-slate-400 font-mono">
                    कम से कम 1 श्रेणी चुनना अनिवार्य है ताकि दोस्त सही टैब में दिखे
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {categoryOptions
                    .filter((c) => c.key !== 'all')
                    .map((cat) => {
                      const isChecked = formCategories.includes(cat.key);
                      return (
                        <label
                          key={cat.key}
                          className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs cursor-pointer select-none transition-all ${
                            isChecked
                              ? 'bg-cyan-950/40 border-cyan-500/60 text-white font-semibold shadow-sm shadow-cyan-500/10'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormCategories([...formCategories, cat.key]);
                              } else {
                                setFormCategories(formCategories.filter((k) => k !== cat.key));
                              }
                              setIsDirty(true);
                            }}
                            className="rounded border-slate-700 text-cyan-500 focus:ring-0 cursor-pointer"
                          />
                          <span>{cat.emoji}</span>
                          <span className="truncate">{cat.label}</span>
                          {cat.key === 'squad' && <Crown className="w-3.5 h-3.5 text-amber-400 ml-auto" />}
                        </label>
                      );
                    })}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  {/* Order */}
                  <div>
                    <label className="block text-[11px] font-mono text-slate-400 mb-1">
                      प्रदर्शन क्रम (Display Order #)
                    </label>
                    <input
                      type="number"
                      value={formOrder}
                      onChange={(e) => {
                        setFormOrder(Number(e.target.value));
                        setIsDirty(true);
                      }}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  {/* Visibility Switch */}
                  <div className="flex flex-col justify-end">
                    <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer py-2">
                      <input
                        type="checkbox"
                        checked={formIsVisible}
                        onChange={(e) => {
                          setFormIsVisible(e.target.checked);
                          setIsDirty(true);
                        }}
                        className="rounded border-slate-700 text-cyan-500 focus:ring-0 cursor-pointer w-4 h-4"
                      />
                      <span className="font-mono text-[11px]">वेबसाइट पर प्रकाशित करें (Visible on Website)</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* SECTION 3: GAMING & DETAILS */}
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
                <h5 className="text-xs font-mono font-bold text-cyan-300 uppercase tracking-widest flex items-center justify-between">
                  <span>3. गेमिंग व जन्मतिथि (Gaming & Birthday)</span>
                </h5>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Free Fire Nickname */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-mono text-slate-400">
                        Free Fire Name
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setIsFfPublic(!isFfPublic);
                          setIsDirty(true);
                        }}
                        className={`text-[9px] font-mono px-1.5 py-0.2 rounded border cursor-pointer ${
                          isFfPublic ? 'text-emerald-300 border-emerald-500/40' : 'text-amber-300 border-amber-500/40'
                        }`}
                      >
                        {isFfPublic ? 'Public' : 'Private'}
                      </button>
                    </div>
                    <input
                      type="text"
                      value={formFfName}
                      onChange={(e) => {
                        setFormFfName(e.target.value);
                        setIsDirty(true);
                      }}
                      placeholder="Shadow_Ninja"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  {/* Free Fire UID */}
                  <div>
                    <label className="block text-[11px] font-mono text-slate-400 mb-1">
                      Free Fire UID (No Link)
                    </label>
                    <input
                      type="text"
                      value={formFfUid}
                      onChange={(e) => {
                        setFormFfUid(e.target.value);
                        setIsDirty(true);
                      }}
                      placeholder="1098432190"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                    />
                  </div>

                  {/* Gaming Role */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-mono text-slate-400">
                        Gaming / Team Role
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setIsRolePublic(!isRolePublic);
                          setIsDirty(true);
                        }}
                        className={`text-[9px] font-mono px-1.5 py-0.2 rounded border cursor-pointer ${
                          isRolePublic ? 'text-emerald-300 border-emerald-500/40' : 'text-amber-300 border-amber-500/40'
                        }`}
                      >
                        {isRolePublic ? 'Public' : 'Private'}
                      </button>
                    </div>
                    <input
                      type="text"
                      value={formRole}
                      onChange={(e) => {
                        setFormRole(e.target.value);
                        setIsDirty(true);
                      }}
                      placeholder="Sniper & Rusher"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                {/* Birthday & Show Year Toggle */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-mono text-slate-400">
                        जन्मतिथि (Date of Birth)
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setIsDobPublic(!isDobPublic);
                          setIsDirty(true);
                        }}
                        className={`text-[9px] font-mono px-1.5 py-0.2 rounded border cursor-pointer ${
                          isDobPublic ? 'text-emerald-300 border-emerald-500/40' : 'text-amber-300 border-amber-500/40'
                        }`}
                      >
                        {isDobPublic ? 'Public' : 'Private'}
                      </button>
                    </div>
                    <input
                      type="text"
                      value={formDob}
                      onChange={(e) => {
                        setFormDob(e.target.value);
                        setIsDirty(true);
                      }}
                      placeholder="उदा. 15 August 2005 या 15-08"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div className="flex flex-col justify-end">
                    <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer py-2">
                      <input
                        type="checkbox"
                        checked={formDobShowYear}
                        onChange={(e) => {
                          setFormDobShowYear(e.target.checked);
                          setIsDirty(true);
                        }}
                        className="rounded border-slate-700 text-cyan-500 focus:ring-0 cursor-pointer w-4 h-4"
                      />
                      <span className="font-mono text-[11px]">जन्म वर्ष दिखाएँ (Show Birth Year)</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* SECTION 4: PHOTOS (Avatar, Hero 1-2, Gallery) */}
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-mono font-bold text-cyan-300 uppercase tracking-widest flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" />
                    <span>4. फोटो प्रबंधन (Photos: Avatar, Hero 3D, Gallery)</span>
                  </h5>
                  {uploadProgress !== null && (
                    <span className="text-[10px] font-mono text-cyan-300 animate-pulse">
                      अपलोड हो रहा है... {uploadProgress}%
                    </span>
                  )}
                </div>

                {/* Helpful instructions for Firebase Storage & URL */}
                <div className="p-3 rounded-xl bg-slate-950/80 border border-cyan-500/20 text-xs font-mono space-y-1">
                  <p className="text-cyan-300 font-semibold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>फोटो जोड़ने के दो आसान विकल्प:</span>
                  </p>
                  <p className="text-[11px] text-slate-400">
                    &bull; <strong>विकल्प 1 (Upload):</strong> फोन/कंप्यूटर से सीधे फोटो अपलोड करें (Firebase Storage)।
                  </p>
                  <p className="text-[11px] text-slate-400">
                    &bull; <strong>विकल्प 2 (URL Link):</strong> किसी भी फोटो का डायरेक्ट लिंक या Google Drive शेयर लिंक नीचे पेस्ट करें।
                  </p>
                </div>

                {/* Photo Add Input Box */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex flex-col sm:flex-row items-center gap-2">
                    {/* Target Selector */}
                    <select
                      value={newPhotoTarget}
                      onChange={(e) => setNewPhotoTarget(e.target.value as any)}
                      className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none cursor-pointer shrink-0"
                    >
                      <option value="avatar">Profile Avatar (48px मुख्य फोटो)</option>
                      <option value="hero">Hero 3D Circle (अधिकतम 2 फ्लिप फोटो)</option>
                      <option value="gallery">Photo Gallery (विजिटर गैलरी)</option>
                    </select>

                    {/* URL Input */}
                    <input
                      type="text"
                      value={newPhotoUrlInput}
                      onChange={(e) => setNewPhotoUrlInput(e.target.value)}
                      placeholder="Image URL या Google Drive Share Link पेस्ट करें..."
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                    />

                    <button
                      type="button"
                      onClick={handleAddPhotoFromUrl}
                      className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs cursor-pointer whitespace-nowrap shrink-0"
                    >
                      जोड़ें
                    </button>
                  </div>

                  {/* Device Upload Button */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
                    <span className="text-[11px] text-slate-400">
                      या फोन से सीधे अपलोड करें (स्वचालित कंप्रेस होगा):
                    </span>
                    <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-mono cursor-pointer transition-colors">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Image</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleUploadFiles}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* Current Avatar Preview */}
                <div>
                  <span className="text-[11px] font-mono text-slate-400 block mb-1">
                    Profile Avatar (48px / Main Profile Pic):
                  </span>
                  {avatarUrl ? (
                    <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-950 border border-slate-800 w-fit">
                      <img
                        src={resolveImageUrl(avatarUrl)}
                        alt="Avatar"
                        className="w-12 h-12 rounded-full object-cover border border-cyan-500"
                      />
                      <span className="text-xs text-slate-300 font-mono truncate max-w-xs">
                        {avatarUrl}
                      </span>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 italic">कोई अवतार नहीं चुना गया</p>
                  )}
                </div>

                {/* Hero Photos Preview (Max 2 for 3D Dual Flip) */}
                <div>
                  <span className="text-[11px] font-mono text-slate-400 block mb-1 flex items-center justify-between">
                    <span>Hero 3D Photos (अधिकतम 2 - हर 2 सेकंड में 3D फ्लिप होंगी):</span>
                    <span className="text-xs font-mono text-amber-300">{heroPhotos.length} / 2</span>
                  </span>

                  {heroPhotos.length === 0 ? (
                    <p className="text-xs text-slate-500 italic">
                      कोई Hero फोटो नहीं चुनी गई (Avatar का इस्तेमाल होगा)।
                    </p>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {heroPhotos.map((p, i) => (
                        <div
                          key={i}
                          className="relative group rounded-xl overflow-hidden border border-amber-500/40 bg-slate-950 aspect-square"
                        >
                          <img
                            src={resolveImageUrl(p.url)}
                            alt={`Hero ${i + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute top-1 left-1 bg-black/80 px-1.5 py-0.5 rounded text-[9px] text-amber-300 font-mono">
                            Hero #{i + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleDeletePhoto(p, 'hero')}
                            className="absolute top-1 right-1 p-1 rounded-full bg-rose-900/80 text-rose-200 hover:bg-rose-700 cursor-pointer"
                            title="हटाएँ"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Gallery Photos List */}
                <div>
                  <span className="text-[11px] font-mono text-slate-400 block mb-1 flex items-center justify-between">
                    <span>Gallery Photos (विजिटर गैलरी में दिखने वाली फोटो):</span>
                    <span className="text-xs font-mono text-cyan-300">{gallery.length} Photos</span>
                  </span>

                  {gallery.length === 0 ? (
                    <p className="text-xs text-slate-500 italic">कोई गैलरी फोटो नहीं है।</p>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {gallery.map((p, i) => (
                        <div
                          key={i}
                          className="relative group rounded-xl overflow-hidden border border-slate-800 hover:border-cyan-500/60 bg-slate-950 aspect-square flex flex-col justify-between"
                        >
                          <img
                            src={resolveImageUrl(p.url)}
                            alt={`Gallery ${i + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleDeletePhoto(p, 'gallery')}
                              className="p-1.5 rounded-full bg-rose-600 text-white cursor-pointer"
                              title="हटाएँ"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* SECTION 5: WHATSAPP DIRECT CHAT & SOCIAL LINKS */}
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
                {/* Dedicated WhatsApp 1-Click Chat Field */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-950 to-slate-900 border border-emerald-500/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-mono font-bold text-emerald-300 flex items-center gap-1.5">
                      <MessageCircle className="w-4 h-4 text-emerald-400 fill-emerald-400/20" />
                      <span>व्हाट्सएप नंबर (WhatsApp Direct Chat)</span>
                    </label>
                    <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
                      Direct 1-Click wa.me
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center bg-slate-950 border border-emerald-500/40 rounded-xl px-3 py-2 w-full focus-within:border-emerald-400">
                      <span className="text-xs font-mono text-emerald-500/80 select-none mr-2 font-bold">wa.me /</span>
                      <input
                        type="text"
                        value={formWhatsapp}
                        onChange={(e) => {
                          setFormWhatsapp(e.target.value);
                          setIsDirty(true);
                        }}
                        placeholder="जैसे: 9876543210 या +919876543210"
                        className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none font-mono"
                      />
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono">
                    वेबसाइट पर कोई भी यूजर जब इस दोस्त के <strong className="text-emerald-300">WhatsApp</strong> बटन पर क्लिक करेगा, तो वह सीधे उस नंबर की WhatsApp चैट पर पहुँच जाएगा।
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <h5 className="text-xs font-mono font-bold text-cyan-300 uppercase tracking-widest flex items-center gap-2">
                    <LinkIcon className="w-4 h-4" />
                    <span>सोशल मीडिया लिंक्स (Social Links)</span>
                  </h5>
                  <button
                    type="button"
                    onClick={handleAddSocialLink}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-mono cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>+ नया लिंक जोड़ें</span>
                  </button>
                </div>

                {links.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">कोई सोशल लिंक नहीं जुड़ा है।</p>
                ) : (
                  <div className="space-y-2.5">
                    {links.map((link, idx) => (
                      <div
                        key={idx}
                        className="flex flex-col sm:flex-row items-center gap-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800"
                      >
                        {/* Platform */}
                        <select
                          value={link.platform}
                          onChange={(e) =>
                            handleUpdateSocialLink(idx, {
                              platform: e.target.value as any,
                              label: e.target.value.charAt(0).toUpperCase() + e.target.value.slice(1),
                            })
                          }
                          className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none cursor-pointer shrink-0"
                        >
                          <option value="instagram">Instagram</option>
                          <option value="facebook">Facebook</option>
                          <option value="youtube">YouTube</option>
                          <option value="x">X (Twitter)</option>
                          <option value="snapchat">Snapchat</option>
                          <option value="github">GitHub</option>
                          <option value="linkedin">LinkedIn</option>
                          <option value="telegram">Telegram</option>
                          <option value="discord">Discord</option>
                          <option value="portfolio">Portfolio</option>
                          <option value="custom">Custom (अन्य लिंक)</option>
                        </select>

                        {/* Label */}
                        <input
                          type="text"
                          value={link.label}
                          onChange={(e) => handleUpdateSocialLink(idx, { label: e.target.value })}
                          placeholder="Label"
                          className="w-full sm:w-32 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
                        />

                        {/* URL (https://) */}
                        <input
                          type="text"
                          value={link.url}
                          onChange={(e) => handleUpdateSocialLink(idx, { url: e.target.value })}
                          placeholder="https://..."
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:outline-none"
                        />

                        {/* Remove */}
                        <button
                          type="button"
                          onClick={() => handleRemoveSocialLink(idx)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 cursor-pointer shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Modal Footer Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 rounded-xl border border-slate-800 hover:bg-slate-900 text-slate-400 font-mono text-xs cursor-pointer"
                >
                  रद्द करें (Cancel)
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-slate-950 font-bold text-xs cursor-pointer shadow-lg shadow-cyan-500/20 transition-all active:scale-95 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'सुरक्षित हो रहा है...' : 'Save & Publish'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          DELETE CONFIRMATION MODAL
      ========================================================================= */}
      {friendToDelete && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="w-full max-w-sm rounded-2xl bg-slate-950 border border-rose-500/40 p-5 text-center space-y-4 shadow-2xl shadow-rose-950/50">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/40 flex items-center justify-center text-rose-400 mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <h4 className="font-cyber font-bold text-base text-rose-300">
              पक्का हटाना है?
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              क्या आप वाकई <strong className="text-white">"{friendToDelete.name}"</strong> को हटाना चाहते हैं? यह दोस्त सभी श्रेणियों और इसकी तस्वीरें Storage से भी हट जाएँगी।
            </p>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setFriendToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl border border-slate-800 hover:bg-slate-900 text-slate-300 text-xs font-mono cursor-pointer"
              >
                रद्द करें
              </button>

              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs cursor-pointer transition-colors"
              >
                {isDeleting ? 'हटाया जा रहा है...' : 'हाँ, हटाएँ'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          VISITOR PREVIEW MODAL ("Visitor की तरह देखो")
      ========================================================================= */}
      {previewFriend && (
        <FullProfileModal
          friend={previewFriend}
          onClose={() => setPreviewFriend(null)}
          onOpenLightbox={() => {}}
        />
      )}
    </div>
  );
};

export default AdminFriendsManager;
