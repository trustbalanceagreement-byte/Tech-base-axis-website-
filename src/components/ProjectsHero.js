import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ArrowUpRight, Layers } from 'lucide-react';
const prefersReducedMotion = () => typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
/** A number that counts up from 0 the first time it scrolls into view. */
const CountUp = ({ to, decimals = 0, suffix = '' }) => {
    const ref = useRef(null);
    const [value, setValue] = useState(to);
    useLayoutEffect(() => {
        if (!prefersReducedMotion() && typeof IntersectionObserver !== 'undefined')
            setValue(0);
    }, [to]);
    useEffect(() => {
        const el = ref.current;
        if (!el || prefersReducedMotion() || typeof IntersectionObserver === 'undefined') {
            setValue(to);
            return;
        }
        let frame = 0;
        const observer = new IntersectionObserver((entries) => {
            if (!entries.some((e) => e.isIntersecting))
                return;
            observer.disconnect();
            const start = performance.now();
            const duration = 1400;
            const tick = (now) => {
                const t = Math.min((now - start) / duration, 1);
                const eased = 1 - Math.pow(1 - t, 3);
                setValue(to * eased);
                if (t < 1)
                    frame = requestAnimationFrame(tick);
            };
            frame = requestAnimationFrame(tick);
        }, { threshold: 0.4 });
        observer.observe(el);
        return () => {
            observer.disconnect();
            cancelAnimationFrame(frame);
        };
    }, [to]);
    return (_jsxs("span", { ref: ref, children: [value.toFixed(decimals), suffix] }));
};
// Nodes orbiting the hub: [label, angle in degrees, highlighted]
const RINGS = [
    { r: 72, cls: '1', nodes: [['API', 20, true], ['DB', 200, false]] },
    { r: 122, cls: '2', nodes: [['React', 90, false], ['Cloud', 210, true], ['Auth', 330, false]] },
    { r: 172, cls: '3', nodes: [['AI', 40, true], ['Pay', 160, false], ['CDN', 280, false]] }
];
const OrbitVisual = () => (_jsxs("svg", { viewBox: "0 0 400 400", className: "w-full h-auto overflow-visible", role: "img", "aria-label": "Animated map of the technologies in every build", children: [_jsxs("defs", { children: [_jsxs("radialGradient", { id: "phGlow", cx: "50%", cy: "50%", r: "50%", children: [_jsx("stop", { offset: "0", stopColor: "#e61e2b", stopOpacity: "0.38" }), _jsx("stop", { offset: "0.6", stopColor: "#e61e2b", stopOpacity: "0.08" }), _jsx("stop", { offset: "1", stopColor: "#e61e2b", stopOpacity: "0" })] }), _jsxs("linearGradient", { id: "phHub", x1: "0", y1: "0", x2: "1", y2: "1", children: [_jsx("stop", { offset: "0", stopColor: "#2a2a31" }), _jsx("stop", { offset: "1", stopColor: "#0a0a0d" })] }), _jsx("filter", { id: "phBlur", x: "-50%", y: "-50%", width: "200%", height: "200%", children: _jsx("feGaussianBlur", { stdDeviation: "6" }) })] }), _jsxs("g", { transform: "translate(200 200)", children: [_jsx("circle", { r: "190", fill: "url(#phGlow)" }), RINGS.map((ring) => (_jsx("circle", { r: ring.r, fill: "none", stroke: "#ffffff", strokeOpacity: ring.cls === '2' ? 0.14 : 0.09, strokeWidth: "1", strokeDasharray: ring.cls === '2' ? '3 7' : undefined }, ring.cls))), RINGS.map((ring) => (_jsx("g", { className: `tba-orbit tba-orbit-${ring.cls}`, children: ring.nodes.map(([label, angle, hot]) => (_jsx("g", { transform: `rotate(${angle}) translate(${ring.r} 0)`, children: _jsx("g", { transform: `rotate(${-angle})`, children: _jsxs("g", { className: `tba-orbit-counter tba-orbit-counter-${ring.cls}`, children: [hot && _jsx("circle", { r: "17", fill: "#e61e2b", opacity: "0.35", filter: "url(#phBlur)" }), _jsx("rect", { x: "-24", y: "-11", width: "48", height: "22", rx: "11", fill: "#0d0d11", stroke: hot ? '#ff4351' : '#ffffff', strokeOpacity: hot ? 0.95 : 0.22, strokeWidth: "1.2" }), _jsx("text", { textAnchor: "middle", y: "3.6", fontSize: "10.5", fontWeight: "700", fill: hot ? '#ffb3b9' : '#d4d4d8', style: { fontFamily: "'JetBrains Mono', monospace" }, children: label })] }) }) }, label))) }, ring.cls))), _jsx("circle", { r: "40", fill: "none", stroke: "#ff2d3d", strokeWidth: "1.5", className: "tba-hub-pulse" }), _jsx("circle", { r: "40", fill: "none", stroke: "#ff2d3d", strokeWidth: "1.5", className: "tba-hub-pulse tba-hub-pulse-2" }), _jsx("circle", { r: "36", fill: "#e61e2b", opacity: "0.4", filter: "url(#phBlur)" }), _jsx("circle", { r: "34", fill: "url(#phHub)", stroke: "#ff4351", strokeOpacity: "0.8", strokeWidth: "1.5" }), _jsxs("text", { textAnchor: "middle", y: "5", fontSize: "15", fontWeight: "800", fill: "#ffffff", letterSpacing: "1", style: { fontFamily: "'JetBrains Mono', monospace" }, children: [_jsx("tspan", { fill: "#ff4351", children: "//" }), "TBA"] })] })] }));
export const ProjectsHero = ({ projects, onNavigate }) => {
    const count = Array.isArray(projects) ? projects.length : 0;
    const disciplines = new Set((projects || []).map((p) => p.category).filter(Boolean)).size;
    const stats = count > 0
        ? [
            { to: count, label: 'Live Projects' },
            { to: disciplines, label: 'Disciplines' },
            { to: 99.99, decimals: 2, suffix: '%', label: 'Uptime SLA' },
            { to: 6, suffix: '+ Yrs', label: 'Engineering' }
        ]
        : [
            { to: 45, suffix: '+', label: 'Deployments' },
            { to: 99.99, decimals: 2, suffix: '%', label: 'Uptime SLA' },
            { to: 3.8, decimals: 1, suffix: 'x', label: 'Speed Boost' },
            { to: 6, suffix: '+ Yrs', label: 'Engineering' }
        ];
    return (_jsxs("section", { className: "contact-glass-card relative isolate overflow-hidden px-5 py-8 sm:px-8 sm:py-10 lg:px-12 lg:py-12", children: [_jsx("div", { "aria-hidden": "true", className: "pointer-events-none absolute inset-0 -z-10 opacity-60", style: {
                    backgroundImage: 'linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)',
                    backgroundSize: '44px 44px',
                    maskImage: 'radial-gradient(ellipse at 70% 40%, black 10%, transparent 70%)',
                    WebkitMaskImage: 'radial-gradient(ellipse at 70% 40%, black 10%, transparent 70%)'
                } }), _jsx("div", { "aria-hidden": "true", className: "pointer-events-none absolute -top-24 -left-16 w-80 h-80 rounded-full bg-red-700/20 blur-[110px] -z-10" }), _jsx("div", { "aria-hidden": "true", className: "pointer-events-none absolute -bottom-28 right-0 w-96 h-96 rounded-full bg-red-900/20 blur-[120px] -z-10" }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-12 items-center gap-8 lg:gap-6", children: [_jsxs("div", { className: "lg:col-span-7", children: [_jsxs("div", { className: "tba-rise inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-[11px] font-mono font-bold uppercase tracking-[0.2em] text-[#e61e2b]", style: { ['--d']: '0ms' }, children: [_jsx(Layers, { className: "w-3.5 h-3.5" }), _jsx("span", { children: "// Portfolio & Case Studies" })] }), _jsxs("h1", { className: "tba-rise mt-5 font-sans text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.05]", style: { ['--d']: '120ms' }, children: ["Selected Work", _jsx("span", { className: "block text-[#ff1f2e] drop-shadow-[0_0_26px_rgba(255,31,46,0.45)]", children: "Engineered for Production" })] }), _jsx("p", { className: "tba-rise mt-5 max-w-xl text-sm sm:text-base lg:text-lg text-neutral-300 leading-relaxed", style: { ['--d']: '240ms' }, children: "Full-stack platforms, cloud infrastructure and AI systems designed by Bikram Ghosh, built for reliability, security and speed." }), _jsxs("div", { className: "tba-rise mt-7 flex flex-wrap items-center gap-3", style: { ['--d']: '360ms' }, children: [_jsxs("button", { type: "button", onClick: () => onNavigate('contact'), className: "inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#e61e2b] hover:bg-red-500 text-white text-xs font-mono font-bold tracking-wider shadow-lg shadow-red-600/25 transition-all hover:-translate-y-0.5 cursor-pointer", children: [_jsx("span", { children: "START A PROJECT" }), _jsx(ArrowUpRight, { className: "w-4 h-4" })] }), _jsx("button", { type: "button", onClick: () => onNavigate('packages'), className: "inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-neutral-100 border border-white/10 hover:border-white/20 text-xs font-mono font-bold tracking-wider transition-all cursor-pointer", children: _jsx("span", { children: "VIEW PACKAGES" }) })] }), _jsx("div", { className: "mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3", children: stats.map((stat, i) => (_jsxs("div", { className: "tba-rise rounded-2xl bg-black/40 border border-white/10 px-4 py-3.5", style: { ['--d']: `${480 + i * 90}ms` }, children: [_jsx("div", { className: "font-display text-2xl sm:text-[1.7rem] font-bold text-white leading-none tabular-nums", children: _jsx(CountUp, { to: stat.to, decimals: stat.decimals, suffix: stat.suffix }) }), _jsx("div", { className: "mt-1.5 text-[11px] font-mono uppercase tracking-wider text-neutral-400", children: stat.label })] }, stat.label))) })] }), _jsx("div", { className: "lg:col-span-5 flex justify-center", children: _jsx("div", { className: "tba-rise tba-float w-full max-w-[17rem] sm:max-w-[22rem] lg:max-w-[26rem]", style: { ['--d']: '300ms' }, children: _jsx(OrbitVisual, {}) }) })] })] }));
};
