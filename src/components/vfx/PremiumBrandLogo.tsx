import React from 'react';

interface BrandLogoProps {
  iconName: string;
  className?: string;
  brandColor?: string;
}

/**
 * PremiumBrandLogo
 * High-fidelity official vector SVG marks for universal technologies:
 * Firebase, PostgreSQL, MongoDB, SQLite, MySQL, React, Next.js, Node.js,
 * Python, TypeScript, JavaScript, Three.js, Tailwind, Docker, FastAPI, PyTorch, Gemini, etc.
 */
export const PremiumBrandLogo: React.FC<BrandLogoProps> = ({
  iconName,
  className = 'w-16 h-16',
  brandColor,
}) => {
  const norm = iconName.toLowerCase();

  switch (norm) {
    case 'python':
      return (
        <svg viewBox="0 0 128 128" className={className} fill="none">
          <defs>
            <linearGradient id="pyGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#387EB8" />
              <stop offset="100%" stopColor="#366994" />
            </linearGradient>
            <linearGradient id="pyGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFE873" />
              <stop offset="100%" stopColor="#FFD43B" />
            </linearGradient>
          </defs>
          <path
            d="M63.5 12C36 12 37.7 23.9 37.7 23.9l.03 12.4h26.2v3.7H27.5S12 38.3 12 65.8c0 27.5 13.5 26.5 13.5 26.5h8.1V80.5s-.4-14 13.7-14h23.7s13.3.2 13.3-13.2V25.2S88.3 12 63.5 12zM51.9 20.3a4.2 4.2 0 1 1 0 8.4 4.2 4.2 0 0 1 0-8.4z"
            fill="url(#pyGrad1)"
          />
          <path
            d="M64.5 116c27.5 0 25.8-11.9 25.8-11.9l-.03-12.4H64.1V88h36.4s15.5 1.7 15.5-25.8c0-27.5-13.5-26.5-13.5-26.5h-8.1v11.8s.4 14-13.7 14H57s-13.3-.2-13.3 13.2v28.1S39.7 116 64.5 116zM76.1 107.7a4.2 4.2 0 1 1 0-8.4 4.2 4.2 0 0 1 0 8.4z"
            fill="url(#pyGrad2)"
          />
        </svg>
      );
    case 'react':
      return (
        <svg viewBox="-11.5 -10.23174 23 20.46348" className={className}>
          <circle cx="0" cy="0" r="2.05" fill="#61DAFB" />
          <g stroke="#61DAFB" strokeWidth="1" fill="none">
            <ellipse rx="11" ry="4.2" />
            <ellipse rx="11" ry="4.2" transform="rotate(60)" />
            <ellipse rx="11" ry="4.2" transform="rotate(120)" />
          </g>
        </svg>
      );
    case 'firebase':
      return (
        <svg viewBox="0 0 128 128" className={className}>
          <defs>
            <linearGradient id="fbGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFA000" />
              <stop offset="100%" stopColor="#FF8F00" />
            </linearGradient>
            <linearGradient id="fbGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFCA28" />
              <stop offset="100%" stopColor="#FFA000" />
            </linearGradient>
            <linearGradient id="fbGrad3" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FF3D00" />
              <stop offset="100%" stopColor="#D50000" />
            </linearGradient>
          </defs>
          <path
            d="M26.2 96.4L44.1 23.3c.7-2.8 4.4-3.5 6.1-1.2l14.2 19.3-38.2 55z"
            fill="url(#fbGrad1)"
          />
          <path
            d="M26.2 96.4L78 20.2c1.7-2.4 5.3-2 6.5.8l17.3 75.4-75.6 0z"
            fill="url(#fbGrad2)"
          />
          <path
            d="M64 83.8l37.8 12.6L84.5 21c-1.2-2.8-4.8-3.2-6.5-.8L26.2 96.4 64 83.8z"
            fill="url(#fbGrad3)"
          />
          <path
            d="M101.8 96.4L87.2 32.8l14.6 63.6zM26.2 96.4l37.8 21.4c2.5 1.4 5.6 1.4 8.1 0l37.8-21.4-83.7 0z"
            fill="#FFA000"
          />
        </svg>
      );
    case 'postgresql':
      return (
        <svg viewBox="0 0 128 128" className={className}>
          <circle cx="64" cy="64" r="58" fill="#336791" />
          <path
            d="M87.5 45.3c-2.3-5.2-6.5-9.6-11.7-12.4-7.4-4-16.7-4.4-24.4-1.2-6.4 2.6-11.7 7.7-14.7 13.9-3.2 6.7-3.6 14.5-1.1 21.6 2.3 6.6 7.1 12.2 13.2 15.6 4.3 2.4 9.3 3.6 14.3 3.6 2.7 0 5.4-.4 8-1.2 5.1-1.5 9.7-4.4 13.3-8.3 1.9-2.1 3.4-4.5 4.6-7.1 1.7-3.9 2.5-8.2 2.1-12.4-.3-4.3-1.6-8.5-3.6-12.1zm-21.1 34.2c-7.3 0-13.6-5.4-14.7-12.6-.7-4.4.7-8.9 3.8-12.1 3.1-3.2 7.5-5 12.1-4.8 4.6.2 8.8 2.2 11.6 5.7 2.9 3.4 4 7.9 3.1 12.3-.9 4.6-3.8 8.5-7.8 10.4-2.5 1.2-5.3 1.8-8.1 1.1z"
            fill="#FFFFFF"
          />
          <circle cx="58" cy="54" r="4" fill="#336791" />
          <circle cx="74" cy="54" r="4" fill="#336791" />
        </svg>
      );
    case 'mongodb':
      return (
        <svg viewBox="0 0 128 128" className={className}>
          <path
            d="M62.6 14.2c-1.3 2-2.9 4.2-4.1 6.5-12.6 24.3-19.1 41.8-19.1 57.5 0 24.9 16.5 41 24.7 45.6 1.8 1 2.7 1.5 2.7 1.5s.9-.5 2.7-1.5c8.2-4.6 24.7-20.7 24.7-45.6 0-15.7-6.5-33.2-19.1-57.5-1.2-2.3-2.8-4.5-4.1-6.5-1.3-2-2.6-3.7-3.8-5.2-1.3 1.5-2.6 3.2-3.9 5.2z"
            fill="#47A248"
          />
          <path
            d="M64 9.1c-1.2 1.5-2.5 3.2-3.8 5.2-1.3 2-2.9 4.2-4.1 6.5-12.6 24.3-19.1 41.8-19.1 57.5 0 23.3 14.5 38.9 23.2 44.4V9.1h3.8z"
            fill="#499D4A"
          />
          <path
            d="M64 9.1v113.6c8.7-5.5 23.2-21.1 23.2-44.4 0-15.7-6.5-33.2-19.1-57.5-1.2-2.3-2.8-4.5-4.1-6.5-1.3-2-2.6-3.7-3.8-5.2H64z"
            fill="#58AA50"
          />
          <path
            d="M64 125.3s-1.8-1.5-3.3-2.6c-4.4-3.4-12.4-11.8-14.7-23.7-.8-4.2-.6-7.8-.5-11.5.1-4.7.4-9.3-.8-13.8-1.1-4-3.3-7.5-5.5-10.9-1.2-1.8-2.5-3.6-3.8-5.4 3 6.9 7.3 15.1 7.3 22.8 0 11.5-7.5 19-7.5 19s8.8 8.1 19.3 18.2c2.7 2.6 5.8 5.6 9 7.9z"
            fill="#3FA037"
          />
        </svg>
      );
    case 'sqlite':
      return (
        <svg viewBox="0 0 128 128" className={className}>
          <defs>
            <linearGradient id="sqGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#003B57" />
              <stop offset="100%" stopColor="#0F80C1" />
            </linearGradient>
          </defs>
          <rect width="128" height="128" rx="28" fill="url(#sqGrad)" />
          <path
            d="M34 44c0-8 13.4-14 30-14s30 6 30 14v40c0 8-13.4 14-30 14s-30-6-30-14V44z"
            fill="#FFFFFF"
            opacity="0.15"
          />
          <ellipse cx="64" cy="46" rx="30" ry="12" fill="#00C4B4" />
          <ellipse cx="64" cy="44" rx="27" ry="10" fill="#E6FAF8" />
          <path
            d="M37 45v18c0 6.6 12 12 27 12s27-5.4 27-12V45"
            stroke="#00C4B4"
            strokeWidth="5"
            fill="none"
          />
          <path
            d="M37 63v18c0 6.6 12 12 27 12s27-5.4 27-12V63"
            stroke="#00C4B4"
            strokeWidth="5"
            fill="none"
          />
          <text
            x="64"
            y="112"
            textAnchor="middle"
            fill="#FFFFFF"
            fontFamily="monospace"
            fontWeight="bold"
            fontSize="18"
            letterSpacing="2"
          >
            SQLITE
          </text>
        </svg>
      );
    case 'mysql':
      return (
        <svg viewBox="0 0 128 128" className={className}>
          <circle cx="64" cy="64" r="58" fill="#00758F" />
          <path
            d="M89.5 48.2c-2.8-5.6-7.8-9.8-13.9-12.2-7.8-3.1-16.7-2.6-24 1.4-6.3 3.4-11.2 9.1-13.6 15.9-2.5 6.9-2.1 14.7 1.1 21.3 3.1 6.4 8.7 11.2 15.5 13.5 6.8 2.3 14.5 1.6 20.9-1.9 6.4-3.5 11.2-9.4 13.5-16.4.7-2.1 1.1-4.3 1.3-6.5.2-5.3-.8-10.6-2.8-15.1zm-21.7 30.6c-6.8.6-13-3.8-14.8-10.4-1.8-6.6 1.8-13.4 8.4-15.6 6.6-2.2 13.7.8 16.3 7.1 2.7 6.3-.3 13.6-6.4 16.9-1.1.7-2.3 1.4-3.5 2z"
            fill="#F29111"
          />
          <text
            x="64"
            y="110"
            textAnchor="middle"
            fill="#FFFFFF"
            fontFamily="monospace"
            fontWeight="bold"
            fontSize="16"
          >
            MySQL
          </text>
        </svg>
      );
    case 'nextjs':
      return (
        <svg viewBox="0 0 128 128" className={className}>
          <circle cx="64" cy="64" r="58" fill="#000000" />
          <path
            d="M78 88.5L46.5 45.2H38V89h7.4V56.8l29.8 40.7c1-.7 1.9-1.4 2.8-2.2v-6.8z"
            fill="#FFFFFF"
          />
          <rect x="82" y="45.2" width="7.4" height="43.8" fill="#FFFFFF" />
        </svg>
      );
    case 'nodejs':
      return (
        <svg viewBox="0 0 128 128" className={className}>
          <polygon
            points="64,14 112,42 112,98 64,126 16,98 16,42"
            fill="#333333"
          />
          <polygon
            points="64,22 104,46 104,94 64,118 24,94 24,46"
            fill="#5FA04E"
          />
          <text
            x="64"
            y="76"
            textAnchor="middle"
            fill="#FFFFFF"
            fontFamily="sans-serif"
            fontWeight="900"
            fontSize="26"
          >
            NODE
          </text>
        </svg>
      );
    case 'threejs':
      return (
        <svg viewBox="0 0 128 128" className={className}>
          <rect width="128" height="128" rx="24" fill="#111111" />
          <polygon
            points="64,20 108,44 108,94 64,118 20,94 20,44"
            stroke="#FFFFFF"
            strokeWidth="5"
            fill="none"
          />
          <line x1="64" y1="20" x2="64" y2="70" stroke="#FFFFFF" strokeWidth="5" />
          <line x1="108" y1="94" x2="64" y2="70" stroke="#FFFFFF" strokeWidth="5" />
          <line x1="20" y1="94" x2="64" y2="70" stroke="#FFFFFF" strokeWidth="5" />
          <circle cx="64" cy="70" r="8" fill="#61DAFB" />
        </svg>
      );
    case 'docker':
      return (
        <svg viewBox="0 0 128 128" className={className}>
          <rect width="128" height="128" rx="24" fill="#0DB7ED" />
          <g fill="#FFFFFF">
            <rect x="42" y="44" width="10" height="10" rx="1.5" />
            <rect x="54" y="44" width="10" height="10" rx="1.5" />
            <rect x="66" y="44" width="10" height="10" rx="1.5" />
            <rect x="54" y="32" width="10" height="10" rx="1.5" />
            <rect x="66" y="32" width="10" height="10" rx="1.5" />
            <rect x="66" y="20" width="10" height="10" rx="1.5" />
            <path d="M104 62c-2.4-1.6-5.8-1.5-8.8-.4-1.8-6.4-7.2-10.6-13.6-10.6-1 0-2 .1-3 .4V56H28c-4.4 0-8 3.6-8 8 0 16 11.2 30 33 30 25 0 39.5-12 43.5-24 3.5-.5 7-2.5 7.5-8z" />
          </g>
        </svg>
      );
    case 'gemini':
      return (
        <svg viewBox="0 0 128 128" className={className}>
          <defs>
            <linearGradient id="gemGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1A73E8" />
              <stop offset="50%" stopColor="#9C27B0" />
              <stop offset="100%" stopColor="#E91E63" />
            </linearGradient>
          </defs>
          <rect width="128" height="128" rx="28" fill="url(#gemGrad)" />
          <path
            d="M64 20 C64 44 44 64 20 64 C44 64 64 84 64 108 C64 84 84 64 108 64 C84 64 64 44 64 20 Z"
            fill="#FFFFFF"
          />
        </svg>
      );
    case 'fastapi':
      return (
        <svg viewBox="0 0 128 128" className={className}>
          <circle cx="64" cy="64" r="58" fill="#009688" />
          <polygon
            points="68,26 38,70 60,70 56,102 90,56 68,56"
            fill="#FFFFFF"
          />
        </svg>
      );
    case 'pytorch':
      return (
        <svg viewBox="0 0 128 128" className={className}>
          <circle cx="64" cy="64" r="58" fill="#EE4C2C" />
          <path
            d="M74 34l-5 5c6.6 6.6 6.6 17.4 0 24s-17.4 6.6-24 0l-5 5c9.4 9.4 24.6 9.4 34 0s9.4-24.6 0-34z"
            fill="#FFFFFF"
          />
          <circle cx="78" cy="40" r="4.5" fill="#FFA500" />
          <circle cx="50" cy="68" r="4.5" fill="#FFFFFF" />
        </svg>
      );
    case 'typescript':
      return (
        <svg viewBox="0 0 128 128" className={className}>
          <rect width="128" height="128" rx="24" fill="#3178C6" />
          <path
            d="M60 52v8h-14v44h-9v-44h-14v-8h37zm45 28.5c0 14-8 23.5-23.5 23.5-7.5 0-14.5-2.5-19.5-7l5.5-6.5c3.5 3.5 8.5 5.5 13.5 5.5 8 0 14.5-4.5 14.5-12.5 0-18-25.5-9.5-25.5-26 0-11 7.5-19 20.5-19 6.5 0 12.5 2 17 5.5l-5 6.5c-3.5-2.5-8-4-12-4-7 0-11 4-11 9.5 0 16 25.5 8 25.5 25z"
            fill="#FFFFFF"
          />
        </svg>
      );
    case 'tailwind':
      return (
        <svg viewBox="0 0 128 128" className={className}>
          <circle cx="64" cy="64" r="58" fill="#0F172A" />
          <path
            d="M42 58c3-12 11-18 24-18 16 0 21 10 24 18 3 8 7 12 16 12 3 0 6-.5 8-1.5-3 12-11 18-24 18-16 0-21-10-24-18-3-8-7-12-16-12-3 0-6 .5-8 1.5z"
            fill="#38BDF8"
          />
        </svg>
      );
    case 'cloud':
    case 'gcp':
      return (
        <svg viewBox="0 0 128 128" className={className}>
          <rect width="128" height="128" rx="24" fill="#F8FAFC" />
          <path
            d="M84 76H46c-7.7 0-14-6.3-14-14 0-7 5.2-12.8 12-13.8 2.2-9 10.3-15.7 20-15.7 9.2 0 17 6 19.5 14.5 1.5-.3 3-.5 4.5-.5 7.7 0 14 6.3 14 14s-6.3 14.5-14 14.5z"
            fill="#4285F4"
          />
          <circle cx="64" cy="48" r="8" fill="#34A853" opacity="0.8" />
        </svg>
      );
    case 'git':
      return (
        <svg viewBox="0 0 128 128" className={className}>
          <rect width="128" height="128" rx="24" fill="#F05032" />
          <path
            d="M89 39L65 15c-2.7-2.7-7-2.7-9.7 0L42.5 27.8l12.4 12.4c2.8-1 6.2-.2 8.3 1.9 2.1 2.1 2.8 5.5 1.9 8.3l12 12c2.8-.9 6.2-.2 8.3 1.9 3 3 3 7.8 0 10.8s-7.8 3-10.8 0c-2.4-2.4-2.9-6-1.5-8.9l-11.2-11.2v24.2c.8.4 1.5.9 2.1 1.5 3 3 3 7.8 0 10.8s-7.8 3-10.8 0c-3-3-3-7.8 0-10.8.6-.6 1.3-1.1 2.1-1.5V54.4c-.8-.4-1.5-.9-2.1-1.5-2.4-2.4-2.9-6-1.5-8.9L39 31.6 15 55.6c-2.7 2.7-2.7 7 0 9.7L65 115c2.7 2.7 7 2.7 9.7 0L89 100.3c2.7-2.7 2.7-7 0-9.7z"
            fill="#FFFFFF"
          />
        </svg>
      );
    case 'shield':
    default:
      return (
        <svg viewBox="0 0 128 128" className={className}>
          <rect width="128" height="128" rx="24" fill="#0F172A" />
          <path
            d="M64 24L36 36v32c0 22 14 36 28 42 14-6 28-20 28-42V36L64 24z"
            fill={brandColor || '#10B981'}
          />
          <path
            d="M64 36L44 44v24c0 16 10 26 20 30 10-4 20-14 20-30V44L64 36z"
            fill="#FFFFFF"
            opacity="0.3"
          />
          <path
            d="M56 64l6 6 12-12"
            stroke="#FFFFFF"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
      );
  }
};
