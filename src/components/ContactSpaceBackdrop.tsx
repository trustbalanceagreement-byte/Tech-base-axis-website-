import React from 'react';

/**
 * Full-bleed hero backdrop for the Contact page: deep space, the dark limb of a
 * planet with glowing city lights and a thin blue atmosphere, and a red sun
 * rising over the horizon with a lens flare. Drawn as one inline SVG.
 */

// Deterministic pseudo-random numbers so server/client renders match
function makeRng(seed: number) {
  let t = seed >>> 0;
  return () => {
    t = (t + 0x6d2b79f5) >>> 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

const W = 1400;
const H = 820;
const PLANET = { cx: 1250, cy: 1520, r: 1340 }; // horizon peaks at y = 180
const SUN = { x: 1200, y: 184 };

interface Dot { x: number; y: number; r: number; o: number }

function buildStars(): Dot[] {
  const rnd = makeRng(7);
  const stars: Dot[] = [];
  while (stars.length < 190) {
    const x = rnd() * W;
    const y = rnd() * (H - 120);
    const d = Math.hypot(x - PLANET.cx, y - PLANET.cy);
    if (d < PLANET.r + 14) continue; // keep stars in the sky only
    const nearSun = Math.hypot(x - SUN.x, y - SUN.y) < 170;
    if (nearSun) continue;
    stars.push({ x, y, r: 0.4 + rnd() * 1.1, o: 0.25 + rnd() * 0.7 });
  }
  return stars;
}

function buildCityLights(): Dot[] {
  const rnd = makeRng(21);
  const lights: Dot[] = [];
  // Clusters of lights on the night side, hugging the planet's curve
  const clusters = Array.from({ length: 16 }, () => {
    const ang = (-100 + rnd() * 60) * (Math.PI / 180);
    const depth = 20 + rnd() * 240;
    return {
      x: PLANET.cx + Math.cos(ang) * (PLANET.r - depth),
      y: PLANET.cy + Math.sin(ang) * (PLANET.r - depth),
      spread: 18 + rnd() * 55,
      count: 8 + Math.floor(rnd() * 22)
    };
  });
  for (const c of clusters) {
    for (let i = 0; i < c.count; i++) {
      const a = rnd() * Math.PI * 2;
      const d = Math.pow(rnd(), 1.6) * c.spread;
      const x = c.x + Math.cos(a) * d;
      const y = c.y + Math.sin(a) * d * 0.6;
      if (Math.hypot(x - PLANET.cx, y - PLANET.cy) > PLANET.r - 6) continue;
      lights.push({ x, y, r: 0.7 + rnd() * 1.3, o: 0.35 + rnd() * 0.65 });
    }
  }
  return lights;
}

const STARS = buildStars();
const CITY_LIGHTS = buildCityLights();

export const ContactSpaceBackdrop: React.FC = () => {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-0 -z-10 w-screen h-[700px] sm:h-[760px] lg:h-[820px] overflow-hidden bg-[#03040a]"
    >
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMaxYMin slice"
        className="absolute inset-0 w-full h-full"
      >
        <defs>
          <radialGradient id="csSky" cx={SUN.x} cy={SUN.y} r="1100" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#3a0a14" stopOpacity="0.85" />
            <stop offset="0.35" stopColor="#10102a" stopOpacity="0.6" />
            <stop offset="1" stopColor="#03040a" stopOpacity="0" />
          </radialGradient>

          <radialGradient id="csPlanetLight" cx={SUN.x} cy="260" r="980" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#6ea2ff" stopOpacity="0.8" />
            <stop offset="0.25" stopColor="#2a5fcc" stopOpacity="0.58" />
            <stop offset="0.6" stopColor="#0f2a6e" stopOpacity="0.3" />
            <stop offset="1" stopColor="#050a1c" stopOpacity="0" />
          </radialGradient>

          <linearGradient id="csAtmo" x1="250" y1="0" x2="1400" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#2a64d6" stopOpacity="0.08" />
            <stop offset="0.45" stopColor="#3f86ee" stopOpacity="0.55" />
            <stop offset="0.7" stopColor="#8cc4ff" stopOpacity="0.9" />
            <stop offset="0.78" stopColor="#ffd6c8" stopOpacity="1" />
            <stop offset="0.86" stopColor="#ff4a3a" stopOpacity="0.9" />
            <stop offset="1" stopColor="#3a7be8" stopOpacity="0.45" />
          </linearGradient>

          <radialGradient id="csSunCore" cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="0.12" stopColor="#ffd9cc" stopOpacity="0.95" />
            <stop offset="0.32" stopColor="#ff4b38" stopOpacity="0.65" />
            <stop offset="1" stopColor="#e61e2b" stopOpacity="0" />
          </radialGradient>

          <radialGradient id="csSunHalo" cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor="#ff2a2a" stopOpacity="0.5" />
            <stop offset="0.5" stopColor="#c4141f" stopOpacity="0.18" />
            <stop offset="1" stopColor="#e61e2b" stopOpacity="0" />
          </radialGradient>

          <linearGradient id="csStreak" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#ff3a2a" stopOpacity="0" />
            <stop offset="0.45" stopColor="#ff8a78" stopOpacity="0.9" />
            <stop offset="0.5" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="0.55" stopColor="#ff8a78" stopOpacity="0.9" />
            <stop offset="1" stopColor="#ff3a2a" stopOpacity="0" />
          </linearGradient>

          <filter id="csBlurL" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="14" />
          </filter>
          <filter id="csBlurM" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="5" />
          </filter>
          <filter id="csBlurS" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1.6" />
          </filter>

          {/* Soft cloud streaks over the planet */}
          <filter id="csClouds" x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.003 0.018" numOctaves="4" seed="9" result="n" />
            <feColorMatrix
              in="n"
              type="matrix"
              values="0 0 0 0 0.62  0 0 0 0 0.78  0 0 0 0 1  0 0 0 1.6 -0.62"
            />
          </filter>

          <clipPath id="csPlanetClip">
            <circle cx={PLANET.cx} cy={PLANET.cy} r={PLANET.r} />
          </clipPath>
        </defs>

        {/* sky tint */}
        <rect width={W} height={H} fill="url(#csSky)" />

        {/* stars */}
        <g fill="#ffffff">
          {STARS.map((s, i) => (
            <circle key={i} cx={s.x.toFixed(1)} cy={s.y.toFixed(1)} r={s.r.toFixed(2)} opacity={s.o.toFixed(2)} />
          ))}
        </g>

        {/* big red halo of the sun */}
        <ellipse cx={SUN.x} cy={SUN.y + 10} rx="560" ry="330" fill="url(#csSunHalo)" />

        {/* planet body */}
        <circle cx={PLANET.cx} cy={PLANET.cy} r={PLANET.r} fill="#04081a" />
        <circle cx={PLANET.cx} cy={PLANET.cy} r={PLANET.r} fill="url(#csPlanetLight)" />
        <g clipPath="url(#csPlanetClip)">
          <rect x="0" y="150" width={W} height="520" filter="url(#csClouds)" opacity="0.26" />
          {/* night-side city lights */}
          <g fill="#ffb45e">
            {CITY_LIGHTS.map((l, i) => (
              <circle key={i} cx={l.x.toFixed(1)} cy={l.y.toFixed(1)} r={l.r.toFixed(2)} opacity={l.o.toFixed(2)} />
            ))}
          </g>
          {/* blue glow hugging the horizon */}
          <circle cx={PLANET.cx} cy={PLANET.cy} r={PLANET.r - 26} fill="none" stroke="#4d8dff" strokeWidth="70" opacity="0.32" filter="url(#csBlurL)" />
          {/* red wash where the sun grazes the surface */}
          <ellipse cx={SUN.x} cy={SUN.y + 40} rx="520" ry="120" fill="#e61e2b" opacity="0.28" filter="url(#csBlurL)" />
        </g>

        {/* atmosphere rim */}
        <circle cx={PLANET.cx} cy={PLANET.cy} r={PLANET.r + 2} fill="none" stroke="url(#csAtmo)" strokeWidth="22" opacity="0.55" filter="url(#csBlurM)" />
        <circle cx={PLANET.cx} cy={PLANET.cy} r={PLANET.r} fill="none" stroke="url(#csAtmo)" strokeWidth="3" />

        {/* sun + lens flare */}
        <g>
          <ellipse cx={SUN.x} cy={SUN.y} rx="620" ry="11" fill="url(#csStreak)" filter="url(#csBlurS)" />
          <ellipse cx={SUN.x} cy={SUN.y} rx="260" ry="3" fill="url(#csStreak)" />
          <ellipse cx={SUN.x} cy={SUN.y} rx="4" ry="80" fill="#ff7a68" opacity="0.32" filter="url(#csBlurS)" />
          <ellipse cx={SUN.x} cy={SUN.y} rx="150" ry="3" fill="#ff6a55" opacity="0.2" filter="url(#csBlurS)" transform={`rotate(32 ${SUN.x} ${SUN.y})`} />
          <ellipse cx={SUN.x} cy={SUN.y} rx="150" ry="3" fill="#ff6a55" opacity="0.2" filter="url(#csBlurS)" transform={`rotate(-32 ${SUN.x} ${SUN.y})`} />
          <circle cx={SUN.x} cy={SUN.y} r="290" fill="url(#csSunCore)" opacity="0.55" />
          <circle cx={SUN.x} cy={SUN.y} r="150" fill="url(#csSunCore)" />
          <circle cx={SUN.x} cy={SUN.y} r="14" fill="#ffffff" />
          <circle cx={SUN.x} cy={SUN.y} r="30" fill="#ffffff" opacity="0.5" filter="url(#csBlurM)" />
        </g>
      </svg>

      {/* Keep the headline readable: darken the left side, fade into the page at the bottom */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#05060b]/90 via-[#05060b]/45 to-transparent sm:from-[#05060b]/85 sm:via-[#05060b]/30" />
      <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-b from-transparent to-[#0a0a0c]" />
    </div>
  );
};
