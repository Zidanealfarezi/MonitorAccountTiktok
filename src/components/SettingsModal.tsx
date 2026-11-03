import React, { useState } from 'react';
import {
  X,
  UserPlus,
  Trash2,
  Sliders,
  RotateCcw,
  CheckCircle,
} from 'lucide-react';
import { Account, AppConfig } from '../types';
import { StorageService } from '../lib/storage';
import { formatCurrencyUsd, formatDateWIB } from '../lib/formatters';
import { getSupabaseClient } from '../lib/supabase';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: Account[];
  onAccountsUpdated: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  accounts,
  onAccountsUpdated,
}) => {
  const [activeTab, setActiveTab] = useState<'accounts' | 'usage' | 'api'>('accounts');

  // New Account Form State
  const [newUsername, setNewUsername] = useState('');
  const [newDisplayName, setNewDisplayName] = useState('');
  const [accountError, setAccountError] = useState('');

  // Config State
  const [config, setConfig] = useState<AppConfig>(StorageService.getConfig());
  const [configSaved, setConfigSaved] = useState(false);
  const [testSupabaseState, setTestSupabaseState] = useState<{ status: 'idle' | 'loading' | 'success' | 'error'; message: string }>({
    status: 'idle',
    message: '',
  });
  const [pushSupabaseState, setPushSupabaseState] = useState<{ status: 'idle' | 'loading' | 'success' | 'error'; message: string }>({
    status: 'idle',
    message: '',
  });

  if (!isOpen) return null;

  const usage = StorageService.getMonthlyUsage();
  const ledger = StorageService.getUsageLedger();

  // Add Account Handler
  const handleAddAccount = (e: React.FormEvent) => {
    e.preventDefault();
    setAccountError('');

    if (!newUsername.trim()) {
      setAccountError('Username TikTok wajib diisi');
      return;
    }

    try {
      StorageService.addAccount(newUsername, newDisplayName);
      setNewUsername('');
      setNewDisplayName('');
      onAccountsUpdated();
    } catch (err: unknown) {
      setAccountError(err instanceof Error ? err.message : 'Gagal menambahkan akun');
    }
  };

  // Delete Account Handler
  const handleDeleteAccount = (id: string, name: string) => {
    if (confirm(`Hapus akun @${name} dari daftar pantauan? Seluruh riwayat pengamatan lokal akan ikut terhapus.`)) {
      StorageService.deleteAccount(id);
      onAccountsUpdated();
    }
  };

  // Save Config Handler
  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    StorageService.saveConfig(config);
    setConfigSaved(true);
    setTimeout(() => setConfigSaved(false), 2500);
  };

  // Test Supabase Connection
  const handleTestSupabase = async () => {
    setTestSupabaseState({ status: 'loading', message: 'Mencoba koneksi ke Supabase...' });
    try {
      const client = getSupabaseClient();
      if (!client) {
        throw new Error('Supabase URL atau Anon Key belum diisi');
      }

      const { error } = await client.from('accounts').select('id').limit(1);
      if (error) throw error;

      setTestSupabaseState({
        status: 'success',
        message: 'Koneksi ke Supabase berhasil terhubung!',
      });
    } catch (err: unknown) {
      setTestSupabaseState({
        status: 'error',
        message: err instanceof Error ? err.message : 'Gagal menghubungi Supabase',
      });
    }
  };

  // Push local data to Supabase
  const handlePushToSupabase = async () => {
    setPushSupabaseState({ status: 'loading', message: 'Mengunggah seluruh data lokal ke Supabase...' });
    try {
      await StorageService.pushLocalDataToSupabase();
      setPushSupabaseState({
        status: 'success',
        message: 'Seluruh akun, snapshots, dan postingan berhasil disinkronkan ke Supabase!',
      });
    } catch (err: unknown) {
      setPushSupabaseState({
        status: 'error',
        message: err instanceof Error ? err.message : 'Gagal upload ke Supabase',
      });
    }
  };

  // Reset to seed data
  const handleResetData = () => {
    if (confirm('PERINGATAN: Apakah Anda yakin ingin mereset seluruh data lokal kembali ke bawaan awal?')) {
      StorageService.resetToSeed();
      onAccountsUpdated();
      alert('Data berhasil di-reset ke kondisi awal.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Pengaturan Sistem Monitoring</h3>
              <p className="text-xs text-slate-400">Kelola akun, batas kuota Apify, dan kredensial API</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-100 px-6 bg-slate-50/60 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('accounts')}
            className={`py-3 px-3 border-b-2 transition ${
              activeTab === 'accounts'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Daftar Akun ({accounts.length})
          </button>
          <button
            onClick={() => setActiveTab('usage')}
            className={`py-3 px-3 border-b-2 transition ${
              activeTab === 'usage'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Buku Biaya & Kuota ({usage.billingCycle})
          </button>
          <button
            onClick={() => setActiveTab('api')}
            className={`py-3 px-3 border-b-2 transition ${
              activeTab === 'api'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            API & Database
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* TAB 1: ACCOUNTS */}
          {activeTab === 'accounts' && (
            <div className="space-y-6">
              {/* Add Account Form */}
              <form onSubmit={handleAddAccount} className="bg-slate-50/70 border border-slate-200/80 p-4 rounded-2xl space-y-3">
                <h4 className="font-semibold text-slate-800 flex items-center space-x-2">
                  <UserPlus className="w-4 h-4 text-blue-600" />
                  <span>Tambah Akun TikTok Baru</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">
                      Username TikTok (tanpa @)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. intansuarkartika"
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">
                      Nama Tampilan (Opsional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Intan Suar Kartika"
                      value={newDisplayName}
                      onChange={(e) => setNewDisplayName(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>

                {accountError && (
                  <p className="text-rose-500 text-[11px] font-medium">{accountError}</p>
                )}

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full transition shadow-xs"
                  >
                    Tambah ke Pantauan
                  </button>
                </div>
              </form>

              {/* Accounts List */}
              <div className="space-y-2">
                <h4 className="font-semibold text-slate-800">Akun yang Sedang Dipantau</h4>
                <div className="divide-y divide-slate-100 border border-slate-200/80 rounded-2xl overflow-hidden bg-white">
                  {accounts.map((acc) => (
                    <div key={acc.id} className="p-3.5 flex items-center justify-between hover:bg-slate-50/70 transition">
                      <div className="flex items-center space-x-3">
                        {acc.avatar_url ? (
                          <img src={acc.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold">
                            {acc.display_name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <div className="font-semibold text-slate-900">{acc.display_name}</div>
                          <div className="text-[11px] font-mono text-blue-600">@{acc.username}</div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono font-medium">
                          {acc.last_sync_at ? 'Tersinkron' : 'Belum Ada Data'}
                        </span>
                        <button
                          onClick={() => handleDeleteAccount(acc.id, acc.username)}
                          className="p-1.5 text-slate-400 hover:text-rose-500 rounded-full transition"
                          title="Hapus akun"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: USAGE & LEDGER */}
          {activeTab === 'usage' && (
            <div className="space-y-5">
              {/* Cost Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-slate-50/70 border border-slate-200/80 p-3.5 rounded-2xl">
                  <div className="text-slate-500 text-[11px] mb-1">Total Pemakaian Bulan Ini</div>
                  <div className="text-lg font-bold text-blue-600 font-mono">
                    {formatCurrencyUsd(usage.totalChargedUsd)}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">Siklus: {usage.billingCycle}</div>
                </div>

                <div className="bg-slate-50/70 border border-slate-200/80 p-3.5 rounded-2xl">
                  <div className="text-slate-500 text-[11px] mb-1">Batas Aplikasi (Cap)</div>
                  <div className="text-lg font-bold text-slate-900 font-mono">
                    {formatCurrencyUsd(config.monthlyBudgetCapUsd)}
                  </div>
                  <div className="text-[10px] text-amber-600 mt-1">Peringatan: {formatCurrencyUsd(config.warningThresholdUsd)}</div>
                </div>

                <div className="bg-slate-50/70 border border-slate-200/80 p-3.5 rounded-2xl">
                  <div className="text-slate-500 text-[11px] mb-1">Kredit Apify Free Tier</div>
                  <div className="text-lg font-bold text-emerald-600 font-mono">$5.00 / bln</div>
                  <div className="text-[10px] text-slate-400 mt-1">Tarif scraper: $3/1.000 hasil</div>
                </div>
              </div>

              {/* Usage Ledger Records */}
              <div className="space-y-2">
                <h4 className="font-semibold text-slate-800">Catatan Pemakaian Apify (Usage Ledger)</h4>
                <div className="border border-slate-200/80 rounded-2xl overflow-hidden bg-white">
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider border-b border-slate-100">
                      <tr>
                        <th className="py-2.5 px-3">Waktu (WIB)</th>
                        <th className="py-2.5 px-3">Akun</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3 text-right">Biaya Aktual</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono">
                      {ledger.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="py-4 text-center text-slate-400">
                            Belum ada entri catatan penggunaan
                          </td>
                        </tr>
                      ) : (
                        ledger.map((item) => (
                          <tr key={item.id} className="hover:bg-slate-50/60">
                            <td className="py-2.5 px-3 text-slate-700">
                              {formatDateWIB(item.created_at)}
                            </td>
                            <td className="py-2.5 px-3 text-blue-600 font-semibold">
                              @{item.account_username}
                            </td>
                            <td className="py-2.5 px-3">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold ${
                                  item.status === 'finalized'
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : item.status === 'reserved'
                                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                    : 'bg-slate-100 text-slate-600'
                                }`}
                              >
                                {item.status}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                              {formatCurrencyUsd(item.final_charged_usd)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: API & DATABASE CONFIG */}
          {activeTab === 'api' && (
            <form onSubmit={handleSaveConfig} className="space-y-4">
              <div className="bg-slate-50/70 border border-slate-200/80 p-4 rounded-2xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200/80">
                  <div>
                    <h4 className="font-semibold text-slate-900">Mode Simulasi (Demo Mode)</h4>
                    <p className="text-[11px] text-slate-400">
                      Aktifkan untuk mencoba dashboard tanpa memotong kredit Apify nyata
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.isMockMode}
                      onChange={(e) => setConfig({ ...config, isMockMode: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-600 font-medium mb-1">
                    Apify API Token (Personal API Token)
                  </label>
                  <input
                    type="password"
                    placeholder="apify_api_..."
                    value={config.apifyApiToken}
                    onChange={(e) => setConfig({ ...config, apifyApiToken: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 placeholder-slate-400 font-mono focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Dibutuhkan jika Simulasi dinonaktifkan untuk memanggil actor Apify langsung.
                  </p>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-600 font-medium mb-1">
                    Supabase Project URL
                  </label>
                  <input
                    type="text"
                    placeholder="https://xyzcompany.supabase.co"
                    value={config.supabaseUrl}
                    onChange={(e) => setConfig({ ...config, supabaseUrl: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 placeholder-slate-400 font-mono focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-600 font-medium mb-1">
                    Supabase Anon Key
                  </label>
                  <input
                    type="password"
                    placeholder="eyJhbGciOiJIUzI1NiIsIn..."
                    value={config.supabaseAnonKey}
                    onChange={(e) => setConfig({ ...config, supabaseAnonKey: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 placeholder-slate-400 font-mono focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
                  />

                  {/* Supabase Actions */}
                  <div className="flex flex-wrap items-center gap-2 mt-2.5">
                    <button
                      type="button"
                      onClick={handleTestSupabase}
                      disabled={testSupabaseState.status === 'loading'}
                      className="px-3 py-1.5 rounded-full bg-white hover:bg-slate-100 text-slate-700 text-[11px] font-semibold border border-slate-200 transition shadow-2xs"
                    >
                      {testSupabaseState.status === 'loading' ? 'Menguji...' : 'Tes Koneksi Supabase'}
                    </button>
                    <button
                      type="button"
                      onClick={handlePushToSupabase}
                      disabled={pushSupabaseState.status === 'loading'}
                      className="px-3 py-1.5 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] font-semibold border border-blue-200 transition"
                    >
                      {pushSupabaseState.status === 'loading' ? 'Mengunggah...' : 'Upload Data Lokal ke Supabase'}
                    </button>
                  </div>

                  {testSupabaseState.message && (
                    <p
                      className={`text-[11px] mt-1.5 font-medium ${
                        testSupabaseState.status === 'success' ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {testSupabaseState.message}
                    </p>
                  )}
                  {pushSupabaseState.message && (
                    <p
                      className={`text-[11px] mt-1 font-medium ${
                        pushSupabaseState.status === 'success' ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {pushSupabaseState.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-600 font-medium mb-1">
                      Batas Anggaran Bulanan (USD)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={config.monthlyBudgetCapUsd}
                      onChange={(e) =>
                        setConfig({ ...config, monthlyBudgetCapUsd: parseFloat(e.target.value) || 4.5 })
                      }
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600 font-medium mb-1">
                      Maks Biaya per Run (USD)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={config.maxChargePerRunUsd}
                      onChange={(e) =>
                        setConfig({ ...config, maxChargePerRunUsd: parseFloat(e.target.value) || 0.05 })
                      }
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={handleResetData}
                  className="inline-flex items-center space-x-1.5 text-rose-500 hover:text-rose-600 text-xs font-semibold"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Data ke Bawaan</span>
                </button>

                <div className="flex items-center space-x-3">
                  {configSaved && (
                    <span className="text-emerald-600 font-semibold flex items-center space-x-1 text-xs">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Tersimpan!</span>
                    </span>
                  )}
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full shadow-md shadow-blue-500/20 transition active:scale-95"
                  >
                    Simpan Perubahan
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
