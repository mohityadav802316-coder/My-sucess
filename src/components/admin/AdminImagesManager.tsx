import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useImages } from '../../context/ImageContext';
import { sound } from '../audio/SoundEffects';
import { PortfolioImage } from '../../types';
import { compressImage } from '../../utils/imageCompressor';
import {
  db,
  storage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  doc,
  setDoc,
  deleteDoc,
  serverTimestamp
} from '../../firebase';
import {
  uploadToSupabaseStorage,
  deleteFromSupabaseStorage,
  checkSupabaseBucketStatus,
  SUPABASE_STORAGE_BUCKET,
  SUPABASE_STORAGE_SETUP_SQL
} from '../../supabase';
import {
  uploadToCloudinary,
  getCloudinaryConfig,
  saveCloudinaryConfig,
  type CloudinaryConfig,
  getOptimizedImageUrl
} from '../../services/cloudinary';
import {
  Image as ImageIcon,
  Upload,
  Trash2,
  Edit2,
  Save,
  X,
  Star,
  CheckCircle2,
  AlertCircle,
  Plus,
  Eye,
  Sliders,
  RotateCw,
  Database,
  ExternalLink,
  Copy,
  Info,
  Sparkles
} from 'lucide-react';

export const AdminImagesManager: React.FC = () => {
  const { mode } = useLanguage();
  const {
    allImages,
    siteSettings,
    updateSiteSettings,
    refreshImages
  } = useImages();

  const [filterSection, setFilterSection] = useState<string>('all');
  const [uploading, setUploading] = useState(false);
  const [editingImage, setEditingImage] = useState<PortfolioImage | null>(null);
  const [imageToDelete, setImageToDelete] = useState<PortfolioImage | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Edit State
  const [formCaption, setFormCaption] = useState('');
  const [formCaptionHi, setFormCaptionHi] = useState('');
  const [formSection, setFormSection] = useState<'hero' | 'about' | 'gallery' | 'profile' | 'roadmap'>('gallery');
  const [formCategory, setFormCategory] = useState<'personal' | 'setup' | 'ai_creation' | 'coding' | 'blueprint'>('personal');
  const [formOrder, setFormOrder] = useState(1);

  // Orbit Configuration
  const [orbitCycleInterval, setOrbitCycleInterval] = useState(siteSettings.hero.orbitCycleInterval || 5);
  const [autoRotateSpeed, setAutoRotateSpeed] = useState(siteSettings.hero.autoRotateSpeed || 0.8);
  const [isSavingOrbit, setIsSavingOrbit] = useState(false);

  // Supabase Storage Status & Setup Guide
  const [bucketStatus, setBucketStatus] = useState<{
    exists: boolean;
    bucket: string;
    isPublic?: boolean;
    error?: string;
  } | null>(null);
  const [checkingBucket, setCheckingBucket] = useState(false);
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  const checkBucket = async () => {
    setCheckingBucket(true);
    try {
      const res = await checkSupabaseBucketStatus();
      setBucketStatus(res);
    } catch (e: any) {
      setBucketStatus({ exists: false, bucket: SUPABASE_STORAGE_BUCKET, error: e?.message });
    } finally {
      setCheckingBucket(false);
    }
  };

  useEffect(() => {
    checkBucket();
  }, []);

  const heroOrbitIds = siteSettings.hero.orbitImageIds || [];
  const primaryPhotoId = siteSettings.hero.primaryPhotoId;

  // Cloudinary Configuration State
  const [cloudinaryConfig, setCloudinaryConfig] = useState<CloudinaryConfig>(getCloudinaryConfig());
  const [showCloudinaryModal, setShowCloudinaryModal] = useState(false);
  const [cloudNameInput, setCloudNameInput] = useState(cloudinaryConfig.cloudName);
  const [presetInput, setPresetInput] = useState(cloudinaryConfig.uploadPreset);

  const handleSaveCloudinary = () => {
    saveCloudinaryConfig(cloudNameInput, presetInput);
    const updated = getCloudinaryConfig();
    setCloudinaryConfig(updated);
    setShowCloudinaryModal(false);
    sound.playSuccess();
    setStatusMessage({
      type: 'success',
      text: updated.isConfigured
        ? `Cloudinary सेटिंग्स सफलतापूर्वक सेव हो गईं! (Cloud Name: ${updated.cloudName})`
        : 'Cloudinary सेटिंग्स अपडेट हो गईं।'
    });
  };

  const handleUploadNew = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setStatusMessage(null);
    try {
      const compressed = await compressImage(file, 1600, 1600, 0.85);
      const id = `img_${Date.now()}`;
      const path = `portfolio/${id}_${file.name.replace(/[^a-zA-Z0-9.]/g, '')}`;

      let downloadUrl = '';
      let storageProvider: 'cloudinary' | 'supabase' | 'firebase' = 'cloudinary';

      // 1. Primary Flow: Upload to Cloudinary CDN if configured
      if (cloudinaryConfig.isConfigured) {
        try {
          const cldRes = await uploadToCloudinary(file, 'cybermohit_portfolio');
          downloadUrl = cldRes.secureUrl;
          storageProvider = 'cloudinary';
        } catch (cldErr: any) {
          console.warn('Cloudinary upload fallback to secondary storage:', cldErr);
          try {
            const storageRef = ref(storage, path);
            await uploadBytes(storageRef, compressed);
            downloadUrl = await getDownloadURL(storageRef);
            storageProvider = 'firebase';
          } catch {
            const reader = new FileReader();
            downloadUrl = await new Promise<string>((resolve) => {
              reader.onload = () => resolve(reader.result as string);
              reader.readAsDataURL(compressed);
            });
            storageProvider = 'firebase';
          }
        }
      } else {
        // Fallback: If Cloudinary is not configured yet
        try {
          const res = await uploadToSupabaseStorage(compressed, path, {
            bucket: SUPABASE_STORAGE_BUCKET,
          });
          downloadUrl = res.publicUrl;
          storageProvider = 'supabase';
        } catch (supabaseErr: any) {
          try {
            const storageRef = ref(storage, path);
            await uploadBytes(storageRef, compressed);
            downloadUrl = await getDownloadURL(storageRef);
            storageProvider = 'firebase';
          } catch (fbErr: any) {
            throw new Error('कृपया ऊपर "Cloudinary सेटिंग्स" बटन दबाकर अपना Cloud Name और Upload Preset दर्ज करें।');
          }
        }
      }

      if (!downloadUrl) {
        throw new Error('फोटो अपलोड होने के बाद इमेज URL प्राप्त नहीं हो सका।');
      }

      const sectionTarget = filterSection === 'all' || filterSection === 'orbit' ? 'gallery' : (filterSection as any);

      // 2. Save metadata and public URL to existing Firestore record
      await setDoc(doc(db, 'images', id), {
        id,
        caption: file.name.replace(/\.[^/.]+$/, ''),
        captionHi: '',
        downloadUrl,
        storagePath: path,
        storageProvider,
        section: sectionTarget,
        category: 'personal',
        displayOrder: allImages.length + 1,
        isPublished: true,
        isMainProfile: sectionTarget === 'profile',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      sound.playSuccess();
      setStatusMessage({
        type: 'success',
        text: `फोटो सफलतापूर्वक ${storageProvider === 'cloudinary' ? 'Cloudinary CDN' : storageProvider} पर अपलोड होकर Firestore डेटाबेस में सुरक्षित हो गई!`
      });
      await refreshImages();
      checkBucket();
    } catch (err: any) {
      sound.playAlert();
      const origMsg = err?.message || String(err);
      console.error('AdminImagesManager upload error:', origMsg);
      setStatusMessage({ type: 'error', text: origMsg });
    } finally {
      setUploading(false);
      setTimeout(() => setStatusMessage(null), 8000);
    }
  };

  const handleStartEdit = (img: PortfolioImage) => {
    sound.playClick();
    setEditingImage(img);
    setFormCaption(img.caption || '');
    setFormCaptionHi(img.captionHi || '');
    setFormSection(img.section || 'gallery');
    setFormCategory(img.category || 'personal');
    setFormOrder(img.displayOrder || 1);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingImage) return;

    try {
      await setDoc(
        doc(db, 'images', editingImage.id),
        {
          caption: formCaption.trim(),
          captionHi: formCaptionHi.trim(),
          section: formSection,
          category: formCategory,
          displayOrder: Number(formOrder) || 1,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
      sound.playSuccess();
      setEditingImage(null);
      setStatusMessage({ type: 'success', text: 'Image metadata saved.' });
      await refreshImages();
    } catch (err: any) {
      sound.playAlert();
      setStatusMessage({ type: 'error', text: `Save failed: ${err.message}` });
    }
  };

  const handleDelete = async () => {
    if (!imageToDelete) return;
    try {
      await deleteDoc(doc(db, 'images', imageToDelete.id));
      if (imageToDelete.storagePath) {
        try {
          await deleteFromSupabaseStorage(imageToDelete.storagePath);
        } catch {}
        try {
          await deleteObject(ref(storage, imageToDelete.storagePath));
        } catch {}
      }
      sound.playTrash();
      setImageToDelete(null);
      setStatusMessage({ type: 'success', text: 'Image deleted from database and storage.' });
      await refreshImages();
    } catch (err: any) {
      sound.playAlert();
      setStatusMessage({ type: 'error', text: `Delete failed: ${err.message}` });
    }
  };

  const handleToggleOrbit = async (imgId: string) => {
    sound.playClick();
    let currentOrbit = [...heroOrbitIds];
    if (currentOrbit.includes(imgId)) {
      currentOrbit = currentOrbit.filter((id) => id !== imgId);
    } else {
      if (currentOrbit.length >= 6) {
        setStatusMessage({ type: 'error', text: 'Max 6 photos in 3D orbit carousel for best performance.' });
        return;
      }
      currentOrbit.push(imgId);
    }

    try {
      await updateSiteSettings({
        hero: {
          ...siteSettings.hero,
          orbitImageIds: currentOrbit,
        },
      });
      sound.playSuccess();
    } catch (err: any) {
      sound.playAlert();
    }
  };

  const handleSetPrimary = async (imgId: string) => {
    sound.playClick();
    try {
      await updateSiteSettings({
        hero: {
          ...siteSettings.hero,
          primaryPhotoId: imgId,
        },
      });
      sound.playSuccess();
      setStatusMessage({ type: 'success', text: 'Primary Hero portrait updated!' });
    } catch (err: any) {
      sound.playAlert();
    }
  };

  const handleSaveOrbitSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingOrbit(true);
    try {
      await updateSiteSettings({
        hero: {
          ...siteSettings.hero,
          orbitCycleInterval: Number(orbitCycleInterval) || 5,
          autoRotateSpeed: Number(autoRotateSpeed) || 0.8,
        },
      });
      sound.playSuccess();
      setStatusMessage({ type: 'success', text: 'Orbit dynamics synchronized!' });
    } catch (err: any) {
      sound.playAlert();
    } finally {
      setIsSavingOrbit(false);
      setTimeout(() => setStatusMessage(null), 3000);
    }
  };

  const filteredImages = allImages.filter((img: PortfolioImage) => {
    if (filterSection === 'all') return true;
    if (filterSection === 'orbit') return heroOrbitIds.includes(img.id);
    return img.section === filterSection;
  });

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/80 border border-amber-500/20">
        <div>
          <h2 className="font-cyber font-bold text-xl text-white flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-amber-400" />
            Media & 3D Photo Orbit Studio
          </h2>
          <p className="text-xs font-mono text-slate-400 mt-1">
            Upload, tag, and assign portfolio pictures to the 3D rotating Multiverse Orbit.
          </p>
        </div>

        <label className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 text-slate-950 font-cyber font-bold text-xs uppercase tracking-wider hover:opacity-95 cursor-pointer shadow-lg shadow-amber-500/20">
          <Upload className="w-4 h-4" />
          <span>{uploading ? 'Compressing & Uploading...' : 'Upload Media'}</span>
          <input type="file" accept="image/*" onChange={handleUploadNew} className="hidden" disabled={uploading} />
        </label>
      </div>
      <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg transition-all ${
        cloudinaryConfig.isConfigured
          ? 'bg-slate-900/90 border-cyan-500/40 shadow-cyan-500/10'
          : 'bg-slate-900/70 border-amber-500/30 shadow-amber-500/10'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl border ${
            cloudinaryConfig.isConfigured
              ? 'bg-cyan-950/80 border-cyan-500/40 text-cyan-400'
              : 'bg-amber-950/80 border-amber-500/40 text-amber-400'
          }`}>
            <ImageIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-cyber font-bold text-xs uppercase tracking-wider text-white">
                Cloudinary CDN Photo Storage
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                cloudinaryConfig.isConfigured
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              }`}>
                {cloudinaryConfig.isConfigured ? 'Active & Ready' : 'Setup Required'}
              </span>
            </div>
            <p className="text-[11px] font-mono text-slate-400 mt-0.5">
              {cloudinaryConfig.isConfigured ? (
                <>Cloud Name: <span className="text-cyan-300 font-bold">{cloudinaryConfig.cloudName}</span> | Preset: <span className="text-amber-300 font-bold">{cloudinaryConfig.uploadPreset}</span></>
              ) : (
                'फ़ोटो अपलोड करने के लिए Cloud Name और Upload Preset सेट करें'
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setCloudNameInput(cloudinaryConfig.cloudName);
              setPresetInput(cloudinaryConfig.uploadPreset);
              setShowCloudinaryModal(true);
            }}
            className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-cyber font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-cyan-500/20 transition-all active:scale-95"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Cloudinary सेटिंग्स</span>
          </button>
        </div>
      </div>
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-400">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-cyber font-bold text-xs uppercase tracking-wider text-emerald-300">
                Storage: Autonomous Engine
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Ready &amp; Active (Zero Cloud Latency)
              </span>
            </div>
            <p className="text-[11px] font-mono text-slate-400 mt-0.5">
              Storage Mode: <span className="text-emerald-400 font-semibold">100% Persistent Local Storage</span> | Target Bucket: <span className="text-cyan-400 font-semibold">{SUPABASE_STORAGE_BUCKET}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={checkBucket}
            disabled={checkingBucket}
            className="flex-1 sm:flex-initial px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs border border-slate-700 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <RotateCw className={`w-3.5 h-3.5 ${checkingBucket ? 'animate-spin' : ''}`} />
            <span>Health Check</span>
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

      {/* Orbit Dynamic Controls Bar */}
      <form onSubmit={handleSaveOrbitSettings} className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-white font-cyber text-xs uppercase font-bold">
          <RotateCw className="w-4 h-4 text-amber-400 animate-spin-slow" />
          <span>3D Orbit Controls</span>
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <label className="text-[11px] font-mono text-slate-400">Cycle (sec):</label>
            <input
              type="number"
              min={2}
              max={15}
              value={orbitCycleInterval}
              onChange={(e) => setOrbitCycleInterval(Number(e.target.value))}
              className="w-16 px-2 py-1 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono text-xs text-center"
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="text-[11px] font-mono text-slate-400">Rotation Speed:</label>
            <input
              type="range"
              min="0.2"
              max="2.5"
              step="0.1"
              value={autoRotateSpeed}
              onChange={(e) => setAutoRotateSpeed(Number(e.target.value))}
              className="w-24 accent-amber-500 cursor-pointer"
            />
            <span className="text-xs font-mono text-amber-400">{autoRotateSpeed}x</span>
          </div>

          <button
            type="submit"
            disabled={isSavingOrbit}
            className="px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold font-mono text-xs hover:bg-amber-400 cursor-pointer disabled:opacity-50"
          >
            {isSavingOrbit ? 'Saving...' : 'Sync Orbit'}
          </button>
        </div>
      </form>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {['all', 'orbit', 'hero', 'about', 'gallery', 'profile', 'roadmap'].map((sec) => (
          <button
            key={sec}
            onClick={() => {
              sound.playClick();
              setFilterSection(sec);
            }}
            className={`px-3 py-1.5 rounded-xl font-mono text-xs whitespace-nowrap cursor-pointer transition ${
              filterSection === sec
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            {sec === 'orbit' ? `3D Orbit (${heroOrbitIds.length})` : sec.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Images Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {filteredImages.map((img: PortfolioImage) => {
          const isOrbit = heroOrbitIds.includes(img.id);
          const isPrimary = primaryPhotoId === img.id;

          return (
            <div
              key={img.id}
              className={`group relative rounded-2xl bg-slate-900/60 border overflow-hidden flex flex-col justify-between transition ${
                isPrimary
                  ? 'border-amber-400 shadow-lg shadow-amber-500/20'
                  : isOrbit
                  ? 'border-cyan-500/60'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="relative aspect-square w-full overflow-hidden bg-slate-950">
                <img
                  src={img.downloadUrl}
                  alt={img.caption || 'Portfolio photo'}
                  className="w-full h-full object-cover group-hover:scale-105 transition"
                />

                {/* Badges */}
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                  {isPrimary && (
                    <span className="px-2 py-0.5 rounded-md bg-amber-500 text-slate-950 font-mono text-[9px] font-bold">
                      PRIMARY HERO
                    </span>
                  )}
                  {isOrbit && (
                    <span className="px-2 py-0.5 rounded-md bg-cyan-500 text-slate-950 font-mono text-[9px] font-bold">
                      IN 3D ORBIT
                    </span>
                  )}
                </div>

                <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                  <button
                    onClick={() => handleStartEdit(img)}
                    className="p-1 rounded-lg bg-slate-900/90 text-slate-300 hover:text-amber-400"
                    title="Edit metadata"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setImageToDelete(img)}
                    className="p-1 rounded-lg bg-slate-900/90 text-slate-300 hover:text-rose-400"
                    title="Delete image"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="p-3 space-y-2">
                <p className="font-mono text-xs text-white truncate font-semibold">
                  {img.caption || 'Untitled photo'}
                </p>

                <div className="flex items-center justify-between gap-1 pt-1 border-t border-slate-800">
                  <button
                    onClick={() => handleSetPrimary(img.id)}
                    className={`text-[10px] font-mono px-2 py-1 rounded-lg cursor-pointer transition ${
                      isPrimary
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    Set Primary
                  </button>
                  <button
                    onClick={() => handleToggleOrbit(img.id)}
                    className={`text-[10px] font-mono px-2 py-1 rounded-lg cursor-pointer transition ${
                      isOrbit
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {isOrbit ? 'Remove Orbit' : '+ Add Orbit'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Modal */}
      {editingImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl">
          <div className="max-w-md w-full p-6 rounded-3xl bg-slate-950 border border-amber-500/40 space-y-4">
            <h3 className="font-cyber font-bold text-base text-white">Edit Image Details</h3>
            <form onSubmit={handleSaveEdit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-mono text-slate-300 mb-1">Caption (EN)</label>
                <input
                  type="text"
                  value={formCaption}
                  onChange={(e) => setFormCaption(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono text-slate-300 mb-1">Caption (HI)</label>
                <input
                  type="text"
                  value={formCaptionHi}
                  onChange={(e) => setFormCaptionHi(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono text-slate-300 mb-1">Section</label>
                <select
                  value={formSection}
                  onChange={(e) => setFormSection(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono text-xs"
                >
                  <option value="hero">Hero</option>
                  <option value="about">About</option>
                  <option value="gallery">Gallery</option>
                  <option value="profile">Profile</option>
                  <option value="roadmap">Roadmap</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingImage(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-mono"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold font-cyber text-xs uppercase"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {imageToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl">
          <div className="max-w-md w-full p-6 rounded-3xl bg-slate-950 border border-rose-500/50 space-y-4">
            <h3 className="font-cyber font-bold text-base text-white">Delete Image?</h3>
            <p className="text-xs font-mono text-slate-300">
              Are you sure you want to permanently delete this photo from Supabase Storage and database?
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setImageToDelete(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-mono"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs font-cyber uppercase"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Supabase Storage Setup & Policies Modal */}
      {showSetupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl">
          <div className="max-w-2xl w-full p-6 rounded-3xl bg-slate-950 border border-cyan-500/50 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-cyan-400" />
                <h3 className="font-cyber font-bold text-lg text-white">
                  Supabase Storage Configuration & Policies
                </h3>
              </div>
              <button
                onClick={() => setShowSetupModal(false)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-xs font-mono text-cyan-200 space-y-1">
              <div><strong className="text-white">Project ID:</strong> ekzqviyldhvvnztvmnce</div>
              <div><strong className="text-white">Target Public Bucket:</strong> {SUPABASE_STORAGE_BUCKET}</div>
              <div>
                <strong className="text-white">Status:</strong>{' '}
                {bucketStatus?.exists ? (
                  <span className="text-emerald-400 font-bold">Bucket is Active & Public</span>
                ) : (
                  <span className="text-amber-400 font-bold">
                    Bucket '{SUPABASE_STORAGE_BUCKET}' Not Found in Supabase. Run the SQL below in Supabase SQL Editor.
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-cyber uppercase tracking-wider text-slate-300 font-bold">
                  SQL Script (Supabase SQL Editor)
                </label>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(SUPABASE_STORAGE_SETUP_SQL);
                    setCopiedSql(true);
                    setTimeout(() => setCopiedSql(false), 2500);
                  }}
                  className="px-3 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 font-mono text-xs flex items-center gap-1.5 cursor-pointer border border-cyan-500/30"
                >
                  {copiedSql ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSql ? 'Copied to Clipboard!' : 'Copy SQL'}</span>
                </button>
              </div>

              <pre className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-emerald-400 font-mono text-[11px] leading-relaxed overflow-x-auto select-all max-h-60">
                {SUPABASE_STORAGE_SETUP_SQL}
              </pre>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-xs font-mono text-slate-300">
              <div className="font-bold text-white flex items-center gap-1.5">
                <Info className="w-4 h-4 text-amber-400" />
                <span>30-Second Setup Instructions:</span>
              </div>
              <ol className="list-decimal pl-5 space-y-1 text-slate-400">
                <li>
                  Open your{' '}
                  <a
                    href="https://supabase.com/dashboard/project/ekzqviyldhvvnztvmnce/sql/new"
                    target="_blank"
                    rel="noreferrer"
                    className="text-cyan-400 underline hover:text-cyan-300 inline-flex items-center gap-0.5"
                  >
                    Supabase SQL Editor <ExternalLink className="w-3 h-3" />
                  </a>
                  .
                </li>
                <li>Paste the copied SQL above and click <strong>Run</strong>.</li>
                <li>
                  Or go to{' '}
                  <a
                    href="https://supabase.com/dashboard/project/ekzqviyldhvvnztvmnce/storage/buckets"
                    target="_blank"
                    rel="noreferrer"
                    className="text-cyan-400 underline hover:text-cyan-300 inline-flex items-center gap-0.5"
                  >
                    Storage Buckets <ExternalLink className="w-3 h-3" />
                  </a>
                  , ensure the bucket is named <code>{SUPABASE_STORAGE_BUCKET}</code>, and toggle <strong>Public bucket: ON</strong>.
                </li>
                <li>Return here and click <strong>Check Status</strong> to verify immediate connection!</li>
              </ol>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowSetupModal(false)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-cyber text-xs uppercase"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cloudinary CDN Setup Modal */}
      {showCloudinaryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl">
          <div className="max-w-xl w-full p-6 sm:p-7 rounded-3xl bg-slate-950 border border-cyan-500/50 space-y-5 shadow-2xl shadow-cyan-950/50">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-400">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-cyber font-bold text-lg text-white">
                    Cloudinary CDN सेटिंग्स
                  </h3>
                  <p className="text-[11px] font-mono text-slate-400">
                    फ़ोटो Cloudinary CDN पर अपलोड होंगी और डेटा Firestore में रहेगा
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCloudinaryModal(false)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Step-by-Step Instructions */}
            <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 text-xs font-mono space-y-2 text-slate-300">
              <div className="font-bold text-cyan-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>3 सरल स्टेप्स में Cloudinary चालू करें:</span>
              </div>
              <ol className="list-decimal pl-5 space-y-1 text-slate-300 leading-relaxed">
                <li>
                  <a
                    href="https://cloudinary.com/users/register_free"
                    target="_blank"
                    rel="noreferrer"
                    className="text-cyan-400 underline hover:text-cyan-300 inline-flex items-center gap-0.5 font-bold"
                  >
                    Cloudinary.com <ExternalLink className="w-3 h-3" />
                  </a> पर मुफ़्त अकाउंट बनाएं या लॉगिन करें।
                </li>
                <li>
                  Dashboard से अपना <strong className="text-white">Cloud Name</strong> कॉपी करें।
                </li>
                <li>
                  <strong className="text-white">Settings ⚙️ &gt; Upload &gt; Add upload preset</strong> पर जाएं, Signing Mode को <strong className="text-amber-300">Unsigned</strong> चुनें और उसका नाम नीचे पेस्ट करें।
                </li>
              </ol>
            </div>

            {/* Input Form */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold text-slate-300 block">
                  Cloud Name *
                </label>
                <input
                  type="text"
                  value={cloudNameInput}
                  onChange={(e) => setCloudNameInput(e.target.value)}
                  placeholder="e.g. djxy12345 या your_cloud_name"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold text-slate-300 block">
                  Upload Preset (Unsigned) *
                </label>
                <input
                  type="text"
                  value={presetInput}
                  onChange={(e) => setPresetInput(e.target.value)}
                  placeholder="e.g. ml_default या cybermohit_preset"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:border-cyan-400 focus:outline-none"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setCloudNameInput('');
                  setPresetInput('');
                  saveCloudinaryConfig('', '');
                  setCloudinaryConfig(getCloudinaryConfig());
                  setShowCloudinaryModal(false);
                }}
                className="px-3.5 py-2 rounded-xl text-xs font-mono text-rose-400 hover:bg-rose-950/30 transition cursor-pointer"
              >
                रीसेट / हटाएं
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowCloudinaryModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-mono hover:text-white"
                >
                  रद्द करें
                </button>
                <button
                  type="button"
                  onClick={handleSaveCloudinary}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-cyber font-bold text-xs uppercase cursor-pointer transition shadow-md shadow-cyan-500/25"
                >
                  सेटिंग्स सेव करें
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
