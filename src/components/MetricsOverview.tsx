import React from 'react';
import { Users, Heart, Video, Eye, TrendingUp, TrendingDown, Minus } from 'lucide-react';
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
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-5">
      {/* 1. Followers - Hero Vibrant Blue Card (Matching Card 1 in Boltshift) */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-600 animate-gradient p-3.5 sm:p-5 text-white shadow-lg shadow-blue-500/20 flex flex-col justify-between card-lift group animate-fade-in-up">
        <div className="flex items-center justify-between">
          <span className="text-[11px] sm:text-xs font-semibold text-blue-100 tracking-wide">
            Followers Akun
          </span>
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center text-white shrink-0 group-hover:scale-110 group-hover:bg-white/30 transition-all duration-200">
            <Users className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

        <div className="mt-3 sm:mt-4">
          <div className="flex items-baseline space-x-1.5 sm:space-x-2 flex-wrap">
            <span className="text-xl sm:text-3xl font-extrabold tracking-tight font-mono transition-all">
              {formatCompactNumber(animatedFans)}
            </span>
            {followersDiff !== null && followersDiff !== undefined && (
              <span className="inline-flex items-center space-x-0.5 px-1.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-semibold bg-white/20 text-white animate-scale-in">
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
          <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs text-blue-100/80 truncate">
            Riwayat akumulasi pengikut
          </p>
        </div>
      </div>

      {/* 2. Total Likes Profil (Matching Card 2 in Boltshift) */}
      <div className="rounded-2xl bg-white border border-slate-200/80 p-3.5 sm:p-5 shadow-xs flex flex-col justify-between card-lift group hover:border-rose-200 animate-fade-in-up [animation-delay:60ms]">
        <div className="flex items-center justify-between">
          <span className="text-[11px] sm:text-xs font-semibold text-slate-500 tracking-wide">
            Total Likes Profil
          </span>
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 shrink-0 group-hover:scale-110 group-hover:bg-rose-100 transition-all duration-200">
            <Heart className="w-4 h-4 sm:w-5 sm:h-5 fill-rose-500/20" />
          </div>
        </div>

        <div className="mt-3 sm:mt-4">
          <div className="text-xl sm:text-3xl font-extrabold text-slate-900 font-mono tracking-tight transition-all">
            {formatCompactNumber(animatedHeart)}
          </div>
          <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs text-slate-400 truncate">
            Suka di seluruh konten akun
          </p>
        </div>
      </div>

      {/* 3. Total Postingan Profil (Matching Card 3 in Boltshift) */}
      <div className="rounded-2xl bg-white border border-slate-200/80 p-3.5 sm:p-5 shadow-xs flex flex-col justify-between card-lift group hover:border-blue-200 animate-fade-in-up [animation-delay:120ms]">
        <div className="flex items-center justify-between">
          <span className="text-[11px] sm:text-xs font-semibold text-slate-500 tracking-wide">
            Total Video Profil
          </span>
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0 group-hover:scale-110 group-hover:bg-blue-100 transition-all duration-200">
            <Video className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

        <div className="mt-3 sm:mt-4">
          <div className="text-xl sm:text-3xl font-extrabold text-slate-900 font-mono tracking-tight transition-all">
            {formatCompactNumber(animatedVideos)}
          </div>
          <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs text-slate-400 truncate">
            Konten dipublikasikan
          </p>
        </div>
      </div>

      {/* 4. Views 10 Postingan Terpantau (Matching Card 4 in Boltshift) */}
      <div className="rounded-2xl bg-white border border-slate-200/80 p-3.5 sm:p-5 shadow-xs flex flex-col justify-between card-lift group hover:border-indigo-200 animate-fade-in-up [animation-delay:180ms]">
        <div className="flex items-center justify-between">
          <span className="text-[11px] sm:text-xs font-semibold text-slate-500 tracking-wide">
            Views 10 Postingan
          </span>
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0 group-hover:scale-110 group-hover:bg-indigo-100 transition-all duration-200">
            <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

        <div className="mt-3 sm:mt-4">
          <div className="text-xl sm:text-3xl font-extrabold text-slate-900 font-mono tracking-tight transition-all">
            {formatCompactNumber(animatedViews)}
          </div>
          <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs text-blue-600 font-medium truncate">
            10 postingan terbaru
          </p>
        </div>
      </div>
    </div>
  );
};
