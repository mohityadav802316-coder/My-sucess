import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useLanguage } from '../../context/LanguageContext';
import { useImages } from '../../context/ImageContext';
import { sound } from '../audio/SoundEffects';
import {
  db,
  collection,
  addDoc,
  serverTimestamp,
  handleFirestoreError,
  OperationType,
} from '../../firebase';
import confetti from 'canvas-confetti';
import { MysticTextReveal } from '../vfx/MysticTextReveal';
import { MysticTiltCard } from '../vfx/MysticTiltCard';
import { BlackMagicSmoke } from '../vfx/BlackMagicSmoke';
import {
  Mail,
  Copy,
  Check,
  Send,
  Github,
  Instagram,
  MessageCircle,
  PhoneCall,
  ExternalLink,
  Sparkles,
  AlertCircle
} from 'lucide-react';

export const ContactSection: React.FC = () => {
  const { mode } = useLanguage();
  const { siteSettings } = useImages();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [lastSubmitTime, setLastSubmitTime] = useState<number>(0);

  const contactData = siteSettings.contact || {
    email: 'mohityadav802316@gmail.com',
    githubUrl: 'https://github.com',
    location: 'Bihar, India',
    locationHi: 'बिहार, भारत',
    responseAvailability: 'Open for learning collaborations and tech discussions',
    responseAvailabilityHi: 'तकनीकी सहयोग और चर्चा के लिए हमेशा उपलब्ध',
    whatsappNumber: '+918023160000',
    instagramUrl: 'https://instagram.com/mohityadav',
    phoneNumber: '',
    isPhonePublic: false,
  };

  const officialEmail = contactData.email || 'mohityadav802316@gmail.com';
  const whatsappNumber = contactData.whatsappNumber || '+918023160000';
  const instagramUrl = contactData.instagramUrl || 'https://instagram.com/mohityadav';
  const phoneNumber = contactData.phoneNumber || '';
  const isPhonePublic = contactData.isPhonePublic ?? false;

  const handleCopyEmail = () => {
    sound.playClick();
    navigator.clipboard.writeText(officialEmail);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2500);
  };

  const cleanWaNumber = whatsappNumber.replace(/[^0-9]/g, '');
  const cleanPhone = phoneNumber.replace(/[^0-9+]/g, '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    sound.playClick();
    setErrorMessage('');

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedMessage = message.trim();

    if (trimmedName.length < 2 || trimmedName.length > 100) {
      setErrorMessage(
        mode === 'hi'
          ? 'कृपया 2 से 100 वर्णों के बीच का नाम दर्ज करें।'
          : 'Please enter a valid name between 2 and 100 characters.'
      );
      return;
    }

    if (trimmedMessage.length < 2 || trimmedMessage.length > 2000) {
      setErrorMessage(
        mode === 'hi'
          ? 'कृपया 2 से 2000 वर्णों के बीच का संदेश दर्ज करें।'
          : 'Please enter a message between 2 and 2000 characters.'
      );
      return;
    }

    const now = Date.now();
    if (now - lastSubmitTime < 20000) {
      setErrorMessage(
        mode === 'hi'
          ? 'कृपया दूसरा संदेश भेजने से पहले 20 सेकंड प्रतीक्षा करें।'
          : 'Rate limit active: Please wait 20 seconds before transmitting another message.'
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const messagesRef = collection(db, 'messages');
      const payload: Record<string, any> = {
        name: trimmedName,
        message: trimmedMessage,
        createdAt: serverTimestamp(),
        read: false,
        archived: false,
        source: 'portfolio_contact_form',
      };

      if (trimmedEmail) {
        payload.email = trimmedEmail;
      }

      await addDoc(messagesRef, payload);
      sound.playSuccess();
      setSubmitSuccess(true);
      setLastSubmitTime(Date.now());
      setName('');
      setEmail('');
      setMessage('');

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#f59e0b', '#e11d48', '#fbbf24'],
      });
    } catch (err: any) {
      console.error('Error saving visitor message:', err);
      setErrorMessage(
        mode === 'hi'
          ? 'संदेश भेजने में विफल। कृपया सीधे ईमेल करें: ' + officialEmail
          : 'Transmission error. Please email directly to ' + officialEmail
      );
      try {
        handleFirestoreError(err, OperationType.CREATE, 'messages');
      } catch {}
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      id="contact"
      className="py-20 px-4 sm:px-6 lg:px-8 relative min-h-screen flex flex-col justify-center overflow-hidden select-none"
    >
      <div className="max-w-6xl mx-auto w-full space-y-12 relative z-10">
        {/* Header: Pure Unboxed Typography */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-2 text-left"
        >
          <div className="inline-flex items-center gap-2 text-xs font-mono tracking-widest text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>SCENE 09 • DIRECT CONTACT &amp; UPLINK</span>
          </div>

          <BlackMagicSmoke theme="crimson">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-cyber font-black tracking-wide text-white drop-shadow-[0_2px_20px_rgba(0,0,0,0.9)]">
              <MysticTextReveal
                text={mode === 'hi' ? 'सीधा संपर्क एवं सोशल लिंक्स' : 'Direct Contact & Social Uplink'}
                magicTheme="cyan"
                className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 via-amber-200 to-rose-300"
              />
            </h2>
          </BlackMagicSmoke>

          <BlackMagicSmoke theme="multi">
            <p className="text-sm sm:text-base font-mono text-cyan-200/90 max-w-2xl drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
              {mode === 'hi'
                ? 'व्हाट्सएप, इंस्टाग्राम या सीधे ईमेल से जुड़ें।'
                : 'Tap below to launch WhatsApp, Instagram, or direct Email for instant collaboration.'}
            </p>
          </BlackMagicSmoke>
        </motion.div>

        {/* Big Glowing Direct Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* WhatsApp Button */}
          <motion.a
            href={`https://wa.me/${cleanWaNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => sound.playClick()}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950/80 via-slate-950/90 to-emerald-950/60 border border-emerald-500/50 hover:border-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.25)] flex items-center justify-between group transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                <MessageCircle className="w-6 h-6" />
              </div>
              <div className="text-left">
                <h4 className="font-cyber font-bold text-white text-base group-hover:text-emerald-200 transition">
                  WhatsApp
                </h4>
                <p className="text-xs font-mono text-emerald-300/80">
                  {mode === 'hi' ? 'सीधा चैट शुरू करें' : 'Start Instant Chat'}
                </p>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-emerald-400 group-hover:translate-x-1 transition-transform" />
          </motion.a>

          {/* Instagram Button */}
          <motion.a
            href={instagramUrl.startsWith('http') ? instagramUrl : `https://instagram.com/${instagramUrl.replace('@', '')}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => sound.playClick()}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="p-5 rounded-2xl bg-gradient-to-br from-rose-950/80 via-slate-950/90 to-rose-950/60 border border-rose-500/50 hover:border-rose-400 shadow-[0_0_25px_rgba(244,63,94,0.25)] flex items-center justify-between group transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 group-hover:scale-110 transition-transform">
                <Instagram className="w-6 h-6" />
              </div>
              <div className="text-left">
                <h4 className="font-cyber font-bold text-white text-base group-hover:text-rose-200 transition">
                  Instagram
                </h4>
                <p className="text-xs font-mono text-rose-300/80">
                  {mode === 'hi' ? 'प्रोफ़ाइल देखें व DM करें' : 'Follow & DM Profile'}
                </p>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-rose-400 group-hover:translate-x-1 transition-transform" />
          </motion.a>

          {/* Email Button */}
          <motion.a
            href={`mailto:${officialEmail}`}
            onClick={() => sound.playClick()}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="p-5 rounded-2xl bg-gradient-to-br from-amber-950/80 via-slate-950/90 to-amber-950/60 border border-amber-500/50 hover:border-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.25)] flex items-center justify-between group transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                <Mail className="w-6 h-6" />
              </div>
              <div className="text-left">
                <h4 className="font-cyber font-bold text-white text-base group-hover:text-amber-200 transition">
                  Email
                </h4>
                <p className="text-xs font-mono text-amber-300/80 truncate max-w-[160px]">
                  {officialEmail}
                </p>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition-transform" />
          </motion.a>

          {/* Phone Button: ONLY displayed if admin enabled isPhonePublic */}
          {isPhonePublic && phoneNumber && (
            <motion.a
              href={`tel:${cleanPhone}`}
              onClick={() => sound.playClick()}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="p-5 rounded-2xl bg-gradient-to-br from-cyan-950/80 via-slate-950/90 to-cyan-950/60 border border-cyan-500/50 hover:border-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.25)] flex items-center justify-between group transition-all sm:col-span-2 lg:col-span-3"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                  <PhoneCall className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <h4 className="font-cyber font-bold text-white text-base group-hover:text-cyan-200 transition">
                    Direct Phone Call / फोन कॉल
                  </h4>
                  <p className="text-xs font-mono text-cyan-300/80">
                    {phoneNumber}
                  </p>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-cyan-400 group-hover:translate-x-1 transition-transform" />
            </motion.a>
          )}
        </div>

        {/* Private Message Form & Email Copy */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-4">
          <div className="lg:col-span-5 space-y-4 text-left">
            <MysticTiltCard
              glowTheme="cyan"
              className="p-6 bg-slate-950/70 backdrop-blur-xl border border-cyan-500/20 shadow-xl space-y-4"
            >
              <div className="space-y-2">
                <h3 className="font-cyber font-bold text-xl text-white">
                  {mode === 'hi' ? 'सीधा संपर्क चैनल' : 'Direct Uplink Channels'}
                </h3>
                <p className="text-xs text-slate-300 font-sans leading-relaxed">
                  {mode === 'hi' ? contactData.locationHi : contactData.location} • {mode === 'hi' ? contactData.responseAvailabilityHi : contactData.responseAvailability}
                </p>
              </div>

              {/* Copy Email Button */}
              <button
                onClick={handleCopyEmail}
                className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-xs font-mono text-cyan-300 flex items-center justify-between transition cursor-pointer"
              >
                <div className="flex items-center gap-2 truncate">
                  <Mail className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                  <span className="truncate">{officialEmail}</span>
                </div>
                <span className="text-[11px] text-amber-400 font-bold ml-2 flex items-center gap-1">
                  {copiedEmail ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedEmail ? (mode === 'hi' ? 'कॉपी हो गया!' : 'Copied!') : (mode === 'hi' ? 'कॉपी करें' : 'Copy')}</span>
                </span>
              </button>

              {contactData.githubUrl && (
                <a
                  href={contactData.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-xs font-mono text-slate-300 flex items-center justify-between transition"
                >
                  <div className="flex items-center gap-2">
                    <Github className="w-4 h-4 text-cyan-400" />
                    <span>GitHub Profile</span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
                </a>
              )}
            </MysticTiltCard>
          </div>

          {/* Direct Private Message Form */}
          <div className="lg:col-span-7">
            <MysticTiltCard
              glowTheme="gold"
              className="p-6 bg-slate-950/75 backdrop-blur-xl border border-amber-500/20 shadow-xl space-y-4"
            >
              <h3 className="font-cyber font-bold text-lg text-white text-left">
                {mode === 'hi' ? 'गोपनीय संदेश भेजें' : 'Transmit Encrypted Message'}
              </h3>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-300 text-xs font-mono flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {submitSuccess && (
                <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center gap-2">
                  <Check className="w-4 h-4 flex-shrink-0" />
                  <span>
                    {mode === 'hi'
                      ? 'संदेश सफलतापूर्वक प्राप्त हुआ! Mohit जल्द ही उत्तर देंगे।'
                      : 'Transmission received! Mohit will review and respond shortly.'}
                  </span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4 text-left">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-mono text-slate-300 uppercase block">
                      {mode === 'hi' ? 'नाम *' : 'Name *'}
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={mode === 'hi' ? 'आपका नाम' : 'Your Name'}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-amber-500 text-sm text-white placeholder-slate-600 outline-none"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-mono text-slate-300 uppercase block">
                      {mode === 'hi' ? 'ईमेल (वैकल्पिक)' : 'Email (Optional)'}
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@domain.com"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-amber-500 text-sm text-white placeholder-slate-600 outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-slate-300 uppercase block">
                    {mode === 'hi' ? 'संदेश *' : 'Message *'}
                  </label>
                  <textarea
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={
                      mode === 'hi'
                        ? 'प्रोजेक्ट सहयोग, तकनीकी प्रश्न या सुझाव लिखें...'
                        : 'Collaboration ideas, queries, or AI engineering discussion...'
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-amber-500 text-sm text-white placeholder-slate-600 outline-none resize-none font-sans"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 via-rose-500 to-cyan-500 hover:from-amber-400 hover:to-cyan-400 text-slate-950 font-cyber font-bold text-xs uppercase tracking-wider transition shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? (mode === 'hi' ? 'भेज रहा है...' : 'Transmitting...') : (mode === 'hi' ? 'संदेश भेजें' : 'Send Message')}</span>
                </button>
              </form>
            </MysticTiltCard>
          </div>
        </div>
      </div>
    </section>
  );
};
