import React, { useState } from 'react';
import { RefreshCw, Clock, AlertTriangle, Layers } from 'lucide-react';
import { formatDateWIB, formatCurrencyUsd } from '../lib/formatters';
import { ESTIMATED_COST_PER_RUN_USD } from '../lib/apify';

interface SyncControlProps {
  currentUsername: string;
  lastSyncAt: string | null;
  isSyncing: boolean;
  syncProgressMessage?: string;
  isBudgetExceeded: boolean;
  onTriggerSync: () => void;
  onTriggerSyncAll: () => void;
}

export const SyncControl: React.FC<SyncControlProps> = ({
  currentUsername,
  lastSyncAt,
  isSyncing,
  syncProgressMessage,
  isBudgetExceeded,
  onTriggerSync,
  onTriggerSyncAll,
}) => {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSyncAllModal, setShowSyncAllModal] = useState(false);

  // Calculate hours since last sync
  const getHoursSinceLastSync = (): number | null => {
    if (!lastSyncAt) return null;
    try {
      const diffMs = Date.now() - new Date(lastSyncAt).getTime();
      return Math.floor(diffMs / (1000 * 60 * 60));
    } catch {
      return null;
    }
  };

  const hoursSinceLastSync = getHoursSinceLastSync();
  const isWithin24Hours = hoursSinceLastSync !== null && hoursSinceLastSync < 24;

  const handleSingleClick = () => {
    if (isBudgetExceeded || isSyncing) return;
    if (isWithin24Hours) {
      setShowConfirmModal(true);
    } else {
      onTriggerSync();
    }
  };

  const handleConfirmSingleSync = () => {
    setShowConfirmModal(false);
    onTriggerSync();
  };

  const handleConfirmSyncAll = () => {
    setShowSyncAllModal(false);
    onTriggerSyncAll();
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      {/* Sync Status info */}
      <div className="space-y-1">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Status Pengambilan Data
          </span>
          {lastSyncAt ? (
            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-950/80 text-emerald-400 border border-emerald-800/50">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Data Tersimpan Aktif (@{currentUsername})</span>
            </span>
          ) : (
            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-950/80 text-amber-400 border border-amber-800/50">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span>Belum Pernah Diambil</span>
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2 text-sm text-slate-200">
          <Clock className="w-4 h-4 text-cyan-400 flex-shrink-0" />
          <span>
            {lastSyncAt ? (
              <>
                Data @{currentUsername} diambil pada:{' '}
                <strong className="font-mono text-cyan-300 font-semibold">
                  {formatDateWIB(lastSyncAt)}
                </strong>
              </>
            ) : (
              <span className="text-slate-400">Belum ada pengamatan untuk @{currentUsername}</span>
            )}
          </span>
        </div>

        {isSyncing && syncProgressMessage && (
          <p className="text-xs text-cyan-400 animate-pulse flex items-center space-x-1.5 pt-1 font-mono">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            <span>{syncProgressMessage}</span>
          </p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full md:w-auto">
        {/* Sync Current Account */}
        <button
          onClick={handleSingleClick}
          disabled={isSyncing || isBudgetExceeded}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition-all shadow-md ${
            isBudgetExceeded
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              : isSyncing
              ? 'bg-cyan-950 text-cyan-400 border border-cyan-800 cursor-wait'
              : 'bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 shadow-cyan-500/20 active:scale-95'
          }`}
          title={`Ambil data terbaru khusus @${currentUsername}`}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>Ambil @{currentUsername}</span>
        </button>

        {/* Sync All Accounts */}
        <button
          onClick={() => setShowSyncAllModal(true)}
          disabled={isSyncing || isBudgetExceeded}
          className={`px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition border ${
            isSyncing || isBudgetExceeded
              ? 'bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700 hover:border-slate-600 active:scale-95'
          }`}
          title="Ambil data seluruh 6 akun secara berurutan"
        >
          <Layers className="w-3.5 h-3.5 text-cyan-400" />
          <span>Ambil Semua Akun</span>
        </button>
      </div>

      {/* 24-Hour Confirmation Modal for Single Account */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center space-x-3 text-amber-400">
              <div className="p-2.5 bg-amber-950/80 border border-amber-800/60 rounded-xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Konfirmasi Mode Hemat</h3>
                <p className="text-xs text-amber-300/80">Pengambilan @{currentUsername} dalam rentang &lt; 24 jam</p>
              </div>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed">
              Akun <strong className="text-cyan-300">@{currentUsername}</strong> baru diperbarui{' '}
              <strong className="text-white font-mono">{hoursSinceLastSync ?? 0} jam yang lalu</strong>.
              Target penggunaan normal Mode Hemat adalah <strong>1 kali per 24 jam</strong>.
            </p>

            <div className="bg-slate-950/70 border border-slate-800 p-3.5 rounded-xl text-xs space-y-2 text-slate-300">
              <div className="flex items-center justify-between">
                <span>Estimasi Biaya Apify Run:</span>
                <span className="font-mono font-semibold text-emerald-400">
                  {formatCurrencyUsd(ESTIMATED_COST_PER_RUN_USD)}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Cakupan data:</span>
                <span>Hingga 10 postingan terbaru</span>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition"
              >
                Gunakan Data Tersimpan
              </button>
              <button
                onClick={handleConfirmSingleSync}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition shadow-lg shadow-cyan-500/20"
              >
                Tetap Ambil Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sync All Accounts Confirmation Modal */}
      {showSyncAllModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center space-x-3 text-cyan-400">
              <div className="p-2.5 bg-cyan-950/80 border border-cyan-800/60 rounded-xl">
                <Layers className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Sinkronkan Semua Akun</h3>
                <p className="text-xs text-slate-400">Pengambilan data untuk seluruh 6 akun</p>
              </div>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed">
              Sistem akan menjalankan pengambilan data profil dan 10 postingan terbaru untuk <strong>seluruh 6 akun</strong> secara berurutan.
            </p>

            <div className="bg-slate-950/70 border border-slate-800 p-3.5 rounded-xl text-xs space-y-2 text-slate-300">
              <div className="flex items-center justify-between">
                <span>Estimasi Total Biaya Apify:</span>
                <span className="font-mono font-semibold text-emerald-400">
                  {formatCurrencyUsd(ESTIMATED_COST_PER_RUN_USD * 6)} (~6 akun × $0,03)
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Durasi:</span>
                <span>~30–60 detik</span>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={() => setShowSyncAllModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmSyncAll}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition shadow-lg shadow-cyan-500/20"
              >
                Mulai Ambil Semua
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
