const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const TIKTOK_EVENTS_URL = 'https://business-api.tiktok.com/open_api/v1.3/event/track/';
const TIKTOK_PIXEL_ID = 'CUMCLS3C77UCJ3CPMCN0';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const accessToken = Deno.env.get('TIKTOK_ACCESS_TOKEN');
    if (!accessToken) {
      console.warn('TIKTOK_ACCESS_TOKEN not set, skipping S2S ViewContent');
      return new Response(JSON.stringify({ ok: true, skipped: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { content_id, content_name, value, currency, session_id } = await req.json();

    const eventPayload = {
      pixel_code: TIKTOK_PIXEL_ID,
      event: 'ViewContent',
      event_id: `viewcontent_${content_id}_${session_id || Date.now()}`,
      event_time: Math.floor(Date.now() / 1000),
      timestamp: new Date().toISOString(),
      context: {
        user: {},
      },
      properties: {
        content_type: 'product',
        content_id: String(content_id),
        content_name: content_name || '',
        currency: currency || 'BRL',
        value: value || 0,
      },
    };

    const res = await fetch(TIKTOK_EVENTS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Access-Token': accessToken,
      },
      body: JSON.stringify({
        event_source: 'web',
        event_source_id: TIKTOK_PIXEL_ID,
        data: [eventPayload],
      }),
    });

    const result = await res.json();
    console.log('TikTok S2S ViewContent result:', JSON.stringify(result));

    return new Response(JSON.stringify({ ok: true, result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('TikTok S2S ViewContent error:', err);
    return new Response(JSON.stringify({ ok: false, error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
