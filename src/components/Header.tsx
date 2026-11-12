import React, { useState, useEffect } from 'react';
import { Sparkles, Settings, ShieldCheck, Database } from 'lucide-react';
import { StorageService } from '../lib/storage';
import { formatCurrencyUsd } from '../lib/formatters';
import { DeviceAuthService } from '../lib/deviceAuth';

interface HeaderProps {
  onOpenSettings: (tab?: 'accounts' | 'usage' | 'api' | 'security') => void;
  currentTab?: 'dashboard' | 'posts' | 'accounts' | 'usage';
  onTabChange?: (tab: 'dashboard' | 'posts') => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSettings,
  currentTab = 'dashboard',
  onTabChange,
}) => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = Math.min(100, Math.max(0, (window.scrollY / totalHeight) * 100));
        setScrollProgress(progress);
      }
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const usage = StorageService.getMonthlyUsage();
  const config = StorageService.getConfig();
  const budgetPercent = Math.min(100, Math.round((usage.totalChargedUsd / config.monthlyBudgetCapUsd) * 100));
  const currentDevice = DeviceAuthService.getOrInitCurrentDeviceInfo();

  return (
    <header className={`bg-white/95 backdrop-blur-md sticky top-0 z-40 transition-all duration-300 ${
      isScrolled ? 'shadow-md shadow-slate-900/5 border-b-2 border-slate-900' : 'border-b-2 border-slate-200'
    }`}>
      {/* Dynamic Scroll Progress Bar in Saweria Amber */}
      <div
        className="h-[3px] bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-500 shadow-xs shadow-amber-500/40 absolute bottom-0 left-0 transition-all duration-100 ease-out z-50"
        style={{ width: `${scrollProgress}%` }}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-8">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#FFC72C] border-2 border-slate-900 flex items-center justify-center text-slate-950 shadow-[2px_2px_0px_#0f172a]">
              <Sparkles className="w-4 h-4 fill-slate-950" />
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-base font-black tracking-tight text-slate-900">TikTok Monitor</span>
            </div>
          </div>

          {/* Center Pill Tabs (Saweria Neo-Brutal Pop Style) */}
          <nav className="hidden md:flex items-center space-x-1 bg-amber-50/70 p-1 rounded-2xl border-2 border-slate-900 text-xs font-bold shadow-[2px_2px_0px_#0f172a]">
            <button
              onClick={() => onTabChange?.('dashboard')}
              className={`px-3.5 py-1.5 rounded-xl transition-all duration-150 cursor-pointer ${
                currentTab === 'dashboard'
                  ? 'bg-slate-950 text-amber-300 shadow-xs font-black'
                  : 'text-slate-700 hover:text-slate-950 hover:bg-white/70'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => onTabChange?.('posts')}
              className={`px-3.5 py-1.5 rounded-xl transition-all duration-150 flex items-center space-x-1.5 cursor-pointer ${
                currentTab === 'posts'
                  ? 'bg-slate-950 text-amber-300 shadow-xs font-black'
                  : 'text-slate-700 hover:text-slate-950 hover:bg-white/70'
              }`}
            >
              <span>Postingan Terbaru</span>
              <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono font-black ${
                currentTab === 'posts'
                  ? 'bg-[#FFC72C] text-slate-950'
                  : 'bg-amber-100 text-slate-900 border border-slate-900/40'
              }`}>
                10
              </span>
            </button>
            <button
              onClick={() => onOpenSettings('accounts')}
              className="px-3.5 py-1.5 rounded-xl text-slate-700 hover:text-slate-950 hover:bg-white/80 transition cursor-pointer"
            >
              Kelola Akun
            </button>
            <button
              onClick={() => onOpenSettings('usage')}
              className="px-3.5 py-1.5 rounded-xl text-slate-700 hover:text-slate-950 hover:bg-white/80 transition cursor-pointer"
            >
              Biaya & Kuota
            </button>
            <button
              onClick={() => onOpenSettings('security')}
              className="px-3.5 py-1.5 rounded-xl text-slate-700 hover:text-slate-950 hover:bg-white/80 transition cursor-pointer"
            >
              Perangkat
            </button>
          </nav>
        </div>

        {/* Right Info & Actions */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Device Whitelisted Pill */}
          <button
            onClick={() => onOpenSettings('security')}
            className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-100 hover:bg-emerald-200 border-2 border-slate-900 text-slate-900 shadow-[2px_2px_0px_#0f172a] hover:shadow-[3px_3px_0px_#0f172a] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition cursor-pointer"
            title="Perangkat ini resmi terdaftar & terlindungi (Klik untuk kelola)"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
            <span className="text-[11px] font-mono font-black">{currentDevice.deviceId}</span>
          </button>

          {/* Apify Budget Pill */}
          <div
            className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-white border-2 border-slate-900 shadow-[2px_2px_0px_#0f172a] text-xs font-bold"
            title={`Pemakaian Apify bulan ${usage.billingCycle}: ${formatCurrencyUsd(usage.totalChargedUsd)} / ${formatCurrencyUsd(config.monthlyBudgetCapUsd)}`}
          >
            <div className="w-12 h-2 bg-slate-100 border border-slate-900 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  usage.isBudgetExceeded ? 'bg-rose-500' : usage.isNearWarning ? 'bg-amber-400' : 'bg-[#FFC72C]'
                }`}
                style={{ width: `${budgetPercent}%` }}
              />
            </div>
            <span className="font-mono text-[11px] font-black text-slate-900">
              {formatCurrencyUsd(usage.totalChargedUsd)}
            </span>
          </div>

          {/* Mode Pill */}
          <div className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-white border-2 border-slate-900 shadow-[2px_2px_0px_#0f172a] text-slate-900">
            {config.isMockMode ? (
              <>
                <Database className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-amber-900 hidden md:inline font-bold">Demo</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-slate-900 font-bold hidden md:inline">Apify Live</span>
              </>
            )}
          </div>

          {/* Settings Button */}
          <button
            onClick={() => onOpenSettings()}
            className="w-9 h-9 rounded-xl bg-white hover:bg-amber-50 text-slate-900 border-2 border-slate-900 shadow-[2px_2px_0px_#0f172a] hover:shadow-[3px_3px_0px_#0f172a] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none flex items-center justify-center transition cursor-pointer"
            title="Pengaturan"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* User Profile Pill */}
          <div className="hidden lg:flex items-center space-x-2 pl-1">
            <div className="w-8 h-8 rounded-xl bg-slate-950 text-amber-300 border-2 border-slate-900 shadow-[2px_2px_0px_#0f172a] flex items-center justify-center text-xs font-black">
              Z
            </div>
            <div className="text-left text-xs leading-tight">
              <div className="font-black text-slate-900">Owner Dashboard</div>
              <div className="text-[10px] text-slate-500 font-mono font-medium">TikTok Analytics</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
