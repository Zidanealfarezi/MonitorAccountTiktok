/**
 * Daily TikTok Sync Script (Mode Hemat)
 * Runs sequentially for all monitored accounts and saves directly to Supabase.
 * Triggered daily at 07:00 WIB (00:00 UTC).
 */

import { createClient } from '@supabase/supabase-js';

const APIFY_API_TOKEN = process.env.APIFY_API_TOKEN || process.env.VITE_APIFY_API_TOKEN || '';
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://zcphjtzdlqkjsuncvdqm.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_JLHPKR2Gedcpjt5A1Z1sbQ_cTEoriAH';

const ACTOR_ID = 'clockworks~tiktok-profile-scraper';
const MAX_CHARGE_PER_RUN = 0.05;
const MONTHLY_BUDGET_CAP = 4.50;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

interface ApifyProfileItem {
  id?: string;
  uniqueId?: string;
  nickname?: string;
  avatarLarger?: string;
  avatarMedium?: string;
  avatarThumb?: string;
  signature?: string;
  verified?: boolean;
  secUid?: string;
  ftc?: boolean;
  relation?: number;
  openFavorite?: boolean;
  commentSetting?: number;
  duetSetting?: number;
  stitchSetting?: number;
  privateAccount?: boolean;
  fans?: number;
  following?: number;
  heart?: number;
  video?: number;
  digg?: number;
}

interface ApifyPostItem {
  id?: string;
  text?: string;
  desc?: string;
  createTime?: number;
  createTimeISO?: string;
  webVideoUrl?: string;
  isPinned?: boolean;
  isSlideshow?: boolean;
  videoMeta?: {
    coverUrl?: string;
  };
  covers?: {
    default?: string;
    origin?: string;
  };
  playCount?: number;
  diggCount?: number;
  commentCount?: number;
  shareCount?: number;
}

