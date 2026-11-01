import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { sound } from '../audio/SoundEffects';
import {
  subscribeRoyalIdentity,
  saveRoyalIdentityConfig,
  uploadRoyalIdentityPNG,
  deleteRoyalIdentityImage,
  updateRoyalIdentityImage,
  reorderRoyalIdentityImages,
  setActiveRoyalIdentityImage,
  DEFAULT_ROYAL_CONFIG,
} from '../../services/royalIdentityService';
import { getCloudinaryConfig, uploadToCloudinary } from '../../services/cloudinary';
import { RoyalIdentityConfig, RoyalIdentityImage } from '../../types';
import {
  Upload,
  Sparkles,
  Trash2,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Star,
  RefreshCw,
  Plus,
  Crown,
  Layers,
  Check,
  X,
} from 'lucide-react';

interface StagedFile {
  file: File;
  previewUrl: string;
  title: string;
}

export const AdminRoyalIdentityManager: React.FC = () => {
  const { mode } = useLanguage();
  const hi = mode === 'hi';

  const [config, setConfig] = useState<RoyalIdentityConfig>(DEFAULT_ROYAL_CONFIG);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Staged files for pre-upload review
  const [stagedFiles, setStagedFiles] = useState<StagedFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);
  const replacingImageIdRef = useRef<string | null>(null);

  // Test Sweep simulation in Admin
  const [testSweepActive, setTestSweepActive] = useState(false);
  const [testActiveIdx, setTestActiveIdx] = useState(0);

  // Real-time synchronization
  useEffect(() => {
    const unsub = subscribeRoyalIdentity((data) => {
      setConfig(data);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const showStatus = (text: string, type: 'success' | 'error' = 'success') => {
    setStatusMessage({ type, text });
    setTimeout(() => setStatusMessage(null), 4000);
  };

  // Handle file selection
  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const validPngs = files.filter(
      (f) => f.type === 'image/png' || f.name.toLowerCase().endsWith('.png')
    );

    if (validPngs.length < files.length) {
      showStatus(
        hi
          ? 'केवल पारदर्शी बैकग्राउंड वाली PNG फाइलें ही अनुमत हैं।'
          : 'Only transparent background PNG files are accepted for Royal Identity.',
        'error'
      );
    }

    if (validPngs.length === 0) return;

    const newStaged: StagedFile[] = validPngs.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
      title: file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' '),
    }));

    setStagedFiles((prev) => [...prev, ...newStaged]);
    sound.playClick();

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeStagedFile = (index: number) => {
    setStagedFiles((prev) => {
      const copy = [...prev];
      URL.revokeObjectURL(copy[index].previewUrl);
      copy.splice(index, 1);
      return copy;
    });
    sound.playClick();
  };

  // Upload all staged files to Cloudinary and commit metadata to Firebase
  const handleUploadAllStaged = async () => {
    if (stagedFiles.length === 0) return;

    setUploading(true);
    sound.playClick();

    try {
      const cldConfig = getCloudinaryConfig();
      if (!cldConfig.cloudName || !cldConfig.uploadPreset) {
        throw new Error('Cloudinary config missing: check Cloudinary tab.');
      }

      for (let i = 0; i < stagedFiles.length; i++) {
        const item = stagedFiles[i];
        setUploadProgress(
          `Uploading ${i + 1}/${stagedFiles.length}: ${item.title}...`
        );
        await uploadRoyalIdentityPNG(item.file, item.title);
      }

      // Cleanup previews
      stagedFiles.forEach((f) => URL.revokeObjectURL(f.previewUrl));
      setStagedFiles([]);

      showStatus(
        hi
          ? 'सभी PNG तस्वीरें सफलतापूर्वक क्लाउडिनरी और फायरबेस में सहेजी गईं!'
          : 'All PNG images uploaded to Cloudinary & saved to Royal Archive!'
      );
    } catch (err: any) {
      console.error('Upload failed:', err);
      showStatus(err?.message || 'Upload failed. Check Cloudinary settings.', 'error');
    } finally {
      setUploading(false);
      setUploadProgress('');
    }
  };

  // Replace a single image with a new PNG file
  const handleTriggerReplace = (imageId: string) => {
    replacingImageIdRef.current = imageId;
    replaceInputRef.current?.click();
  };

  const handleExecuteReplace = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const imageId = replacingImageIdRef.current;
    if (!file || !imageId) return;

    if (file.type !== 'image/png' && !file.name.toLowerCase().endsWith('.png')) {
      showStatus('Replacement file must be a PNG with transparent background.', 'error');
      return;
    }

    setUploading(true);
    setUploadProgress(`Uploading replacement for ${file.name}...`);
    sound.playClick();

    try {
      const uploadRes = await uploadToCloudinary(file, 'royal_identity');
      await updateRoyalIdentityImage(imageId, {
        url: uploadRes.secureUrl || uploadRes.url,
      });
      showStatus('Image successfully replaced in Royal Identity!');
    } catch (err: any) {
      showStatus(err?.message || 'Replacement failed.', 'error');
    } finally {
      setUploading(false);
      setUploadProgress('');
      if (replaceInputRef.current) replaceInputRef.current.value = '';
      replacingImageIdRef.current = null;
    }
  };

  // Move image Up/Down
  const handleMoveImage = async (index: number, direction: 'up' | 'down') => {
    const list = [...config.images];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= list.length) return;

    sound.playClick();
    const temp = list[index];
    list[index] = list[targetIdx];
    list[targetIdx] = temp;

    await reorderRoyalIdentityImages(list);
    showStatus(hi ? 'क्रम अपडेट किया गया' : 'Order updated');
  };

  // Toggle Enable/Disable
  const handleToggleEnable = async (image: RoyalIdentityImage) => {
    sound.playClick();
    await updateRoyalIdentityImage(image.id, { isEnabled: !image.isEnabled });
    showStatus(
      image.isEnabled
        ? hi
          ? 'तस्वीर को निष्क्रिय किया गया'
          : 'Image disabled'
        : hi
          ? 'तस्वीर को सक्रिय किया गया'
          : 'Image enabled'
    );
  };

  // Set Active Primary Pose
  const handleSetActive = async (image: RoyalIdentityImage) => {
    sound.playClick();
    await setActiveRoyalIdentityImage(image.id);
    showStatus(hi ? 'प्राथमिक सक्रिय पोज सेट किया गया' : 'Set as primary active pose');
  };

  // Delete image
  const handleDelete = async (image: RoyalIdentityImage) => {
    const ok = window.confirm(`Remove "${image.title}" from Royal Identity Images?`);
    if (!ok) return;

    sound.playClick();
    await deleteRoyalIdentityImage(image.id);
    showStatus(hi ? 'तस्वीर हटा दी गई' : 'Image removed');
  };

  // Update title
  const handleUpdateTitle = async (image: RoyalIdentityImage, newTitle: string) => {
    if (!newTitle.trim() || newTitle === image.title) return;
    await updateRoyalIdentityImage(image.id, { title: newTitle.trim() });
    showStatus(hi ? 'शीर्षक अपडेट हुआ' : 'Title updated');
  };

  // Checkerboard style for verifying PNG transparency
  const transparencyGridStyle: React.CSSProperties = {
    backgroundImage: `
      linear-gradient(45deg, #181714 25%, transparent 25%),
      linear-gradient(-45deg, #181714 25%, transparent 25%),
      linear-gradient(45deg, transparent 75%, #181714 75%),
      linear-gradient(-45deg, transparent 75%, #181714 75%)
    `,
    backgroundSize: '16px 16px',
    backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',
    backgroundColor: '#0A0A08',
  };

  const enabledImages = config.images.filter((img) => img.isEnabled);

  return (
    <div className="space-y-6 text-[#F6F0E4]">
      {/* Hidden file inputs */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFilesSelected}
        multiple
        accept="image/png"
        className="hidden"
      />
      <input
        type="file"
        ref={replaceInputRef}
        onChange={handleExecuteReplace}
        accept="image/png"
        className="hidden"
      />

      {/* Top Banner */}
      <div className="p-5 sm:p-6 rounded-2xl border border-amber-500/30 bg-gradient-to-br from-[#12100B] via-[#0A0A08] to-[#050505] shadow-[0_0_40px_rgba(212,175,95,0.08)] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#D4AF5F] via-[#F1DFA8] to-[#A8823A] p-0.5 shadow-lg shadow-amber-500/20 shrink-0">
            <div className="w-full h-full rounded-[10px] bg-[#0A0907] flex items-center justify-center text-[#D4AF5F]">
              <Sparkles className="w-6 h-6" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
                Hero 3D Poses (Transparent PNG)
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-[#F1DFA8] font-mono uppercase tracking-wider border border-amber-500/30">
                Transparent PNG
              </span>
            </div>
            <p className="text-xs text-[#9A8F7C] mt-1 leading-relaxed">
              {hi
                ? 'पारदर्शी बैकग्राउंड (Transparent PNG) वाली फुल-बॉडी तस्वीरें अपलोड करें। स्क्रॉल और "Divine Light Sweep" एनीमेशन इन्हीं तस्वीरों के बीच 3D में स्मूथली ट्रांजिशन करेगा।'
                : 'Upload transparent background PNG images for the scroll-driven 3D Hero Experience. The Divine Light Sweep sweeps pearl-white and champagne-gold light to seamlessly reveal each pose.'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-amber-400 bg-gradient-to-r from-[#D4AF5F] to-[#A8823A] text-[#14100A] font-semibold text-xs tracking-wider uppercase hover:brightness-110 active:scale-95 transition-all shadow-md shadow-amber-500/20 cursor-pointer disabled:opacity-50 shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>{hi ? '+ नई PNG तस्वीर जोड़ें' : '+ Upload PNG Pose'}</span>
        </button>
      </div>

      {/* Status Messages */}
      {statusMessage && (
        <div
          className={`p-3.5 rounded-xl text-xs flex items-center gap-2 font-mono border ${
            statusMessage.type === 'success'
              ? 'bg-emerald-950/70 border-emerald-500/40 text-emerald-300'
              : 'bg-rose-950/70 border-rose-500/40 text-rose-300'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Upload Progress */}
      {uploading && (
        <div className="p-4 rounded-xl border border-amber-500/40 bg-amber-950/30 flex items-center gap-3 text-xs text-[#F1DFA8] font-mono">
          <RefreshCw className="w-4 h-4 animate-spin text-[#D4AF5F]" />
          <span>{uploadProgress || 'Connecting to Cloudinary CDN & Firestore...'}</span>
        </div>
      )}

      {/* Staged Upload Review Queue */}
      {stagedFiles.length > 0 && (
        <div className="p-5 rounded-2xl border-2 border-dashed border-[#D4AF5F]/50 bg-[#100E0A]/90 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Upload className="w-4 h-4 text-[#D4AF5F]" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                {hi ? 'अपलोड के लिए तैयार तस्वीरें' : 'Ready to Upload to Cloudinary'} (
                {stagedFiles.length})
              </h4>
            </div>
            <button
              type="button"
              onClick={handleUploadAllStaged}
              disabled={uploading}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-bold text-xs tracking-wider uppercase hover:brightness-110 active:scale-95 transition-all shadow-md shadow-emerald-500/20 cursor-pointer disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>{hi ? 'सभी अपलोड करें और सेव करें' : 'Upload All & Save'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {stagedFiles.map((staged, idx) => (
              <div
                key={idx}
                className="relative rounded-xl border border-white/10 bg-black/60 p-3 flex flex-col gap-2 overflow-hidden"
              >
                {/* Checkerboard container to confirm transparency */}
                <div
                  className="relative h-44 w-full rounded-lg overflow-hidden flex items-center justify-center p-2"
                  style={transparencyGridStyle}
                >
                  <img
                    src={staged.previewUrl}
                    alt={staged.title}
                    className="max-h-full max-w-full object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]"
                  />
                  <button
                    type="button"
                    onClick={() => removeStagedFile(idx)}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/80 hover:bg-rose-900/80 text-slate-400 hover:text-white transition"
                    title="Remove"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <input
                  type="text"
                  value={staged.title}
                  onChange={(e) => {
                    const val = e.target.value;
                    setStagedFiles((prev) => {
                      const copy = [...prev];
                      copy[idx].title = val;
                      return copy;
                    });
                  }}
                  placeholder="Pose Title (e.g. Standing Black Suit)"
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white font-mono focus:border-amber-400 focus:outline-none"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Images Management Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#D4AF5F]" />
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              {hi ? 'मौजूदा रॉयल PNG तस्वीरें' : 'Active Royal PNG Archive'} (
              {config.images.length})
            </h4>
          </div>

          {enabledImages.length > 1 && (
            <button
              type="button"
              onClick={() => {
                sound.playWarp();
                setTestSweepActive(true);
                setTimeout(() => {
                  setTestActiveIdx((prev) => (prev + 1) % enabledImages.length);
                  setTestSweepActive(false);
                }, 750);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-500/40 bg-amber-500/10 text-xs text-[#F1DFA8] hover:bg-amber-500/20 transition cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF5F]" />
              <span>{hi ? 'स्वीप टेस्ट करें' : 'Test Divine Sweep'}</span>
            </button>
          )}
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-[#9A8F7C] font-mono">
            <RefreshCw className="w-6 h-6 animate-spin text-[#D4AF5F] mx-auto mb-2" />
            <span>Loading Royal Identity Archive...</span>
          </div>
        ) : config.images.length === 0 ? (
          <div className="p-10 rounded-2xl border border-dashed border-[#D4AF5F]/30 bg-[#0C0B08]/60 text-center space-y-3">
            <Crown className="w-10 h-10 text-[#D4AF5F]/50 mx-auto" />
            <h5 className="text-sm font-semibold text-white">
              {hi ? 'अभी तक कोई रॉयल PNG तस्वीर नहीं जोड़ी गई है' : 'No Royal PNG Images in Archive'}
            </h5>
            <p className="text-xs text-[#9A8F7C] max-w-md mx-auto leading-relaxed">
              {hi
                ? 'अपनी पारदर्शी बैकग्राउंड (Transparent Background PNG) वाली तस्वीरें ऊपर दिए गए "+ नई PNG तस्वीर जोड़ें" बटन से अपलोड करें।'
                : 'Upload your full-body transparent PNG character portraits to unlock the Divine Light Sweep hero experience on the homepage.'}
            </p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/20 border border-amber-500/50 text-[#F1DFA8] text-xs font-semibold hover:bg-amber-500/30 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{hi ? 'पहली PNG तस्वीर जोड़ें' : 'Upload First PNG Pose'}</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {config.images.map((image, index) => {
              const isFirst = index === 0;
              const isLast = index === config.images.length - 1;
              const isActive = config.activeImageId === image.id;

              return (
                <div
                  key={image.id}
                  className={`rounded-2xl border transition-all p-4 flex flex-col justify-between gap-3 ${
                    isActive
                      ? 'border-[#D4AF5F] bg-gradient-to-br from-[#1A160E] to-[#0A0907] shadow-[0_0_25px_rgba(212,175,95,0.18)]'
                      : image.isEnabled
                        ? 'border-white/10 bg-[#0D0C09]/90 hover:border-amber-500/40'
                        : 'border-white/5 bg-black/40 opacity-60'
                  }`}
                >
                  <div className="flex gap-4">
                    {/* Preview with transparency checkerboard */}
                    <div
                      className="relative w-28 h-36 rounded-xl overflow-hidden shrink-0 flex items-center justify-center p-1.5 border border-white/10"
                      style={transparencyGridStyle}
                    >
                      <img
                        src={image.url}
                        alt={image.title}
                        className="max-h-full max-w-full object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.9)]"
                        loading="lazy"
                      />

                      {isActive && (
                        <span className="absolute top-1.5 left-1.5 flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-[#D4AF5F] text-[#0A0907] text-[9px] font-black uppercase tracking-wider shadow-md">
                          <Star className="w-2.5 h-2.5 fill-current" />
                          <span>Active</span>
                        </span>
                      )}

                      {!image.isEnabled && (
                        <span className="absolute inset-0 bg-black/75 backdrop-blur-[2px] flex items-center justify-center text-[10px] font-mono text-slate-400">
                          Disabled
                        </span>
                      )}
                    </div>

                    {/* Metadata & Controls */}
                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-mono text-[#D4AF5F]">
                            #{String(image.displayOrder).padStart(2, '0')}
                          </span>
                          <span
                            className={`text-[9px] px-2 py-0.5 rounded-full font-mono uppercase tracking-wider ${
                              image.isEnabled
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {image.isEnabled ? 'Enabled' : 'Disabled'}
                          </span>
                        </div>

                        {/* Title Input */}
                        <input
                          type="text"
                          defaultValue={image.title}
                          onBlur={(e) => handleUpdateTitle(image, e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              (e.target as HTMLInputElement).blur();
                            }
                          }}
                          placeholder="Pose Title"
                          className="mt-1.5 w-full bg-transparent border-b border-white/15 focus:border-amber-400 focus:outline-none text-xs text-white font-medium py-1"
                        />

                        <p className="mt-1 text-[10px] text-[#9A8F7C] font-mono truncate">
                          ID: {image.id}
                        </p>
                      </div>

                      {/* Action Bar */}
                      <div className="flex items-center justify-between pt-2 border-t border-white/10 mt-2">
                        {/* Order Controls */}
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleMoveImage(index, 'up')}
                            disabled={isFirst}
                            className="p-1.5 rounded-lg bg-black/60 hover:bg-white/10 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition"
                            title="Move Up"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveImage(index, 'down')}
                            disabled={isLast}
                            className="p-1.5 rounded-lg bg-black/60 hover:bg-white/10 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition"
                            title="Move Down"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Set Active / Enable / Replace / Delete */}
                        <div className="flex items-center gap-1.5">
                          {!isActive && image.isEnabled && (
                            <button
                              type="button"
                              onClick={() => handleSetActive(image)}
                              className="px-2 py-1 rounded-lg border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-[#F1DFA8] text-[10px] font-mono transition"
                              title="Set as Initial Active Pose"
                            >
                              Make Active
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleToggleEnable(image)}
                            className="p-1.5 rounded-lg bg-black/60 hover:bg-white/10 text-slate-300 transition"
                            title={image.isEnabled ? 'Disable' : 'Enable'}
                          >
                            {image.isEnabled ? (
                              <Eye className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <EyeOff className="w-3.5 h-3.5 text-slate-500" />
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleTriggerReplace(image.id)}
                            className="p-1.5 rounded-lg bg-black/60 hover:bg-amber-500/20 text-slate-300 hover:text-amber-300 transition"
                            title="Replace Image File"
                          >
                            <Upload className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(image)}
                            className="p-1.5 rounded-lg bg-black/60 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 transition"
                            title="Delete Image"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
