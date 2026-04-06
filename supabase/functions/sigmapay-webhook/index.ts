const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const TIKTOK_EVENTS_URL = 'https://business-api.tiktok.com/open_api/v1.3/event/track/';
const TIKTOK_PIXEL_ID = 'CUMCLS3C77UCJ3CPMCN0';

async function sendTikTokEvent(amount: number, email: string | null, transactionHash: string) {
  const accessToken = Deno.env.get('TIKTOK_ACCESS_TOKEN');
  if (!accessToken) {
    console.warn('TIKTOK_ACCESS_TOKEN not set, skipping S2S event');
    return;
  }

  const eventPayload = {
    pixel_code: TIKTOK_PIXEL_ID,
    event: 'CompletePayment',
    event_id: `payment_${transactionHash}`,
    event_time: Math.floor(Date.now() / 1000),
    timestamp: new Date().toISOString(),
    context: {
      user: {
        ...(email ? { email: email.toLowerCase().trim() } : {}),
      },
    },
    properties: {
      content_type: 'product',
      currency: 'BRL',
      value: amount / 100,
      description: 'Pagamento confirmado',
    },
  };

  try {
    const res = await fetch(TIKTOK_EVENTS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Access-Token': accessToken,
      },
      body: JSON.stringify({ event_source: 'web', event_source_id: TIKTOK_PIXEL_ID, data: [eventPayload] }),
    });
    const result = await res.json();
    console.log('TikTok S2S event result:', JSON.stringify(result));
  } catch (err) {
    console.error('TikTok S2S event error:', err);
  }
}

/**
 * Normalize incoming postback into { transactionId, externalId, status }
 * Supports multiple formats:
 * 1. Direct format: { transaction_id, external_id, status: "approved" }
 * 2. SIGMApay with token: { token, transaction (string hash or object), payment_status/status }
 * 3. Simple format: { hash/id, status/payment_status }
 */
function parsePostback(body: Record<string, unknown>): { transactionId: string; externalId: string; rawStatus: string } {
  // Format 1: Direct (has transaction_id or external_id at top level)
  if (body.transaction_id || body.external_id) {
    return {
      transactionId: body.transaction_id?.toString() || '',
      externalId: (body.external_id as string) || '',
      rawStatus: (body.payment_status as string) || (body.status as string) || '',
    };
  }

  // Format 2: SIGMApay (has "token" field)
  if (body.token) {
    const tx = body.transaction;
    let transactionId = '';
    let externalId = '';
    let rawStatus = '';

    if (typeof tx === 'string') {
      // SIGMApay v2: transaction is a string hash
      transactionId = tx;
      rawStatus = (body.payment_status as string) || (body.status as string) || '';
    } else if (tx && typeof tx === 'object') {
      // SIGMApay v1: transaction is an object { id, status }
      const txObj = tx as Record<string, unknown>;
      transactionId = txObj.id?.toString() || '';
      rawStatus = (txObj.status as string) || (body.payment_status as string) || (body.status as string) || '';
    }

    // Use body.hash as externalId so we can also match by it
    if (body.hash && body.hash !== transactionId) {
      externalId = (body.hash as string);
    }

    // Fallback identifiers
    if (!transactionId) {
      transactionId = (body.hash as string) || body.id?.toString() || '';
    }

    return { transactionId, externalId, rawStatus };
  }

  // Format 3: Simple format with hash or id
  if (body.hash || body.id) {
    return {
      transactionId: (body.hash as string) || body.id?.toString() || '',
      externalId: '',
      rawStatus: (body.payment_status as string) || (body.status as string) || '',
    };
  }

  return { transactionId: '', externalId: '', rawStatus: '' };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    console.log('SigmaPay postback received:', JSON.stringify(body));

    const { transactionId, externalId, rawStatus } = parsePostback(body);

    // Map statuses to internal statuses
    const statusMap: Record<string, string> = {
      'approved': 'paid',
      'paid': 'paid',
      'completed': 'paid',
      'pending': 'pending',
      'processing': 'pending',
      'waiting_payment': 'pending',
      'under_review': 'pending',
      'cancelled': 'cancelled',
      'canceled': 'cancelled',
      'failed': 'refused',
      'refused': 'refused',
      'refunded': 'refunded',
      'chargeback': 'chargedback',
    };
    const status = statusMap[rawStatus] || rawStatus;

    if ((!transactionId && !externalId) || !status) {
      console.error('Missing transaction identifier or status in postback');
      return new Response(
        JSON.stringify({ success: false, error: 'Missing transaction identifier or status' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const updateData: Record<string, unknown> = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (status === 'paid') {
      updateData.paid_at = body.timestamp || (body as any).paid_at || new Date().toISOString();
    }

    // Match by transaction_hash or sigmapay_id
    const filters = [];
    if (transactionId) {
      filters.push(`transaction_hash.eq.${transactionId}`);
      filters.push(`sigmapay_id.eq.${transactionId}`);
    }
    if (externalId) {
      filters.push(`transaction_hash.eq.${externalId}`);
    }

    const { error: updateError } = await supabase
      .from('transactions')
      .update(updateData)
      .or(filters.join(','));

    if (updateError) {
      console.error('Error updating transaction:', updateError);
      return new Response(
        JSON.stringify({ success: false, error: updateError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fire TikTok S2S event + Pushcut notification on successful payment
    if (status === 'paid') {
      const { data: txData } = await supabase
        .from('transactions')
        .select('amount, customer_email, customer_name')
        .or(filters.join(','))
        .maybeSingle();

      if (txData) {
        await sendTikTokEvent(txData.amount, txData.customer_email, transactionId || externalId);

        // Pushcut webhook notification
        try {
          const valorReais = (txData.amount / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
          await fetch('https://api.pushcut.io/lEDQ_gK03eKNFAL8PQNFV/notifications/MinhaNotifica%C3%A7%C3%A3o', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: '💰 Venda Aprovada!',
              text: `${txData.customer_name || 'Cliente'} - ${valorReais}`,
            }),
          });
          console.log('Pushcut notification sent');
        } catch (pushErr) {
          console.error('Pushcut notification error:', pushErr);
        }
      }
    }

    console.log(`Transaction ${transactionId || externalId} updated to status: ${status}`);
    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Webhook error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
