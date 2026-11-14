import React, { useEffect, useState, useCallback } from 'react';
import { 
  Bell, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  RefreshCw, 
  Smartphone, 
  Server, 
  Copy, 
  Check, 
  Key, 
  ExternalLink,
  ShieldCheck,
  Send,
  Trash2,
  Plus
} from 'lucide-react';
import { 
  getAdminOneSignalDeviceInfo, 
  registerDeviceSubscriptionWithBackend, 
  unregisterDeviceSubscriptionFromBackend, 
  requestPushPermission,
  type OneSignalDeviceInfo 
} from '../utils/onesignal';

interface BackendDiagnosticData {
  onesignalReady: boolean;
  appId: string;
  appIdPreview: string;
  targetAdminPlayerId: string;
  defaultAdminSubscriptionId: string;
  registeredSubscriptions: string[];
  registeredCount: number;
  adminEmails: string[];
  registeredDomain: string;
  timestamp: string;
}

interface Props {
  onToast?: (message: string) => void;
  adminEmail?: string;
}

export const AdminOneSignalDiagnostics: React.FC<Props> = ({ onToast, adminEmail }) => {
  const [loading, setLoading] = useState(true);
  const [backendData, setBackendData] = useState<BackendDiagnosticData | null>(null);
  const [deviceData, setDeviceData] = useState<OneSignalDeviceInfo | null>(null);
  const [syncingDevice, setSyncingDevice] = useState(false);
  const [testingAlert, setTestingAlert] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string; details?: any } | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [manualInput, setManualInput] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);

  const fetchStatus = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Fetch backend state
      const res = await fetch('/api/notification-status', { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        setBackendData(json);
      }

      // 2. Query browser device state
      const dev = await getAdminOneSignalDeviceInfo();
      setDeviceData(dev);
    } catch (err: any) {
      console.warn('[Diagnostics] Error fetching status:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    // Poll twice initially to allow OneSignal Web SDK v16 to finish subscribing
    const t1 = setTimeout(fetchStatus, 1500);
    const t2 = setTimeout(fetchStatus, 4000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [fetchStatus]);

  const copyToClipboard = (text: string, keyName: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(keyName);
    if (onToast) onToast(`Copied ${keyName} to clipboard!`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleRegisterCurrentDevice = async () => {
    if (!deviceData?.subscriptionId) {
      // If permission is not yet granted, prompt first
      if (!deviceData?.permission) {
        const granted = await requestPushPermission();
        if (!granted) {
          if (onToast) onToast('Notification permission was not granted. Please enable in browser settings.');
          return;
        }
        // Re-read device info after permission
        const updated = await getAdminOneSignalDeviceInfo();
        setDeviceData(updated);
        if (!updated.subscriptionId) {
          if (onToast) onToast('Waiting for OneSignal to issue subscription token. Try again in 2 seconds.');
          return;
        }
      } else {
        if (onToast) onToast('No subscription ID generated yet. Ensure notifications are allowed.');
        return;
      }
    }

    const subId = deviceData?.subscriptionId;
    if (!subId) return;

    setSyncingDevice(true);
    try {
      const res = await registerDeviceSubscriptionWithBackend(subId, adminEmail);
      if (res.success) {
        if (onToast) onToast('This device was successfully registered in backend!');
        await fetchStatus();
      } else {
        if (onToast) onToast(res.error || 'Failed to register device.');
      }
    } finally {
      setSyncingDevice(false);
    }
  };

  const handleUnregisterDevice = async (subId: string) => {
    if (!confirm(`Unregister subscription ID: ${subId}?`)) return;
    try {
      const res = await unregisterDeviceSubscriptionFromBackend(subId);
      if (res.success) {
        if (onToast) onToast('Subscription unregistered from backend.');
        await fetchStatus();
      }
    } catch {
      if (onToast) onToast('Failed to unregister.');
    }
  };

  const handleManualAdd = async () => {
    if (!manualInput.trim()) return;
    const clean = manualInput.trim();
    try {
      const res = await registerDeviceSubscriptionWithBackend(clean, adminEmail);
      if (res.success) {
        if (onToast) onToast('Subscription ID added to backend!');
        setManualInput('');
        setShowManualInput(false);
        await fetchStatus();
      } else {
        if (onToast) onToast(res.error || 'Failed to add ID.');
      }
    } catch {
      if (onToast) onToast('Failed to add ID.');
    }
  };

  const handleSendTestPush = async () => {
    setTestingAlert(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/notify-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType: 'contact_enquiry',
          clientName: 'DEVICE VERIFICATION TEST',
          email: adminEmail || 'techbaseaxis@gmail.com',
          subject: 'Admin Device Cross-Verification Push',
          message: `Cross-verification test at ${new Date().toLocaleTimeString()} on ${navigator.userAgent.slice(0, 40)}`,
          idempotencyKey: `diag:${Date.now()}`
        })
      });

      const data = await res.json().catch(() => ({}));
      if (data?.success) {
        setTestResult({
          ok: true,
          message: `Push delivered successfully! OneSignal Notification ID: ${data.id || 'Confirmed'} (Recipients: ${data.recipients ?? 1})`,
          details: data
        });
        if (onToast) onToast('Test notification delivered to OneSignal!');
      } else {
        const errorDetail = JSON.stringify(data?.errors || data?.error || data);
        setTestResult({
          ok: false,
          message: `Delivery failed: ${errorDetail}`,
          details: data
        });
        if (onToast) onToast('Test notification failed to dispatch.');
      }
    } catch (err: any) {
      setTestResult({
        ok: false,
        message: `Network failure calling /api/notify-admin: ${err?.message || err}`
      });
    } finally {
      setTestingAlert(false);
    }
  };

  // Cross-verification logic
  const currentSubId = deviceData?.subscriptionId;
  const isCurrentDeviceRegistered = Boolean(
    currentSubId && backendData?.registeredSubscriptions?.includes(currentSubId)
  );
  const targetPlayerId = backendData?.targetAdminPlayerId || '99a86c9f-366e-4625-9506-5af191a0297d';
  const defaultSubId = backendData?.defaultAdminSubscriptionId || '32007a0b-38ed-4800-a681-f663fd00d188';
  const hasRestKey = Boolean(backendData?.onesignalReady);

  return (
    <div className="obsidian-card rounded-2xl border border-neutral-800 p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-950/60 border border-red-700/50 flex items-center justify-center text-[#e61e2b] shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              OneSignal Device & Subscription Cross-Verification
            </h3>
            <p className="text-xs text-neutral-400 font-mono">
              Inspect backend target player ID, registered device subscriptions, and active login browser.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={fetchStatus}
            disabled={loading}
            className="px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-700 disabled:opacity-50 cursor-pointer transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-red-400' : 'text-neutral-400'}`} />
            {loading ? 'Inspecting...' : 'Refresh'}
          </button>
          <button
            type="button"
            onClick={handleSendTestPush}
            disabled={testingAlert}
            className="px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1.5 bg-red-600 hover:bg-red-500 text-white font-semibold disabled:opacity-50 cursor-pointer transition-colors shadow-sm"
          >
            <Send className={`w-3.5 h-3.5 ${testingAlert ? 'animate-pulse' : ''}`} />
            {testingAlert ? 'Sending Push...' : 'Send Test Push'}
          </button>
        </div>
      </div>

      {/* Main Status Verdict Banner */}
      <div className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
        !hasRestKey 
          ? 'bg-rose-950/40 border-rose-700/60 text-rose-200'
          : isCurrentDeviceRegistered
          ? 'bg-emerald-950/40 border-emerald-700/60 text-emerald-200'
          : 'bg-amber-950/40 border-amber-700/60 text-amber-200'
      }`}>
        <div className="flex items-start gap-3">
          {!hasRestKey ? (
            <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          ) : isCurrentDeviceRegistered ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          )}
          <div className="space-y-1">
            <div className="text-sm font-semibold flex items-center gap-2">
              {!hasRestKey
                ? 'Issue 1: Server Missing ONESIGNAL_REST_API_KEY'
                : isCurrentDeviceRegistered
                ? 'Device Matched & Registered in Backend'
                : 'Device ID Mismatch / Device Not Yet Registered in Backend'}
            </div>
            <p className="text-xs font-mono leading-relaxed opacity-90">
              {!hasRestKey
                ? 'Push notifications cannot reach any admin device until ONESIGNAL_REST_API_KEY is configured in your server / Vercel environment.'
                : isCurrentDeviceRegistered
                ? `Current browser's subscription ID (${currentSubId?.slice(0, 14)}...) is registered and linked to admin push routing.`
                : currentSubId
                ? `Current browser has active subscription (${currentSubId.slice(0, 14)}...), but backend is targeting default subscription (${defaultSubId.slice(0, 14)}...) and player ID (${targetPlayerId.slice(0, 14)}...). Click "Link & Register This Device" to add it now.`
                : 'This browser has not granted push notification permissions or OneSignal has not yet generated a subscription ID. Click "Enable & Register" below.'}
            </p>
          </div>
        </div>

        {hasRestKey && !isCurrentDeviceRegistered && (
          <button
            type="button"
            onClick={handleRegisterCurrentDevice}
            disabled={syncingDevice}
            className="px-4 py-2 rounded-lg text-xs font-mono font-semibold bg-amber-500 hover:bg-amber-400 text-black flex items-center gap-2 shrink-0 cursor-pointer transition-colors shadow-md disabled:opacity-50"
          >
            <Smartphone className="w-4 h-4" />
            {syncingDevice ? 'Registering Device...' : 'Link & Register This Device'}
          </button>
        )}
      </div>

      {/* Test Result Message if available */}
      {testResult && (
        <div className={`p-3.5 rounded-xl border text-xs font-mono leading-relaxed ${
          testResult.ok 
            ? 'bg-emerald-950/60 border-emerald-700/60 text-emerald-300' 
            : 'bg-rose-950/60 border-rose-700/60 text-rose-300'
        }`}>
          <div className="font-bold mb-1 flex items-center gap-1.5">
            {testResult.ok ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <XCircle className="w-4 h-4 text-rose-400" />}
            {testResult.ok ? 'OneSignal REST API Success:' : 'OneSignal Dispatch Result:'}
          </div>
          <div className="break-all">{testResult.message}</div>
        </div>
      )}

      {/* Side-by-Side Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1: Current Admin Device (This Browser / Device) */}
        <div className="bg-neutral-900/70 rounded-xl border border-neutral-800 p-4 space-y-3.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-neutral-400 flex items-center gap-1.5 font-bold">
              <Smartphone className="w-4 h-4 text-sky-400" />
              Current Admin Device (This Device)
            </span>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
              deviceData?.permission 
                ? 'bg-emerald-950/60 text-emerald-300 border-emerald-700/60' 
                : 'bg-neutral-800 text-neutral-400 border-neutral-700'
            }`}>
              {deviceData?.permission ? 'Push Permission: Granted' : `Push: ${deviceData?.permissionNative || 'Prompt Needed'}`}
            </span>
          </div>

          <div className="space-y-2 text-xs font-mono">
            {/* Device Subscription ID */}
            <div>
              <div className="text-neutral-500 text-[11px] mb-0.5">Device Subscription ID (OneSignal v16 Push Channel):</div>
              <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-black/60 border border-neutral-800">
                <span className="text-neutral-200 truncate select-all">
                  {deviceData?.subscriptionId || (
                    <span className="text-amber-400 italic">None (Click "Enable Push" to generate)</span>
                  )}
                </span>
                {deviceData?.subscriptionId && (
                  <button
                    type="button"
                    onClick={() => copyToClipboard(deviceData.subscriptionId!, 'Device Subscription ID')}
                    className="p-1 text-neutral-400 hover:text-white shrink-0"
                    title="Copy Subscription ID"
                  >
                    {copiedKey === 'Device Subscription ID' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>
            </div>

            {/* Device OneSignal User ID (Player ID) */}
            <div>
              <div className="text-neutral-500 text-[11px] mb-0.5">Device User / Player ID (`onesignalId`):</div>
              <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-black/60 border border-neutral-800">
                <span className="text-neutral-200 truncate select-all">
                  {deviceData?.onesignalId || (
                    <span className="text-neutral-500 italic">Waiting for OneSignal init...</span>
                  )}
                </span>
                {deviceData?.onesignalId && (
                  <button
                    type="button"
                    onClick={() => copyToClipboard(deviceData.onesignalId!, 'Device OneSignal ID')}
                    className="p-1 text-neutral-400 hover:text-white shrink-0"
                    title="Copy Device OneSignal ID"
                  >
                    {copiedKey === 'Device OneSignal ID' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>
            </div>

            {/* Identity & Origin */}
            <div className="pt-1 flex flex-wrap gap-2 text-[11px] text-neutral-400">
              <span className="bg-neutral-800/80 px-2 py-0.5 rounded border border-neutral-700/50">
                Admin: <strong className="text-white">{adminEmail || 'techbaseaxis@gmail.com'}</strong>
              </span>
              <span className={`px-2 py-0.5 rounded border ${
                deviceData?.isRegisteredDomain 
                  ? 'bg-neutral-800/80 text-neutral-300 border-neutral-700/50' 
                  : 'bg-amber-950/40 text-amber-300 border-amber-700/50'
              }`}>
                Origin: <strong>{deviceData?.origin || 'Browser'}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Backend & OneSignal Console Reference */}
        <div className="bg-neutral-900/70 rounded-xl border border-neutral-800 p-4 space-y-3.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-neutral-400 flex items-center gap-1.5 font-bold">
              <Server className="w-4 h-4 text-purple-400" />
              Backend & OneSignal Console Target
            </span>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
              hasRestKey 
                ? 'bg-emerald-950/60 text-emerald-300 border-emerald-700/60' 
                : 'bg-rose-950/60 text-rose-300 border-rose-700/60'
            }`}>
              {hasRestKey ? 'REST API Key: Set' : 'REST API Key: Missing'}
            </span>
          </div>

          <div className="space-y-2 text-xs font-mono">
            {/* Target Admin Player ID */}
            <div>
              <div className="text-neutral-500 text-[11px] mb-0.5">Target Admin Player ID (OneSignal Console):</div>
              <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-black/60 border border-neutral-800">
                <span className="text-neutral-200 truncate select-all">{targetPlayerId}</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(targetPlayerId, 'Target Player ID')}
                  className="p-1 text-neutral-400 hover:text-white shrink-0"
                  title="Copy Target Player ID"
                >
                  {copiedKey === 'Target Player ID' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Target Admin Subscription ID */}
            <div>
              <div className="text-neutral-500 text-[11px] mb-0.5">Default Admin Subscription ID:</div>
              <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-black/60 border border-neutral-800">
                <span className="text-neutral-200 truncate select-all">{defaultSubId}</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(defaultSubId, 'Default Subscription ID')}
                  className="p-1 text-neutral-400 hover:text-white shrink-0"
                  title="Copy Default Subscription ID"
                >
                  {copiedKey === 'Default Subscription ID' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* App ID & Cloud Persistence */}
            <div className="pt-1 flex flex-wrap gap-2 text-[11px] text-neutral-400">
              <span className="bg-neutral-800/80 px-2 py-0.5 rounded border border-neutral-700/50">
                App ID: <strong className="text-white">{backendData?.appIdPreview || 'f9cfc686...'}</strong>
              </span>
              <span className="bg-neutral-800/80 px-2 py-0.5 rounded border border-neutral-700/50">
                Registered Devices: <strong className="text-white">{backendData?.registeredCount ?? 0} active</strong>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Registered Subscriptions List & Manual Addition */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="text-xs font-mono font-bold text-neutral-300 flex items-center gap-2">
            <span>Actively Registered Admin Subscriptions in Backend Storage:</span>
            <span className="text-red-400">({backendData?.registeredSubscriptions?.length ?? 0})</span>
          </div>

          <button
            type="button"
            onClick={() => setShowManualInput(!showManualInput)}
            className="text-xs font-mono text-sky-400 hover:text-sky-300 flex items-center gap-1 cursor-pointer transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            {showManualInput ? 'Close Manual Input' : 'Add Subscription ID Manually'}
          </button>
        </div>

        {showManualInput && (
          <div className="p-3 rounded-lg border border-neutral-700 bg-black/60 space-y-2">
            <div className="text-[11px] font-mono text-neutral-400">
              Paste a subscription ID or player ID directly from your OneSignal Dashboard (Audience &gt; Subscriptions):
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                placeholder="e.g. 32007a0b-38ed-4800-a681-f663fd00d188"
                className="flex-1 px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-700 text-xs font-mono text-white placeholder-neutral-500 focus:outline-none focus:border-red-500"
              />
              <button
                type="button"
                onClick={handleManualAdd}
                className="px-3 py-1.5 rounded-lg text-xs font-mono bg-red-600 hover:bg-red-500 text-white font-semibold cursor-pointer"
              >
                Add ID
              </button>
            </div>
          </div>
        )}

        <div className="space-y-1.5 max-h-48 overflow-y-auto">
          {backendData?.registeredSubscriptions && backendData.registeredSubscriptions.length > 0 ? (
            backendData.registeredSubscriptions.map((subId) => {
              const isCurrent = subId === currentSubId;
              const isDefault = subId === defaultSubId;
              return (
                <div 
                  key={subId} 
                  className={`flex items-center justify-between gap-2 p-2 rounded-lg border text-xs font-mono ${
                    isCurrent 
                      ? 'bg-emerald-950/40 border-emerald-600/50 text-emerald-200' 
                      : 'bg-black/50 border-neutral-800 text-neutral-300'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="truncate select-all">{subId}</span>
                    {isCurrent && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 shrink-0">
                        This Device
                      </span>
                    )}
                    {isDefault && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-neutral-800 text-neutral-400 border border-neutral-700 shrink-0">
                        Primary Fallback
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => copyToClipboard(subId, 'Subscription ID')}
                      className="p-1 text-neutral-400 hover:text-white cursor-pointer"
                      title="Copy"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUnregisterDevice(subId)}
                      className="p-1 text-neutral-500 hover:text-rose-400 cursor-pointer"
                      title="Remove"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-xs font-mono text-neutral-500 italic py-2 text-center">
              No subscription IDs currently stored in backend.
            </div>
          )}
        </div>
      </div>

      {/* Investigation Findings & Quick-Fix Guide */}
      <div className="border-t border-neutral-800/80 pt-4 space-y-2.5">
        <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
          <Key className="w-3.5 h-3.5 text-amber-400" />
          Technical Investigation Summary
        </h4>
        <div className="text-xs font-mono text-neutral-300 space-y-1.5 leading-relaxed bg-black/40 p-3.5 rounded-xl border border-neutral-800/60">
          <p>
            1. <strong>Target Player ID vs. Subscription ID:</strong> In OneSignal v16, Player IDs (e.g. <code className="text-red-300">99a86c9f-366e-4625-9506-5af191a0297d</code>) are legacy/User aliases, whereas push routing uses device-specific Subscription IDs (e.g. <code className="text-amber-300">32007a0b-38ed-4800-a681-f663fd00d188</code>).
          </p>
          <p>
            2. <strong>Device Binding:</strong> If you open the admin console on a new phone or PC browser, OneSignal generates a unique Subscription ID for that browser. The system now automatically captures and syncs this ID via <code className="text-sky-300">/api/register-admin-device</code> to ensure alerts reach your exact active admin screen.
          </p>
          <p>
            3. <strong>REST API Key Requirement:</strong> OneSignal push dispatch strictly requires <code className="text-amber-300">ONESIGNAL_REST_API_KEY</code> set in your deployment environment (Vercel / Cloud Run). If missing, events are recorded locally but remote push is bypassed.
          </p>
          <p>
            4. <strong>Origin Domain:</strong> OneSignal Web Push is registered to <code className="text-purple-300">https://www.tbaonline.online</code>. If testing on temporary development preview URLs, ensure notifications permission is allowed and test alerts via the button above.
          </p>
        </div>
      </div>
    </div>
  );
};
