-- ==========================================================
-- Migration: TikTok Account Monitoring Database Schema
-- Date: 2026-11-03
-- Engine: PostgreSQL / Supabase
-- Target: Cloudflare Pages + Worker + Apify TikTok Scraper
-- ==========================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Accounts Table
-- Stores monitored TikTok accounts for the owner
CREATE TABLE IF NOT EXISTS public.accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    username VARCHAR(100) NOT NULL,
    display_name VARCHAR(150) NOT NULL,
    tiktok_id VARCHAR(100),
    avatar_url TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'error')),
    last_sync_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_owner_username UNIQUE (user_id, username)
);

CREATE INDEX IF NOT EXISTS idx_accounts_username ON public.accounts (username);
CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON public.accounts (user_id);

-- 2. Sync Jobs Table
-- Tracks every Apify scraper run per account with status and costs
CREATE TABLE IF NOT EXISTS public.sync_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
    apify_run_id VARCHAR(100),
    apify_dataset_id VARCHAR(100),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'succeeded', 'failed', 'partial')),
    started_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    completed_at TIMESTAMPTZ,
    results_count INTEGER NOT NULL DEFAULT 0,
    charged_usd NUMERIC(8, 4) NOT NULL DEFAULT 0.0000,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_sync_jobs_account_id ON public.sync_jobs (account_id);
CREATE INDEX IF NOT EXISTS idx_sync_jobs_status ON public.sync_jobs (status);
CREATE INDEX IF NOT EXISTS idx_sync_jobs_apify_run_id ON public.sync_jobs (apify_run_id);

-- Enforce maximum of ONE active (pending/running) job per account
CREATE UNIQUE INDEX IF NOT EXISTS idx_single_active_job_per_account 
ON public.sync_jobs (account_id) 
WHERE status IN ('pending', 'running');

