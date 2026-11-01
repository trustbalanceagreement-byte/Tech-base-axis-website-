import React from 'react';

/**
 * Hero backdrop for the Contact page: a dark globe drawn from thousands of tiny
 * dots (land only), a glowing red location pin on Kolkata and a red arc sweeping
 * away from it. Everything is generated in code (no image assets).
 */

type Pt = [number, number]; // [longitude, latitude]

// Rough continent outlines, enough to read as a dotted world map
const LAND: Pt[][] = [
  // Eurasia (with Arabia and India), clockwise
  [[-9,37],[-9,43],[-2,43.5],[-1,46],[-4,48],[2,51],[5,53],[8,54],[8,55],[10,58],[6,59],[5,62],[11,65],[15,68],[21,70],[28,71],[33,69],[41,67],[44,68],[55,68],[60,69],[69,69],[73,73],[80,73],[88,75],[100,77],[113,74],[128,73],[140,72],[160,70],[170,69],[180,68],[180,65],[175,63],[165,60],[162,60],[156,51],[143,59],[135,55],[141,52],[140,48],[135,43],[131,42],[129,41],[129,36],[126,34.5],[126,38],[125,40],[122,40],[121,37],[119,35],[121,32],[122,30],[120,26],[117,23],[112,21.5],[108,21.5],[106,19],[109,14],[108,11],[105,8.5],[103,10],[100,13],[99,10],[100,6],[103,2],[104,1.3],[101,3],[98,8],[98,14],[95,16],[94,19],[92,21],[90,22],[87,21],[85,19.5],[82,16],[80,14],[80,10],[78,8],[77,8.5],[76,10],[75,13],[73,17],[72.8,20],[70,21],[69,22.5],[67,24.5],[62,25],[57,25.5],[56.5,27],[52,28],[50,30],[48,30],[48,28],[50,26],[51,24.5],[54,24],[56,26],[57,23],[59,22],[57,19],[52,16],[45,12.8],[43,14],[42,16],[39,21],[37,25],[35,28],[34.5,29],[34.5,31],[35.5,34],[36,36],[34,36.5],[30,36.5],[28,37],[26,39],[27,40.5],[29,41.2],[33,42],[36,41.5],[41,41],[41.5,42],[38,44.5],[37,46],[34,45],[33,46],[30,45.5],[28.5,44],[28,42],[26,41],[23,40],[24,38],[22,37],[21,39],[19,42],[14,45],[13,45.5],[12.3,44.5],[13.5,43.5],[14,42],[16,41.5],[18,40],[16,38],[15.7,40],[12.5,41.5],[10.5,43],[9,44.3],[7.5,43.8],[3.5,43.3],[3,42],[0,39],[-1,37.5],[-5,36]],
  // Africa
  [[-17,21],[-16,28],[-10,30],[-6,35],[10,37],[11,33],[20,31],[32,31],[34,28],[38,21],[43,12],[51,12],[48,6],[41,-2],[40,-10],[40,-16],[35,-24],[33,-27],[30,-31],[25,-34],[19,-35],[17,-30],[12,-18],[13,-8],[9,-1],[9,4],[5,6],[-4,5],[-8,4],[-13,8],[-17,14]],
  // North America
  [[-168,66],[-157,71],[-141,70],[-125,70],[-110,68],[-95,69],[-82,68],[-76,62],[-65,60],[-60,55],[-56,52],[-65,47],[-67,44],[-70,42],[-75,39],[-76,35],[-81,31],[-80,26],[-82,27],[-84,30],[-89,30],[-94,29],[-97,26],[-97,22],[-95,19],[-91,19],[-90,21],[-87,21],[-88,16],[-84,15],[-83,10],[-79,9],[-77,8],[-80,8],[-85,10],[-87,13],[-92,15],[-96,16],[-105,20],[-106,23],[-110,24],[-113,27],[-115,30],[-117,33],[-121,35],[-124,40],[-124,46],[-125,49],[-130,54],[-135,58],[-141,60],[-150,60],[-155,57],[-163,55],[-158,58],[-162,60],[-166,62]],
  // South America
  [[-77,8],[-72,12],[-65,10],[-60,8],[-52,5],[-50,0],[-44,-2],[-35,-6],[-35,-9],[-39,-15],[-41,-22],[-48,-26],[-53,-33],[-58,-35],[-57,-38],[-62,-40],[-65,-45],[-68,-50],[-69,-54],[-72,-52],[-74,-47],[-73,-40],[-71,-30],[-70,-18],[-76,-14],[-81,-6],[-80,-1],[-78,3]],
  // Greenland
  [[-73,78],[-60,82],[-30,83],[-18,80],[-20,72],[-24,69],[-40,65],[-44,60],[-50,63],[-55,68],[-60,76]],
  // Australia
  [[114,-22],[122,-18],[130,-12],[136,-12],[137,-16],[141,-12],[143,-14],[146,-19],[153,-26],[153,-31],[150,-37],[146,-39],[140,-38],[135,-35],[131,-31.5],[124,-33.5],[115,-34],[115,-30]],
  // Islands
  [[-5,50],[1.5,51],[1.5,53],[-3,56],[-2,58.5],[-6,58.5],[-5,55],[-3,54],[-4.5,52]], // Great Britain
  [[-10,52],[-6,52],[-6,55],[-8.5,54.5]], // Ireland
  [[-24,65],[-14,66.5],[-14,64.5],[-22,63.5]], // Iceland
  [[130,33],[135,34],[140,35],[142,39],[141,41.5],[139.5,40],[138,37],[133,35.5],[131,34.5]], // Honshu
  [[140,42],[143,42],[145,44],[142,45.5],[141,43.5]], // Hokkaido
  [[80,6],[82,7.5],[80.5,9.5],[79.8,8]], // Sri Lanka
  [[95,5.5],[98,4],[104,-2],[106,-6],[102,-4],[97,0]], // Sumatra
  [[105,-6.5],[114,-7.5],[114,-8.5],[106,-7.5]], // Java
  [[109,1.5],[111,2],[116,7],[119,5],[117,1],[116,-4],[110,-3]], // Borneo
  [[131,-1],[141,-3],[150,-10],[143,-9],[138,-8],[134,-4]], // New Guinea
  [[120,18],[122,18],[122,14],[120,14]], // Luzon
  [[122,8],[126,8],[126,6],[122,7]], // Mindanao
  [[44,-25],[47,-25],[50,-15],[49,-12],[44,-17]], // Madagascar
  [[-85,22],[-80,23],[-74,20],[-78,20]] // Cuba
];

