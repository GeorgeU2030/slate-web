import { getScoreTier } from '@/utils/scoreColor'

interface CommunityScoreBadgeProps {
  averageScore: number
  ratingsCount: number
}

export function CommunityScoreBadge({ averageScore, ratingsCount }: CommunityScoreBadgeProps) {
  const { color, label } = getScoreTier(averageScore)
  const box = 52
  const radius = 22
  const stroke = 4
  const center = box / 2
  const circumference = 2 * Math.PI * radius
  const filled = (averageScore / 10) * circumference

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-paper/15 bg-ink/70 px-4 py-3 backdrop-blur-sm">
      <div className="relative shrink-0">
        <svg viewBox={`0 0 ${box} ${box}`} className="h-13 w-13" aria-hidden="true">
          <g transform={`rotate(-90 ${center} ${center})`}>
            <circle cx={center} cy={center} r={radius} fill="none" stroke="var(--color-paper)" strokeOpacity={0.12} strokeWidth={stroke} />
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={color}
              strokeWidth={stroke}
              strokeLinecap="round"
              strokeDasharray={`${filled} ${circumference - filled}`}
            />
          </g>
        </svg>
        <span className="tabular-figs absolute inset-0 grid place-items-center text-sm font-bold" style={{ color }}>
          {averageScore.toFixed(1)}
        </span>
      </div>

      <div className="text-xs leading-tight">
        <p className="font-semibold text-paper/85">Community avg</p>
        <p className="tabular-figs text-paper/50">
          {ratingsCount} rating{ratingsCount === 1 ? '' : 's'} · {label}
        </p>
      </div>
    </div>
  )
}