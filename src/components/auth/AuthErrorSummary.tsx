import { useEffect, useRef } from 'react'
import { Icon } from '@iconify/react'

interface AuthErrorSummaryProps {
  message?: string
}

export function AuthErrorSummary({ message }: AuthErrorSummaryProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (message) ref.current?.focus()
  }, [message])

  if (!message) return null

  return (
    <div
      ref={ref}
      role="alert"
      tabIndex={-1}
      className="alert alert-error auth-field rounded-xl border-brand-bright/25 bg-brand-bright/10 px-4 py-3 text-sm text-brand-bright focus:outline-2 focus:outline-offset-2 focus:outline-brand-bright"
    >
      <Icon icon="ph:warning-circle-fill" className="shrink-0 text-base" aria-hidden="true" />
      <span>{message}</span>
    </div>
  )
}