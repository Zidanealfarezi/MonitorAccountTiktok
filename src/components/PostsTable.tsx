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
  Flame,
  Sparkles,
  LayoutGrid,
  Table as TableIcon,
  Play,
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
  title?: string;
  subtitle?: string;
}

type SortField = 'date' | 'views' | 'likes' | 'comments' | 'shares' | 'er';
type ContentFilter = 'all' | 'video' | 'slideshow';

interface PostCoverThumbnailProps {
  coverUrl?: string | null;
  isSlideshow?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const PostCoverThumbnail: React.FC<PostCoverThumbnailProps> = ({
  coverUrl,
  isSlideshow,
  className = '',
  size = 'sm',
}) => {
  const [stage, setStage] = useState<'direct' | 'proxy' | 'fallback'>('direct');

  const sizeClasses = {
    sm: 'w-12 h-16',
    md: 'w-14 h-20',
    lg: 'w-full h-44',
  }[size];

  // If no cover URL provided or image stages failed, render graceful Saweria card
  if (!coverUrl || stage === 'fallback') {
    return (
      <div
        className={`relative ${sizeClasses} rounded-xl overflow-hidden bg-slate-900 shrink-0 border-2 border-slate-900 shadow-[2px_2px_0px_#0f172a] flex flex-col items-center justify-center p-2 select-none ${className}`}
        title={isSlideshow ? 'Postingan Foto / Slideshow' : 'Postingan Video TikTok'}
      >
        <div className="w-7 h-7 rounded-lg bg-[#FFC72C] text-slate-950 flex items-center justify-center shadow-xs">
          {isSlideshow ? (
            <ImageIcon className="w-4 h-4" />
          ) : (
            <Play className="w-4 h-4 fill-slate-950 ml-0.5" />
          )}
        </div>
        <div className="absolute bottom-1 right-1 bg-slate-950 text-amber-300 rounded px-1 text-[8px] font-black border border-slate-900">
          {isSlideshow ? 'Slide' : 'Video'}
        </div>
      </div>
    );
  }

  // Attempt direct with no-referrer first, fallback to Cloudflare /api/image-proxy
  const imageSrc = stage === 'direct'
    ? coverUrl
    : `/api/image-proxy?url=${encodeURIComponent(coverUrl)}`;

  return (
    <div className={`relative ${sizeClasses} rounded-xl overflow-hidden bg-slate-100 shrink-0 border-2 border-slate-900 shadow-[2px_2px_0px_#0f172a] ${className}`}>
      <img
        src={imageSrc}
        alt=""
        referrerPolicy="no-referrer"
        crossOrigin="anonymous"
        className="w-full h-full object-cover"
        loading="lazy"
        onError={() => {
          if (stage === 'direct') {
            setStage('proxy');
          } else {
            setStage('fallback');
          }
        }}
      />
      <div className="absolute bottom-1 right-1 bg-slate-950 text-amber-300 rounded px-1 text-[8px] font-black border border-slate-900">
        {isSlideshow ? 'Slide' : 'Video'}
      </div>
    </div>
  );
};

export const PostsTable: React.FC<PostsTableProps> = ({
  posts,
  title = '10 Postingan Terbaru',
  subtitle = 'Daftar 10 postingan terkini dan pergerakan views antar pengamatan',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [filterType, setFilterType] = useState<ContentFilter>('all');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Strictly enforce 10 latest posts
  const maxTenPosts = posts.slice(0, 10);

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
  const filteredPosts = maxTenPosts.filter((p) => {
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
      <div id="postingan-terbaru" className="bg-white border-2 border-slate-900 rounded-3xl p-8 text-center shadow-[4px_4px_0px_#0f172a]">
        <p className="text-sm font-bold text-slate-600">Belum ada postingan yang tersimpan untuk akun ini.</p>
      </div>
    );
  }

  return (
    <div id="postingan-terbaru" className="bg-white border-2 border-slate-900 rounded-3xl overflow-hidden shadow-[5px_5px_0px_#0f172a] card-lift animate-fade-in-up [animation-delay:280ms]">
      {/* Table Header Controls (Saweria Neo-Brutal Pop Style) */}
      <div className="p-4 sm:p-6 border-b-2 border-slate-900 bg-white flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
              {title}
            </h3>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#FFC72C] text-slate-950 font-black border border-slate-900 shadow-2xs rotate-[-1deg]">
              {sortedPosts.length} Konten
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            {subtitle}
          </p>
        </div>

        {/* Search, Filter & Sort Controls: Saweria Pop Pills */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-2.5">
          {/* Search Input Pill */}
          <div className="relative w-full sm:w-auto">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari caption..."
              className="pl-9 pr-3.5 py-2 rounded-2xl bg-white border-2 border-slate-900 text-xs font-bold text-slate-900 placeholder-slate-400 focus:outline-hidden focus:bg-amber-50/50 shadow-[2px_2px_0px_#0f172a] w-full sm:w-48 transition"
            />
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            {/* Type Filter Pills */}
            <div className="grid grid-cols-3 sm:flex items-center space-x-0 sm:space-x-1 bg-amber-50/80 border-2 border-slate-900 p-1 rounded-2xl shadow-[2px_2px_0px_#0f172a] text-xs font-bold flex-1 sm:flex-initial">
              <button
                onClick={() => setFilterType('all')}
                className={`px-3 py-1.5 rounded-xl transition text-center cursor-pointer ${
                  filterType === 'all'
                    ? 'bg-slate-950 text-amber-300 font-black shadow-xs'
                    : 'text-slate-700 hover:text-slate-950'
                }`}
              >
                Semua
              </button>
              <button
                onClick={() => setFilterType('video')}
                className={`px-2.5 py-1.5 rounded-xl transition flex items-center justify-center space-x-1 cursor-pointer ${
                  filterType === 'video'
                    ? 'bg-slate-950 text-amber-300 font-black shadow-xs'
                    : 'text-slate-700 hover:text-slate-950'
                }`}
              >
                <Video className="w-3 h-3 text-sky-400 shrink-0" />
                <span>Video</span>
              </button>
              <button
                onClick={() => setFilterType('slideshow')}
                className={`px-2.5 py-1.5 rounded-xl transition flex items-center justify-center space-x-1 cursor-pointer ${
                  filterType === 'slideshow'
                    ? 'bg-slate-950 text-amber-300 font-black shadow-xs'
                    : 'text-slate-700 hover:text-slate-950'
                }`}
              >
                <ImageIcon className="w-3 h-3 text-amber-300 shrink-0" />
                <span>Slide</span>
              </button>
            </div>

            {/* Sort Dropdown */}
            <div className="relative inline-flex items-center shrink-0">
              <select
                value={sortField}
                onChange={(e) => setSortField(e.target.value as SortField)}
                className="appearance-none pl-3 pr-7 py-2 rounded-2xl bg-white border-2 border-slate-900 text-xs font-black text-slate-900 shadow-[2px_2px_0px_#0f172a] focus:outline-hidden cursor-pointer"
              >
                <option value="date">Urut: Tanggal</option>
                <option value="views">Urut: Views</option>
                <option value="likes">Urut: Likes</option>
                <option value="comments">Urut: Komentar</option>
                <option value="er">Urut: ER%</option>
              </select>
              <SlidersHorizontal className="w-3 h-3 text-slate-600 absolute right-2.5 pointer-events-none" />
            </div>

            {/* View Mode Switcher (Grid vs Table) */}
            <div className="hidden sm:inline-flex items-center bg-amber-50/80 border-2 border-slate-900 p-1 rounded-2xl shadow-[2px_2px_0px_#0f172a] text-xs">
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-xl transition cursor-pointer ${
                  viewMode === 'table' ? 'bg-slate-950 text-amber-300 shadow-xs' : 'text-slate-700 hover:text-slate-950'
                }`}
                title="Tampilan Tabel"
              >
                <TableIcon className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-xl transition cursor-pointer ${
                  viewMode === 'grid' ? 'bg-slate-950 text-amber-300 shadow-xs' : 'text-slate-700 hover:text-slate-950'
                }`}
                title="Tampilan Grid Visual"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Mode View (Visual Creator Grid) */}
      {viewMode === 'grid' && (
        <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 bg-amber-50/20">
          {sortedPosts.map((post) => {
            const viewsGrowth = formatGrowth(post.views_growth);
            return (
              <div
                key={post.id}
                className="bg-white border-2 border-slate-900 rounded-2xl overflow-hidden shadow-[3px_3px_0px_#0f172a] hover:shadow-[4px_4px_0px_#0f172a] hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between group"
              >
                <div className="relative">
                  <PostCoverThumbnail
                    coverUrl={post.cover_url}
                    isSlideshow={post.is_slideshow}
                    size="lg"
                  />
                  {/* Views Pill Overlay */}
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded-lg bg-slate-950/80 backdrop-blur-xs text-white text-[10px] font-mono font-black border border-white/20 flex items-center space-x-1">
                    <Eye className="w-3 h-3 text-[#FFC72C]" />
                    <span>{formatCompactNumber(post.current_play_count)}</span>
                  </div>

                  {/* Direct Link Button */}
                  <a
                    href={post.web_video_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-[#FFC72C] hover:bg-[#FFB800] text-slate-950 border border-slate-900 shadow-2xs hover:scale-105 active:scale-95 transition"
                    title="Tonton di TikTok"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="p-3 space-y-2 flex-1 flex flex-col justify-between">
                  <p className="text-xs text-slate-900 font-bold line-clamp-2 leading-snug">
                    {post.caption || <span className="italic text-slate-400 font-normal">Tanpa caption</span>}
                  </p>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono font-bold">
                    <div className="flex items-center space-x-1 text-rose-600">
                      <Heart className="w-3 h-3 fill-rose-500" />
                      <span>{formatCompactNumber(post.current_digg_count)}</span>
                    </div>
                    <div className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-slate-900 text-[10px] font-black">
                      {formatEngagementRate(post.engagement_rate)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 1. Mobile Card List (Dedicated for Mobile Screens - Saweria Card Style) */}
      <div className={`block sm:hidden p-3 space-y-3 bg-amber-50/20 ${viewMode === 'grid' ? 'hidden' : ''}`}>
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
              className="p-3.5 bg-white border-2 border-slate-900 rounded-2xl shadow-[3px_3px_0px_#0f172a] space-y-3"
            >
              {/* Header: Thumbnail + Badges + Date + Direct Link */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start space-x-3 min-w-0">
                  <PostCoverThumbnail
                    coverUrl={post.cover_url}
                    isSlideshow={post.is_slideshow}
                    size="sm"
                  />

                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                      {post.is_pinned && (
                        <span className="inline-flex items-center space-x-0.5 px-1.5 py-0.5 rounded text-[10px] font-black bg-amber-200 text-slate-950 border border-slate-900 shadow-2xs">
                          <Pin className="w-2.5 h-2.5 fill-slate-950" />
                          <span>Disematkan</span>
                        </span>
                      )}
                      <span className="text-[10px] text-slate-500 font-mono font-bold">
                        {formatShortDateWIB(post.create_time_iso)} • {formatDateWIB(post.create_time_iso).split(' ')[3]} WIB
                      </span>
                    </div>

                    <p className="text-xs text-slate-900 line-clamp-2 leading-relaxed font-bold">
                      {post.caption || <span className="italic text-slate-400 font-normal">Tanpa caption</span>}
                    </p>
                  </div>
                </div>

                {/* Direct Link Icon - Saweria Golden Button */}
                <a
                  href={post.web_video_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 p-2 rounded-xl bg-[#FFC72C] hover:bg-[#FFB800] text-slate-950 border-2 border-slate-900 shadow-[2px_2px_0px_#0f172a] hover:shadow-[3px_3px_0px_#0f172a] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition cursor-pointer"
                  title="Buka di TikTok"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* 4-Stat Mobile Metrics Grid (Saweria Coin Boxes) */}
              <div className="grid grid-cols-4 gap-1.5 bg-amber-50/70 rounded-xl p-2.5 border-2 border-slate-900 shadow-[2px_2px_0px_#0f172a] text-center">
                {/* Views */}
                <div>
                  <div className="text-[10px] text-slate-600 font-bold flex items-center justify-center space-x-0.5">
                    <Eye className="w-2.5 h-2.5 text-amber-700" />
                    <span>Views</span>
                  </div>
                  <div className="text-xs font-black text-slate-950 font-mono mt-0.5">
                    {formatCompactNumber(post.current_play_count)}
                  </div>
                  {post.views_growth !== null && post.views_growth !== undefined && viewsGrowth.isPositive && (
                    <div className="text-[9px] font-black text-emerald-700 font-mono">
                      {viewsGrowth.text}
                    </div>
                  )}
                </div>

                {/* Likes */}
                <div>
                  <div className="text-[10px] text-slate-600 font-bold flex items-center justify-center space-x-0.5">
                    <Heart className="w-2.5 h-2.5 text-rose-500 fill-rose-500" />
                    <span>Likes</span>
                  </div>
                  <div className="text-xs font-black text-slate-950 font-mono mt-0.5">
                    {formatCompactNumber(post.current_digg_count)}
                  </div>
                  {post.likes_growth !== null && post.likes_growth !== undefined && likesGrowth.isPositive && (
                    <div className="text-[9px] font-black text-rose-600 font-mono">
                      {likesGrowth.text}
                    </div>
                  )}
                </div>

                {/* Komentar */}
                <div>
                  <div className="text-[10px] text-slate-600 font-bold flex items-center justify-center space-x-0.5">
                    <MessageCircle className="w-2.5 h-2.5 text-slate-600" />
                    <span>Komen</span>
                  </div>
                  <div className="text-xs font-black text-slate-800 font-mono mt-0.5">
                    {formatCompactNumber(post.current_comment_count)}
                  </div>
                </div>

                {/* ER% */}
                <div>
                  <div className="text-[10px] text-amber-800 font-black">
                    <span>ER%</span>
                  </div>
                  <div className="text-xs font-black text-amber-700 font-mono mt-0.5">
                    {formatEngagementRate(post.engagement_rate)}
                  </div>
                </div>
              </div>
            </ScrollReveal>
          );
        })}
      </div>

      {/* 2. Desktop Table Content (Saweria Neo-Brutal Table) */}
      {viewMode === 'table' && (
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-amber-50/90 text-slate-900 uppercase tracking-wider border-b-2 border-slate-900 text-[11px] font-black">
              <tr>
                <th className="py-3.5 px-5 font-black">Postingan & Caption</th>
                <th className="py-3.5 px-3 font-black">
                  <button
                    onClick={() => toggleSort('date')}
                    className="flex items-center space-x-1 hover:text-amber-800 transition cursor-pointer"
                  >
                    <span>Tanggal Unggah</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </button>
                </th>
                <th className="py-3.5 px-3 font-black text-right">
                  <button
                    onClick={() => toggleSort('views')}
                    className="inline-flex items-center space-x-1 hover:text-amber-800 transition ml-auto cursor-pointer"
                  >
                    <Eye className="w-3 h-3 text-amber-700" />
                    <span>Views</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </button>
                </th>
                <th className="py-3.5 px-3 font-black text-right">
                  <button
                    onClick={() => toggleSort('likes')}
                    className="inline-flex items-center space-x-1 hover:text-rose-700 transition ml-auto cursor-pointer"
                  >
                    <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
                    <span>Likes</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </button>
                </th>
                <th className="py-3.5 px-3 font-black text-right">
                  <button
                    onClick={() => toggleSort('comments')}
                    className="inline-flex items-center space-x-1 hover:text-slate-950 transition ml-auto cursor-pointer"
                  >
                    <MessageCircle className="w-3 h-3 text-slate-600" />
                    <span>Komentar</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </button>
                </th>
                <th className="py-3.5 px-3 font-black text-right">
                  <button
                    onClick={() => toggleSort('shares')}
                    className="inline-flex items-center space-x-1 hover:text-slate-950 transition ml-auto cursor-pointer"
                  >
                    <Share2 className="w-3 h-3 text-slate-600" />
                    <span>Share</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </button>
                </th>
                <th className="py-3.5 px-3 font-black text-right">
                  <button
                    onClick={() => toggleSort('er')}
                    className="inline-flex items-center space-x-1 hover:text-amber-800 transition ml-auto cursor-pointer"
                  >
                    <Flame className="w-3 h-3 text-amber-500 fill-amber-500" />
                    <span>ER (Views)</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </button>
                </th>
                <th className="py-3.5 px-4 font-black text-center">Tautan</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-slate-100 font-sans">
              {sortedPosts.map((post) => {
                const viewsGrowth = formatGrowth(post.views_growth);
                const likesGrowth = formatGrowth(post.likes_growth);

                return (
                  <tr
                    key={post.id}
                    className="hover:bg-amber-50/60 transition-colors duration-150 group"
                  >
                    {/* Caption & Thumbnail */}
                    <td className="py-4 px-5 max-w-sm">
                      <div className="flex items-start space-x-3">
                        <PostCoverThumbnail
                          coverUrl={post.cover_url}
                          isSlideshow={post.is_slideshow}
                          size="sm"
                        />

                        {/* Content metadata */}
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                            {post.is_pinned && (
                              <span className="inline-flex items-center space-x-0.5 px-1.5 py-0.5 rounded-lg text-[10px] font-black bg-amber-200 text-slate-950 border border-slate-900 shadow-2xs">
                                <Pin className="w-2.5 h-2.5 fill-slate-950" />
                                <span>Disematkan</span>
                              </span>
                            )}
                            <span
                              className={`inline-flex items-center space-x-0.5 px-1.5 py-0.5 rounded-lg text-[10px] font-black border border-slate-900 shadow-2xs ${
                                post.is_slideshow
                                  ? 'bg-purple-100 text-slate-950'
                                  : 'bg-sky-100 text-slate-950'
                              }`}
                            >
                              {post.is_slideshow ? 'Foto / Slideshow' : 'Video'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-900 line-clamp-2 leading-relaxed font-bold">
                            {post.caption || <span className="italic text-slate-400 font-normal">Tanpa caption</span>}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Upload Date in WIB */}
                    <td className="py-4 px-3 text-slate-700 whitespace-nowrap">
                      <div className="font-bold">{formatShortDateWIB(post.create_time_iso)}</div>
                      <div className="text-[10px] text-slate-500 font-mono font-medium">
                        {formatDateWIB(post.create_time_iso).split(' ')[3]} WIB
                      </div>
                    </td>

                    {/* Views + Delta */}
                    <td className="py-4 px-3 text-right font-mono whitespace-nowrap">
                      <div className="font-black text-slate-950 text-sm">
                        {formatCompactNumber(post.current_play_count)}
                      </div>
                      {post.views_growth !== null && post.views_growth !== undefined && (
                        <div
                          className={`text-[10px] font-black flex items-center justify-end space-x-0.5 ${
                            viewsGrowth.isPositive ? 'text-emerald-700' : 'text-slate-400'
                          }`}
                        >
                          {viewsGrowth.isPositive && <TrendingUp className="w-2.5 h-2.5" />}
                          <span>{viewsGrowth.text}</span>
                        </div>
                      )}
                    </td>

                    {/* Likes + Delta */}
                    <td className="py-4 px-3 text-right font-mono whitespace-nowrap">
                      <div className="font-black text-slate-950 text-sm">
                        {formatCompactNumber(post.current_digg_count)}
                      </div>
                      {post.likes_growth !== null && post.likes_growth !== undefined && (
                        <div
                          className={`text-[10px] font-black flex items-center justify-end space-x-0.5 ${
                            likesGrowth.isPositive ? 'text-rose-600' : 'text-slate-400'
                          }`}
                        >
                          {likesGrowth.isPositive && <TrendingUp className="w-2.5 h-2.5" />}
                          <span>{likesGrowth.text}</span>
                        </div>
                      )}
                    </td>

                    {/* Comments */}
                    <td className="py-4 px-3 text-right font-mono text-slate-800 font-bold whitespace-nowrap">
                      {formatCompactNumber(post.current_comment_count)}
                    </td>

                    {/* Shares */}
                    <td className="py-4 px-3 text-right font-mono text-slate-800 font-bold whitespace-nowrap">
                      {formatCompactNumber(post.current_share_count)}
                    </td>

                    {/* Engagement Rate */}
                    <td className="py-4 px-3 text-right font-mono whitespace-nowrap">
                      <span className="inline-block px-2 py-0.5 rounded-lg bg-amber-100 border border-slate-900 font-black text-amber-900 text-xs shadow-2xs">
                        {formatEngagementRate(post.engagement_rate)}
                      </span>
                    </td>

                    {/* TikTok Direct Link (Saweria Golden Arcade Button) */}
                    <td className="py-4 px-4 text-center whitespace-nowrap">
                      <a
                        href={post.web_video_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center p-2 rounded-xl bg-[#FFC72C] hover:bg-[#FFB800] text-slate-950 border-2 border-slate-900 shadow-[2px_2px_0px_#0f172a] hover:shadow-[3px_3px_0px_#0f172a] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition cursor-pointer"
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
      )}
    </div>
  );
};
