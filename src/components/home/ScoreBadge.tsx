import { getScoreTier } from '@/utils/scoreColor'

interface ScoreBadgeProps {
  score: number | null
  size?: 'sm' | 'md'
}

export function ScoreBadge({ score, size = 'md' }: ScoreBadgeProps) {
  if (score == null) return null

  const { color, label } = getScoreTier(score)
  const dims = size === 'sm' ? 'h-8 w-8 text-[0.7rem]' : 'h-9 w-9 text-sm'

  return (
    <span
      role="img"
      aria-label={`${label} — rated ${score.toFixed(1)} out of 10`}
      title={label}
      className={`tabular-figs grid shrink-0 place-items-center rounded-lg font-bold text-ink shadow-sm shadow-ink/40 ${dims}`}
      style={{ backgroundColor: color }}
    >
      {score.toFixed(1)}
    </span>
  )
}