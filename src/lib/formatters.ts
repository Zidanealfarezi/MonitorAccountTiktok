/**
 * Utility functions for formatting numbers, dates in WIB (Asia/Jakarta),
 * and calculating TikTok analytics metrics according to plan specifications.
 */

// Format numbers into compact form (e.g. 1.2M, 45.6K) or full Indonesian format
export function formatCompactNumber(value: number | null | undefined): string {
  if (value === null || value === undefined) {
    return 'Belum tersedia';
  }

  if (value < 0) return '-' + formatCompactNumber(Math.abs(value));

  if (value >= 1_000_000_000) {
    return (value / 1_000_000_000).toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 2 }) + 'B';
  }
  if (value >= 1_000_000) {
    return (value / 1_000_000).toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 2 }) + 'M';
  }
  if (value >= 10_000) {
    return (value / 1_000).toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + 'K';
  }
  return value.toLocaleString('id-ID');
}

// Format exact integer with thousand separators (e.g. 1.245.900)
export function formatExactNumber(value: number | null | undefined): string {
  if (value === null || value === undefined) {
    return 'Belum tersedia';
  }
  return value.toLocaleString('id-ID');
}

// Format currency in USD (e.g. $0.03, $4.50)
export function formatCurrencyUsd(value: number | null | undefined): string {
  if (value === null || value === undefined) {
    return '$0.00';
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

// Format date to Indonesian WIB (Asia/Jakarta) string
export function formatDateWIB(isoDateString: string | null | undefined): string {
  if (!isoDateString) {
    return 'Belum tersedia';
  }

  try {
    const date = new Date(isoDateString);
    if (isNaN(date.getTime())) return 'Format tanggal tidak valid';

    return new Intl.DateTimeFormat('id-ID', {
      timeZone: 'Asia/Jakarta',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).format(date) + ' WIB';
  } catch {
    return 'Belum tersedia';
  }
}

// Format short date in WIB (e.g. 03 Nov 14:30)
export function formatShortDateWIB(isoDateString: string | null | undefined): string {
  if (!isoDateString) return '-';

  try {
    const date = new Date(isoDateString);
    if (isNaN(date.getTime())) return '-';

    return new Intl.DateTimeFormat('id-ID', {
      timeZone: 'Asia/Jakarta',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(date);
  } catch {
    return '-';
  }
}

// Format relative time (e.g. "3 jam yang lalu", "2 hari yang lalu")
export function formatRelativeTime(isoDateString: string | null | undefined): string {
  if (!isoDateString) return 'Belum ada';

  try {
    const date = new Date(isoDateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHours = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSec < 60) return 'Baru saja';
    if (diffMin < 60) return `${diffMin} menit lalu`;
    if (diffHours < 24) return `${diffHours} jam lalu`;
    if (diffDays === 1) return 'Kemarin';
    if (diffDays < 30) return `${diffDays} hari lalu`;
    return formatDateWIB(isoDateString);
  } catch {
    return 'Belum ada';
  }
}

/**
 * Calculate engagement rate based on views:
 * formula: (likes + comments + shares) / views * 100%
 * If views is 0 or metrics are null, return null ("Belum tersedia")
 */
export function calculateEngagementRate(
  views: number | null | undefined,
  likes: number | null | undefined,
  comments: number | null | undefined,
  shares: number | null | undefined
): number | null {
  if (!views || views <= 0) {
    return null;
  }

  const l = likes ?? 0;
  const c = comments ?? 0;
  const s = shares ?? 0;

  const rate = ((l + c + s) / views) * 100;
  return Math.round(rate * 100) / 100; // 2 decimal places
}

export function formatEngagementRate(rate: number | null | undefined): string {
  if (rate === null || rate === undefined) {
    return 'Belum tersedia';
  }
  return `${rate.toFixed(2)}%`;
}

/**
 * Format growth with sign and color cue (+120, -50, 0)
 */
export function formatGrowth(value: number | null | undefined): { text: string; isPositive: boolean; isZero: boolean } {
  if (value === null || value === undefined) {
    return { text: 'Belum ada data pembanding', isPositive: false, isZero: true };
  }

  if (value > 0) {
    return { text: `+${formatCompactNumber(value)}`, isPositive: true, isZero: false };
  } else if (value < 0) {
    return { text: `-${formatCompactNumber(Math.abs(value))}`, isPositive: false, isZero: false };
  }
  return { text: '0', isPositive: false, isZero: true };
}

/**
 * Calculate exact observation interval between two snapshot dates
 */
export function getObservationIntervalText(
  fromDateIso: string | null | undefined,
  toDateIso: string | null | undefined
): string {
  if (!fromDateIso || !toDateIso) return 'dibandingkan pengamatan sebelumnya';

  try {
    const from = new Date(fromDateIso).getTime();
    const to = new Date(toDateIso).getTime();
    const diffHours = Math.round(Math.abs(to - from) / (1000 * 60 * 60));

    if (diffHours < 1) return 'dalam rentang pengamatan terakhir (<1 jam)';
    if (diffHours === 24) return 'dalam 24 jam terakhir';
    if (diffHours < 48) return `dalam rentang ${diffHours} jam`;
    const days = Math.round(diffHours / 24);
    return `dalam rentang ${days} hari`;
  } catch {
    return 'dibandingkan pengamatan sebelumnya';
  }
}

/**
 * Username normalizer:
 * trims, removes leading '@', converts to lowercase
 */
export function normalizeTikTokUsername(username: string): string {
  return username.trim().replace(/^@+/, '').toLowerCase();
}
