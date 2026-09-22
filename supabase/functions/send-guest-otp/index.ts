import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { phone } = await req.json()

    if (!phone || !/^\d{10}$/.test(phone)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid phone number. Must be 10 digits.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()

    // Store hashed OTP in DB via RPC
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { error: dbError } = await supabase.rpc('request_guest_otp', {
      p_phone:    phone,
      p_otp_code: otp,
    })

    if (dbError) {
      console.error('DB error storing OTP:', dbError)
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to generate OTP.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    // Send OTP via Fast2SMS
    const fast2smsKey = Deno.env.get('FAST2SMS_API_KEY') ?? ''

    const smsResponse = await fetch('https://www.fast2sms.com/dev/bulkV2', {
      method: 'POST',
      headers: {
        authorization: fast2smsKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        route: 'otp',
        variables_values: otp,
        numbers: phone,
      }),
    })

    const smsResult = await smsResponse.json()
    console.log('Fast2SMS result:', smsResult)

    if (!smsResult.return) {
      console.error('Fast2SMS error:', smsResult)
      // Don't expose SMS error to client — OTP is stored, they can retry
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to send OTP. Please try again.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    return new Response(
      JSON.stringify({ success: true, message: 'OTP sent to your mobile number.' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('Unexpected error:', err)
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error.' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
