import React from 'react';
import { Plus, Check, RefreshCw, Layers, Clock, ExternalLink } from 'lucide-react';
import { Account } from '../types';
import { formatDateWIB, formatRelativeTime } from '../lib/formatters';

interface AccountSelectorProps {
  accounts: Account[];
  selectedAccountId: string;
  onSelectAccount: (id: string) => void;
  onAddNewAccount: () => void;
  // Integrated sync actions
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
      {/* 1. Sleek Account Chips Bar */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
        {accounts.map((acc) => {
          const isSelected = acc.id === selectedAccountId;
          return (
            <button
              key={acc.id}
              onClick={() => onSelectAccount(acc.id)}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl border text-xs font-medium whitespace-nowrap transition-all duration-150 flex-shrink-0 ${
                isSelected
                  ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-300 ring-1 ring-cyan-500/20'
                  : 'bg-slate-900/60 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <div className="relative">
                {acc.avatar_url ? (
                  <img
                    src={acc.avatar_url}
                    alt=""
                    className="w-5 h-5 rounded-full object-cover ring-1 ring-slate-700"
                  />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px] text-slate-300 font-bold">
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

        {/* Add Account Chip */}
        <button
          onClick={onAddNewAccount}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-dashed border-slate-700 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/40 text-xs font-medium whitespace-nowrap transition flex-shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Tambah</span>
        </button>
      </div>

      {/* 2. Focused Account Profile Banner & Action Buttons */}
      {selectedAccount && (
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Account Profile Info */}
          <div className="flex items-center space-x-3.5">
            <div className="relative">
              {selectedAccount.avatar_url ? (
                <img
                  src={selectedAccount.avatar_url}
                  alt={selectedAccount.display_name}
                  className="w-12 h-12 rounded-2xl object-cover ring-2 ring-slate-800"
                />
              ) : (
                <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-300 font-bold text-lg">
                  {selectedAccount.display_name.charAt(0)}
                </div>
              )}
              <div
                className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full ring-2 ring-slate-950 ${
                  selectedAccount.last_sync_at ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
              />
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  {selectedAccount.display_name}
                </h2>
                <a
                  href={`https://www.tiktok.com/@${selectedAccount.username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-cyan-400 hover:text-cyan-300 font-mono inline-flex items-center space-x-0.5"
                >
                  <span>@{selectedAccount.username}</span>
                  <ExternalLink className="w-3 h-3 ml-0.5 opacity-60" />
                </a>
              </div>

              <div className="flex items-center space-x-2 text-xs text-slate-400 mt-0.5">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>
                  {selectedAccount.last_sync_at ? (
                    <>
                      Diperbarui:{' '}
                      <span className="text-slate-300 font-medium">
                        {formatDateWIB(selectedAccount.last_sync_at)}
                      </span>
                    </>
                  ) : (
                    <span className="text-amber-400">Belum ada data pengamatan</span>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Integrated Actions & Progress */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            {isSyncing && syncProgressMessage && (
              <span className="text-xs text-cyan-400 font-mono animate-pulse mr-2 flex items-center space-x-1">
                <RefreshCw className="w-3 h-3 animate-spin" />
                <span className="truncate max-w-[200px]">{syncProgressMessage}</span>
              </span>
            )}

            <button
              onClick={onTriggerSync}
              disabled={isSyncing || isBudgetExceeded}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center justify-center space-x-2 transition shadow-sm ${
                isBudgetExceeded
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : isSyncing
                  ? 'bg-cyan-950 text-cyan-400 cursor-wait'
                  : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold shadow-cyan-500/10 active:scale-95'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>Ambil Data</span>
            </button>

            <button
              onClick={onTriggerSyncAll}
              disabled={isSyncing || isBudgetExceeded}
              className={`px-3.5 py-2 rounded-xl text-xs font-medium flex items-center justify-center space-x-1.5 transition border ${
                isSyncing || isBudgetExceeded
                  ? 'bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed'
                  : 'bg-slate-900 hover:bg-slate-800/80 text-slate-300 border-slate-800 hover:text-white active:scale-95'
              }`}
              title="Ambil data seluruh 6 akun secara berurutan"
            >
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              <span>Ambil Semua</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
