import { createClient, createAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AcceptInviteButton } from './accept-button'

interface Props {
  params: { token: string }
}

export default async function InvitePage({ params }: Props) {
  const supabase = await createClient()
  const adminClient = createAdminClient()

  // Look up invitation
  const { data: invitation } = await adminClient
    .from('invitations')
    .select('id, email, role, org_id, accepted_at, expires_at, organizations(name)')
    .eq('token', params.token)
    .single()

  if (!invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-8 max-w-md w-full text-center">
          <p className="text-lg font-semibold text-gray-900">Invalid invitation</p>
          <p className="mt-2 text-sm text-gray-500">
            This link doesn't exist or has already been used.
          </p>
        </div>
      </div>
    )
  }

  if (invitation.accepted_at || new Date(invitation.expires_at) < new Date()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-8 max-w-md w-full text-center">
          <p className="text-lg font-semibold text-gray-900">Invitation expired</p>
          <p className="mt-2 text-sm text-gray-500">
            Ask your team admin to send a new invitation.
          </p>
        </div>
      </div>
    )
  }

  // Check if user is logged in
  const { data: { user } } = await supabase.auth.getUser()
  const orgName = (invitation.organizations as { name: string } | null)?.name ?? 'the team'

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-2xl border border-gray-200 p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-xl bg-blue-600 flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
            {orgName[0].toUpperCase()}
          </div>
          <h1 className="text-xl font-semibold text-gray-900">
            Join <span className="text-blue-600">{orgName}</span>
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            You've been invited as a <strong>{invitation.role}</strong>.
          </p>
        </div>

        {user ? (
          // User is logged in — accept directly
          <AcceptInviteButton token={params.token} />
        ) : (
          // Not logged in — redirect to signup with redirect back
          <div className="space-y-3">
            <a
              href={`/signup?redirectTo=/invite/${params.token}`}
              className="block w-full py-2.5 text-center bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create account to accept
            </a>
            <a
              href={`/login?redirectTo=/invite/${params.token}`}
              className="block w-full py-2.5 text-center border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Sign in to accept
            </a>
          </div>
        )}

        <p className="mt-4 text-center text-xs text-gray-400">
          Invited to: {invitation.email}
        </p>
      </div>
    </div>
  )
}
