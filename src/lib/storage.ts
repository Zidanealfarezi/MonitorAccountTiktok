/**
 * Storage and Data Access Layer
 * Supports LocalStorage (with rich seed data) and Supabase backend.
 */

import {
  Account,
  AccountDashboardData,
  AccountSnapshot,
  AppConfig,
  Post,
  PostSnapshot,
  PostWithSnapshot,
  SyncJob,
  UsageLedgerEntry,
} from '../types';
import {
  INITIAL_ACCOUNTS,
  INTAN_POSTS,
  INTAN_POST_SNAPSHOTS,
  INTAN_SNAPSHOTS,
  INITIAL_JOBS,
  INITIAL_USAGE,
  RANIA_SNAPSHOTS,
  NARA_SNAPSHOTS,
  AQARA_SNAPSHOTS,
  AI_ACADEMY_SNAPSHOTS,
  AQARA_POSTS,
  AQARA_POST_SNAPSHOTS,
  AI_ACADEMY_POSTS,
  AI_ACADEMY_POST_SNAPSHOTS,
} from './seedData';
import { calculateEngagementRate, normalizeTikTokUsername } from './formatters';
import {
  startApifyRun,
  getApifyRunStatus,
  fetchApifyDatasetItems,
  parseApifyDataset,
  ESTIMATED_COST_PER_RUN_USD,
} from './apify';
import { getSupabaseClient } from './supabase';

const STORAGE_KEYS = {
  ACCOUNTS: 'tiktok_monitor_accounts',
  ACCOUNT_SNAPSHOTS: 'tiktok_monitor_account_snapshots',
  POSTS: 'tiktok_monitor_posts',
  POST_SNAPSHOTS: 'tiktok_monitor_post_snapshots',
  SYNC_JOBS: 'tiktok_monitor_sync_jobs',
  USAGE_LEDGER: 'tiktok_monitor_usage_ledger',
  CONFIG: 'tiktok_monitor_config',
};

// Default app configuration
export const DEFAULT_CONFIG: AppConfig = {
  apifyApiToken: '',
  supabaseUrl: '',
  supabaseAnonKey: '',
  webhookSecret: 'secret_tiktok_monitor_2026',
  maxChargePerRunUsd: 0.05,
  monthlyBudgetCapUsd: 4.5,
  warningThresholdUsd: 4.0,
  isMockMode: true,
};

export class StorageService {
  private static getItem<T>(key: string, defaultValue: T): T {
    try {
      const data = localStorage.getItem(key);
      if (!data) return defaultValue;
      return JSON.parse(data) as T;
    } catch {
      return defaultValue;
    }
  }

