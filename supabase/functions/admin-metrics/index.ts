import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { password } = await req.json();
    const adminPassword = Deno.env.get('ADMIN_PASSWORD') || 'admin2026';

    if (password !== adminPassword) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Get all transactions
    const { data: transactions, error } = await supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Get page views for funnel
    const { data: pageViews, error: pvError } = await supabase
      .from('page_views')
      .select('page, session_id, created_at');

    if (pvError) throw pvError;

    // Active users (last 5 minutes)
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const recentViews = (pageViews || []).filter((pv: any) => pv.created_at >= fiveMinAgo);
    const activeSessions = new Set(recentViews.map((v: any) => v.session_id).filter(Boolean));
    const activePageSessions: Record<string, Set<string>> = {};
    for (const v of recentViews) {
      if (v.session_id) {
        if (!activePageSessions[v.page]) activePageSessions[v.page] = new Set();
        activePageSessions[v.page].add(v.session_id);
      }
    }
    const activeByPage: Record<string, number> = {};
    for (const [page, sessions] of Object.entries(activePageSessions)) {
      activeByPage[page] = sessions.size;
    }

    // Count unique sessions per page
    const funnelPages = ['pressel', 'quiz', 'roleta', 'ofertas', 'produto', 'checkout', 'success'];
    const funnel: Record<string, { total: number; unique: number }> = {};

    for (const page of funnelPages) {
      const pageData = (pageViews || []).filter((pv: any) => pv.page === page);
      const uniqueSessions = new Set(pageData.map((pv: any) => pv.session_id).filter(Boolean));
      funnel[page] = {
        total: pageData.length,
        unique: uniqueSessions.size,
      };
    }

    const allTx = transactions || [];
    const paidTx = allTx.filter(t => t.status === 'paid');
    const pendingTx = allTx.filter(t => t.status === 'pending');

    const totalRevenue = paidTx.reduce((sum, t) => sum + (t.amount / 100), 0);
    const today = new Date().toISOString().split('T')[0];
    const todayTx = paidTx.filter(t => t.created_at?.startsWith(today));
    const todayRevenue = todayTx.reduce((sum, t) => sum + (t.amount / 100), 0);

    // Pixel event counts derived from data
    const allPV = pageViews || [];
    const pixelEvents = {
      PageView: allPV.length,
      ViewContent: allPV.filter((pv: any) => pv.page === 'produto').length,
      AddToCart: allPV.filter((pv: any) => pv.page === 'produto').length,
      InitiateCheckout: allPV.filter((pv: any) => pv.page === 'checkout').length,
      CompletePayment: paidTx.length,
    };

    return new Response(
      JSON.stringify({
        summary: {
          totalTransactions: allTx.length,
          paidTransactions: paidTx.length,
          pendingTransactions: pendingTx.length,
          totalRevenue,
          todayRevenue,
          todayPaid: todayTx.length,
        },
        funnel,
        pixelEvents,
        realtime: {
          activeUsers: activeSessions.size,
          byPage: activeByPage,
        },
        transactions: allTx.slice(0, 100),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('Admin metrics error:', msg);
    return new Response(
      JSON.stringify({ error: msg }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
