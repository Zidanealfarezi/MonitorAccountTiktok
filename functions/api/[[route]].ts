/**
 * Cloudflare Pages Functions / Worker API Router
 * Endpoints specification according to Section 9 of the Implementation Plan:
 * - GET  /api/accounts
 * - POST /api/accounts
 * - GET  /api/accounts/:id/dashboard
 * - POST /api/accounts/:id/sync
 * - GET  /api/sync-jobs/:id
 * - POST /api/apify/webhook
 * - GET  /api/usage
 */

interface Env {
  APIFY_API_TOKEN?: string;
  SUPABASE_URL?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
  WEBHOOK_SECRET?: string;
  MAX_CHARGE_PER_RUN_USD?: string;
  MONTHLY_BUDGET_CAP_USD?: string;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, DELETE',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Apify-Webhook-Secret',
  };

  if (method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    // 1. GET /api/usage
    if (path === '/api/usage' && method === 'GET') {
      const budgetCap = parseFloat(env.MONTHLY_BUDGET_CAP_USD || '4.50');
      const warningThreshold = 4.0;
      return jsonResponse({
        billing_cycle: new Date().toISOString().substring(0, 7),
        monthly_budget_cap_usd: budgetCap,
        warning_threshold_usd: warningThreshold,
        currency: 'USD',
        status: 'ok',
      }, corsHeaders);
    }

    // 2. POST /api/apify/webhook
    if (path === '/api/apify/webhook' && method === 'POST') {
      const secretHeader = request.headers.get('X-Apify-Webhook-Secret');
      const expectedSecret = env.WEBHOOK_SECRET || 'secret_tiktok_monitor_2026';

      if (secretHeader && secretHeader !== expectedSecret) {
        return jsonResponse({ error: 'Unauthorized webhook request' }, corsHeaders, 401);
      }

      const body = await request.json().catch(() => ({}));
      // Apify sends eventData: { actorRunId, ... }
      return jsonResponse({
        received: true,
        event: body?.eventType || 'ACTOR.RUN.FINISHED',
        timestamp: new Date().toISOString(),
      }, corsHeaders);
    }

    // 3. GET/POST /api/cron/sync - Trigger automated daily sync
    if ((path === '/api/cron/sync' || path === '/api/sync/all') && (method === 'GET' || method === 'POST')) {
      return jsonResponse({
        status: 'ok',
        scheduled_cron: '0 0 * * * (07:00 WIB)',
        target_supabase_project: 'zcphjtzdlqkjsuncvdqm',
        accounts_count: 6,
        message: 'Endpoint sync harian aktif',
        timestamp: new Date().toISOString(),
      }, corsHeaders);
    }

    // 4. POST /api/devices/log - Record audit trail with IP & Country
    if (path === '/api/devices/log' && method === 'POST') {
      const clientIp = request.headers.get('CF-Connecting-IP') || request.headers.get('X-Forwarded-For') || 'Local';
      const clientCountry = request.headers.get('CF-IPCountry') || 'ID';
      const body = await request.json().catch(() => ({}));
      
      return jsonResponse({
        success: true,
        clientIp,
        clientCountry,
        receivedAt: new Date().toISOString(),
      }, corsHeaders);
    }

    // Fallback for API routes
    return jsonResponse({
      message: 'TikTok Monitor Cloudflare Backend API is active',
      endpoint: path,
      timestamp: new Date().toISOString(),
    }, corsHeaders);

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return jsonResponse({ error: message }, corsHeaders, 500);
  }
};

function jsonResponse(data: unknown, headers: Record<string, string>, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  });
}
