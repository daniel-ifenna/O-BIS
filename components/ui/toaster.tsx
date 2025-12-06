'use client'

import { useToast } from '@/hooks/use-toast'
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from '@/components/ui/toast'
import { useEffect } from 'react'

export function Toaster() {
  const { toasts } = useToast()

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search)
      const shouldClear = params.get('clear') === '1'
      if (!shouldClear) return
      try { localStorage.clear() } catch {}
      try { sessionStorage.clear() } catch {}
      try {
        if ('caches' in window) {
          caches.keys().then((keys) => keys.forEach((k) => caches.delete(k))).catch(() => {})
        }
      } catch {}
      const url = new URL(window.location.href)
      url.searchParams.delete('clear')
      history.replaceState(null, '', url.toString())
      window.location.reload()
    } catch {}
  }, [])

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
