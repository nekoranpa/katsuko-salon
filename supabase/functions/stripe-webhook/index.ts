// Optional Supabase Edge Function skeleton for Stripe webhook.
// 最初はStripe Payment Linksを商品に貼るだけで開始可能です。
// 本格連携時にSTRIPE_WEBHOOK_SECRETを設定して、checkout.session.completedをproduct_salesへ記録します。

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 })
  }

  const body = await req.text()
  console.log('Stripe webhook received:', body.slice(0, 500))

  return new Response(JSON.stringify({ received: true }), {
    headers: { 'content-type': 'application/json' },
  })
})
