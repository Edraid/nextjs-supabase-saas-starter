import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { createHash, randomBytes } from 'crypto'

const CreateKeySchema = z.object({
  name: z.string().min(1, 'Name is required').max(80),
  org_id: z.string().uuid(),
  expires_in_days: z.number().int().min(1).max(365).optional(),
})

// GET /api/api-keys?org_id=xxx — list keys for an org (prefixes only, not full keys)
export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const orgId = searchParams.get('org_id')
  if (!orgId) return NextResponse.json({ error: 'org_id is required' }, { status: 400 })

  const { data, error } = await supabase
    .from('api_keys')
    .select('id, name, key_prefix, last_used_at, expires_at, revoked_at, created_at')
    .eq('org_id', orgId)
    .is('revoked_at', null)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ keys: data ?? [] })
}

// POST /api/api-keys — create a new API key
// Returns the full key ONCE — never stored, only the hash is saved
export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: unknown
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = CreateKeySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors }, { status: 422 })
  }

  const { name, org_id, expires_in_days } = parsed.data

  // Check permission
  const { data: membership } = await supabase
    .from('organization_members')
    .select('role')
    .eq('org_id', org_id)
    .eq('user_id', user.id)
    .single()

  if (!membership || !['owner', 'admin'].includes(membership.role)) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
  }

  // Generate key: sk_live_<32 random hex bytes>
  const rawKey    = `sk_live_${randomBytes(32).toString('hex')}`
  const keyHash   = createHash('sha256').update(rawKey).digest('hex')
  const keyPrefix = rawKey.slice(0, 15) + '...'

  const expiresAt = expires_in_days
    ? new Date(Date.now() + expires_in_days * 86_400_000).toISOString()
    : null

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('api_keys')
    .insert({ org_id, user_id: user.id, name, key_hash: keyHash, key_prefix: keyPrefix, expires_at: expiresAt })
    .select('id, name, key_prefix, expires_at, created_at')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Return the full key — this is the ONLY time it's shown
  return NextResponse.json({ key: rawKey, meta: data }, { status: 201 })
}

// DELETE /api/api-keys — revoke a key
export async function DELETE(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await request.json()
  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

  const { error } = await supabase
    .from('api_keys')
    .update({ revoked_at: new Date().toISOString() })
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
