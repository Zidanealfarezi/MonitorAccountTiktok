import React from 'react';
import { Plus, RefreshCw, Layers, Clock, ExternalLink, Filter } from 'lucide-react';
import { Account } from '../types';
import { formatDateWIB } from '../lib/formatters';

interface AccountSelectorProps {
  accounts: Account[];
  selectedAccountId: string;
  onSelectAccount: (id: string) => void;
  onAddNewAccount: () => void;
  isSyncing: boolean;
  syncProgressMessage?: string;
  isBudgetExceeded: boolean;
  onTriggerSync: () => void;
  onTriggerSyncAll: () => void;
}

export const AccountSelector: React.FC<AccountSelectorProps> = ({
  accounts,
  selectedAccountId,
  onSelectAccount,
  onAddNewAccount,
  isSyncing,
  syncProgressMessage,
  isBudgetExceeded,
  onTriggerSync,
  onTriggerSyncAll,
}) => {
  const selectedAccount = accounts.find((a) => a.id === selectedAccountId) || accounts[0];

  return (
    <div className="space-y-4">
      {/* 1. Page Header (Matches Boltshift Title & Action Group) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pt-1 sm:pt-2">
        <div>
          <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Performance Overview
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Ringkasan performa publik akun TikTok dan 10 postingan terbaru
          </p>
        </div>

        {/* Action Buttons: Saweria Pop & Tactile Vibe */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
          {/* Progress hint if syncing */}
          {isSyncing && (
            <div className="text-xs text-slate-950 font-black flex items-center space-x-2 bg-amber-100 px-3.5 py-1.5 rounded-2xl border-2 border-slate-900 shadow-[2px_2px_0px_#0f172a] animate-pulse">
              <span className="text-sm animate-mascot-bounce">🕵️‍♂️</span>
              <span className="truncate">{syncProgressMessage || 'Sedang memproses data...'}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:flex sm:items-center gap-2 sm:gap-2.5 w-full sm:w-auto">
            {/* Primary Hero Action: Ambil Semua Data (Saweria Golden Button) */}
            <button
              onClick={onTriggerSyncAll}
              disabled={isSyncing || isBudgetExceeded}
              className={`inline-flex items-center justify-center space-x-2.5 px-5 sm:px-6 py-2.5 rounded-2xl bg-[#FFC72C] hover:bg-[#FFB800] text-slate-950 text-xs font-black border-2 border-slate-900 shadow-[3px_3px_0px_#0f172a] hover:shadow-[4px_4px_0px_#0f172a] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all duration-150 disabled:opacity-60 order-1 sm:order-2 w-full sm:w-auto cursor-pointer ${
                isSyncing ? 'animate-pulse opacity-85 cursor-wait' : ''
              }`}
              title="Ambil data seluruh akun sekaligus secara berurutan"
            >
              <Layers className={`w-4 h-4 text-slate-950 shrink-0 ${isSyncing ? 'animate-spin' : ''}`} />
              <span className="tracking-wide">
                {isSyncing ? 'Sedang Mengambil...' : 'Ambil Semua Data'}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-slate-950 text-[10px] font-mono font-black text-amber-300 border border-slate-900">
                {accounts.length} Akun
              </span>
            </button>

            {/* Secondary Action: Ambil Data Akun Terpilih */}
            <button
              onClick={onTriggerSync}
              disabled={isSyncing || isBudgetExceeded}
              className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-2xl bg-white hover:bg-amber-50/60 text-slate-900 text-xs font-bold border-2 border-slate-900 shadow-[3px_3px_0px_#0f172a] hover:shadow-[4px_4px_0px_#0f172a] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all duration-150 disabled:opacity-50 order-2 sm:order-1 w-full sm:w-auto cursor-pointer"
              title={`Ambil data hanya untuk @${selectedAccount?.username}`}
            >
              <RefreshCw className={`w-3.5 h-3.5 text-slate-700 shrink-0 ${isSyncing ? 'animate-spin' : ''}`} />
              <span className="truncate">Ambil Data @{selectedAccount ? selectedAccount.username : ''}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Sleek Account Pills Segment (Saweria Pop Style) */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
        {accounts.map((acc) => {
          const isSelected = acc.id === selectedAccountId;
          return (
            <button
              key={acc.id}
              onClick={() => onSelectAccount(acc.id)}
              className={`flex items-center space-x-2.5 px-3.5 py-2 rounded-2xl text-xs whitespace-nowrap transition-all duration-150 flex-shrink-0 cursor-pointer ${
                isSelected
                  ? 'bg-slate-950 text-amber-300 border-2 border-slate-950 shadow-[3px_3px_0px_#0f172a] font-black scale-[1.02]'
                  : 'bg-white hover:bg-amber-50/50 text-slate-800 hover:text-slate-950 border-2 border-slate-300 hover:border-slate-900 shadow-2xs hover:shadow-[2px_2px_0px_#0f172a] font-bold'
              }`}
            >
              <div className="relative">
                {acc.avatar_url ? (
                  <img
                    src={acc.avatar_url}
                    alt=""
                    className="w-5 h-5 rounded-full object-cover ring-1 ring-slate-900"
                  />
                ) : (
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black border border-slate-900 ${
                    isSelected ? 'bg-amber-300 text-slate-950' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {acc.display_name.charAt(0)}
                  </div>
                )}
                <div
                  className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-slate-950 ${
                    acc.last_sync_at ? 'bg-emerald-400' : 'bg-amber-400'
                  }`}
                />
              </div>

              <span>{acc.display_name}</span>
            </button>
          );
        })}

        {/* Add Account Pill */}
        <button
          onClick={onAddNewAccount}
          className="flex items-center space-x-1.5 px-3.5 py-2 rounded-2xl border-2 border-dashed border-slate-400 hover:border-slate-900 text-slate-600 hover:text-slate-950 text-xs font-bold whitespace-nowrap transition flex-shrink-0 bg-white hover:bg-amber-50"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Tambah Akun</span>
        </button>
      </div>

      {/* 3. Account Context Bar */}
      {selectedAccount && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs text-slate-500 px-1 pt-0.5">
          <div className="flex items-center space-x-1.5">
            <span>Akun terpilih:</span>
            <a
              href={`https://www.tiktok.com/@${selectedAccount.username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline font-mono font-semibold inline-flex items-center space-x-0.5"
            >
              <span>@{selectedAccount.username}</span>
              <ExternalLink className="w-3 h-3 ml-0.5 opacity-60" />
            </a>
          </div>
          <div className="flex items-center space-x-2 text-slate-400 flex-wrap gap-y-1">
            <div className="flex items-center space-x-1">
              <Clock className="w-3.5 h-3.5 shrink-0" />
              <span>
                {selectedAccount.last_sync_at ? (
                  <>Data diambil: <strong className="text-slate-700 font-mono">{formatDateWIB(selectedAccount.last_sync_at)}</strong></>
                ) : (
                  <span className="text-amber-600 font-medium">Belum ada pengamatan</span>
                )}
              </span>
            </div>
            <span className="hidden sm:inline text-slate-300">•</span>
            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Auto-sync aktif (setiap kali dibuka)</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
