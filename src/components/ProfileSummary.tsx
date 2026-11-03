import React from 'react';
import { Users, Heart, Video, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { AccountSnapshot } from '../types';
import {
  formatCompactNumber,
  formatExactNumber,
  formatGrowth,
  getObservationIntervalText,
} from '../lib/formatters';

interface ProfileSummaryProps {
  latestSnapshot: AccountSnapshot | null;
  previousSnapshot: AccountSnapshot | null;
  followersDiff: number | null;
}

export const ProfileSummary: React.FC<ProfileSummaryProps> = ({
  latestSnapshot,
  previousSnapshot,
  followersDiff,
}) => {
  const growth = formatGrowth(followersDiff);
  const intervalText = getObservationIntervalText(
    previousSnapshot?.captured_at,
    latestSnapshot?.captured_at
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* 1. Followers Card */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 relative overflow-hidden shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Followers Akun
          </span>
          <div className="p-2 rounded-xl bg-cyan-950/70 text-cyan-400 border border-cyan-800/40">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {formatCompactNumber(latestSnapshot?.fans)}
            </span>
            {latestSnapshot?.fans !== null && latestSnapshot?.fans !== undefined && (
              <span className="text-xs text-slate-400 font-mono">
                ({formatExactNumber(latestSnapshot?.fans)})
              </span>
            )}
          </div>

          {/* Growth delta */}
          <div className="pt-2 flex items-center space-x-1.5 text-xs">
            {growth.isZero ? (
              <span className="text-slate-400 inline-flex items-center space-x-1">
                <Minus className="w-3.5 h-3.5" />
                <span>{growth.text}</span>
              </span>
            ) : growth.isPositive ? (
              <span className="text-emerald-400 font-semibold inline-flex items-center space-x-1">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>{growth.text} followers</span>
              </span>
            ) : (
              <span className="text-rose-400 font-semibold inline-flex items-center space-x-1">
                <TrendingDown className="w-3.5 h-3.5" />
                <span>{growth.text} followers</span>
              </span>
            )}
            <span className="text-slate-500 text-[11px] truncate">({intervalText})</span>
          </div>
        </div>
      </div>

      {/* 2. Total Likes Profile Card */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 relative overflow-hidden shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Total Likes Profil
          </span>
          <div className="p-2 rounded-xl bg-rose-950/70 text-rose-400 border border-rose-800/40">
            <Heart className="w-5 h-5" />
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {formatCompactNumber(latestSnapshot?.heart)}
            </span>
            {latestSnapshot?.heart !== null && latestSnapshot?.heart !== undefined && (
              <span className="text-xs text-slate-400 font-mono">
                ({formatExactNumber(latestSnapshot?.heart)})
              </span>
            )}
          </div>
          <p className="pt-2 text-xs text-slate-400">
            Akumulasi suka seluruh konten publik profil TikTok
          </p>
        </div>
      </div>

      {/* 3. Total Published Videos Card */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 relative overflow-hidden shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Total Postingan Profil
          </span>
          <div className="p-2 rounded-xl bg-indigo-950/70 text-indigo-400 border border-indigo-800/40">
            <Video className="w-5 h-5" />
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {formatCompactNumber(latestSnapshot?.video_count)}
            </span>
            {latestSnapshot?.video_count !== null && latestSnapshot?.video_count !== undefined && (
              <span className="text-xs text-slate-400 font-mono">postingan</span>
            )}
          </div>
          <p className="pt-2 text-xs text-slate-400">
            Jumlah keseluruhan video yang dipublikasikan akun
          </p>
        </div>
      </div>
    </div>
  );
};
