import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { token } = await request.json()

  // Use the RPC function defined in migration 001
  const { data, error } = await supabase.rpc('accept_invitation', {
    invite_token: token,
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (data?.error) {
    return NextResponse.json({ error: data.error }, { status: 400 })
  }

  return NextResponse.json({ success: true, org_id: data.org_id })
}
