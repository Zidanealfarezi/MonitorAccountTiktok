import React, { useState, useEffect } from 'react';
import { Settings, ShieldCheck, Database, Bell, Sparkles } from 'lucide-react';
import { formatCurrencyUsd } from '../lib/formatters';
import { StorageService } from '../lib/storage';

interface HeaderProps {
  onOpenSettings: () => void;
  currentTab?: 'dashboard' | 'accounts' | 'usage';
  onTabChange?: (tab: 'dashboard' | 'accounts' | 'usage') => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSettings, currentTab = 'dashboard', onTabChange }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsScrolled(scrollY > 15);

      const winHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (winHeight > 0) {
        setScrollProgress(Math.min(100, Math.max(0, (scrollY / winHeight) * 100)));
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const usage = StorageService.getMonthlyUsage();
  const config = StorageService.getConfig();
  const budgetPercent = Math.min(100, Math.round((usage.totalChargedUsd / config.monthlyBudgetCapUsd) * 100));

  return (
    <header className={`bg-white/85 backdrop-blur-md sticky top-0 z-40 transition-all duration-300 ${
      isScrolled ? 'shadow-md shadow-slate-900/5 border-b border-slate-200/90' : 'border-b border-slate-200/60'
    }`}>
      {/* Dynamic Scroll Progress Bar */}
      <div
        className="h-[3px] bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-400 shadow-xs shadow-blue-500/40 absolute bottom-0 left-0 transition-all duration-100 ease-out z-50"
        style={{ width: `${scrollProgress}%` }}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-8">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/25">
              <Sparkles className="w-4 h-4 fill-white" />
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-base font-bold tracking-tight text-slate-900">TikTok Monitor</span>
            </div>
          </div>

          {/* Center Pill Tabs (Exactly like Boltshift reference image) */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-100/80 p-1 rounded-full border border-slate-200/60 text-xs font-medium">
            <button
              onClick={() => onTabChange?.('dashboard')}
              className={`px-4 py-1.5 rounded-full transition-all duration-150 ${
                currentTab === 'dashboard'
                  ? 'bg-slate-900 text-white shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => onOpenSettings()}
              className="px-4 py-1.5 rounded-full text-slate-600 hover:text-slate-900 transition"
            >
              Kelola Akun
            </button>
            <button
              onClick={() => onOpenSettings()}
              className="px-4 py-1.5 rounded-full text-slate-600 hover:text-slate-900 transition"
            >
              Biaya & Kuota
            </button>
          </nav>
        </div>

        {/* Right Info & Actions */}
        <div className="flex items-center space-x-3">
          {/* Apify Budget Pill */}
          <div
            className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs"
            title={`Pemakaian Apify bulan ${usage.billingCycle}: ${formatCurrencyUsd(usage.totalChargedUsd)} / ${formatCurrencyUsd(config.monthlyBudgetCapUsd)}`}
          >
            <div className="w-12 h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  usage.isBudgetExceeded ? 'bg-rose-500' : usage.isNearWarning ? 'bg-amber-400' : 'bg-blue-600'
                }`}
                style={{ width: `${budgetPercent}%` }}
              />
            </div>
            <span className="font-mono text-[11px] font-semibold text-slate-700">
              {formatCurrencyUsd(usage.totalChargedUsd)}
            </span>
          </div>

          {/* Mode Pill */}
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 border border-slate-200 text-slate-700">
            {config.isMockMode ? (
              <>
                <Database className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-amber-800 hidden md:inline">Demo</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-800 font-semibold hidden md:inline">Apify Live</span>
              </>
            )}
          </div>

          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            className="w-9 h-9 rounded-full bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 flex items-center justify-center transition shadow-2xs"
            title="Pengaturan"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* User Profile Pill (Like reference image) */}
          <div className="hidden lg:flex items-center space-x-2 pl-1">
            <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold ring-2 ring-slate-100">
              Z
            </div>
            <div className="text-left text-xs leading-tight">
              <div className="font-semibold text-slate-800">Owner Dashboard</div>
              <div className="text-[10px] text-slate-500 font-mono">TikTok Analytics</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
