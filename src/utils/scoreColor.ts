export type ScoreTier = {
  color: string
  label: string
}

const TIERS: { min: number; color: string; label: string }[] = [
  { min: 9.0, color: 'var(--color-score-masterpiece)', label: 'Masterpiece' },
  { min: 7.5, color: 'var(--color-score-great)', label: 'Great' },
  { min: 6.0, color: 'var(--color-score-good)', label: 'Good' },
  { min: 4.5, color: 'var(--color-score-mixed)', label: 'Mixed' },
  { min: 3.0, color: 'var(--color-score-weak)', label: 'Weak' },
  { min: -Infinity, color: 'var(--color-score-bad)', label: 'Bad' },
]

function tierFor(score: number) {
  const s = Math.max(0, Math.min(10, score))
  return TIERS.find((t) => s >= t.min) ?? TIERS[TIERS.length - 1]
}

export function getScoreColor(score: number): string {
  return tierFor(score).color
}

export function getScoreTier(score: number): ScoreTier {
  const { color, label } = tierFor(score)
  return { color, label }
}
