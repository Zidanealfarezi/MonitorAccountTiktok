import React from 'react';
import { MoreHorizontal, Flame, Eye, HeartHandshake } from 'lucide-react';
import { PostWithSnapshot } from '../types';
import {
  calculateEngagementRate,
  formatEngagementRate,
  formatCompactNumber,
} from '../lib/formatters';

interface EngagementGaugeCardProps {
  posts: PostWithSnapshot[];
}

export const EngagementGaugeCard: React.FC<EngagementGaugeCardProps> = ({ posts }) => {
  const postsCount = posts.length;

  let totalViews = 0;
  let totalLikes = 0;
  let totalComments = 0;
  let totalShares = 0;

  posts.forEach((p) => {
    totalViews += p.current_play_count ?? 0;
    totalLikes += p.current_digg_count ?? 0;
    totalComments += p.current_comment_count ?? 0;
    totalShares += p.current_share_count ?? 0;
  });

  const totalInteractions = totalLikes + totalComments + totalShares;
  const avgViewsPerPost = postsCount > 0 ? Math.round(totalViews / postsCount) : 0;
  const batchER = calculateEngagementRate(totalViews, totalLikes, totalComments, totalShares);

  // Benchmarking ER: 0% to 15% (15% is viral benchmark on TikTok)
  const erValue = batchER ?? 0;
  const clampedRatio = Math.max(0, Math.min(1, erValue / 15));

  // Build segmented ticks for the semi-circle (180 deg to 0 deg)
  const TOTAL_TICKS = 18;
  const activeTicksCount = Math.round(clampedRatio * TOTAL_TICKS);

  // SVG coordinate configuration
  const cx = 130;
  const cy = 115;
  const rInner = 65;
  const rOuter = 95;

  const ticks = Array.from({ length: TOTAL_TICKS }, (_, i) => {
    // theta from 180 (left) to 0 (right)
    const angleDeg = 180 - (i / (TOTAL_TICKS - 1)) * 180;
    const angleRad = (angleDeg * Math.PI) / 180;

    const x1 = cx + rInner * Math.cos(angleRad);
    const y1 = cy - rInner * Math.sin(angleRad);
    const x2 = cx + rOuter * Math.cos(angleRad);
    const y2 = cy - rOuter * Math.sin(angleRad);

    const isActive = i < activeTicksCount;

    return {
      id: i,
      x1,
      y1,
      x2,
      y2,
      isActive,
      // Color gradient from bright blue to royal indigo
      activeColor: i > TOTAL_TICKS * 0.7 ? '#1d4ed8' : '#2563eb',
    };
  });

  return (
    <div className="rounded-2xl bg-white border border-slate-200/80 p-4 sm:p-6 shadow-xs flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight">
            Engagement Rate
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Interaksi per views sampel
          </p>
        </div>
        <div className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 transition cursor-pointer">
          <MoreHorizontal className="w-4 h-4" />
        </div>
      </div>

      {/* Radial Semi-Circle Gauge */}
      <div className="relative flex flex-col items-center justify-center my-2">
        <svg viewBox="0 0 260 145" className="w-64 h-36">
          <defs>
            <linearGradient id="activeTickGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#1d4ed8" />
            </linearGradient>
          </defs>
          {ticks.map((t) => (
            <line
              key={t.id}
              x1={t.x1}
              y1={t.y1}
              x2={t.x2}
              y2={t.y2}
              stroke={t.isActive ? t.activeColor : '#e2e8f0'}
              strokeWidth="7"
              strokeLinecap="round"
              className="transition-all duration-500"
            />
          ))}
        </svg>

        {/* Center ER Text inside the Arc */}
        <div className="absolute bottom-2 text-center">
          <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-mono tracking-tight">
            {formatEngagementRate(batchER)}
          </div>
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-0.5 flex items-center justify-center space-x-1">
            <Flame className="w-3.5 h-3.5 text-blue-600" />
            <span>Kualitas Interaksi</span>
          </div>
        </div>
      </div>

      {/* Bottom 2 Stat Boxes (Matching Boltshift Number of Sales & Total Revenue) */}
      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 mt-1">
        <div className="bg-slate-50/80 border border-slate-100 rounded-xl p-3">
          <div className="text-[11px] font-medium text-slate-500">
            Rata-rata Views
          </div>
          <div className="text-lg font-bold text-slate-900 font-mono mt-0.5">
            {formatCompactNumber(avgViewsPerPost)}
          </div>
          <div className="text-[10px] text-blue-600 font-medium mt-0.5">
            Per video terpantau
          </div>
        </div>

        <div className="bg-slate-50/80 border border-slate-100 rounded-xl p-3">
          <div className="text-[11px] font-medium text-slate-500">
            Total Interaksi
          </div>
          <div className="text-lg font-bold text-slate-900 font-mono mt-0.5">
            {formatCompactNumber(totalInteractions)}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            Likes + Komentar + Share
          </div>
        </div>
      </div>
    </div>
  );
};
