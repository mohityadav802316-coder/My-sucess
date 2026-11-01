import React, { useState, useRef } from 'react';
import { motion, AnimatePresence, type Variants } from 'motion/react';
import confetti from 'canvas-confetti';
import { ArrowUpRight, Copy, Check } from 'lucide-react';
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

/* Fonts (index.html में एक बार):
   https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500&family=Inter:wght@400;500;600&display=swap */

const TOKENS = {
  '--gold': '#D4AF5F',
  '--gold-soft': '#F1DFA8',
  '--gold-deep': '#A8823A',
  '--text': '#F6F0E4',
  '--muted': '#9A8F7C',
  '--panel': '#0C0B09',
  '--line': 'rgba(212,175,95,0.2)',
  '--line-strong': 'rgba(212,175,95,0.55)',
} as React.CSSProperties;

const SERIF: React.CSSProperties = { fontFamily: '"Cormorant Garamond", Georgia, serif' };
const GOLD_TEXT: React.CSSProperties = {
  backgroundImage: 'linear-gradient(120deg, var(--gold-soft) 0%, var(--gold) 50%, var(--gold-deep) 100%)',
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  color: 'transparent',
};

const EASE = [0.22, 1, 0.36, 1] as const;
const rise: Variants = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE } },
};

const RATE_LIMIT_MS = 20000;

const DEFAULT_CONTACT = {
  email: 'mohityadav802316@gmail.com',
  githubUrl: 'https://github.com',
  location: 'Bihar, India',
  locationHi: 'बिहार, भारत',
  responseAvailability: 'Open for learning collaborations and tech discussions',
  responseAvailabilityHi: 'तकनीकी सहयोग और चर्चा के लिए हमेशा उपलब्ध',
  whatsappNumber: '+919153086540',
  instagramUrl: 'https://instagram.com/mohityadav',
  phoneNumber: '',
  isPhonePublic: false,
};

/* ============================ SMALL PARTS ============================ */
const Label: React.FC<{ children: React.ReactNode; htmlFor?: string; muted?: boolean }> = ({
  children,
  htmlFor,
  muted,
}) => (
  <label
    htmlFor={htmlFor}
    className="block text-[9px] font-semibold uppercase tracking-[0.3em]"
    style={{ color: muted ? 'var(--muted)' : 'var(--gold)' }}
  >
    {children}
  </label>
);

