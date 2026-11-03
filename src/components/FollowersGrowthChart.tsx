import React, { useState } from 'react';
import {
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Area,
  AreaChart,
} from 'recharts';
import { Info, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { AccountSnapshot } from '../types';
import { formatCompactNumber, formatExactNumber, formatShortDateWIB, formatDateWIB } from '../lib/formatters';

interface FollowersGrowthChartProps {
  snapshotsHistory: AccountSnapshot[];
}

export const FollowersGrowthChart: React.FC<FollowersGrowthChartProps> = ({ snapshotsHistory }) => {
  const [period, setPeriod] = useState<'7d' | '30d' | 'all'>('all');

  // Filter snapshots based on selected period
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

    // Filter out null or undefined
    return filtered
      .filter((s) => typeof s.fans === 'number')
      .map((s) => ({
        rawDate: s.captured_at,
        displayDate: formatShortDateWIB(s.captured_at),
        followers: s.fans as number,
      }));
  };

  const chartData = filterSnapshots();
  const hasEnoughData = chartData.length >= 2;

  // Calculate overall follower delta
  const startFollowers = chartData[0]?.followers ?? 0;
  const endFollowers = chartData[chartData.length - 1]?.followers ?? 0;
  const deltaFollowers = startFollowers && endFollowers ? endFollowers - startFollowers : 0;

  // Calculate realistic Y domain with padding
  const followerValues = chartData.map((d) => d.followers);
  const minVal = followerValues.length > 0 ? Math.min(...followerValues) : 0;
  const maxVal = followerValues.length > 0 ? Math.max(...followerValues) : 10;
  const valSpread = maxVal - minVal;

  const yDomain: [number, number] =
    valSpread === 0
      ? [Math.max(0, minVal - 2), maxVal + 2]
      : [Math.max(0, Math.floor(minVal - valSpread * 0.15)), Math.ceil(maxVal + valSpread * 0.15)];

  return (
    <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-5 space-y-4">
      {/* Header and Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
              Pertumbuhan Followers
            </h3>
            {hasEnoughData && (
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-mono flex items-center space-x-1 ${
                  deltaFollowers > 0
                    ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/50'
                    : deltaFollowers < 0
                    ? 'bg-rose-950/80 text-rose-400 border border-rose-800/50'
                    : 'bg-slate-800 text-slate-300 border border-slate-700'
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
          <p className="text-xs text-slate-400">
            Riwayat akumulasi pengikut (skala proporsional TikTok Studio)
          </p>
        </div>

        {/* Period Selector */}
        <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setPeriod('7d')}
            className={`px-3 py-1 rounded-lg font-medium transition ${
              period === '7d' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            7 Hari
          </button>
          <button
            onClick={() => setPeriod('30d')}
            className={`px-3 py-1 rounded-lg font-medium transition ${
              period === '30d' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            30 Hari
          </button>
          <button
            onClick={() => setPeriod('all')}
            className={`px-3 py-1 rounded-lg font-medium transition ${
              period === 'all' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Semua
          </button>
        </div>
      </div>

      {/* Chart Canvas */}
      {!hasEnoughData ? (
        <div className="h-60 flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-800 rounded-xl bg-slate-950/40">
          <Info className="w-7 h-7 text-slate-500 mb-2" />
          <p className="text-sm font-medium text-slate-300">Belum Cukup Data Grafik</p>
          <p className="text-xs text-slate-500 max-w-sm mt-1">
            Grafik memerlukan minimal 2 pengamatan tersimpan untuk membentuk garis pertumbuhan.
          </p>
        </div>
      ) : (
        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="followerGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis
                dataKey="displayDate"
                stroke="#64748b"
                tick={{ fontSize: 11, fill: '#64748b' }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#64748b"
                tickFormatter={(val) => formatCompactNumber(val)}
                tick={{ fontSize: 11, fill: '#64748b' }}
                domain={yDomain}
                allowDecimals={false}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-slate-950 border border-slate-700/80 p-2.5 rounded-xl shadow-xl text-xs space-y-1">
                        <p className="text-slate-400 font-medium">
                          {formatDateWIB(data.rawDate)}
                        </p>
                        <p className="text-sm font-bold text-cyan-400 font-mono">
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
                stroke="#06b6d4"
                strokeWidth={2}
                dot={{ r: 3, fill: '#06b6d4', stroke: '#090d16', strokeWidth: 1.5 }}
                activeDot={{ r: 5, fill: '#22d3ee', stroke: '#fff', strokeWidth: 2 }}
                fillOpacity={1}
                fill="url(#followerGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-800/80">
        <span>*Mengikuti skala riil TikTok (bebas dari lonjakan data buatan)</span>
        <span>Zona Waktu: WIB</span>
      </div>
    </div>
  );
};
