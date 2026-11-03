import { Account, AccountSnapshot, Post, PostSnapshot, SyncJob, UsageLedgerEntry } from '../types';

export const INITIAL_ACCOUNTS: Account[] = [
  {
    id: 'a1111111-1111-1111-1111-111111111111',
    username: 'intansuarkartika',
    display_name: 'Intan Suar Kartika',
    tiktok_id: '7192837492817263541',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    status: 'active',
    last_sync_at: '2026-11-03T01:45:00Z', // 08:45 WIB
    created_at: '2026-10-20T00:00:00Z',
    updated_at: '2026-11-03T01:45:00Z',
  },
  {
    id: 'a6666666-6666-6666-6666-666666666666',
    username: 'the.ai.x.academy',
    display_name: 'The AI X Academy',
    tiktok_id: '7693820194827163542',
    avatar_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80',
    status: 'active',
    last_sync_at: '2026-11-02T16:20:00Z', // 23:20 WIB
    created_at: '2026-10-20T00:00:00Z',
    updated_at: '2026-11-02T16:20:00Z',
  },
  {
    id: 'a5555555-5555-5555-5555-555555555555',
    username: 'aqara.indonesia',
    display_name: 'Aqara Indonesia',
    tiktok_id: '7582910492817264821',
    avatar_url: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=200&auto=format&fit=crop&q=80',
    status: 'active',
    last_sync_at: '2026-11-03T02:10:00Z', // 09:10 WIB
    created_at: '2026-10-20T00:00:00Z',
    updated_at: '2026-11-03T02:10:00Z',
  },
  {
    id: 'a4444444-4444-4444-4444-444444444444',
    username: 'dinda.kemala_',
    display_name: 'Dinda Kemala',
    tiktok_id: '7483920192837465192',
    avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
    status: 'active',
    last_sync_at: '2026-11-03T01:15:00Z', // 08:15 WIB
    created_at: '2026-10-20T00:00:00Z',
    updated_at: '2026-11-03T01:15:00Z',
  },
  {
    id: 'a2222222-2222-2222-2222-222222222222',
    username: 'rania.meutia',
    display_name: 'Rania Meutia',
    tiktok_id: '7283948571928374652',
    avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
    status: 'active',
    last_sync_at: '2026-11-02T14:30:00Z', // 21:30 WIB
    created_at: '2026-10-20T00:00:00Z',
    updated_at: '2026-11-02T14:30:00Z',
  },
  {
    id: 'a3333333-3333-3333-3333-333333333333',
    username: 'nara.adelia_',
    display_name: 'Nara Adelia',
    tiktok_id: '7394857281920394857',
    avatar_url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&auto=format&fit=crop&q=80',
    status: 'active',
    last_sync_at: '2026-11-02T03:15:00Z', // 10:15 WIB
    created_at: '2026-10-20T00:00:00Z',
    updated_at: '2026-11-02T03:15:00Z',
  },
];

// Helper to identify dummy seed snapshots vs live scraped snapshots
export const isSeedSnapshot = (snapshot: AccountSnapshot): boolean => {
  if (!snapshot) return false;
  const id = snapshot.id || '';
  const jobId = snapshot.sync_job_id || '';
  return /^(snap-(intan|rania|nara|dinda|aqara|ai)-)/.test(id) ||
    /^(job-(intan|rania|nara|dinda|aqara|ai)-)/.test(jobId);
};

