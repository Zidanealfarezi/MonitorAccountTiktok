import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { AccountSelector } from './components/AccountSelector';
import { SyncControl } from './components/SyncControl';
import { ProfileSummary } from './components/ProfileSummary';
import { PostsSummary } from './components/PostsSummary';
import { FollowersGrowthChart } from './components/FollowersGrowthChart';
import { PostMetricHistoryChart } from './components/PostMetricHistoryChart';
import { PostsTable } from './components/PostsTable';
import { EmptyState } from './components/EmptyState';
import { SettingsModal } from './components/SettingsModal';
import { StorageService } from './lib/storage';
import { Account, AccountDashboardData } from './types';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

export const App: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [dashboardData, setDashboardData] = useState<AccountDashboardData | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncProgress, setSyncProgress] = useState<string>('');
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Load initial accounts
  const loadAccountsData = () => {
    const accs = StorageService.getAccounts();
    setAccounts(accs);

    if (accs.length > 0) {
      // Keep current selection if valid, or select first account
      const currentExists = accs.some((a) => a.id === selectedAccountId);
      const targetId = currentExists ? selectedAccountId : accs[0].id;
      setSelectedAccountId(targetId);
      loadDashboard(targetId);
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
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Trigger sync for currently selected account
  const handleTriggerSync = async () => {
    if (!selectedAccountId || isSyncing) return;

    setIsSyncing(true);
    setSyncProgress('Memulai sinkronisasi...');

    try {
      const updated = await StorageService.triggerSync(selectedAccountId, (msg) => {
        setSyncProgress(msg);
      });
      setDashboardData(updated);

      // Refresh accounts list to update badges
      setAccounts(StorageService.getAccounts());
      showToast('success', `Berhasil memperbarui data untuk @${updated.account.username}`);
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

      // Reload accounts and current dashboard
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-slate-950">
      {/* Top Navbar */}
      <Header
        onOpenSettings={() => setIsSettingsOpen(true)}
        onRefresh={() => loadDashboard(selectedAccountId)}
        isSyncing={isSyncing}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 flex-1 w-full">
        {/* Toast Notification */}
        {toastMessage && (
          <div
            className={`fixed bottom-6 right-6 z-50 flex items-center space-x-2.5 px-4 py-3 rounded-xl shadow-2xl border text-sm transition-all duration-300 ${
              toastMessage.type === 'success'
                ? 'bg-emerald-950/90 text-emerald-300 border-emerald-800'
                : 'bg-rose-950/90 text-rose-300 border-rose-800'
            }`}
          >
            {toastMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </div>
        )}

        {/* 1. Account Selector Bar */}
        <AccountSelector
          accounts={accounts}
          selectedAccountId={selectedAccountId}
          onSelectAccount={handleSelectAccount}
          onAddNewAccount={() => setIsSettingsOpen(true)}
        />

        {/* 2. Sync Control Banner */}
        {dashboardData && (
          <SyncControl
            currentUsername={dashboardData.account.username}
            lastSyncAt={dashboardData.lastSyncAt}
            isSyncing={isSyncing}
            syncProgressMessage={syncProgress}
            isBudgetExceeded={usage.isBudgetExceeded}
            onTriggerSync={handleTriggerSync}
            onTriggerSyncAll={handleTriggerSyncAll}
          />
        )}

        {/* 3. Conditional: Empty State or Active Dashboard */}
        {dashboardData && !dashboardData.latestSnapshot && dashboardData.posts.length === 0 ? (
          <EmptyState
            account={dashboardData.account}
            onTriggerSync={handleTriggerSync}
            isSyncing={isSyncing}
          />
        ) : dashboardData ? (
          <div className="space-y-6">
            {/* Profile Statistics Summary */}
            <ProfileSummary
              latestSnapshot={dashboardData.latestSnapshot}
              previousSnapshot={dashboardData.previousSnapshot}
              followersDiff={dashboardData.followersDiff}
            />

            {/* Monitored Posts Aggregate Summary */}
            <PostsSummary posts={dashboardData.posts} />

            {/* Analytical Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <FollowersGrowthChart snapshotsHistory={dashboardData.snapshotsHistory} />
              <PostMetricHistoryChart posts={dashboardData.posts} />
            </div>

            {/* Monitored Posts Data Table */}
            <PostsTable posts={dashboardData.posts} />
          </div>
        ) : null}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>TikTok Account Monitor • Berdasarkan Dokumen Perencanaan 3 November 2026</span>
          <span className="font-mono text-slate-400">Penyedia: Apify clockworks/tiktok-profile-scraper • Zona: WIB</span>
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
