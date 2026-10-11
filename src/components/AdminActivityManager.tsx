import React, { useState, useEffect, useMemo } from 'react';
import {
  Activity,
  Users,
  Wifi,
  WifiOff,
  LogIn,
  LogOut,
  UserPlus,
  RefreshCw,
  Search,
  Shield,
  Smartphone,
  Laptop,
  Clock,
  Calendar,
  CheckCircle2,
  Sparkles,
  Filter,
  Eye,
  Radio,
  ExternalLink
} from 'lucide-react';
import {
  fetchUserActivityDashboard,
  subscribeToLiveActivity,
  UserActivityProfile,
  ActivityEvent,
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
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'online' | 'offline' | 'admin' | 'client'>('all');
  const [activeSubTab, setActiveSubTab] = useState<'users' | 'timeline'>('users');
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date>(new Date());

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetchUserActivityDashboard();
      setData(res);
      setLastRefreshedAt(new Date());
    } catch (err) {
      console.warn('Failed to refresh user activity:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Real-time automatic synchronization
  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = subscribeToLiveActivity((freshData) => {
      setData(freshData);
      setIsLoading(false);
      setLastRefreshedAt(new Date());
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Format date helper
  const formatDateTime = (isoDate?: string | null) => {
    if (!isoDate) return 'Never';
    try {
      const d = new Date(isoDate);
      if (isNaN(d.getTime())) return 'Never';
      return d.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
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

  // Filtered users
  const filteredUsers = useMemo(() => {
    return data.users.filter((u) => {
      // Search
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.device && u.device.toLowerCase().includes(q));

      if (!matchSearch) return false;

      // Status filter
      if (filterStatus === 'online') return u.isOnline;
      if (filterStatus === 'offline') return !u.isOnline;
      if (filterStatus === 'admin') return u.role === 'admin';
      if (filterStatus === 'client') return u.role === 'client';

      return true;
    });
  }, [data.users, searchQuery, filterStatus]);

  return (
    <div className="space-y-8 animate-in fade-in duration-200 text-neutral-100">
      {/* 1. Header Banner & Live Telemetry Controls */}
      <div className="obsidian-card rounded-2xl border border-neutral-800 p-5 sm:p-6 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#e61e2b]" />
              <span>User Activity & Presence Control</span>
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 font-mono">
              Live account creation tracking, login/logout timestamps, and real-time online/offline session presence.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="text-[11px] font-mono text-neutral-500 hidden sm:block">
              Auto-sync enabled • Last: {lastRefreshedAt.toLocaleTimeString()}
            </div>

            <button
              type="button"
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="px-3.5 py-2 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-200 text-xs font-mono flex items-center gap-2 transition-all cursor-pointer active:scale-95"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#e61e2b] ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Refreshing...' : 'Refresh Now'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Top KPI Presence Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Users */}
        <div className="obsidian-card p-4 sm:p-5 rounded-2xl border border-neutral-800 relative overflow-hidden">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-[11px] sm:text-xs font-mono uppercase tracking-wider">Total Accounts</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-white mb-1">
            {data.stats.totalUsers}
          </div>
          <div className="text-[10px] sm:text-xs text-neutral-500 font-mono">
            {data.stats.signupsToday} registered today
          </div>
        </div>

        {/* Currently Online */}
        <div className="obsidian-card p-4 sm:p-5 rounded-2xl border border-emerald-900/40 bg-gradient-to-b from-emerald-950/20 to-neutral-950/50 relative overflow-hidden">
          <div className="flex items-center justify-between text-emerald-400 mb-2">
            <span className="text-[11px] sm:text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 font-bold">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Online Now</span>
            </span>
            <Wifi className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-400 mb-1">
            {data.stats.onlineCount}
          </div>
          <div className="text-[10px] sm:text-xs text-emerald-500/80 font-mono">
            Active in last 2 mins
          </div>
        </div>

        {/* Currently Offline */}
        <div className="obsidian-card p-4 sm:p-5 rounded-2xl border border-neutral-800 relative overflow-hidden">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-[11px] sm:text-xs font-mono uppercase tracking-wider">Offline Users</span>
            <WifiOff className="w-4 h-4 text-neutral-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-neutral-300 mb-1">
            {data.stats.offlineCount}
          </div>
          <div className="text-[10px] sm:text-xs text-neutral-500 font-mono">
            Idle / Logged out
          </div>
        </div>

        {/* Today's Logins */}
        <div className="obsidian-card p-4 sm:p-5 rounded-2xl border border-neutral-800 relative overflow-hidden">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-[11px] sm:text-xs font-mono uppercase tracking-wider">Logins Today</span>
            <LogIn className="w-4 h-4 text-[#e61e2b]" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-white mb-1">
            {data.stats.loginsToday}
          </div>
          <div className="text-[10px] sm:text-xs text-neutral-500 font-mono">
            Sessions opened today
          </div>
        </div>
      </div>

      {/* 3. Sub-Tab Switcher: "Users Directory" vs "Activity Event Stream" */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
        <div className="flex items-center gap-2 bg-neutral-900/90 p-1 rounded-xl border border-neutral-800">
          <button
            type="button"
            onClick={() => setActiveSubTab('users')}
            className={`px-4 py-2 rounded-lg text-xs font-mono uppercase tracking-wider font-semibold transition-all cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'users'
                ? 'bg-[#e61e2b] text-white shadow-md shadow-red-600/30'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>All Users Directory ({data.users.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('timeline')}
            className={`px-4 py-2 rounded-lg text-xs font-mono uppercase tracking-wider font-semibold transition-all cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'timeline'
                ? 'bg-[#e61e2b] text-white shadow-md shadow-red-600/30'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Live Audit Stream ({data.recentEvents.length})</span>
          </button>
        </div>

        {/* Filter Controls for Users Directory */}
        {activeSubTab === 'users' && (
          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by name, email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs font-mono text-white placeholder:text-neutral-500 focus:outline-none focus:border-red-500 w-48 sm:w-60"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1 bg-black/60 p-1 rounded-xl border border-neutral-800">
              {(
                [
                  { id: 'all', label: 'All' },
                  { id: 'online', label: `Online (${data.stats.onlineCount})` },
                  { id: 'offline', label: `Offline (${data.stats.offlineCount})` },
                  { id: 'admin', label: 'Admins' }
                ] as const
              ).map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFilterStatus(f.id)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-colors cursor-pointer ${
                    filterStatus === f.id
                      ? 'bg-neutral-800 text-white font-bold'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 4. SUB-TAB 1: USERS DIRECTORY VIEW */}
      {activeSubTab === 'users' && (
        <div className="space-y-4">
          {isLoading && data.users.length === 0 ? (
            <div className="obsidian-card p-12 text-center rounded-2xl border border-neutral-800 space-y-3">
              <RefreshCw className="w-8 h-8 text-[#e61e2b] animate-spin mx-auto" />
              <div className="text-sm font-mono text-neutral-300">Synchronizing accounts & presence directory...</div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="obsidian-card p-12 text-center rounded-2xl border border-neutral-800 space-y-3">
              <Users className="w-10 h-10 text-neutral-600 mx-auto" />
              <div className="text-base font-bold text-white">No users match your filter</div>
              <p className="text-xs text-neutral-400 font-mono">
                {searchQuery
                  ? `No user profiles matching "${searchQuery}". Try clearing search.`
                  : 'No user accounts recorded in this status.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredUsers.map((user) => {
                const avatarSrc = user.photoURL || getAutoAvatarUrl({ email: user.email, displayName: user.name });

                return (
                  <div
                    key={user.id || user.email}
                    className={`obsidian-card rounded-2xl border p-5 space-y-4 transition-all duration-300 relative overflow-hidden group hover:scale-[1.01] ${
                      user.isOnline
                        ? 'border-emerald-600/40 bg-gradient-to-b from-emerald-950/15 via-[#0f1015] to-[#0c0d12] shadow-lg shadow-emerald-950/20'
                        : 'border-neutral-800 bg-[#0f1015]'
                    }`}
                  >
                    {/* Top User Info Bar with Avatar */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {/* Avatar with Live Online Beacon Ring */}
                        <div className="relative">
                          <img
                            src={avatarSrc}
                            alt={user.name}
                            onError={(e) => {
                              // Fallback on image error
                              (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=1a1a24&color=ffffff&bold=true`;
                            }}
                            className="w-12 h-12 rounded-full object-cover border-2 border-neutral-700/80 shadow-md bg-neutral-900"
                          />
                          {/* Online / Offline Dot Indicator */}
                          {user.isOnline ? (
                            <span className="absolute bottom-0 right-0 flex h-3.5 w-3.5">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-black"></span>
                            </span>
                          ) : (
                            <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-neutral-600 border-2 border-black" />
                          )}
                        </div>

                        {/* Name & Email */}
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h4 className="text-sm font-bold text-white tracking-tight">
                              {user.name}
                            </h4>
                            {user.role === 'admin' && (
                              <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-red-950 text-red-300 border border-red-600/30 font-bold">
                                ADMIN
                              </span>
                            )}
                          </div>
                          <div className="text-xs font-mono text-neutral-400 truncate max-w-[190px]">
                            {user.email}
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] font-mono text-neutral-400 pt-0.5">
                            <Clock className="w-3 h-3 text-amber-400 shrink-0" />
                            <span className="text-neutral-300 font-medium">
                              {user.isOnline 
                                ? 'Active right now' 
                                : `Last active ${getRelativeTime(user.lastActiveAt || user.lastLoginAt)}`}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Presence Status Badge & Relative Time Label */}
                      <div className="text-right shrink-0">
                        {user.isOnline ? (
                          <>
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-500/40 shadow-sm shadow-emerald-950/50">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              <span>ONLINE</span>
                            </span>
                            <span className="text-[10px] font-mono text-emerald-400/90 block mt-1 font-semibold">
                              Active now
                            </span>
                          </>
                        ) : (
                          <>
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold bg-neutral-900 text-neutral-400 border border-neutral-800">
                              <span className="w-1.5 h-1.5 rounded-full bg-neutral-500" />
                              <span>OFFLINE</span>
                            </span>
                            <span className="text-[10px] font-mono text-neutral-400 block mt-1">
                              Last active {getRelativeTime(user.lastActiveAt || user.lastLoginAt)}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Timeline & Timestamps Data Box */}
                    <div className="p-3 rounded-xl bg-black/60 border border-neutral-800/80 space-y-2 text-xs font-mono">
                      {/* Account Created At */}
                      <div className="flex items-center justify-between text-neutral-400">
                        <span className="flex items-center gap-1.5 text-neutral-500">
                          <UserPlus className="w-3.5 h-3.5 text-blue-400" />
                          <span>Joined / Created:</span>
                        </span>
                        <div className="text-right">
                          <span className="text-neutral-300 font-semibold">
                            {formatDateTime(user.createdAt)}
                          </span>
                          <span className="text-[10px] text-neutral-500 block font-mono">
                            Joined {getRelativeTime(user.createdAt)}
                          </span>
                        </div>
                      </div>

                      {/* Last Login Time with Relative Time Context */}
                      <div className="flex items-center justify-between text-neutral-400">
                        <span className="flex items-center gap-1.5 text-neutral-500">
                          <LogIn className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Last Login:</span>
                        </span>
                        <div className="text-right">
                          <span className="text-emerald-300 font-semibold">
                            {formatDateTime(user.lastLoginAt)}
                          </span>
                          <span className="text-[10px] text-emerald-400 font-mono block font-medium">
                            Logged in {getRelativeTime(user.lastLoginAt)}
                          </span>
                        </div>
                      </div>

                      {/* Last Logout Time with Relative Time Context */}
                      <div className="flex items-center justify-between text-neutral-400">
                        <span className="flex items-center gap-1.5 text-neutral-500">
                          <LogOut className="w-3.5 h-3.5 text-rose-400" />
                          <span>Last Logout:</span>
                        </span>
                        <div className="text-right">
                          <span className="text-neutral-300">
                            {user.lastLogoutAt ? formatDateTime(user.lastLogoutAt) : 'Currently Active Session'}
                          </span>
                          {user.lastLogoutAt && (
                            <span className="text-[10px] text-rose-400/90 font-mono block">
                              Logged out {getRelativeTime(user.lastLogoutAt)}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Last Active Heartbeat */}
                      <div className="flex items-center justify-between text-neutral-400 pt-1.5 border-t border-neutral-900">
                        <span className="flex items-center gap-1.5 text-neutral-500">
                          <Clock className="w-3.5 h-3.5 text-amber-400" />
                          <span>Last Active Ping:</span>
                        </span>
                        <div className="text-right">
                          <span className="text-amber-400 font-bold">
                            {user.isOnline ? 'Online now' : getRelativeTime(user.lastActiveAt)}
                          </span>
                          <span className="text-[10px] text-neutral-500 block font-mono">
                            {formatDateTime(user.lastActiveAt)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Device & Platform Info Footer */}
                    <div className="flex items-center justify-between text-[11px] font-mono text-neutral-500 pt-1">
                      <div className="flex items-center gap-1.5 truncate max-w-[220px]">
                        {user.device?.toLowerCase().includes('mobile') ? (
                          <Smartphone className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                        ) : (
                          <Laptop className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                        )}
                        <span className="truncate">{user.device || 'Web Browser'}</span>
                      </div>

                      <div className="text-[10px] text-neutral-500">
                        ID: {user.id ? `${user.id.slice(0, 8)}...` : 'N/A'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 5. SUB-TAB 2: LIVE AUDIT EVENT STREAM */}
      {activeSubTab === 'timeline' && (
        <div className="obsidian-card rounded-2xl border border-neutral-800 p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
            <h3 className="text-sm font-bold font-mono text-white flex items-center gap-2">
              <Radio className="w-4 h-4 text-[#e61e2b] animate-pulse" />
              <span>Real-Time Authentication Event Stream</span>
            </h3>
            <span className="text-xs font-mono text-neutral-400">
              Showing last {data.recentEvents.length} actions
            </span>
          </div>

          {data.recentEvents.length === 0 ? (
            <div className="text-center py-12 text-neutral-500 font-mono text-xs">
              No recent authentication events recorded yet.
            </div>
          ) : (
            <div className="divide-y divide-neutral-800/80">
              {data.recentEvents.map((evt) => {
                const isSignup = evt.type === 'signup';
                const isLogin = evt.type === 'login';
                const isLogout = evt.type === 'logout';

                return (
                  <div key={evt.id} className="py-3.5 flex items-start justify-between gap-3 text-xs font-mono">
                    <div className="flex items-start gap-3">
                      {/* Event Type Icon Pill */}
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border mt-0.5 ${
                          isSignup
                            ? 'bg-blue-950/80 border-blue-500/40 text-blue-400'
                            : isLogin
                            ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-400'
                            : 'bg-rose-950/80 border-rose-500/40 text-rose-400'
                        }`}
                      >
                        {isSignup && <UserPlus className="w-4 h-4" />}
                        {isLogin && <LogIn className="w-4 h-4" />}
                        {isLogout && <LogOut className="w-4 h-4" />}
                      </div>

                      {/* Event Details */}
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-white">{evt.name || evt.email}</span>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                              isSignup
                                ? 'bg-blue-950 text-blue-300'
                                : isLogin
                                ? 'bg-emerald-950 text-emerald-300'
                                : 'bg-rose-950 text-rose-300'
                            }`}
                          >
                            {evt.type === 'signup' ? 'New Account Created' : evt.type === 'login' ? 'User Login' : 'User Logout'}
                          </span>
                        </div>
                        <div className="text-neutral-400 text-[11px]">
                          {evt.details || `${evt.name} completed ${evt.type}`}
                        </div>
                        <div className="text-neutral-500 text-[10px]">
                          Email: {evt.email} • {evt.device || 'Web Browser'}
                        </div>
                      </div>
                    </div>

                    {/* Timestamp */}
                    <div className="text-right shrink-0 space-y-0.5">
                      <div className="text-neutral-300 font-semibold">
                        {getRelativeTime(evt.timestamp)}
                      </div>
                      <div className="text-[10px] text-neutral-500">
                        {new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
