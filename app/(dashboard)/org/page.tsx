import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { slugify } from '@/lib/utils'
import { Building2, Users } from 'lucide-react'

export const metadata = { title: 'Organization settings' }

async function updateOrg(formData: FormData) {
  'use server'

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Only owners/admins can update org
  const orgId = formData.get('org_id') as string
  const { data: membership } = await supabase
    .from('organization_members')
    .select('role')
    .eq('org_id', orgId)
    .eq('user_id', user.id)
    .single()

  if (!membership || !['owner', 'admin'].includes(membership.role)) {
    throw new Error('Insufficient permissions')
  }

  const name = (formData.get('name') as string)?.trim()
  if (!name) return

  await supabase
    .from('organizations')
    .update({ name, updated_at: new Date().toISOString() })
    .eq('id', orgId)

  revalidatePath('/org')
}

export default async function OrgPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Get user's primary org with member count
  const { data: membership } = await supabase
    .from('organization_members')
    .select('role, org_id, organizations(id, name, slug, plan, created_at)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })
    .limit(1)
    .single()

  if (!membership) redirect('/onboarding')

  const org = membership.organizations as {
    id: string
    name: string
    slug: string
    plan: string
    created_at: string
  } | null

  if (!org) redirect('/onboarding')

  // Count members
  const { count: memberCount } = await supabase
    .from('organization_members')
    .select('*', { count: 'exact', head: true })
    .eq('org_id', org.id)

  const isOwnerOrAdmin = ['owner', 'admin'].includes(membership.role)

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Organization</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your organization settings and preferences.
        </p>
      </div>

      {/* Overview */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3 mb-2">
            <Building2 className="h-5 w-5 text-gray-400" />
            <p className="text-sm font-medium text-gray-500">Plan</p>
          </div>
          <p className="text-lg font-bold text-gray-900 capitalize">{org.plan}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3 mb-2">
            <Users className="h-5 w-5 text-gray-400" />
            <p className="text-sm font-medium text-gray-500">Members</p>
          </div>
          <p className="text-lg font-bold text-gray-900">{memberCount ?? 0}</p>
        </div>
      </div>

      {/* Org details form */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="text-base font-semibold text-gray-900 mb-1">General</h2>
        <p className="text-sm text-gray-500 mb-5">
          Basic information about your organization.
        </p>

        <form action={updateOrg} className="space-y-4">
          <input type="hidden" name="org_id" value={org.id} />

          <div>
            <label htmlFor="org_name" className="block text-sm font-medium text-gray-700 mb-1">
              Organization name
            </label>
            <input
              id="org_name"
              type="text"
              name="name"
              defaultValue={org.name}
              required
              disabled={!isOwnerOrAdmin}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URL slug
            </label>
            <div className="flex items-center gap-2">
              <span className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-l-lg text-sm text-gray-500 border-r-0">
                app.example.com/
              </span>
              <input
                type="text"
                value={org.slug}
                disabled
                readOnly
                className="flex-1 px-3 py-2 border border-gray-200 rounded-r-lg text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
              />
            </div>
            <p className="mt-1 text-xs text-gray-400">
              Slug cannot be changed after creation.
            </p>
          </div>

          {isOwnerOrAdmin && (
            <div className="pt-1">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save changes
              </button>
            </div>
          )}
        </form>
      </div>

      {/* Your role */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Your role</h2>
        <div className="flex items-center gap-3">
          <span className="capitalize inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
            {membership.role}
          </span>
          <p className="text-sm text-gray-500">
            {membership.role === 'owner' && 'Full control over the organization and billing.'}
            {membership.role === 'admin' && 'Can manage members, settings, and invitations.'}
            {membership.role === 'member' && 'Can access all features within the organization.'}
            {membership.role === 'viewer' && 'Read-only access to organization resources.'}
          </p>
        </div>
      </div>

      {/* Danger zone — owners only */}
      {membership.role === 'owner' && (
        <div className="bg-white rounded-xl border border-red-200 p-6">
          <h2 className="text-base font-semibold text-red-700 mb-1">Danger zone</h2>
          <p className="text-sm text-gray-500 mb-5">
            Destructive actions that cannot be reversed.
          </p>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div>
                <p className="text-sm font-medium text-gray-800">Transfer ownership</p>
                <p className="text-xs text-gray-500">Transfer owner role to another member.</p>
              </div>
              <button className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
                Transfer
              </button>
            </div>
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-medium text-gray-800">Delete organization</p>
                <p className="text-xs text-gray-500">Permanently delete org, all data, and cancel subscriptions.</p>
              </div>
              <button className="px-3 py-1.5 bg-white border border-red-300 text-red-600 text-sm font-medium rounded-lg hover:bg-red-50 transition-colors">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