// Profile Snapshots for all 6 accounts
export const ALL_ACCOUNT_SNAPSHOTS: AccountSnapshot[] = [
  // 1. Intan Suar Kartika (Real numbers from TikTok: 20 followers, 228 likes, 100 videos)
  {
    id: 'snap-intan-1',
    account_id: 'a1111111-1111-1111-1111-111111111111',
    sync_job_id: 'job-intan-1',
    fans: 19,
    heart: 220,
    video_count: 98,
    captured_at: '2026-10-28T02:00:00Z',
  },
  {
    id: 'snap-intan-2',
    account_id: 'a1111111-1111-1111-1111-111111111111',
    sync_job_id: 'job-intan-2',
    fans: 19,
    heart: 224,
    video_count: 99,
    captured_at: '2026-10-30T02:00:00Z',
  },
  {
    id: 'snap-intan-3',
    account_id: 'a1111111-1111-1111-1111-111111111111',
    sync_job_id: 'job-intan-3',
    fans: 20,
    heart: 226,
    video_count: 100,
    captured_at: '2026-11-01T02:00:00Z',
  },
  {
    id: 'snap-intan-4',
    account_id: 'a1111111-1111-1111-1111-111111111111',
    sync_job_id: 'job-intan-4',
    fans: 20,
    heart: 227,
    video_count: 100,
    captured_at: '2026-11-02T02:00:00Z',
  },
  {
    id: 'snap-intan-5',
    account_id: 'a1111111-1111-1111-1111-111111111111',
    sync_job_id: 'job-intan-5',
    fans: 20, // +0 / +1 realistic organic
    heart: 228,
    video_count: 100,
    captured_at: '2026-11-03T01:45:00Z',
  },

  // 2. Rania Meutia
  {
    id: 'snap-rania-1',
    account_id: 'a2222222-2222-2222-2222-222222222222',
    sync_job_id: 'job-rania-1',
    fans: 25,
    heart: 320,
    video_count: 24,
    captured_at: '2026-10-29T03:00:00Z',
  },
  {
    id: 'snap-rania-2',
    account_id: 'a2222222-2222-2222-2222-222222222222',
    sync_job_id: 'job-rania-2',
    fans: 26,
    heart: 350,
    video_count: 24,
    captured_at: '2026-11-02T14:30:00Z',
  },

  // 3. Nara Adelia
  {
    id: 'snap-nara-1',
    account_id: 'a3333333-3333-3333-3333-333333333333',
    sync_job_id: 'job-nara-1',
    fans: 30,
    heart: 410,
    video_count: 18,
    captured_at: '2026-10-31T03:00:00Z',
  },
  {
    id: 'snap-nara-2',
    account_id: 'a3333333-3333-3333-3333-333333333333',
    sync_job_id: 'job-nara-2',
    fans: 31,
    heart: 425,
    video_count: 18,
    captured_at: '2026-11-02T03:15:00Z',
  },

  // 4. Dinda Kemala
  {
    id: 'snap-dinda-1',
    account_id: 'a4444444-4444-4444-4444-444444444444',
    sync_job_id: 'job-dinda-1',
    fans: 22,
    heart: 290,
    video_count: 21,
    captured_at: '2026-11-01T03:00:00Z',
  },
  {
    id: 'snap-dinda-2',
    account_id: 'a4444444-4444-4444-4444-444444444444',
    sync_job_id: 'job-dinda-2',
    fans: 23,
    heart: 305,
    video_count: 21,
    captured_at: '2026-11-03T01:15:00Z',
  },

  // 5. Aqara Indonesia (Realistic scale matching verified TikTok observations)
  {
    id: 'snap-aqara-1',
    account_id: 'a5555555-5555-5555-5555-555555555555',
    sync_job_id: 'job-aqara-1',
    fans: 20,
    heart: 228,
    video_count: 10,
    captured_at: '2026-11-01T02:00:00Z',
  },
  {
    id: 'snap-aqara-2',
    account_id: 'a5555555-5555-5555-5555-555555555555',
    sync_job_id: 'job-aqara-2',
    fans: 20,
    heart: 228,
    video_count: 10,
    captured_at: '2026-11-03T02:10:00Z',
  },

  // 6. The AI X Academy
  {
    id: 'snap-ai-1',
    account_id: 'a6666666-6666-6666-6666-666666666666',
    sync_job_id: 'job-ai-1',
    fans: 35,
    heart: 480,
    video_count: 15,
    captured_at: '2026-10-31T04:00:00Z',
  },
  {
    id: 'snap-ai-2',
    account_id: 'a6666666-6666-6666-6666-666666666666',
    sync_job_id: 'job-ai-2',
    fans: 36,
    heart: 495,
    video_count: 15,
    captured_at: '2026-11-02T16:20:00Z',
  },
];

