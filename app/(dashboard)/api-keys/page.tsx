'use client'

import { useCallback, useEffect, useState } from 'react'
import { useOrg } from '@/hooks/use-org'
import { formatDate } from '@/lib/utils'
import { Key, Plus, Trash2, Copy, Check, AlertTriangle } from 'lucide-react'

interface ApiKey {
  id: string
  name: string
  key_prefix: string
  last_used_at: string | null
  expires_at: string | null
  created_at: string
}

export default function ApiKeysPage() {
  const { membership, isAdmin, loading: orgLoading } = useOrg()
  const [keys, setKeys] = useState<ApiKey[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [newKeyName, setNewKeyName] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [revealedKey, setRevealedKey] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [revoking, setRevoking] = useState<string | null>(null)

  const fetchKeys = useCallback(async () => {
    if (!membership?.org_id) return
    setLoading(true)
    try {
      const res = await fetch(`/api/api-keys?org_id=${membership.org_id}`)
      if (res.ok) {
        const data = await res.json()
        setKeys(data.keys ?? [])
      }
    } catch {
      // network error — keep existing keys
    } finally {
      setLoading(false)
    }
  }, [membership?.org_id])

  useEffect(() => { fetchKeys() }, [fetchKeys])

  async function createKey() {
    if (!newKeyName.trim() || !membership?.org_id) return
    setCreating(true)
    try {
      const res = await fetch('/api/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newKeyName.trim(), org_id: membership.org_id }),
      })
      if (res.ok) {
        const data = await res.json()
        setRevealedKey(data.key)
        setNewKeyName('')
        setShowForm(false)
        await fetchKeys()
      }
    } catch {
      // network error — form stays open
    } finally {
      setCreating(false)
    }
  }

  async function revokeKey(id: string) {
    setRevoking(id)
    try {
      const res = await fetch('/api/api-keys', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      // Only update UI after server confirms deletion
      if (res.ok) {
        setKeys((prev) => prev.filter((k) => k.id !== id))
      }
    } catch {
      // network error — key remains in list
    } finally {
      setRevoking(null)
    }
  }

  async function copyKey() {
    if (!revealedKey) return
    await navigator.clipboard.writeText(revealedKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (orgLoading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <div className="animate-spin h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">API Keys</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage API keys for programmatic access to your organization.
          </p>
        </div>
        {isAdmin && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            New key
          </button>
        )}
      </div>

      {/* Revealed key banner — shown ONCE after creation */}
      {revealedKey && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-start gap-3 mb-3">
            <AlertTriangle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-green-800">Save your key now</p>
              <p className="text-xs text-green-700 mt-0.5">
                This is the only time you'll see the full key. It cannot be recovered.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white border border-green-200 rounded-lg px-3 py-2">
            <code className="flex-1 text-xs text-gray-800 break-all font-mono">{revealedKey}</code>
            <button
              onClick={copyKey}
              className="shrink-0 p-1.5 rounded hover:bg-gray-100 transition-colors"
              title="Copy key"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4 text-gray-500" />
              )}
            </button>
          </div>
          <button
            onClick={() => setRevealedKey(null)}
            className="mt-3 text-xs text-green-700 hover:text-green-900 underline"
          >
            I've saved it, dismiss
          </button>
        </div>
      )}

      {/* Create key form */}
      {showForm && (
        <div className="mb-6 bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">New API key</h3>
          <div className="flex gap-3">
            <input
              type="text"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && createKey()}
              placeholder="e.g. CI pipeline, Local dev"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <button
              onClick={createKey}
              disabled={creating || !newKeyName.trim()}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {creating ? 'Creating…' : 'Create'}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
          </div>
          <p className="mt-2 text-xs text-gray-400">
            Give your key a descriptive name so you know where it's used.
          </p>
        </div>
      )}

      {/* Keys list */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="py-12 flex justify-center">
            <div className="animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full" />
          </div>
        ) : keys.length === 0 ? (
          <div className="py-12 text-center">
            <Key className="h-8 w-8 text-gray-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-500">No API keys yet</p>
            <p className="text-xs text-gray-400 mt-1">
              {isAdmin ? 'Create a key to get started.' : 'Ask an admin to create an API key.'}
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Name</th>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Key</th>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Last used</th>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Created</th>
                {isAdmin && <th className="px-4 py-3" />}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {keys.map((key) => (
                <tr key={key.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-gray-900">{key.name}</p>
                    {key.expires_at && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        Expires {formatDate(key.expires_at)}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <code className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded font-mono">
                      {key.key_prefix}
                    </code>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {key.last_used_at ? formatDate(key.last_used_at) : 'Never'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {formatDate(key.created_at)}
                  </td>
                  {isAdmin && (
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => revokeKey(key.id)}
                        disabled={revoking === key.id}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                        title="Revoke key"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Security note */}
      <div className="mt-4 flex items-start gap-2">
        <AlertTriangle className="h-4 w-4 text-yellow-500 shrink-0 mt-0.5" />
        <p className="text-xs text-gray-500">
          API keys grant full access to your organization's data. Never commit them to source control or share them publicly. Revoke immediately if compromised.
        </p>
      </div>
    </div>
  )
}
