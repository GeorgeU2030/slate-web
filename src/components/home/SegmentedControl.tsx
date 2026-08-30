import { useLayoutEffect, useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'

interface SegmentedControlProps<T extends string> {
  options: { value: T; label: string; count?: number }[]
  value: T
  onChange: (value: T) => void
  label: string
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  label,
}: SegmentedControlProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null)
  const pillRef = useRef<HTMLDivElement>(null)

  const movePill = (animate: boolean) => {
    const container = containerRef.current
    const pill = pillRef.current
    if (!container || !pill) return

    const activeButton = container.querySelector<HTMLElement>(`[data-value="${value}"]`)
    if (!activeButton) return

    const { offsetLeft, offsetWidth } = activeButton
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (animate && !reduced) {
      gsap.to(pill, { x: offsetLeft, width: offsetWidth, duration: 0.3, ease: 'power3.out' })
    } else {
      gsap.set(pill, { x: offsetLeft, width: offsetWidth })
    }
  }

  const labelsKey = options.map((o) => `${o.label}${o.count ?? ''}`).join('|')

  useLayoutEffect(() => {
    movePill(false)
  }, [])

  useGSAP(() => {
    movePill(true)
  }, [value, labelsKey])

  const onKeyDown = (e: React.KeyboardEvent) => {
    const idx = options.findIndex((o) => o.value === value)
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault()
      const next = e.key === 'ArrowRight' ? (idx + 1) % options.length : (idx - 1 + options.length) % options.length
      onChange(options[next].value)
      containerRef.current?.querySelector<HTMLElement>(`[data-value="${options[next].value}"]`)?.focus()
    }
  }

  return (
    <div
      ref={containerRef}
      role="radiogroup"
      aria-label={label}
      onKeyDown={onKeyDown}
      className="relative inline-flex items-center rounded-xl border border-paper-line bg-paper-dim/50 p-1"
    >
      <div ref={pillRef} className="absolute top-1 left-0 h-[calc(100%-8px)] rounded-lg bg-paper shadow-sm shadow-ink/10" />
      {options.map((opt) => {
        const selected = value === opt.value
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={selected ? 0 : -1}
            data-value={opt.value}
            onClick={() => onChange(opt.value)}
            className={`relative z-10 rounded-lg px-4 py-1.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
              selected ? 'text-ink' : 'text-ink/50 hover:text-ink/80'
            }`}
          >
            {opt.label}
            {opt.count != null && (
              <span className={`tabular-figs ml-1.5 text-xs ${selected ? 'text-ink/45' : 'text-ink/35'}`}>
                {opt.count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}