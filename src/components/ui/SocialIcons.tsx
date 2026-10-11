import React from 'react';

/**
 * Authentic, Standalone Official Social Media Brand Icons
 * Rendered with official brand shapes, colors, and high contrast for dark backgrounds.
 * - Google Gmail: Official M logo on clean white base
 * - WhatsApp: Official vibrant green badge with white handset
 * - Facebook: Official blue circle with white bold 'f'
 * - Instagram: Official vivid sunset gradient squircle with white camera
 * - LinkedIn: Official cobalt blue squircle with white 'in'
 */

export const OfficialGmailIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg viewBox="0 0 32 32" className={className} xmlns="http://www.w3.org/2000/svg" aria-label="Gmail">
    {/* Crisp white rounded base so the multi-colored Google M is immediately visible & clear on dark backgrounds */}
    <rect width="32" height="32" rx="7" fill="#FFFFFF" />
    <g transform="translate(3.5, 4.5) scale(0.52)">
      <path fill="#4caf50" d="M45,16.2l-5,2.75l-5,4.75L35,40h7c1.657,0,3-1.343,3-3V16.2z"/>
      <path fill="#1e88e5" d="M3,16.2l3.614,1.71L13,23.7V40H6c-1.657,0-3-1.343-3-3V16.2z"/>
      <polygon fill="#e53935" points="35,11.2 24,19.45 13,11.2 12,17 13,23.7 24,31.95 35,23.7 36,17"/>
      <path fill="#c62828" d="M3,12.298V16.2l10,7.5V11.2L9.876,8.859C8.132,7.551,5.638,8.085,4.512,9.988L3,12.298z"/>
      <path fill="#fbc02d" d="M45,12.298V16.2l-10,7.5V11.2l3.124-2.341c1.744-1.308,4.238-0.774,5.364,1.129L45,12.298z"/>
    </g>
  </svg>
);

export const OfficialWhatsAppIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg viewBox="0 0 32 32" className={className} xmlns="http://www.w3.org/2000/svg" aria-label="WhatsApp">
    <circle cx="16" cy="16" r="16" fill="#25D366" />
    <path
      fill="#FFFFFF"
      fillRule="evenodd"
      d="M16 6.5C10.75 6.5 6.5 10.75 6.5 16c0 1.68.44 3.32 1.28 4.77L6.5 25.5l4.87-1.28A9.45 9.45 0 0 0 16 25.5c5.25 0 9.5-4.25 9.5-9.5S21.25 6.5 16 6.5zm5.55 13.43c-.23.65-1.15 1.25-1.88 1.41-.5.11-1.15.2-3.35-.71-2.82-1.16-4.63-4.04-4.77-4.23-.14-.19-1.14-1.52-1.14-2.9 0-1.38.72-2.06.98-2.34.26-.28.57-.35.76-.35.19 0 .38 0 .55.01.18.01.42-.07.66.5.24.58.82 2 .89 2.15.07.14.12.31.02.5-.1.19-.15.3-.3.47-.14.18-.3.39-.43.53-.14.14-.29.3-.12.59.17.29.74 1.22 1.59 1.98 1.09.97 2.01 1.27 2.3 1.41.29.14.46.12.63-.07.17-.19.74-.86.94-1.16.2-.29.39-.24.66-.14.26.1 1.68.79 1.97.94.29.14.48.22.55.33.07.12.07.7-.16 1.35z"
    />
  </svg>
);

export const OfficialFacebookIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg viewBox="0 0 32 32" className={className} xmlns="http://www.w3.org/2000/svg" aria-label="Facebook">
    <circle cx="16" cy="16" r="16" fill="#1877F2" />
    <path
      fill="#FFFFFF"
      d="M21.25 16.5l.62-4.04h-3.88v-2.62c0-1.11.54-2.19 2.29-2.19h1.77V4.21s-1.61-.27-3.15-.27c-3.21 0-5.31 1.95-5.31 5.47v3.09h-3.55v4.04h3.55V26.6a16.14 16.14 0 0 0 4.4 0V16.5h3.26z"
    />
  </svg>
);

