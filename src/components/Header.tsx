import React, { useState, useEffect } from 'react';
import { Activity, Settings, RefreshCw, AlertTriangle, ShieldCheck, Database } from 'lucide-react';
import { formatCurrencyUsd } from '../lib/formatters';
import { StorageService } from '../lib/storage';

interface HeaderProps {
  onOpenSettings: () => void;
  onRefresh: () => void;
  isSyncing: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSettings, onRefresh, isSyncing }) => {
  const [wibTime, setWibTime] = useState<string>('');
  const usage = StorageService.getMonthlyUsage();
  const config = StorageService.getConfig();

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const formatted = new Intl.DateTimeFormat('id-ID', {
        timeZone: 'Asia/Jakarta',
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      }).format(now);
      setWibTime(formatted + ' WIB');
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const budgetPercent = Math.min(100, Math.round((usage.totalChargedUsd / config.monthlyBudgetCapUsd) * 100));

  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-teal-400 to-indigo-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <svg className="w-6 h-6 text-slate-950 fill-current" viewBox="0 0 24 24">
              <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.82 4.47 6.28 6.28 0 0 0 1.93-4.54V8.69a8.18 8.18 0 0 0 4.78 1.52v-3.4a4.85 4.85 0 0 1-.94-.12Z" />
            </svg>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-bold tracking-tight text-white">TikTok Monitor</h1>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800/60 uppercase tracking-wider">
                Mode Hemat
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Pemantauan performa & pertumbuhan akun publik via Apify Scraper
            </p>
          </div>
        </div>

        {/* Right Info & Actions */}
        <div className="flex items-center space-x-4">
          {/* WIB Clock */}
          <div className="hidden md:flex flex-col text-right">
            <span className="text-[11px] text-slate-400">Waktu Server (WIB)</span>
            <span className="text-xs font-mono font-medium text-slate-200">{wibTime || 'Memuat...'}</span>
          </div>

          {/* Budget Widget */}
          <div className="hidden lg:flex items-center space-x-2.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800">
            <div className="flex flex-col">
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="text-slate-400">Biaya Apify ({usage.billingCycle})</span>
                <span className={`font-mono font-semibold ${usage.isNearWarning ? 'text-amber-400' : 'text-slate-200'}`}>
                  {formatCurrencyUsd(usage.totalChargedUsd)} / {formatCurrencyUsd(config.monthlyBudgetCapUsd)}
                </span>
              </div>
              <div className="w-36 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 rounded-full ${
                    usage.isBudgetExceeded
                      ? 'bg-rose-500'
                      : usage.isNearWarning
                      ? 'bg-amber-400'
                      : 'bg-gradient-to-r from-cyan-500 to-teal-400'
                  }`}
                  style={{ width: `${budgetPercent}%` }}
                />
              </div>
            </div>
            {usage.isNearWarning && (
              <span title="Mendekati batas anggaran bulanan ($4.00)">
                <AlertTriangle className="w-4 h-4 text-amber-400 animate-pulse" />
              </span>
            )}
          </div>

          {/* Mode Pill */}
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-900 border border-slate-800 text-slate-300">
            {config.isMockMode ? (
              <>
                <Database className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-amber-300/90 hidden sm:inline">Demo Mode</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-300/90 hidden sm:inline">Apify Live</span>
              </>
            )}
          </div>

          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition"
            title="Buka Pengaturan Akun & Kuota"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
