import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/dashboard/sidebar'
import { NotificationsBell } from '@/components/dashboard/notifications-bell'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Get profile and org
  const [{ data: profile }, { data: orgMember }] = await Promise.all([
    supabase.from('profiles').select('full_name, email').eq('id', user.id).single(),
    supabase
      .from('organization_members')
      .select('role, organizations(name)')
      .eq('user_id', user.id)
      .order('joined_at', { ascending: true })
      .limit(1)
      .single(),
  ])

  const orgName = (orgMember?.organizations as { name: string } | null)?.name

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar
        user={{ email: profile?.email ?? user.email, full_name: profile?.full_name ?? undefined }}
        orgName={orgName}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-14 flex items-center justify-end px-6 border-b border-gray-200 bg-white shrink-0">
          <NotificationsBell />
        </header>
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
