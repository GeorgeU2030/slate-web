import { Icon } from '@iconify/react'
import { ScoreSelector } from './ScoreSelector'
import { getScoreTier } from '@/utils/scoreColor'

interface ScoreCategoryRowProps {
  icon: string
  label: string
  description: string
  weight: number
  value: number
  onChange: (value: number) => void
}

export function ScoreCategoryRow({
  icon,
  label,
  description,
  weight,
  value,
  onChange,
}: ScoreCategoryRowProps) {
  const { color, label: tierLabel } = getScoreTier(value)

  return (
    <div className="py-5">
      <div className="flex items-start gap-3 sm:gap-4">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-paper-dim">
          <Icon icon={icon} className="text-xl text-ink/70" aria-hidden="true" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-bold text-ink">{label}</p>
              <p className="mt-0.5 text-xs leading-snug text-ink-soft">{description}</p>
            </div>

            <div className="flex shrink-0 flex-col items-end">
              <span
                className="tabular-figs rounded-md px-2 py-0.5 text-sm font-bold text-ink"
                style={{ backgroundColor: color }}
              >
                {value}
              </span>
              <span className="mt-1 text-[0.65rem] font-medium uppercase tracking-wide text-ink/45">
                {tierLabel} · {weight}%
              </span>
            </div>
          </div>

          <div className="mt-3.5">
            <ScoreSelector value={value} onChange={onChange} label={label} />
          </div>
        </div>
      </div>
    </div>
  )
}