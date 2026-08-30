import { useRef } from 'react'
import { getScoreTier } from '@/utils/scoreColor'

interface ScoreSelectorProps {
  value: number
  onChange: (value: number) => void
  label: string
  min?: number
  max?: number
}

export function ScoreSelector({ value, onChange, label, min = 1, max = 10 }: ScoreSelectorProps) {
  const groupRef = useRef<HTMLDivElement>(null)
  const values = Array.from({ length: max - min + 1 }, (_, i) => min + i)

  const focusValue = (v: number) => {
    onChange(v)
    groupRef.current?.querySelector<HTMLElement>(`[data-score="${v}"]`)?.focus()
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    const keys: Record<string, number> = {
      ArrowRight: value + 1,
      ArrowUp: value + 1,
      ArrowLeft: value - 1,
      ArrowDown: value - 1,
      Home: min,
      End: max,
    }
    const next = keys[e.key]
    if (next === undefined) return
    e.preventDefault()
    focusValue(Math.max(min, Math.min(max, next)))
  }

  return (
    <div
      ref={groupRef}
      role="radiogroup"
      aria-label={`${label} score, ${min} to ${max}`}
      onKeyDown={onKeyDown}
      className="grid grid-cols-5 gap-1.5 sm:grid-cols-10"
    >
      {values.map((n) => {
        const selected = n === value
        const { color, label: tierLabel } = getScoreTier(n)
        return (
          <button
            key={n}
            type="button"
            role="radio"
            data-score={n}
            aria-checked={selected}
            aria-label={`${n} out of ${max} — ${tierLabel}`}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(n)}
            className={`tabular-figs grid h-11 place-items-center rounded-lg border text-sm font-semibold transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
              selected
                ? 'border-transparent text-ink shadow-sm'
                : 'border-paper-line bg-paper text-ink/45 hover:border-ink/25 hover:text-ink/75'
            }`}
            style={selected ? { backgroundColor: color } : undefined}
          >
            {n}
          </button>
        )
      })}
    </div>
  )
}