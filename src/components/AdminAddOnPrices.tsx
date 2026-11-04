import React, { useEffect, useState } from 'react';
import { Puzzle, Save, RotateCcw } from 'lucide-react';
import { EXTRA_ADD_ONS } from './PackageBookingModal';
import { AddOnPrices, fetchLatestAddOnPrices, saveAddOnPrices, useAddOnPrices } from '../data/addOnData';

/** Admin card: change the price of each booking "Extra Add-on". */
export const AdminAddOnPrices: React.FC = () => {
  const saved = useAddOnPrices();
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<{ kind: 'ok' | 'warn'; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  // Start from the latest saved prices
  useEffect(() => {
    setDrafts((prev) => {
      const next: Record<string, string> = {};
      for (const a of EXTRA_ADD_ONS) next[a.id] = prev[a.id] ?? String(saved[a.id] ?? a.price);
      return next;
    });
  }, [saved]);

  const persist = async (prices: AddOnPrices, okText: string) => {
    setBusy(true);
    setStatus(null);
    const ok = await saveAddOnPrices(prices);
    setBusy(false);
    setStatus(
      ok
        ? { kind: 'ok', text: okText }
        : { kind: 'warn', text: 'Saved on this device only: the cloud did not accept it. Other visitors may not see the new prices yet.' }
    );
  };

  const handleSave = async () => {
    // Merge on top of the newest cloud copy, then store only the prices that differ from the defaults
    const latest = await fetchLatestAddOnPrices();
    const next: AddOnPrices = { ...latest };
    for (const a of EXTRA_ADD_ONS) {
      const n = Math.round(Number(drafts[a.id]));
      if (!Number.isFinite(n) || n < 0) {
        setStatus({ kind: 'warn', text: `Enter a valid price for "${a.name}".` });
        return;
      }
      if (n === a.price) delete next[a.id];
      else next[a.id] = n;
    }
    await persist(next, 'Add-on prices saved. Visitors will see them in the booking page.');
  };

  const handleReset = async () => {
    const defaults: Record<string, string> = {};
    for (const a of EXTRA_ADD_ONS) defaults[a.id] = String(a.price);
    setDrafts(defaults);
    await persist({}, 'Add-on prices reset to the default values.');
  };

  return (
    <div className="obsidian-card rounded-2xl border border-neutral-800 p-4 sm:p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
            <Puzzle className="w-4 h-4 text-[#e61e2b]" />
            <span>Booking Add-on Prices</span>
          </h3>
          <p className="text-xs text-neutral-400 mt-0.5">Increase or decrease the price of each extra add-on shown on the booking page.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleReset}
            disabled={busy}
            className="px-3 py-2 rounded-lg text-xs font-mono bg-neutral-900 text-neutral-300 hover:text-white border border-neutral-800 hover:border-neutral-600 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={busy}
            className="px-4 py-2 rounded-lg text-xs font-mono font-bold bg-gradient-to-r from-red-600 to-red-700 text-white border border-red-500/40 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{busy ? 'Saving...' : 'Save prices'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {EXTRA_ADD_ONS.map((a) => (
          <label key={a.id} className="rounded-xl bg-neutral-950/80 border border-neutral-800 p-3 block">
            <span className="block text-xs font-semibold text-white truncate">{a.name}</span>
            <span className="block text-[10px] font-mono text-neutral-500 mb-2">Default ₹{a.price.toLocaleString('en-IN')}</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-mono text-neutral-400">₹</span>
              <input
                type="number"
                min={0}
                step={100}
                inputMode="numeric"
                value={drafts[a.id] ?? ''}
                onChange={(e) => setDrafts((d) => ({ ...d, [a.id]: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg bg-black border border-neutral-800 focus:border-[#e61e2b] focus:outline-none text-sm text-white font-mono"
              />
            </div>
          </label>
        ))}
      </div>

      {status && (
        <div
          className={`text-xs font-mono px-3 py-2 rounded-lg border ${
            status.kind === 'ok'
              ? 'bg-emerald-950/40 text-emerald-300 border-emerald-700/40'
              : 'bg-rose-950/50 text-rose-300 border-rose-700/50'
          }`}
        >
          {status.text}
        </div>
      )}
    </div>
  );
};
