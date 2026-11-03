import React from 'react';
import { Users, Heart, Video, Eye, Flame, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { AccountSnapshot, PostWithSnapshot } from '../types';
import {
  formatCompactNumber,
  formatExactNumber,
  calculateEngagementRate,
  formatEngagementRate,
  formatGrowth,
} from '../lib/formatters';

interface MetricsOverviewProps {
  latestSnapshot: AccountSnapshot | null;
  previousSnapshot: AccountSnapshot | null;
  followersDiff: number | null;
  posts: PostWithSnapshot[];
}

export const MetricsOverview: React.FC<MetricsOverviewProps> = ({
  latestSnapshot,
  previousSnapshot,
  followersDiff,
  posts,
}) => {
  const postsCount = posts.length;

  // Aggregate views & metrics for the monitored batch
  let totalViews: number | null = null;
  let totalLikes: number | null = null;
  let totalComments: number | null = null;
  let totalShares: number | null = null;

  if (postsCount > 0) {
    totalViews = 0;
    totalLikes = 0;
    totalComments = 0;
    totalShares = 0;

    posts.forEach((p) => {
      if (p.current_play_count !== null && p.current_play_count !== undefined) totalViews! += p.current_play_count;
      if (p.current_digg_count !== null && p.current_digg_count !== undefined) totalLikes! += p.current_digg_count;
      if (p.current_comment_count !== null && p.current_comment_count !== undefined) totalComments! += p.current_comment_count;
      if (p.current_share_count !== null && p.current_share_count !== undefined) totalShares! += p.current_share_count;
    });
  }

  const batchER = calculateEngagementRate(totalViews, totalLikes, totalComments, totalShares);
  const growth = formatGrowth(followersDiff);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {/* 1. Followers */}
      <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-[11px] font-medium uppercase tracking-wider">Followers</span>
          <Users className="w-4 h-4 text-cyan-400 opacity-80" />
        </div>
        <div>
          <div className="text-xl sm:text-2xl font-bold text-white font-mono tracking-tight">
            {formatCompactNumber(latestSnapshot?.fans)}
          </div>
          <div className="mt-1 flex items-center space-x-1 text-[11px]">
            {growth.isZero ? (
              <span className="text-slate-500 flex items-center space-x-0.5">
                <Minus className="w-3 h-3" />
                <span>0</span>
              </span>
            ) : growth.isPositive ? (
              <span className="text-emerald-400 font-semibold flex items-center space-x-0.5">
                <TrendingUp className="w-3 h-3" />
                <span>{growth.text}</span>
              </span>
            ) : (
              <span className="text-rose-400 font-semibold flex items-center space-x-0.5">
                <TrendingDown className="w-3 h-3" />
                <span>{growth.text}</span>
              </span>
            )}
            <span className="text-slate-500">riwayat</span>
          </div>
        </div>
      </div>

      {/* 2. Total Likes Profil */}
      <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-[11px] font-medium uppercase tracking-wider">Total Likes</span>
          <Heart className="w-4 h-4 text-rose-400 opacity-80" />
        </div>
        <div>
          <div className="text-xl sm:text-2xl font-bold text-white font-mono tracking-tight">
            {formatCompactNumber(latestSnapshot?.heart)}
          </div>
          <p className="mt-1 text-[11px] text-slate-500">Semua konten profil</p>
        </div>
      </div>

      {/* 3. Total Postingan Profil */}
      <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-[11px] font-medium uppercase tracking-wider">Total Postingan</span>
          <Video className="w-4 h-4 text-indigo-400 opacity-80" />
        </div>
        <div>
          <div className="text-xl sm:text-2xl font-bold text-white font-mono tracking-tight">
            {formatCompactNumber(latestSnapshot?.video_count)}
          </div>
          <p className="mt-1 text-[11px] text-slate-500">Video di TikTok</p>
        </div>
      </div>

      {/* 4. Views 10 Postingan Terpantau */}
      <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-[11px] font-medium uppercase tracking-wider">Views Terpantau</span>
          <Eye className="w-4 h-4 text-emerald-400 opacity-80" />
        </div>
        <div>
          <div className="text-xl sm:text-2xl font-bold text-white font-mono tracking-tight">
            {formatCompactNumber(totalViews)}
          </div>
          <p className="mt-1 text-[11px] text-cyan-400/80">10 postingan sampel</p>
        </div>
      </div>

      {/* 5. Engagement Rate */}
      <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between col-span-2 sm:col-span-1">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-[11px] font-medium uppercase tracking-wider">Engagement Rate</span>
          <Flame className="w-4 h-4 text-amber-400 opacity-80" />
        </div>
        <div>
          <div className="text-xl sm:text-2xl font-bold text-amber-300 font-mono tracking-tight">
            {formatEngagementRate(batchER)}
          </div>
          <p className="mt-1 text-[11px] text-slate-500">Rasio interaksi / views</p>
        </div>
      </div>
    </div>
  );
};
