export interface ScoreInputs {
  story: number
  acting: number
  direction: number
  technical: number
  impact: number
}

export function calculateScore({ story, acting, direction, technical, impact }: ScoreInputs): number {
  const score =
    story * 0.3 +
    acting * 0.2 +
    direction * 0.2 +
    technical * 0.15 +
    impact * 0.15

  return Math.round(score * 10) / 10
}
