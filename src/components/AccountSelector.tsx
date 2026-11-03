import React from 'react';
import { User, Plus, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { Account } from '../types';
import { formatRelativeTime } from '../lib/formatters';

interface AccountSelectorProps {
  accounts: Account[];
  selectedAccountId: string;
  onSelectAccount: (id: string) => void;
  onAddNewAccount: () => void;
}

export const AccountSelector: React.FC<AccountSelectorProps> = ({
  accounts,
  selectedAccountId,
  onSelectAccount,
  onAddNewAccount,
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
            Pilih Akun yang Dipantau
          </h2>
          <p className="text-xs text-slate-400">
            Pilih satu akun untuk melihat metrik profil dan postingan terbarunya
          </p>
        </div>
        <button
          onClick={onAddNewAccount}
          className="inline-flex items-center space-x-1.5 text-xs font-medium text-cyan-400 hover:text-cyan-300 transition"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Tambah Akun</span>
        </button>
      </div>

      {/* Grid of Accounts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {accounts.map((acc) => {
          const isSelected = acc.id === selectedAccountId;
          const hasData = Boolean(acc.last_sync_at);

          return (
            <button
              key={acc.id}
              onClick={() => onSelectAccount(acc.id)}
              className={`relative text-left p-3.5 rounded-xl border transition-all duration-200 flex flex-col justify-between ${
                isSelected
                  ? 'bg-slate-900 border-cyan-500/80 shadow-md shadow-cyan-500/10 ring-1 ring-cyan-500/40'
                  : 'bg-slate-900/60 hover:bg-slate-900/90 border-slate-800 hover:border-slate-700 text-slate-400'
              }`}
            >
              {isSelected && (
                <div className="absolute top-3 right-3 text-cyan-400">
                  <CheckCircle2 className="w-4 h-4 fill-cyan-950" />
                </div>
              )}

              <div className="flex items-center space-x-3 mb-2.5">
                <div className="relative">
                  {acc.avatar_url ? (
                    <img
                      src={acc.avatar_url}
                      alt={acc.display_name}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-800"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 font-semibold text-sm">
                      {acc.display_name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div
                    className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-slate-900 ${
                      hasData ? 'bg-emerald-500' : 'bg-amber-500'
                    }`}
                  />
                </div>

                <div className="min-w-0 pr-4">
                  <h3
                    className={`text-sm font-semibold truncate ${
                      isSelected ? 'text-white' : 'text-slate-200'
                    }`}
                  >
                    {acc.display_name}
                  </h3>
                  <p className="text-xs text-cyan-400 font-mono truncate">
                    @{acc.username}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px]">
                <div className="flex items-center space-x-1 text-slate-400 truncate">
                  <Clock className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">
                    {hasData ? formatRelativeTime(acc.last_sync_at) : 'Belum ada data'}
                  </span>
                </div>
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-medium uppercase ${
                    hasData
                      ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-900/50'
                      : 'bg-amber-950/80 text-amber-400 border border-amber-900/50'
                  }`}
                >
                  {hasData ? 'Tersedia' : 'Baru'}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
