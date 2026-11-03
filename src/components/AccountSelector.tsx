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

        {/* Action Buttons: Clean & Full-width on Mobile */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
          {/* Progress hint if syncing */}
          {isSyncing && syncProgressMessage && (
            <div className="text-xs text-blue-700 font-medium flex items-center space-x-1.5 animate-pulse bg-blue-50 px-3 py-1.5 rounded-full border border-blue-200/80 shadow-2xs">
              <RefreshCw className="w-3.5 h-3.5 animate-spin shrink-0 text-blue-600" />
              <span className="truncate">{syncProgressMessage}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:flex sm:items-center gap-2 sm:gap-2.5 w-full sm:w-auto">
            {/* Primary Hero Action: Ambil Semua Data (Mencolok & Prominent) */}
            <button
              onClick={onTriggerSyncAll}
              disabled={isSyncing || isBudgetExceeded}
              className="inline-flex items-center justify-center space-x-2.5 px-5 sm:px-6 py-2.5 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 animate-gradient hover:animate-none hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-extrabold shadow-lg shadow-blue-500/25 ring-2 ring-blue-500/20 hover:ring-blue-500/40 hover:scale-[1.02] transition-all duration-300 active:scale-95 disabled:opacity-50 order-1 sm:order-2 w-full sm:w-auto cursor-pointer"
              title="Ambil data seluruh akun sekaligus secara berurutan"
            >
              <Layers className="w-4 h-4 text-blue-100 shrink-0" />
              <span className="tracking-wide">Ambil Semua Data</span>
              <span className="px-1.5 py-0.5 rounded-full bg-white/20 text-[10px] font-mono font-extrabold text-white">
                {accounts.length} Akun
              </span>
            </button>

            {/* Secondary Action: Ambil Data Akun Terpilih */}
            <button
              onClick={onTriggerSync}
              disabled={isSyncing || isBudgetExceeded}
              className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-full bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 text-xs font-semibold border border-slate-200/90 shadow-2xs hover:scale-[1.01] transition-all duration-200 active:scale-95 disabled:opacity-50 order-2 sm:order-1 w-full sm:w-auto cursor-pointer"
              title={`Ambil data hanya untuk @${selectedAccount?.username}`}
            >
              <RefreshCw className={`w-3.5 h-3.5 text-slate-500 shrink-0 ${isSyncing ? 'animate-spin' : ''}`} />
              <span className="truncate">Ambil Data @{selectedAccount ? selectedAccount.username : ''}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Sleek Account Pills Segment (Matches Boltshift navigation pills) */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
        {accounts.map((acc) => {
          const isSelected = acc.id === selectedAccountId;
          return (
            <button
              key={acc.id}
              onClick={() => onSelectAccount(acc.id)}
              className={`flex items-center space-x-2.5 px-3.5 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200 flex-shrink-0 cursor-pointer ${
                isSelected
                  ? 'bg-slate-900 text-white shadow-md ring-2 ring-slate-900/10 font-semibold scale-[1.02]'
                  : 'bg-white hover:bg-slate-100/80 text-slate-600 hover:text-slate-900 border border-slate-200/80 hover:border-slate-300'
              }`}
            >
              <div className="relative">
                {acc.avatar_url ? (
                  <img
                    src={acc.avatar_url}
                    alt=""
                    className="w-5 h-5 rounded-full object-cover ring-1 ring-white/20"
                  />
                ) : (
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    isSelected ? 'bg-slate-800 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {acc.display_name.charAt(0)}
                  </div>
                )}
                <div
                  className={`absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 rounded-full ${
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
          className="flex items-center space-x-1.5 px-3.5 py-2 rounded-full border border-dashed border-slate-300 hover:border-blue-500 text-slate-500 hover:text-blue-600 text-xs font-medium whitespace-nowrap transition flex-shrink-0 bg-white/60"
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
              <span>Auto-sync aktif (tiap 2 jam)</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
