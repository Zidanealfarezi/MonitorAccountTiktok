import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Clock, ChevronDown, ChevronUp, X, Radio } from 'lucide-react';

export interface CuteSyncAlertProps {
  isOpen: boolean;
  isSyncing: boolean;
  type: 'all' | 'single' | 'auto';
  currentAccountName?: string;
  currentUsername?: string;
  currentIndex?: number;
  totalAccounts?: number;
  stepMessage?: string;
  onDismiss?: () => void;
}

// Helper to clean up technical messages into friendly text
const formatFriendlyStep = (msg: string) => {
  if (!msg) return 'Memproses data profil TikTok...';
  if (msg.includes('clockworks/tiktok-profile-scraper')) {
    return 'Menghubungkan ke server scraper TikTok...';
  }
  return msg;
};

// Cute rotating quotes while waiting
const CUTE_WAITING_QUOTES = [
  "Detektif lagi bertugas! Sabar ya kak, jangan ditutup dulu ya~ 🕵️‍♂️✨",
  "Lagi ngintip followers & 10 video terbaru nih... ☕",
  "Ssst... Sedang interogasi server TikTok buat data ter-fresh! 🍿",
  "Bentar ya bos, robot kami lagi kerja keras banting tulang 🤖💪",
  "Tinggal dikit lagi! Sambil nunggu boleh seruput kopi dulu 🍵",
  "Semua metrik dan kurva grafik lagi diracik biar super akurat 📊",
  "Lagi terbang ke awan ngumpulin data FYP... wushh! 🚀✨",
];

