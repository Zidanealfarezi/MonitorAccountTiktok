export type ContentType = 'video' | 'slideshow';

export type JobStatus = 'pending' | 'running' | 'succeeded' | 'failed' | 'partial';

export interface Account {
  id: string;
  user_id?: string;
  username: string; // normalized, lowercase without @
  display_name: string;
  tiktok_id?: string | null;
  avatar_url?: string | null;
  status: 'active' | 'paused' | 'error';
  last_sync_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface AccountSnapshot {
  id: string;
  account_id: string;
  sync_job_id: string;
  fans: number | null; // followers
  heart: number | null; // total likes
  video_count: number | null; // total videos published
  captured_at: string; // ISO string in UTC
}

export interface Post {
  id: string; // TikTok video ID (string to prevent 64-bit precision loss)
  account_id: string;
  caption: string;
  create_time_iso: string;
  web_video_url: string;
  is_slideshow: boolean;
  is_pinned: boolean;
  cover_url?: string | null;
  created_at: string;
  updated_at: string;
}

export interface PostSnapshot {
  id: string;
  post_id: string;
  sync_job_id: string;
  play_count: number | null; // views
  digg_count: number | null; // likes
  comment_count: number | null;
  share_count: number | null;
  captured_at: string;
}

export interface SyncJob {
  id: string;
  account_id: string;
  apify_run_id?: string | null;
  apify_dataset_id?: string | null;
  status: JobStatus;
  started_at: string;
  completed_at?: string | null;
  results_count: number;
  charged_usd: number;
  error_message?: string | null;
  created_at: string;
}

export interface UsageLedgerEntry {
  id: string;
  user_id?: string;
  account_id: string;
  account_username: string;
  sync_job_id: string;
  billing_cycle: string; // e.g., '2026-11'
  reserved_usd: number;
  final_charged_usd: number;
  status: 'reserved' | 'finalized' | 'released';
  created_at: string;
}

export interface PostWithSnapshot extends Post {
  current_play_count: number | null;
  current_digg_count: number | null;
  current_comment_count: number | null;
  current_share_count: number | null;
  engagement_rate: number | null; // based on views: (likes+comments+shares)/views * 100%
  // Growth compared to previous snapshot for this specific post
  views_growth: number | null;
  likes_growth: number | null;
  snapshots: PostSnapshot[];
}

export interface AccountDashboardData {
  account: Account;
  latestSnapshot: AccountSnapshot | null;
  previousSnapshot: AccountSnapshot | null;
  followersDiff: number | null;
  posts: PostWithSnapshot[];
  snapshotsHistory: AccountSnapshot[];
  recentJobs: SyncJob[];
  lastSyncAt: string | null;
}

export interface ApifyScraperInput {
  profiles: string[];
  profileScrapeSections: string[];
  profileSorting: string;
  resultsPerPage: number;
  excludePinnedPosts: boolean;
  shouldDownloadVideos: boolean;
  shouldDownloadCovers: boolean;
  downloadSubtitlesOptions: string;
  maxFollowersPerProfile: number;
  maxFollowingPerProfile: number;
}

export interface AppConfig {
  apifyApiToken: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
  supabaseServiceKey?: string;
  webhookSecret: string;
  maxChargePerRunUsd: number;
  monthlyBudgetCapUsd: number;
  warningThresholdUsd: number;
  isMockMode: boolean;
}

export type DeviceType = 'mac' | 'iphone' | 'windows' | 'android' | 'linux' | 'other';

export interface DeviceAuthRecord {
  deviceId: string;
  deviceName: string;
  deviceType: DeviceType;
  registeredAt: string;
  lastActiveAt: string;
  token: string;
  status: 'authorized' | 'revoked';
  userAgent?: string;
}

export interface SecurityConfig {
  masterPinHash: string;
  isLockEnabled: boolean;
  registeredDevices: DeviceAuthRecord[];
  revokedDeviceIds: string[];
}