export const OfficialInstagramIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg viewBox="0 0 32 32" className={className} xmlns="http://www.w3.org/2000/svg" aria-label="Instagram">
    <defs>
      <linearGradient id="footer-ig-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#fdf497" />
        <stop offset="5%" stopColor="#fdf497" />
        <stop offset="45%" stopColor="#fd5949" />
        <stop offset="60%" stopColor="#d6249f" />
        <stop offset="90%" stopColor="#285AEB" />
      </linearGradient>
    </defs>
    <rect width="32" height="32" rx="7.5" fill="url(#footer-ig-gradient)" />
    <g transform="translate(4, 4) scale(0.75)">
      <path
        fill="#FFFFFF"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M16 4c3.9 0 4.37.02 5.92.08 1.43.07 2.21.3 2.73.5.68.27 1.18.59 1.69 1.1.51.51.83 1.01 1.1 1.69.2.52.43 1.3.5 2.73.06 1.55.08 2.02.08 5.92s-.02 4.37-.08 5.92c-.07 1.43-.3 2.21-.5 2.73-.27.68-.59 1.18-1.1 1.69-.51.51-1.01.83-1.69 1.1-.52.2-1.3.43-2.73.5-1.55.06-2.02.08-5.92.08s-4.37-.02-5.92-.08c-1.43-.07-2.21-.3-2.73-.5-.68-.27-1.18-.59-1.69-1.1-.51-.51-.83-1.01-1.1-1.69-.2-.52-.43-1.3-.5-2.73C4.02 20.37 4 19.9 4 16s.02-4.37.08-5.92c.07-1.43.3-2.21.5-2.73.27-.68.59-1.18 1.1-1.69.51-.51 1.01-.83 1.69-1.1.52-.2 1.3-.43 2.73-.5C11.63 4.02 12.1 4 16 4zm0 2.16c-3.84 0-4.29.02-5.8.08-1.39.06-2.15.3-2.65.49-.66.26-1.14.56-1.63 1.06-.5.5-.8 0.97-1.06 1.63-.2.5-.43 1.26-.49 2.65-.07 1.51-.08 1.96-.08 5.8s.02 4.29.08 5.8c.06 1.39.3 2.15.49 2.65.26.66.56 1.14 1.06 1.63.5.5.97.8 1.63 1.06.5.2 1.26.43 2.65.49 1.51.07 1.96.08 5.8.08s4.29-.02 5.8-.08c1.39-.06 2.15-.3 2.65-.49.66-.26 1.14-.56 1.63-1.06.5-.5.8-.97 1.06-1.63.2-.5.43-1.26.49-2.65.07-1.51.08-1.96.08-5.8s-.02-4.29-.08-5.8c-.06-1.39-.3-2.15-.49-2.65-.26-.66-.56-1.14-1.06-1.63-.5-.5-.97-.8-1.63-1.06-.5-.2-1.26-.43-2.65-.49-1.51-.07-1.96-.08-5.8-.08zm0 3.68a6.16 6.16 0 1 1 0 12.32 6.16 6.16 0 0 1 0-12.32zm0 10.16a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm7.84-10.4a1.44 1.44 0 1 1-2.88 0 1.44 1.44 0 0 1 2.88 0z"
      />
    </g>
  </svg>
);

export const OfficialLinkedInIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg viewBox="0 0 32 32" className={className} xmlns="http://www.w3.org/2000/svg" aria-label="LinkedIn">
    <rect width="32" height="32" rx="6.5" fill="#0A66C2" />
    <path
      fill="#FFFFFF"
      d="M9.5 12.67v10.66H5.94V12.67h3.56zm-1.78-5.34c1.14 0 2.06.92 2.06 2.06s-.92 2.06-2.06 2.06-2.06-.92-2.06-2.06.92-2.06 2.06-2.06zm18.34 16h-3.55v-5.56c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.95v5.65h-3.56V12.67h3.41v1.46h.05c.48-.89 1.64-1.84 3.37-1.84 3.6 0 4.26 2.37 4.26 5.46v5.58z"
    />
  </svg>
);