// Helper to generate 10 posts per account
function generateAccountPosts(
  accountId: string,
  username: string,
  prefix: string,
  baseViews: number,
  captions: Array<{ text: string; isSlideshow: boolean }>
): { posts: Post[]; snapshots: PostSnapshot[] } {
  const posts: Post[] = [];
  const snapshots: PostSnapshot[] = [];

  captions.slice(0, 10).forEach((item, index) => {
    const postId = `${prefix}${index + 1}`;
    const hoursAgo = (index + 1) * 14;
    const createTime = new Date(Date.now() - hoursAgo * 3600000).toISOString();

    posts.push({
      id: postId,
      account_id: accountId,
      caption: item.text,
      create_time_iso: createTime,
      web_video_url: `https://www.tiktok.com/@${username}/video/${postId}`,
      is_slideshow: item.isSlideshow,
      is_pinned: index === 0,
      cover_url: `https://images.unsplash.com/photo-${1510000000000 + (index + 1) * 314159}?w=400&auto=format&fit=crop&q=80`,
      created_at: createTime,
      updated_at: createTime,
    });

    const play = Math.round(baseViews * (1.2 - index * 0.08) + (index % 3 === 0 ? baseViews * 0.4 : 0));
    const digg = Math.round(play * (0.07 + (index % 4) * 0.01));
    const comment = Math.round(digg * 0.05);
    const share = Math.round(digg * 0.09);

    // Current snapshot
    snapshots.push({
      id: `ps-${postId}-cur`,
      post_id: postId,
      sync_job_id: `job-${prefix}-cur`,
      play_count: play,
      digg_count: digg,
      comment_count: comment,
      share_count: share,
      captured_at: new Date().toISOString(),
    });

    // Previous snapshot for first 5 posts
    if (index < 5) {
      const prevPlay = Math.round(play * 0.85);
      snapshots.push({
        id: `ps-${postId}-prev`,
        post_id: postId,
        sync_job_id: `job-${prefix}-prev`,
        play_count: prevPlay,
        digg_count: Math.round(digg * 0.85),
        comment_count: Math.round(comment * 0.85),
        share_count: Math.round(share * 0.85),
        captured_at: new Date(Date.now() - 86400000).toISOString(),
      });
    }
  });

  return { posts, snapshots };
}

// 1. Intan Captions
const INTAN_DATA = generateAccountPosts(
  'a1111111-1111-1111-1111-111111111111',
  'intansuarkartika',
  '743289',
  280000,
  [
    { text: 'Tutorial makeup natural glowing buat daily hangout ✨ Spill shade di kolom komentar!', isSlideshow: false },
    { text: 'Foto OOTD aesthetic musim hujan 🌧️ slide favorit kamu yang ke berapa?', isSlideshow: true },
    { text: 'A day in my life: shooting konten seharian di studio baru 🎬', isSlideshow: false },
    { text: 'Rekomendasi serum brightening yang ga bikin breakout di kulit sensitif 🫧 #skincare', isSlideshow: false },
    { text: 'Ide pose foto di coffee shop biar kelihatan candid dan natural 📸', isSlideshow: true },
    { text: 'Unboxing PR package skincare viral minggu ini! Honest review ya no endorse 🤍', isSlideshow: false },
    { text: 'Morning routine produktif sebelum jam 9 pagi ☕️ Stretching & journaling dulu.', isSlideshow: false },
    { text: 'Koleksi parfum aroma vanila & warm floral yang tahan 12 jam di kulit 🌸', isSlideshow: true },
    { text: 'GRWM menghadiri event beauty awards bareng teman-teman creator ✨', isSlideshow: false },
    { text: 'Q&A tips konsisten bikin konten bagi pemula: mulai dari smartphone aja dulu!', isSlideshow: false },
  ]
);

// 2. Rania Captions
const RANIA_DATA = generateAccountPosts(
  'a2222222-2222-2222-2222-222222222222',
  'rania.meutia',
  '728394',
  210000,
  [
    { text: 'Mix & match blazer oversize buat ngantor vs hangout 💼 #OOTD #hijabstyle', isSlideshow: false },
    { text: '5 Outfit ideas warna earth tone buat weekend getaway 🍂', isSlideshow: true },
    { text: 'Review honest tas lokal brand yang muat banyak & tahan air ✨', isSlideshow: false },
    { text: 'Tips styling celana kulot biar kelihatan lebih jenjang 📏', isSlideshow: true },
    { text: 'Get ready with me: attending Jakarta Fashion Week 👠', isSlideshow: false },
    { text: 'Rekomendasi sepatu loafers ternyaman buat jalan seharian 👞', isSlideshow: true },
    { text: 'Unboxing haul modest wear edisi musim hujan 🌧️', isSlideshow: false },
    { text: 'Capsule wardrobe 101: 7 item baju untuk 14 looks berbeda 👗', isSlideshow: true },
    { text: 'A day in my life: fitting baju bareng stylist & photoshoot 📸', isSlideshow: false },
    { text: 'Q&A tips pilih tone warna hijab yang bikin wajah cerah 🧕', isSlideshow: false },
  ]
);

