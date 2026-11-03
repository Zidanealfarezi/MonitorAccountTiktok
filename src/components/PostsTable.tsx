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
  Search,
  SlidersHorizontal,
} from 'lucide-react';
import { PostWithSnapshot } from '../types';
import { ScrollReveal } from './ScrollReveal';
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
  const [searchQuery, setSearchQuery] = useState('');
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

  // Filter posts by type and search query
  const filteredPosts = posts.filter((p) => {
    if (filterType === 'video' && p.is_slideshow) return false;
    if (filterType === 'slideshow' && !p.is_slideshow) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const caption = (p.caption || '').toLowerCase();
      if (!caption.includes(q)) return false;
    }
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
      <div className="bg-white border border-slate-200/80 rounded-2xl p-8 text-center shadow-xs">
        <p className="text-sm text-slate-500">Belum ada postingan yang tersimpan untuk akun ini.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs card-lift animate-fade-in-up [animation-delay:280ms]">
      {/* Table Header Controls (Matching Boltshift 'Recent orders' + search + sort) */}
      <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              Postingan Terpantau
            </h3>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold font-mono">
              {sortedPosts.length} konten
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Daftar 10 postingan terkini dan pergerakan views antar pengamatan
          </p>
        </div>

        {/* Search, Filter & Sort Controls: Clean & Non-wrapping on Mobile */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-2.5">
          {/* Search Input Pill */}
          <div className="relative w-full sm:w-auto">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari caption..."
              className="pl-9 pr-3.5 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-full sm:w-52 transition"
            />
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            {/* Type Filter Pills */}
            <div className="grid grid-cols-3 sm:flex items-center space-x-0 sm:space-x-1 bg-slate-100 p-1 rounded-full text-xs flex-1 sm:flex-initial">
              <button
                onClick={() => setFilterType('all')}
                className={`px-2.5 py-1 rounded-full font-medium transition text-center ${
                  filterType === 'all'
                    ? 'bg-white text-slate-900 font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Semua
              </button>
              <button
                onClick={() => setFilterType('video')}
                className={`px-2 py-1 rounded-full font-medium transition flex items-center justify-center space-x-1 ${
                  filterType === 'video'
                    ? 'bg-white text-slate-900 font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Video className="w-3 h-3 text-blue-600 shrink-0" />
                <span>Video</span>
              </button>
              <button
                onClick={() => setFilterType('slideshow')}
                className={`px-2 py-1 rounded-full font-medium transition flex items-center justify-center space-x-1 ${
                  filterType === 'slideshow'
                    ? 'bg-white text-slate-900 font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ImageIcon className="w-3 h-3 text-indigo-600 shrink-0" />
                <span>Slide</span>
              </button>
            </div>

            {/* Sort Dropdown */}
            <div className="relative inline-flex items-center shrink-0">
              <select
                value={sortField}
                onChange={(e) => setSortField(e.target.value as SortField)}
                className="appearance-none pl-3 pr-7 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
              >
                <option value="date">Urut: Tanggal</option>
                <option value="views">Urut: Views</option>
                <option value="likes">Urut: Likes</option>
                <option value="comments">Urut: Komentar</option>
                <option value="er">Urut: ER%</option>
              </select>
              <SlidersHorizontal className="w-3 h-3 text-slate-400 absolute right-2.5 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* 1. Mobile Card List (Dedicated for Mobile Screens - Clean, Compact, No Dragging) */}
      <div className="block sm:hidden divide-y divide-slate-100">
        {sortedPosts.map((post, idx) => {
          const viewsGrowth = formatGrowth(post.views_growth);
          const likesGrowth = formatGrowth(post.likes_growth);

          return (
            <ScrollReveal
              key={post.id}
              direction="up"
              distance={16}
              duration={450}
              delay={Math.min(idx * 35, 180)}
              className="p-4 space-y-3 hover:bg-slate-50/60 transition"
            >
              {/* Header: Thumbnail + Badges + Date + Direct Link */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start space-x-3 min-w-0">
                  <div className="relative w-12 h-16 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-200/80">
                    {post.cover_url ? (
                      <img
                        src={post.cover_url}
                        alt="Cover"
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        {post.is_slideshow ? (
                          <ImageIcon className="w-5 h-5 text-indigo-400" />
                        ) : (
                          <Video className="w-5 h-5 text-blue-500" />
                        )}
                      </div>
                    )}
                    <div className="absolute bottom-1 right-1 bg-slate-900/80 text-white rounded px-1 text-[8px] font-semibold backdrop-blur-xs">
                      {post.is_slideshow ? 'Slide' : 'Video'}
                    </div>
                  </div>

                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                      {post.is_pinned && (
                        <span className="inline-flex items-center space-x-0.5 px-1.5 py-0.2 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                          <Pin className="w-2.5 h-2.5 fill-amber-500" />
                          <span>Disematkan</span>
                        </span>
                      )}
                      <span className="text-[10px] text-slate-400 font-mono">
                        {formatShortDateWIB(post.create_time_iso)} • {formatDateWIB(post.create_time_iso).split(' ')[3]} WIB
                      </span>
                    </div>

                    <p className="text-xs text-slate-800 line-clamp-2 leading-relaxed font-medium">
                      {post.caption || <span className="italic text-slate-400">Tanpa caption</span>}
                    </p>
                  </div>
                </div>

                {/* Direct Link Icon */}
                <a
                  href={post.web_video_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 p-2 rounded-full bg-slate-100 hover:bg-blue-600 text-slate-600 hover:text-white transition shadow-2xs hover:scale-110 active:scale-95 cursor-pointer"
                  title="Buka di TikTok"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* 4-Stat Mobile Metrics Grid */}
              <div className="grid grid-cols-4 gap-1.5 bg-slate-50/80 rounded-xl p-2.5 border border-slate-100 text-center">
                {/* Views */}
                <div>
                  <div className="text-[10px] text-slate-400 flex items-center justify-center space-x-0.5">
                    <Eye className="w-2.5 h-2.5 text-blue-600" />
                    <span>Views</span>
                  </div>
                  <div className="text-xs font-bold text-slate-900 font-mono mt-0.5">
                    {formatCompactNumber(post.current_play_count)}
                  </div>
                  {post.views_growth !== null && post.views_growth !== undefined && viewsGrowth.isPositive && (
                    <div className="text-[9px] font-semibold text-emerald-600 font-mono">
                      {viewsGrowth.text}
                    </div>
                  )}
                </div>

                {/* Likes */}
                <div>
                  <div className="text-[10px] text-slate-400 flex items-center justify-center space-x-0.5">
                    <Heart className="w-2.5 h-2.5 text-rose-500" />
                    <span>Likes</span>
                  </div>
                  <div className="text-xs font-bold text-slate-900 font-mono mt-0.5">
                    {formatCompactNumber(post.current_digg_count)}
                  </div>
                  {post.likes_growth !== null && post.likes_growth !== undefined && likesGrowth.isPositive && (
                    <div className="text-[9px] font-semibold text-rose-600 font-mono">
                      {likesGrowth.text}
                    </div>
                  )}
                </div>

                {/* Komentar */}
                <div>
                  <div className="text-[10px] text-slate-400 flex items-center justify-center space-x-0.5">
                    <MessageCircle className="w-2.5 h-2.5 text-slate-500" />
                    <span>Komen</span>
                  </div>
                  <div className="text-xs font-bold text-slate-700 font-mono mt-0.5">
                    {formatCompactNumber(post.current_comment_count)}
                  </div>
                </div>

                {/* ER% */}
                <div>
                  <div className="text-[10px] text-blue-600 font-semibold">
                    <span>ER%</span>
                  </div>
                  <div className="text-xs font-bold text-blue-600 font-mono mt-0.5">
                    {formatEngagementRate(post.engagement_rate)}
                  </div>
                </div>
              </div>
            </ScrollReveal>
          );
        })}
      </div>

      {/* 2. Desktop Table Content (Full 8 Columns) */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50/70 text-slate-500 uppercase tracking-wider border-b border-slate-100 text-[11px]">
            <tr>
              <th className="py-3 px-5 font-semibold">Postingan & Caption</th>
              <th className="py-3 px-3 font-semibold">
                <button
                  onClick={() => toggleSort('date')}
                  className="flex items-center space-x-1 hover:text-slate-900 transition"
                >
                  <span>Tanggal Unggah</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </button>
              </th>
              <th className="py-3 px-3 font-semibold text-right">
                <button
                  onClick={() => toggleSort('views')}
                  className="inline-flex items-center space-x-1 hover:text-slate-900 transition ml-auto"
                >
                  <Eye className="w-3 h-3 text-blue-600" />
                  <span>Views</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </button>
              </th>
              <th className="py-3 px-3 font-semibold text-right">
                <button
                  onClick={() => toggleSort('likes')}
                  className="inline-flex items-center space-x-1 hover:text-slate-900 transition ml-auto"
                >
                  <Heart className="w-3 h-3 text-rose-500" />
                  <span>Likes</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </button>
              </th>
              <th className="py-3 px-3 font-semibold text-right">
                <button
                  onClick={() => toggleSort('comments')}
                  className="inline-flex items-center space-x-1 hover:text-slate-900 transition ml-auto"
                >
                  <MessageCircle className="w-3 h-3 text-slate-500" />
                  <span>Komentar</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </button>
              </th>
              <th className="py-3 px-3 font-semibold text-right">
                <button
                  onClick={() => toggleSort('shares')}
                  className="inline-flex items-center space-x-1 hover:text-slate-900 transition ml-auto"
                >
                  <Share2 className="w-3 h-3 text-slate-500" />
                  <span>Share</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </button>
              </th>
              <th className="py-3 px-3 font-semibold text-right">
                <button
                  onClick={() => toggleSort('er')}
                  className="inline-flex items-center space-x-1 hover:text-slate-900 transition ml-auto"
                >
                  <span>ER (Views)</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </button>
              </th>
              <th className="py-3 px-4 font-semibold text-center">Tautan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-sans">
            {sortedPosts.map((post, idx) => {
              const viewsGrowth = formatGrowth(post.views_growth);
              const likesGrowth = formatGrowth(post.likes_growth);

              return (
                <tr
                  key={post.id}
                  className="hover:bg-blue-50/50 hover:shadow-2xs transition-all duration-200 group"
                  style={{
                    animation: `fadeInUp 0.45s cubic-bezier(0.16, 1, 0.3, 1) both`,
                    animationDelay: `${Math.min(idx * 40, 400)}ms`,
                  }}
                >
                  {/* Caption & Thumbnail */}
                  <td className="py-3.5 px-5 max-w-sm">
                    <div className="flex items-start space-x-3">
                      {/* Cover image */}
                      <div className="relative w-12 h-16 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-200/80">
                        {post.cover_url ? (
                          <img
                            src={post.cover_url}
                            alt="Cover"
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400">
                            {post.is_slideshow ? (
                              <ImageIcon className="w-5 h-5 text-indigo-400" />
                            ) : (
                              <Video className="w-5 h-5 text-blue-500" />
                            )}
                          </div>
                        )}
                        {/* Type Badge */}
                        <div className="absolute bottom-1 right-1 bg-slate-900/80 text-white rounded px-1 text-[9px] font-semibold backdrop-blur-xs">
                          {post.is_slideshow ? 'Slide' : 'Video'}
                        </div>
                      </div>

                      {/* Content metadata */}
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center space-x-1.5 flex-wrap">
                          {post.is_pinned && (
                            <span className="inline-flex items-center space-x-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                              <Pin className="w-2.5 h-2.5 fill-amber-500" />
                              <span>Disematkan</span>
                            </span>
                          )}
                          <span
                            className={`inline-flex items-center space-x-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium ${
                              post.is_slideshow
                                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                : 'bg-blue-50 text-blue-700 border border-blue-200'
                            }`}
                          >
                            {post.is_slideshow ? 'Foto / Slideshow' : 'Video'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-800 line-clamp-2 leading-relaxed font-medium">
                          {post.caption || <span className="italic text-slate-400">Tanpa caption</span>}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Upload Date in WIB */}
                  <td className="py-3.5 px-3 text-slate-600 whitespace-nowrap">
                    <div className="font-medium">{formatShortDateWIB(post.create_time_iso)}</div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {formatDateWIB(post.create_time_iso).split(' ')[3]} WIB
                    </div>
                  </td>

                  {/* Views + Delta */}
                  <td className="py-3.5 px-3 text-right font-mono whitespace-nowrap">
                    <div className="font-bold text-slate-900">
                      {formatCompactNumber(post.current_play_count)}
                    </div>
                    {post.views_growth !== null && post.views_growth !== undefined && (
                      <div
                        className={`text-[10px] font-semibold flex items-center justify-end space-x-0.5 ${
                          viewsGrowth.isPositive ? 'text-emerald-600' : 'text-slate-400'
                        }`}
                      >
                        {viewsGrowth.isPositive && <TrendingUp className="w-2.5 h-2.5" />}
                        <span>{viewsGrowth.text}</span>
                      </div>
                    )}
                  </td>

                  {/* Likes + Delta */}
                  <td className="py-3.5 px-3 text-right font-mono whitespace-nowrap">
                    <div className="font-bold text-slate-900">
                      {formatCompactNumber(post.current_digg_count)}
                    </div>
                    {post.likes_growth !== null && post.likes_growth !== undefined && (
                      <div
                        className={`text-[10px] font-semibold flex items-center justify-end space-x-0.5 ${
                          likesGrowth.isPositive ? 'text-rose-600' : 'text-slate-400'
                        }`}
                      >
                        {likesGrowth.isPositive && <TrendingUp className="w-2.5 h-2.5" />}
                        <span>{likesGrowth.text}</span>
                      </div>
                    )}
                  </td>

                  {/* Comments */}
                  <td className="py-3.5 px-3 text-right font-mono text-slate-600 whitespace-nowrap">
                    {formatCompactNumber(post.current_comment_count)}
                  </td>

                  {/* Shares */}
                  <td className="py-3.5 px-3 text-right font-mono text-slate-600 whitespace-nowrap">
                    {formatCompactNumber(post.current_share_count)}
                  </td>

                  {/* Engagement Rate */}
                  <td className="py-3.5 px-3 text-right font-mono font-bold text-blue-600 whitespace-nowrap">
                    {formatEngagementRate(post.engagement_rate)}
                  </td>

                  {/* TikTok Direct Link */}
                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    <a
                      href={post.web_video_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center p-2 rounded-full bg-slate-100 hover:bg-blue-600 text-slate-600 hover:text-white transition shadow-2xs"
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