export const CuteSyncAlert: React.FC<CuteSyncAlertProps> = ({
  isOpen,
  isSyncing,
  type,
  currentAccountName = '',
  currentUsername = '',
  currentIndex = 1,
  totalAccounts = 1,
  stepMessage = 'Menghubungkan ke penyedia data...',
  onDismiss,
}) => {
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [showFinished, setShowFinished] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  const prevSyncingRef = useRef(isSyncing);
  const dismissTimerRef = useRef<any>(null);

  // Close handler: cancels timers, sets dismissed flag, and notifies parent
  const handleClose = () => {
    if (dismissTimerRef.current) {
      clearTimeout(dismissTimerRef.current);
      dismissTimerRef.current = null;
    }
    setShowFinished(false);
    setIsDismissed(true);
    onDismiss?.();
  };

  // Sync state transitions
  useEffect(() => {
    if (isSyncing) {
      // When a new sync starts: reset dismiss state
      setIsDismissed(false);
      setShowFinished(false);
      if (dismissTimerRef.current) {
        clearTimeout(dismissTimerRef.current);
        dismissTimerRef.current = null;
      }
    } else if (prevSyncingRef.current && !isSyncing) {
      // Sync just finished successfully: trigger cute celebration
      setShowFinished(true);
      dismissTimerRef.current = setTimeout(() => {
        handleClose();
      }, 4000);
    }
    prevSyncingRef.current = isSyncing;

    return () => {
      if (dismissTimerRef.current) {
        clearTimeout(dismissTimerRef.current);
      }
    };
  }, [isSyncing]);

  // Rotate cute quotes every 3.5 seconds
  useEffect(() => {
    if (!isSyncing) return;
    const interval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % CUTE_WAITING_QUOTES.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [isSyncing]);

  // Elapsed time counter
  useEffect(() => {
    let timer: any = null;
    if (isSyncing) {
      setElapsedSeconds(0);
      timer = setInterval(() => {
        setElapsedSeconds((s) => s + 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isSyncing]);

  // If dismissed or inactive, render nothing
  if (isDismissed) return null;
  if (!isOpen && !showFinished) return null;

  // Calculate percentage
  const total = Math.max(totalAccounts, 1);
  const current = Math.min(Math.max(currentIndex, 1), total);
  const progressPercent = isSyncing
    ? Math.round(((current - 0.3) / total) * 100)
    : 100;

  // Format elapsed time (e.g., "14d" or "1m 12d")
  const formatElapsed = (sec: number) => {
    if (sec < 60) return `${sec}d`;
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${s}d`;
  };

  // Minimized Floating Bubble
  if (isMinimized && isSyncing) {
    return (
      <button
        type="button"
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-50 flex items-center space-x-2.5 px-4 py-2.5 rounded-full bg-white/95 backdrop-blur-md border border-indigo-200/90 shadow-xl shadow-indigo-500/20 text-slate-800 hover:scale-105 active:scale-95 transition-all duration-300 animate-mascot-bounce cursor-pointer group"
      >
        <span className="text-xl">🕵️‍♂️</span>
        <div className="flex flex-col text-left">
          <span className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
            Lagi Ambil Data ({current}/{total})
          </span>
          <span className="text-[9px] text-indigo-600 font-mono font-semibold">
            {progressPercent}% • {formatElapsed(elapsedSeconds)}
          </span>
        </div>
        <ChevronUp className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 ml-1 transition-colors" />
      </button>
    );
  }

  return (
    <div
      id="cute-sync-alert"
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 z-50 max-w-sm sm:max-w-md w-[calc(100%-2rem)] sm:w-[420px] transition-all duration-300 animate-scale-in"
    >
      <div className="relative overflow-hidden rounded-3xl bg-white/95 backdrop-blur-xl border border-indigo-100/90 shadow-2xl shadow-indigo-500/20 p-4 sm:p-5 ring-4 ring-indigo-500/10">
        
        {/* Playful Ambient Background Blurs */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-gradient-to-br from-indigo-400/20 to-blue-400/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-28 h-28 bg-gradient-to-tr from-cyan-400/20 to-pink-400/20 rounded-full blur-2xl pointer-events-none" />

        {/* Top Bar: Title & Controls */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 relative z-10">
          <div className="flex items-center space-x-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${showFinished ? 'bg-emerald-400' : 'bg-blue-400'}`} />
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${showFinished ? 'bg-emerald-500' : 'bg-blue-600'}`} />
            </span>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700">
              {showFinished
                ? 'Sinkronisasi Selesai'
                : type === 'auto'
                ? 'Auto-Sync Sedang Berjalan'
                : type === 'single'
                ? 'Mengambil Data Akun'
                : 'Mengambil Seluruh Akun'}
            </span>
          </div>

          <div className="flex items-center space-x-1.5">
            {/* Elapsed Timer Pill */}
            <div className="flex items-center space-x-1 px-2 py-0.5 rounded-full bg-slate-100 text-[10px] font-mono font-semibold text-slate-600">
              <Clock className="w-3 h-3 text-slate-400" />
              <span>{formatElapsed(elapsedSeconds)}</span>
            </div>

            {/* Minimize Button */}
            {!showFinished && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMinimized(true);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Kecilkan alert"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            )}

            {/* Dismiss 'X' Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleClose();
              }}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer relative z-30"
              title="Tutup alert"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        {showFinished ? (
          /* Celebratory Completion Screen */
          <div className="py-4 text-center space-y-3 relative z-10 animate-scale-in">
            <div className="relative inline-block">
              {/* Cute Celebration Mascot */}
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-emerald-400 to-teal-500 flex items-center justify-center text-3xl shadow-lg shadow-emerald-500/25 animate-mascot-bounce">
                🎉
              </div>
              <Sparkles className="w-5 h-5 text-amber-400 absolute -top-1 -right-2 animate-spin" />
            </div>

            <div>
              <h4 className="text-sm font-extrabold text-slate-900">
                Horeee! Semua Data Berhasil Diperbarui! 🥳
              </h4>
              <p className="text-xs text-slate-600 mt-1 max-w-xs mx-auto">
                Metrik followers, likes, dan 10 video terbaru sudah siap dipantau di dashboard bos!
              </p>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleClose();
              }}
              className="px-5 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold shadow-md shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95 cursor-pointer relative z-30"
            >
              Sip, Makasih! ✨
            </button>
          </div>
        ) : (
          /* Active Syncing State */
          <div className="pt-3.5 space-y-3 relative z-10">
            {/* Mascot + Cute Speech Bubble Row */}
            <div className="flex items-start space-x-3">
              {/* Cute Vector Mascot: Detective Robot */}
              <div className="relative flex-shrink-0 animate-mascot-bounce">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 p-0.5 shadow-md shadow-indigo-500/25 flex items-center justify-center">
                  <div className="w-full h-full rounded-[14px] bg-slate-900 flex flex-col items-center justify-center relative overflow-hidden">
                    {/* Glowing Mascot Face */}
                    <div className="text-2xl filter drop-shadow">🕵️‍♂️</div>
                    {/* Pulsing antenna beacon */}
                    <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                  </div>
                </div>

                {/* Animated Magnifying Glass Accent */}
                <div className="absolute -bottom-1 -right-1 text-sm animate-scan">
                  🔍
                </div>
              </div>

              {/* Cute Speech Bubble */}
              <div className="flex-1 bg-gradient-to-r from-blue-50/95 to-indigo-50/95 border border-blue-100 rounded-2xl p-2.5 relative shadow-2xs">
                {/* Speech Bubble Arrow */}
                <div className="absolute top-3.5 -left-1.5 w-3 h-3 bg-blue-50 border-l border-b border-blue-100 transform rotate-45" />

                <div className="flex items-center space-x-1.5 mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-sparkle" />
                  <span className="text-[11px] font-bold text-indigo-900">
                    Detektif TikTok
                  </span>
                </div>

                <p className="text-xs font-semibold text-slate-700 leading-snug min-h-[32px] transition-all duration-300">
                  {CUTE_WAITING_QUOTES[quoteIndex]}
                </p>
              </div>
            </div>

            {/* Target Account Badge & Progress info */}
            <div className="space-y-1.5 bg-slate-50/80 rounded-2xl p-2.5 border border-slate-100">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-1.5 truncate">
                  <Radio className="w-3 h-3 text-blue-600 animate-pulse shrink-0" />
                  <span className="font-semibold text-slate-700 truncate">
                    {currentAccountName || `@${currentUsername}` || 'Memeriksa profil...'}
                  </span>
                  {currentUsername && (
                    <span className="text-[11px] font-mono text-slate-400 truncate">
                      @{currentUsername}
                    </span>
                  )}
                </div>

                <span className="text-[11px] font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100 shrink-0">
                  {current} / {total} Akun
                </span>
              </div>

              {/* Step Subtext */}
              <p className="text-[11px] text-slate-500 font-medium truncate flex items-center space-x-1">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping shrink-0" />
                <span className="truncate">{formatFriendlyStep(stepMessage)}</span>
              </p>

              {/* Progress Bar with Shimmer Animation */}
              <div className="relative w-full h-2.5 bg-slate-200/80 rounded-full overflow-hidden mt-1">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-400 rounded-full transition-all duration-500 ease-out animate-shimmer relative"
                  style={{ width: `${progressPercent}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse" />
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-0.5">
                <span>Mohon jangan refresh halaman</span>
                <span className="font-bold text-indigo-600">{progressPercent}%</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
