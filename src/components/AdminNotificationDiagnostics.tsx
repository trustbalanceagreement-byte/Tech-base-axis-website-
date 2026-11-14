import React, { useState, useEffect, useCallback } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Smartphone, 
  RefreshCw, 
  Copy, 
  Check, 
  ExternalLink, 
  ShieldCheck, 
  Radio, 
  Bell, 
  ChevronDown, 
  ChevronUp,
  Settings,
  HelpCircle
} from 'lucide-react';
import { 
  getOneSignalDeviceInfo, 
  syncAdminDeviceRegistration, 
  updateTargetAdminDevice, 
  requestPushPermission, 
  type OneSignalDeviceInfo 
} from '../utils/onesignal';

interface BackendNotificationStatus {
  onesignalReady: boolean;
  appIdPreview: string;
  targetAdminPlayerId: string;
  targetAdminSubscriptionId: string;
  activeSubscriptions: string[];
  registeredDevices: Array<{
    subscriptionId: string;
    playerId?: string;
    email?: string;
    userAgent?: string;
    label?: string;
    registeredAt?: string;
  }>;
  timestamp: string;
}

interface Props {
  adminEmail?: string;
  onSendTestAlert?: () => void;
  testBusy?: boolean;
}

export const AdminNotificationDiagnostics: React.FC<Props> = ({ 
  adminEmail = 'techbaseaxis@gmail.com',
  onSendTestAlert,
  testBusy = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [backendStatus, setBackendStatus] = useState<BackendNotificationStatus | null>(null);
  const [deviceInfo, setDeviceInfo] = useState<OneSignalDeviceInfo | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Manual target ID override inputs
  const [isEditingTarget, setIsEditingTarget] = useState(false);
  const [editPlayerId, setEditPlayerId] = useState('');
  const [editSubscriptionId, setEditSubscriptionId] = useState('');
  const [savingTarget, setSavingTarget] = useState(false);

  const copyToClipboard = (text: string, key: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const refreshAll = useCallback(async () => {
    setLoading(true);
    setSyncMessage(null);
    try {
      // 1. Fetch backend status
      const res = await fetch('/api/notification-status', { cache: 'no-store' });
      if (res.ok) {
        const data: BackendNotificationStatus = await res.json();
        setBackendStatus(data);
        setEditPlayerId(data.targetAdminPlayerId || '');
        setEditSubscriptionId(data.targetAdminSubscriptionId || '');
      }

      // 2. Fetch browser OneSignal device info
      const dev = await getOneSignalDeviceInfo();
      setDeviceInfo(dev);
    } catch (err: any) {
      console.warn('Diagnostics fetch warning:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  // Cross-verification logic
  const targetPlayerId = backendStatus?.targetAdminPlayerId || '99a86c9f-366e-4625-9506-5af191a0297d';
  const targetSubId = backendStatus?.targetAdminSubscriptionId || '32007a0b-38ed-4800-a681-f663fd00d188';
  const currentSubId = deviceInfo?.subscriptionId || '';
  const currentPlayerId = deviceInfo?.onesignalId || '';
  const activeSubs = backendStatus?.activeSubscriptions || [];

  const isSubMatched = Boolean(currentSubId && (currentSubId === targetSubId || activeSubs.includes(currentSubId)));
  const isPlayerMatched = Boolean(currentPlayerId && currentPlayerId === targetPlayerId);
  const isDeviceRegistered = isSubMatched || isPlayerMatched;

  // Handler to register current device as target admin
  const handleRegisterAsTarget = async () => {
    setSyncing(true);
    setSyncMessage(null);
    try {
      // Ensure push permission first if not granted
      if (!deviceInfo?.permission) {
        const granted = await requestPushPermission();
        if (!granted) {
          setSyncMessage({ ok: false, text: 'Push notification permission was denied in browser settings. Please allow notifications in your browser address bar.' });
          setSyncing(false);
          return;
        }
      }

      const res = await syncAdminDeviceRegistration({
        setAsTarget: true,
        email: adminEmail,
        label: `${navigator.platform || 'Device'} (${navigator.userAgent.includes('Mobile') ? 'Mobile' : 'Desktop'})`
      });

      if (res.success || res.registered) {
        setSyncMessage({ ok: true, text: 'Current device successfully registered and set as primary admin target!' });
        await refreshAll();
      } else {
        setSyncMessage({ ok: false, text: res.error || 'Registration failed. Make sure notifications are allowed.' });
      }
    } catch (err: any) {
      setSyncMessage({ ok: false, text: err?.message || 'Error communicating with backend' });
    } finally {
      setSyncing(false);
    }
  };

  const handleSaveCustomTargets = async () => {
    setSavingTarget(true);
    try {
      const res = await updateTargetAdminDevice({
        targetPlayerId: editPlayerId.trim() || undefined,
        targetSubscriptionId: editSubscriptionId.trim() || undefined
      });
      if (res.success) {
        setSyncMessage({ ok: true, text: 'Target IDs updated successfully in backend!' });
        setIsEditingTarget(false);
        await refreshAll();
      } else {
        setSyncMessage({ ok: false, text: res.error || 'Failed to update targets' });
      }
    } catch (err: any) {
      setSyncMessage({ ok: false, text: err?.message || 'Error updating targets' });
    } finally {
      setSavingTarget(false);
    }
  };

  return (
    <div className="rounded-2xl border border-neutral-800 bg-[#0d0d10] overflow-hidden text-sm">
      {/* Collapsible Header Summary Bar */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 cursor-pointer hover:bg-neutral-900/40 transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
            isDeviceRegistered && deviceInfo?.permission
              ? 'bg-emerald-950/60 text-emerald-400 border-emerald-700/50'
              : 'bg-amber-950/60 text-amber-400 border-amber-700/50'
          }`}>
            <Radio className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-white text-sm sm:text-base">OneSignal Device Cross-Verification</span>
              {isDeviceRegistered && deviceInfo?.permission ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-900/60 text-emerald-300 border border-emerald-600/40 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> MATCHED & TARGETED
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-amber-900/60 text-amber-300 border border-amber-600/40 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> VERIFICATION REQUIRED
                </span>
              )}
            </div>
            <p className="text-xs text-neutral-400 font-mono mt-0.5 truncate">
              Target Player: <span className="text-neutral-200">{targetPlayerId.slice(0, 14)}...</span> · 
              Target Sub: <span className="text-neutral-200">{targetSubId.slice(0, 14)}...</span> · 
              This Device: <span className={currentSubId ? 'text-emerald-400' : 'text-neutral-500'}>{currentSubId ? `${currentSubId.slice(0, 10)}...` : 'Not subscribed yet'}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); refreshAll(); }}
            disabled={loading}
            className="p-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-700 disabled:opacity-50"
            title="Refresh device cross-verification"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-red-400' : ''}`} />
          </button>
          <span className="text-xs font-mono text-neutral-400 flex items-center gap-1">
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </span>
        </div>
      </div>

      {/* Expanded Diagnostic Body */}
      {isOpen && (
        <div className="p-4 sm:p-6 border-t border-neutral-800/80 bg-black/40 space-y-6">
          {/* Status Message */}
          {syncMessage && (
            <div className={`p-3 rounded-xl border text-xs font-mono leading-relaxed flex items-center gap-2 ${
              syncMessage.ok 
                ? 'bg-emerald-950/50 border-emerald-700/50 text-emerald-200' 
                : 'bg-rose-950/50 border-rose-700/50 text-rose-200'
            }`}>
              {syncMessage.ok ? <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />}
              <span>{syncMessage.text}</span>
            </div>
          )}

          {/* Quick Explanation Banner */}
          <div className="p-3.5 rounded-xl bg-neutral-900/70 border border-neutral-800 text-xs text-neutral-300 font-mono leading-relaxed space-y-1">
            <div className="flex items-center gap-2 text-white font-semibold">
              <HelpCircle className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>OneSignal Identifier Clarification</span>
            </div>
            <p className="text-neutral-400">
              In OneSignal v16, a <b className="text-neutral-200">Player ID / User ID</b> (e.g. <code className="text-indigo-300">99a86c9f-366e-4625-9506-5af191a0297d</code>) is the parent user entity, while each device/browser has its own unique <b className="text-neutral-200">Push Subscription ID</b> (e.g. <code className="text-emerald-300">32007a0b-38ed-4800-a681-f663fd00d188</code>). Notifications must target the subscription ID currently tied to this device.
            </p>
          </div>

          {/* Side-by-Side Comparison Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Backend Target Settings Card */}
            <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-4 space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider font-mono font-bold text-neutral-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-red-500" /> Backend Target Configuration
                </span>
                <button
                  type="button"
                  onClick={() => setIsEditingTarget(!isEditingTarget)}
                  className="text-[11px] font-mono text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
                >
                  <Settings className="w-3 h-3" /> {isEditingTarget ? 'Cancel' : 'Edit Target IDs'}
                </button>
              </div>

              {isEditingTarget ? (
                <div className="space-y-3 pt-1">
                  <div>
                    <label className="text-[11px] font-mono text-neutral-400 block mb-1">Target Admin Player ID (OneSignal User ID)</label>
                    <input
                      type="text"
                      value={editPlayerId}
                      onChange={(e) => setEditPlayerId(e.target.value)}
                      placeholder="e.g. 99a86c9f-366e-4625-9506-5af191a0297d"
                      className="w-full px-3 py-1.5 bg-neutral-900 border border-neutral-700 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-mono text-neutral-400 block mb-1">Target Admin Subscription ID</label>
                    <input
                      type="text"
                      value={editSubscriptionId}
                      onChange={(e) => setEditSubscriptionId(e.target.value)}
                      placeholder="e.g. 32007a0b-38ed-4800-a681-f663fd00d188"
                      className="w-full px-3 py-1.5 bg-neutral-900 border border-neutral-700 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-red-500"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleSaveCustomTargets}
                    disabled={savingTarget}
                    className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-mono text-xs disabled:opacity-50 cursor-pointer"
                  >
                    {savingTarget ? 'Saving...' : 'Save Target IDs'}
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  <div className="p-2.5 rounded-lg bg-neutral-900/80 border border-neutral-800/80">
                    <div className="flex items-center justify-between text-xs text-neutral-400 font-mono mb-1">
                      <span>Target Player ID (User ID):</span>
                      <button 
                        onClick={() => copyToClipboard(targetPlayerId, 'targetPlayer')} 
                        className="hover:text-white flex items-center gap-1 text-[10px]"
                      >
                        {copiedKey === 'targetPlayer' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        Copy
                      </button>
                    </div>
                    <code className="text-xs font-mono text-indigo-300 break-all select-all">{targetPlayerId}</code>
                  </div>

                  <div className="p-2.5 rounded-lg bg-neutral-900/80 border border-neutral-800/80">
                    <div className="flex items-center justify-between text-xs text-neutral-400 font-mono mb-1">
                      <span>Target Subscription ID:</span>
                      <button 
                        onClick={() => copyToClipboard(targetSubId, 'targetSub')} 
                        className="hover:text-white flex items-center gap-1 text-[10px]"
                      >
                        {copiedKey === 'targetSub' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        Copy
                      </button>
                    </div>
                    <code className="text-xs font-mono text-emerald-300 break-all select-all">{targetSubId}</code>
                  </div>

                  <div className="flex items-center justify-between text-xs font-mono pt-1 text-neutral-400">
                    <span>Active Subscriptions Count:</span>
                    <span className="font-bold text-white bg-neutral-800 px-2 py-0.5 rounded">{activeSubs.length}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Current Administration Device Card */}
            <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-4 space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider font-mono font-bold text-neutral-400 flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-emerald-400" /> Current Admin Device Status
                </span>
                <span className={`text-[11px] font-mono px-2 py-0.5 rounded-full ${
                  deviceInfo?.permission 
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60' 
                    : 'bg-amber-950 text-amber-400 border border-amber-800/60'
                }`}>
                  Permission: {deviceInfo?.permission ? 'Granted' : deviceInfo?.permissionNative || 'Prompt'}
                </span>
              </div>

              <div className="space-y-2.5">
                <div className="p-2.5 rounded-lg bg-neutral-900/80 border border-neutral-800/80">
                  <div className="flex items-center justify-between text-xs text-neutral-400 font-mono mb-1">
                    <span>This Device OneSignal User ID:</span>
                    {currentPlayerId && (
                      <button 
                        onClick={() => copyToClipboard(currentPlayerId, 'currentPid')} 
                        className="hover:text-white flex items-center gap-1 text-[10px]"
                      >
                        {copiedKey === 'currentPid' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        Copy
                      </button>
                    )}
                  </div>
                  {currentPlayerId ? (
                    <div className="flex items-center gap-2">
                      <code className="text-xs font-mono text-neutral-200 break-all select-all">{currentPlayerId}</code>
                      {isPlayerMatched ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" title="Matches Target Player ID" />
                      ) : (
                        <span className="text-[10px] text-amber-400 font-mono shrink-0">Differs</span>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs font-mono text-neutral-500 italic">Not initialized or anonymous</span>
                  )}
                </div>

                <div className="p-2.5 rounded-lg bg-neutral-900/80 border border-neutral-800/80">
                  <div className="flex items-center justify-between text-xs text-neutral-400 font-mono mb-1">
                    <span>This Device Push Subscription ID:</span>
                    {currentSubId && (
                      <button 
                        onClick={() => copyToClipboard(currentSubId, 'currentSub')} 
                        className="hover:text-white flex items-center gap-1 text-[10px]"
                      >
                        {copiedKey === 'currentSub' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        Copy
                      </button>
                    )}
                  </div>
                  {currentSubId ? (
                    <div className="flex items-center gap-2">
                      <code className="text-xs font-mono text-emerald-400 break-all select-all">{currentSubId}</code>
                      {isSubMatched ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" title="Subscribed & Registered in Backend" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-400 shrink-0" title="Not registered in backend target list" />
                      )}
                    </div>
                  ) : (
                    <div className="text-xs font-mono text-amber-300">
                      <span>No active subscription. Click &apos;Register & Link This Device&apos; below.</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs font-mono pt-1 text-neutral-400">
                  <span>Match Status:</span>
                  {isDeviceRegistered ? (
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Registered in Backend Target List
                    </span>
                  ) : (
                    <span className="text-amber-400 font-bold flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> Not Linked to Target
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleRegisterAsTarget}
                disabled={syncing}
                className="px-4 py-2 rounded-xl bg-[#e61e2b] hover:bg-red-600 text-white font-mono text-xs font-semibold flex items-center gap-2 shadow-lg shadow-red-900/30 disabled:opacity-50 cursor-pointer"
              >
                <Smartphone className="w-4 h-4" />
                {syncing ? 'Linking Device...' : 'Register & Link This Device as Target Admin'}
              </button>

              {onSendTestAlert && (
                <button
                  type="button"
                  onClick={onSendTestAlert}
                  disabled={testBusy}
                  className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-700 font-mono text-xs flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  <Bell className="w-4 h-4 text-amber-400" />
                  {testBusy ? 'Sending Test...' : 'Send Test Push Alert'}
                </button>
              )}
            </div>

            <a
              href="https://dashboard.onesignal.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-mono text-neutral-400 hover:text-white flex items-center gap-1"
            >
              OneSignal Console <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Registered Devices History Table if available */}
          {backendStatus?.registeredDevices && backendStatus.registeredDevices.length > 0 && (
            <div className="space-y-2 pt-2">
              <span className="text-xs font-mono font-bold text-neutral-400 block">Registered Admin Devices in Backend:</span>
              <div className="max-h-40 overflow-y-auto rounded-xl border border-neutral-800/80 bg-neutral-950/40 divide-y divide-neutral-900 text-xs font-mono">
                {backendStatus.registeredDevices.map((d, idx) => (
                  <div key={idx} className="p-2.5 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-neutral-300 font-semibold">{d.label || 'Admin Device'}</span>
                        {d.subscriptionId === targetSubId && (
                          <span className="text-[10px] bg-red-950/70 text-red-400 px-1.5 py-0.2 rounded border border-red-800/40">Primary Target</span>
                        )}
                        {d.subscriptionId === currentSubId && (
                          <span className="text-[10px] bg-emerald-950/70 text-emerald-400 px-1.5 py-0.2 rounded border border-emerald-800/40">This Device</span>
                        )}
                      </div>
                      <p className="text-[11px] text-neutral-500 truncate">Sub: {d.subscriptionId} · User: {d.playerId || 'none'}</p>
                    </div>
                    <span className="text-[10px] text-neutral-500 shrink-0">
                      {d.registeredAt ? new Date(d.registeredAt).toLocaleDateString() : ''}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