  private static setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('LocalStorage error:', e);
    }
  }

  // Initialize seed data if storage is empty, or merge missing default accounts
  public static init(): void {
    const existingAccounts = this.getItem<Account[]>(STORAGE_KEYS.ACCOUNTS, []);

    if (existingAccounts.length === 0) {
      this.setItem(STORAGE_KEYS.ACCOUNTS, INITIAL_ACCOUNTS);
      this.setItem(STORAGE_KEYS.ACCOUNT_SNAPSHOTS, [
        ...INTAN_SNAPSHOTS,
        ...RANIA_SNAPSHOTS,
        ...NARA_SNAPSHOTS,
        ...AQARA_SNAPSHOTS,
        ...AI_ACADEMY_SNAPSHOTS,
      ]);
      this.setItem(STORAGE_KEYS.POSTS, [...INTAN_POSTS, ...AQARA_POSTS, ...AI_ACADEMY_POSTS]);
      this.setItem(STORAGE_KEYS.POST_SNAPSHOTS, [
        ...INTAN_POST_SNAPSHOTS,
        ...AQARA_POST_SNAPSHOTS,
        ...AI_ACADEMY_POST_SNAPSHOTS,
      ]);
      this.setItem(STORAGE_KEYS.SYNC_JOBS, INITIAL_JOBS);
      this.setItem(STORAGE_KEYS.USAGE_LEDGER, INITIAL_USAGE);
    } else {
      // Merge any new default accounts (e.g. aqara.indonesia, the.ai.x.academy)
      const missingAccounts = INITIAL_ACCOUNTS.filter(
        (initAcc) => !existingAccounts.some((acc) => acc.username === initAcc.username)
      );

      if (missingAccounts.length > 0) {
        this.setItem(STORAGE_KEYS.ACCOUNTS, [...existingAccounts, ...missingAccounts]);

        const allSnapshots = this.getItem<AccountSnapshot[]>(STORAGE_KEYS.ACCOUNT_SNAPSHOTS, []);
        this.setItem(STORAGE_KEYS.ACCOUNT_SNAPSHOTS, [
          ...allSnapshots,
          ...AQARA_SNAPSHOTS,
          ...AI_ACADEMY_SNAPSHOTS,
        ]);

        const allPosts = this.getItem<Post[]>(STORAGE_KEYS.POSTS, []);
        this.setItem(STORAGE_KEYS.POSTS, [...allPosts, ...AQARA_POSTS, ...AI_ACADEMY_POSTS]);

        const allPostSnaps = this.getItem<PostSnapshot[]>(STORAGE_KEYS.POST_SNAPSHOTS, []);
        this.setItem(STORAGE_KEYS.POST_SNAPSHOTS, [
          ...allPostSnaps,
          ...AQARA_POST_SNAPSHOTS,
          ...AI_ACADEMY_POST_SNAPSHOTS,
        ]);
      }
    }

    if (!localStorage.getItem(STORAGE_KEYS.CONFIG)) {
      this.setItem(STORAGE_KEYS.CONFIG, DEFAULT_CONFIG);
    }
  }

  public static getConfig(): AppConfig {
    return this.getItem<AppConfig>(STORAGE_KEYS.CONFIG, DEFAULT_CONFIG);
  }

  public static saveConfig(config: AppConfig): void {
    this.setItem(STORAGE_KEYS.CONFIG, config);
  }

  public static getAccounts(): Account[] {
    this.init();
    return this.getItem<Account[]>(STORAGE_KEYS.ACCOUNTS, INITIAL_ACCOUNTS);
  }

  public static getAccount(id: string): Account | null {
    const accounts = this.getAccounts();
    return accounts.find((a) => a.id === id) || null;
  }

  public static addAccount(username: string, displayName: string): Account {
    const cleanUsername = normalizeTikTokUsername(username);
    const accounts = this.getAccounts();

    const existing = accounts.find((a) => a.username === cleanUsername);
    if (existing) {
      throw new Error(`Akun @${cleanUsername} sudah terdaftar.`);
    }

    const newAccount: Account = {
      id: 'acc-' + Date.now().toString(36),
      username: cleanUsername,
      display_name: displayName.trim() || cleanUsername,
      tiktok_id: null,
      avatar_url: null,
      status: 'active',
      last_sync_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    accounts.push(newAccount);
    this.setItem(STORAGE_KEYS.ACCOUNTS, accounts);
    return newAccount;
  }

  public static deleteAccount(id: string): void {
    const accounts = this.getAccounts().filter((a) => a.id !== id);
    this.setItem(STORAGE_KEYS.ACCOUNTS, accounts);
  }

  public static getMonthlyUsage(): {
    totalChargedUsd: number;
    totalReservedUsd: number;
    billingCycle: string;
    isBudgetExceeded: boolean;
    isNearWarning: boolean;
    runsCount: number;
  } {
    const ledger = this.getItem<UsageLedgerEntry[]>(STORAGE_KEYS.USAGE_LEDGER, []);
    const currentMonth = new Date().toISOString().substring(0, 7); // e.g. '2026-11'
    const currentMonthEntries = ledger.filter((item) => item.billing_cycle === currentMonth);

    const totalChargedUsd = currentMonthEntries.reduce((acc, curr) => acc + (curr.final_charged_usd || 0), 0);
    const totalReservedUsd = currentMonthEntries
      .filter((i) => i.status === 'reserved')
      .reduce((acc, curr) => acc + (curr.reserved_usd || 0), 0);

    const config = this.getConfig();
    const isBudgetExceeded = totalChargedUsd >= config.monthlyBudgetCapUsd;
    const isNearWarning = totalChargedUsd >= config.warningThresholdUsd;

    return {
      totalChargedUsd: Math.round(totalChargedUsd * 10000) / 10000,
      totalReservedUsd: Math.round(totalReservedUsd * 10000) / 10000,
      billingCycle: currentMonth,
      isBudgetExceeded,
      isNearWarning,
      runsCount: currentMonthEntries.length,
    };
  }

  public static getUsageLedger(): UsageLedgerEntry[] {
    return this.getItem<UsageLedgerEntry[]>(STORAGE_KEYS.USAGE_LEDGER, []);
  }

  public static getDashboardData(accountId: string): AccountDashboardData {
    this.init();
    const account = this.getAccount(accountId);
    if (!account) {
      throw new Error(`Akun dengan ID ${accountId} tidak ditemukan.`);
    }

    // Load account snapshots
    const allSnapshots = this.getItem<AccountSnapshot[]>(STORAGE_KEYS.ACCOUNT_SNAPSHOTS, []);
    const accountSnapshots = allSnapshots
      .filter((s) => s.account_id === accountId)
      .sort((a, b) => new Date(a.captured_at).getTime() - new Date(b.captured_at).getTime());

    const latestSnapshot = accountSnapshots.length > 0 ? accountSnapshots[accountSnapshots.length - 1] : null;
    const previousSnapshot = accountSnapshots.length > 1 ? accountSnapshots[accountSnapshots.length - 2] : null;

    let followersDiff: number | null = null;
    if (latestSnapshot?.fans !== null && latestSnapshot?.fans !== undefined && previousSnapshot?.fans !== null && previousSnapshot?.fans !== undefined) {
      followersDiff = latestSnapshot.fans - previousSnapshot.fans;
    }

    // Load posts
    const allPosts = this.getItem<Post[]>(STORAGE_KEYS.POSTS, []);
    const accountPosts = allPosts
      .filter((p) => p.account_id === accountId)
      .sort((a, b) => new Date(b.create_time_iso).getTime() - new Date(a.create_time_iso).getTime())
      .slice(0, 10); // Enforce max 10 latest monitored posts

    const allPostSnapshots = this.getItem<PostSnapshot[]>(STORAGE_KEYS.POST_SNAPSHOTS, []);

    // Combine posts with latest & previous snapshot for per-post deltas
    const postsWithSnapshots: PostWithSnapshot[] = accountPosts.map((post) => {
      const pSnaps = allPostSnapshots
        .filter((ps) => ps.post_id === post.id)
        .sort((a, b) => new Date(a.captured_at).getTime() - new Date(b.captured_at).getTime());

      const latestPs = pSnaps.length > 0 ? pSnaps[pSnaps.length - 1] : null;
      const prevPs = pSnaps.length > 1 ? pSnaps[pSnaps.length - 2] : null;

      const current_play_count = latestPs?.play_count ?? null;
      const current_digg_count = latestPs?.digg_count ?? null;
      const current_comment_count = latestPs?.comment_count ?? null;
      const current_share_count = latestPs?.share_count ?? null;

      const engagement_rate = calculateEngagementRate(
        current_play_count,
        current_digg_count,
        current_comment_count,
        current_share_count
      );

      // Rule: Views & Likes growth must be computed per post ID with two observations
      let views_growth: number | null = null;
      if (latestPs?.play_count !== null && latestPs?.play_count !== undefined && prevPs?.play_count !== null && prevPs?.play_count !== undefined) {
        views_growth = latestPs.play_count - prevPs.play_count;
      }

      let likes_growth: number | null = null;
      if (latestPs?.digg_count !== null && latestPs?.digg_count !== undefined && prevPs?.digg_count !== null && prevPs?.digg_count !== undefined) {
        likes_growth = latestPs.digg_count - prevPs.digg_count;
      }

      return {
        ...post,
        current_play_count,
        current_digg_count,
        current_comment_count,
        current_share_count,
        engagement_rate,
        views_growth,
        likes_growth,
        snapshots: pSnaps,
      };
    });

    // Recent jobs
    const allJobs = this.getItem<SyncJob[]>(STORAGE_KEYS.SYNC_JOBS, []);
    const recentJobs = allJobs
      .filter((j) => j.account_id === accountId)
      .sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime());

    return {
      account,
      latestSnapshot,
      previousSnapshot,
      followersDiff,
      posts: postsWithSnapshots,
      snapshotsHistory: accountSnapshots,
      recentJobs,
      lastSyncAt: account.last_sync_at || (latestSnapshot ? latestSnapshot.captured_at : null),
    };
  }

  /**
   * Run Sync for an Account (Hemat Mode)
   * Prevents duplicate active jobs, respects budget limit,
   * calls Apify if API token is configured, or simulates realistic scraper data.
   */
  public static async triggerSync(
    accountId: string,
    onProgress?: (msg: string) => void
  ): Promise<AccountDashboardData> {
    const account = this.getAccount(accountId);
    if (!account) throw new Error('Akun tidak ditemukan.');

    // 1. Check active job
    const jobs = this.getItem<SyncJob[]>(STORAGE_KEYS.SYNC_JOBS, []);
    const existingActiveJob = jobs.find(
      (j) => j.account_id === accountId && (j.status === 'pending' || j.status === 'running')
    );
    if (existingActiveJob) {
      throw new Error('Pengambilan data sedang berlangsung untuk akun ini. Harap tunggu proses selesai.');
    }

    // 2. Check budget cap
    const usage = this.getMonthlyUsage();
    const config = this.getConfig();
    if (usage.totalChargedUsd >= config.monthlyBudgetCapUsd) {
      throw new Error(
        `Batas pemakaian bulanan (${config.monthlyBudgetCapUsd} USD) telah tercapai. Tidak dapat menjalankan Apify.`
      );
    }

    // 3. Create Sync Job & Reserve Budget
    const jobId = 'job-' + Date.now().toString(36);
    const nowIso = new Date().toISOString();
    const billingCycle = nowIso.substring(0, 7);

    const newJob: SyncJob = {
      id: jobId,
      account_id: accountId,
      status: 'running',
      started_at: nowIso,
      results_count: 0,
      charged_usd: 0,
      created_at: nowIso,
    };
    jobs.unshift(newJob);
    this.setItem(STORAGE_KEYS.SYNC_JOBS, jobs);

    // Ledger reservation
    const ledger = this.getUsageLedger();
    const ledgerEntry: UsageLedgerEntry = {
      id: 'use-' + Date.now().toString(36),
      account_id: accountId,
      account_username: account.username,
      sync_job_id: jobId,
      billing_cycle: billingCycle,
      reserved_usd: config.maxChargePerRunUsd,
      final_charged_usd: 0,
      status: 'reserved',
      created_at: nowIso,
    };
    ledger.unshift(ledgerEntry);
    this.setItem(STORAGE_KEYS.USAGE_LEDGER, ledger);

    try {
      if (config.apifyApiToken && !config.isMockMode) {
        // --- REAL APIFY RUN ---
        onProgress?.('Menghubungkan ke Apify Actor (clockworks/tiktok-profile-scraper)...');
        const runRes = await startApifyRun(config.apifyApiToken, account.username);
        newJob.apify_run_id = runRes.runId;
        newJob.apify_dataset_id = runRes.datasetId;
        this.setItem(STORAGE_KEYS.SYNC_JOBS, jobs);

        onProgress?.('Menunggu scraper mengumpulkan hingga 10 postingan terbaru...');
        let finished = false;
        let attempts = 0;
        let runStatus = null;

        while (!finished && attempts < 30) {
          attempts++;
          await new Promise((res) => setTimeout(res, 4000));
          runStatus = await getApifyRunStatus(config.apifyApiToken, runRes.runId);
          if (runStatus.status === 'SUCCEEDED' || runStatus.status === 'FAILED' || runStatus.status === 'TIMED-OUT' || runStatus.status === 'ABORTED') {
            finished = true;
          } else {
            onProgress?.(`Sedang mengambil data TikTok (status: ${runStatus.status}, polling ${attempts})...`);
          }
        }

        if (runStatus?.status !== 'SUCCEEDED') {
          throw new Error(`Apify run gagal dengan status: ${runStatus?.status || 'TIMEOUT'}`);
        }

        onProgress?.('Membaca dataset dan memvalidasi metrik...');
        const rawItems = await fetchApifyDatasetItems(config.apifyApiToken, runRes.datasetId);
        const { profileSnapshot, posts } = parseApifyDataset(rawItems);

        // Store new profile snapshot
        if (profileSnapshot) {
          const allSnaps = this.getItem<AccountSnapshot[]>(STORAGE_KEYS.ACCOUNT_SNAPSHOTS, []);
          allSnaps.push({
            id: 'snap-' + Date.now().toString(36),
            account_id: accountId,
            sync_job_id: jobId,
            fans: profileSnapshot.fans,
            heart: profileSnapshot.heart,
            video_count: profileSnapshot.videoCount,
            captured_at: new Date().toISOString(),
          });
          this.setItem(STORAGE_KEYS.ACCOUNT_SNAPSHOTS, allSnaps);

          // Update account avatar if returned
          if (profileSnapshot.avatarUrl) {
            account.avatar_url = profileSnapshot.avatarUrl;
          }
          if (profileSnapshot.tiktokId) {
            account.tiktok_id = profileSnapshot.tiktokId;
          }
        }

        // Store posts and post snapshots
        const allPosts = this.getItem<Post[]>(STORAGE_KEYS.POSTS, []);
        const allPostSnaps = this.getItem<PostSnapshot[]>(STORAGE_KEYS.POST_SNAPSHOTS, []);

        for (const p of posts) {
          const existingPostIndex = allPosts.findIndex((ep) => ep.id === p.id);
          if (existingPostIndex >= 0) {
            allPosts[existingPostIndex] = {
              ...allPosts[existingPostIndex],
              caption: p.caption,
              web_video_url: p.webVideoUrl,
              cover_url: p.coverUrl || allPosts[existingPostIndex].cover_url,
              updated_at: new Date().toISOString(),
            };
          } else {
            allPosts.push({
              id: p.id,
              account_id: accountId,
              caption: p.caption,
              create_time_iso: p.createTimeIso,
              web_video_url: p.webVideoUrl,
              is_slideshow: p.isSlideshow,
              is_pinned: p.isPinned,
              cover_url: p.coverUrl,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });
          }

          // Point-in-time post snapshot
          allPostSnaps.push({
            id: 'ps-' + Date.now().toString(36) + '-' + p.id.slice(-4),
            post_id: p.id,
            sync_job_id: jobId,
            play_count: p.playCount,
            digg_count: p.diggCount,
            comment_count: p.commentCount,
            share_count: p.shareCount,
            captured_at: new Date().toISOString(),
          });
        }

        this.setItem(STORAGE_KEYS.POSTS, allPosts);
        this.setItem(STORAGE_KEYS.POST_SNAPSHOTS, allPostSnaps);

        const charged = runStatus.usageTotalUsd || ESTIMATED_COST_PER_RUN_USD;
        newJob.status = posts.length > 0 ? 'succeeded' : 'partial';
        newJob.results_count = posts.length;
        newJob.charged_usd = charged;
        newJob.completed_at = new Date().toISOString();

        ledgerEntry.final_charged_usd = charged;
        ledgerEntry.status = 'finalized';
      } else {
        // --- REALISTIC MOCK MODE SIMULATION ---
        onProgress?.('Menghubungkan ke penyedia data TikTok...');
        await new Promise((res) => setTimeout(res, 800));
        onProgress?.('Mengambil profil dan 10 postingan terbaru...');
        await new Promise((res) => setTimeout(res, 1200));

        // Generate realistic delta for snapshot
        const allSnaps = this.getItem<AccountSnapshot[]>(STORAGE_KEYS.ACCOUNT_SNAPSHOTS, []);
        const lastSnap = allSnaps
          .filter((s) => s.account_id === accountId)
          .sort((a, b) => new Date(b.captured_at).getTime() - new Date(a.captured_at).getTime())[0];

        const baseFans = lastSnap?.fans ?? 150000;
        const baseHeart = lastSnap?.heart ?? 2500000;
        const baseVideoCount = lastSnap?.video_count ?? 210;

        // Realistic organic increase
        const newFans = baseFans + Math.floor(Math.random() * 450) + 120;
        const newHeart = baseHeart + Math.floor(Math.random() * 8000) + 2500;
        const newVideos = baseVideoCount + (Math.random() > 0.7 ? 1 : 0);

        allSnaps.push({
          id: 'snap-' + Date.now().toString(36),
          account_id: accountId,
          sync_job_id: jobId,
          fans: newFans,
          heart: newHeart,
          video_count: newVideos,
          captured_at: new Date().toISOString(),
        });
        this.setItem(STORAGE_KEYS.ACCOUNT_SNAPSHOTS, allSnaps);

        // Update posts with fresh view deltas
        const allPosts = this.getItem<Post[]>(STORAGE_KEYS.POSTS, []);
        let accountPosts = allPosts.filter((p) => p.account_id === accountId);

        // If no posts yet (e.g. Dinda Kemala), generate default 10 posts
        if (accountPosts.length === 0) {
          const generatedPosts: Post[] = Array.from({ length: 10 }).map((_, idx) => ({
            id: `7499${Date.now().toString().slice(-6)}${idx}`,
            account_id: accountId,
            caption: `Konten update #${idx + 1} seputar tips dan insight kreatif harian! #viral #fyp`,
            create_time_iso: new Date(Date.now() - idx * 86400000 * 1.5).toISOString(),
            web_video_url: `https://www.tiktok.com/@${account.username}/video/7499${idx}`,
            is_slideshow: idx % 3 === 0,
            is_pinned: idx === 0,
            cover_url: `https://images.unsplash.com/photo-${1510000000000 + idx * 100000}?w=400&auto=format&fit=crop&q=80`,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }));
          allPosts.push(...generatedPosts);
          accountPosts = generatedPosts;
          this.setItem(STORAGE_KEYS.POSTS, allPosts);
        }

        const allPostSnaps = this.getItem<PostSnapshot[]>(STORAGE_KEYS.POST_SNAPSHOTS, []);
        for (const post of accountPosts.slice(0, 10)) {
          const lastPostSnap = allPostSnaps
            .filter((ps) => ps.post_id === post.id)
            .sort((a, b) => new Date(b.captured_at).getTime() - new Date(a.captured_at).getTime())[0];

          const prevPlay = lastPostSnap?.play_count ?? (Math.floor(Math.random() * 80000) + 15000);
          const prevDigg = lastPostSnap?.digg_count ?? Math.floor(prevPlay * 0.08);
          const prevComments = lastPostSnap?.comment_count ?? Math.floor(prevDigg * 0.05);
          const prevShares = lastPostSnap?.share_count ?? Math.floor(prevDigg * 0.1);

          // Organic growth
          const addedViews = Math.floor(Math.random() * 5000) + 500;
          const addedLikes = Math.floor(addedViews * 0.07);
          const addedComments = Math.floor(addedLikes * 0.04);
          const addedShares = Math.floor(addedLikes * 0.08);

          allPostSnaps.push({
            id: 'ps-' + Date.now().toString(36) + '-' + post.id.slice(-4),
            post_id: post.id,
            sync_job_id: jobId,
            play_count: prevPlay + addedViews,
            digg_count: prevDigg + addedLikes,
            comment_count: prevComments + addedComments,
            share_count: prevShares + addedShares,
            captured_at: new Date().toISOString(),
          });
        }
        this.setItem(STORAGE_KEYS.POST_SNAPSHOTS, allPostSnaps);

        onProgress?.('Menyimpan metrik dan menghitung selisih...');
        await new Promise((res) => setTimeout(res, 400));

        const mockCharge = 0.031;
        newJob.status = 'succeeded';
        newJob.results_count = accountPosts.slice(0, 10).length;
        newJob.charged_usd = mockCharge;
        newJob.completed_at = new Date().toISOString();

        ledgerEntry.final_charged_usd = mockCharge;
        ledgerEntry.status = 'finalized';
      }

      // Update account status & sync time
      account.last_sync_at = new Date().toISOString();
      account.updated_at = new Date().toISOString();
      const accounts = this.getAccounts();
      const accIdx = accounts.findIndex((a) => a.id === accountId);
      if (accIdx >= 0) accounts[accIdx] = account;
      this.setItem(STORAGE_KEYS.ACCOUNTS, accounts);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Terjadi kesalahan sistem';
      newJob.status = 'failed';
      newJob.error_message = errorMsg;
      newJob.completed_at = new Date().toISOString();
      ledgerEntry.status = 'released'; // Release reserved budget on failure
      ledgerEntry.final_charged_usd = 0;
      throw err;
    } finally {
      this.setItem(STORAGE_KEYS.SYNC_JOBS, jobs);
      this.setItem(STORAGE_KEYS.USAGE_LEDGER, ledger);
    }

    return this.getDashboardData(accountId);
  }

  // Reset to initial seed state
  public static resetToSeed(): void {
    localStorage.removeItem(STORAGE_KEYS.ACCOUNTS);
    localStorage.removeItem(STORAGE_KEYS.ACCOUNT_SNAPSHOTS);
    localStorage.removeItem(STORAGE_KEYS.POSTS);
    localStorage.removeItem(STORAGE_KEYS.POST_SNAPSHOTS);
    localStorage.removeItem(STORAGE_KEYS.SYNC_JOBS);
    localStorage.removeItem(STORAGE_KEYS.USAGE_LEDGER);
    this.init();
  }
}
