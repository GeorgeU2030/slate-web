import { useEffect, useRef } from 'react'
import gsap from 'gsap'

interface LiveScoreRingProps {
  score: number
  color: string
  tierLabel: string
  size?: 'sm' | 'lg'
  onDark?: boolean
}

export function LiveScoreRing({ score, color, tierLabel, size = 'lg', onDark = true }: LiveScoreRingProps) {
  const scoreTextRef = useRef<SVGTSpanElement>(null)
  const arcRef = useRef<SVGCircleElement>(null)
  const displayedScore = useRef(score)

  const box = 160
  const radius = 66
  const stroke = 14
  const center = box / 2
  const circumference = 2 * Math.PI * radius

  useEffect(() => {
    const paint = (v: number) => {
      if (scoreTextRef.current) scoreTextRef.current.textContent = v.toFixed(1)
      if (arcRef.current) {
        const length = (v / 10) * circumference
        arcRef.current.setAttribute('stroke-dasharray', `${length} ${circumference - length}`)
      }
      displayedScore.current = v
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      paint(score)
      return
    }

    const obj = { value: displayedScore.current }
    const tween = gsap.to(obj, {
      value: score,
      duration: 0.45,
      ease: 'power2.out',
      onUpdate: () => paint(obj.value),
    })
    return () => {
      tween.kill()
    }
  }, [score, circumference])

  const dims = size === 'sm' ? 'h-20 w-20' : 'h-36 w-36 sm:h-40 sm:w-40'

  return (
    <div className="flex flex-col items-center">
      <svg
        viewBox={`0 0 ${box} ${box}`}
        className={`${dims} shrink-0`}
        role="img"
        aria-label={`Your score so far: ${score.toFixed(1)} out of 10, ${tierLabel}`}
      >
        <g transform={`rotate(-90 ${center} ${center})`}>
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={onDark ? 'var(--color-paper)' : 'var(--color-ink)'}
            strokeOpacity={0.1}
            strokeWidth={stroke}
          />
          <circle
            ref={arcRef}
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            className="transition-[stroke] duration-300"
          />
        </g>
        <text
          x="50%"
          y="46%"
          textAnchor="middle"
          dominantBaseline="middle"
          className={`font-mono text-3xl font-bold ${onDark ? 'fill-paper' : 'fill-ink'}`}
        >
          <tspan ref={scoreTextRef}>{score.toFixed(1)}</tspan>
        </text>
        <text
          x="50%"
          y="62%"
          textAnchor="middle"
          dominantBaseline="middle"
          className={`font-mono text-[0.55rem] uppercase tracking-widest ${onDark ? 'fill-paper/50' : 'fill-ink/50'}`}
        >
          out of 10
        </text>
      </svg>
      {size === 'lg' && (
        <p className="mt-2 text-sm font-semibold" style={{ color }}>
          {tierLabel}
        </p>
      )}
    </div>
  )
}