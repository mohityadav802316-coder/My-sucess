import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useLanguage } from '../../context/LanguageContext';
import { sound } from '../audio/SoundEffects';
import {
  db,
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  handleFirestoreError,
  OperationType,
} from '../../firebase';
import { GuestbookEntry } from '../../types';
import { MysticTextReveal } from '../vfx/MysticTextReveal';
import { MysticTiltCard } from '../vfx/MysticTiltCard';
import { BlackMagicSmoke } from '../vfx/BlackMagicSmoke';
import confetti from 'canvas-confetti';
import {
  MessageSquareHeart,
  Send,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Quote
} from 'lucide-react';

const BLOCKED_WORDS = [
  'abuse', 'bastard', 'bitch', 'asshole', 'fuck', 'shit', 'scam', 'spam',
  'chutiya', 'madarchod', 'bhenchod', 'gandu', 'kutta', 'harami', 'saale'
];

export const GuestbookSection: React.FC = () => {
  const { mode } = useLanguage();
  const [entries, setEntries] = useState<GuestbookEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successNotice, setSuccessNotice] = useState(false);
  const [errorNotice, setErrorNotice] = useState('');

  // Fetch approved messages in real-time
  useEffect(() => {
    try {
      const q = query(
        collection(db, 'guestbook'),
        where('status', '==', 'approved')
      );
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const list: GuestbookEntry[] = [];
          snapshot.forEach((d) => {
            const data = d.data();
            list.push({
              id: d.id,
              name: data.name,
              message: data.message,
              status: data.status,
              createdAt: data.createdAt,
              reviewedAt: data.reviewedAt,
            });
          });
          // Sort newest first
          list.sort((a, b) => {
            const tA = a.createdAt?.seconds ? a.createdAt.seconds * 1000 : 0;
            const tB = b.createdAt?.seconds ? b.createdAt.seconds * 1000 : 0;
            return tB - tA;
          });
          setEntries(list);
          setLoading(false);
        },
        (err) => {
          console.warn('Guestbook fetch notice:', err);
          setLoading(false);
        }
      );
      return () => unsubscribe();
    } catch {
      setLoading(false);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    sound.playClick();
    setErrorNotice('');
    setSuccessNotice(false);

    const trimmedName = name.trim();
    const trimmedMessage = message.trim();

    // Validation
    if (trimmedName.length < 2 || trimmedName.length > 50) {
      setErrorNotice(
        mode === 'hi'
          ? 'कृपया 2 से 50 वर्णों के बीच का नाम दर्ज करें।'
          : 'Please enter a name between 2 and 50 characters.'
      );
      return;
    }
    if (trimmedMessage.length < 2 || trimmedMessage.length > 150) {
      setErrorNotice(
        mode === 'hi'
          ? 'संदेश 2 से 150 वर्णों के बीच होना चाहिए।'
          : 'Message must be between 2 and 150 characters.'
      );
      return;
    }

    // Profanity check
    const combined = `${trimmedName} ${trimmedMessage}`.toLowerCase();
    const hasProfanity = BLOCKED_WORDS.some((word) => combined.includes(word));
    if (hasProfanity) {
      setErrorNotice(
        mode === 'hi'
          ? 'कृपया सम्मानजनक और शालीन भाषा का प्रयोग करें।'
          : 'Please use respectful and constructive language.'
      );
      return;
    }

    // Rate limit check (60 seconds per device)
    const lastPost = localStorage.getItem('guestbook_last_post');
    const now = Date.now();
    if (lastPost && now - parseInt(lastPost, 10) < 60000) {
      const waitSec = Math.ceil((60000 - (now - parseInt(lastPost, 10))) / 1000);
      setErrorNotice(
        mode === 'hi'
          ? `दर सीमा: कृपया अगला संदेश भेजने से पहले ${waitSec} सेकंड प्रतीक्षा करें।`
          : `Rate limit: Please wait ${waitSec}s before leaving another note.`
      );
      return;
    }

    setSubmitting(true);
    try {
      await addDoc(collection(db, 'guestbook'), {
        name: trimmedName,
        message: trimmedMessage,
        status: 'pending',
        createdAt: serverTimestamp(),
        deviceToken: `device_${Math.random().toString(36).substring(2, 9)}`,
      });

      localStorage.setItem('guestbook_last_post', now.toString());
      sound.playSuccess();
      setSuccessNotice(true);
      setName('');
      setMessage('');

      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.8 },
        colors: ['#a855f7', '#f59e0b', '#06b6d4'],
      });
    } catch (err: any) {
      console.error('Guestbook submit error:', err);
      setErrorNotice(
        mode === 'hi'
          ? 'संदेश सबमिट करने में त्रुटि। कृपया पुनः प्रयास करें।'
          : 'Error submitting message. Please retry shortly.'
      );
      try {
        handleFirestoreError(err, OperationType.CREATE, 'guestbook');
      } catch {}
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section
      id="guestbook"
      className="py-20 px-4 sm:px-6 lg:px-8 relative min-h-screen flex flex-col justify-center overflow-hidden select-none"
    >
      <div className="max-w-5xl mx-auto w-full space-y-12 relative z-10">
        {/* Header: Pure Unboxed Typography */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-2 text-left"
        >
          <div className="inline-flex items-center gap-2 text-xs font-mono tracking-widest text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]">
            <MessageSquareHeart className="w-3.5 h-3.5 text-purple-400" />
            <span>SCENE 08 • VISITOR GUESTBOOK</span>
          </div>

          <BlackMagicSmoke theme="crimson">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-cyber font-black tracking-wide text-white drop-shadow-[0_2px_20px_rgba(0,0,0,0.9)]">
              <MysticTextReveal
                text={mode === 'hi' ? 'आगंतुक गेस्टबुक (Guestbook)' : 'Visitor Nexus Guestbook'}
                magicTheme="gold"
                className="text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-rose-200 to-amber-300"
              />
            </h2>
          </BlackMagicSmoke>

          <BlackMagicSmoke theme="multi">
            <p className="text-sm sm:text-base font-mono text-purple-200/90 max-w-2xl drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
              {mode === 'hi'
                ? 'एक संक्षिप्त उत्साहवर्धक संदेश छोड़ें (अधिकतम 150 वर्ण)। Admin अनुमोदन के बाद यह सार्वजनिक रूप से दिखाई देगा।'
                : 'Leave a brief encouraging message or note (max 150 chars). Notes appear publicly once approved by Mohit.'}
            </p>
          </BlackMagicSmoke>
        </motion.div>

        {/* Content Layout: Form & Approved Messages Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Form Box */}
          <div className="lg:col-span-5">
            <MysticTiltCard
              glowTheme="gold"
              className="p-6 bg-slate-950/75 backdrop-blur-xl border border-purple-500/30 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="font-cyber font-bold text-sm text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>{mode === 'hi' ? 'संदेश लिखें' : 'Leave a Note'}</span>
                </span>
                <span className="text-[10px] font-mono text-purple-400">
                  {150 - message.length} {mode === 'hi' ? 'वर्ण शेष' : 'chars left'}
                </span>
              </div>

              {errorNotice && (
                <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-300 text-xs font-mono flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorNotice}</span>
                </div>
              )}

              {successNotice && (
                <div className="p-3 rounded-xl bg-purple-950/80 border border-purple-500/40 text-purple-200 text-xs font-mono flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
                  <span>
                    {mode === 'hi'
                      ? 'धन्यवाद! आपका संदेश Admin समीक्षा के लिए भेजा गया है।'
                      : 'Thank you! Your note is submitted for Admin review.'}
                  </span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4 text-left">
                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-slate-300 uppercase block">
                    {mode === 'hi' ? 'आपका नाम' : 'Your Name'}
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={50}
                    placeholder={mode === 'hi' ? 'उदा. राहुल कुमार' : 'e.g., Alex Carter'}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900/90 border border-slate-800 focus:border-purple-500 text-sm text-white placeholder-slate-600 outline-none"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-slate-300 uppercase block">
                    {mode === 'hi' ? 'संक्षिप्त संदेश (अधिकतम 150 वर्ण)' : 'Short Message (Max 150 chars)'}
                  </label>
                  <textarea
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    maxLength={150}
                    placeholder={
                      mode === 'hi'
                        ? 'शानदार 3D पोर्टफोलियो! AI यात्रा के लिए शुभकामनाएं।'
                        : 'Great 3D portfolio! Best wishes for your AI journey.'
                    }
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900/90 border border-slate-800 focus:border-purple-500 text-sm text-white placeholder-slate-600 outline-none resize-none font-sans"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-rose-500 to-amber-500 hover:from-purple-500 hover:to-amber-400 text-slate-950 font-cyber font-bold text-xs uppercase tracking-wider transition shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submitting ? (mode === 'hi' ? 'भेज रहा है...' : 'Sending...') : (mode === 'hi' ? 'संदेश भेजें' : 'Transmit Note')}</span>
                </button>

                <p className="text-[10px] font-mono text-slate-500 text-center">
                  {mode === 'hi' ? 'ईमेल या फोन नंबर की आवश्यकता नहीं है।' : 'No email or phone number required.'}
                </p>
              </form>
            </MysticTiltCard>
          </div>

          {/* Approved Messages Display */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-purple-300 flex items-center gap-1.5 uppercase tracking-wider">
                <Quote className="w-3.5 h-3.5 text-purple-400" />
                <span>{mode === 'hi' ? 'स्वीकृत संदेश' : 'Approved Visitor Notes'} ({entries.length})</span>
              </span>
            </div>

            {loading ? (
              <div className="p-8 text-center text-xs font-mono text-slate-500">
                {mode === 'hi' ? 'संदेश लोड हो रहे हैं...' : 'Loading guestbook notes...'}
              </div>
            ) : entries.length === 0 ? (
              <div className="p-10 rounded-2xl bg-slate-950/40 border border-dashed border-purple-500/20 text-center space-y-2">
                <Sparkles className="w-6 h-6 text-purple-400/60 mx-auto" />
                <p className="text-xs font-mono text-slate-400">
                  {mode === 'hi' ? 'पहला संदेश छोड़कर शुरुआत करें!' : 'No public notes yet. Be the first to leave one!'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[480px] overflow-y-auto pr-1">
                {entries.map((entry, idx) => (
                  <motion.div
                    key={entry.id || idx}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: idx * 0.04 }}
                    className="p-4 rounded-xl bg-slate-950/70 border border-purple-500/20 hover:border-purple-400/50 backdrop-blur-md space-y-2 relative group transition-colors shadow-md text-left"
                  >
                    <div className="flex items-center justify-between text-[11px] font-mono text-amber-300">
                      <span className="font-cyber font-bold text-white group-hover:text-amber-200 transition">
                        {entry.name}
                      </span>
                      <span className="text-[10px] text-purple-400/80">
                        {entry.createdAt?.seconds
                          ? new Date(entry.createdAt.seconds * 1000).toLocaleDateString()
                          : ''}
                      </span>
                    </div>
                    <p className="text-xs text-slate-200 font-sans leading-relaxed">
                      "{entry.message}"
                    </p>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
