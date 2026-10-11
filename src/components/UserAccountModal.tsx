import React from 'react';
import { 
  X, 
  User as UserIcon, 
  Mail, 
  ShieldCheck, 
  LogOut, 
  ExternalLink,
  Layers,
  Send
} from 'lucide-react';
import { TechBaseAxisLogo } from './TechBaseAxisLogo';
import { UserAvatar } from './UserAvatar';
import { useAuth } from '../context/AuthContext';
import { NavSection } from '../types';

interface UserAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (section: NavSection) => void;
}

export const UserAccountModal: React.FC<UserAccountModalProps> = ({
  isOpen,
  onClose,
  onNavigate
}) => {
  const { user, isAdmin, logout } = useAuth();

  if (!isOpen || !user) return null;

  const handleLogout = async () => {
    try {
      localStorage.removeItem('tba_admin_console_unlocked');
      localStorage.removeItem('tba_admin_session');
    } catch (_) {}
    await logout();
    onClose();
    onNavigate('home');
  };

  const handleGoToAdmin = () => {
    onNavigate('admin');
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-[420px] max-h-[92dvh] sm:max-h-[90vh] flex flex-col p-4 sm:p-6 md:p-7 rounded-2xl sm:rounded-3xl bg-[#0e0e12] border border-neutral-800 shadow-[0_0_60px_rgba(0,0,0,0.95)] text-neutral-100 overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle Ambient Radial Glow */}
        <div className="absolute -top-20 -right-20 w-44 sm:w-56 h-44 sm:h-56 bg-red-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-44 sm:w-56 h-44 sm:h-56 bg-red-950/25 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header: Brand Logo & Close button */}
        <div className="relative z-10 flex items-center justify-between pb-3 sm:pb-4 border-b border-neutral-900 shrink-0">
          <TechBaseAxisLogo size="sm" subtitle="BIKRAM GHOSH" />
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800/60 border border-transparent hover:border-neutral-700/60 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="relative z-10 overflow-y-auto pr-0.5 sm:pr-1 pt-3 sm:pt-4 space-y-3 sm:space-y-4 [scrollbar-width:thin]">
          {/* Profile Details Card */}
          <div className="flex items-center gap-3 sm:gap-4 p-3.5 sm:p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800">
            <UserAvatar user={user} size="lg" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
                <h3 className="text-sm sm:text-base font-bold text-white truncate">
                  {user.displayName || (isAdmin ? 'Bikram Ghosh' : 'Member')}
                </h3>
                {isAdmin && (
                  <span className="text-[9px] sm:text-[10px] font-mono px-1.5 sm:px-2 py-0.5 rounded font-bold uppercase shrink-0 bg-red-950/80 text-red-300 border border-red-600/40">
                    FOUNDER
                  </span>
                )}
              </div>
              <div className="text-xs text-neutral-400 font-mono truncate flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                <span className="truncate">{user.email}</span>
              </div>
            </div>
          </div>

          {/* Action Options */}
          <div className="space-y-2 sm:space-y-2.5">
            {isAdmin && (
              <button
                type="button"
                onClick={handleGoToAdmin}
                className="w-full flex items-center justify-between p-3 sm:p-3.5 rounded-xl bg-red-950/30 hover:bg-red-950/60 border border-red-600/40 text-red-200 text-xs sm:text-sm font-medium transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-[#e61e2b]" />
                  <span className="font-semibold text-white">Open Admin Console</span>
                </div>
                <ExternalLink className="w-4 h-4 text-red-400" />
              </button>
            )}

            <button
              type="button"
              onClick={() => { onNavigate('projects'); onClose(); }}
              className="w-full flex items-center justify-between p-3 sm:p-3.5 rounded-xl bg-neutral-900/60 hover:bg-neutral-800/80 border border-neutral-800 text-neutral-300 hover:text-white text-xs sm:text-sm transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Layers className="w-4 h-4 text-neutral-400" />
                <span>Explore Projects</span>
              </div>
              <ExternalLink className="w-4 h-4 text-neutral-500" />
            </button>

            <button
              type="button"
              onClick={() => { onNavigate('contact'); onClose(); }}
              className="w-full flex items-center justify-between p-3 sm:p-3.5 rounded-xl bg-neutral-900/60 hover:bg-neutral-800/80 border border-neutral-800 text-neutral-300 hover:text-white text-xs sm:text-sm transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Send className="w-4 h-4 text-neutral-400" />
                <span>Direct Inquiry with Founder</span>
              </div>
              <ExternalLink className="w-4 h-4 text-neutral-500" />
            </button>
          </div>

          {/* Sign Out Button */}
          <button
            type="button"
            onClick={handleLogout}
            className="w-full py-2.5 sm:py-3 px-4 rounded-xl text-xs font-mono font-semibold text-rose-400 hover:text-rose-300 bg-rose-950/30 hover:bg-rose-950/60 border border-rose-900/40 hover:border-rose-800/60 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] mt-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out of Account</span>
          </button>
        </div>
      </div>
    </div>
  );
};
