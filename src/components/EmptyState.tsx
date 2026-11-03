import React from 'react';
import { RefreshCw, Sparkles, ShieldCheck } from 'lucide-react';
import { Account } from '../types';

interface EmptyStateProps {
  account: Account;
  onTriggerSync: () => void;
  isSyncing: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ account, onTriggerSync, isSyncing }) => {
  return (
    <div className="bg-white border border-slate-200/80 rounded-3xl p-8 sm:p-12 text-center max-w-2xl mx-auto my-6 space-y-6 shadow-xs">
      <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mx-auto shadow-sm shadow-blue-500/10">
        <Sparkles className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <h3 className="text-xl font-bold text-slate-900 tracking-tight">
          Belum Ada Data Monitoring untuk @{account.username}
        </h3>
        <p className="text-sm text-slate-500 leading-relaxed max-w-md mx-auto">
          Akun <strong className="text-slate-800">{account.display_name}</strong> belum memiliki riwayat pengamatan.
          Tekan tombol di bawah untuk menjalankan pengambilan data profil dan 10 postingan publik terbaru melalui Apify Scraper.
        </p>
      </div>

      <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 text-xs text-slate-600 max-w-md mx-auto text-left space-y-2">
        <div className="flex items-center space-x-2 text-blue-600 font-semibold">
          <ShieldCheck className="w-4 h-4" />
          <span>Informasi Pengambilan Pertama:</span>
        </div>
        <ul className="list-disc list-inside space-y-1 text-slate-500 pl-1">
          <li>Estimasi kredit Apify: ~US$0,03 (termasuk paket Free $5/bulan)</li>
          <li>Mengambil metrik followers, total suka profil, dan 10 postingan terbaru</li>
          <li>Setelah selesai, kurva grafik akan mulai mencatat titik awal pertumbuhan</li>
        </ul>
      </div>

      <button
        onClick={onTriggerSync}
        disabled={isSyncing}
        className="px-6 py-3 rounded-full font-bold text-sm bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center space-x-2.5 mx-auto transition shadow-md shadow-blue-500/20 active:scale-95 disabled:opacity-50"
      >
        <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
        <span>{isSyncing ? 'Mengambil Data TikTok...' : 'Ambil data pertama sekarang'}</span>
      </button>
    </div>
  );
};
