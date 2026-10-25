import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useImages } from '../../context/ImageContext';
import { sound } from '../audio/SoundEffects';
import { FamilyMember } from '../../types';
import { defaultFamilyMembers } from '../family/FamilyVaultModal';
import { compressImage } from '../../utils/imageCompressor';
import { hashPasswordWithSalt } from '../../utils/crypto';
import {
  db,
  storage,
  collection,
  getDocs,
  setDoc,
  doc,
  deleteDoc,
  serverTimestamp,
  ref,
  uploadBytes,
  getDownloadURL,
} from '../../firebase';
import { uploadToSupabaseStorage, SUPABASE_STORAGE_BUCKET } from '../../supabase';
import { uploadToCloudinary, getCloudinaryConfig } from '../../services/cloudinary';
import {
  Heart,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  Upload,
  Lock,
  Unlock,
  Key,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff
} from 'lucide-react';

export const AdminFamilyManager: React.FC = () => {
  const { mode } = useLanguage();
  const { siteSettings, updateSiteSettings } = useImages();

  const [activeTab, setActiveTab] = useState<'members' | 'security'>('members');
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Edit / Add Member Modal
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formNameHi, setFormNameHi] = useState('');
  const [formRelation, setFormRelation] = useState('Father');
  const [formRelationHi, setFormRelationHi] = useState('पिता');
  const [formBio, setFormBio] = useState('');
  const [formBioHi, setFormBioHi] = useState('');
  const [formPhotoUrl, setFormPhotoUrl] = useState('');
  const [formPhotos, setFormPhotos] = useState<string[]>([]);
  const [formOrder, setFormOrder] = useState(1);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<FamilyMember | null>(null);

  // Vault Password Settings
  const [vaultPassword, setVaultPassword] = useState('');
  const [confirmVaultPassword, setConfirmVaultPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'family_members'));
      if (!snap.empty) {
        const loaded: FamilyMember[] = [];
        snap.forEach((d) => {
          const data = d.data();
          loaded.push({
            id: d.id,
            name: data.name || '',
            nameHi: data.nameHi || '',
            relation: data.relation || 'Family',
            relationHi: data.relationHi || 'परिवार',
            bio: data.bio || '',
            bioHi: data.bioHi || '',
            photoUrl: data.photoUrl || '',
            storagePath: data.storagePath || '',
            photos: data.photos || (data.photoUrl ? [data.photoUrl] : []),
            order: data.order ?? 1,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
          });
        });
        loaded.sort((a, b) => a.order - b.order);
        setMembers(loaded);
      } else {
        setMembers(defaultFamilyMembers);
      }
    } catch (err) {
      console.warn('Family members load fallback:', err);
      setMembers(defaultFamilyMembers);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    sound.playClick();
    setEditingId(null);
    setFormName('');
    setFormNameHi('');
    setFormRelation('Father');
    setFormRelationHi('पिता');
    setFormBio('');
    setFormBioHi('');
    setFormPhotoUrl('');
    setFormPhotos([]);
    setFormOrder(members.length + 1);
    setIsMemberModalOpen(true);
  };

  const handleEdit = (m: FamilyMember) => {
    sound.playClick();
    setEditingId(m.id);
    setFormName(m.name);
    setFormNameHi(m.nameHi || '');
    setFormRelation(m.relation);
    setFormRelationHi(m.relationHi || '');
    setFormBio(m.bio || '');
    setFormBioHi(m.bioHi || '');
    setFormPhotoUrl(m.photoUrl);
    setFormPhotos(m.photos || (m.photoUrl ? [m.photoUrl] : []));
    setFormOrder(m.order);
    setIsMemberModalOpen(true);
  };

  const handleSaveMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setStatusMessage({ type: 'error', text: 'Name is required' });
      return;
    }

    setIsSaving(true);
    try {
      const id = editingId || `family_${Date.now()}`;
      await setDoc(
        doc(db, 'family_members', id),
        {
          name: formName.trim(),
          nameHi: formNameHi.trim(),
          relation: formRelation,
          relationHi: formRelationHi.trim(),
          bio: formBio.trim(),
          bioHi: formBioHi.trim(),
          photoUrl: formPhotoUrl.trim(),
          photos: formPhotos,
          order: Number(formOrder) || 1,
          updatedAt: serverTimestamp(),
          ...(editingId ? {} : { createdAt: serverTimestamp() }),
        },
        { merge: true }
      );

      sound.playSuccess();
      setStatusMessage({ type: 'success', text: 'Family member saved successfully!' });
      setIsMemberModalOpen(false);
      await loadMembers();
    } catch (err: any) {
      sound.playAlert();
      setStatusMessage({ type: 'error', text: `Failed to save: ${err.message}` });
    } finally {
      setIsSaving(false);
      setTimeout(() => setStatusMessage(null), 3500);
    }
  };

  const handleDeleteMember = async () => {
    if (!memberToDelete) return;
    setIsSaving(true);
    try {
      await deleteDoc(doc(db, 'family_members', memberToDelete.id));
      sound.playTrash();
      setStatusMessage({ type: 'success', text: 'Family member removed.' });
      setMemberToDelete(null);
      await loadMembers();
    } catch (err: any) {
      sound.playAlert();
      setStatusMessage({ type: 'error', text: `Delete failed: ${err.message}` });
    } finally {
      setIsSaving(false);
      setTimeout(() => setStatusMessage(null), 3500);
    }
  };

  const handleUploadPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const compressed = await compressImage(file, 1280, 1280, 0.85);
      const path = `family/member_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '')}`;

      let url = '';
      const cld = getCloudinaryConfig();
      if (cld.isConfigured) {
        try {
          const cldRes = await uploadToCloudinary(file, 'family_members');
          url = cldRes.secureUrl;
        } catch (cldErr) {
          console.warn('Cloudinary upload fallback:', cldErr);
        }
      }

      if (!url) {
        try {
          const res = await uploadToSupabaseStorage(compressed, path, {
            bucket: SUPABASE_STORAGE_BUCKET,
            isPrivate: true,
          });
          url = res.signedUrl || res.publicUrl;
        } catch (supabaseErr) {
          const storageRef = ref(storage, path);
          await uploadBytes(storageRef, compressed);
          url = await getDownloadURL(storageRef);
        }
      }

      if (url) {
        setFormPhotoUrl(url);
        if (!formPhotos.includes(url)) {
          setFormPhotos((prev) => [url, ...prev]);
        }
        sound.playSuccess();
        setStatusMessage({ type: 'success', text: 'Family avatar photo uploaded successfully!' });
      }
    } catch (err: any) {
      sound.playAlert();
      setStatusMessage({ type: 'error', text: `Upload failed: ${err?.message || String(err)}` });
    } finally {
      setUploadingAvatar(false);
      setTimeout(() => setStatusMessage(null), 6000);
    }
  };

  const handleUploadGalleryPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingGallery(true);
    try {
      const compressed = await compressImage(file, 1600, 1600, 0.85);
      const path = `family/gallery_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '')}`;

      let url = '';
      const cld = getCloudinaryConfig();
      if (cld.isConfigured) {
        try {
          const cldRes = await uploadToCloudinary(file, 'family_gallery');
          url = cldRes.secureUrl;
        } catch (cldErr) {
          console.warn('Cloudinary upload fallback:', cldErr);
        }
      }

      if (!url) {
        try {
          const res = await uploadToSupabaseStorage(compressed, path, {
            bucket: SUPABASE_STORAGE_BUCKET,
            isPrivate: true,
          });
          url = res.signedUrl || res.publicUrl;
        } catch (supabaseErr) {
          const storageRef = ref(storage, path);
          await uploadBytes(storageRef, compressed);
          url = await getDownloadURL(storageRef);
        }
      }

      if (url) {
        setFormPhotos((prev) => [...prev, url]);
        sound.playSuccess();
        setStatusMessage({ type: 'success', text: 'Family memory photo added successfully!' });
      }
    } catch (err: any) {
      sound.playAlert();
      setStatusMessage({ type: 'error', text: `Upload failed: ${err?.message || String(err)}` });
    } finally {
      setUploadingGallery(false);
      setTimeout(() => setStatusMessage(null), 6000);
    }
  };

  const handleSetVaultPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vaultPassword || vaultPassword.length < 4) {
      setStatusMessage({ type: 'error', text: 'Password must be at least 4 characters long.' });
      return;
    }
    if (vaultPassword !== confirmVaultPassword) {
      setStatusMessage({ type: 'error', text: 'Passwords do not match.' });
      return;
    }

    setIsSavingPassword(true);
    try {
      const salt = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      const hash = await hashPasswordWithSalt(vaultPassword, salt);

      await setDoc(
        doc(db, 'settings', 'family_vault'),
        {
          hasPasswordSet: true,
          passwordSalt: salt,
          passwordHash: hash,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      await updateSiteSettings({
        familyVault: {
          hasPasswordSet: true,
          passwordSalt: salt,
          passwordHash: hash,
        },
      });

      sound.playSuccess();
      setVaultPassword('');
      setConfirmVaultPassword('');
      setStatusMessage({ type: 'success', text: 'Family Vault password encrypted and updated!' });
    } catch (err: any) {
      sound.playAlert();
      setStatusMessage({ type: 'error', text: `Failed to set password: ${err.message}` });
    } finally {
      setIsSavingPassword(false);
      setTimeout(() => setStatusMessage(null), 4000);
    }
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/80 border border-rose-500/20">
        <div>
          <h2 className="font-cyber font-bold text-xl text-white flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-400 fill-rose-500/20" />
            Family Vault & Sanctuary Management
          </h2>
          <p className="text-xs font-mono text-slate-400 mt-1">
            Zero-Trust password protected family vault, respectful profiles, and multi-photo memories.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('members')}
            className={`px-3 py-1.5 rounded-xl font-mono text-xs cursor-pointer transition ${
              activeTab === 'members'
                ? 'bg-rose-500 text-white font-bold'
                : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            Family Members ({members.length})
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`px-3 py-1.5 rounded-xl font-mono text-xs cursor-pointer transition ${
              activeTab === 'security'
                ? 'bg-rose-500 text-white font-bold'
                : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            Vault Password & PIN
          </button>
        </div>
      </div>

      {statusMessage && (
        <div
          className={`p-3.5 rounded-xl border flex items-center gap-2.5 font-mono text-xs ${
            statusMessage.type === 'success'
              ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
              : 'bg-rose-950/60 border-rose-500/50 text-rose-300'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* MEMBERS TAB */}
      {activeTab === 'members' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-mono text-slate-400">
              Only accessible via Family Vault password on the public site.
            </p>
            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 text-white font-cyber font-bold text-xs uppercase cursor-pointer hover:opacity-95"
            >
              <Plus className="w-4 h-4" /> Add Family Member
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {members.map((m) => (
              <div
                key={m.id}
                className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-rose-500/40 transition flex flex-col justify-between"
              >
                <div className="flex items-start gap-3">
                  <img
                    src={m.photoUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200'}
                    alt={m.name}
                    className="w-14 h-14 rounded-xl object-cover border border-rose-500/30 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <h4 className="font-cyber font-bold text-white text-sm truncate">{m.name}</h4>
                    {m.nameHi && <p className="text-[11px] font-sans text-slate-400">{m.nameHi}</p>}
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-rose-950/60 text-rose-300 border border-rose-800/40 font-mono text-[10px]">
                      {m.relation} {m.relationHi ? `(${m.relationHi})` : ''}
                    </span>
                  </div>
                </div>

                {m.bio && (
                  <p className="mt-3 text-[11px] font-mono text-slate-300 line-clamp-2 bg-slate-950/60 p-2 rounded-lg border border-slate-800">
                    "{m.bio}"
                  </p>
                )}

                <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-slate-800">
                  <span className="text-[10px] font-mono text-slate-400">
                    {m.photos?.length || 1} photos in gallery
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleEdit(m)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 transition cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setMemberToDelete(m)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-300 hover:text-rose-400 transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECURITY TAB */}
      {activeTab === 'security' && (
        <form onSubmit={handleSetVaultPassword} className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4 max-w-xl">
          <h3 className="font-cyber font-bold text-base text-white flex items-center gap-2">
            <Lock className="w-4 h-4 text-rose-400" />
            Family Vault Passcode Configuration
          </h3>
          <p className="text-xs font-mono text-slate-400 leading-relaxed">
            Protect your family members' photographs and memories. The password is cryptographically salted and hashed using SHA-256 before storage in Firebase.
          </p>

          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-mono text-slate-300 mb-1">
                New Vault Passcode / Secret PIN
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={vaultPassword}
                  onChange={(e) => setVaultPassword(e.target.value)}
                  placeholder="Enter secret passcode..."
                  className="w-full px-3 py-2 pr-10 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-rose-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-slate-300 mb-1">
                Confirm Passcode
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={confirmVaultPassword}
                onChange={(e) => setConfirmVaultPassword(e.target.value)}
                placeholder="Re-enter secret passcode..."
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-rose-400"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSavingPassword}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-400 hover:to-amber-400 text-white font-cyber font-bold text-xs uppercase tracking-wider cursor-pointer disabled:opacity-50"
          >
            <Key className="w-4 h-4" />
            {isSavingPassword ? 'Encrypting & Saving...' : 'Set Encrypted Vault Password'}
          </button>
        </form>
      )}

      {/* MEMBER EDIT MODAL */}
      {isMemberModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl overflow-y-auto">
          <div className="max-w-2xl w-full p-6 my-8 rounded-3xl bg-slate-950 border border-rose-500/40 shadow-2xl text-left space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-cyber font-bold text-lg text-white flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-400" />
                {editingId ? 'Edit Family Member' : 'Add Family Member'}
              </h3>
              <button
                onClick={() => setIsMemberModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMember} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-slate-300 mb-1">Name (EN) *</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-slate-300 mb-1">Name (HI)</label>
                  <input
                    type="text"
                    value={formNameHi}
                    onChange={(e) => setFormNameHi(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-slate-300 mb-1">Relation (EN)</label>
                  <input
                    type="text"
                    value={formRelation}
                    onChange={(e) => setFormRelation(e.target.value)}
                    placeholder="Father, Mother, Brother..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-slate-300 mb-1">Relation (HI)</label>
                  <input
                    type="text"
                    value={formRelationHi}
                    onChange={(e) => setFormRelationHi(e.target.value)}
                    placeholder="पिता, माँ, भाई..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-slate-300 mb-1">Order</label>
                  <input
                    type="number"
                    value={formOrder}
                    onChange={(e) => setFormOrder(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono text-xs"
                  />
                </div>
              </div>

              {/* Photo & Upload */}
              <div>
                <label className="block text-[11px] font-mono text-slate-300 mb-1">Primary Portrait Photo</label>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={formPhotoUrl}
                    onChange={(e) => setFormPhotoUrl(e.target.value)}
                    placeholder="Image URL or upload..."
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono text-xs"
                  />
                  <label className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 text-white font-mono text-xs cursor-pointer">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{uploadingAvatar ? 'Uploading...' : 'Upload'}</span>
                    <input type="file" accept="image/*" onChange={handleUploadPhoto} className="hidden" />
                  </label>
                </div>
              </div>

              {/* Multi-Photo Gallery */}
              <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono text-slate-300 font-bold">
                    Gallery Memories ({formPhotos.length})
                  </label>
                  <label className="px-3 py-1 rounded-lg bg-slate-800 text-white font-mono text-[11px] cursor-pointer">
                    {uploadingGallery ? 'Uploading...' : '+ Add Photo'}
                    <input type="file" accept="image/*" onChange={handleUploadGalleryPhoto} className="hidden" />
                  </label>
                </div>
                <div className="flex items-center gap-2 overflow-x-auto py-1">
                  {formPhotos.map((p, idx) => (
                    <div key={idx} className="relative group shrink-0">
                      <img src={p} alt="family preview" className="w-14 h-14 rounded-lg object-cover border border-slate-700" />
                      <button
                        type="button"
                        onClick={() => setFormPhotos((prev) => prev.filter((_, i) => i !== idx))}
                        className="absolute -top-1.5 -right-1.5 p-0.5 rounded-full bg-rose-600 text-white"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-300 mb-1">Bio / Memories (EN)</label>
                <textarea
                  rows={2}
                  value={formBio}
                  onChange={(e) => setFormBio(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-300 mb-1">Bio / Memories (HI)</label>
                <textarea
                  rows={2}
                  value={formBioHi}
                  onChange={(e) => setFormBioHi(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono text-xs"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsMemberModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-mono"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-cyber font-bold text-xs uppercase"
                >
                  {isSaving ? 'Saving...' : 'Save Family Dossier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM */}
      {memberToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl">
          <div className="max-w-md w-full p-6 rounded-3xl bg-slate-950 border border-rose-500/50 space-y-4">
            <h3 className="font-cyber font-bold text-base text-white">Delete Family Member?</h3>
            <p className="text-xs font-mono text-slate-300">
              Are you sure you want to remove "{memberToDelete.name}" from the family vault?
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setMemberToDelete(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-mono"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteMember}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs font-cyber uppercase"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
