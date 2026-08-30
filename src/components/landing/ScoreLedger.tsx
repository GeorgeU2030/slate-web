import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { calculateScore } from '@/utils/scoreCalculator'
import { GUTTER } from '@/utils/layout'
import type { Title } from '@/types/Title'

gsap.registerPlugin(ScrollTrigger)

const WEIGHTS = [
  { label: 'Story', key: 'story', value: 30, color: 'var(--color-ring-story)' },
  { label: 'Direction', key: 'direction', value: 20, color: 'var(--color-ring-direction)' },
  { label: 'Acting', key: 'acting', value: 20, color: 'var(--color-ring-acting)' },
  { label: 'Technical', key: 'technical', value: 15, color: 'var(--color-ring-technical)' },
  { label: 'Impact', key: 'impact', value: 15, color: 'var(--color-ring-impact)' },
] as const

const EXAMPLE_SCORES = { story: 9, direction: 8, acting: 8, technical: 7, impact: 8 }

interface ScoreLedgerProps {
  exampleTitle?: Title
}

export function ScoreLedger({ exampleTitle }: ScoreLedgerProps) {
  const sectionRef = useRef<HTMLDivElement>(null)
  const scoreTextRef = useRef<SVGTSpanElement>(null)
  const score = calculateScore(EXAMPLE_SCORES)

  useGSAP(
    () => {
      const panel = sectionRef.current?.querySelector('.ledger-panel') ?? null
      const segments = gsap.utils.toArray<HTMLElement>('.ledger-ring-segment', sectionRef.current)
      const rows = gsap.utils.toArray<HTMLElement>('.breakdown-row', sectionRef.current)
      const mm = gsap.matchMedia()

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.set(panel, { opacity: 0, x: 24 })
        gsap.set(segments, { opacity: 0, scale: 0.85, transformOrigin: '50% 50%' })
        gsap.set(rows, { opacity: 0, y: 6 })

        const counter = { value: 0 }

        ScrollTrigger.create({
          trigger: sectionRef.current,
          start: 'top 75%',
          once: true,
          onEnter: () => {
            gsap.to(panel, { opacity: 1, x: 0, duration: 0.7, ease: 'power3.out' })
            gsap.to(segments, { opacity: 1, scale: 1, duration: 0.6, stagger: 0.1, ease: 'back.out(1.6)', delay: 0.15 })
            gsap.to(rows, { opacity: 1, y: 0, duration: 0.4, stagger: 0.06, ease: 'power2.out', delay: 0.4 })
            gsap.to(counter, {
              value: score,
              duration: 1.1,
              delay: 0.5,
              ease: 'power2.out',
              onUpdate: () => {
                if (scoreTextRef.current) scoreTextRef.current.textContent = counter.value.toFixed(1)
              },
            })
          },
        })
      })

      return () => mm.revert()
    },
    { scope: sectionRef, dependencies: [score] }
  )

  const size = 148
  const radius = 60
  const stroke = 16
  const center = size / 2
  const circumference = 2 * Math.PI * radius
  const GAP = 2.5 // hairline gap so adjacent segments stay countable

  let cumulative = 0
  const segments = WEIGHTS.map((w) => {
    const length = (w.value / 100) * circumference
    const seg = { ...w, length: length - GAP, offset: cumulative }
    cumulative += length
    return seg
  })

  return (
    <section ref={sectionRef} className={`bg-paper ${GUTTER} py-14 sm:py-20`}>
      <div className="card border border-paper-line bg-ink p-6 text-paper shadow-2xl shadow-ink/20 sm:p-10 lg:p-12">
        <div className="grid gap-8 sm:grid-cols-2 sm:items-center sm:gap-12 lg:gap-14">
          <div>
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.25em] text-gold-soft">
              The math behind the number
            </p>
            <h2 className="mt-2 font-display text-3xl font-medium tracking-tight text-paper sm:text-4xl">
              How Slate scores a title
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-paper/70">
              Every score is a weighted average across five categories, not a single opinion.
              Story and direction carry the most weight, because that's what a film is built on.
            </p>
          </div>

          <div className="ledger-panel rounded-2xl border border-paper/12 bg-paper/6 p-5 transition-shadow duration-300 hover:shadow-lg hover:shadow-ink/20 sm:p-6">
            <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center">
              <svg viewBox={`0 0 ${size} ${size}`} className="h-32 w-32 shrink-0 sm:h-36 sm:w-36">
                <g transform={`rotate(-90 ${center} ${center})`}>
                  <circle cx={center} cy={center} r={radius} fill="none" stroke="var(--color-paper)" strokeOpacity={0.1} strokeWidth={stroke} />
                  {segments.map((seg) => (
                    <circle
                      key={seg.label}
                      className="ledger-ring-segment"
                      cx={center}
                      cy={center}
                      r={radius}
                      fill="none"
                      stroke={seg.color}
                      strokeWidth={stroke}
                      strokeLinecap="butt"
                      strokeDasharray={`${seg.length} ${circumference - seg.length}`}
                      strokeDashoffset={-seg.offset}
                    />
                  ))}
                </g>
                <text x="50%" y="47%" textAnchor="middle" dominantBaseline="middle" className="fill-paper font-mono text-[1.9rem] font-bold">
                  <tspan ref={scoreTextRef}>8.2</tspan>
                </text>
                <text x="50%" y="63%" textAnchor="middle" dominantBaseline="middle" className="fill-paper/50 font-mono text-[0.5rem] uppercase tracking-widest">
                  out of 10
                </text>
              </svg>

              {exampleTitle && (
                <div className="flex w-full min-w-0 items-center gap-3 sm:w-auto">
                  <img
                    src={exampleTitle.posterUrl}
                    alt=""
                    className="h-20 w-14 shrink-0 rounded-lg object-cover shadow-lg shadow-ink/50 ring-1 ring-paper/15 sm:h-24 sm:w-16"
                  />
                  <div className="min-w-0">
                    <p className="font-mono text-[0.65rem] uppercase tracking-wide text-paper/45">Example</p>
                    <p className="mt-1 text-sm font-bold leading-snug text-paper">{exampleTitle.name}</p>
                  </div>
                </div>
              )}
            </div>

            <ul className="mt-6 space-y-2 border-t border-paper/12 pt-4">
              {WEIGHTS.map((w) => {
                const raw = EXAMPLE_SCORES[w.key as keyof typeof EXAMPLE_SCORES]
                const contribution = (raw * w.value) / 100
                return (
                  <li key={w.label} className="breakdown-row flex items-center justify-between text-xs">
                    <span className="flex min-w-0 items-center gap-2.5 text-paper/75">
                      <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: w.color }} />
                      <span className="truncate">{w.label}</span>
                      <span className="shrink-0 text-paper/40">· {w.value}%</span>
                    </span>
                    <span className="tabular-figs flex shrink-0 items-center gap-2.5 pl-3">
                      <span className="text-paper/50">{raw}/10</span>
                      <span className="w-9 text-right font-semibold text-paper">+{contribution.toFixed(1)}</span>
                    </span>
                  </li>
                )
              })}
            </ul>

            <div className="mt-4 flex items-center justify-between border-t border-paper/12 pt-4 text-sm font-bold text-paper">
              <span>Final score</span>
              <span className="tabular-figs text-lg text-ring-story">{score.toFixed(1)} / 10</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}