// 3. Nara Captions
const NARA_DATA = generateAccountPosts(
  'a3333333-3333-3333-3333-333333333333',
  'nara.adelia_',
  '739485',
  160000,
  [
    { text: 'Step by step double cleansing yang bener biar pori-pori bersih tuntas 🫧 #skincare', isSlideshow: false },
    { text: 'Perbedaan physical vs chemical sunscreen: mana yang cocok buat kamu? ☀️', isSlideshow: true },
    { text: 'Kandungan skincare yang gaboleh di-layer bersamaan! Catat ya ⚠️', isSlideshow: true },
    { text: 'Review cushion viral dengan satin finish: tahan 8 jam tanpa touch-up? 🤔', isSlideshow: false },
    { text: 'Morning routine mengatasi kulit kemerahan dan skin barrier rusak 🌿', isSlideshow: false },
    { text: 'Swatches 6 shade liptint lokal paling flattering di undertone warm 💄', isSlideshow: true },
    { text: 'Tips eksfoliasi untuk pemula tanpa bikin kulit iritasi / purging 🧖‍♀️', isSlideshow: false },
    { text: 'Battle eye cream penghilang mata panda: hasilnya setelah 2 minggu 👁️', isSlideshow: true },
    { text: 'Skincare empties bulan ini: mana yang bakal repurchase? 🗑️', isSlideshow: false },
    { text: 'Budget skincare routine di bawah 200 ribu untuk pelajar/mahasiswa 💸', isSlideshow: false },
  ]
);

// 4. Dinda Captions
const DINDA_DATA = generateAccountPosts(
  'a4444444-4444-4444-4444-444444444444',
  'dinda.kemala_',
  '748392',
  190000,
  [
    { text: 'Explore hidden gem cafe estetik di Bandung yang punya view pegunungan ⛰️ #kuliner', isSlideshow: false },
    { text: 'Photospot gratis di Jakarta yang vibesnya kayak di luar negeri 🏙️', isSlideshow: true },
    { text: 'Vlog seharian kulineran malam di Pasar Baru: habis berapa ya? 🍜', isSlideshow: false },
    { text: 'Packing tips koper cabin size muat baju buat trip 5 hari 🧳', isSlideshow: true },
    { text: 'Solo travel pertama ke Jogja: itinerary lengkap & estimasi budget 🚂', isSlideshow: false },
    { text: 'Rekomendasi tempat ngopi cozy buat nugas & WFC di Jaksel ☕', isSlideshow: true },
    { text: 'Weekend photo dump: hunting sunset di pantai pasir putih 🌅', isSlideshow: true },
    { text: 'Review staycation di glamping aesthetic: worth it ga ya? ⛺', isSlideshow: false },
    { text: 'Tutorial bikin video cinematic travel hanya bermodalkan HP 📱', isSlideshow: false },
    { text: 'Hal-hal yang wajib kamu perhatikan sebelum liburan naik kereta sleeper 🚆', isSlideshow: false },
  ]
);

// 5. Aqara Captions
const AQARA_DATA = generateAccountPosts(
  'a5555555-5555-5555-5555-555555555555',
  'aqara.indonesia',
  '755100',
  110000,
  [
    { text: 'Smart Door Lock U100 dengan Apple HomeKit & fingerprint unlock 🔑 #smarthome', isSlideshow: false },
    { text: 'Cara bikin lampu otomatis nyala pas kamu masuk ruangan pakai FP2 Presence Sensor 💡', isSlideshow: true },
    { text: 'Unboxing Camera Hub G3: Smart camera dengan AI gesture recognition & pan-tilt 🎥', isSlideshow: false },
    { text: 'Setup sensor kebocoran air Water Leak Sensor biar rumah ga banjir saat liburan 🚰', isSlideshow: false },
    { text: 'Otomasi tirai jendela Smart Curtain Driver E1: bangun pagi auto terang ✨ #tipsrumah', isSlideshow: true },
    { text: 'Bikin bioskop pribadi di kamar: lampu redup otomatis saat proyektor nyala 🎬', isSlideshow: false },
    { text: 'Kenapa smart switch Aqara lebih aman daripada saklar pintar abal-abal? ⚡️', isSlideshow: true },
    { text: 'Smart Pet Feeder C1: kasih makan kucing otomatis terjadwal dari smartphone 🐱', isSlideshow: false },
    { text: 'Otomasi AC mati sendiri saat jendela terbuka pakai Door & Window Sensor ❄️', isSlideshow: true },
    { text: 'Panduan setup Zigbee Hub M2 untuk pemula: mudah dan tanpa pusing 🔌', isSlideshow: false },
  ]
);

