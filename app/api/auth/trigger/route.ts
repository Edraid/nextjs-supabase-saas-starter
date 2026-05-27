// Called by Supabase Auth webhook (or manually after user creation)
// to send welcome email.
// Set up in Supabase: Database → Webhooks → on auth.users INSERT

import { NextResponse } from 'next/server'
import { sendWelcomeEmail } from '@/lib/email'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  // Verify this is coming from Supabase (check Authorization header)
  const authHeader = request.headers.get('Authorization')
  if (authHeader !== `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { record } = await request.json()
  const { id, email, raw_user_meta_data } = record

  if (!email) {
    return NextResponse.json({ error: 'No email' }, { status: 400 })
  }

  const firstName = raw_user_meta_data?.full_name?.split(' ')[0] ?? 'there'

  await sendWelcomeEmail(email, firstName)

  return NextResponse.json({ success: true })
}
