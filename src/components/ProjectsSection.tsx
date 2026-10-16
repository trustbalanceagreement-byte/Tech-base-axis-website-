import React, { useState, useEffect } from 'react';
import { Project, NavSection } from '../types';
import { PROJECTS_DATA } from '../data/mockData';
import { ProjectMediaPlayer } from './ProjectMediaPlayer';
import { 
  Search, 
  Layers, 
  ExternalLink, 
  Github, 
  ArrowUpRight, 
  CheckCircle2, 
  X, 
  Cpu, 
  Server, 
  ShieldAlert, 
  Terminal,
  Activity,
  Film,
  Image as ImageIcon
} from 'lucide-react';

interface ProjectsSectionProps {
  onNavigate: (section: NavSection) => void;
  selectedProjectModal: Project | null;
  onOpenProjectModal: (project: Project | null) => void;
  projects?: Project[];
}

export const ProjectsSection: React.FC<ProjectsSectionProps> = ({
  onNavigate,
  selectedProjectModal,
  onOpenProjectModal,
  projects
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = [
    'All',
    'Full-Stack SaaS',
    'AI & Intelligence',
    'Cloud & Infra',
    'Fintech & Web3'
  ];

  const handleCategorySelect = (cat: string) => {
    setSelectedCategory(cat);
  };

  const sourceProjects = projects || [];

  const filteredProjects = sourceProjects.filter((project) => {
    const matchesCategory = selectedCategory === 'All' || project.category === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    if (!q) return matchesCategory;

    const matchesSearch = 
      (project.title || '').toLowerCase().includes(q) ||
      (project.subtitle || '').toLowerCase().includes(q) ||
      (project.description || '').toLowerCase().includes(q) ||
      (Array.isArray(project.techStack) && project.techStack.some(t => typeof t === 'string' && t.toLowerCase().includes(q)));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 text-neutral-100">
      {/* Header */}
      <div className="max-w-3xl">
        <div className="text-xs font-mono text-[#e61e2b] uppercase tracking-widest mb-2 flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#e61e2b]" />
          <span>PROJECTS & ARCHITECTURE SHOWCASE</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-4">
          Production Systems Engineered by Tech Base Axis
        </h1>
        <p className="text-base sm:text-lg text-neutral-300 leading-relaxed">
          Explore production-grade architectures built by Bikram Ghosh. Each project reflects strict engineering principles: zero-downtime reliability, bank-grade data security, and high-performance UI responsiveness.
        </p>
      </div>

      {/* When no projects are published yet by Admin */}
      {sourceProjects.length === 0 ? (
        <div className="text-center py-20 px-6 obsidian-card rounded-3xl border border-neutral-800 relative overflow-hidden">
          <div className="absolute inset-0 bg-radial from-red-600/5 via-transparent to-transparent pointer-events-none" />
          
          <div className="relative z-10 max-w-xl mx-auto space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-neutral-900/90 border border-neutral-800 text-[#e61e2b] flex items-center justify-center mx-auto shadow-xl shadow-black">
              <Layers className="w-8 h-8 animate-pulse" />
            </div>

            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-red-950/60 text-[#e61e2b] border border-red-600/30 mb-3">
                <span className="w-2 h-2 rounded-full bg-[#e61e2b] animate-ping" />
                <span>Showcase Under Preparation</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                No Projects Published Yet
              </h2>
              <p className="text-sm text-neutral-400 mt-2 leading-relaxed font-mono">
                Production architectures and project showcases will appear here as soon as uploaded from the Tech Base Axis admin dashboard.
              </p>
            </div>

            <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => onNavigate('contact')}
                className="px-6 py-3 rounded-xl bg-[#e61e2b] hover:bg-red-500 text-white font-mono text-xs font-bold shadow-lg shadow-red-600/25 transition-all cursor-pointer flex items-center gap-2"
              >
                <span>Request Custom Architecture</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Filter & Search Bar: Fully responsive on mobile and desktop */}
          <div className="flex flex-col md:flex-row gap-3 sm:gap-4 justify-between items-stretch md:items-center pt-4 border-t border-neutral-800">
            {/* Category Pills with smooth horizontal swipe on small mobile */}
            <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar pb-1 sm:pb-0 -mx-1 px-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleCategorySelect(cat)}
                  className={`px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs font-mono transition-all duration-200 cursor-pointer shrink-0 whitespace-nowrap ${
                    selectedCategory === cat
                      ? 'bg-[#e61e2b] text-white font-bold shadow-md shadow-red-600/25'
                      : 'bg-neutral-900/90 text-neutral-400 hover:text-white border border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search Field */}
            <div className="relative w-full md:w-72 lg:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
              <input
                type="text"
                placeholder="Search systems, stack..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-neutral-900/80 border border-neutral-800 rounded-xl text-xs font-mono text-neutral-200 focus:outline-none focus:border-[#e61e2b] focus:ring-1 focus:ring-[#e61e2b]/50 transition-all placeholder:text-neutral-500"
              />
            </div>
          </div>

          {/* Projects Grid: Responsive columns & zero overflow */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className="obsidian-card rounded-2xl p-4 sm:p-6 lg:p-7 border border-neutral-800 flex flex-col justify-between hover:border-[#e61e2b]/50 transition-all duration-300 relative group overflow-hidden"
              >
                <div>
                  {/* Card Header Status */}
                  <div className="flex items-center justify-between gap-2 mb-3 sm:mb-4">
                    <span className="px-2.5 py-1 rounded-md text-[10px] sm:text-[11px] font-mono font-medium bg-neutral-900 text-neutral-200 border border-neutral-800">
                      {project.category}
                    </span>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-neutral-500">{project.year}</span>
                      <span className="text-[10px] sm:text-[11px] font-mono px-2 py-0.5 rounded-full bg-neutral-900 text-[#e61e2b] border border-red-600/30 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#e61e2b] animate-pulse" />
                        {project.status}
                      </span>
                    </div>
                  </div>

                  {/* Media Preview: Image or Video / Instagram Reel */}
                  {(project.imageUrl || project.videoUrl) && (
                    <div className="mb-4 rounded-xl overflow-hidden border border-neutral-800/80">
                      <ProjectMediaPlayer
                        imageUrl={project.imageUrl}
                        videoUrl={project.videoUrl}
                        title={project.title}
                        compact={true}
                      />
                    </div>
                  )}

                  {/* Title & Subtitle */}
                  <h2 className="text-xl sm:text-2xl font-bold text-white mb-1 group-hover:text-red-400 transition-colors">
                    {project.title}
                  </h2>
                  <div className="text-xs font-mono text-[#e61e2b]/90 mb-3 sm:mb-4">{project.subtitle}</div>

                  {/* Description */}
                  <p className="text-neutral-300 text-xs sm:text-sm leading-relaxed mb-4 sm:mb-6">
                    {project.description}
                  </p>

                  {/* Metrics Strip: Compact & wrap-safe on mobile */}
                  <div className="grid grid-cols-3 gap-1.5 sm:gap-2 p-2.5 sm:p-3.5 rounded-xl bg-neutral-900/90 border border-neutral-800 mb-4 sm:mb-6">
                    {project.metrics.map((m, idx) => (
                      <div key={idx} className="text-center px-1">
                        <div className="text-xs sm:text-sm font-bold font-mono text-white tracking-tight truncate">
                          {m.value}
                        </div>
                        <div className="text-[9px] sm:text-[10px] text-neutral-400 font-mono mt-0.5 truncate">{m.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Architecture Highlight Bullets */}
                  <div className="space-y-1.5 sm:space-y-2 mb-4 sm:mb-6">
                    {project.architectureHighlights.slice(0, 2).map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-neutral-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#e61e2b] shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{item}</span>
                      </div>
                    ))}
                  </div>

                  {/* Tech Stack Chips */}
                  <div className="flex flex-wrap gap-1.5 mb-4 sm:mb-6">
                    {project.techStack.map((tech, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded text-[10px] sm:text-[11px] font-mono bg-neutral-950 text-neutral-300 border border-neutral-800"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="pt-3 sm:pt-4 border-t border-neutral-800 flex items-center justify-between gap-2 sm:gap-3">
                  <button
                    onClick={() => onOpenProjectModal(project)}
                    className="flex-1 py-2 sm:py-2.5 px-3 sm:px-4 rounded-xl bg-red-950/40 hover:bg-red-900/50 text-white text-xs font-mono font-bold border border-red-600/30 hover:border-red-500 transition-all flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer"
                  >
                    <span>Architecture Deep-Dive</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </button>

                  {project.demoUrl && (
                    <a
                      href={project.demoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 sm:p-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800 transition-colors shrink-0"
                      title="Live Demo"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}

                  {project.githubUrl && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 sm:p-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800 transition-colors shrink-0"
                      title="Source Code"
                    >
                      <Github className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>

          {filteredProjects.length === 0 && (
            <div className="text-center py-16 obsidian-card rounded-2xl border border-neutral-800 p-6">
              <Terminal className="w-10 h-10 text-neutral-600 mx-auto mb-3" />
              <div className="text-base sm:text-lg font-bold text-white mb-1">No systems match your filter criteria</div>
              <p className="text-xs sm:text-sm text-neutral-400 mb-4 font-mono">Try clearing your search query or selecting "All" categories.</p>
              <button
                onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }}
                className="px-4 py-2 rounded-lg bg-neutral-800 text-xs font-mono text-[#e61e2b] hover:bg-neutral-700 cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          )}
        </>
      )}

      {/* Project Detail Modal: Fully mobile and desktop responsive */}
      {selectedProjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-3xl my-3 sm:my-8 p-4 sm:p-6 lg:p-8 rounded-2xl bg-[#111115] border border-red-600/30 shadow-2xl space-y-5 sm:space-y-6 max-h-[94vh] overflow-y-auto">
            {/* Close button with high z-index and tap area */}
            <button
              onClick={() => onOpenProjectModal(null)}
              className="absolute top-4 right-4 sm:top-5 sm:right-5 p-2 rounded-lg bg-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-700 transition-colors z-20 cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header: Padded right to prevent collision with close button */}
            <div className="pr-10 sm:pr-12">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="text-xs font-mono text-[#e61e2b] px-2 py-0.5 rounded bg-red-950/60 border border-red-600/30">
                  {selectedProjectModal.category}
                </span>
                <span className="text-xs font-mono text-neutral-500">{selectedProjectModal.year}</span>
              </div>
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white leading-tight">
                {selectedProjectModal.title}
              </h3>
              <div className="text-xs sm:text-sm font-mono text-[#e61e2b] mt-1">
                {selectedProjectModal.subtitle}
              </div>
            </div>

            {/* Media Player Showcase in Modal (Instagram Reel / Video / Photo) */}
            {(selectedProjectModal.imageUrl || selectedProjectModal.videoUrl) && (
              <div className="rounded-2xl overflow-hidden border border-neutral-800 shadow-2xl bg-black">
                <ProjectMediaPlayer
                  imageUrl={selectedProjectModal.imageUrl}
                  videoUrl={selectedProjectModal.videoUrl}
                  title={selectedProjectModal.title}
                  compact={false}
                />
              </div>
            )}

            {/* Overview Section */}
            <div>
              <h4 className="text-xs font-mono uppercase tracking-widest text-neutral-400 mb-2 flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#e61e2b]" />
                <span>System Overview & Architecture Goals</span>
              </h4>
              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed bg-neutral-900/60 p-3 sm:p-4 rounded-xl border border-neutral-800">
                {selectedProjectModal.fullOverview}
              </p>
            </div>

            {/* Key Engineering Highlights */}
            <div>
              <h4 className="text-xs font-mono uppercase tracking-widest text-neutral-400 mb-2.5 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-[#e61e2b]" />
                <span>Technical Innovations & Hardening</span>
              </h4>
              <div className="space-y-2">
                {selectedProjectModal.architectureHighlights.map((hl, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 p-2.5 sm:p-3 rounded-lg bg-neutral-900/80 border border-neutral-800 text-xs sm:text-sm text-neutral-200">
                    <CheckCircle2 className="w-4 h-4 text-[#e61e2b] shrink-0 mt-0.5" />
                    <span>{hl}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Benchmark Metrics: Responsive columns */}
            <div>
              <h4 className="text-xs font-mono uppercase tracking-widest text-neutral-400 mb-2.5">
                Operational Metrics
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                {selectedProjectModal.metrics.map((m, idx) => (
                  <div key={idx} className="p-2.5 sm:p-3 rounded-xl bg-neutral-900 border border-neutral-800 text-center">
                    <div className="text-base sm:text-lg font-bold font-mono text-[#e61e2b]">{m.value}</div>
                    <div className="text-[11px] text-neutral-400 font-mono mt-0.5">{m.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Stack Tags */}
            <div>
              <h4 className="text-xs font-mono uppercase tracking-widest text-neutral-400 mb-2">
                Technology Stack
              </h4>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {selectedProjectModal.techStack.map((tech, idx) => (
                  <span key={idx} className="px-2.5 py-1 rounded-md text-[11px] sm:text-xs font-mono bg-neutral-900 text-neutral-200 border border-neutral-800">
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Modal Bottom CTA */}
            <div className="pt-4 border-t border-neutral-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="text-xs text-neutral-400 font-mono text-center sm:text-left">
                Need a similar system architecture for your company?
              </div>
              <button
                onClick={() => {
                  onOpenProjectModal(null);
                  onNavigate('contact');
                }}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#e61e2b] hover:bg-red-500 text-white font-bold text-xs font-mono tracking-wide transition-colors shadow-md shadow-red-600/20 text-center cursor-pointer"
              >
                Discuss Similar Architecture With Bikram
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
