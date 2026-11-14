import React, { useEffect, useState } from 'react';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Smartphone,
  Server,
  RotateCcw,
  ShieldCheck,
  Send,
  Trash2,
  Copy,
  Check,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Settings
} from 'lucide-react';
import { getOneSignalDeviceInfo, requestPushPermission, OneSignalDeviceInfo } from '../utils/onesignal';

export interface AdminDeviceRecord {
  subscriptionId: string;
  playerId?: string;
  onesignalId?: string;
  email?: string;
  userAgent?: string;
  label?: string;
  registeredAt: string;
  lastActiveAt: string;
  isTarget?: boolean;
}

export interface BackendStatusResponse {
  onesignalReady: boolean;
  appId?: string;
  appIdPreview?: string;
  targetAdminPlayerId?: string;
  targetAdminSubscriptionId?: string;
  targetUpdatedAt?: string;
  targetUpdatedBy?: string;
  registeredSubscriptions?: string[];
  totalRegisteredDevices?: number;
  devices?: AdminDeviceRecord[];
  adminEmails?: string[];
  crossVerification?: {
    isTargetSet: boolean;
    targetPlayerId?: string;
    targetSubscriptionId?: string;
    totalDevices?: number;
    activeSubscriptionsCount?: number;
  };
}

interface Props {
  onToast?: (message: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export const AdminDeviceNotificationDiagnostics: React.FC<Props> = ({ onToast }) => {
  const [loading, setLoading] = useState(false);
  const [backendStatus, setBackendStatus] = useState<BackendStatusResponse | null>(null);
  const [deviceInfo, setDeviceInfo] = useState<OneSignalDeviceInfo | null>(null);
  const [testBusy, setTestBusy] = useState(false);
  const [testResult, setTestResult] = useState<{
    ok: boolean;
    message: string;
    recipients?: number;
    deliveredVia?: string;
    notificationId?: string;
    details?: any;
  } | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [syncingTarget, setSyncingTarget] = useState(false);
  const [showManualOverride, setShowManualOverride] = useState(false);
  const [manualPlayerId, setManualPlayerId] = useState('');
  const [manualSubId, setManualSubId] = useState('');
  const [showDeviceList, setShowDeviceList] = useState(false);

  const fetchDiagnostics = async () => {
    setLoading(true);
    try {
      // 1. Fetch backend notification status
      try {
        const res = await fetch('/api/notification-status', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          setBackendStatus(data);
          if (data?.targetAdminPlayerId) setManualPlayerId(data.targetAdminPlayerId);
          if (data?.targetAdminSubscriptionId) setManualSubId(data.targetAdminSubscriptionId);
        }
      } catch (err) {
        console.warn('Failed to fetch /api/notification-status:', err);
      }

      // 2. Query active browser/device OneSignal info
      const dev = await getOneSignalDeviceInfo();
      setDeviceInfo(dev);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiagnostics();
  }, []);

  const copyToClipboard = (text: string, key: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
    onToast?.(`Copied ${key} to clipboard`);
  };

  const handleSyncCurrentDeviceAsTarget = async () => {
    setSyncingTarget(true);
    try {
      const dev = await getOneSignalDeviceInfo();
      setDeviceInfo(dev);

      const subId = dev.subscriptionId || '';
      const pId = dev.playerId || dev.onesignalId || '';

      if (!subId && !pId) {
        // If not registered yet, attempt permission request first
        if (!dev.permission) {
          const granted = await requestPushPermission();
          if (!granted) {
            onToast?.('Please allow browser push notifications first.');
            return;
          }
        }
      }

      const isMobile = typeof navigator !== 'undefined' && /Mobile|Android|iPhone|iPad/i.test(navigator.userAgent);
      const res = await fetch('/api/register-admin-device', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscriptionId: subId,
          playerId: pId,
          onesignalId: dev.onesignalId || pId,
          email: 'techbaseaxis@gmail.com',
          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
          label: isMobile ? 'Mobile Admin Phone' : 'Desktop Admin Console',
          setAsTarget: true
        })
      });

      if (res.ok) {
        onToast?.('This device is now set as the PRIMARY TARGET for admin notifications!');
        await fetchDiagnostics();
      } else {
        const err = await res.json().catch(() => ({}));
        onToast?.(`Failed to sync target device: ${err?.error || 'Server error'}`);
      }
    } catch (err: any) {
      onToast?.(`Error: ${err?.message || err}`);
    } finally {
      setSyncingTarget(false);
    }
  };

  const handleSaveManualTarget = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/set-target-admin-device', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetAdminPlayerId: manualPlayerId.trim(),
          targetAdminSubscriptionId: manualSubId.trim(),
          updatedBy: 'manual_console_input'
        })
      });

      if (res.ok) {
        onToast?.('Target Player ID and Subscription ID updated in backend!');
        setShowManualOverride(false);
        await fetchDiagnostics();
      } else {
        onToast?.('Failed to update target IDs in backend.');
      }
    } catch (err: any) {
      onToast?.(`Error: ${err?.message || err}`);
    }
  };

  const handleRemoveDevice = async (subId: string) => {
    if (!confirm(`Remove subscription ID ${subId} from registered devices?`)) return;
    try {
      const res = await fetch(`/api/register-admin-device?subscriptionId=${encodeURIComponent(subId)}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        onToast?.('Device subscription removed.');
        await fetchDiagnostics();
      }
    } catch (err: any) {
      onToast?.(`Error removing device: ${err?.message || err}`);
    }
  };

  const handleRunDiagnosticTest = async () => {
    setTestBusy(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/notify-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType: 'contact_enquiry',
          clientName: 'OneSignal Target Verification',
          email: 'techbaseaxis@gmail.com',
          subject: 'Admin Device Target Verification Alert',
          message: `Cross-verification test triggered at ${new Date().toLocaleTimeString()}. Target Sub: ${backendStatus?.targetAdminSubscriptionId || 'none'}`,
          idempotencyKey: `diag:${Date.now()}`
        })
      });

      const data = await res.json().catch(() => ({}));
      if (data?.success) {
        const recipients = data.recipients ?? data?.data?.recipients ?? 1;
        const deliveredVia = data?.data?.deliveredVia || 'target route';
        setTestResult({
          ok: true,
          message: recipients > 0 
            ? `Push notification successfully dispatched to ${recipients} admin device(s) via "${deliveredVia}"!`
            : 'Push dispatched, but OneSignal reported 0 active recipients. Check that this device is subscribed and opted in.',
          recipients,
          deliveredVia,
          notificationId: data?.id,
          details: data
        });
        onToast?.('Diagnostic test alert sent! Check your phone/browser notifications.');
      } else {
        const errs = data?.errors || data?.error || 'Failed to dispatch push notification';
        setTestResult({
          ok: false,
          message: typeof errs === 'string' ? errs : JSON.stringify(errs),
          details: data
        });
      }
    } catch (err: any) {
      setTestResult({
        ok: false,
        message: err?.message || 'Network error executing diagnostic test'
      });
    } finally {
      setTestBusy(false);
    }
  };

  // Cross-verification logic
  const currentSubId = deviceInfo?.subscriptionId;
  const currentOneSignalId = deviceInfo?.onesignalId || deviceInfo?.playerId;
  const targetSubId = backendStatus?.targetAdminSubscriptionId;
  const targetPlayerId = backendStatus?.targetAdminPlayerId;

  const isSubExactMatch = Boolean(currentSubId && targetSubId && currentSubId === targetSubId);
  const isPlayerExactMatch = Boolean(currentOneSignalId && targetPlayerId && currentOneSignalId === targetPlayerId);
  const isRegisteredInPool = Boolean(
    currentSubId && backendStatus?.registeredSubscriptions?.includes(currentSubId)
  );

  let verificationState: 'MATCHED' | 'IN_POOL_NOT_PRIMARY' | 'MISMATCH' | 'NOT_SUBSCRIBED' = 'MISMATCH';
  if (!currentSubId && !deviceInfo?.permission) {
    verificationState = 'NOT_SUBSCRIBED';
  } else if (isSubExactMatch || isPlayerExactMatch) {
    verificationState = 'MATCHED';
  } else if (isRegisteredInPool) {
    verificationState = 'IN_POOL_NOT_PRIMARY';
  } else {
    verificationState = 'MISMATCH';
  }

  return (
    <div className="obsidian-card rounded-2xl border border-neutral-800 p-5 sm:p-6 space-y-6 text-neutral-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-950/70 border border-indigo-700/40 text-indigo-400 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-white">
                Admin Notification Device Cross-Verification
              </h3>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-neutral-900 border border-neutral-700 text-neutral-400">
                OneSignal v16
              </span>
            </div>
            <p className="text-xs text-neutral-400 font-mono mt-0.5">
              Verify that the subscription ID on this device matches the backend target player ID.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchDiagnostics}
            disabled={loading}
            className="px-3 py-1.5 rounded-xl text-xs font-mono flex items-center gap-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-700 disabled:opacity-50 transition cursor-pointer"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-indigo-400' : 'text-neutral-400'}`} />
            Refresh
          </button>
          <button
            type="button"
            onClick={handleRunDiagnosticTest}
            disabled={testBusy}
            className="px-3 py-1.5 rounded-xl text-xs font-mono font-medium flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 disabled:opacity-50 transition cursor-pointer"
          >
            <Send className={`w-3.5 h-3.5 ${testBusy ? 'animate-spin' : ''}`} />
            {testBusy ? 'Sending...' : 'Send Test Alert'}
          </button>
        </div>
      </div>

      {/* Cross-Verification Match Status Banner */}
      <div className="rounded-xl border p-4 transition-all">
        {verificationState === 'MATCHED' && (
          <div className="flex items-start gap-3 bg-emerald-950/40 border-emerald-500/40 text-emerald-200 rounded-lg p-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="text-sm font-bold text-emerald-300">
                VERIFIED & SYNCHRONIZED: Notifications reach THIS device directly
              </div>
              <p className="text-xs text-emerald-300/80 leading-relaxed font-mono">
                The active OneSignal subscription ID on this admin login device matches the target ID registered in the backend ({targetSubId?.slice(0, 8)}...). New client inquiries, quotes, and appointments will pop up instantly on this screen.
              </p>
            </div>
          </div>
        )}

        {verificationState === 'IN_POOL_NOT_PRIMARY' && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-amber-950/40 border-amber-500/40 text-amber-200 rounded-lg p-3">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="text-sm font-bold text-amber-300">
                  DEVICE IN BACKUP POOL (NOT PRIMARY TARGET)
                </div>
                <p className="text-xs text-amber-300/80 leading-relaxed font-mono">
                  This device is registered in the server's device pool, but the PRIMARY target subscription is set to another device ({targetSubId?.slice(0, 8)}...).
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleSyncCurrentDeviceAsTarget}
              disabled={syncingTarget}
              className="px-3 py-1.5 rounded-lg text-xs font-mono font-medium bg-amber-500 hover:bg-amber-400 text-black shrink-0 transition cursor-pointer"
            >
              {syncingTarget ? 'Syncing...' : 'Set as Primary Target'}
            </button>
          </div>
        )}

        {verificationState === 'MISMATCH' && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-rose-950/40 border-rose-500/40 text-rose-200 rounded-lg p-3">
            <div className="flex items-start gap-3">
              <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="text-sm font-bold text-rose-300">
                  DEVICE MISMATCH DETECTED: Notifications are targeting a different device
                </div>
                <p className="text-xs text-rose-300/80 leading-relaxed font-mono">
                  This browser's active Subscription ID ({currentSubId ? `${currentSubId.slice(0, 8)}...` : 'None'}) does not match the target subscription registered in the backend ({targetSubId ? `${targetSubId.slice(0, 8)}...` : 'None'}). Notifications are currently being sent to another device.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleSyncCurrentDeviceAsTarget}
              disabled={syncingTarget}
              className="px-3 py-2 rounded-lg text-xs font-mono font-bold bg-[#e61e2b] hover:bg-red-500 text-white shrink-0 shadow-lg shadow-red-600/30 transition cursor-pointer"
            >
              {syncingTarget ? 'Syncing Device...' : 'Sync This Device as Target'}
            </button>
          </div>
        )}

        {verificationState === 'NOT_SUBSCRIBED' && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-neutral-900/80 border-neutral-700 text-neutral-300 rounded-lg p-3">
            <div className="flex items-start gap-3">
              <Bell className="w-5 h-5 text-neutral-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="text-sm font-bold text-white">
                  Push Notifications Not Permitted On This Browser
                </div>
                <p className="text-xs text-neutral-400 leading-relaxed font-mono">
                  Browser notification permission is currently "{deviceInfo?.permission ? 'Granted' : 'Default/Blocked'}". Allow push permissions to generate a target subscription ID for this device.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleSyncCurrentDeviceAsTarget}
              disabled={syncingTarget}
              className="px-3 py-1.5 rounded-lg text-xs font-mono font-medium bg-indigo-600 hover:bg-indigo-500 text-white shrink-0 transition cursor-pointer"
            >
              Allow & Sync Device
            </button>
          </div>
        )}
      </div>

      {/* Two-Column Cross-Verification Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left Column: This Specific Device / Browser */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-sky-400" />
              <span className="text-xs font-mono uppercase tracking-wider font-semibold text-neutral-300">
                This Admin Device (Browser)
              </span>
            </div>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
              deviceInfo?.permission ? 'bg-emerald-950/60 text-emerald-400 border-emerald-700/40' : 'bg-neutral-800 text-neutral-400 border-neutral-700'
            }`}>
              {deviceInfo?.permission ? 'Permission Granted' : 'No Permission'}
            </span>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div>
              <div className="text-neutral-500 text-[11px] mb-0.5">Device Push Subscription ID:</div>
              <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-black/50 border border-neutral-800">
                <span className="truncate text-white font-mono select-all">
                  {currentSubId || <span className="text-neutral-500 italic">Not yet subscribed</span>}
                </span>
                {currentSubId && (
                  <button
                    type="button"
                    onClick={() => copyToClipboard(currentSubId, 'deviceSubId')}
                    className="p-1 rounded text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
                    title="Copy Subscription ID"
                  >
                    {copiedKey === 'deviceSubId' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>
            </div>

            <div>
              <div className="text-neutral-500 text-[11px] mb-0.5">Device OneSignal User ID (Player ID):</div>
              <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-black/50 border border-neutral-800">
                <span className="truncate text-neutral-300 font-mono select-all">
                  {currentOneSignalId || <span className="text-neutral-500 italic">Pending user session</span>}
                </span>
                {currentOneSignalId && (
                  <button
                    type="button"
                    onClick={() => copyToClipboard(currentOneSignalId, 'devicePlayerId')}
                    className="p-1 rounded text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
                    title="Copy Player ID"
                  >
                    {copiedKey === 'devicePlayerId' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>
            </div>

            <div className="pt-1 flex items-center justify-between text-[11px] text-neutral-400">
              <span>Opted-In Status:</span>
              <span className={deviceInfo?.optedIn ? 'text-emerald-400 font-medium' : 'text-neutral-400'}>
                {deviceInfo?.optedIn ? 'Subscribed & Active' : 'Not Subscribed'}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Backend / OneSignal Target Configuration */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-mono uppercase tracking-wider font-semibold text-neutral-300">
                Backend / OneSignal Target
              </span>
            </div>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
              backendStatus?.onesignalReady ? 'bg-emerald-950/60 text-emerald-400 border-emerald-700/40' : 'bg-amber-950/60 text-amber-400 border-amber-700/40'
            }`}>
              {backendStatus?.onesignalReady ? 'REST API Configured' : 'REST API Key Pending'}
            </span>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div>
              <div className="text-neutral-500 text-[11px] mb-0.5">Target Admin Subscription ID:</div>
              <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-black/50 border border-neutral-800">
                <span className="truncate text-white font-mono select-all">
                  {targetSubId || <span className="text-neutral-500 italic">None set</span>}
                </span>
                {targetSubId && (
                  <button
                    type="button"
                    onClick={() => copyToClipboard(targetSubId, 'targetSubId')}
                    className="p-1 rounded text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
                    title="Copy Target Subscription ID"
                  >
                    {copiedKey === 'targetSubId' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>
            </div>

            <div>
              <div className="text-neutral-500 text-[11px] mb-0.5">Target Admin Player ID (OneSignal ID):</div>
              <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-black/50 border border-neutral-800">
                <span className="truncate text-neutral-300 font-mono select-all">
                  {targetPlayerId || <span className="text-neutral-500 italic">None set</span>}
                </span>
                {targetPlayerId && (
                  <button
                    type="button"
                    onClick={() => copyToClipboard(targetPlayerId, 'targetPlayerId')}
                    className="p-1 rounded text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
                    title="Copy Target Player ID"
                  >
                    {copiedKey === 'targetPlayerId' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>
            </div>

            <div className="pt-1 flex items-center justify-between text-[11px] text-neutral-400">
              <span>App ID:</span>
              <span className="text-neutral-300 font-mono select-all">
                {backendStatus?.appId || 'f9cfc686-a78c-445f-a436-8b6bb2e6bdff'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Test Alert Result Box */}
      {testResult && (
        <div className={`p-4 rounded-xl border text-xs font-mono leading-relaxed space-y-2 ${
          testResult.ok ? 'bg-emerald-950/40 text-emerald-200 border-emerald-700/50' : 'bg-rose-950/50 text-rose-200 border-rose-700/50'
        }`}>
          <div className="flex items-center gap-2 font-bold text-sm">
            {testResult.ok ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <XCircle className="w-4 h-4 text-rose-400" />}
            <span>{testResult.ok ? 'Test Alert Dispatched Successfully' : 'Test Alert Delivery Issue'}</span>
          </div>
          <p>{testResult.message}</p>
          {testResult.deliveredVia && (
            <div className="text-[11px] text-neutral-400 pt-1">
              Delivered via route: <span className="text-white font-bold">{testResult.deliveredVia}</span>
              {testResult.notificationId && (
                <span className="ml-2">(OneSignal ID: {testResult.notificationId})</span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Action Footer & Collapsibles */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleSyncCurrentDeviceAsTarget}
            disabled={syncingTarget}
            className="px-3.5 py-2 rounded-xl text-xs font-mono font-semibold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-2 shadow-lg shadow-emerald-600/20 disabled:opacity-50 transition cursor-pointer"
          >
            <Check className="w-4 h-4" />
            {syncingTarget ? 'Registering...' : 'Sync This Device As Primary Target'}
          </button>

          <button
            type="button"
            onClick={() => setShowDeviceList(!showDeviceList)}
            className="px-3 py-2 rounded-xl text-xs font-mono bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-700 flex items-center gap-1.5 transition cursor-pointer"
          >
            <span>Registered Devices ({backendStatus?.devices?.length || 0})</span>
            {showDeviceList ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          <button
            type="button"
            onClick={() => setShowManualOverride(!showManualOverride)}
            className="px-3 py-2 rounded-xl text-xs font-mono bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-700 flex items-center gap-1.5 transition cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5 text-neutral-400" />
            <span>Manual ID Override</span>
            {showManualOverride ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        <a
          href="https://dashboard.onesignal.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-mono text-indigo-400 hover:text-indigo-300 flex items-center gap-1 underline underline-offset-4"
        >
          <span>OneSignal Console</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* Collapsible: Registered Admin Devices List */}
      {showDeviceList && (
        <div className="p-4 rounded-xl border border-neutral-800 bg-neutral-950/70 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-mono font-bold uppercase text-neutral-300 tracking-wider">
              Registered Admin Device Subscriptions ({backendStatus?.devices?.length || 0})
            </h4>
            <span className="text-[11px] text-neutral-500 font-mono">
              Notifications multicast to all active verified admin devices
            </span>
          </div>

          {backendStatus?.devices && backendStatus.devices.length > 0 ? (
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {backendStatus.devices.map((device, idx) => {
                const isCurrent = device.subscriptionId === currentSubId;
                const isTarget = device.isTarget || device.subscriptionId === targetSubId;

                return (
                  <div
                    key={device.subscriptionId || idx}
                    className={`p-3 rounded-lg border text-xs font-mono flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isTarget
                        ? 'bg-emerald-950/30 border-emerald-600/40'
                        : isCurrent
                        ? 'bg-sky-950/30 border-sky-600/40'
                        : 'bg-neutral-900 border-neutral-800'
                    }`}
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white truncate">
                          {device.label || 'Admin Device'}
                        </span>
                        {isTarget && (
                          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.2 rounded font-semibold">
                            PRIMARY TARGET
                          </span>
                        )}
                        {isCurrent && (
                          <span className="text-[10px] bg-sky-500/20 text-sky-300 border border-sky-500/30 px-1.5 py-0.2 rounded">
                            THIS DEVICE
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-neutral-400 truncate select-all">
                        Sub ID: {device.subscriptionId}
                      </div>
                      {device.playerId && (
                        <div className="text-[11px] text-neutral-500 truncate select-all">
                          Player ID: {device.playerId}
                        </div>
                      )}
                      <div className="text-[10px] text-neutral-500">
                        Registered: {new Date(device.registeredAt).toLocaleString()}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => copyToClipboard(device.subscriptionId, `sub-${idx}`)}
                        className="px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[11px] flex items-center gap-1 transition"
                      >
                        {copiedKey === `sub-${idx}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        Copy
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveDevice(device.subscriptionId)}
                        className="p-1.5 rounded hover:bg-rose-950/60 text-neutral-400 hover:text-rose-400 border border-neutral-800 transition"
                        title="Remove device"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-neutral-500 font-mono italic">
              No devices registered yet. Click "Sync This Device As Primary Target" to register this device.
            </p>
          )}
        </div>
      )}

      {/* Collapsible: Manual Target ID Override Form */}
      {showManualOverride && (
        <form onSubmit={handleSaveManualTarget} className="p-4 rounded-xl border border-neutral-800 bg-neutral-950/70 space-y-3">
          <div className="space-y-1">
            <h4 className="text-xs font-mono font-bold uppercase text-neutral-300 tracking-wider">
              Manual Backend Target Configuration
            </h4>
            <p className="text-xs text-neutral-400 font-mono leading-relaxed">
              If your admin login device uses a specific Player ID or Subscription ID found in the OneSignal Console (Users &gt; Subscriptions), enter it below to direct all push alerts to that player ID.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-mono text-neutral-400 mb-1">
                Target Admin Player ID (OneSignal ID)
              </label>
              <input
                type="text"
                value={manualPlayerId}
                onChange={(e) => setManualPlayerId(e.target.value)}
                placeholder="e.g. 99a86c9f-366e-4625-9506-5af191a0297d"
                className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono text-neutral-400 mb-1">
                Target Admin Subscription ID (Push Sub)
              </label>
              <input
                type="text"
                value={manualSubId}
                onChange={(e) => setManualSubId(e.target.value)}
                placeholder="e.g. 32007a0b-38ed-4800-a681-f663fd00d188"
                className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowManualOverride(false)}
              className="px-3 py-1.5 rounded-lg text-xs font-mono bg-neutral-800 hover:bg-neutral-700 text-neutral-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3.5 py-1.5 rounded-lg text-xs font-mono font-semibold bg-indigo-600 hover:bg-indigo-500 text-white"
            >
              Save Target IDs
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
