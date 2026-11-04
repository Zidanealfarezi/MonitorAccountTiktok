import React from 'react';
import { MoreHorizontal, Flame, Sparkles } from 'lucide-react';
import { PostWithSnapshot } from '../types';
import {
  calculateEngagementRate,
  formatEngagementRate,
  formatCompactNumber,
} from '../lib/formatters';
import { useCountUp } from '../lib/useCountUp';

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

  const animatedAvgViews = useCountUp(avgViewsPerPost);
  const animatedInteractions = useCountUp(totalInteractions);

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

    // Saweria warm fiery gradient: Gold/Amber -> Orange -> Coral Red
    let activeColor = '#f59e0b';
    if (i >= 6 && i < 13) {
      activeColor = '#f97316';
    } else if (i >= 13) {
      activeColor = '#ef4444';
    }

    return {
      id: i,
      x1,
      y1,
      x2,
      y2,
      isActive,
      activeColor,
    };
  });

  return (
    <div className="rounded-2xl bg-white border-2 border-slate-900 p-4 sm:p-6 shadow-[4px_4px_0px_#0f172a] hover:shadow-[5px_5px_0px_#0f172a] hover:-translate-y-0.5 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none flex flex-col justify-between transition-all duration-200 animate-fade-in-up [animation-delay:240ms]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-base font-black text-slate-900 tracking-tight">
              Engagement Rate
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-amber-300 text-slate-900 border border-slate-900 rotate-[-1.5deg] shadow-2xs">
              ⚡ LIVE METRIC
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            Interaksi per views sampel
          </p>
        </div>
        <div className="w-8 h-8 rounded-xl bg-amber-50 border border-slate-900 hover:bg-amber-100 flex items-center justify-center text-slate-800 transition cursor-pointer shadow-2xs">
          <MoreHorizontal className="w-4 h-4" />
        </div>
      </div>

      {/* Radial Semi-Circle Gauge */}
      <div className="relative flex flex-col items-center justify-center my-2">
        <svg viewBox="0 0 260 145" className="w-64 h-36">
          {ticks.map((t) => (
            <line
              key={t.id}
              x1={t.x1}
              y1={t.y1}
              x2={t.x2}
              y2={t.y2}
              stroke={t.isActive ? t.activeColor : '#f1f5f9'}
              strokeWidth="7"
              strokeLinecap="round"
              className="transition-all duration-700 ease-out"
            />
          ))}
        </svg>

        {/* Center ER Text inside the Arc */}
        <div className="absolute bottom-2 text-center animate-scale-in">
          <div className="text-3xl sm:text-4xl font-black text-slate-900 font-mono tracking-tight">
            {formatEngagementRate(batchER)}
          </div>
          <div className="text-xs font-black text-amber-700 uppercase tracking-wider mt-0.5 flex items-center justify-center space-x-1">
            <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500 animate-bounce" />
            <span>Kualitas Interaksi</span>
          </div>
        </div>
      </div>

      {/* Bottom 2 Stat Boxes (Saweria Creator Tip Counter Style) */}
      <div className="grid grid-cols-2 gap-3 pt-3 border-t-2 border-slate-100 mt-1">
        <div className="bg-amber-50/70 border-2 border-slate-900 rounded-xl p-3 shadow-[2px_2px_0px_#0f172a] hover:bg-amber-100/70 transition-all">
          <div className="text-[11px] font-bold text-slate-700">
            Rata-rata Views
          </div>
          <div className="text-lg font-black text-slate-900 font-mono mt-0.5 transition-all">
            {formatCompactNumber(animatedAvgViews)}
          </div>
          <div className="text-[10px] text-amber-800 font-bold mt-0.5">
            Per video terpantau
          </div>
        </div>

        <div className="bg-orange-50/70 border-2 border-slate-900 rounded-xl p-3 shadow-[2px_2px_0px_#0f172a] hover:bg-orange-100/70 transition-all">
          <div className="text-[11px] font-bold text-slate-700">
            Total Interaksi
          </div>
          <div className="text-lg font-black text-slate-900 font-mono mt-0.5 transition-all">
            {formatCompactNumber(animatedInteractions)}
          </div>
          <div className="text-[10px] text-orange-800 font-bold mt-0.5">
            Likes + Komentar + Share
          </div>
        </div>
      </div>
    </div>
  );
};
