import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { AccountSelector } from './components/AccountSelector';
import { MetricsOverview } from './components/MetricsOverview';
import { PerformanceChartCard } from './components/PerformanceChartCard';
import { EngagementGaugeCard } from './components/EngagementGaugeCard';
import { PostsTable } from './components/PostsTable';
import { EmptyState } from './components/EmptyState';
import { SettingsModal } from './components/SettingsModal';
import { StorageService } from './lib/storage';
import { Account, AccountDashboardData } from './types';
import { AlertCircle, CheckCircle2, ChevronUp } from 'lucide-react';
import { ScrollReveal } from './components/ScrollReveal';

const AUTO_SYNC_COOLDOWN_MS = 2 * 60 * 60 * 1000; // 2 hours
const LAST_AUTO_SYNC_KEY = 'tiktok_monitor_last_auto_sync';

export const App: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [dashboardData, setDashboardData] = useState<AccountDashboardData | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncProgress, setSyncProgress] = useState<string>('');
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showBackToTop, setShowBackToTop] = useState<boolean>(false);
  const [scrollY, setScrollY] = useState<number>(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
      setShowBackToTop(window.scrollY > 280);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Smart Auto-Sync with 2-Hour Cooldown
  const checkAndTriggerSmartAutoSync = async (accList: Account[], targetId: string) => {
    const usage = StorageService.getMonthlyUsage();
    if (usage.isBudgetExceeded) return;

    const now = Date.now();
    const lastSyncStr = localStorage.getItem(LAST_AUTO_SYNC_KEY);

    let needsSync = false;

    if (!lastSyncStr) {
      // If no recorded auto-sync timestamp, check account last_sync_at dates
      const hasRecentSync = accList.some((a) => {
        if (!a.last_sync_at) return false;
        const diff = now - new Date(a.last_sync_at).getTime();
        return diff < AUTO_SYNC_COOLDOWN_MS;
      });
      needsSync = !hasRecentSync;
    } else {
      const elapsed = now - new Date(lastSyncStr).getTime();
      if (elapsed >= AUTO_SYNC_COOLDOWN_MS) {
        needsSync = true;
      }
    }

    if (needsSync) {
      localStorage.setItem(LAST_AUTO_SYNC_KEY, new Date().toISOString());
      setIsSyncing(true);
      setSyncProgress('Smart Auto-sync: Memperbarui data...');

      try {
        await StorageService.triggerSyncAll((accName, curr, total) => {
          setSyncProgress(`Auto-sync: ${accName} (${curr}/${total})...`);
        });

        const refreshed = StorageService.getAccounts();
        setAccounts(refreshed);
        loadDashboard(targetId);
        showToast('success', 'Smart Auto-sync: Data 6 akun telah diperbarui');
      } catch (err: unknown) {
        console.error('Smart Auto-sync error:', err);
      } finally {
        setIsSyncing(false);
        setSyncProgress('');
      }
    }
  };

  // Load initial accounts and check auto-sync
  const loadAccountsData = () => {
    const accs = StorageService.getAccounts();
    setAccounts(accs);

    if (accs.length > 0) {
      const currentExists = accs.some((a) => a.id === selectedAccountId);
      const targetId = currentExists ? selectedAccountId : accs[0].id;
      setSelectedAccountId(targetId);
      loadDashboard(targetId);

      // Trigger Smart Auto-Sync if data is older than 2 hours
      checkAndTriggerSmartAutoSync(accs, targetId);
    }
  };

  const loadDashboard = (accountId: string) => {
    try {
      const data = StorageService.getDashboardData(accountId);
      setDashboardData(data);
    } catch (err: unknown) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadAccountsData();
  }, []);

  const handleSelectAccount = (id: string) => {
    setSelectedAccountId(id);
    loadDashboard(id);
  };

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Trigger sync for currently selected account
  const handleTriggerSync = async () => {
    if (!selectedAccountId || isSyncing) return;

    setIsSyncing(true);
    setSyncProgress('Menghubungkan ke Apify...');

    try {
      const updated = await StorageService.triggerSync(selectedAccountId, (msg) => {
        setSyncProgress(msg);
      });
      setDashboardData(updated);
      setAccounts(StorageService.getAccounts());
      showToast('success', `Berhasil memperbarui data @${updated.account.username}`);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Gagal mengambil data';
      showToast('error', errorMsg);
    } finally {
      setIsSyncing(false);
      setSyncProgress('');
    }
  };

  // Trigger sync for all accounts sequentially
  const handleTriggerSyncAll = async () => {
    if (isSyncing) return;

    setIsSyncing(true);
    setSyncProgress('Memulai sinkronisasi seluruh akun...');

    try {
      await StorageService.triggerSyncAll((accName, curr, total) => {
        setSyncProgress(`Mengambil ${accName} (${curr}/${total})...`);
      });

      localStorage.setItem(LAST_AUTO_SYNC_KEY, new Date().toISOString());
      setAccounts(StorageService.getAccounts());
      loadDashboard(selectedAccountId);
      showToast('success', 'Berhasil memperbarui data seluruh akun!');
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Gagal sinkronisasi';
      showToast('error', errorMsg);
    } finally {
      setIsSyncing(false);
      setSyncProgress('');
    }
  };

  const usage = StorageService.getMonthlyUsage();

  return (
    <div className="min-h-screen bg-[#f4f6fb] text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white relative overflow-x-hidden">
      {/* Dynamic Background Parallax Lighting (Reacts to PC & Mobile Scroll) */}
      <div
        className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-3xl pointer-events-none transition-transform duration-500 ease-out -z-10"
        style={{ transform: `translate3d(0, ${scrollY * 0.12}px, 0)` }}
      />
      <div
        className="fixed top-1/3 right-10 w-[420px] h-[420px] bg-indigo-500/5 rounded-full blur-3xl pointer-events-none transition-transform duration-700 ease-out -z-10"
        style={{ transform: `translate3d(0, ${-scrollY * 0.08}px, 0)` }}
      />

      {/* Top Navbar */}
      <Header onOpenSettings={() => setIsSettingsOpen(true)} />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 flex-1 w-full">
        {/* Toast Notification */}
        {toastMessage && (
          <div
            className={`fixed bottom-6 right-6 z-50 flex items-center space-x-2.5 px-4 py-3 rounded-2xl shadow-xl border text-xs font-semibold transition-all duration-300 animate-in fade-in slide-in-from-bottom-2 ${
              toastMessage.type === 'success'
                ? 'bg-white text-emerald-700 border-emerald-200 shadow-emerald-500/10'
                : 'bg-white text-rose-700 border-rose-200 shadow-rose-500/10'
            }`}
          >
            {toastMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </div>
        )}

        {/* 1. Account Selector Header & Chips (Boltshift Title & Segment Controls) */}
        <ScrollReveal direction="down" duration={500} distance={16}>
          <AccountSelector
            accounts={accounts}
            selectedAccountId={selectedAccountId}
            onSelectAccount={handleSelectAccount}
            onAddNewAccount={() => setIsSettingsOpen(true)}
            isSyncing={isSyncing}
            syncProgressMessage={syncProgress}
            isBudgetExceeded={usage.isBudgetExceeded}
            onTriggerSync={handleTriggerSync}
            onTriggerSyncAll={handleTriggerSyncAll}
          />
        </ScrollReveal>

        {/* 2. Content: Empty State or Active Dashboard */}
        {dashboardData && !dashboardData.latestSnapshot && dashboardData.posts.length === 0 ? (
          <EmptyState
            account={dashboardData.account}
            onTriggerSync={handleTriggerSync}
            isSyncing={isSyncing}
          />
        ) : dashboardData ? (
          <div key={selectedAccountId} className="space-y-6">
            {/* 4-KPI Boltshift Metrics Row */}
            <ScrollReveal direction="up" duration={600} distance={20}>
              <MetricsOverview
                latestSnapshot={dashboardData.latestSnapshot}
                previousSnapshot={dashboardData.previousSnapshot}
                followersDiff={dashboardData.followersDiff}
                posts={dashboardData.posts}
              />
            </ScrollReveal>

            {/* Middle Section: Performance Chart (2 Cols) + Radial Engagement Meter (1 Col) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <ScrollReveal direction="up" duration={650} delay={80} distance={24} className="lg:col-span-2">
                <PerformanceChartCard
                  snapshotsHistory={dashboardData.snapshotsHistory}
                  posts={dashboardData.posts}
                />
              </ScrollReveal>
              <ScrollReveal direction="up" duration={650} delay={160} distance={24} className="lg:col-span-1">
                <EngagementGaugeCard posts={dashboardData.posts} />
              </ScrollReveal>
            </div>

            {/* Monitored Posts Data Table (Matching Boltshift 'Recent orders' style) */}
            <ScrollReveal direction="up" duration={700} distance={28}>
              <PostsTable posts={dashboardData.posts} />
            </ScrollReveal>
          </div>
        ) : null}
      </main>

      {/* Floating Back to Top Button */}
      {showBackToTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 left-6 z-40 p-3 rounded-full bg-slate-900/90 hover:bg-blue-600 text-white shadow-xl backdrop-blur-xs transition-all duration-300 hover:scale-110 active:scale-95 animate-scale-in cursor-pointer"
          title="Kembali ke atas"
        >
          <ChevronUp className="w-4 h-4" />
        </button>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-200/80 bg-white py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="font-medium text-slate-600">TikTok Monitor • Mode Hemat</span>
          <span className="font-mono text-slate-400">Penyedia: Apify Scraper • Zona: WIB</span>
        </div>
      </footer>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        accounts={accounts}
        onAccountsUpdated={loadAccountsData}
      />
    </div>
  );
};