// 6. The AI X Academy Captions
const AI_DATA = generateAccountPosts(
  'a6666666-6666-6666-6666-666666666666',
  'the.ai.x.academy',
  '766100',
  230000,
  [
    { text: '5 Framework Prompt Engineering terbaik untuk riset & coding tahun 2026 🧠 #AI #tech', isSlideshow: false },
    { text: 'Cheatsheet shortcut AI tool yang wajib kamu bookmark minggu ini! 📌 Simpan ya.', isSlideshow: true },
    { text: 'Workflow otomatisasi laporan bisnis dengan AI Agent: pangkas waktu hingga 15 jam ⚡️', isSlideshow: false },
    { text: 'Perbandingan model AI terbaru untuk data analysis: mana yang paling akurat? 📊', isSlideshow: true },
    { text: 'Tutorial bikin AI Assistant pribadi tanpa coding dari scratch 🤖 #automation', isSlideshow: false },
    { text: 'Cara pakai AI untuk riset kompetitor bisnis dalam 10 menit 💼', isSlideshow: true },
    { text: 'Generative AI tools terbaik untuk pembuatan slide presentasi pitch deck 📈', isSlideshow: false },
    { text: 'Prompt rahasia untuk merangkum buku 300 halaman menjadi action items 📚', isSlideshow: true },
    { text: 'Cara integrasi ChatGPT dengan Google Sheets untuk automasi data entry 📊', isSlideshow: false },
    { text: 'Masa depan pekerjaan di era AI 2026: skill apa yang paling dicari perusahaan? 🎯', isSlideshow: false },
  ]
);

// Combine all posts and snapshots
export const ALL_SEEDED_POSTS: Post[] = [
  ...INTAN_DATA.posts,
  ...RANIA_DATA.posts,
  ...NARA_DATA.posts,
  ...DINDA_DATA.posts,
  ...AQARA_DATA.posts,
  ...AI_DATA.posts,
];

export const ALL_SEEDED_POST_SNAPSHOTS: PostSnapshot[] = [
  ...INTAN_DATA.snapshots,
  ...RANIA_DATA.snapshots,
  ...NARA_DATA.snapshots,
  ...DINDA_DATA.snapshots,
  ...AQARA_DATA.snapshots,
  ...AI_DATA.snapshots,
];

// Jobs history
export const INITIAL_JOBS: SyncJob[] = [
  {
    id: 'job-intan-5',
    account_id: 'a1111111-1111-1111-1111-111111111111',
    apify_run_id: 'run-apify-intan-05',
    apify_dataset_id: 'ds-apify-intan-05',
    status: 'succeeded',
    started_at: '2026-11-03T01:44:15Z',
    completed_at: '2026-11-03T01:45:00Z',
    results_count: 10,
    charged_usd: 0.0315,
    created_at: '2026-11-03T01:44:15Z',
  },
  {
    id: 'job-rania-2',
    account_id: 'a2222222-2222-2222-2222-222222222222',
    apify_run_id: 'run-apify-rania-02',
    apify_dataset_id: 'ds-apify-rania-02',
    status: 'succeeded',
    started_at: '2026-11-02T14:29:10Z',
    completed_at: '2026-11-02T14:30:00Z',
    results_count: 10,
    charged_usd: 0.032,
    created_at: '2026-11-02T14:29:10Z',
  },
  {
    id: 'job-aqara-2',
    account_id: 'a5555555-5555-5555-5555-555555555555',
    apify_run_id: 'run-apify-aqara-02',
    apify_dataset_id: 'ds-apify-aqara-02',
    status: 'succeeded',
    started_at: '2026-11-03T02:09:10Z',
    completed_at: '2026-11-03T02:10:00Z',
    results_count: 10,
    charged_usd: 0.031,
    created_at: '2026-11-03T02:09:10Z',
  },
];

// Usage ledger records
export const INITIAL_USAGE: UsageLedgerEntry[] = [
  {
    id: 'use-01',
    account_id: 'a1111111-1111-1111-1111-111111111111',
    account_username: 'intansuarkartika',
    sync_job_id: 'job-intan-5',
    billing_cycle: '2026-11',
    reserved_usd: 0.05,
    final_charged_usd: 0.0315,
    status: 'finalized',
    created_at: '2026-11-03T01:45:00Z',
  },
  {
    id: 'use-02',
    account_id: 'a2222222-2222-2222-2222-222222222222',
    account_username: 'rania.meutia',
    sync_job_id: 'job-rania-2',
    billing_cycle: '2026-11',
    reserved_usd: 0.05,
    final_charged_usd: 0.032,
    status: 'finalized',
    created_at: '2026-11-02T14:30:00Z',
  },
  {
    id: 'use-03',
    account_id: 'a5555555-5555-5555-5555-555555555555',
    account_username: 'aqara.indonesia',
    sync_job_id: 'job-aqara-2',
    billing_cycle: '2026-11',
    reserved_usd: 0.05,
    final_charged_usd: 0.031,
    status: 'finalized',
    created_at: '2026-11-03T02:10:00Z',
  },
];
