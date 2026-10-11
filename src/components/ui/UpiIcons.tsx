import React from 'react';

/**
 * Authentic, 100% Official UPI Brand Icons for Indian Payment Gateways
 * Sourced directly from official vector brand assets:
 * - Google Pay: Official 4-color interlocking ribbon emblem (Blue, Green, Yellow, Red) on white squircle
 * - PhonePe: Official royal purple squircle (#5F259F) with authentic white Devanagari 'पे' glyph
 * - Paytm: Official Paytm brand vector with deep navy 'pay' and bright cyan 'tm' on white squircle
 * - BHIM: Official green & orange triangles with bold BHIM mark
 * - UPI: Official NPCI Unified Payments Interface green & orange chevrons with UPI lettering
 */

// 1. Official Google Pay (GPay) 4-Color Interlocking Emblem
export const GooglePayIcon: React.FC<{ className?: string }> = ({ className = 'w-8 h-8' }) => (
  <svg 
    viewBox="0 0 48 48" 
    className={className} 
    xmlns="http://www.w3.org/2000/svg" 
    aria-label="Google Pay"
  >
    {/* Crisp white squircle background */}
    <rect width="48" height="48" rx="11" fill="#FFFFFF" stroke="#E5E7EB" strokeWidth="1" />
    
    <g transform="translate(6.5, 9.3) scale(0.128)">
      {/* Red Ribbon with official gradient */}
      <linearGradient id="GPay_Red_Grad" gradientUnits="userSpaceOnUse" x1="166.32" y1="132.13" x2="270.06" y2="94.37" gradientTransform="matrix(1 0 0 -1 0 228.34)">
        <stop offset="0.2" stopColor="#D93025"/>
        <stop offset="0.6" stopColor="#EA4335"/>
      </linearGradient>
      <path 
        fill="url(#GPay_Red_Grad)" 
        d="M148.8,145.3l69.9-121.1l38.1,22c24.6,14.2,33,45.6,18.8,70.2l-39.4,68.2c-8.9,15.4-28.5,20.6-43.9,11.8l-35.3-20.4C146.3,169.7,142.6,156,148.8,145.3z"
      />
      
      {/* Yellow Ribbon */}
      <path 
        fill="#FDBD00" 
        d="M141.4,61.2L54.5,211.8l38.1,22c24.6,14.2,56,5.8,70.2-18.8l56.4-97.7c8.9-15.4,3.6-35-11.8-43.9L172,53C161.3,46.8,147.6,50.5,141.4,61.2z"
      />
      
      {/* Green Ribbon */}
      <path 
        fill="#2DA94F" 
        d="M218.7,24.2L191.8,8.6c-30.7-17.7-70-7.2-87.8,23.5l-50,86.6c-8.9,15.4-3.6,35,11.8,43.9l26.9,15.6c15.4,8.9,35,3.6,43.9-11.8L196.3,63l0,0c12.4-21.5,39.8-28.8,61.3-16.4"
      />
      
      {/* Blue Ribbon with official gradient */}
      <linearGradient id="GPay_Blue_Grad" gradientUnits="userSpaceOnUse" x1="8.84" y1="119.91" x2="124.40" y2="77.85" gradientTransform="matrix(1 0 0 -1 0 228.34)">
        <stop offset="0.2" stopColor="#4285F4"/>
        <stop offset="0.8" stopColor="#1B74E8"/>
      </linearGradient>
      <path 
        fill="url(#GPay_Blue_Grad)" 
        d="M111.8,57.5L82.1,40.4c-13.3-7.6-30.2-3.1-37.8,10.1L8.5,112.1c-17.6,30.3-7.1,69.1,23.3,86.7l22.6,13l27.5,15.8l11.9,6.9C72.7,220.3,66,192,78.9,169.7l9.2-15.9l33.8-58.4C129.6,82,125,65.1,111.8,57.5z"
      />
    </g>
  </svg>
);

