'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Bell, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { relativeTime } from '@/lib/utils'

interface Notification {
  id: string
  type: string
  title: string
  message: string | null
  read: boolean
  created_at: string
}

export function NotificationsBell() {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  const fetchNotifications = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/notifications?limit=10')
      if (!res.ok) return
      const data = await res.json()
      setNotifications(data.notifications ?? [])
      setUnreadCount(data.unreadCount ?? 0)
    } finally {
      setLoading(false)
    }
  }, [])

  // Fetch on mount and periodically
  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 60_000) // poll every minute
    return () => clearInterval(interval)
  }, [fetchNotifications])

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  async function markAllRead() {
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ all: true }),
    })
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    setUnreadCount(0)
  }

  async function markRead(id: string) {
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: [id] }),
    })
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
    setUnreadCount((c) => Math.max(0, c - 1))
  }

  const typeIcons: Record<string, string> = {
    new_member: '👋',
    invoice:    '💳',
    security:   '🔐',
    default:    '🔔',
  }

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500" />
        )}
      </button>

      {/* Panel */}
      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl border border-gray-200 shadow-lg z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
              >
                <Check className="h-3 w-3" />
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
            {loading && notifications.length === 0 && (
              <div className="py-8 text-center text-sm text-gray-400">Loading…</div>
            )}

            {!loading && notifications.length === 0 && (
              <div className="py-10 text-center">
                <p className="text-2xl mb-2">🔔</p>
                <p className="text-sm text-gray-400">No notifications yet</p>
              </div>
            )}

            {notifications.map((notif) => (
              <button
                key={notif.id}
                onClick={() => !notif.read && markRead(notif.id)}
                className={cn(
                  'w-full flex items-start gap-3 px-4 py-3 text-left transition-colors',
                  notif.read ? 'hover:bg-gray-50' : 'bg-blue-50 hover:bg-blue-100'
                )}
              >
                <span className="text-base shrink-0 mt-0.5">
                  {typeIcons[notif.type] ?? typeIcons.default}
                </span>
                <div className="flex-1 min-w-0">
                  <p className={cn('text-sm font-medium truncate', notif.read ? 'text-gray-700' : 'text-gray-900')}>
                    {notif.title}
                  </p>
                  {notif.message && (
                    <p className="text-xs text-gray-500 truncate">{notif.message}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-0.5">{relativeTime(notif.created_at)}</p>
                </div>
                {!notif.read && (
                  <span className="shrink-0 mt-1.5 h-2 w-2 rounded-full bg-blue-500" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
