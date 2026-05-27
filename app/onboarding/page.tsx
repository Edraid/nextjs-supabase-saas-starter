'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Step = 'org' | 'invite' | 'done'

export default function OnboardingPage() {
  const router = useRouter()
  const supabase = createClient()
  const [step, setStep] = useState<Step>('org')
  const [orgName, setOrgName] = useState('')
  const [inviteEmails, setInviteEmails] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [orgId, setOrgId] = useState<string | null>(null)

  async function handleCreateOrg(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Generate slug from org name
    const slug = orgName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-')

    const { data, error: orgError } = await supabase
      .from('organizations')
      .insert({ name: orgName, slug: `${slug}-${Date.now()}` })
      .select('id')
      .single()

    if (orgError) {
      setError(orgError.message)
      setLoading(false)
      return
    }

    // Add user as owner
    await supabase.from('organization_members').insert({
      org_id: data.id,
      user_id: user.id,
      role: 'owner',
    })

    setOrgId(data.id)
    setStep('invite')
    setLoading(false)
  }

  async function handleInvites(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    if (inviteEmails.trim() && orgId) {
      const emails = inviteEmails.split(',').map((e) => e.trim()).filter(Boolean)
      await Promise.all(
        emails.map((email) =>
          fetch('/api/invitations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, role: 'member', orgId }),
          })
        )
      )
    }

    // Mark onboarding complete
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('profiles').update({ onboarding_completed: true }).eq('id', user.id)
    }

    setStep('done')
    setLoading(false)
    setTimeout(() => router.push('/dashboard'), 1500)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Progress */}
        <div className="flex items-center gap-2 mb-8 justify-center">
          {(['org', 'invite', 'done'] as Step[]).map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium ${
                step === s ? 'bg-blue-600 text-white'
                  : i < ['org', 'invite', 'done'].indexOf(step) ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-500'
              }`}>
                {i < ['org', 'invite', 'done'].indexOf(step) ? '✓' : i + 1}
              </div>
              {i < 2 && <div className={`w-12 h-0.5 ${i < ['org', 'invite', 'done'].indexOf(step) ? 'bg-green-500' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
          {step === 'org' && (
            <>
              <h1 className="text-2xl font-semibold text-gray-900 mb-1">Create your workspace</h1>
              <p className="text-sm text-gray-500 mb-6">This is where your team will collaborate.</p>
              {error && <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">{error}</div>}
              <form onSubmit={handleCreateOrg} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Workspace name</label>
                  <input
                    type="text"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    required
                    placeholder="Acme Inc."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button type="submit" disabled={loading || !orgName.trim()}
                  className="w-full py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors">
                  {loading ? 'Creating...' : 'Create workspace →'}
                </button>
              </form>
            </>
          )}

          {step === 'invite' && (
            <>
              <h1 className="text-2xl font-semibold text-gray-900 mb-1">Invite your team</h1>
              <p className="text-sm text-gray-500 mb-6">You can always do this later.</p>
              <form onSubmit={handleInvites} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email addresses</label>
                  <textarea
                    value={inviteEmails}
                    onChange={(e) => setInviteEmails(e.target.value)}
                    placeholder="jane@acme.com, john@acme.com"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                  <p className="mt-1 text-xs text-gray-400">Separate multiple emails with commas.</p>
                </div>
                <button type="submit" disabled={loading}
                  className="w-full py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors">
                  {loading ? 'Sending invites...' : 'Continue →'}
                </button>
                <button type="button" onClick={() => handleInvites({ preventDefault: () => {} } as React.FormEvent)}
                  className="w-full py-2.5 text-gray-500 text-sm hover:text-gray-700 transition-colors">
                  Skip for now
                </button>
              </form>
            </>
          )}

          {step === 'done' && (
            <div className="text-center py-4">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900">You're all set!</h2>
              <p className="mt-2 text-sm text-gray-500">Taking you to your dashboard...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