-- 3. Account Snapshots Table
-- Historical profile metrics snapshot for each sync job
CREATE TABLE IF NOT EXISTS public.account_snapshots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
    sync_job_id UUID REFERENCES public.sync_jobs(id) ON DELETE SET NULL,
    fans BIGINT, -- followers count (nullable if provider didn't return it)
    heart BIGINT, -- total profile likes
    video_count INTEGER, -- total published posts
    captured_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_account_snapshots_account_time ON public.account_snapshots (account_id, captured_at DESC);

-- 4. Posts Table
-- Stores metadata of tracked TikTok posts (ID stored as TEXT to prevent 64-bit int precision loss)
CREATE TABLE IF NOT EXISTS public.posts (
    id VARCHAR(100) PRIMARY KEY, -- TikTok Post / Video ID
    account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
    caption TEXT NOT NULL DEFAULT '',
    create_time_iso TIMESTAMPTZ NOT NULL,
    web_video_url TEXT NOT NULL,
    is_slideshow BOOLEAN NOT NULL DEFAULT FALSE,
    is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
    cover_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_posts_account_id ON public.posts (account_id);
CREATE INDEX IF NOT EXISTS idx_posts_create_time ON public.posts (create_time_iso DESC);

-- 5. Post Snapshots Table
-- Point-in-time metrics for each post per sync job
CREATE TABLE IF NOT EXISTS public.post_snapshots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id VARCHAR(100) NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    sync_job_id UUID REFERENCES public.sync_jobs(id) ON DELETE SET NULL,
    play_count BIGINT, -- views (nullable if not returned)
    digg_count BIGINT, -- likes
    comment_count BIGINT,
    share_count BIGINT,
    captured_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_post_sync_job UNIQUE (post_id, sync_job_id)
);

CREATE INDEX IF NOT EXISTS idx_post_snapshots_post_time ON public.post_snapshots (post_id, captured_at DESC);
CREATE INDEX IF NOT EXISTS idx_post_snapshots_sync_job ON public.post_snapshots (sync_job_id);

-- 6. Usage Ledger Table
-- Tracks credit reservations and actual Apify charges
CREATE TABLE IF NOT EXISTS public.usage_ledger (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    account_id UUID REFERENCES public.accounts(id) ON DELETE SET NULL,
    sync_job_id UUID REFERENCES public.sync_jobs(id) ON DELETE SET NULL,
    billing_cycle VARCHAR(7) NOT NULL, -- Format: 'YYYY-MM'
    reserved_usd NUMERIC(8, 4) NOT NULL DEFAULT 0.0500,
    final_charged_usd NUMERIC(8, 4) NOT NULL DEFAULT 0.0000,
    status VARCHAR(20) NOT NULL DEFAULT 'reserved' CHECK (status IN ('reserved', 'finalized', 'released')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_usage_ledger_billing_cycle ON public.usage_ledger (billing_cycle);
CREATE INDEX IF NOT EXISTS idx_usage_ledger_user ON public.usage_ledger (user_id);

-- 7. Row Level Security (RLS)
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.account_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_ledger ENABLE ROW LEVEL SECURITY;

-- Allow authenticated owners to manage their own records
CREATE POLICY "Users can manage their own accounts" 
ON public.accounts FOR ALL 
USING (auth.uid() = user_id OR user_id IS NULL)
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can manage sync jobs" 
ON public.sync_jobs FOR ALL 
USING (EXISTS (SELECT 1 FROM public.accounts WHERE accounts.id = sync_jobs.account_id AND (accounts.user_id = auth.uid() OR accounts.user_id IS NULL)))
WITH CHECK (EXISTS (SELECT 1 FROM public.accounts WHERE accounts.id = sync_jobs.account_id AND (accounts.user_id = auth.uid() OR accounts.user_id IS NULL)));

CREATE POLICY "Users can manage account snapshots" 
ON public.account_snapshots FOR ALL 
USING (EXISTS (SELECT 1 FROM public.accounts WHERE accounts.id = account_snapshots.account_id AND (accounts.user_id = auth.uid() OR accounts.user_id IS NULL)))
WITH CHECK (EXISTS (SELECT 1 FROM public.accounts WHERE accounts.id = account_snapshots.account_id AND (accounts.user_id = auth.uid() OR accounts.user_id IS NULL)));

CREATE POLICY "Users can manage posts" 
ON public.posts FOR ALL 
USING (EXISTS (SELECT 1 FROM public.accounts WHERE accounts.id = posts.account_id AND (accounts.user_id = auth.uid() OR accounts.user_id IS NULL)))
WITH CHECK (EXISTS (SELECT 1 FROM public.accounts WHERE accounts.id = posts.account_id AND (accounts.user_id = auth.uid() OR accounts.user_id IS NULL)));

CREATE POLICY "Users can manage post snapshots" 
ON public.post_snapshots FOR ALL 
USING (EXISTS (
    SELECT 1 FROM public.posts 
    JOIN public.accounts ON accounts.id = posts.account_id
    WHERE posts.id = post_snapshots.post_id AND (accounts.user_id = auth.uid() OR accounts.user_id IS NULL)
))
WITH CHECK (EXISTS (
    SELECT 1 FROM public.posts 
    JOIN public.accounts ON accounts.id = posts.account_id
    WHERE posts.id = post_snapshots.post_id AND (accounts.user_id = auth.uid() OR accounts.user_id IS NULL)
));

CREATE POLICY "Users can manage usage ledger" 
ON public.usage_ledger FOR ALL 
USING (auth.uid() = user_id OR user_id IS NULL)
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- 8. Seed Initial 6 Accounts (if not exists)
INSERT INTO public.accounts (id, username, display_name, status)
VALUES 
  ('a1111111-1111-1111-1111-111111111111', 'intansuarkartika', 'Intan Suar Kartika', 'active'),
  ('a6666666-6666-6666-6666-666666666666', 'the.ai.x.academy', 'The AI X Academy', 'active'),
  ('a5555555-5555-5555-5555-555555555555', 'aqara.indonesia', 'Aqara Indonesia', 'active'),
  ('a4444444-4444-4444-4444-444444444444', 'dinda.kemala_', 'Dinda Kemala', 'active'),
  ('a2222222-2222-2222-2222-222222222222', 'rania.meutia', 'Rania Meutia', 'active'),
  ('a3333333-3333-3333-3333-333333333333', 'nara.adelia_', 'Nara Adelia', 'active')
ON CONFLICT DO NOTHING;
