import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { BarChart2, TrendingUp, Users, MousePointerClick } from 'lucide-react'

export const metadata = { title: 'Analytics' }

// Placeholder metric card — replace with real data queries
function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
}: {
  title: string
  value: string
  subtitle: string
  icon: React.ElementType
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <div className="p-2 bg-blue-50 rounded-lg">
          <Icon className="h-4 w-4 text-blue-600" />
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="mt-1 text-xs text-gray-500">{subtitle}</p>
    </div>
  )
}

export default async function AnalyticsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // TODO: Replace with real queries once analytics schema is defined.
  // Example queries you can add:
  //   - Daily active users from `user_events` table
  //   - Feature usage counts grouped by event_type
  //   - Retention cohorts via window functions
  //   - Revenue trend from `subscriptions` + `invoices`

  const placeholderMetrics = [
    { title: 'Monthly Active Users',  value: '—',  subtitle: 'Connect analytics to show data', icon: Users },
    { title: 'Sessions this month',   value: '—',  subtitle: 'Connect analytics to show data', icon: TrendingUp },
    { title: 'Events tracked',        value: '—',  subtitle: 'Connect analytics to show data', icon: MousePointerClick },
    { title: 'Avg. session duration', value: '—',  subtitle: 'Connect analytics to show data', icon: BarChart2 },
  ]

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="mt-1 text-sm text-gray-500">
          Track usage, engagement, and growth for your application.
        </p>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {placeholderMetrics.map((m) => (
          <MetricCard key={m.title} {...m} />
        ))}
      </div>

      {/* Setup prompt */}
      <div className="bg-white rounded-xl border border-dashed border-gray-300 p-10 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-50">
          <BarChart2 className="h-6 w-6 text-blue-600" />
        </div>
        <h3 className="text-base font-semibold text-gray-900 mb-2">
          Analytics not configured yet
        </h3>
        <p className="text-sm text-gray-500 max-w-sm mx-auto mb-6">
          Connect an analytics provider (PostHog, Mixpanel, Plausible) or query
          your Supabase tables directly to populate this dashboard.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-xl mx-auto text-left">
          {[
            {
              name: 'PostHog',
              desc: 'Open-source product analytics with session recording and feature flags.',
              href: 'https://posthog.com',
            },
            {
              name: 'Mixpanel',
              desc: 'Event-based analytics focused on user behaviour and funnel analysis.',
              href: 'https://mixpanel.com',
            },
            {
              name: 'Plausible',
              desc: 'Lightweight, privacy-friendly web analytics. GDPR compliant.',
              href: 'https://plausible.io',
            },
          ].map((provider) => (
            <a
              key={provider.name}
              href={provider.href}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-lg border border-gray-200 p-4 hover:border-blue-300 hover:shadow-sm transition-all"
            >
              <p className="text-sm font-semibold text-gray-800">{provider.name}</p>
              <p className="mt-1 text-xs text-gray-500">{provider.desc}</p>
            </a>
          ))}
        </div>
      </div>

      {/* Quick-start guide */}
      <div className="mt-8 bg-gray-50 rounded-xl border border-gray-200 p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">
          Quick start: Add PostHog in 2 minutes
        </h3>
        <ol className="space-y-3 text-sm text-gray-600">
          <li className="flex gap-3">
            <span className="shrink-0 flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-xs font-bold">1</span>
            <span>Install: <code className="bg-white border border-gray-200 rounded px-1.5 py-0.5 text-xs">npm install posthog-js</code></span>
          </li>
          <li className="flex gap-3">
            <span className="shrink-0 flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-xs font-bold">2</span>
            <span>Add <code className="bg-white border border-gray-200 rounded px-1.5 py-0.5 text-xs">NEXT_PUBLIC_POSTHOG_KEY</code> to your <code className="bg-white border border-gray-200 rounded px-1.5 py-0.5 text-xs">.env.local</code></span>
          </li>
          <li className="flex gap-3">
            <span className="shrink-0 flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-xs font-bold">3</span>
            <span>Create <code className="bg-white border border-gray-200 rounded px-1.5 py-0.5 text-xs">providers/posthog.tsx</code> client component and wrap in <code className="bg-white border border-gray-200 rounded px-1.5 py-0.5 text-xs">app/layout.tsx</code></span>
          </li>
          <li className="flex gap-3">
            <span className="shrink-0 flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-xs font-bold">4</span>
            <span>Use <code className="bg-white border border-gray-200 rounded px-1.5 py-0.5 text-xs">posthog.identify(userId)</code> after login to connect events to users</span>
          </li>
        </ol>
      </div>
    </div>
  )
}