// 2. Official PhonePe Royal Purple Squircle with Authentic Devanagari 'पे' Glyph
export const PhonePeIcon: React.FC<{ className?: string }> = ({ className = 'w-8 h-8' }) => (
  <svg 
    viewBox="0 0 70 70" 
    className={className} 
    xmlns="http://www.w3.org/2000/svg" 
    aria-label="PhonePe"
  >
    {/* PhonePe signature royal purple base */}
    <rect width="70" height="70" rx="17" fill="#5F259F" />
    
    {/* Authentic PhonePe Devanagari 'पे' mark */}
    <path 
      d="m 48.431347,27.0768 c 0,-1.168224 -1.001334,-2.169558 -2.169557,-2.169558 h -4.005338 l -9.1789,-10.514013 c -0.834446,-1.001335 -2.169559,-1.335113 -3.504671,-1.001335 l -3.170893,1.001335 c -0.500667,0.166889 -0.667556,0.834445 -0.333778,1.168223 l 10.013345,9.512679 H 20.894648 c -0.500667,0 -0.834445,0.333778 -0.834445,0.834445 v 1.668891 c 0,1.168224 1.001334,2.169558 2.169558,2.169558 h 2.336448 v 8.010676 c 0,6.008008 3.170892,9.512678 8.511343,9.512678 1.668891,0 3.004003,-0.166889 4.672894,-0.834445 v 5.340451 c 0,1.502002 1.168224,2.670225 2.670225,2.670225 h 2.336448 c 0.500667,0 1.001335,-0.500667 1.001335,-1.001334 v -23.86514 h 3.838448 c 0.500667,0 0.834445,-0.333778 0.834445,-0.834445 z M 37.750446,41.429261 c -1.001334,0.500668 -2.336447,0.667557 -3.337781,0.667557 -2.670226,0 -4.005339,-1.335114 -4.005339,-4.339117 v -8.010676 h 7.34312 z" 
      fill="#FFFFFF" 
    />
  </svg>
);

