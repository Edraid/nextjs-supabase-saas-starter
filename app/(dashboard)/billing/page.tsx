import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { BillingClient } from './billing-client'

const PLANS = [
  {
    name: 'Starter',
    monthlyPrice: '$19',
    annualPrice: '$15',
    description: 'For small teams getting started.',
    features: ['Up to 5 team members', '10 projects', 'Basic analytics', 'Email support'],
    monthlyPriceId: process.env.STRIPE_PRICE_STARTER_MONTHLY!,
    annualPriceId: process.env.STRIPE_PRICE_STARTER_ANNUAL!,
  },
  {
    name: 'Pro',
    monthlyPrice: '$49',
    annualPrice: '$39',
    description: 'For growing teams that need more.',
    features: ['Unlimited team members', 'Unlimited projects', 'Advanced analytics', 'Priority support', 'API access'],
    monthlyPriceId: process.env.STRIPE_PRICE_PRO_MONTHLY!,
    annualPriceId: process.env.STRIPE_PRICE_PRO_ANNUAL!,
    highlighted: true,
  },
]

export default async function BillingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: orgMember } = await supabase
    .from('organization_members')
    .select('org_id, role, organizations(id, name, plan)')
    .eq('user_id', user.id)
    .single()

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('plan, status, current_period_end, cancel_at_period_end, stripe_customer_id')
    .eq('org_id', orgMember?.org_id ?? '')
    .single()

  const org = orgMember?.organizations as { id: string; name: string; plan: string } | null

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Billing</h1>
        <p className="mt-1 text-sm text-gray-500">Manage your subscription and billing.</p>
      </div>

      {/* Current plan banner */}
      {subscription && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-8 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-blue-900">
              Current plan: <span className="capitalize">{subscription.plan}</span>
            </p>
            <p className="text-xs text-blue-700 mt-0.5">
              {subscription.cancel_at_period_end
                ? `Cancels on ${new Date(subscription.current_period_end!).toLocaleDateString()}`
                : `Renews on ${new Date(subscription.current_period_end!).toLocaleDateString()}`}
            </p>
          </div>
          <BillingClient
            orgId={org?.id ?? ''}
            mode="portal"
            label="Manage subscription"
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          />
        </div>
      )}

      {/* Pricing plans */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {PLANS.map((plan) => (
          <div
            key={plan.name}
            className={`bg-white rounded-xl border p-6 ${
              plan.highlighted ? 'border-blue-300 ring-1 ring-blue-300' : 'border-gray-200'
            }`}
          >
            {plan.highlighted && (
              <span className="inline-block px-2 py-0.5 bg-blue-600 text-white text-xs font-medium rounded-full mb-3">
                Most popular
              </span>
            )}
            <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
            <p className="text-sm text-gray-500 mt-1">{plan.description}</p>
            <div className="mt-4 mb-5">
              <span className="text-3xl font-bold text-gray-900">{plan.monthlyPrice}</span>
              <span className="text-sm text-gray-500">/month</span>
            </div>
            <ul className="space-y-2 mb-6">
              {plan.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                  <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>
            <BillingClient
              orgId={org?.id ?? ''}
              mode="checkout"
              priceId={plan.monthlyPriceId}
              label={subscription?.plan === plan.name.toLowerCase() ? 'Current plan' : `Upgrade to ${plan.name}`}
              disabled={subscription?.plan === plan.name.toLowerCase()}
              className={`w-full py-2.5 text-sm font-medium rounded-lg transition-colors ${
                subscription?.plan === plan.name.toLowerCase()
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : plan.highlighted
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-900 text-white hover:bg-gray-800'
              }`}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
