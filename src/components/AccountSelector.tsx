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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Performance Overview
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Ringkasan performa publik akun TikTok dan 10 postingan terbaru
          </p>
        </div>

        {/* Action Buttons (Matches Boltshift Right Actions) */}
        <div className="flex items-center space-x-2.5 flex-wrap">
          {/* Progress hint if syncing */}
          {isSyncing && syncProgressMessage && (
            <span className="text-xs text-blue-600 font-medium flex items-center space-x-1.5 animate-pulse pr-1">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span className="truncate max-w-[160px]">{syncProgressMessage}</span>
            </span>
          )}

          {/* Sync All Button (White Pill with Border) */}
          <button
            onClick={onTriggerSyncAll}
            disabled={isSyncing || isBudgetExceeded}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-full bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200/90 shadow-2xs transition active:scale-95 disabled:opacity-50"
            title="Ambil data seluruh akun secara berurutan"
          >
            <Layers className="w-3.5 h-3.5 text-slate-500" />
            <span>Ambil Semua</span>
          </button>

          {/* Primary Sync Button (Vibrant Blue Pill - exactly like Boltshift's 'Filter' button) */}
          <button
            onClick={onTriggerSync}
            disabled={isSyncing || isBudgetExceeded}
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Mengambil...' : `Ambil Data ${selectedAccount ? `@${selectedAccount.username}` : ''}`}</span>
          </button>
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
              className={`flex items-center space-x-2.5 px-3.5 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-150 flex-shrink-0 ${
                isSelected
                  ? 'bg-slate-900 text-white shadow-sm ring-2 ring-slate-900/10 font-semibold'
                  : 'bg-white hover:bg-slate-100/80 text-slate-600 border border-slate-200/80'
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
        <div className="flex items-center justify-between text-xs text-slate-500 px-1">
          <div className="flex items-center space-x-2">
            <span>Akun terpilih:</span>
            <a
              href={`https://www.tiktok.com/@${selectedAccount.username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline font-mono font-medium inline-flex items-center space-x-0.5"
            >
              <span>@{selectedAccount.username}</span>
              <ExternalLink className="w-3 h-3 ml-0.5 opacity-60" />
            </a>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>
              {selectedAccount.last_sync_at ? (
                <>Data diambil pada: <strong className="text-slate-700 font-mono">{formatDateWIB(selectedAccount.last_sync_at)}</strong></>
              ) : (
                <span className="text-amber-600">Belum ada pengamatan</span>
              )}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