function inPolygon(lon: number, lat: number, poly: Pt[]): boolean {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    if (yi > lat !== yj > lat && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

const isLand = (lon: number, lat: number) => LAND.some((poly) => inPolygon(lon, lat, poly));

// ---- view setup (viewBox units) ----
const W = 1400;
const H = 820;
const GLOBE = { cx: 1040, cy: 445, r: 430 };
const VIEW = { lon: 70, lat: 4 }; // the point facing the viewer
const KOLKATA: Pt = [88.36, 22.57];
const rad = (d: number) => (d * Math.PI) / 180;

function project(lon: number, lat: number) {
  const dl = rad(lon - VIEW.lon);
  const p = rad(lat);
  const p0 = rad(VIEW.lat);
  const cosC = Math.sin(p0) * Math.sin(p) + Math.cos(p0) * Math.cos(p) * Math.cos(dl);
  const x = GLOBE.r * Math.cos(p) * Math.sin(dl);
  const y = GLOBE.r * (Math.cos(p0) * Math.sin(p) - Math.sin(p0) * Math.cos(p) * Math.cos(dl));
  return { x: GLOBE.cx + x, y: GLOBE.cy - y, cosC };
}

interface Dot { x: number; y: number; r: number; o: number }

function buildLandDots(): Dot[] {
  const dots: Dot[] = [];
  const step = 1.9; // degrees between dots
  for (let lat = -58; lat <= 82; lat += step) {
    const lonStep = step / Math.max(Math.cos(rad(lat)), 0.12);
    for (let lon = -180; lon < 180; lon += lonStep) {
      if (!isLand(lon, lat)) continue;
      const { x, y, cosC } = project(lon, lat);
      if (cosC < 0.03) continue; // far side of the globe
      dots.push({
        x,
        y,
        r: 0.5 + 1.35 * Math.sqrt(cosC), // smaller towards the rim (foreshortening)
        o: 0.18 + 0.72 * Math.pow(cosC, 0.7)
      });
    }
  }
  return dots;
}

const LAND_DOTS = buildLandDots();
const PIN = project(KOLKATA[0], KOLKATA[1]);

export const ContactGlobeBackdrop: React.FC = () => {
  const px = PIN.x;
  const py = PIN.y;
  // Arc sweeping from the pin toward the lower left
  const arc = `M ${px.toFixed(1)} ${(py + 4).toFixed(1)} C ${(px - 70).toFixed(1)} ${(py + 170).toFixed(1)}, ${(px - 300).toFixed(1)} ${(py + 290).toFixed(1)}, ${(px - 640).toFixed(1)} ${(py + 290).toFixed(1)}`;
  const arc2 = `M ${px.toFixed(1)} ${(py + 4).toFixed(1)} C ${(px - 40).toFixed(1)} ${(py + 130).toFixed(1)}, ${(px - 210).toFixed(1)} ${(py + 235).toFixed(1)}, ${(px - 520).toFixed(1)} ${(py + 252).toFixed(1)}`;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-0 -z-10 w-screen h-[700px] sm:h-[760px] lg:h-[820px] overflow-hidden bg-[#050507]"
    >
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMaxYMin slice"
        className="absolute inset-0 w-full h-full translate-y-28 sm:translate-y-0"
      >
        <defs>
          <radialGradient id="cgBody" cx="38%" cy="32%" r="80%">
            <stop offset="0" stopColor="#1b1c24" />
            <stop offset="0.55" stopColor="#0c0d12" />
            <stop offset="1" stopColor="#050507" />
          </radialGradient>
          <radialGradient id="cgRimLight" cx="30%" cy="25%" r="85%">
            <stop offset="0.7" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="1" stopColor="#ffffff" stopOpacity="0.14" />
          </radialGradient>
          <radialGradient id="cgRedGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor="#e61e2b" stopOpacity="0.5" />
            <stop offset="1" stopColor="#e61e2b" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="cgArc" x1={px - 640} y1="0" x2={px} y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#ff2d3d" stopOpacity="0" />
            <stop offset="0.55" stopColor="#ff2d3d" stopOpacity="0.55" />
            <stop offset="1" stopColor="#ff4a58" stopOpacity="1" />
          </linearGradient>
          <linearGradient id="cgPin" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ff6470" />
            <stop offset="0.5" stopColor="#f01f2e" />
            <stop offset="1" stopColor="#b80d19" />
          </linearGradient>
          <filter id="cgBlurL" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="16" />
          </filter>
          <filter id="cgBlurS" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" />
          </filter>
          <clipPath id="cgGlobeClip">
            <circle cx={GLOBE.cx} cy={GLOBE.cy} r={GLOBE.r} />
          </clipPath>
        </defs>

        {/* soft red ambience under the pin */}
        <ellipse cx={px} cy={py + 20} rx="420" ry="300" fill="url(#cgRedGlow)" opacity="0.55" />

        {/* globe body + rim light */}
        <circle cx={GLOBE.cx} cy={GLOBE.cy} r={GLOBE.r + 14} fill="none" stroke="#ffffff" strokeOpacity="0.05" strokeWidth="1" />
        <circle cx={GLOBE.cx} cy={GLOBE.cy} r={GLOBE.r} fill="url(#cgBody)" />
        <circle cx={GLOBE.cx} cy={GLOBE.cy} r={GLOBE.r} fill="url(#cgRimLight)" />
        <circle cx={GLOBE.cx} cy={GLOBE.cy} r={GLOBE.r} fill="none" stroke="#ffffff" strokeOpacity="0.12" strokeWidth="1.5" />

        {/* land dots */}
        <g clipPath="url(#cgGlobeClip)" fill="#a9afbd">
          {LAND_DOTS.map((d, i) => (
            <circle key={i} cx={d.x.toFixed(1)} cy={d.y.toFixed(1)} r={d.r.toFixed(2)} opacity={d.o.toFixed(2)} />
          ))}
        </g>

        {/* arcs leaving the pin */}
        <path d={arc} fill="none" stroke="#ff2d3d" strokeOpacity="0.55" strokeWidth="9" filter="url(#cgBlurS)" />
        <path d={arc} fill="none" stroke="url(#cgArc)" strokeWidth="2.6" strokeLinecap="round" />
        <path d={arc2} fill="none" stroke="url(#cgArc)" strokeOpacity="0.45" strokeWidth="1.2" strokeLinecap="round" />

        {/* pulse rings on the ground */}
        <g transform={`translate(${px.toFixed(1)} ${py.toFixed(1)})`}>
          <ellipse className="contact-pin-ring" rx="46" ry="16" fill="none" stroke="#ff2d3d" strokeWidth="2" />
          <ellipse className="contact-pin-ring contact-pin-ring-2" rx="46" ry="16" fill="none" stroke="#ff2d3d" strokeWidth="2" />
          <ellipse rx="26" ry="9" fill="#ff2d3d" opacity="0.28" filter="url(#cgBlurS)" />
          <ellipse rx="22" ry="7.5" fill="none" stroke="#ff4a58" strokeWidth="1.6" opacity="0.9" />

          {/* the pin (tip at 0,0) */}
          <g transform="scale(1.5)">
            <path d="M0 0 C -9 -13 -15 -21 -15 -30 A15 15 0 1 1 15 -30 C 15 -21 9 -13 0 0 Z" fill="#e61e2b" opacity="0.7" filter="url(#cgBlurL)" />
            <path d="M0 0 C -9 -13 -15 -21 -15 -30 A15 15 0 1 1 15 -30 C 15 -21 9 -13 0 0 Z" fill="url(#cgPin)" />
            <circle cx="0" cy="-30" r="5.6" fill="#ffffff" />
          </g>
        </g>
      </svg>

      {/* Keep the headline readable on the left, fade into the page colour at the bottom */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#05060b]/90 via-[#05060b]/40 to-transparent sm:from-[#05060b]/85 sm:via-[#05060b]/25" />
      <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-b from-transparent to-[#0a0a0c]" />
    </div>
  );
};
