import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { InviteForm } from './invite-form'

export default async function TeamPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: orgMember } = await supabase
    .from('organization_members')
    .select('org_id, role')
    .eq('user_id', user.id)
    .single()

  if (!orgMember) redirect('/onboarding')

  const { data: members } = await supabase
    .from('organization_members')
    .select('id, role, joined_at, profiles(full_name, email, avatar_url)')
    .eq('org_id', orgMember.org_id)
    .order('joined_at', { ascending: true })

  const { data: pendingInvites } = await supabase
    .from('invitations')
    .select('id, email, role, expires_at, created_at')
    .eq('org_id', orgMember.org_id)
    .is('accepted_at', null)
    .gt('expires_at', new Date().toISOString())

  const isAdmin = ['owner', 'admin'].includes(orgMember.role)

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Team</h1>
          <p className="mt-1 text-sm text-gray-500">
            {members?.length ?? 0} member{members?.length !== 1 ? 's' : ''}
          </p>
        </div>
        {isAdmin && <InviteForm orgId={orgMember.org_id} />}
      </div>

      {/* Members list */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
        <div className="divide-y divide-gray-100">
          {members?.map((m) => {
            const profile = m.profiles as { full_name?: string; email?: string; avatar_url?: string } | null
            return (
              <div key={m.id} className="flex items-center gap-4 px-5 py-4">
                <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-600 flex-shrink-0">
                  {profile?.full_name?.[0]?.toUpperCase() ?? profile?.email?.[0]?.toUpperCase() ?? '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {profile?.full_name ?? profile?.email ?? 'Unknown'}
                  </p>
                  {profile?.full_name && (
                    <p className="text-xs text-gray-500 truncate">{profile.email}</p>
                  )}
                </div>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                  m.role === 'owner' ? 'bg-purple-100 text-purple-700'
                  : m.role === 'admin' ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-600'
                }`}>
                  {m.role}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Pending invites */}
      {pendingInvites && pendingInvites.length > 0 && (
        <div>
          <h2 className="text-sm font-medium text-gray-700 mb-3">Pending invitations</h2>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="divide-y divide-gray-100">
              {pendingInvites.map((inv) => (
                <div key={inv.id} className="flex items-center gap-4 px-5 py-4">
                  <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-sm text-gray-400 flex-shrink-0">
                    ✉
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{inv.email}</p>
                    <p className="text-xs text-gray-400">
                      Expires {new Date(inv.expires_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                    Pending
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
