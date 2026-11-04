import React from 'react';
import { Users, Heart, Video, Eye, TrendingUp, TrendingDown, Minus, Sparkles } from 'lucide-react';
import { AccountSnapshot, PostWithSnapshot } from '../types';
import {
  formatCompactNumber,
  formatGrowth,
} from '../lib/formatters';
import { useCountUp } from '../lib/useCountUp';

interface MetricsOverviewProps {
  latestSnapshot: AccountSnapshot | null;
  previousSnapshot: AccountSnapshot | null;
  followersDiff: number | null;
  posts: PostWithSnapshot[];
}

export const MetricsOverview: React.FC<MetricsOverviewProps> = ({
  latestSnapshot,
  followersDiff,
  posts,
}) => {
  // Aggregate views for the monitored batch
  let totalViews: number | null = null;
  if (posts.length > 0) {
    totalViews = posts.reduce((sum, p) => sum + (p.current_play_count ?? 0), 0);
  }

  const growth = formatGrowth(followersDiff);

  // Smooth Count-Up animations
  const animatedFans = useCountUp(latestSnapshot?.fans);
  const animatedHeart = useCountUp(latestSnapshot?.heart);
  const animatedVideos = useCountUp(latestSnapshot?.video_count);
  const animatedViews = useCountUp(totalViews);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
      {/* 1. Followers - Hero Saweria Golden Amber Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-400 via-yellow-400 to-amber-500 border-2 border-slate-900 p-3.5 sm:p-5 text-slate-950 shadow-[4px_4px_0px_#0f172a] flex flex-col justify-between hover:shadow-[5px_5px_0px_#0f172a] hover:-translate-y-0.5 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all duration-200 group animate-fade-in-up">
        {/* Playful retro Saweria corner sticker */}
        <div className="absolute -top-1 -right-1">
          <div className="bg-slate-950 text-amber-300 text-[9px] font-black uppercase px-2 py-0.5 rounded-bl-xl border-b border-l border-slate-900 flex items-center space-x-1">
            <Sparkles className="w-2.5 h-2.5 text-amber-300 animate-spin" />
            <span>Utama</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[11px] sm:text-xs font-black text-slate-900 uppercase tracking-wider">
            Followers Akun
          </span>
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-slate-950 text-amber-300 border border-slate-900 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 group-hover:rotate-[-3deg] transition-all duration-200">
            <Users className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300" />
          </div>
        </div>

        <div className="mt-3 sm:mt-4">
          <div className="flex items-baseline space-x-1.5 sm:space-x-2 flex-wrap">
            <span className="text-xl sm:text-3xl font-black tracking-tight font-mono transition-all text-slate-950">
              {formatCompactNumber(animatedFans)}
            </span>
            {followersDiff !== null && followersDiff !== undefined && (
              <span className="inline-flex items-center space-x-0.5 px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-black bg-slate-950 text-amber-300 border border-slate-900 animate-scale-in shadow-2xs">
                {growth.isZero ? (
                  <>
                    <Minus className="w-2 sm:w-2.5 h-2 sm:h-2.5" />
                    <span>0</span>
                  </>
                ) : growth.isPositive ? (
                  <>
                    <TrendingUp className="w-2 sm:w-2.5 h-2 sm:h-2.5" />
                    <span>{growth.text}</span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="w-2 sm:w-2.5 h-2 sm:h-2.5" />
                    <span>{growth.text}</span>
                  </>
                )}
              </span>
            )}
          </div>
          <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs text-slate-900/80 font-bold truncate">
            Riwayat akumulasi pengikut
          </p>
        </div>
      </div>

      {/* 2. Total Likes Profil (Saweria Neo-Brutal Pop Card) */}
      <div className="rounded-2xl bg-white border-2 border-slate-900 p-3.5 sm:p-5 shadow-[3px_3px_0px_#0f172a] hover:shadow-[4px_4px_0px_#0f172a] hover:-translate-y-0.5 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none flex flex-col justify-between group transition-all duration-200 animate-fade-in-up [animation-delay:60ms]">
        <div className="flex items-center justify-between">
          <span className="text-[11px] sm:text-xs font-bold text-slate-600 tracking-wide">
            Total Likes Profil
          </span>
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-rose-100 text-rose-600 border-2 border-slate-900 flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:rotate-[3deg] transition-all duration-200">
            <Heart className="w-4 h-4 sm:w-5 sm:h-5 fill-rose-500" />
          </div>
        </div>

        <div className="mt-3 sm:mt-4">
          <div className="text-xl sm:text-3xl font-black text-slate-900 font-mono tracking-tight transition-all">
            {formatCompactNumber(animatedHeart)}
          </div>
          <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs text-slate-500 font-medium truncate">
            Suka di seluruh konten akun
          </p>
        </div>
      </div>

      {/* 3. Total Video Profil (Saweria Neo-Brutal Pop Card) */}
      <div className="rounded-2xl bg-white border-2 border-slate-900 p-3.5 sm:p-5 shadow-[3px_3px_0px_#0f172a] hover:shadow-[4px_4px_0px_#0f172a] hover:-translate-y-0.5 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none flex flex-col justify-between group transition-all duration-200 animate-fade-in-up [animation-delay:120ms]">
        <div className="flex items-center justify-between">
          <span className="text-[11px] sm:text-xs font-bold text-slate-600 tracking-wide">
            Total Video Profil
          </span>
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-amber-100 text-amber-700 border-2 border-slate-900 flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:rotate-[-3deg] transition-all duration-200">
            <Video className="w-4 h-4 sm:w-5 sm:h-5 text-amber-700" />
          </div>
        </div>

        <div className="mt-3 sm:mt-4">
          <div className="text-xl sm:text-3xl font-black text-slate-900 font-mono tracking-tight transition-all">
            {formatCompactNumber(animatedVideos)}
          </div>
          <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs text-slate-500 font-medium truncate">
            Konten dipublikasikan
          </p>
        </div>
      </div>

      {/* 4. Views 10 Postingan Terpantau (Saweria Neo-Brutal Pop Card) */}
      <div className="rounded-2xl bg-white border-2 border-slate-900 p-3.5 sm:p-5 shadow-[3px_3px_0px_#0f172a] hover:shadow-[4px_4px_0px_#0f172a] hover:-translate-y-0.5 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none flex flex-col justify-between group transition-all duration-200 animate-fade-in-up [animation-delay:180ms]">
        <div className="flex items-center justify-between">
          <span className="text-[11px] sm:text-xs font-bold text-slate-600 tracking-wide">
            Views 10 Postingan
          </span>
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-teal-100 text-teal-700 border-2 border-slate-900 flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:rotate-[3deg] transition-all duration-200">
            <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-teal-700" />
          </div>
        </div>

        <div className="mt-3 sm:mt-4">
          <div className="text-xl sm:text-3xl font-black text-slate-900 font-mono tracking-tight transition-all">
            {formatCompactNumber(animatedViews)}
          </div>
          <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs text-amber-600 font-bold truncate">
            10 postingan terbaru
          </p>
        </div>
      </div>
    </div>
  );
};
