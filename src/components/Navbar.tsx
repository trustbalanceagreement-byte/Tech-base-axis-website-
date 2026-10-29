import React, { useState } from 'react';
import { motion } from 'motion/react';
import { TechBaseAxisLogo } from './TechBaseAxisLogo';
import { NavSection } from '../types';
import { useAuth } from '../context/AuthContext';
import { UserAvatar } from './UserAvatar';
import { UserAuthModal } from './UserAuthModal';
import { UserAccountModal } from './UserAccountModal';
import { 
  Home, 
  Layers, 
  Package, 
  Send, 
  ShieldCheck, 
  Menu, 
  X, 
  ArrowUpRight,
  LogIn
} from 'lucide-react';

interface NavbarProps {
  activeSection: NavSection;
  onNavigate: (section: NavSection) => void;
  inquiryCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeSection,
  onNavigate,
  inquiryCount = 0
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const { user, isAdmin } = useAuth();

  const baseNavItems: { id: NavSection; label: string; icon: React.ElementType; badge?: string }[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'projects', label: 'Projects', icon: Layers },
    { id: 'packages', label: 'Packages', icon: Package },
    { id: 'contact', label: 'Contact', icon: Send },
  ];

  // Navigation links: Admin Panel page ONLY shows in navigation when authenticated as Admin (techbaseaxis@gmail.com)
  const navItems = [
    ...baseNavItems,
    ...(isAdmin ? [{ 
      id: 'admin' as NavSection, 
      label: 'Admin Panel', 
      icon: ShieldCheck, 
      badge: inquiryCount > 0 ? `${inquiryCount}` : undefined 
    }] : []),
  ];

  const handleNavClick = (section: NavSection) => {
    onNavigate(section);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const displayNameShort = user?.displayName?.split(' ')[0] || (isAdmin ? 'Bikram' : 'Account');

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-neutral-800/80 bg-[#0a0a0c]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-2">
          
          {/* Logo & Brand Identity */}
          <div 
            onClick={() => handleNavClick('home')}
            className="cursor-pointer group py-1.5 shrink min-w-0"
          >
            <TechBaseAxisLogo size="md" subtitle="BIKRAM GHOSH // PORTFOLIO" />
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5 bg-[#121216] p-1.5 rounded-xl border border-neutral-800">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-btn-${item.id}`}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-1.5 lg:gap-2 px-2.5 lg:px-3 py-1.5 lg:py-2 rounded-lg text-xs lg:text-sm font-medium transition-colors duration-200 relative ${
                    isActive
                      ? 'text-white'
                      : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/40'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeNavTab"
                      className="absolute inset-0 bg-red-950/50 border border-red-600/40 rounded-lg shadow-[0_0_15px_-3px_rgba(230,30,43,0.35)] -z-0"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-2">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#e61e2b]' : 'text-neutral-400'}`} />
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="ml-1 px-1.5 py-0.5 text-[10px] font-mono rounded-full bg-red-600/20 text-red-300 border border-red-600/40">
                        {item.badge}
                      </span>
                    )}
                    {item.id === 'admin' && (
                      <span className="text-[10px] uppercase font-mono px-1 py-0.2 rounded bg-neutral-800 text-neutral-400 border border-neutral-700">
                        Portal
                      </span>
                    )}
                  </span>
                </button>
              );
            })}
          </nav>

          {/* Desktop Actions: Start Project & Login / Account */}
          <div className="hidden md:flex items-center gap-2.5">
            {user ? (
              <button
                id="nav-header-account-btn"
                onClick={() => setAccountModalOpen(true)}
                className="flex items-center gap-1.5 px-2.5 py-1 h-7 text-[11px] font-mono font-medium rounded-lg border border-neutral-800 hover:border-neutral-700 bg-[#121216] text-neutral-200 hover:text-white transition-all cursor-pointer shadow-sm"
                title="Account Settings"
              >
                <UserAvatar user={user} size="xs" />
                <span className="text-white font-mono tracking-tight text-[11px]">{displayNameShort}</span>
              </button>
            ) : (
              <button
                id="nav-header-login-btn"
                onClick={() => setAuthModalOpen(true)}
                className="flex items-center gap-1.5 px-2.5 py-1 h-7 text-[11px] font-mono font-medium rounded-lg border border-neutral-800 hover:border-neutral-700 bg-[#121216] hover:bg-neutral-800/60 text-white transition-all cursor-pointer shadow-sm"
                title="Sign In to Portal"
              >
                <LogIn className="w-3 h-3 text-[#e61e2b] shrink-0" />
                <span className="text-white font-mono tracking-tight text-[11px]">Login</span>
              </button>
            )}

            <button
              id="nav-cta-initiate-project"
              onClick={() => handleNavClick('contact')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-lg bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-mono tracking-tight shadow-md shadow-red-600/20 transition-all duration-200 group cursor-pointer"
            >
              <span>Start Project</span>
              <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>
          </div>

          {/* Mobile Header Controls: Login / Account & Hamburger Toggle */}
          <div className="flex md:hidden items-center gap-1.5 shrink-0">
            {user ? (
              <button
                id="mobile-header-profile-btn"
                onClick={() => setAccountModalOpen(true)}
                className="flex items-center gap-1 px-2 py-0.5 h-6.5 rounded-lg text-[10px] font-mono font-medium border border-neutral-800 bg-[#121216] text-neutral-200 hover:text-white hover:border-neutral-700 transition-all cursor-pointer active:scale-95"
                title="User Account"
              >
                <UserAvatar user={user} size="xs" />
                <span className="text-white font-mono tracking-tight text-[10px]">{displayNameShort}</span>
              </button>
            ) : (
              <button
                id="mobile-header-login-btn"
                onClick={() => setAuthModalOpen(true)}
                className="flex items-center gap-1 px-2 py-0.5 h-6.5 rounded-lg text-[10px] font-mono font-medium border border-neutral-800 hover:border-neutral-700 bg-[#121216] hover:bg-neutral-800/60 text-white transition-all cursor-pointer active:scale-95"
                title="Sign In to Portal"
              >
                <LogIn className="w-2.5 h-2.5 text-[#e61e2b] shrink-0" />
                <span className="text-white font-mono tracking-tight text-[10px]">Login</span>
              </button>
            )}

            <button
              id="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white bg-[#121216] border border-neutral-800 cursor-pointer active:scale-95 shrink-0"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer (Matches Screenshot 4) */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-neutral-800 bg-[#101014] px-4 pt-3 pb-6 space-y-3">
            {/* Top User Profile Card inside Drawer (if logged in) */}
            {user ? (
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-neutral-900/90 border border-neutral-800 shadow-sm">
                <div className="flex items-center gap-3 min-w-0">
                  <UserAvatar user={user} size="md" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-white text-sm truncate">
                        {user.displayName || (isAdmin ? 'Bikram Ghosh' : 'Member')}
                      </span>
                      {isAdmin && (
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded font-bold uppercase bg-red-950/80 text-red-300 border border-red-600/40">
                          FOUNDER
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-neutral-400 font-mono truncate">{user.email}</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => { setAccountModalOpen(true); setMobileMenuOpen(false); }}
                  className="px-3 py-1.5 rounded-xl text-xs font-mono font-medium bg-red-950/40 hover:bg-red-950/70 text-red-200 border border-red-800/40 transition-colors shrink-0 cursor-pointer"
                >
                  Account
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between p-4 rounded-2xl bg-[#121216] border border-neutral-800 shadow-sm">
                <div>
                  <div className="text-sm font-bold text-white tracking-tight">
                    Client Portal
                  </div>
                  <div className="text-xs text-neutral-400 font-sans mt-0.5">
                    Sign in to initialize inquiries
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => { setAuthModalOpen(true); setMobileMenuOpen(false); }}
                  className="px-4 py-2 rounded-xl text-xs font-mono font-medium text-red-200 bg-[#221013] hover:bg-[#2c1418] border border-red-900/40 hover:border-red-800/60 transition-colors shrink-0 cursor-pointer"
                >
                  Login
                </button>
              </div>
            )}

            {/* Navigation Links inside Drawer */}
            <div className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                const isAdminItem = item.id === 'admin';

                return (
                  <button
                    key={item.id}
                    id={`mobile-nav-${item.id}`}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'text-white bg-red-950/40 border border-red-600/40'
                        : isAdminItem
                        ? 'text-red-300 bg-red-950/25 border border-red-600/40 hover:bg-red-950/40'
                        : 'text-neutral-300 hover:bg-neutral-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive || isAdminItem ? 'text-[#e61e2b]' : 'text-neutral-400'}`} />
                      <span className={isAdminItem ? 'font-bold text-white' : ''}>{item.label}</span>
                    </div>
                    {isAdminItem ? (
                      <div className="flex items-center gap-1.5">
                        {item.badge && (
                          <span className="px-2 py-0.5 text-xs font-mono rounded bg-red-600 text-white font-bold">
                            {item.badge}
                          </span>
                        )}
                        <span className="px-1.5 py-0.5 text-[9px] font-mono rounded bg-red-950 text-red-300 border border-red-600/40 uppercase font-semibold">
                          Founder
                        </span>
                      </div>
                    ) : (
                      item.badge && (
                        <span className="px-2 py-0.5 text-xs font-mono rounded bg-red-600/20 text-red-300">
                          {item.badge}
                        </span>
                      )
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </header>

      {/* User Portal Auth Modal */}
      <UserAuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onLoginSuccess={(_isUserAdmin) => {
          handleNavClick('home');
        }}
      />

      {/* User Account / Profile Modal */}
      <UserAccountModal
        isOpen={accountModalOpen}
        onClose={() => setAccountModalOpen(false)}
        onNavigate={handleNavClick}
      />
    </>
  );
};
