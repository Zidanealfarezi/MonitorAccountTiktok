import React from 'react';
import { Eye, Flame, Share2, Layers, HelpCircle } from 'lucide-react';
import { PostWithSnapshot } from '../types';
import {
  formatCompactNumber,
  formatExactNumber,
  calculateEngagementRate,
  formatEngagementRate,
} from '../lib/formatters';

interface PostsSummaryProps {
  posts: PostWithSnapshot[];
}

export const PostsSummary: React.FC<PostsSummaryProps> = ({ posts }) => {
  const postsCount = posts.length;

  // Aggregate metrics across the monitored batch
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
      if (p.current_play_count !== null && p.current_play_count !== undefined) {
        totalViews! += p.current_play_count;
      }
      if (p.current_digg_count !== null && p.current_digg_count !== undefined) {
        totalLikes! += p.current_digg_count;
      }
      if (p.current_comment_count !== null && p.current_comment_count !== undefined) {
        totalComments! += p.current_comment_count;
      }
      if (p.current_share_count !== null && p.current_share_count !== undefined) {
        totalShares! += p.current_share_count;
      }
    });
  }

  const batchEngagementRate = calculateEngagementRate(
    totalViews,
    totalLikes,
    totalComments,
    totalShares
  );

  const avgViews = totalViews && postsCount > 0 ? Math.round(totalViews / postsCount) : null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
            Ringkasan Sampel Postingan Terpantau
          </h3>
          <p className="text-xs text-slate-400">
            Agregat khusus untuk {postsCount} postingan terbaru yang diambil dari profil
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Monitored Count */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400">Postingan Dipantau</span>
            <Layers className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            {postsCount} <span className="text-xs font-normal text-slate-400">postingan</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Maksimal 10 postingan terbaru per pengambilan</p>
        </div>

        {/* 2. Total Views of Monitored Batch */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400">Views {postsCount} Postingan Terpantau</span>
            <Eye className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-2xl font-bold text-white font-mono">
              {formatCompactNumber(totalViews)}
            </span>
            {totalViews !== null && (
              <span className="text-[10px] text-slate-400 font-mono">
                ({formatExactNumber(totalViews)})
              </span>
            )}
          </div>
          <p className="text-[11px] text-cyan-400/90 mt-1 font-medium">
            *Bukan akumulasi seluruh akun
          </p>
        </div>

        {/* 3. Engagement Rate based on views */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-1">
              <span className="text-xs text-slate-400">Engagement Rate (Views)</span>
            </div>
            <Flame className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-300 font-mono">
            {formatEngagementRate(batchEngagementRate)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Rumus: (Likes + Komentar + Share) / Views
          </p>
        </div>

        {/* 4. Average Views per Post */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400">Rata-rata Views / Postingan</span>
            <Share2 className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            {formatCompactNumber(avgViews)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Dari {postsCount} postingan yang dipantau</p>
        </div>
      </div>
    </div>
  );
};
