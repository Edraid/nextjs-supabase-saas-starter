'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { isSubscriptionActive } from '@/lib/utils'

interface Subscription {
  plan: string
  status: string
  current_period_end: string | null
  cancel_at_period_end: boolean
}

interface SubscriptionState {
  subscription: Subscription | null
  isPro: boolean
  isEnterprise: boolean
  loading: boolean
}

export function useSubscription(orgId: string | null): SubscriptionState {
  const [state, setState] = useState<SubscriptionState>({
    subscription: null,
    isPro: false,
    isEnterprise: false,
    loading: true,
  })
  const supabase = createClient()

  useEffect(() => {
    if (!orgId) {
      setState({ subscription: null, isPro: false, isEnterprise: false, loading: false })
      return
    }

    supabase
      .from('subscriptions')
      .select('plan, status, current_period_end, cancel_at_period_end')
      .eq('org_id', orgId)
      .single()
      .then(({ data }) => {
        const active = isSubscriptionActive(data)
        setState({
          subscription: data,
          isPro: active && ['pro', 'enterprise'].includes(data?.plan ?? ''),
          isEnterprise: active && data?.plan === 'enterprise',
          loading: false,
        })
      })
  }, [orgId, supabase])

  return state
}
