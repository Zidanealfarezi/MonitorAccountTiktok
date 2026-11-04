import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';
import { TrendingUp, TrendingDown, Minus, Info, Users, BarChart3, Eye, Heart, Flame } from 'lucide-react';
import { AccountSnapshot, PostWithSnapshot } from '../types';
import { isSeedSnapshot } from '../lib/seedData';
import {
  formatCompactNumber,
  formatExactNumber,
  formatShortDateWIB,
  formatDateWIB,
  formatEngagementRate,
} from '../lib/formatters';

interface PerformanceChartCardProps {
  snapshotsHistory: AccountSnapshot[];
  posts: PostWithSnapshot[];
}

export const PerformanceChartCard: React.FC<PerformanceChartCardProps> = ({
  snapshotsHistory,
  posts,
}) => {
  const [activeChart, setActiveChart] = useState<'followers' | 'posts'>('posts');
  const [period, setPeriod] = useState<'7d' | '30d' | 'all'>('all');
  const [postMetric, setPostMetric] = useState<'views' | 'likes' | 'engagement'>('views');

  const totalPostViews = posts.reduce((sum, p) => sum + (p.current_play_count ?? 0), 0);

  // 1. Process Followers Data
  const filterSnapshots = () => {
    if (snapshotsHistory.length === 0) return [];
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;

    let filtered = snapshotsHistory;
    if (period === '7d') {
      filtered = snapshotsHistory.filter((s) => now - new Date(s.captured_at).getTime() <= 7 * dayMs);
    } else if (period === '30d') {
      filtered = snapshotsHistory.filter((s) => now - new Date(s.captured_at).getTime() <= 30 * dayMs);
    }

    // Safety 1: If there are real live data points, drop any dummy seed points
    const hasLive = filtered.some((s) => !isSeedSnapshot(s));
    if (hasLive) {
      filtered = filtered.filter((s) => !isSeedSnapshot(s));
    }

    // Safety 2: Anomaly Cliff Protection (reject legacy fictitious seed spikes or mock spikes)
    if (filtered.length >= 2) {
      for (let i = 1; i < filtered.length; i++) {
        const prev = filtered[i - 1].fans ?? 0;
        const curr = filtered[i].fans ?? 0;
        if (
          (prev > 50 && curr <= 30 && (prev - curr) / prev > 0.4) ||
          (prev > 150 && curr < 80) ||
          (prev > 500 && (prev - curr) / prev > 0.6) ||
          (prev > 1000 && curr < 200 && (prev - curr) / prev > 0.8)
        ) {
          filtered = filtered.slice(i);
          break;
        }
      }
    }

    const processed = filtered
      .filter((s) => typeof s.fans === 'number')
      .map((s) => ({
        rawDate: s.captured_at,
        displayDate: formatShortDateWIB(s.captured_at),
        followers: s.fans as number,
      }));

    // If only 1 live observation exists, synthesize a baseline 12h prior with identical scale so curve renders a stable line
    if (processed.length === 1) {
      const single = processed[0];
      const singleTime = new Date(single.rawDate).getTime();
      return [
        {
          rawDate: new Date(singleTime - 12 * 60 * 60 * 1000).toISOString(),
          displayDate: 'Awal Pantau',
          followers: single.followers,
        },
        single,
      ];
    }

    return processed;
  };

  const followersData = filterSnapshots();
  const hasEnoughFollowerData = followersData.length >= 2;

  const startFollowers = followersData[0]?.followers ?? 0;
  const endFollowers = followersData[followersData.length - 1]?.followers ?? 0;
  const deltaFollowers = startFollowers && endFollowers ? endFollowers - startFollowers : 0;

  // Realistic Y-domain
  const followerValues = followersData.map((d) => d.followers);
  const minVal = followerValues.length > 0 ? Math.min(...followerValues) : 0;
  const maxVal = followerValues.length > 0 ? Math.max(...followerValues) : 10;
  const valSpread = maxVal - minVal;
  const yDomainFollowers: [number, number] =
    valSpread === 0
      ? [Math.max(0, minVal - 2), maxVal + 2]
      : [Math.max(0, Math.floor(minVal - valSpread * 0.15)), Math.ceil(maxVal + valSpread * 0.15)];

  // 2. Process Posts Data
  const postsData = posts.map((p, idx) => ({
    index: `#${idx + 1}`,
    name: p.caption ? p.caption.slice(0, 16) + '...' : `Post #${idx + 1}`,
    fullCaption: p.caption,
    views: p.current_play_count ?? 0,
    likes: p.current_digg_count ?? 0,
    engagement: p.engagement_rate ?? 0,
    isSlideshow: p.is_slideshow,
  }));

  return (
    <div className="rounded-2xl bg-white border-2 border-slate-900 p-4 sm:p-6 shadow-[4px_4px_0px_#0f172a] hover:shadow-[5px_5px_0px_#0f172a] hover:-translate-y-0.5 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none flex flex-col justify-between transition-all duration-200 animate-fade-in-up [animation-delay:200ms]">
      {/* Header with Title and Mode Switchers */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-base font-black text-slate-900 tracking-tight">
              Performance Overview
            </h3>
            {activeChart === 'posts' && postMetric === 'views' && (
              <span className="text-xs px-2.5 py-0.5 rounded-full font-mono font-black bg-amber-100 text-amber-950 border border-slate-900 flex items-center space-x-1 shadow-2xs">
                <Eye className="w-3 h-3 text-amber-900" />
                <span>{formatCompactNumber(totalPostViews)} Views</span>
              </span>
            )}
            {activeChart === 'followers' && hasEnoughFollowerData && (
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-mono flex items-center space-x-1 border border-slate-900 shadow-2xs ${
                  deltaFollowers > 0
                    ? 'bg-emerald-300 text-slate-950 font-black'
                    : deltaFollowers < 0
                    ? 'bg-rose-300 text-slate-950 font-black'
                    : 'bg-slate-200 text-slate-800 font-bold'
                }`}
              >
                {deltaFollowers > 0 ? (
                  <>
                    <TrendingUp className="w-3 h-3" />
                    <span>+{formatCompactNumber(deltaFollowers)}</span>
                  </>
                ) : deltaFollowers < 0 ? (
                  <>
                    <TrendingDown className="w-3 h-3" />
                    <span>{formatCompactNumber(deltaFollowers)}</span>
                  </>
                ) : (
                  <>
                    <Minus className="w-3 h-3" />
                    <span>0</span>
                  </>
                )}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {activeChart === 'posts'
              ? postMetric === 'views'
                ? 'Sebaran tayangan (views) 10 postingan terkini'
                : postMetric === 'likes'
                ? 'Sebaran suka (likes) 10 postingan terkini'
                : 'Sebaran rasio interaksi 10 postingan terkini'
              : 'Riwayat kurva pengikut sesuai skala TikTok Studio'}
          </p>
        </div>

        {/* Action Controls: Structured and balanced on mobile */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          {/* Main Chart Switcher Pill (Views 10 Video vs Kurva Followers) */}
          <div className="grid grid-cols-2 sm:flex sm:items-center space-x-0 sm:space-x-1 bg-amber-50/80 border-2 border-slate-900 p-1 rounded-2xl shadow-[2px_2px_0px_#0f172a] text-xs">
            <button
              onClick={() => setActiveChart('posts')}
              className={`px-3 py-1.5 rounded-xl font-bold transition text-center ${
                activeChart === 'posts'
                  ? 'bg-slate-950 text-amber-300 font-black shadow-xs'
                  : 'text-slate-700 hover:text-slate-950'
              }`}
            >
              Views 10 Video
            </button>
            <button
              onClick={() => setActiveChart('followers')}
              className={`px-3 py-1.5 rounded-xl font-bold transition text-center ${
                activeChart === 'followers'
                  ? 'bg-slate-950 text-amber-300 font-black shadow-xs'
                  : 'text-slate-700 hover:text-slate-950'
              }`}
            >
              Kurva Followers
            </button>
          </div>

          {/* Sub-Filters */}
          {activeChart === 'followers' ? (
            <div className="grid grid-cols-3 sm:flex sm:items-center space-x-0 sm:space-x-1 bg-amber-50/80 border-2 border-slate-900 p-1 rounded-2xl shadow-[2px_2px_0px_#0f172a] text-xs">
              <button
                onClick={() => setPeriod('7d')}
                className={`px-2.5 py-1 rounded-xl transition text-center ${
                  period === '7d' ? 'bg-[#FFC72C] text-slate-950 font-black border border-slate-900 shadow-2xs' : 'text-slate-700 hover:text-slate-950 font-bold'
                }`}
              >
                7H
              </button>
              <button
                onClick={() => setPeriod('30d')}
                className={`px-2.5 py-1 rounded-xl transition text-center ${
                  period === '30d' ? 'bg-[#FFC72C] text-slate-950 font-black border border-slate-900 shadow-2xs' : 'text-slate-700 hover:text-slate-950 font-bold'
                }`}
              >
                30H
              </button>
              <button
                onClick={() => setPeriod('all')}
                className={`px-2.5 py-1 rounded-xl transition text-center ${
                  period === 'all' ? 'bg-[#FFC72C] text-slate-950 font-black border border-slate-900 shadow-2xs' : 'text-slate-700 hover:text-slate-950 font-bold'
                }`}
              >
                Semua
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:flex sm:items-center space-x-0 sm:space-x-1 bg-amber-50/80 border-2 border-slate-900 p-1 rounded-2xl shadow-[2px_2px_0px_#0f172a] text-xs">
              <button
                onClick={() => setPostMetric('views')}
                className={`px-2.5 py-1 rounded-xl transition text-center ${
                  postMetric === 'views' ? 'bg-[#FFC72C] text-slate-950 font-black border border-slate-900 shadow-2xs' : 'text-slate-700 hover:text-slate-950 font-bold'
                }`}
              >
                Views
              </button>
              <button
                onClick={() => setPostMetric('likes')}
                className={`px-2.5 py-1 rounded-xl transition text-center ${
                  postMetric === 'likes' ? 'bg-[#FFC72C] text-slate-950 font-black border border-slate-900 shadow-2xs' : 'text-slate-700 hover:text-slate-950 font-bold'
                }`}
              >
                Likes
              </button>
              <button
                onClick={() => setPostMetric('engagement')}
                className={`px-2.5 py-1 rounded-xl transition text-center ${
                  postMetric === 'engagement' ? 'bg-[#FFC72C] text-slate-950 font-black border border-slate-900 shadow-2xs' : 'text-slate-700 hover:text-slate-950 font-bold'
                }`}
              >
                ER%
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="py-4">
        {activeChart === 'followers' ? (
          !hasEnoughFollowerData ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
              <Info className="w-7 h-7 text-slate-400 mb-2" />
              <p className="text-sm font-semibold text-slate-700">Belum Cukup Data Grafik</p>
              <p className="text-xs text-slate-400 max-w-sm mt-1">
                Grafik membutuhkan minimal 2 titik pengamatan tersimpan untuk menampilkan kurva pertumbuhan.
              </p>
            </div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={followersData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="followerAreaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="displayDate"
                    stroke="#94a3b8"
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    tickFormatter={(val) => formatCompactNumber(val)}
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    domain={yDomainFollowers}
                    allowDecimals={false}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-white border-2 border-slate-900 p-3 rounded-xl shadow-[3px_3px_0px_#0f172a] text-xs space-y-1">
                            <p className="text-slate-500 font-bold">
                              {formatDateWIB(data.rawDate)}
                            </p>
                            <p className="text-base font-black text-amber-600 font-mono">
                              {formatExactNumber(data.followers)} followers
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="followers"
                    stroke="#f59e0b"
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#f59e0b', stroke: '#0f172a', strokeWidth: 2 }}
                    activeDot={{ r: 6.5, fill: '#ea580c', stroke: '#0f172a', strokeWidth: 2 }}
                    fillOpacity={1}
                    fill="url(#followerAreaGrad)"
                    isAnimationActive={true}
                    animationDuration={700}
                    animationEasing="ease-out"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )
        ) : (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={postsData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="index"
                  stroke="#94a3b8"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#94a3b8"
                  tickFormatter={(val) => (postMetric === 'engagement' ? `${val}%` : formatCompactNumber(val))}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white border-2 border-slate-900 p-3.5 rounded-xl shadow-[3px_3px_0px_#0f172a] text-xs space-y-2 max-w-xs">
                          <p className="font-black text-slate-900 line-clamp-2">
                            {data.fullCaption || 'Tanpa caption'}
                          </p>
                          <div className="pt-2 border-t-2 border-slate-100 space-y-1 font-mono">
                            <div className="flex justify-between text-slate-700">
                              <span className="font-bold">Views:</span>
                              <span className="font-black text-amber-600">{formatExactNumber(data.views)}</span>
                            </div>
                            <div className="flex justify-between text-slate-700">
                              <span className="font-bold">Likes:</span>
                              <span className="font-black text-rose-600">{formatExactNumber(data.likes)}</span>
                            </div>
                            <div className="flex justify-between text-slate-700">
                              <span className="font-bold">Engagement Rate:</span>
                              <span className="font-black text-sky-600">{formatEngagementRate(data.engagement)}</span>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey={postMetric} radius={[6, 6, 0, 0]} isAnimationActive={true} animationDuration={700} animationEasing="ease-out">
                  {postsData.map((_, idx) => (
                    <Cell
                      key={`cell-${idx}`}
                      fill={
                        postMetric === 'likes'
                          ? '#f43f5e'
                          : postMetric === 'engagement'
                          ? '#0ea5e9'
                          : '#f59e0b'
                      }
                      stroke="#0f172a"
                      strokeWidth={1.5}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="text-[11px] text-slate-400 flex items-center justify-between pt-3 border-t border-slate-100">
        <span>*Skala riil TikTok • Zona Waktu: WIB</span>
        <span className="font-medium text-slate-500">
          {activeChart === 'followers' ? '1 Titik = 1 Pengamatan' : 'Urutan #1 = Postingan Paling Baru'}
        </span>
      </div>
    </div>
  );
};
