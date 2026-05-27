import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { formatDate } from '@/lib/utils'
import { Shield } from 'lucide-react'

export const metadata = { title: 'Audit Log' }

// Action → human readable label + color
const actionMeta: Record<string, { label: string; color: string }> = {
  'member.invited':           { label: 'Member invited',        color: 'bg-blue-100 text-blue-700' },
  'member.joined':            { label: 'Member joined',         color: 'bg-green-100 text-green-700' },
  'member.removed':           { label: 'Member removed',        color: 'bg-red-100 text-red-700' },
  'member.role_changed':      { label: 'Role changed',          color: 'bg-yellow-100 text-yellow-700' },
  'subscription.created':     { label: 'Subscription created',  color: 'bg-green-100 text-green-700' },
  'subscription.upgraded':    { label: 'Plan upgraded',         color: 'bg-green-100 text-green-700' },
  'subscription.downgraded':  { label: 'Plan downgraded',       color: 'bg-yellow-100 text-yellow-700' },
  'subscription.canceled':    { label: 'Subscription canceled', color: 'bg-red-100 text-red-700' },
  'api_key.created':          { label: 'API key created',       color: 'bg-blue-100 text-blue-700' },
  'api_key.revoked':          { label: 'API key revoked',       color: 'bg-red-100 text-red-700' },
  'org.updated':              { label: 'Org settings updated',  color: 'bg-gray-100 text-gray-700' },
  'auth.password_changed':    { label: 'Password changed',      color: 'bg-yellow-100 text-yellow-700' },
}

export default async function AuditLogPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Get user's org
  const { data: membership } = await supabase
    .from('organization_members')
    .select('org_id, role')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })
    .limit(1)
    .single()

  if (!membership || !['owner', 'admin'].includes(membership.role)) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
          <Shield className="h-8 w-8 text-yellow-500 mx-auto mb-3" />
          <p className="text-sm font-medium text-yellow-800">Access restricted</p>
          <p className="text-xs text-yellow-600 mt-1">Only owners and admins can view the audit log.</p>
        </div>
      </div>
    )
  }

  const { data: logs } = await supabase
    .from('audit_logs')
    .select('id, action, resource_type, resource_id, metadata, user_id, created_at')
    .eq('org_id', membership.org_id)
    .order('created_at', { ascending: false })
    .limit(100)

  // Get profile names for user IDs in the log
  const userIds = [...new Set((logs ?? []).map((l) => l.user_id).filter(Boolean))]
  const { data: profiles } = userIds.length
    ? await supabase.from('profiles').select('id, full_name').in('id', userIds)
    : { data: [] }

  const profileMap = Object.fromEntries((profiles ?? []).map((p) => [p.id, p.full_name]))

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Audit Log</h1>
        <p className="mt-1 text-sm text-gray-500">
          A record of all significant actions in your organization. Last 100 events.
        </p>
      </div>

      {/* Log table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {!logs || logs.length === 0 ? (
          <div className="py-12 text-center">
            <Shield className="h-8 w-8 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">No events recorded yet</p>
            <p className="text-xs text-gray-400 mt-1">
              Actions like invitations, billing changes, and API key management will appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {logs.map((log) => {
              const meta = actionMeta[log.action] ?? { label: log.action, color: 'bg-gray-100 text-gray-600' }
              const actorName = log.user_id ? (profileMap[log.user_id] ?? 'Unknown user') : 'System'
              return (
                <div key={log.id} className="flex items-start gap-4 px-5 py-4 hover:bg-gray-50 transition-colors">
                  <div className="shrink-0 mt-0.5">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${meta.color}`}>
                      {meta.label}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">{actorName}</span>
                      {log.resource_id && (
                        <span className="text-gray-400 ml-1 font-mono text-xs">
                          #{log.resource_id.slice(0, 8)}
                        </span>
                      )}
                    </p>
                    {log.metadata && Object.keys(log.metadata).length > 0 && (
                      <p className="text-xs text-gray-400 mt-0.5 truncate">
                        {JSON.stringify(log.metadata)}
                      </p>
                    )}
                  </div>
                  <p className="shrink-0 text-xs text-gray-400">{formatDate(log.created_at)}</p>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
