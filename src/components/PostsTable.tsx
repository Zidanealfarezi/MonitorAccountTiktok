import React, { useState } from 'react';
import {
  ExternalLink,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  Pin,
  Image as ImageIcon,
  Video,
  ArrowUpDown,
  TrendingUp,
  Filter,
} from 'lucide-react';
import { PostWithSnapshot } from '../types';
import {
  formatCompactNumber,
  formatExactNumber,
  formatDateWIB,
  formatShortDateWIB,
  formatEngagementRate,
  formatGrowth,
} from '../lib/formatters';

interface PostsTableProps {
  posts: PostWithSnapshot[];
}

type SortField = 'date' | 'views' | 'likes' | 'comments' | 'shares' | 'er';
type ContentFilter = 'all' | 'video' | 'slideshow';

export const PostsTable: React.FC<PostsTableProps> = ({ posts }) => {
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [filterType, setFilterType] = useState<ContentFilter>('all');

  // Handle Sort Toggle
  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  // Filter posts
  const filteredPosts = posts.filter((p) => {
    if (filterType === 'video') return !p.is_slideshow;
    if (filterType === 'slideshow') return p.is_slideshow;
    return true;
  });

  // Sort posts
  const sortedPosts = [...filteredPosts].sort((a, b) => {
    let aVal = 0;
    let bVal = 0;

    switch (sortField) {
      case 'date':
        aVal = new Date(a.create_time_iso).getTime();
        bVal = new Date(b.create_time_iso).getTime();
        break;
      case 'views':
        aVal = a.current_play_count ?? -1;
        bVal = b.current_play_count ?? -1;
        break;
      case 'likes':
        aVal = a.current_digg_count ?? -1;
        bVal = b.current_digg_count ?? -1;
        break;
      case 'comments':
        aVal = a.current_comment_count ?? -1;
        bVal = b.current_comment_count ?? -1;
        break;
      case 'shares':
        aVal = a.current_share_count ?? -1;
        bVal = b.current_share_count ?? -1;
        break;
      case 'er':
        aVal = a.engagement_rate ?? -1;
        bVal = b.engagement_rate ?? -1;
        break;
    }

    return sortOrder === 'desc' ? bVal - aVal : aVal - bVal;
  });

  if (posts.length === 0) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 text-center">
        <p className="text-sm text-slate-400">Belum ada postingan yang tersimpan untuk akun ini.</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-2xl overflow-hidden space-y-4">
      {/* Table Header Controls */}
      <div className="p-4 sm:p-5 border-b border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
              Tabel Performa Postingan Terpantau ({sortedPosts.length})
            </h3>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
              Maks. 10 Terakhir
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Pertumbuhan views dihitung spesifik per ID postingan dari pengamatan sebelumnya
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 rounded-lg font-medium transition ${
                filterType === 'all'
                  ? 'bg-slate-800 text-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => setFilterType('video')}
              className={`px-3 py-1 rounded-lg font-medium transition flex items-center space-x-1 ${
                filterType === 'video'
                  ? 'bg-slate-800 text-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Video className="w-3 h-3 text-cyan-400" />
              <span>Video</span>
            </button>
            <button
              onClick={() => setFilterType('slideshow')}
              className={`px-3 py-1 rounded-lg font-medium transition flex items-center space-x-1 ${
                filterType === 'slideshow'
                  ? 'bg-slate-800 text-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ImageIcon className="w-3 h-3 text-amber-400" />
              <span>Foto/Slide</span>
            </button>
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider border-b border-slate-800 text-[11px]">
            <tr>
              <th className="py-3.5 px-4 font-semibold">Postingan & Caption</th>
              <th className="py-3.5 px-3 font-semibold">
                <button
                  onClick={() => toggleSort('date')}
                  className="flex items-center space-x-1 hover:text-slate-200 transition"
                >
                  <span>Tanggal Unggah (WIB)</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </button>
              </th>
              <th className="py-3.5 px-3 font-semibold text-right">
                <button
                  onClick={() => toggleSort('views')}
                  className="inline-flex items-center space-x-1 hover:text-slate-200 transition ml-auto"
                >
                  <Eye className="w-3 h-3 text-emerald-400" />
                  <span>Views</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </button>
              </th>
              <th className="py-3.5 px-3 font-semibold text-right">
                <button
                  onClick={() => toggleSort('likes')}
                  className="inline-flex items-center space-x-1 hover:text-slate-200 transition ml-auto"
                >
                  <Heart className="w-3 h-3 text-rose-400" />
                  <span>Likes</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </button>
              </th>
              <th className="py-3.5 px-3 font-semibold text-right">
                <button
                  onClick={() => toggleSort('comments')}
                  className="inline-flex items-center space-x-1 hover:text-slate-200 transition ml-auto"
                >
                  <MessageCircle className="w-3 h-3 text-cyan-400" />
                  <span>Komentar</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </button>
              </th>
              <th className="py-3.5 px-3 font-semibold text-right">
                <button
                  onClick={() => toggleSort('shares')}
                  className="inline-flex items-center space-x-1 hover:text-slate-200 transition ml-auto"
                >
                  <Share2 className="w-3 h-3 text-indigo-400" />
                  <span>Share</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </button>
              </th>
              <th className="py-3.5 px-3 font-semibold text-right">
                <button
                  onClick={() => toggleSort('er')}
                  className="inline-flex items-center space-x-1 hover:text-slate-200 transition ml-auto"
                >
                  <span>ER (Views)</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </button>
              </th>
              <th className="py-3.5 px-4 font-semibold text-center">Tautan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-sans">
            {sortedPosts.map((post) => {
              const viewsGrowth = formatGrowth(post.views_growth);
              const likesGrowth = formatGrowth(post.likes_growth);

              return (
                <tr key={post.id} className="hover:bg-slate-800/40 transition">
                  {/* Caption & Thumbnail */}
                  <td className="py-3.5 px-4 max-w-sm">
                    <div className="flex items-start space-x-3">
                      {/* Cover image or placeholder */}
                      <div className="relative w-12 h-16 rounded-lg overflow-hidden bg-slate-800 flex-shrink-0 border border-slate-700/60">
                        {post.cover_url ? (
                          <img
                            src={post.cover_url}
                            alt="Cover"
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-500">
                            {post.is_slideshow ? (
                              <ImageIcon className="w-5 h-5 text-amber-400" />
                            ) : (
                              <Video className="w-5 h-5 text-cyan-400" />
                            )}
                          </div>
                        )}
                        {/* Type Badge */}
                        <div className="absolute bottom-1 right-1 bg-slate-950/90 rounded px-1 text-[9px] font-semibold">
                          {post.is_slideshow ? 'Slide' : 'Video'}
                        </div>
                      </div>

                      {/* Content metadata */}
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center space-x-1.5 flex-wrap">
                          {post.is_pinned && (
                            <span className="inline-flex items-center space-x-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-950/80 text-amber-400 border border-amber-800/50">
                              <Pin className="w-2.5 h-2.5 fill-amber-400" />
                              <span>Disematkan</span>
                            </span>
                          )}
                          <span
                            className={`inline-flex items-center space-x-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium ${
                              post.is_slideshow
                                ? 'bg-amber-950/60 text-amber-300 border border-amber-800/40'
                                : 'bg-cyan-950/60 text-cyan-300 border border-cyan-800/40'
                            }`}
                          >
                            {post.is_slideshow ? 'Foto / Slideshow' : 'Video'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-200 line-clamp-2 leading-relaxed">
                          {post.caption || <span className="italic text-slate-500">Tanpa caption</span>}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Upload Date in WIB */}
                  <td className="py-3.5 px-3 text-slate-400 whitespace-nowrap">
                    <div>{formatShortDateWIB(post.create_time_iso)}</div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      {formatDateWIB(post.create_time_iso).split(' ')[3]} WIB
                    </div>
                  </td>

                  {/* Views + Delta */}
                  <td className="py-3.5 px-3 text-right font-mono whitespace-nowrap">
                    <div className="font-semibold text-slate-100">
                      {formatCompactNumber(post.current_play_count)}
                    </div>
                    {post.views_growth !== null && post.views_growth !== undefined && (
                      <div
                        className={`text-[10px] font-semibold flex items-center justify-end space-x-0.5 ${
                          viewsGrowth.isPositive ? 'text-emerald-400' : 'text-slate-500'
                        }`}
                      >
                        {viewsGrowth.isPositive && <TrendingUp className="w-2.5 h-2.5" />}
                        <span>{viewsGrowth.text}</span>
                      </div>
                    )}
                  </td>

                  {/* Likes + Delta */}
                  <td className="py-3.5 px-3 text-right font-mono whitespace-nowrap">
                    <div className="font-semibold text-slate-100">
                      {formatCompactNumber(post.current_digg_count)}
                    </div>
                    {post.likes_growth !== null && post.likes_growth !== undefined && (
                      <div
                        className={`text-[10px] font-semibold flex items-center justify-end space-x-0.5 ${
                          likesGrowth.isPositive ? 'text-rose-400' : 'text-slate-500'
                        }`}
                      >
                        {likesGrowth.isPositive && <TrendingUp className="w-2.5 h-2.5" />}
                        <span>{likesGrowth.text}</span>
                      </div>
                    )}
                  </td>

                  {/* Comments */}
                  <td className="py-3.5 px-3 text-right font-mono text-slate-300 whitespace-nowrap">
                    {formatCompactNumber(post.current_comment_count)}
                  </td>

                  {/* Shares */}
                  <td className="py-3.5 px-3 text-right font-mono text-slate-300 whitespace-nowrap">
                    {formatCompactNumber(post.current_share_count)}
                  </td>

                  {/* Engagement Rate */}
                  <td className="py-3.5 px-3 text-right font-mono font-semibold text-amber-300 whitespace-nowrap">
                    {formatEngagementRate(post.engagement_rate)}
                  </td>

                  {/* TikTok Direct Link */}
                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    <a
                      href={post.web_video_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center p-2 rounded-lg bg-slate-800 hover:bg-cyan-500 text-slate-300 hover:text-slate-950 transition"
                      title="Buka postingan langsung di TikTok"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
