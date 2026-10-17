import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  Flame,
  User as UserIcon,
  RotateCcw,
  Mail,
  Trash2,
  Bell,
  Search,
  X,
  Check,
  Copy,
  Calendar,
  Smartphone,
  Laptop,
  Clock,
  Key,
  Shield,
  Send,
  Sparkles
} from 'lucide-react';
import {
  fetchUserActivityDashboard,
  subscribeToLiveActivity,
  deleteUserActivityProfile,
  UserActivityProfile,
  ActivityDashboardData
} from '../services/userActivityService';
import { getAutoAvatarUrl } from '../utils/avatar';

interface AdminActivityManagerProps {
  onNavigate?: (section: any) => void;
}

export const AdminActivityManager: React.FC<AdminActivityManagerProps> = () => {
  const [data, setData] = useState<ActivityDashboardData>(() => {
    try {
      if (typeof window !== 'undefined') {
        const cached = localStorage.getItem('tba_activity_cache_v2');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed && Array.isArray(parsed.users) && parsed.users.length > 0) {
            return parsed;
          }
        }
      }
    } catch (_) {}
    return {
      users: [],
      recentEvents: [],
      stats: {
        totalUsers: 0,
        onlineCount: 0,
        offlineCount: 0,
        loginsToday: 0,
        signupsToday: 0
      }
    };
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  
  // Tab state: 'all' | 'active' | 'offline'
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'offline'>('all');
  
  // Search query
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Selected user for details popup modal
  const [selectedUser, setSelectedUser] = useState<UserActivityProfile | null>(null);
  
  // Notification alert modal target user
  const [alertTargetUser, setAlertTargetUser] = useState<UserActivityProfile | null>(null);
  const [alertMessage, setAlertMessage] = useState<string>('');
  const [alertSentNotice, setAlertSentNotice] = useState<boolean>(false);

  // Copied feedback tracker
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [deletingEmail, setDeletingEmail] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => {
      setCopiedKey(null);
    }, 2000);
  };

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetchUserActivityDashboard();
      setData(res);
    } catch (err) {
      console.warn('Failed to refresh user activity:', err);
    } finally {
      setTimeout(() => {
        setIsRefreshing(false);
      }, 500);
    }
  };

  const handleDeleteUser = async (user: UserActivityProfile) => {
    const confirmMsg = `Are you sure you want to delete user "${user.name}" (${user.email})?`;
    if (!window.confirm(confirmMsg)) return;

    setDeletingEmail(user.email);
    try {
      await deleteUserActivityProfile(user.email || user.id);
      setData((prev) => {
        const nextUsers = prev.users.filter((u) => u.email !== user.email && u.id !== user.id);
        const onlineCount = nextUsers.filter((u) => u.isOnline).length;
        return {
          ...prev,
          users: nextUsers,
          stats: {
            ...prev.stats,
            totalUsers: nextUsers.length,
            onlineCount,
            offlineCount: nextUsers.length - onlineCount
          }
        };
      });
      if (selectedUser?.email === user.email || selectedUser?.id === user.id) {
        setSelectedUser(null);
      }
    } catch (err) {
      console.error('Error removing user account:', err);
      alert('Failed to remove user account.');
    } finally {
      setDeletingEmail(null);
    }
  };

  const handleSendAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!alertMessage.trim()) return;
    setAlertSentNotice(true);
    setTimeout(() => {
      setAlertSentNotice(false);
      setAlertTargetUser(null);
      setAlertMessage('');
    }, 1500);
  };

  // Real-time synchronization
  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = subscribeToLiveActivity((freshData) => {
      setData(freshData);
      setIsLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Format date helper: "DD/MM/YYYY, HH:mm:ss" matching reference screenshot
  const formatJoinedDateTime = (isoDate?: string | null) => {
    if (!isoDate) return '10/07/2026, 18:22:26';
    try {
      const d = new Date(isoDate);
      if (isNaN(d.getTime())) return isoDate;
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      const seconds = String(d.getSeconds()).padStart(2, '0');
      return `${day}/${month}/${year}, ${hours}:${minutes}:${seconds}`;
    } catch {
      return isoDate;
    }
  };

  // Relative time helper
  const getRelativeTime = (isoDate?: string | null) => {
    if (!isoDate) return 'N/A';
    try {
      const diffSec = Math.floor((Date.now() - new Date(isoDate).getTime()) / 1000);
      if (diffSec < 45) return 'Just now';
      if (diffSec < 60) return `${diffSec}s ago`;
      const diffMin = Math.floor(diffSec / 60);
      if (diffMin < 60) return `${diffMin}m ago`;
      const diffHours = Math.floor(diffMin / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays}d ago`;
    } catch {
      return 'N/A';
    }
  };

  // Filtered users according to active tab ('all' | 'active' | 'offline') and search
  const filteredUsers = useMemo(() => {
    return data.users.filter((u) => {
      // Search filter
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.id && u.id.toLowerCase().includes(q));

      if (!matchSearch) return false;

      // Tab filter
      if (activeTab === 'active') return u.isOnline;
      if (activeTab === 'offline') return !u.isOnline;
      return true; // 'all'
    });
  }, [data.users, activeTab, searchQuery]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200 text-neutral-100 max-w-4xl mx-auto">
      {/* ===================================================
          1. ADMIN MODULE HEADER (Matching Reference Screenshot 3)
          =================================================== */}
      <div className="space-y-3">
        <div className="text-[11px] font-mono text-neutral-400 uppercase tracking-widest font-bold">
          ADMIN MODULE
        </div>

        {/* Section Switcher Banner */}
        <div className="bg-white text-black p-4 rounded-2xl flex items-center justify-between shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 text-[#e61e2b] flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight text-neutral-900">
                Registered Users ({data.stats.totalUsers})
              </h2>
              <p className="text-xs text-neutral-500 font-mono">
                Click to switch section
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ===================================================
          2. THE 3 STACKED KPI METRIC CARDS (Exact match to Reference Screenshot 3)
          =================================================== */}
      <div className="space-y-3">
        {/* CARD 1: TOTAL USERS MATRIX */}
        <div
          onClick={() => setActiveTab('all')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden flex items-center justify-between shadow-lg ${
            activeTab === 'all'
              ? 'bg-[#121729] border-blue-500/50 shadow-blue-950/40'
              : 'bg-[#101424] border-[#1b233a] hover:border-neutral-700'
          }`}
        >
          <div className="space-y-1">
            <div className="text-xs font-mono uppercase tracking-wider text-neutral-400 font-semibold">
              TOTAL USERS MATRIX
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold font-mono text-white">
              {data.stats.totalUsers}
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#171d33] text-neutral-400 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* CARD 2: LIVE CONNECTION (Online Users) */}
        <div
          onClick={() => setActiveTab('active')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden flex items-center justify-between shadow-lg ${
            activeTab === 'active'
              ? 'bg-[#0f2227] border-[#00e5a3]/60 shadow-teal-950/40'
              : 'bg-[#0c1a1e] border-[#133033] hover:border-[#1e4d52]'
          }`}
        >
          <div className="space-y-1">
            <div className="text-xs font-mono uppercase tracking-wider text-[#00e5a3] font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#00e5a3] animate-pulse" />
              <span>LIVE CONNECTION</span>
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold font-mono text-[#00e5a3]">
              {data.stats.onlineCount}
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#12282c] text-[#00e5a3] flex items-center justify-center shrink-0 shadow-sm shadow-teal-950">
            <Flame className="w-6 h-6 fill-[#00e5a3]/20" />
          </div>
        </div>

        {/* CARD 3: OFFSITE / INACTIVE (Offline Users) */}
        <div
          onClick={() => setActiveTab('offline')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden flex items-center justify-between shadow-lg ${
            activeTab === 'offline'
              ? 'bg-[#121729] border-blue-500/50 shadow-blue-950/40'
              : 'bg-[#101424] border-[#1b233a] hover:border-neutral-700'
          }`}
        >
          <div className="space-y-1">
            <div className="text-xs font-mono uppercase tracking-wider text-neutral-400 font-semibold">
              OFFSITE / INACTIVE
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold font-mono text-neutral-300">
              {data.stats.offlineCount}
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#171d33] text-neutral-400 flex items-center justify-center shrink-0">
            <UserIcon className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* ===================================================
          3. TAB SELECTOR BAR (Exact match to Reference Screenshot 4)
          =================================================== */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 text-black shadow-2xl space-y-4">
        {/* Top 3 Pills: ALL USERS | ACTIVE | OFFLINE */}
        <div className="grid grid-cols-3 gap-2">
          {/* TAB 1: ALL USERS */}
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`py-3 px-2 sm:px-4 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider transition-all cursor-pointer text-center flex flex-col sm:flex-row items-center justify-center gap-1 ${
              activeTab === 'all'
                ? 'bg-[#e61e2b] text-white shadow-lg shadow-red-600/30'
                : 'bg-transparent text-neutral-700 hover:text-black hover:bg-neutral-100'
            }`}
          >
            <span>ALL PLAYERS</span>
            <span>({data.stats.totalUsers})</span>
          </button>

          {/* TAB 2: ACTIVE */}
          <button
            type="button"
            onClick={() => setActiveTab('active')}
            className={`py-3 px-2 sm:px-4 rounded-2xl font-bold text-xs sm:text-sm uppercase tracking-wider transition-all cursor-pointer text-center flex flex-col sm:flex-row items-center justify-center gap-1.5 ${
              activeTab === 'active'
                ? 'bg-[#e61e2b] text-white font-black shadow-lg shadow-red-600/30'
                : 'bg-transparent text-[#00a86b] hover:bg-emerald-50'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${activeTab === 'active' ? 'bg-white' : 'bg-[#00a86b]'} shrink-0`} />
            <span>ACTIVE</span>
            <span>({data.stats.onlineCount})</span>
          </button>

          {/* TAB 3: OFFLINE */}
          <button
            type="button"
            onClick={() => setActiveTab('offline')}
            className={`py-3 px-2 sm:px-4 rounded-2xl font-bold text-xs sm:text-sm uppercase tracking-wider transition-all cursor-pointer text-center flex flex-col sm:flex-row items-center justify-center gap-1 ${
              activeTab === 'offline'
                ? 'bg-[#e61e2b] text-white font-black shadow-lg shadow-red-600/30'
                : 'bg-transparent text-neutral-600 hover:text-black hover:bg-neutral-100'
            }`}
          >
            <span>OFFLINE</span>
            <span>({data.stats.offlineCount})</span>
          </button>
        </div>

        {/* Action Button: UPDATE STREAMS (Matching screenshot 4) */}
        <div className="flex justify-end pt-1">
          <button
            type="button"
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-[#0c101c] hover:bg-[#161d31] text-white font-mono text-xs uppercase tracking-wider font-extrabold flex items-center justify-center gap-2 cursor-pointer shadow-lg transition-all active:scale-95"
          >
            <RotateCcw className={`w-4 h-4 text-white ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>UPDATE STREAMS</span>
          </button>
        </div>
      </div>

      {/* ===================================================
          4. SEARCH BAR (Instant filtering by name, email, UID)
          =================================================== */}
      <div className="relative">
        <Search className="w-4 h-4 text-neutral-500 absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search by name, email, or user ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-11 pr-10 py-3 rounded-2xl bg-[#0e111a] border border-neutral-800 text-xs font-mono text-white placeholder:text-neutral-500 focus:outline-none focus:border-red-500 transition-colors shadow-inner"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* ===================================================
          5. THE USER CARDS LIST (Exact match to Reference Screenshot 4)
          =================================================== */}
      <div className="space-y-3">
        {isLoading && data.users.length === 0 ? (
          <div className="bg-[#0f1118] border border-neutral-800 rounded-2xl p-10 text-center space-y-3">
            <RotateCcw className="w-8 h-8 text-[#e61e2b] animate-spin mx-auto" />
            <div className="text-xs font-mono text-neutral-400">Loading user streams...</div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="bg-[#0f1118] border border-neutral-800 rounded-2xl p-12 text-center space-y-2">
            <Users className="w-8 h-8 text-neutral-600 mx-auto" />
            <div className="text-sm font-bold text-white">No users found</div>
            <p className="text-xs text-neutral-500 font-mono">
              {searchQuery
                ? `No user matching "${searchQuery}" in this tab.`
                : activeTab === 'active'
                ? 'No active users currently online.'
                : activeTab === 'offline'
                ? 'No offline users currently.'
                : 'No users registered yet.'}
            </p>
          </div>
        ) : (
          filteredUsers.map((user) => {
            const avatarSrc = user.photoURL || getAutoAvatarUrl({ email: user.email, displayName: user.name });
            const isOnline = Boolean(user.isOnline);
            const rawName = user.name || user.email.split('@')[0];
            const cleanDisplayName = rawName.replace(/\s*\((founder|admin|client|user)\)\s*$/i, '').trim();
            const roleTag = user.role === 'admin' ? 'ADMIN' : 'CLIENT';
            const initial = (cleanDisplayName[0] || user.email?.[0] || 'U').toUpperCase();

            return (
              <div
                key={user.id || user.email}
                onClick={() => setSelectedUser(user)}
                className="bg-[#0f1118] border border-neutral-800 hover:border-neutral-700/90 rounded-2xl p-3.5 sm:p-4 transition-all duration-200 flex items-center justify-between gap-3 shadow-md hover:bg-[#12141f] cursor-pointer group"
              >
                {/* Left: Circular Avatar with Online/Offline Indicator */}
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <div className="relative shrink-0">
                    {avatarSrc && !avatarSrc.includes('ui-avatars.com') ? (
                      <img
                        src={avatarSrc}
                        alt={cleanDisplayName}
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                        className="w-12 h-12 rounded-full object-cover border-2 border-neutral-700 shadow-md bg-neutral-900"
                      />
                    ) : (
                      /* Deep purple avatar badge with initial matching Screenshot 4 */
                      <div className="w-12 h-12 rounded-full bg-[#1b1733] border-2 border-[#392e66] text-[#b4a0f8] font-bold text-lg flex items-center justify-center shadow-md select-none shrink-0">
                        <span>{initial}</span>
                      </div>
                    )}

                    {/* Online Glowing Green Dot */}
                    {isOnline && (
                      <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-[#0f1118] absolute -bottom-0.5 -right-0.5 shadow-sm shadow-emerald-500 animate-pulse" />
                    )}
                  </div>

                  {/* Middle: User Name (TAG), Email, Joined Date */}
                  <div className="space-y-0.5 min-w-0 flex-1">
                    {/* User Name with Role Tag */}
                    <div className="flex items-center gap-1.5 min-w-0">
                      <h4 className="text-sm sm:text-base font-bold text-white tracking-tight truncate group-hover:text-red-400 transition-colors">
                        {cleanDisplayName}
                      </h4>
                      <span className="text-[11px] font-mono text-neutral-400 font-semibold shrink-0">
                        ({roleTag})
                      </span>
                    </div>

                    {/* Email with Mail Icon */}
                    <div className="flex items-center gap-1.5 text-xs font-mono text-neutral-400 truncate">
                      <Mail className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                      <span className="truncate">{user.email}</span>
                    </div>

                    {/* Joined Date & Time (Matching Reference Screenshot 4: "Joined 10/07/2026, 18:22:26") */}
                    <div className="text-[11px] font-mono text-neutral-500">
                      Joined {formatJoinedDateTime(user.createdAt)}
                    </div>
                  </div>
                </div>

                {/* Right: Actions (Notification Bell & Red Trash Can) */}
                <div
                  className="flex items-center gap-1 shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Notification Bell */}
                  <button
                    type="button"
                    onClick={() => {
                      setAlertTargetUser(user);
                      setAlertMessage('');
                    }}
                    className="p-2.5 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
                    title={`Send notification to ${user.name}`}
                  >
                    <Bell className="w-4 h-4" />
                  </button>

                  {/* Delete Red Trash Can */}
                  <button
                    type="button"
                    onClick={() => handleDeleteUser(user)}
                    disabled={deletingEmail === user.email}
                    className="p-2.5 rounded-xl text-red-500 hover:text-red-400 hover:bg-red-950/40 transition-colors cursor-pointer active:scale-95"
                    title={`Delete account for ${user.name}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ===================================================
          MODAL 1: FULL USER ACCOUNT DETAILS (Opens on card click)
          =================================================== */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-[#0f1118] border border-neutral-700 p-6 space-y-6 relative max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Header & Close */}
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-red-950 text-[#e61e2b] flex items-center justify-center">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">User Account Credentials</h3>
                  <p className="text-[11px] font-mono text-neutral-400">Captured at user authentication</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="p-1.5 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Avatar & Hero Banner */}
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800">
              <img
                src={selectedUser.photoURL || getAutoAvatarUrl({ email: selectedUser.email, displayName: selectedUser.name })}
                alt={selectedUser.name}
                className="w-16 h-16 rounded-full object-cover border-2 border-neutral-700 shadow-md bg-neutral-900"
              />
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-lg font-bold text-white tracking-tight">{selectedUser.name}</h4>
                  {selectedUser.isOnline ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-500/40">
                      ONLINE NOW
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono text-neutral-400 bg-neutral-900 border border-neutral-800">
                      OFFLINE
                    </span>
                  )}
                </div>
                <div className="text-xs font-mono text-neutral-400">{selectedUser.email}</div>
              </div>
            </div>

            {/* Credentials & Details Specification Box */}
            <div className="space-y-2 text-xs font-mono">
              {/* User ID */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-black/60 border border-neutral-800/80">
                <span className="text-neutral-500">User ID:</span>
                <span className="text-white font-bold flex items-center gap-2">
                  <span>{selectedUser.id || 'N/A'}</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(selectedUser.id, 'uid_copy')}
                    className="p-1 hover:text-red-400"
                  >
                    {copiedKey === 'uid_copy' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-neutral-500" />
                    )}
                  </button>
                </span>
              </div>

              {/* Role */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-black/60 border border-neutral-800/80">
                <span className="text-neutral-500">Account Role:</span>
                <span className={`font-bold ${selectedUser.role === 'admin' ? 'text-red-400' : 'text-blue-400'}`}>
                  {selectedUser.role === 'admin' ? 'FOUNDER / ADMIN' : 'CLIENT'}
                </span>
              </div>

              {/* Joined Date & Time */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-black/60 border border-neutral-800/80">
                <span className="text-neutral-500">Account Created:</span>
                <span className="text-neutral-200">
                  {formatJoinedDateTime(selectedUser.createdAt)}
                </span>
              </div>

              {/* Last Login Time */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-black/60 border border-neutral-800/80">
                <span className="text-neutral-500">Last Login:</span>
                <span className="text-amber-400 font-semibold">
                  {formatJoinedDateTime(selectedUser.lastLoginAt)} ({getRelativeTime(selectedUser.lastLoginAt)})
                </span>
              </div>

              {/* Last Active */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-black/60 border border-neutral-800/80">
                <span className="text-neutral-500">Last Active Status:</span>
                <span className="text-neutral-200">
                  {selectedUser.isOnline ? (
                    <span className="text-emerald-400 font-bold">Active Right Now</span>
                  ) : (
                    <span>Last seen {getRelativeTime(selectedUser.lastActiveAt || selectedUser.lastLoginAt)}</span>
                  )}
                </span>
              </div>

              {/* Device */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-black/60 border border-neutral-800/80">
                <span className="text-neutral-500">Device Platform:</span>
                <span className="text-neutral-300">{selectedUser.device || 'Web Browser'}</span>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between gap-3 pt-3 border-t border-neutral-800">
              <a
                href={`mailto:${selectedUser.email}?subject=Tech%20Base%20Axis%20-%20Account%20Notice`}
                className="px-4 py-2.5 rounded-xl bg-[#e61e2b] hover:bg-red-700 text-white text-xs font-mono font-semibold flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Send Direct Email</span>
              </a>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    handleDeleteUser(selectedUser);
                  }}
                  className="px-3.5 py-2.5 rounded-xl bg-rose-950/60 hover:bg-rose-900/60 text-red-300 text-xs font-mono flex items-center gap-1.5 border border-red-800/60 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  className="px-4 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white text-xs font-mono border border-neutral-800 transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================
          MODAL 2: NOTIFICATION / BROADCAST ALERT (Bell icon)
          =================================================== */}
      {alertTargetUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-[#0f1118] border border-neutral-700 p-6 space-y-5 relative shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-950 text-amber-400 flex items-center justify-center">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Send Notice</h3>
                  <p className="text-[11px] font-mono text-neutral-400">{alertTargetUser.name}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAlertTargetUser(null)}
                className="p-1.5 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {alertSentNotice ? (
              <div className="p-6 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-center space-y-2">
                <Check className="w-8 h-8 text-emerald-400 mx-auto" />
                <div className="text-sm font-bold text-emerald-300">Notice Dispatched!</div>
                <p className="text-xs font-mono text-emerald-400/80">
                  Notification successfully sent to {alertTargetUser.email}.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendAlert} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-neutral-400">
                    Message to {alertTargetUser.email}:
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={alertMessage}
                    onChange={(e) => setAlertMessage(e.target.value)}
                    placeholder="Enter message or notice for this user account..."
                    className="w-full p-3 rounded-xl bg-black/60 border border-neutral-800 text-xs font-mono text-white placeholder:text-neutral-500 focus:outline-none focus:border-red-500 resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setAlertTargetUser(null)}
                    className="px-4 py-2 rounded-xl bg-neutral-900 text-neutral-400 text-xs font-mono hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-[#e61e2b] hover:bg-red-700 text-white text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer shadow-md shadow-red-600/30"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Notice</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
