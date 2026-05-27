'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function AcceptInviteButton({ token }: { token: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleAccept() {
    setLoading(true)
    const res = await fetch('/api/invitations/accept', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })

    const data = await res.json()
    if (!res.ok) {
      setError(data.error ?? 'Failed to accept invitation')
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div>
      {error && (
        <p className="mb-3 text-sm text-red-600 text-center">{error}</p>
      )}
      <button
        onClick={handleAccept}
        disabled={loading}
        className="w-full py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        {loading ? 'Accepting...' : 'Accept invitation'}
      </button>
    </div>
  )
}
