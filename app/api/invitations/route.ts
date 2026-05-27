import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { sendInviteEmail } from '@/lib/email'
import { z } from 'zod'

const InviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(['admin', 'member', 'viewer']).default('member'),
  orgId: z.string().uuid(),
})

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const parsed = InviteSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { email, role, orgId } = parsed.data

  // Check caller is admin/owner of the org
  const { data: membership } = await supabase
    .from('organization_members')
    .select('role')
    .eq('org_id', orgId)
    .eq('user_id', user.id)
    .single()

  if (!membership || !['owner', 'admin'].includes(membership.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Get org name and inviter profile
  const adminClient = createAdminClient()
  const [{ data: org }, { data: profile }] = await Promise.all([
    adminClient.from('organizations').select('name').eq('id', orgId).single(),
    adminClient.from('profiles').select('full_name, email').eq('id', user.id).single(),
  ])

  // Create invitation
  const { data: invitation, error } = await adminClient
    .from('invitations')
    .insert({ org_id: orgId, email, role, invited_by: user.id })
    .select('token')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Send email
  await sendInviteEmail({
    to: email,
    invitedByName: profile?.full_name ?? profile?.email ?? 'Someone',
    orgName: org?.name ?? 'the team',
    role,
    token: invitation.token,
  })

  return NextResponse.json({ success: true })
}
