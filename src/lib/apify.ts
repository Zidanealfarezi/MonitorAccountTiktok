/**
 * Apify Integration Module for clockworks/tiktok-profile-scraper
 * Handles actor runs, input preparation, dataset fetching, and validation.
 */

import { ApifyScraperInput } from '../types';

export const ACTOR_ID = 'clockworks~tiktok-profile-scraper';
export const DEFAULT_RESULTS_PER_PAGE = 10;
export const MAX_CHARGE_PER_RUN_USD = 0.05;
export const ESTIMATED_COST_PER_RUN_USD = 0.03; // ~10 items at $3/1000 items

export interface ApifyActorRunResponse {
  data: {
    id: string;
    actId: string;
    userId: string;
    startedAt: string;
    finishedAt?: string | null;
    status: 'READY' | 'RUNNING' | 'SUCCEEDED' | 'FAILED' | 'TIMED-OUT' | 'ABORTED';
    defaultDatasetId: string;
    usageTotalUsd?: number;
    usage?: {
      ACTOR_COMPUTE_UNITS?: number;
      DATASET_READS?: number;
      DATASET_WRITES?: number;
      KEY_VALUE_STORE_READS?: number;
      KEY_VALUE_STORE_WRITES?: number;
      REQUEST_QUEUE_READS?: number;
      REQUEST_QUEUE_WRITES?: number;
      DATA_TRANSFER_INTERNAL_GBYTES?: number;
      DATA_TRANSFER_EXTERNAL_GBYTES?: number;
      PROXY_RESIDENTIAL_TRANSFER_GBYTES?: number;
      PROXY_SERPS?: number;
    };
  };
}

export interface ApifyScrapedItem {
  id: string;
  text?: string;
  createTimeISO?: string;
  createTime?: number;
  webVideoUrl?: string;
  isSlideshow?: boolean;
  isPinned?: boolean;
  playCount?: number | null;
  diggCount?: number | null;
  commentCount?: number | null;
  shareCount?: number | null;
  collectCount?: number | null;
  authorMeta?: {
    id?: string;
    name?: string;
    nickName?: string;
    avatar?: string;
    fans?: number | null;
    heart?: number | null;
    video?: number | null;
    digg?: number | null;
  };
  videoMeta?: {
    coverUrl?: string;
    duration?: number;
  };
}

/**
 * Builds the exact input payload specified in Section 6 of the plan
 */
export function buildApifyInput(username: string, resultsLimit = DEFAULT_RESULTS_PER_PAGE): ApifyScraperInput {
  const cleanUsername = username.trim().replace(/^@+/, '').toLowerCase();
  return {
    profiles: [cleanUsername],
    profileScrapeSections: ['videos'],
    profileSorting: 'latest',
    resultsPerPage: resultsLimit,
    excludePinnedPosts: false,
    shouldDownloadVideos: false,
    shouldDownloadCovers: false,
    downloadSubtitlesOptions: 'NEVER_DOWNLOAD_SUBTITLES',
    maxFollowersPerProfile: 0,
    maxFollowingPerProfile: 0,
  };
}

/**
 * Trigger an asynchronous Apify Actor run
 */
export async function startApifyRun(
  apiToken: string,
  username: string,
  webhookUrl?: string
): Promise<{ runId: string; datasetId: string; startedAt: string }> {
  if (!apiToken) {
    throw new Error('Apify API Token belum dikonfigurasi.');
  }

  const inputPayload = buildApifyInput(username);
  const url = new URL(`https://api.apify.com/v2/acts/${ACTOR_ID}/runs`);
  url.searchParams.set('token', apiToken);
  url.searchParams.set('maxTotalChargeUsd', MAX_CHARGE_PER_RUN_USD.toString());

  // Attach webhook if specified
  const webhooks = webhookUrl
    ? [
        {
          eventTypes: ['ACTOR.RUN.SUCCEEDED', 'ACTOR.RUN.FAILED', 'ACTOR.RUN.ABORTED', 'ACTOR.RUN.TIMED_OUT'],
          requestUrl: webhookUrl,
        },
      ]
    : undefined;

  const response = await fetch(url.toString(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...inputPayload,
      ...(webhooks ? { webhooks } : {}),
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gagal memulai Apify run (${response.status}): ${errorText}`);
  }

  const result: ApifyActorRunResponse = await response.json();
  return {
    runId: result.data.id,
    datasetId: result.data.defaultDatasetId,
    startedAt: result.data.startedAt,
  };
}

/**
 * Check run status via polling (used when webhook is not yet delivered or during dev)
 */
export async function getApifyRunStatus(apiToken: string, runId: string): Promise<ApifyActorRunResponse['data']> {
  const url = `https://api.apify.com/v2/actor-runs/${runId}?token=${apiToken}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Gagal memeriksa status run Apify: ${response.statusText}`);
  }

  const result: ApifyActorRunResponse = await response.json();
  return result.data;
}

/**
 * Fetch dataset items and normalize them
 */
export async function fetchApifyDatasetItems(apiToken: string, datasetId: string): Promise<ApifyScrapedItem[]> {
  const url = `https://api.apify.com/v2/datasets/${datasetId}/items?token=${apiToken}&format=json`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Gagal mengambil dataset Apify: ${response.statusText}`);
  }

  const items: ApifyScrapedItem[] = await response.json();
  return items;
}

/**
 * Extract profile snapshot and post snapshots from Apify output
 */
export function parseApifyDataset(items: ApifyScrapedItem[]) {
  if (!items || items.length === 0) {
    return {
      profileSnapshot: null,
      posts: [],
    };
  }

  // Find the first item with valid authorMeta
  const itemWithAuthor = items.find((it) => it.authorMeta?.fans !== undefined || it.authorMeta?.heart !== undefined);

  const profileSnapshot = itemWithAuthor?.authorMeta
    ? {
        tiktokId: itemWithAuthor.authorMeta.id || null,
        avatarUrl: itemWithAuthor.authorMeta.avatar || null,
        fans: typeof itemWithAuthor.authorMeta.fans === 'number' ? itemWithAuthor.authorMeta.fans : null,
        heart: typeof itemWithAuthor.authorMeta.heart === 'number' ? itemWithAuthor.authorMeta.heart : null,
        videoCount: typeof itemWithAuthor.authorMeta.video === 'number' ? itemWithAuthor.authorMeta.video : null,
      }
    : null;

  // Process posts
  const posts = items
    .filter((it) => it.id && (it.createTimeISO || it.createTime))
    .map((it) => {
      const createTimeIso = it.createTimeISO || (it.createTime ? new Date(it.createTime * 1000).toISOString() : new Date().toISOString());
      return {
        id: it.id.toString(),
        caption: it.text || '',
        createTimeIso,
        webVideoUrl: it.webVideoUrl || `https://www.tiktok.com/@${itemWithAuthor?.authorMeta?.name || 'user'}/video/${it.id}`,
        isSlideshow: Boolean(it.isSlideshow),
        isPinned: Boolean(it.isPinned),
        coverUrl: it.videoMeta?.coverUrl || null,
        playCount: typeof it.playCount === 'number' ? it.playCount : null,
        diggCount: typeof it.diggCount === 'number' ? it.diggCount : null,
        commentCount: typeof it.commentCount === 'number' ? it.commentCount : null,
        shareCount: typeof it.shareCount === 'number' ? it.shareCount : null,
      };
    });

  return {
    profileSnapshot,
    posts,
  };
}
