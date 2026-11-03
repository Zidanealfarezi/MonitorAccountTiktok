import React from 'react';
import { EyeOff, RefreshCw, Sparkles, ShieldCheck } from 'lucide-react';
import { Account } from '../types';

interface EmptyStateProps {
  account: Account;
  onTriggerSync: () => void;
  isSyncing: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ account, onTriggerSync, isSyncing }) => {
  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 sm:p-12 text-center max-w-2xl mx-auto my-6 space-y-6">
      <div className="w-16 h-16 rounded-2xl bg-cyan-950/80 border border-cyan-800/60 flex items-center justify-center text-cyan-400 mx-auto shadow-xl shadow-cyan-500/10">
        <Sparkles className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <h3 className="text-xl font-bold text-white tracking-tight">
          Belum Ada Data Monitoring untuk @{account.username}
        </h3>
        <p className="text-sm text-slate-400 leading-relaxed max-w-md mx-auto">
          Akun <strong className="text-slate-200">{account.display_name}</strong> belum memiliki riwayat pengamatan.
          Tekan tombol di bawah untuk menjalankan pengambilan data profil dan 10 postingan publik terbaru melalui Apify Scraper.
        </p>
      </div>

      <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 text-xs text-slate-400 max-w-md mx-auto text-left space-y-1.5">
        <div className="flex items-center space-x-2 text-cyan-400 font-semibold">
          <ShieldCheck className="w-4 h-4" />
          <span>Informasi Pengambilan Pertama:</span>
        </div>
        <ul className="list-disc list-inside space-y-1 text-slate-400 pl-1">
          <li>Estimasi kredit Apify: ~US$0,03 (termasuk paket Free $5/bulan)</li>
          <li>Mengambil metrik followers, total suka profil, dan 10 postingan terbaru</li>
          <li>Setelah selesai, kurva grafik akan mulai mencatat titik awal pertumbuhan</li>
        </ul>
      </div>

      <button
        onClick={onTriggerSync}
        disabled={isSyncing}
        className="px-6 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 flex items-center justify-center space-x-2.5 mx-auto transition shadow-lg shadow-cyan-500/20 active:scale-95 disabled:opacity-50"
      >
        <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
        <span>{isSyncing ? 'Mengambil Data TikTok...' : 'Ambil data pertama sekarang'}</span>
      </button>
    </div>
  );
};
