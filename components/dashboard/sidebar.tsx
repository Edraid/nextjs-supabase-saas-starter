'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Settings,
  CreditCard,
  Users,
  BarChart2,
  LogOut,
  ChevronDown,
  Building2,
  Key,
  Shield,
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard',          icon: LayoutDashboard },
  { name: 'Team',      href: '/dashboard/team',      icon: Users },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart2 },
  { name: 'Billing',   href: '/dashboard/billing',   icon: CreditCard },
  { name: 'API Keys',  href: '/api-keys',             icon: Key },
]

const secondaryNavigation = [
  { name: 'Organization', href: '/org',               icon: Building2 },
  { name: 'Audit Log',    href: '/audit-log',          icon: Shield },
  { name: 'Settings',     href: '/dashboard/settings', icon: Settings },
]

interface SidebarProps {
  user: { email?: string; full_name?: string } | null
  orgName?: string
}

export function Sidebar({ user, orgName }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="flex h-full w-64 flex-col bg-gray-900">
      {/* Org selector */}
      <div className="flex items-center gap-2 px-4 py-4 border-b border-gray-800">
        <div className="w-7 h-7 rounded-md bg-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
          {orgName?.[0]?.toUpperCase() ?? 'A'}
        </div>
        <span className="text-sm font-medium text-white truncate flex-1">
          {orgName ?? 'My Workspace'}
        </span>
        <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              {item.name}
            </Link>
          )
        })}

        {/* Divider + secondary */}
        <div className="pt-3 mt-3 border-t border-gray-800">
          {secondaryNavigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                {item.name}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* User footer */}
      <div className="border-t border-gray-800 p-3">
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-gray-800 group cursor-pointer">
          <div className="w-7 h-7 rounded-full bg-gray-600 flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
            {user?.full_name?.[0]?.toUpperCase() ?? user?.email?.[0]?.toUpperCase() ?? 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-white truncate">
              {user?.full_name ?? 'User'}
            </p>
            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
          </div>
          <button
            onClick={handleSignOut}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
            title="Sign out"
          >
            <LogOut className="w-4 h-4 text-gray-400 hover:text-white" />
          </button>
        </div>
      </div>
    </div>
  )
}
