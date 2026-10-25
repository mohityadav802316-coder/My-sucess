import React, { useState } from 'react';
import { useImages } from '../../context/ImageContext';
import { sound } from '../audio/SoundEffects';
import { ContactSettings } from '../../types';
import {
  Mail,
  Save,
  CheckCircle2,
  Github,
  Instagram,
  MessageCircle,
  PhoneCall,
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';

export const AdminContactManager: React.FC = () => {
  const { siteSettings, updateSiteSettings } = useImages();
  const contact = siteSettings.contact;

  const [formData, setFormData] = useState<ContactSettings>({
    email: contact?.email || 'mohityadav802316@gmail.com',
    githubUrl: contact?.githubUrl || 'https://github.com',
    telegramUrl: contact?.telegramUrl || '',
    linkedinUrl: contact?.linkedinUrl || '',
    twitterUrl: contact?.twitterUrl || '',
    location: contact?.location || 'Bihar, India',
    locationHi: contact?.locationHi || 'बिहार, भारत',
    responseAvailability: contact?.responseAvailability || 'Open for learning collaborations and tech discussions',
    responseAvailabilityHi: contact?.responseAvailabilityHi || 'तकनीकी सहयोग और चर्चा के लिए हमेशा उपलब्ध',
    whatsappNumber: contact?.whatsappNumber || '+918023160000',
    instagramUrl: contact?.instagramUrl || 'https://instagram.com/mohityadav',
    phoneNumber: contact?.phoneNumber || '',
    isPhonePublic: contact?.isPhonePublic ?? false,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const handleSave = async () => {
    sound.playClick();
    setIsSaving(true);
    setSaveStatus(null);
    try {
      await updateSiteSettings({
        contact: formData,
      });
      sound.playSuccess();
      setSaveStatus('Contact & social channels saved & synchronized!');
      setTimeout(() => setSaveStatus(null), 3500);
    } catch (err: any) {
      sound.playAlert();
      setSaveStatus(`Failed to save: ${err.message || 'Error occurred'}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-800">
        <div>
          <h3 className="font-cyber font-bold text-xl text-white flex items-center gap-2">
            <Mail className="w-5 h-5 text-cyan-400" />
            <span>Contact &amp; Social Uplink Manager / संपर्क चैनल</span>
          </h3>
          <p className="text-xs font-mono text-gray-400 mt-1">
            Manage your official email, WhatsApp, Instagram, and phone visibility options.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-gray-950 font-cyber font-bold text-xs uppercase tracking-wider transition shadow-lg shadow-cyan-500/25 flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Synchronizing...' : 'Save & Publish Contact'}</span>
        </button>
      </div>

      {saveStatus && (
        <div className={`p-3.5 rounded-xl text-xs font-mono flex items-center gap-2 ${
          saveStatus.includes('Failed')
            ? 'bg-red-950/80 border border-red-500/50 text-red-300'
            : 'bg-emerald-950/80 border border-emerald-500/50 text-emerald-300'
        }`}>
          {saveStatus.includes('Failed') ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
          <span>{saveStatus}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* WhatsApp */}
        <div className="space-y-2">
          <label className="text-xs font-mono text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
            <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>WhatsApp Number (Country Code + Number)</span>
          </label>
          <input
            type="text"
            value={formData.whatsappNumber || ''}
            onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl bg-gray-900 border border-gray-800 focus:border-emerald-500 text-emerald-300 font-mono text-sm outline-none"
            placeholder="+918023160000"
          />
          <p className="text-[10px] font-mono text-gray-500">
            Opens direct WhatsApp chat with this number when users click the button.
          </p>
        </div>

        {/* Instagram */}
        <div className="space-y-2">
          <label className="text-xs font-mono text-rose-300 uppercase tracking-wider flex items-center gap-1.5">
            <Instagram className="w-3.5 h-3.5 text-rose-400" />
            <span>Instagram URL or Username</span>
          </label>
          <input
            type="text"
            value={formData.instagramUrl || ''}
            onChange={(e) => setFormData({ ...formData, instagramUrl: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl bg-gray-900 border border-gray-800 focus:border-rose-500 text-rose-300 font-mono text-sm outline-none"
            placeholder="https://instagram.com/mohityadav or @mohityadav"
          />
          <p className="text-[10px] font-mono text-gray-500">
            Opens your Instagram profile directly in the app or browser.
          </p>
        </div>

        {/* Email */}
        <div className="space-y-2">
          <label className="text-xs font-mono text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-amber-400" />
            <span>Official Contact Email</span>
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl bg-gray-900 border border-gray-800 focus:border-amber-500 text-amber-300 font-mono text-sm outline-none"
            placeholder="mohityadav802316@gmail.com"
          />
        </div>

        {/* GitHub */}
        <div className="space-y-2">
          <label className="text-xs font-mono text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
            <Github className="w-3.5 h-3.5 text-cyan-400" />
            <span>GitHub Profile URL</span>
          </label>
          <input
            type="url"
            value={formData.githubUrl}
            onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl bg-gray-900 border border-gray-800 focus:border-cyan-500 text-gray-200 font-mono text-sm outline-none"
            placeholder="https://github.com/..."
          />
        </div>

        {/* Phone Number & Public Visibility Toggle */}
        <div className="space-y-2 md:col-span-2 p-4 rounded-xl bg-gray-900/60 border border-gray-800 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <label className="text-xs font-mono text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                <PhoneCall className="w-3.5 h-3.5 text-cyan-400" />
                <span>Personal Phone Number / फ़ोन नंबर</span>
              </label>
              <p className="text-[11px] font-mono text-gray-400 mt-0.5">
                Admin visibility controls whether this phone number is public on the website.
              </p>
            </div>
            {/* Toggle Switch */}
            <button
              type="button"
              onClick={() => setFormData({ ...formData, isPhonePublic: !formData.isPhonePublic })}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono flex items-center gap-2 cursor-pointer transition ${
                formData.isPhonePublic
                  ? 'bg-emerald-950 border border-emerald-500 text-emerald-300'
                  : 'bg-gray-800 border border-gray-700 text-gray-400'
              }`}
            >
              {formData.isPhonePublic ? <Eye className="w-3.5 h-3.5 text-emerald-400" /> : <EyeOff className="w-3.5 h-3.5" />}
              <span>{formData.isPhonePublic ? 'Status: PUBLIC (Visible on Website)' : 'Status: PRIVATE (Hidden from Website)'}</span>
            </button>
          </div>
          <input
            type="tel"
            value={formData.phoneNumber || ''}
            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 focus:border-cyan-500 text-cyan-300 font-mono text-sm outline-none"
            placeholder="+91..."
          />
        </div>

        {/* Location EN */}
        <div className="space-y-2">
          <label className="text-xs font-mono text-gray-300 uppercase tracking-wider block">
            Location (EN)
          </label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl bg-gray-900 border border-gray-800 focus:border-cyan-500 text-gray-200 text-sm outline-none"
            placeholder="Bihar, India"
          />
        </div>

        {/* Location HI */}
        <div className="space-y-2">
          <label className="text-xs font-mono text-gray-300 uppercase tracking-wider block">
            Location in Hindi (स्थान)
          </label>
          <input
            type="text"
            value={formData.locationHi}
            onChange={(e) => setFormData({ ...formData, locationHi: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl bg-gray-900 border border-gray-800 focus:border-cyan-500 text-gray-200 text-sm outline-none font-sans"
            placeholder="बिहार, भारत"
          />
        </div>
      </div>
    </div>
  );
};
