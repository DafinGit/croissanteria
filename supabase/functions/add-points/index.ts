import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AddPointsRequest {
  qr_data: any;
  amount: number;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { qr_data, amount }: AddPointsRequest = await req.json();
    console.log('Received request:', { qr_data, amount });

    if (!qr_data || !amount || amount <= 0) {
      console.log('Invalid request data');
      return new Response(
        JSON.stringify({ error: 'Date invalide' }),
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      );
    }

    // Parse QR data
    let parsedData;
    try {
      parsedData = typeof qr_data === 'string' ? JSON.parse(qr_data) : qr_data;
    } catch (e) {
      console.log('Invalid QR data format');
      return new Response(
        JSON.stringify({ error: 'Format QR invalid' }),
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      );
    }

    const { customer_id, token, timestamp, name } = parsedData;
    console.log('Parsed QR data:', { customer_id, token, timestamp, name });

    if (!customer_id || !token || !timestamp) {
      console.log('Missing required QR fields');
      return new Response(
        JSON.stringify({ error: 'Date QR incomplete' }),
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      );
    }

    // Check if QR code was already used (single-use verification)
    const { data: usedQr, error: usedError } = await supabase
      .from('used_qr_codes')
      .select('id')
      .eq('qr_token', token)
      .maybeSingle();

    if (usedError) {
      console.error('Error checking used QR:', usedError);
      return new Response(
        JSON.stringify({ error: 'Eroare verificare QR' }),
        { 
          status: 500, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      );
    }

    if (usedQr) {
      console.log('QR code already used');
      return new Response(
        JSON.stringify({ error: 'Acest cod QR a fost deja folosit' }),
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      );
    }

    // Check if QR is expired (5 minutes)
    const qrTimestamp = new Date(timestamp);
    const now = new Date();
    const fiveMinutes = 5 * 60 * 1000;
    
    if (now.getTime() - qrTimestamp.getTime() > fiveMinutes) {
      console.log('QR code expired');
      return new Response(
        JSON.stringify({ error: 'Codul QR a expirat' }),
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      );
    }

    // Calculate points (1€ = 10 points)
    const pointsToAdd = Math.floor(amount * 10);
    console.log('Points to add:', pointsToAdd);

    // Get current customer data
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('points')
      .eq('id', customer_id)
      .single();

    if (customerError) {
      console.error('Error fetching customer:', customerError);
      return new Response(
        JSON.stringify({ error: 'Client nu a fost găsit' }),
        { 
          status: 404, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      );
    }

    // Mark QR as used FIRST (prevents duplicate usage)
    const { error: usedQrError } = await supabase
      .from('used_qr_codes')
      .insert({
        qr_token: token,
        customer_id: customer_id,
        amount_spent: amount,
        points_awarded: pointsToAdd
      });

    if (usedQrError) {
      console.error('Error marking QR as used:', usedQrError);
      return new Response(
        JSON.stringify({ error: 'Eroare la procesarea QR' }),
        { 
          status: 500, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      );
    }

    // Update customer points
    const newPoints = (customer.points || 0) + pointsToAdd;
    const { error: updateError } = await supabase
      .from('customers')
      .update({ points: newPoints })
      .eq('id', customer_id);

    if (updateError) {
      console.error('Error updating customer points:', updateError);
      return new Response(
        JSON.stringify({ error: 'Eroare la actualizarea punctelor' }),
        { 
          status: 500, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      );
    }

    // Add transaction record
    const { error: transactionError } = await supabase
      .from('transactions')
      .insert({
        customer_id,
        description: `Cumpărătură: ${amount}€`,
        points_change: pointsToAdd
      });

    if (transactionError) {
      console.error('Error creating transaction:', transactionError);
    }

    console.log(`Added ${pointsToAdd} points to customer ${customer_id} for purchase of ${amount}€`);

    return new Response(
      JSON.stringify({
        success: true,
        points_added: pointsToAdd,
        new_total: newPoints,
        amount_spent: amount,
        customer_name: name
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );

  } catch (error: any) {
    console.error('Error in add-points function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);