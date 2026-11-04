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
    <div className="bg-white border-2 border-slate-900 rounded-3xl p-8 sm:p-12 text-center max-w-2xl mx-auto my-6 space-y-6 shadow-[5px_5px_0px_#0f172a]">
      <div className="w-16 h-16 rounded-2xl bg-[#FFC72C] border-2 border-slate-900 flex items-center justify-center text-slate-950 mx-auto shadow-[3px_3px_0px_#0f172a]">
        <Sparkles className="w-8 h-8 fill-slate-950" />
      </div>

      <div className="space-y-2">
        <h3 className="text-xl font-black text-slate-900 tracking-tight">
          Belum Ada Data Monitoring untuk @{account.username}
        </h3>
        <p className="text-sm text-slate-600 leading-relaxed max-w-md mx-auto font-medium">
          Akun <strong className="text-slate-900 font-black">{account.display_name}</strong> belum memiliki riwayat pengamatan.
          Tekan tombol di bawah untuk menjalankan pengambilan data profil dan 10 postingan publik terbaru melalui Apify Scraper.
        </p>
      </div>

      <div className="bg-amber-50/70 border-2 border-slate-900 rounded-2xl p-4 text-xs text-slate-800 max-w-md mx-auto text-left space-y-2 shadow-[2px_2px_0px_#0f172a]">
        <div className="flex items-center space-x-2 text-amber-900 font-black">
          <ShieldCheck className="w-4 h-4 text-amber-700" />
          <span>Informasi Pengambilan Pertama:</span>
        </div>
        <ul className="list-disc list-inside space-y-1 text-slate-700 font-medium pl-1">
          <li>Estimasi kredit Apify: ~US$0,03 (termasuk paket Free $5/bulan)</li>
          <li>Mengambil metrik followers, total suka profil, dan 10 postingan terbaru</li>
          <li>Setelah selesai, kurva grafik akan mulai mencatat titik awal pertumbuhan</li>
        </ul>
      </div>

      <button
        onClick={onTriggerSync}
        disabled={isSyncing}
        className="px-6 py-3 rounded-2xl font-black text-sm bg-[#FFC72C] hover:bg-[#FFB800] text-slate-950 border-2 border-slate-900 flex items-center justify-center space-x-2.5 mx-auto transition shadow-[3px_3px_0px_#0f172a] hover:shadow-[4px_4px_0px_#0f172a] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:opacity-50 cursor-pointer"
      >
        <RefreshCw className={`w-4 h-4 text-slate-950 ${isSyncing ? 'animate-spin' : ''}`} />
        <span>{isSyncing ? 'Mengambil Data TikTok...' : 'Ambil data pertama sekarang'}</span>
      </button>
    </div>
  );
};
