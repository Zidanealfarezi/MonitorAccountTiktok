import React, { useState } from 'react';
import { RefreshCw, AlertCircle, Clock, Zap, Check, AlertTriangle } from 'lucide-react';
import { formatDateWIB, formatCurrencyUsd } from '../lib/formatters';
import { ESTIMATED_COST_PER_RUN_USD } from '../lib/apify';

interface SyncControlProps {
  lastSyncAt: string | null;
  isSyncing: boolean;
  syncProgressMessage?: string;
  isBudgetExceeded: boolean;
  onTriggerSync: () => void;
}

export const SyncControl: React.FC<SyncControlProps> = ({
  lastSyncAt,
  isSyncing,
  syncProgressMessage,
  isBudgetExceeded,
  onTriggerSync,
}) => {
  const [showConfirmModal, setShowConfirmModal] = useState(false);

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

  const handleButtonClick = () => {
    if (isBudgetExceeded || isSyncing) return;

    if (isWithin24Hours) {
      setShowConfirmModal(true);
    } else {
      onTriggerSync();
    }
  };

  const handleConfirmSync = () => {
    setShowConfirmModal(false);
    onTriggerSync();
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      {/* Sync Status info */}
      <div className="space-y-1">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Status Pengambilan Data
          </span>
          {lastSyncAt ? (
            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-950/80 text-emerald-400 border border-emerald-800/50">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Data Tersimpan Aktif</span>
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
                Data diambil pada:{' '}
                <strong className="font-mono text-cyan-300 font-semibold">
                  {formatDateWIB(lastSyncAt)}
                </strong>
              </>
            ) : (
              <span className="text-slate-400">Belum ada pengamatan untuk akun ini</span>
            )}
          </span>
        </div>

        {isSyncing && syncProgressMessage && (
          <p className="text-xs text-cyan-400 animate-pulse flex items-center space-x-1.5 pt-1">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            <span>{syncProgressMessage}</span>
          </p>
        )}
      </div>

      {/* Sync Trigger Button */}
      <div className="flex items-center space-x-3 w-full sm:w-auto">
        <button
          onClick={handleButtonClick}
          disabled={isSyncing || isBudgetExceeded}
          className={`w-full sm:w-auto px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center space-x-2.5 transition-all shadow-md ${
            isBudgetExceeded
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              : isSyncing
              ? 'bg-cyan-950 text-cyan-400 border border-cyan-800 cursor-wait'
              : 'bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 font-bold shadow-cyan-500/20 hover:shadow-cyan-500/30 active:scale-95'
          }`}
        >
          <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>{isSyncing ? 'Mengambil Data...' : 'Ambil data terbaru'}</span>
        </button>
      </div>

      {/* 24-Hour Confirmation Modal (Hemat Mode Protection) */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center space-x-3 text-amber-400">
              <div className="p-2.5 bg-amber-950/80 border border-amber-800/60 rounded-xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Konfirmasi Mode Hemat</h3>
                <p className="text-xs text-amber-300/80">Pengambilan dalam waktu kurang dari 24 jam</p>
              </div>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed">
              Akun ini baru diperbarui{' '}
              <strong className="text-white font-mono">{hoursSinceLastSync} jam yang lalu</strong>.
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
                onClick={handleConfirmSync}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition shadow-lg shadow-cyan-500/20"
              >
                Tetap Ambil Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