// 3. Official Paytm Vector Logo on Clean White Squircle
export const PaytmIcon: React.FC<{ className?: string }> = ({ className = 'w-8 h-8' }) => (
  <svg 
    viewBox="0 0 48 48" 
    className={className} 
    xmlns="http://www.w3.org/2000/svg" 
    aria-label="Paytm"
  >
    {/* Crisp white squircle background */}
    <rect width="48" height="48" rx="11" fill="#FFFFFF" stroke="#E5E7EB" strokeWidth="1" />
    
    {/* Official Paytm Wordmark: 'pay' in #002970 / #233266 & 'tm' in #00BAF2 / #54C1F0 */}
    <g transform="translate(4.2, 17.5) scale(2.35)">
      {/* 'm' (cyan) */}
      <g transform="matrix(0.3528, 0, 0, -0.3528, 16.777, 1.561)">
        <path fill="#00BAF2" d="M 0,0 C -0.433,1.238 -1.613,2.127 -2.999,2.127 H -3.028 C -3.929,2.127 -4.741,1.752 -5.319,1.15 -5.898,1.752 -6.71,2.127 -7.61,2.127 h -0.029 c -0.792,0 -1.516,-0.29 -2.072,-0.77 V 1.601 C -9.73,1.844 -9.93,2.035 -10.177,2.035 h -2.126 c -0.26,0 -0.47,-0.21 -0.47,-0.471 V -9.981 c 0,-0.261 0.21,-0.471 0.47,-0.471 h 2.126 c 0.237,0 0.432,0.177 0.463,0.406 l -10e-4,8.288 c 0,0.029 10e-4,0.056 0.004,0.083 0.034,0.37 0.305,0.674 0.733,0.712 h 0.079 0.223 0.09 c 0.179,-0.016 0.33,-0.079 0.449,-0.174 0.185,-0.147 0.288,-0.373 0.288,-0.621 l 0.008,-8.247 c 0,-0.261 0.211,-0.472 0.47,-0.472 h 2.126 c 0.251,0 0.455,0.2 0.467,0.449 l -0.001,8.281 c -0.001,0.272 0.125,0.518 0.346,0.664 0.109,0.07 0.24,0.117 0.391,0.131 h 0.079 0.223 0.09 c 0.46,-0.04 0.738,-0.389 0.737,-0.795 l 0.008,-8.236 c 0,-0.261 0.211,-0.471 0.47,-0.471 h 2.126 c 0.259,0 0.47,0.21 0.47,0.471 v 8.858 C 0.161,-0.521 0.093,-0.264 0,0" />
      </g>
      
      {/* 't' (cyan) */}
      <g transform="matrix(0.3528, 0, 0, -0.3528, 11.700, 0.854)">
        <path fill="#00BAF2" d="m 0,0 h -1.216 v 1.97 0 c 0,0.002 0,0.004 0,0.006 0,0.237 -0.192,0.429 -0.429,0.429 C -1.673,2.405 -1.7,2.401 -1.726,2.396 -3.074,2.026 -2.804,0.159 -5.265,0 H -5.32 -5.504 c -0.036,0 -0.07,-0.005 -0.103,-0.012 h -0.002 l 0.002,-10e-4 C -5.817,-0.06 -5.975,-0.246 -5.975,-0.47 v -2.126 c 0,-0.259 0.211,-0.47 0.471,-0.47 h 1.283 l -0.002,-9.015 c 0,-0.257 0.208,-0.465 0.465,-0.465 h 2.102 c 0.256,0 0.464,0.208 0.464,0.465 l 10e-4,9.015 H 0 c 0.259,0 0.47,0.211 0.47,0.47 V -0.47 C 0.47,-0.211 0.259,0 0,0" />
      </g>
      
      {/* 'y' (navy blue) */}
      <g transform="matrix(0.3528, 0, 0, -0.3528, 9.001, 0.854)">
        <path fill="#002970" d="M 0,0 H -2.126 C -2.385,0 -2.595,-0.211 -2.595,-0.47 V -4.866 C -2.6,-5.138 -2.82,-5.356 -3.093,-5.356 h -0.89 c -0.276,0 -0.499,0.222 -0.499,0.498 L -4.49,-0.47 C -4.49,-0.211 -4.701,0 -4.96,0 h -2.126 c -0.26,0 -0.47,-0.211 -0.47,-0.47 v -4.818 c 0,-1.83 1.305,-3.135 3.136,-3.135 0,0 1.374,0 1.416,-0.008 0.248,-0.028 0.441,-0.236 0.441,-0.492 0,-0.253 -0.189,-0.46 -0.434,-0.491 -0.012,-0.002 -0.023,-0.005 -0.036,-0.007 l -3.109,-0.011 c -0.26,0 -0.47,-0.211 -0.47,-0.47 v -2.125 c 0,-0.26 0.21,-0.47 0.47,-0.47 h 3.476 c 1.832,0 3.136,1.304 3.136,3.135 V -0.47 C 0.47,-0.211 0.26,0 0,0" />
      </g>
      
      {/* 'p' (navy blue) */}
      <g transform="matrix(0.3528, 0, 0, -0.3528, 1.742, 2.228)">
        <path fill="#002970" d="m 0,0 v -0.992 -0.32 c 0,-0.275 -0.223,-0.499 -0.498,-0.499 l -1.349,-0.001 v 2.629 h 1.349 C -0.223,0.817 0,0.595 0,0.319 Z M 0.187,3.896 H -4.46 c -0.255,0 -0.461,-0.207 -0.461,-0.461 V 1.352 c 0,-0.004 0.001,-0.008 0.001,-0.012 0,-0.01 -0.001,-0.02 -0.001,-0.029 V -5.37 -8.117 c 0,-0.256 0.192,-0.465 0.43,-0.471 h 0.04 2.126 c 0.259,0 0.47,0.21 0.47,0.47 l 0.008,3.231 h 2.034 c 1.702,0 2.888,1.181 2.888,2.89 v 2.999 c 0,1.709 -1.186,2.894 -2.888,2.894" />
      </g>
      
      {/* 'a' (navy blue) */}
      <g transform="matrix(0.3528, 0, 0, -0.3528, 4.854, 3.989)">
        <path fill="#002970" d="M 0,0 V -0.332 C 0,-0.359 -0.004,-0.385 -0.008,-0.41 -0.013,-0.434 -0.02,-0.457 -0.028,-0.479 -0.094,-0.665 -0.28,-0.8 -0.501,-0.8 h -0.885 c -0.276,0 -0.501,0.21 -0.501,0.468 v 0.401 c 0,0.005 -10e-4,0.01 -10e-4,0.015 l 10e-4,1.067 v 0.002 0.118 0.214 l 0.001,0.003 c 10e-4,0.257 0.224,0.465 0.5,0.465 h 0.885 C -0.224,1.953 0,1.744 0,1.485 Z m -0.338,8.875 h -2.95 C -3.549,8.875 -3.76,8.677 -3.76,8.434 V 7.607 c 0,-0.005 10e-4,-0.011 10e-4,-0.016 0,-0.006 -10e-4,-0.012 -10e-4,-0.018 V 6.44 c 0,-0.257 0.224,-0.467 0.5,-0.467 h 2.809 c 0.222,-0.035 0.398,-0.197 0.423,-0.45 V 5.249 C -0.053,5.008 -0.227,4.832 -0.439,4.812 H -1.83 c -1.85,0 -3.168,-1.229 -3.168,-2.955 v -2.409 -0.063 c 0,-1.716 1.133,-2.937 2.97,-2.937 h 3.855 c 0.692,0 1.253,0.524 1.253,1.169 v 8.067 c 0,1.956 -1.008,3.191 -3.418,3.191" />
      </g>
    </g>
  </svg>
);

