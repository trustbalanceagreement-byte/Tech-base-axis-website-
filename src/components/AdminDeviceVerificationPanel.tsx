import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  Smartphone, 
  Laptop, 
  CheckCircle2, 
  XCircle, 
  Copy, 
  Check, 
  RotateCcw, 
  Bell, 
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Info
} from 'lucide-react';
import { 
  getOneSignalDeviceDetails, 
  syncCurrentDeviceAsTarget, 
  requestPushPermission,
  type DeviceCrossVerificationDetails 
} from '../utils/onesignal';

interface BackendNotificationStatus {
  onesignalReady: boolean;
  appId: string;
  appIdPreview: string;
  targetAdminPlayerId: string;
  targetSubscriptionId: string;
  registeredSubscriptionIds: string[];
  lastRegisteredAt?: string;
  deviceLabel?: string;
  activeDeviceCount: number;
  adminEmails: string[];
  timestamp: string;
}

interface Props {
  userEmail?: string;
  onClose?: () => void;
  triggerToast?: (msg: string) => void;
}

export const AdminDeviceVerificationPanel: React.FC<Props> = ({ userEmail, onClose, triggerToast }) => {
  const [loading, setLoading] = useState(true);
  const [backendStatus, setBackendStatus] = useState<BackendNotificationStatus | null>(null);
  const [deviceDetails, setDeviceDetails] = useState<DeviceCrossVerificationDetails | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [testBusy, setTestBusy] = useState(false);
  const [testOutput, setTestOutput] = useState<any>(null);
  const [showConsoleGuide, setShowConsoleGuide] = useState(false);
  const [requestingPermission, setRequestingPermission] = useState(false);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const [backendRes, deviceRes] = await Promise.all([
        fetch('/api/notification-status', { cache: 'no-store' })
          .then((r) => (r.ok ? r.json() : null))
          .catch(() => null),
        getOneSignalDeviceDetails()
      ]);

      if (backendRes) setBackendStatus(backendRes);
      setDeviceDetails(deviceRes);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleCopy = (text: string, key: string) => {
    if (!text) return;
    navigator.clipboard?.writeText(text);
    setCopiedKey(key);
    if (triggerToast) triggerToast('Copied to clipboard');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSyncThisDevice = async () => {
    setSyncing(true);
    setSyncMessage(null);
    try {
      const res = await syncCurrentDeviceAsTarget(userEmail);
      if (res.success) {
        setSyncMessage({
          ok: true,
          text: `Success! Current device registered as the target admin device (Subscription ID: ${res.targetInfo?.targetSubscriptionId || deviceDetails?.subscriptionId || 'registered'})`
        });
        if (triggerToast) triggerToast('Admin target device updated successfully!');
        await fetchStatus();
      } else {
        setSyncMessage({
          ok: false,
          text: `Sync failed: ${res.error || 'Could not update backend target'}`
        });
      }
    } finally {
      setSyncing(false);
    }
  };

  const handleRequestPermission = async () => {
    setRequestingPermission(true);
    try {
      const granted = await requestPushPermission();
      if (granted) {
        if (triggerToast) triggerToast('Push notifications granted! Synchronizing device...');
        await syncCurrentDeviceAsTarget(userEmail);
        await fetchStatus();
      } else {
        if (triggerToast) triggerToast('Push notification permission was denied or dismissed.');
        await fetchStatus();
      }
    } finally {
      setRequestingPermission(false);
    }
  };

  const handleRunDiagnosticTest = async () => {
    setTestBusy(true);
    setTestOutput(null);
    try {
      const res = await fetch('/api/notify-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType: 'contact_enquiry',
          clientName: 'DEVICE VERIFICATION TEST',
          email: userEmail || 'techbaseaxis@gmail.com',
          subject: 'Admin Push Route & Player ID Diagnostic Test',
          message: 'Diagnostic test alert to verify target player ID and subscription routing.',
          idempotencyKey: `diag:${Date.now()}`
        })
      });

      const data = await res.json().catch(() => ({}));
      setTestOutput({
        status: res.status,
        ok: res.ok && data?.success,
        data
      });
      if (data?.success) {
        if (triggerToast) triggerToast('Diagnostic alert sent successfully!');
      }
    } catch (err: any) {
      setTestOutput({
        status: 500,
        ok: false,
        data: { error: err?.message || String(err) }
      });
    } finally {
      setTestBusy(false);
    }
  };

  // Cross-verification analysis
  const currentSubId = deviceDetails?.subscriptionId;
  const currentPlayerId = deviceDetails?.playerId;
  const backendSubId = backendStatus?.targetSubscriptionId;
  const backendPlayerId = backendStatus?.targetAdminPlayerId;

  const isSubMatch = Boolean(currentSubId && backendSubId && currentSubId === backendSubId);
  const isPlayerMatch = Boolean(currentPlayerId && backendPlayerId && currentPlayerId === backendPlayerId);
  const isRegisteredInList = Boolean(currentSubId && backendStatus?.registeredSubscriptionIds?.includes(currentSubId));

  const isMobile = typeof navigator !== 'undefined' && /Mobile|Android|iPhone|iPad/i.test(navigator.userAgent);

  return (
    <div className="obsidian-card rounded-2xl border border-neutral-800 bg-[#0c0d12]/95 backdrop-blur-md p-5 sm:p-7 space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800/80 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-indigo-950/60 border border-indigo-700/50 text-indigo-400 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              OneSignal Device Cross-Verification
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-950/80 text-indigo-300 border border-indigo-700/50">
                ADMIN CONSOLE
              </span>
            </h3>
            <p className="text-xs text-neutral-400 font-mono">
              Cross-verify this device's live subscription ID against backend & OneSignal console target player ID.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchStatus}
            disabled={loading}
            className="px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-700 disabled:opacity-50 cursor-pointer transition-colors"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-indigo-400' : 'text-neutral-400'}`} />
            {loading ? 'Checking...' : 'Re-verify'}
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-2.5 py-1.5 rounded-lg text-xs font-mono bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800 cursor-pointer"
            >
              Close
            </button>
          )}
        </div>
      </div>

      {/* Overview Status Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Card 1: Subscription Match */}
        <div className={`p-4 rounded-xl border flex flex-col justify-between ${
          isSubMatch 
            ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300' 
            : currentSubId 
              ? 'bg-amber-950/30 border-amber-500/40 text-amber-300'
              : 'bg-neutral-900/60 border-neutral-800 text-neutral-400'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400">Subscription Match</span>
            {isSubMatch ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : currentSubId ? (
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            ) : (
              <XCircle className="w-4 h-4 text-neutral-500" />
            )}
          </div>
          <div className="mt-2">
            <div className="text-base font-bold font-mono">
              {isSubMatch ? 'EXACT MATCH' : currentSubId ? 'ID MISMATCH' : 'NOT SUBSCRIBED'}
            </div>
            <p className="text-[11px] mt-1 leading-snug opacity-90">
              {isSubMatch 
                ? 'Device subscription ID matches backend primary target.' 
                : currentSubId 
                  ? 'Current device ID differs from registered target. Sync required.'
                  : 'Push permission not active on this browser.'}
            </p>
          </div>
        </div>

        {/* Card 2: Target Player ID */}
        <div className={`p-4 rounded-xl border flex flex-col justify-between ${
          isPlayerMatch 
            ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300' 
            : 'bg-neutral-900/60 border-neutral-800 text-neutral-300'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400">Target Player ID</span>
            {isPlayerMatch ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <Info className="w-4 h-4 text-neutral-400" />
            )}
          </div>
          <div className="mt-2">
            <div className="text-base font-bold font-mono">
              {isPlayerMatch ? 'USER ID MATCH' : 'REGISTERED TARGET'}
            </div>
            <p className="text-[11px] mt-1 leading-snug opacity-90 truncate font-mono">
              {backendPlayerId || '99a86c9f-366e-4625-9506-5af191a0297d'}
            </p>
          </div>
        </div>

        {/* Card 3: Backend REST API Readiness */}
        <div className={`p-4 rounded-xl border flex flex-col justify-between ${
          backendStatus?.onesignalReady 
            ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300' 
            : 'bg-rose-950/30 border-rose-500/40 text-rose-300'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400">OneSignal API Key</span>
            {backendStatus?.onesignalReady ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <XCircle className="w-4 h-4 text-rose-400" />
            )}
          </div>
          <div className="mt-2">
            <div className="text-base font-bold font-mono">
              {backendStatus?.onesignalReady ? 'CONFIGURED & READY' : 'KEY NOT SET IN ENV'}
            </div>
            <p className="text-[11px] mt-1 leading-snug opacity-90">
              {backendStatus?.onesignalReady 
                ? `App ID: ${backendStatus?.appIdPreview || 'f9cfc686...'}`
                : 'Set ONESIGNAL_REST_API_KEY in environment variables.'}
            </p>
          </div>
        </div>
      </div>

      {/* Sync Message Alert */}
      {syncMessage && (
        <div className={`text-xs font-mono px-4 py-3 rounded-xl border leading-relaxed flex items-center justify-between ${
          syncMessage.ok 
            ? 'bg-emerald-950/50 text-emerald-200 border-emerald-700/60' 
            : 'bg-rose-950/50 text-rose-200 border-rose-700/60'
        }`}>
          <span>{syncMessage.text}</span>
          <button 
            type="button" 
            onClick={() => setSyncMessage(null)}
            className="text-neutral-400 hover:text-white ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Cross-Verification Comparison Grid */}
      <div className="bg-neutral-950/60 rounded-xl border border-neutral-800/80 p-4 sm:p-5 space-y-4">
        <h4 className="text-xs font-mono uppercase tracking-wider text-neutral-400 flex items-center gap-2">
          {isMobile ? <Smartphone className="w-4 h-4 text-indigo-400" /> : <Laptop className="w-4 h-4 text-indigo-400" />}
          Side-By-Side Identifier Comparison
        </h4>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono border-collapse">
            <thead>
              <tr className="border-b border-neutral-800 text-neutral-400">
                <th className="py-2.5 px-3">Parameter</th>
                <th className="py-2.5 px-3">Backend / Target Value</th>
                <th className="py-2.5 px-3">Current Browser Device Value</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60 text-neutral-300">
              {/* Row 1: Subscription ID */}
              <tr>
                <td className="py-3 px-3 text-white font-medium">
                  Push Subscription ID
                  <div className="text-[10px] text-neutral-500 font-sans">Primary device push routing key</div>
                </td>
                <td className="py-3 px-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-neutral-200 truncate max-w-[200px]" title={backendSubId}>
                      {backendSubId || '32007a0b-38ed-4800-a681-f663fd00d188'}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(backendSubId || '32007a0b-38ed-4800-a681-f663fd00d188', 'backendSub')}
                      className="p-1 rounded hover:bg-neutral-800 text-neutral-400 hover:text-white"
                      title="Copy Target Subscription ID"
                    >
                      {copiedKey === 'backendSub' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </td>
                <td className="py-3 px-3">
                  <div className="flex items-center gap-1.5">
                    {currentSubId ? (
                      <>
                        <span className="text-indigo-300 truncate max-w-[200px]" title={currentSubId}>
                          {currentSubId}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(currentSubId, 'deviceSub')}
                          className="p-1 rounded hover:bg-neutral-800 text-neutral-400 hover:text-white"
                          title="Copy Current Device Subscription ID"
                        >
                          {copiedKey === 'deviceSub' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </>
                    ) : (
                      <span className="text-neutral-500 italic">Not generated (enable push first)</span>
                    )}
                  </div>
                </td>
                <td className="py-3 px-3">
                  {isSubMatch ? (
                    <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
                      <CheckCircle2 className="w-3 h-3" /> Matched
                    </span>
                  ) : isRegisteredInList ? (
                    <span className="inline-flex items-center gap-1 text-[11px] text-indigo-400 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-800/60">
                      In Fallback List
                    </span>
                  ) : currentSubId ? (
                    <span className="inline-flex items-center gap-1 text-[11px] text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/60">
                      <AlertTriangle className="w-3 h-3" /> Mismatch
                    </span>
                  ) : (
                    <span className="text-[11px] text-neutral-500">Unregistered</span>
                  )}
                </td>
                <td className="py-3 px-3 text-right">
                  {currentSubId && !isSubMatch && (
                    <button
                      type="button"
                      onClick={handleSyncThisDevice}
                      disabled={syncing}
                      className="px-2.5 py-1 text-[11px] rounded bg-indigo-600 hover:bg-indigo-500 text-white font-medium disabled:opacity-50 cursor-pointer shadow-sm"
                    >
                      {syncing ? 'Syncing...' : 'Set As Target'}
                    </button>
                  )}
                </td>
              </tr>

              {/* Row 2: Player / User ID */}
              <tr>
                <td className="py-3 px-3 text-white font-medium">
                  Target Player / User ID
                  <div className="text-[10px] text-neutral-500 font-sans">OneSignal v16 User ID / External ID</div>
                </td>
                <td className="py-3 px-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-neutral-200 truncate max-w-[200px]" title={backendPlayerId}>
                      {backendPlayerId || '99a86c9f-366e-4625-9506-5af191a0297d'}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(backendPlayerId || '99a86c9f-366e-4625-9506-5af191a0297d', 'backendPlayer')}
                      className="p-1 rounded hover:bg-neutral-800 text-neutral-400 hover:text-white"
                      title="Copy Target Player ID"
                    >
                      {copiedKey === 'backendPlayer' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </td>
                <td className="py-3 px-3">
                  <div className="flex items-center gap-1.5">
                    {currentPlayerId ? (
                      <>
                        <span className="text-indigo-300 truncate max-w-[200px]" title={currentPlayerId}>
                          {currentPlayerId}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(currentPlayerId, 'devicePlayer')}
                          className="p-1 rounded hover:bg-neutral-800 text-neutral-400 hover:text-white"
                          title="Copy Current Device Player ID"
                        >
                          {copiedKey === 'devicePlayer' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </>
                    ) : (
                      <span className="text-neutral-500 italic">Not set</span>
                    )}
                  </div>
                </td>
                <td className="py-3 px-3">
                  {isPlayerMatch ? (
                    <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
                      <CheckCircle2 className="w-3 h-3" /> Matched
                    </span>
                  ) : currentPlayerId ? (
                    <span className="inline-flex items-center gap-1 text-[11px] text-neutral-400 bg-neutral-900 px-2 py-0.5 rounded border border-neutral-700">
                      Different User
                    </span>
                  ) : (
                    <span className="text-[11px] text-neutral-500">—</span>
                  )}
                </td>
                <td className="py-3 px-3 text-right">
                  {currentPlayerId && !isPlayerMatch && (
                    <button
                      type="button"
                      onClick={handleSyncThisDevice}
                      disabled={syncing}
                      className="px-2.5 py-1 text-[11px] rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-medium disabled:opacity-50 cursor-pointer"
                    >
                      Sync User
                    </button>
                  )}
                </td>
              </tr>

              {/* Row 3: Push Permission */}
              <tr>
                <td className="py-3 px-3 text-white font-medium">
                  Browser Push Permission
                  <div className="text-[10px] text-neutral-500 font-sans">Notification API status in this browser</div>
                </td>
                <td className="py-3 px-3 text-neutral-400">
                  Required: Granted
                </td>
                <td className="py-3 px-3">
                  <span className={`px-2 py-0.5 rounded text-[11px] ${
                    deviceDetails?.permission === 'granted'
                      ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/60'
                      : 'bg-rose-950/60 text-rose-300 border border-rose-800/60'
                  }`}>
                    {deviceDetails?.permission || 'default'}
                  </span>
                </td>
                <td className="py-3 px-3">
                  {deviceDetails?.permission === 'granted' ? (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Ready
                    </span>
                  ) : (
                    <span className="text-rose-400 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Action Needed
                    </span>
                  )}
                </td>
                <td className="py-3 px-3 text-right">
                  {deviceDetails?.permission !== 'granted' && (
                    <button
                      type="button"
                      onClick={handleRequestPermission}
                      disabled={requestingPermission}
                      className="px-2.5 py-1 text-[11px] rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium disabled:opacity-50 cursor-pointer"
                    >
                      {requestingPermission ? 'Requesting...' : 'Enable Push'}
                    </button>
                  )}
                </td>
              </tr>

              {/* Row 4: Registered Admin Accounts */}
              <tr>
                <td className="py-3 px-3 text-white font-medium">
                  Admin Email Alias
                  <div className="text-[10px] text-neutral-500 font-sans">External ID alias targeted on login</div>
                </td>
                <td className="py-3 px-3 text-neutral-300 truncate max-w-[200px]">
                  {backendStatus?.adminEmails?.join(', ') || 'techbaseaxis@gmail.com'}
                </td>
                <td className="py-3 px-3 text-neutral-300">
                  {userEmail || 'techbaseaxis@gmail.com'}
                </td>
                <td className="py-3 px-3">
                  <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
                    <CheckCircle2 className="w-3 h-3" /> Targeted
                  </span>
                </td>
                <td className="py-3 px-3 text-right">
                  —
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleSyncThisDevice}
            disabled={syncing || !currentSubId}
            className="px-4 py-2 rounded-xl text-xs font-mono font-medium flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white shadow-lg shadow-red-950/50 disabled:opacity-50 cursor-pointer transition-all"
          >
            <Smartphone className="w-3.5 h-3.5" />
            {syncing ? 'Registering Device...' : 'Set Current Device as Target'}
          </button>

          <button
            type="button"
            onClick={handleRunDiagnosticTest}
            disabled={testBusy}
            className="px-4 py-2 rounded-xl text-xs font-mono font-medium flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-700 disabled:opacity-50 cursor-pointer transition-colors"
          >
            <Bell className="w-3.5 h-3.5 text-amber-400" />
            {testBusy ? 'Sending Diagnostic Alert...' : 'Send Diagnostic Test Alert'}
          </button>
        </div>

        <button
          type="button"
          onClick={() => setShowConsoleGuide(!showConsoleGuide)}
          className="text-xs font-mono text-neutral-400 hover:text-white flex items-center gap-1.5 cursor-pointer py-1"
        >
          <span>OneSignal Console Verification Guide</span>
          {showConsoleGuide ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Diagnostic Test Results Output */}
      {testOutput && (
        <div className={`p-4 rounded-xl border text-xs font-mono leading-relaxed space-y-2 ${
          testOutput.ok ? 'bg-emerald-950/30 border-emerald-700/50 text-emerald-200' : 'bg-rose-950/40 border-rose-700/50 text-rose-200'
        }`}>
          <div className="flex items-center justify-between">
            <span className="font-bold flex items-center gap-2">
              {testOutput.ok ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-rose-400" />}
              {testOutput.ok ? 'Test Alert Successfully Dispatched' : 'Alert Dispatch Diagnostic Notice'}
            </span>
            <span className="text-[10px] opacity-75">HTTP {testOutput.status}</span>
          </div>

          <div className="bg-black/40 rounded-lg p-3 text-[11px] overflow-x-auto space-y-1 text-neutral-300">
            <div><b className="text-white">Delivery Route Used:</b> {testOutput.data?.data?.routeUsed || testOutput.data?.routeUsed || 'Direct Target'}</div>
            <div><b className="text-white">Recipients Reached:</b> {testOutput.data?.recipients ?? 0} {testOutput.data?.recipients === 0 ? '(0 devices reached! Ensure push is allowed)' : 'device(s)'}</div>
            <div><b className="text-white">OneSignal Notification ID:</b> {testOutput.data?.id || 'none'}</div>
            {testOutput.data?.errors && (
              <div className="text-rose-400"><b className="text-rose-300">Route Warnings/Errors:</b> {JSON.stringify(testOutput.data.errors)}</div>
            )}
          </div>
        </div>
      )}

      {/* Collapsible OneSignal Console Verification Guide */}
      {showConsoleGuide && (
        <div className="bg-neutral-900/60 rounded-xl border border-neutral-800 p-5 text-xs font-mono space-y-3 leading-relaxed text-neutral-300">
          <div className="text-white font-bold flex items-center gap-2">
            <ExternalLink className="w-4 h-4 text-indigo-400" />
            How to verify against OneSignal Dashboard (https://dashboard.onesignal.com)
          </div>

          <ol className="list-decimal list-inside space-y-2 text-neutral-400 pl-1">
            <li>
              Log in to <a href="https://dashboard.onesignal.com" target="_blank" rel="noopener noreferrer" className="text-indigo-400 underline">dashboard.onesignal.com</a> and select the app: <b className="text-white">Tech Base Axis</b> (App ID: <span className="text-indigo-300">{backendStatus?.appId || 'f9cfc686-a78c-445f-a436-8b6bb2e6bdff'}</span>).
            </li>
            <li>
              In the left sidebar, click <b className="text-white">Audience</b> &gt; <b className="text-white">Subscriptions</b> (or <b className="text-white">All Users</b>).
            </li>
            <li>
              Filter or search by email: <b className="text-white">{userEmail || 'techbaseaxis@gmail.com'}</b> or Subscription ID: <b className="text-indigo-300">{currentSubId || backendSubId}</b>.
            </li>
            <li>
              Check the <b className="text-white">Subscription Status</b>: It must be <span className="text-emerald-400 font-bold">Subscribed</span> (not Unsubscribed or Disabled).
            </li>
            <li>
              Note: When clearing site cookies or changing browsers/phones, browser push subscriptions regenerate. Clicking <b className="text-white">"Set Current Device as Target"</b> automatically binds the new Subscription ID to the server so alerts immediately resume.
            </li>
          </ol>
        </div>
      )}
    </div>
  );
};
