'use client'

import { useState } from 'react'

interface BillingClientProps {
  orgId: string
  mode: 'checkout' | 'portal'
  priceId?: string
  label: string
  disabled?: boolean
  className?: string
}

export function BillingClient({ orgId, mode, priceId, label, disabled, className }: BillingClientProps) {
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    if (disabled) return
    setLoading(true)

    const endpoint = mode === 'checkout' ? '/api/billing/create-checkout' : '/api/billing/create-portal'
    const body = mode === 'checkout' ? { priceId, orgId } : { orgId }

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    const { url } = await res.json()
    if (url) window.location.href = url
    setLoading(false)
  }

  return (
    <button onClick={handleClick} disabled={disabled || loading} className={className}>
      {loading ? 'Loading...' : label}
    </button>
  )
}
