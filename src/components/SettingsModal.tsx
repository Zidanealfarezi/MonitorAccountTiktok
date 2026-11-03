import React, { useState } from 'react';
import {
  X,
  UserPlus,
  Trash2,
  Key,
  Shield,
  CreditCard,
  RotateCcw,
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  Sliders,
} from 'lucide-react';
import { Account, AppConfig } from '../types';
import { StorageService } from '../lib/storage';
import { formatCurrencyUsd, formatDateWIB, normalizeTikTokUsername } from '../lib/formatters';

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
    onAccountsUpdated();
  };

  // Reset Data Handler
  const handleResetData = () => {
    if (confirm('Kembalikan seluruh data ke state awal (4 akun terverifikasi + riwayat demo)?')) {
      StorageService.resetToSeed();
      onAccountsUpdated();
      alert('Data berhasil di-reset ke kondisi awal.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-slate-800 rounded-xl text-cyan-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Pengaturan Sistem Monitoring</h3>
              <p className="text-xs text-slate-400">Kelola akun, batas kuota Apify, dan kredensial API</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 px-6 bg-slate-950/40 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('accounts')}
            className={`py-3 px-3 border-b-2 transition ${
              activeTab === 'accounts'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Daftar Akun ({accounts.length})
          </button>
          <button
            onClick={() => setActiveTab('usage')}
            className={`py-3 px-3 border-b-2 transition ${
              activeTab === 'usage'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Buku Biaya & Kuota ({usage.billingCycle})
          </button>
          <button
            onClick={() => setActiveTab('api')}
            className={`py-3 px-3 border-b-2 transition ${
              activeTab === 'api'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
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
              <form onSubmit={handleAddAccount} className="bg-slate-950/60 border border-slate-800/80 p-4 rounded-xl space-y-3">
                <h4 className="font-semibold text-slate-200 flex items-center space-x-2">
                  <UserPlus className="w-4 h-4 text-cyan-400" />
                  <span>Tambah Akun TikTok Baru</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">
                      Username TikTok (tanpa @)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. intansuarkartika"
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">
                      Nama Tampilan (Opsional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Intan Suar Kartika"
                      value={newDisplayName}
                      onChange={(e) => setNewDisplayName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>

                {accountError && (
                  <p className="text-rose-400 text-[11px] font-medium">{accountError}</p>
                )}

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg transition"
                  >
                    Tambah ke Pantauan
                  </button>
                </div>
              </form>

              {/* Accounts List */}
              <div className="space-y-2">
                <h4 className="font-semibold text-slate-300">Akun yang Sedang Dipantau</h4>
                <div className="divide-y divide-slate-800 border border-slate-800 rounded-xl overflow-hidden bg-slate-950/40">
                  {accounts.map((acc) => (
                    <div key={acc.id} className="p-3.5 flex items-center justify-between hover:bg-slate-900/40 transition">
                      <div className="flex items-center space-x-3">
                        {acc.avatar_url ? (
                          <img src={acc.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 font-bold">
                            {acc.display_name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <div className="font-semibold text-slate-200">{acc.display_name}</div>
                          <div className="text-[11px] font-mono text-cyan-400">@{acc.username}</div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                          {acc.last_sync_at ? 'Tersinkron' : 'Belum Ada Data'}
                        </span>
                        <button
                          onClick={() => handleDeleteAccount(acc.id, acc.username)}
                          className="p-1.5 text-slate-500 hover:text-rose-400 rounded transition"
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
                <div className="bg-slate-950/60 border border-slate-800 p-3.5 rounded-xl">
                  <div className="text-slate-400 text-[11px] mb-1">Total Pemakaian Bulan Ini</div>
                  <div className="text-lg font-bold text-cyan-400 font-mono">
                    {formatCurrencyUsd(usage.totalChargedUsd)}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">Siklus: {usage.billingCycle}</div>
                </div>

                <div className="bg-slate-950/60 border border-slate-800 p-3.5 rounded-xl">
                  <div className="text-slate-400 text-[11px] mb-1">Batas Aplikasi (Cap)</div>
                  <div className="text-lg font-bold text-slate-200 font-mono">
                    {formatCurrencyUsd(config.monthlyBudgetCapUsd)}
                  </div>
                  <div className="text-[10px] text-amber-400 mt-1">Peringatan: {formatCurrencyUsd(config.warningThresholdUsd)}</div>
                </div>

                <div className="bg-slate-950/60 border border-slate-800 p-3.5 rounded-xl">
                  <div className="text-slate-400 text-[11px] mb-1">Kredit Apify Free Tier</div>
                  <div className="text-lg font-bold text-emerald-400 font-mono">$5.00 / bln</div>
                  <div className="text-[10px] text-slate-500 mt-1">Tarif scraper: $3/1.000 hasil</div>
                </div>
              </div>

              {/* Usage Ledger Records */}
              <div className="space-y-2">
                <h4 className="font-semibold text-slate-300">Catatan Pemakaian Apify (Usage Ledger)</h4>
                <div className="border border-slate-800 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider border-b border-slate-800">
                      <tr>
                        <th className="py-2.5 px-3">Waktu (WIB)</th>
                        <th className="py-2.5 px-3">Akun</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3 text-right">Biaya Aktual</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 font-mono">
                      {ledger.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="py-4 text-center text-slate-500">
                            Belum ada entri catatan penggunaan
                          </td>
                        </tr>
                      ) : (
                        ledger.map((item) => (
                          <tr key={item.id} className="hover:bg-slate-800/40">
                            <td className="py-2.5 px-3 text-slate-300">
                              {formatDateWIB(item.created_at)}
                            </td>
                            <td className="py-2.5 px-3 text-cyan-400">
                              @{item.account_username}
                            </td>
                            <td className="py-2.5 px-3">
                              <span
                                className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-bold ${
                                  item.status === 'finalized'
                                    ? 'bg-emerald-950 text-emerald-400'
                                    : item.status === 'reserved'
                                    ? 'bg-amber-950 text-amber-400'
                                    : 'bg-slate-800 text-slate-400'
                                }`}
                              >
                                {item.status}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-right font-bold text-slate-100">
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
              <div className="bg-slate-950/60 border border-slate-800/80 p-4 rounded-xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div>
                    <h4 className="font-semibold text-slate-200">Mode Simulasi (Demo Mode)</h4>
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
                    <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
                  </label>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">
                    Apify API Token (Personal API Token)
                  </label>
                  <input
                    type="password"
                    placeholder="apify_api_..."
                    value={config.apifyApiToken}
                    onChange={(e) => setConfig({ ...config, apifyApiToken: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-2 text-white placeholder-slate-500 font-mono"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    Dibutuhkan jika Simulasi dinonaktifkan untuk memanggil actor Apify langsung.
                  </p>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">
                    Supabase Project URL
                  </label>
                  <input
                    type="text"
                    placeholder="https://xyzcompany.supabase.co"
                    value={config.supabaseUrl}
                    onChange={(e) => setConfig({ ...config, supabaseUrl: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-2 text-white placeholder-slate-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">
                    Supabase Anon Key
                  </label>
                  <input
                    type="password"
                    placeholder="eyJhbGciOiJIUzI1NiIsIn..."
                    value={config.supabaseAnonKey}
                    onChange={(e) => setConfig({ ...config, supabaseAnonKey: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-2 text-white placeholder-slate-500 font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">
                      Batas Anggaran Bulanan (USD)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={config.monthlyBudgetCapUsd}
                      onChange={(e) =>
                        setConfig({ ...config, monthlyBudgetCapUsd: parseFloat(e.target.value) || 4.5 })
                      }
                      className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-2 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">
                      Maks Biaya per Run (USD)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={config.maxChargePerRunUsd}
                      onChange={(e) =>
                        setConfig({ ...config, maxChargePerRunUsd: parseFloat(e.target.value) || 0.05 })
                      }
                      className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-2 text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={handleResetData}
                  className="inline-flex items-center space-x-1.5 text-rose-400 hover:text-rose-300 font-semibold"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Data ke Bawaan</span>
                </button>

                <div className="flex items-center space-x-3">
                  {configSaved && (
                    <span className="text-emerald-400 font-semibold flex items-center space-x-1">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Tersimpan!</span>
                    </span>
                  )}
                  <button
                    type="submit"
                    className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg transition"
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
