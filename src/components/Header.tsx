import React from 'react';
import { Settings, ShieldCheck, Database, AlertCircle } from 'lucide-react';
import { formatCurrencyUsd } from '../lib/formatters';
import { StorageService } from '../lib/storage';

interface HeaderProps {
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSettings }) => {
  const usage = StorageService.getMonthlyUsage();
  const config = StorageService.getConfig();
  const budgetPercent = Math.min(100, Math.round((usage.totalChargedUsd / config.monthlyBudgetCapUsd) * 100));

  return (
    <header className="border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-500 flex items-center justify-center shadow-md shadow-cyan-500/20">
            <svg className="w-4 h-4 text-slate-950 fill-current" viewBox="0 0 24 24">
              <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.82 4.47 6.28 6.28 0 0 0 1.93-4.54V8.69a8.18 8.18 0 0 0 4.78 1.52v-3.4a4.85 4.85 0 0 1-.94-.12Z" />
            </svg>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-bold tracking-tight text-white">TikTok Monitor</span>
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-900 text-slate-400 border border-slate-800">
              Mode Hemat
            </span>
          </div>
        </div>

        {/* Right Info & Actions */}
        <div className="flex items-center space-x-3">
          {/* Compact Budget Widget */}
          <div
            className="flex items-center space-x-2 px-2.5 py-1 rounded-lg bg-slate-900/90 border border-slate-800/80 text-xs"
            title={`Pemakaian Apify bulan ${usage.billingCycle}: ${formatCurrencyUsd(usage.totalChargedUsd)} dari pagu ${formatCurrencyUsd(config.monthlyBudgetCapUsd)}`}
          >
            <div className="w-16 h-1 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  usage.isBudgetExceeded
                    ? 'bg-rose-500'
                    : usage.isNearWarning
                    ? 'bg-amber-400'
                    : 'bg-cyan-400'
                }`}
                style={{ width: `${budgetPercent}%` }}
              />
            </div>
            <span className="font-mono text-[11px] text-slate-300">
              {formatCurrencyUsd(usage.totalChargedUsd)}
            </span>
          </div>

          {/* Mode Pill */}
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-slate-900/90 border border-slate-800/80 text-slate-300">
            {config.isMockMode ? (
              <>
                <Database className="w-3 h-3 text-amber-400" />
                <span className="text-amber-300/90 hidden sm:inline">Demo</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-300/90 hidden sm:inline">Live</span>
              </>
            )}
          </div>

          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-900/90 hover:bg-slate-800 border border-slate-800 transition"
            title="Pengaturan Akun & API"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
