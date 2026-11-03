import React, { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';
import { BarChart3, Eye, Flame, Heart } from 'lucide-react';
import { PostWithSnapshot } from '../types';
import { formatCompactNumber, formatExactNumber, formatEngagementRate } from '../lib/formatters';

interface PostMetricHistoryChartProps {
  posts: PostWithSnapshot[];
}

export const PostMetricHistoryChart: React.FC<PostMetricHistoryChartProps> = ({ posts }) => {
  const [metric, setMetric] = useState<'views' | 'likes' | 'engagement'>('views');

  if (posts.length === 0) return null;

  // Prepare chart data for top monitored posts (up to 10)
  const chartData = posts.map((p, index) => {
    const shortCaption = p.caption ? p.caption.slice(0, 18) + '...' : `Post #${index + 1}`;
    return {
      index: `#${index + 1}`,
      name: shortCaption,
      fullCaption: p.caption,
      views: p.current_play_count ?? 0,
      likes: p.current_digg_count ?? 0,
      engagement: p.engagement_rate ?? 0,
      isSlideshow: p.is_slideshow,
      isPinned: p.is_pinned,
    };
  });

  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
            Perbandingan Metrik 10 Postingan Terpantau
          </h3>
          <p className="text-xs text-slate-400">
            Sebaran metrik performa tiap postingan pada pengamatan terakhir
          </p>
        </div>

        {/* Metric Switcher */}
        <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setMetric('views')}
            className={`px-3 py-1 rounded-lg font-medium transition flex items-center space-x-1.5 ${
              metric === 'views'
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Views</span>
          </button>
          <button
            onClick={() => setMetric('likes')}
            className={`px-3 py-1 rounded-lg font-medium transition flex items-center space-x-1.5 ${
              metric === 'likes'
                ? 'bg-rose-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Heart className="w-3.5 h-3.5" />
            <span>Likes</span>
          </button>
          <button
            onClick={() => setMetric('engagement')}
            className={`px-3 py-1 rounded-lg font-medium transition flex items-center space-x-1.5 ${
              metric === 'engagement'
                ? 'bg-amber-400 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>ER %</span>
          </button>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis
              dataKey="index"
              stroke="#64748b"
              tick={{ fontSize: 11, fill: '#64748b' }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#64748b"
              tickFormatter={(val) => (metric === 'engagement' ? `${val}%` : formatCompactNumber(val))}
              tick={{ fontSize: 11, fill: '#64748b' }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-slate-950 border border-slate-700/80 p-3 rounded-xl shadow-xl text-xs space-y-1.5 max-w-xs">
                      <p className="font-semibold text-white line-clamp-2">
                        {data.fullCaption || 'Tanpa caption'}
                      </p>
                      <div className="pt-1 border-t border-slate-800 space-y-1 font-mono">
                        <div className="flex justify-between text-slate-300">
                          <span>Views:</span>
                          <span className="font-bold text-emerald-400">{formatExactNumber(data.views)}</span>
                        </div>
                        <div className="flex justify-between text-slate-300">
                          <span>Likes:</span>
                          <span className="font-bold text-rose-400">{formatExactNumber(data.likes)}</span>
                        </div>
                        <div className="flex justify-between text-slate-300">
                          <span>Engagement Rate:</span>
                          <span className="font-bold text-amber-300">{formatEngagementRate(data.engagement)}</span>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey={metric} radius={[6, 6, 0, 0]}>
              {chartData.map((entry, idx) => {
                let fill = '#10b981'; // emerald for views
                if (metric === 'likes') fill = '#f43f5e'; // rose for likes
                if (metric === 'engagement') fill = '#fbbf24'; // amber for ER
                return <Cell key={`cell-${idx}`} fill={fill} />;
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-800/80">
        <span>Urutan #1 adalah postingan terbaru</span>
        <span>Arahkan kursor pada bar untuk melihat caption dan rincian lengkap</span>
      </div>
    </div>
  );
};
