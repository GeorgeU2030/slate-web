import { useEffect, useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { Icon } from '@iconify/react'

interface MaintenanceProps {
  reason: 'offline' | 'server'
  onRetry: () => void
  isRetrying: boolean
  secondsUntilNextCheck: number | null
  lastCheckedAt: Date | null
}

const COPY = {
  icon: 'ph:cell-tower',
  title: 'Slate is unavailable',
  description: 'The server isn’t responding. This is usually brief, and nothing you’ve rated has been lost.',
  hint: 'Checking again automatically until it responds.',
} as const

export function Maintenance({
  reason,
  onRetry,
  isRetrying,
  secondsUntilNextCheck,
  lastCheckedAt,
}: MaintenanceProps) {
  const ref = useRef<HTMLDivElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const copy = COPY

  useEffect(() => {
    headingRef.current?.focus()
  }, [reason])

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.fromTo(
          '.maintenance-fade',
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.6, stagger: 0.08, ease: 'power3.out' }
        )
      })
      return () => mm.revert()
    },
    { scope: ref, dependencies: [reason] }
  )

  return (
    <div
      ref={ref}
      role="alert"
      aria-live="assertive"
      aria-busy={isRetrying}
      className="flex min-h-screen flex-col items-center justify-center bg-paper px-6 text-center"
    >
      <div className="maintenance-fade flex items-center gap-2.5 text-ink">
        <img src="/slate.png" alt="" className="h-8 w-8 rounded-lg" />
        <span className="font-display text-lg font-medium tracking-tight">Slate</span>
      </div>

      <div className="maintenance-fade mt-10 grid h-16 w-16 place-items-center rounded-2xl bg-brand/10 ring-1 ring-brand/20">
        <Icon icon={copy.icon} className="text-3xl text-brand" aria-hidden="true" />
      </div>

      <h1
        ref={headingRef}
        tabIndex={-1}
        className="maintenance-fade mt-6 font-display text-3xl font-medium tracking-tight text-ink focus:outline-none sm:text-4xl"
      >
        {copy.title}
      </h1>

      <p className="maintenance-fade mt-3 max-w-md text-sm leading-relaxed text-ink-soft">
        {copy.description}
      </p>

      <button
        onClick={onRetry}
        disabled={isRetrying}
        className="maintenance-fade btn btn-primary btn-lg mt-8 h-12 min-h-0 rounded-xl px-8 font-semibold"
      >
        {isRetrying && <span className="loading loading-spinner loading-sm" aria-hidden="true" />}
        {isRetrying ? 'Checking…' : 'Try again'}
      </button>

      <div className="maintenance-fade mt-5 flex flex-col items-center gap-1 text-xs text-ink/45">
        <p aria-live="polite">
          {isRetrying
            ? 'Checking now…'
            : secondsUntilNextCheck != null
              ? `Next automatic check in ${secondsUntilNextCheck}s`
              : copy.hint}
        </p>
        {lastCheckedAt && (
          <p>
            Last checked{' '}
            <time dateTime={lastCheckedAt.toISOString()}>
              {lastCheckedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </time>
          </p>
        )}
      </div>
    </div>
  )
}