const ChannelRow: React.FC<{
  label: string;
  value: string;
  href: string;
  external?: boolean;
}> = ({ label, value, href, external = true }) => (
  <a
    href={href}
    {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    onClick={() => sound.playClick()}
    className="group flex items-center justify-between gap-4 border-b py-5 transition-colors"
    style={{ borderColor: 'var(--line)' }}
  >
    <div className="min-w-0">
      <span className="block text-[9px] font-semibold uppercase tracking-[0.3em]" style={{ color: 'var(--muted)' }}>
        {label}
      </span>
      <span
        className="mt-1 block truncate text-2xl font-normal transition-colors duration-300 group-hover:text-[color:var(--gold-soft)]"
        style={{ ...SERIF, color: 'var(--text)' }}
      >
        {value}
      </span>
    </div>
    <ArrowUpRight
      className="h-5 w-5 shrink-0 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
      style={{ color: 'var(--gold)' }}
      strokeWidth={1.4}
    />
  </a>
);

const inputCls =
  'w-full border-0 border-b bg-transparent px-0 py-3 text-base outline-none transition-colors placeholder:text-[color:var(--muted)]/60 focus:border-[color:var(--gold)]';

/* ================================ MAIN ================================ */
export const ContactSection: React.FC = () => {
  const { mode } = useLanguage();
  const { siteSettings } = useImages();
  const hi = mode === 'hi';
  const t = (en: string, h: string) => (hi ? h : en);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const lastSubmit = useRef(0);

  const c = { ...DEFAULT_CONTACT, ...(siteSettings.contact || {}) };
  const officialEmail = c.email || DEFAULT_CONTACT.email;
  const waNumber = (c.whatsappNumber || DEFAULT_CONTACT.whatsappNumber).replace(/[^0-9]/g, '');
  const insta = c.instagramUrl || DEFAULT_CONTACT.instagramUrl;
  const instaHref = insta.startsWith('http') ? insta : `https://instagram.com/${insta.replace('@', '')}`;
  const instaLabel = insta.replace(/^https?:\/\/(www\.)?instagram\.com\//, '@').replace(/\/$/, '');
  const phone = c.phoneNumber || '';
  const showPhone = Boolean(c.isPhonePublic && phone);

  const handleCopy = async () => {
    sound.playClick();
    try {
      await navigator.clipboard.writeText(officialEmail);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      /* clipboard blocked */
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    sound.playClick();
    setError('');
    setSuccess(false);

    const n = name.trim();
    const em = email.trim();
    const msg = message.trim();

    if (n.length < 2 || n.length > 100) {
      return setError(t('Please enter a name between 2 and 100 characters.', 'कृपया 2 से 100 वर्णों के बीच का नाम दर्ज करें।'));
    }
    if (msg.length < 2 || msg.length > 2000) {
      return setError(t('Please enter a message between 2 and 2000 characters.', 'कृपया 2 से 2000 वर्णों के बीच का संदेश दर्ज करें।'));
    }
    if (Date.now() - lastSubmit.current < RATE_LIMIT_MS) {
      return setError(t('Please wait 20 seconds before sending another message.', 'कृपया दूसरा संदेश भेजने से पहले 20 सेकंड प्रतीक्षा करें।'));
    }

    setSending(true);
    try {
      const payload: Record<string, unknown> = {
        name: n,
        message: msg,
        createdAt: serverTimestamp(),
        read: false,
        archived: false,
        source: 'portfolio_contact_form',
      };
      if (em) payload.email = em;

      await addDoc(collection(db, 'messages'), payload);

      sound.playSuccess();
      lastSubmit.current = Date.now();
      setSuccess(true);
      setName('');
      setEmail('');
      setMessage('');
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#D4AF5F', '#F1DFA8', '#A8823A'],
      });
    } catch (err) {
      console.error('Error saving visitor message:', err);
      setError(
        t(
          `Could not send your message. Please email me directly at ${officialEmail}`,
          `संदेश भेजा नहीं जा सका। कृपया सीधे ईमेल करें: ${officialEmail}`
        )
      );
      try {
        handleFirestoreError(err, OperationType.CREATE, 'messages');
      } catch {
        /* already logged */
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <section
      id="contact"
      style={TOKENS}
      className="relative overflow-hidden px-5 py-24 sm:px-8 sm:py-28 lg:px-10"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/2 h-[420px] w-[780px] -translate-x-1/2 opacity-[0.14] blur-[140px]"
        style={{ background: 'radial-gradient(circle, var(--gold) 0%, transparent 70%)' }}
      />

      <div className="relative mx-auto max-w-6xl">
        <motion.header
          variants={rise}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          className="mb-14 max-w-2xl sm:mb-16"
        >
          <span className="block text-[10px] font-semibold uppercase tracking-[0.3em]" style={{ color: 'var(--gold)' }}>
            {t('Contact', 'संपर्क')}
          </span>
          <h2 className="mt-4 text-4xl font-light leading-[1.05] sm:text-5xl lg:text-6xl" style={{ ...SERIF, ...GOLD_TEXT }}>
            {t("Let's talk", 'बात करते हैं')}
          </h2>
          <p className="mt-5 text-base leading-relaxed" style={{ color: 'var(--muted)' }}>
            {t(
              'WhatsApp, Instagram or email, whichever is easiest for you.',
              'व्हाट्सएप, इंस्टाग्राम या ईमेल, जो आपके लिए आसान हो।'
            )}
          </p>
        </motion.header>

        <div className="grid grid-cols-1 gap-14 lg:grid-cols-12 lg:gap-16">
          {/* ---------- Channels ---------- */}
          <motion.div
            variants={rise}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-40px' }}
            className="lg:col-span-5"
          >
            <div className="border-t" style={{ borderColor: 'var(--line)' }}>
              <ChannelRow label="WhatsApp" value={t('Start a chat', 'चैट शुरू करें')} href={`https://wa.me/${waNumber}`} />
              <ChannelRow label="Instagram" value={instaLabel || 'Instagram'} href={instaHref} />
              <ChannelRow label={t('Email', 'ईमेल')} value={officialEmail} href={`mailto:${officialEmail}`} external={false} />
              {showPhone && (
                <ChannelRow label={t('Phone', 'फ़ोन')} value={phone} href={`tel:${phone.replace(/[^0-9+]/g, '')}`} external={false} />
              )}
              {c.githubUrl && <ChannelRow label="GitHub" value={t('View profile', 'प्रोफ़ाइल देखें')} href={c.githubUrl} />}
            </div>

            <div className="mt-8 space-y-4">
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-2.5 rounded-full border px-5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.22em] transition-colors cursor-pointer hover:text-[color:var(--gold-soft)]"
                style={{ borderColor: 'var(--line-strong)', color: copied ? 'var(--gold-soft)' : 'var(--text)' }}
              >
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" strokeWidth={1.5} />}
                {copied ? t('Email copied', 'ईमेल कॉपी हुआ') : t('Copy email', 'ईमेल कॉपी करें')}
              </button>

              <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>
                {hi ? c.locationHi : c.location}
                <span className="mx-2" style={{ color: 'var(--line-strong)' }}>/</span>
                {hi ? c.responseAvailabilityHi : c.responseAvailability}
              </p>
            </div>
          </motion.div>

          {/* ---------- Form ---------- */}
          <motion.div
            variants={rise}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-40px' }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-7"
          >
            <div
              className="rounded-[26px] border p-7 sm:p-10"
              style={{
                background: 'var(--panel)',
                borderColor: 'var(--line-strong)',
                boxShadow: '0 40px 100px -40px #000, 0 0 70px -40px rgba(212,175,95,0.35)',
              }}
            >
              <h3 className="text-3xl font-light" style={{ ...SERIF, color: 'var(--text)' }}>
                {t('Send a message', 'संदेश भेजें')}
              </h3>

              <AnimatePresence mode="wait">
                {(error || success) && (
                  <motion.p
                    key={error ? 'err' : 'ok'}
                    role={error ? 'alert' : 'status'}
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-5 border-l-2 py-1 pl-4 text-sm leading-relaxed"
                    style={{
                      borderColor: error ? '#C9695C' : 'var(--gold)',
                      color: error ? '#E7A89F' : 'var(--gold-soft)',
                    }}
                  >
                    {error ||
                      t('Message received. Mohit will reply soon.', 'संदेश मिल गया। मोहित जल्द ही उत्तर देंगे।')}
                  </motion.p>
                )}
              </AnimatePresence>

              <form onSubmit={handleSubmit} className="mt-7 space-y-7">
                <div className="grid grid-cols-1 gap-7 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="c-name">{t('Name', 'नाम')} *</Label>
                    <input
                      id="c-name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={t('Your name', 'आपका नाम')}
                      required
                      className={inputCls}
                      style={{ borderColor: 'var(--line)', color: 'var(--text)' }}
                    />
                  </div>
                  <div>
                    <Label htmlFor="c-email">{t('Email (optional)', 'ईमेल (वैकल्पिक)')}</Label>
                    <input
                      id="c-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@domain.com"
                      className={inputCls}
                      style={{ borderColor: 'var(--line)', color: 'var(--text)' }}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="c-msg">{t('Message', 'संदेश')} *</Label>
                  <textarea
                    id="c-msg"
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={t('Project ideas, questions or feedback', 'प्रोजेक्ट के विचार, सवाल या सुझाव')}
                    required
                    className={`${inputCls} resize-none`}
                    style={{ borderColor: 'var(--line)', color: 'var(--text)' }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={sending}
                  className="w-full rounded-full py-4 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#14100A] transition-all hover:brightness-110 active:scale-[0.99] disabled:opacity-50 cursor-pointer shadow-[0_8px_30px_rgba(212,175,95,0.28)]"
                  style={{ background: 'linear-gradient(120deg, var(--gold-soft), var(--gold))' }}
                >
                  {sending ? t('Sending...', 'भेज रहा है...') : t('Send Message', 'संदेश भेजें')}
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
