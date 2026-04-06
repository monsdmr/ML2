const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SIGMAPAY_BASE_URL = 'https://api.sigmapay.com.br/api/public/v1';
const TIKTOK_EVENTS_URL = 'https://business-api.tiktok.com/open_api/v1.3/event/track/';
const TIKTOK_PIXEL_ID = 'CUMCLS3C77UCJ3CPMCN0';

async function sendTikTokInitiateCheckout(amount: number, email: string | null, reference: string) {
  const accessToken = Deno.env.get('TIKTOK_ACCESS_TOKEN');
  if (!accessToken) {
    console.warn('TIKTOK_ACCESS_TOKEN not set, skipping S2S InitiateCheckout');
    return;
  }

  const eventPayload = {
    pixel_code: TIKTOK_PIXEL_ID,
    event: 'InitiateCheckout',
    event_id: `checkout_${reference}`,
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
      description: 'PIX gerado',
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
    console.log('TikTok S2S InitiateCheckout result:', JSON.stringify(result));
  } catch (err) {
    console.error('TikTok S2S InitiateCheckout error:', err);
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiToken = Deno.env.get('SIGMAPAY_API_TOKEN');
    if (!apiToken) {
      return new Response(
        JSON.stringify({ success: false, error: 'SIGMAPAY_API_TOKEN not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const body = await req.json();
    const { amount, customer, cart } = body;

    if (!amount || !customer) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required fields: amount, customer' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const webhookUrl = `${supabaseUrl}/functions/v1/sigmapay-webhook`;

    // Se o valor termina em ,00 (centavos = 0), adiciona 23 centavos
    const adjustedAmount = Math.round(amount) % 100 === 0 ? Math.round(amount) + 23 : Math.round(amount);

    // Generate unique reference
    const reference = `REF-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

    const description = (cart && cart.length > 0 && cart[0].title) ? cart[0].title : 'Produto';

    const payload: Record<string, unknown> = {
      offer_hash: 'deodkouvlq',
      api_token: apiToken,
      payment_method: 'pix',
      amount: adjustedAmount,
      customer: {
        name: (customer.name || '').trim(),
        email: (customer.email || '').trim().replace(/\.+$/, ''),
        phone_number: (customer.phone_number || '').replace(/\D/g, ''),
        document: (customer.document || '').replace(/\D/g, ''),
      },
      cart: [{
        product_hash: '9klzrleqaz',
        title: description,
        cover: null,
        price: adjustedAmount,
        quantity: 1,
        operation_type: 1,
        tangible: false,
      }],
      postback_url: webhookUrl,
    };

    console.log('Creating SigmaPay PIX transaction:', JSON.stringify(payload));

    const response = await fetch(`${SIGMAPAY_BASE_URL}/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${apiToken}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('SigmaPay API error:', JSON.stringify(data));
      return new Response(
        JSON.stringify({ success: false, error: data.message || data.error || `SigmaPay error: ${response.status}`, details: data }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('SigmaPay response:', JSON.stringify(data));

    // Extract PIX data from SigmaPay response format
    const pixData = data.pix || {};
    const pixCopyPaste = pixData.pix_qr_code || data.qr_code || data.pix_code || '';
    const pixUrl = pixData.pix_url || '';
    const pixQrBase64 = pixData.qr_code_base64 || data.qr_code_base64 || '';

    // Check if no PIX data was returned
    if (!pixCopyPaste && !pixUrl) {
      console.warn('No PIX data returned:', JSON.stringify(data));
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Não foi possível gerar o PIX. Tente novamente.',
          details: data,
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const txHash = data.hash || data.transaction || data.id?.toString() || reference;

    // Save transaction to database
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { error: insertError } = await supabase.from('transactions').insert({
      transaction_hash: txHash,
      sigmapay_id: data.id?.toString() || '',
      amount: adjustedAmount,
      status: 'pending',
      payment_method: 'pix',
      customer_name: customer.name,
      customer_email: customer.email,
      customer_document: (customer.document || '').replace(/\D/g, ''),
      pix_code: pixCopyPaste,
      pix_qr_code_url: pixUrl || pixQrBase64,
    });

    if (insertError) {
      console.error('Error saving transaction:', insertError);
    }

    // Fire TikTok S2S InitiateCheckout event
    const customerEmail = (customer.email || '').trim().replace(/\.+$/, '');
    await sendTikTokInitiateCheckout(adjustedAmount, customerEmail || null, txHash);

    return new Response(
      JSON.stringify({
        success: true,
        data,
        transaction_hash: txHash,
        pix_code: pixCopyPaste,
        pix_qr_code_url: pixUrl || pixQrBase64,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error creating PIX transaction:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
