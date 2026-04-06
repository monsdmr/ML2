const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, document } = await req.json();

    if (!email && !document) {
      return new Response(
        JSON.stringify({ error: 'Ingresá tu e-mail o DNI para buscar' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate email format
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(
        JSON.stringify({ error: 'El formato del e-mail no es válido' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate document: only digits, max 20 chars
    if (document && (!/^\d+$/.test(document) || document.length > 20)) {
      return new Response(
        JSON.stringify({ error: 'El DNI debe contener solo números' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    let query = supabase
      .from('transactions')
      .select('status, amount, created_at, paid_at, customer_name')
      .order('created_at', { ascending: false })
      .limit(10);

    if (email) {
      query = query.eq('customer_email', email.trim().toLowerCase());
    } else {
      query = query.eq('customer_document', document.trim());
    }

    const { data, error } = await query;

    if (error) {
      return new Response(
        JSON.stringify({ error: 'Error al buscar pedidos' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ orders: data || [] }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'Error interno del servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
