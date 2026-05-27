'use client'

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react'

// --- Types ---
type ToastType = 'success' | 'error' | 'warning' | 'info'

interface Toast {
  id: string
  type: ToastType
  title: string
  message?: string
  duration?: number
}

interface ToastContextValue {
  toast: (opts: Omit<Toast, 'id'>) => void
  success: (title: string, message?: string) => void
  error: (title: string, message?: string) => void
  warning: (title: string, message?: string) => void
  info: (title: string, message?: string) => void
}

// --- Context ---
const ToastContext = createContext<ToastContextValue | null>(null)

// --- Provider ---
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = useCallback((opts: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).slice(2)
    setToasts((prev) => [...prev, { ...opts, id }])
    setTimeout(() => dismiss(id), opts.duration ?? 4000)
  }, [dismiss])

  const success = useCallback((title: string, message?: string) => toast({ type: 'success', title, message }), [toast])
  const error   = useCallback((title: string, message?: string) => toast({ type: 'error',   title, message, duration: 6000 }), [toast])
  const warning = useCallback((title: string, message?: string) => toast({ type: 'warning', title, message }), [toast])
  const info    = useCallback((title: string, message?: string) => toast({ type: 'info',    title, message }), [toast])

  return (
    <ToastContext.Provider value={{ toast, success, error, warning, info }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  )
}

// --- Hook ---
export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>')
  return ctx
}

// --- Toast item config ---
const typeConfig: Record<ToastType, { icon: React.ReactNode; bg: string; border: string; title: string }> = {
  success: {
    icon:   <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />,
    bg:     'bg-white',
    border: 'border-green-200',
    title:  'text-green-900',
  },
  error: {
    icon:   <XCircle className="h-5 w-5 text-red-500 shrink-0" />,
    bg:     'bg-white',
    border: 'border-red-200',
    title:  'text-red-900',
  },
  warning: {
    icon:   <AlertTriangle className="h-5 w-5 text-yellow-500 shrink-0" />,
    bg:     'bg-white',
    border: 'border-yellow-200',
    title:  'text-yellow-900',
  },
  info: {
    icon:   <Info className="h-5 w-5 text-blue-500 shrink-0" />,
    bg:     'bg-white',
    border: 'border-blue-200',
    title:  'text-blue-900',
  },
}

// --- Individual Toast ---
function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const cfg = typeConfig[toast.type]
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null)

  const handleMouseEnter = () => { if (timerRef.current) clearTimeout(timerRef.current) }
  const handleMouseLeave = () => {
    timerRef.current = setTimeout(() => onDismiss(toast.id), 1500)
  }

  return (
    <div
      role="alert"
      aria-live="assertive"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        'flex items-start gap-3 w-full max-w-sm rounded-lg border p-4 shadow-lg',
        'animate-in slide-in-from-right-5 fade-in duration-200',
        cfg.bg, cfg.border
      )}
    >
      {cfg.icon}
      <div className="flex-1 min-w-0">
        <p className={cn('text-sm font-medium', cfg.title)}>{toast.title}</p>
        {toast.message && (
          <p className="mt-0.5 text-xs text-gray-500">{toast.message}</p>
        )}
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="shrink-0 p-0.5 rounded text-gray-400 hover:text-gray-600 transition-colors"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}

// --- Container ---
function ToastContainer({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: string) => void }) {
  if (toasts.length === 0) return null

  return (
    <div
      aria-label="Notifications"
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 items-end"
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  )
}
