import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Area,
  AreaChart,
} from 'recharts';
import { TrendingUp, Calendar, Info } from 'lucide-react';
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

    return filtered.map((s) => ({
      rawDate: s.captured_at,
      displayDate: formatShortDateWIB(s.captured_at),
      followers: s.fans,
      likes: s.heart,
    }));
  };

  const chartData = filterSnapshots();
  const hasEnoughData = chartData.length >= 2;

  // Calculate overall follower delta in the chart range
  const startFollowers = chartData[0]?.followers ?? 0;
  const endFollowers = chartData[chartData.length - 1]?.followers ?? 0;
  const deltaFollowers = startFollowers && endFollowers ? endFollowers - startFollowers : 0;

  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-4">
      {/* Header and Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
              Grafik Pertumbuhan Followers
            </h3>
            {hasEnoughData && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800/60 font-mono">
                {deltaFollowers >= 0 ? `+${formatCompactNumber(deltaFollowers)}` : formatCompactNumber(deltaFollowers)}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400">
            Riwayat akumulasi pengikut berdasarkan pengamatan tersimpan
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
        <div className="h-64 flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-800 rounded-xl bg-slate-950/40">
          <Info className="w-8 h-8 text-slate-500 mb-2" />
          <p className="text-sm font-medium text-slate-300">Belum Cukup Data Grafik</p>
          <p className="text-xs text-slate-500 max-w-sm mt-1">
            Grafik pertumbuhan memerlukan minimal 2 pengamatan tersimpan. Data akan terbentuk seiring pengambilan berikutnya.
          </p>
        </div>
      ) : (
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="followerGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
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
                domain={['auto', 'auto']}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-slate-950 border border-slate-700/80 p-3 rounded-xl shadow-xl text-xs space-y-1">
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
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#followerGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-800/80">
        <span>*Dimulai dari pengamatan pertama yang tersimpan</span>
        <span>Zona Waktu: Asia/Jakarta (WIB)</span>
      </div>
    </div>
  );
};