async function runDailySync() {
  const nowWIB = new Date(Date.now() + 7 * 3600000).toISOString().replace('T', ' ').substring(0, 19) + ' WIB';
  console.log(`====================================================`);
  console.log(`[TikTok Monitor] Memulai Sinkronisasi Harian (${nowWIB})`);
  console.log(`====================================================`);

  // 1. Fetch monitored accounts in designated order
  const { data: accounts, error: accError } = await supabase
    .from('accounts')
    .select('*')
    .eq('status', 'active');

  if (accError || !accounts || accounts.length === 0) {
    console.error('Gagal mengambil daftar akun dari Supabase:', accError);
    process.exit(1);
  }

  console.log(`Ditemukan ${accounts.length} akun aktif untuk dipantau.`);

  let totalSpentThisRun = 0;

  for (let i = 0; i < accounts.length; i++) {
    const acc = accounts[i];
    console.log(`\n[${i + 1}/${accounts.length}] Memproses @${acc.username} (${acc.display_name})...`);

    try {
      // 2. Start Apify Actor Run
      const runUrl = `https://api.apify.com/v2/acts/${ACTOR_ID}/runs?token=${APIFY_API_TOKEN}`;
      const payload = {
        profiles: [acc.username],
        resultsPerPage: 10,
        excludePinnedPosts: false,
      };

      const startRes = await fetch(runUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!startRes.ok) {
        throw new Error(`Apify start failed with HTTP ${startRes.status}`);
      }

      const startData: any = await startRes.json();
      const runId = startData.data?.id;
      const datasetId = startData.data?.defaultDatasetId;

      console.log(`  -> Apify Run ID: ${runId}. Menunggu data scraper selesai...`);

      // 3. Poll until finished
      let finished = false;
      let attempts = 0;
      let runStatus: any = null;

      while (!finished && attempts < 25) {
        attempts++;
        await new Promise((r) => setTimeout(r, 4000));
        const statusRes = await fetch(`https://api.apify.com/v2/actor-runs/${runId}?token=${APIFY_API_TOKEN}`);
        if (statusRes.ok) {
          const statusJson: any = await statusRes.json();
          runStatus = statusJson.data;
          if (['SUCCEEDED', 'FAILED', 'TIMED-OUT', 'ABORTED'].includes(runStatus.status)) {
            finished = true;
          }
        }
      }

      if (runStatus?.status !== 'SUCCEEDED') {
        throw new Error(`Apify status akhir: ${runStatus?.status || 'TIMEOUT'}`);
      }

      // 4. Fetch Dataset Items
      const dataRes = await fetch(`https://api.apify.com/v2/datasets/${datasetId}/items?token=${APIFY_API_TOKEN}`);
      const rawItems: any[] = await dataRes.json();

      let profileData: ApifyProfileItem | null = null;
      const postsData: ApifyPostItem[] = [];

      for (const item of rawItems) {
        if (item.authorMeta || item.playCount !== undefined || item.diggCount !== undefined) {
          postsData.push(item);
        } else if (item.fans !== undefined || item.heart !== undefined || item.uniqueId) {
          profileData = item;
        }
      }

      // 5. Update Profile Snapshot in Supabase
      const nowIso = new Date().toISOString();
      const fans = profileData?.fans ?? null;
      const heart = profileData?.heart ?? null;
      const videoCount = profileData?.video ?? null;

      if (fans !== null || heart !== null) {
        await supabase.from('account_snapshots').insert({
          account_id: acc.id,
          fans,
          heart,
          video_count: videoCount,
          captured_at: nowIso,
        });

        // Update last sync on account
        await supabase.from('accounts').update({
          last_sync_at: nowIso,
          updated_at: nowIso,
          avatar_url: profileData?.avatarThumb || profileData?.avatarMedium || acc.avatar_url,
        }).eq('id', acc.id);

        console.log(`  -> Berhasil simpan profil: ${fans} followers, ${heart} suka, ${videoCount} video`);
      }

      // 6. Update Recent 10 Posts in Supabase
      const slicePosts = postsData.slice(0, 10);
      for (const p of slicePosts) {
        const postId = p.id || String(Date.now());
        const createIso = p.createTimeISO || (p.createTime ? new Date(p.createTime * 1000).toISOString() : nowIso);
        const cover = p.covers?.default || p.covers?.origin || p.videoMeta?.coverUrl || null;

        await supabase.from('posts').upsert({
          id: postId,
          account_id: acc.id,
          caption: p.text || p.desc || '',
          create_time_iso: createIso,
          web_video_url: p.webVideoUrl || `https://www.tiktok.com/@${acc.username}/video/${postId}`,
          is_slideshow: Boolean(p.isSlideshow),
          is_pinned: Boolean(p.isPinned),
          cover_url: cover,
          updated_at: nowIso,
        });

        await supabase.from('post_snapshots').insert({
          post_id: postId,
          play_count: p.playCount ?? 0,
          digg_count: p.diggCount ?? 0,
          comment_count: p.commentCount ?? 0,
          share_count: p.shareCount ?? 0,
          captured_at: nowIso,
        });
      }

      console.log(`  -> Berhasil memperbarui ${slicePosts.length} postingan terbaru.`);
      totalSpentThisRun += runStatus.usageTotalUsd || 0.03;

      // Small cooldown between accounts
      await new Promise((r) => setTimeout(r, 2000));
    } catch (err: unknown) {
      console.error(`  -> Gagal memproses @${acc.username}:`, err instanceof Error ? err.message : err);
    }
  }

  console.log(`\n====================================================`);
  console.log(`[TikTok Monitor] Sinkronisasi Selesai.`);
  console.log(`Estimasi Biaya Apify Run Ini: ~$${totalSpentThisRun.toFixed(4)}`);
  console.log(`====================================================`);
}

runDailySync().catch((err) => {
  console.error('Fatal sync error:', err);
  process.exit(1);
});