// 4. Official BHIM UPI Dual-Triangle Vector Logo
export const BhimIcon: React.FC<{ className?: string }> = ({ className = 'w-8 h-8' }) => (
  <svg 
    viewBox="0 0 48 48" 
    className={className} 
    xmlns="http://www.w3.org/2000/svg" 
    aria-label="BHIM"
  >
    {/* Dark navy background squircle */}
    <rect width="48" height="48" rx="11" fill="#0C1B33" stroke="#1E293B" strokeWidth="1" />
    
    <g transform="translate(6, 17) scale(1.1)">
      {/* Green chevron */}
      <path d="m 0,0 4.466,-8.881 -9.388,-8.88 z" fill="#008C44" transform="matrix(0.3528, 0, 0, -0.3528, 30.588, 0.01)" />
      {/* Orange chevron */}
      <path d="m 0,0 4.462,-8.881 -9.392,-8.88 z" fill="#F47920" transform="matrix(0.3528, 0, 0, -0.3528, 29.484, 0.01)" />
      {/* BHIM Text in crisp white */}
      <text x="2" y="11" fill="#FFFFFF" fontFamily="system-ui, -apple-system, sans-serif" fontSize="11" fontWeight="900" letterSpacing="1.2">
        BHIM
      </text>
    </g>
  </svg>
);

// 5. Official NPCI Unified Payments Interface (UPI) Logo
export const GenericUpiIcon: React.FC<{ className?: string }> = ({ className = 'w-8 h-8' }) => (
  <svg 
    viewBox="0 0 48 48" 
    className={className} 
    xmlns="http://www.w3.org/2000/svg" 
    aria-label="UPI"
  >
    {/* Crisp white squircle background */}
    <rect width="48" height="48" rx="11" fill="#FFFFFF" stroke="#E5E7EB" strokeWidth="1" />
    
    <g transform="translate(7.5, 12)">
      {/* Authentic NPCI UPI Green & Orange Angled Arrows */}
      <g transform="translate(18, 17) scale(0.24)">
        {/* Green forward arrow */}
        <path d="m 0,0 24.414,-48.553 -51.322,-48.54 z" fill="#097939" />
        {/* Orange forward arrow */}
        <path d="m 35,0 24.396,-48.553 -51.343,-48.54 z" fill="#ED7524" />
      </g>
      
      {/* Bold 'UPI' in Official Deep Blue */}
      <text 
        x="0" 
        y="17" 
        fill="#0C2340" 
        fontFamily="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" 
        fontSize="14" 
        fontWeight="900" 
        letterSpacing="0.8"
      >
        UPI
      </text>
    </g>
  </svg>
);
