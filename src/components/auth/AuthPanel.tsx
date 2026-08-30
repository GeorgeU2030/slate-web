import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'

interface AuthPanelProps {
  posterUrls?: string[]
}

export function AuthPanel({ posterUrls = [] }: AuthPanelProps) {
  const ref = useRef<HTMLDivElement>(null)
  const scoreRef = useRef<HTMLSpanElement>(null)

  const columns: string[][] = [[], [], []]
  if (posterUrls.length > 0) {
    posterUrls.forEach((url, i) => columns[i % 3].push(url))
    columns.forEach((col) => {
      while (col.length < 4) col.push(posterUrls[col.length % posterUrls.length])
    })
  }

  useGSAP(
    () => {
      const mm = gsap.matchMedia()

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.fromTo(ref.current, { opacity: 0 }, { opacity: 1, duration: 1.2, ease: 'power2.out' })

        gsap.fromTo(
          '.auth-panel-text',
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.8, stagger: 0.12, ease: 'power3.out', delay: 0.3 }
        )

        gsap.utils.toArray<HTMLElement>('.auth-poster-col').forEach((col, i) => {
          gsap.fromTo(
            col,
            { y: 40, opacity: 0 },
            { y: 0, opacity: 1, duration: 1, ease: 'power2.out', delay: 0.1 * i }
          )
          gsap.to(col, {
            y: i % 2 === 0 ? -18 : 14,
            duration: 6 + i,
            ease: 'sine.inOut',
            repeat: -1,
            yoyo: true,
            delay: i * 0.4,
          })
        })

        const counter = { value: 0 }
        gsap.to(counter, {
          value: 8.3,
          duration: 1.4,
          delay: 0.6,
          ease: 'power2.out',
          onUpdate: () => {
            if (scoreRef.current) scoreRef.current.textContent = counter.value.toFixed(1)
          },
        })
      })

      mm.add('(prefers-reduced-motion: reduce)', () => {
        gsap.set([ref.current, '.auth-panel-text', '.auth-poster-col'], { opacity: 1, x: 0, y: 0 })
        if (scoreRef.current) scoreRef.current.textContent = '8.3'
      })

      return () => mm.revert()
    },
    { scope: ref, dependencies: [posterUrls.length] }
  )

  return (
    <div ref={ref} className="relative hidden flex-col overflow-hidden bg-ink lg:flex lg:w-1/2">
      {posterUrls.length > 0 && (
        <div className="absolute inset-0 flex gap-3 p-3 opacity-70 blur-[1px]" aria-hidden="true">
          {columns.map((col, i) => (
            <div key={i} className="auth-poster-col flex flex-1 flex-col gap-3">
              {col.map((url, j) => (
                <div key={`${url}-${j}`} className="aspect-2/3 w-full overflow-hidden rounded-2xl">
                  <img src={url} alt="" className="h-full w-full object-cover" />
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      <div className="absolute inset-0 bg-linear-to-b from-ink via-ink/80 to-ink" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,transparent,var(--color-ink)_75%)]" />

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-12 text-center">
        <div className="auth-panel-text mb-6 grid h-20 w-20 place-items-center rounded-[28px] bg-brand-bright/12 ring-1 ring-brand-bright/25">
          <span ref={scoreRef} className="tabular-figs text-3xl font-bold text-ring-story">
            0.0
          </span>
        </div>
        <p className="auth-panel-text font-mono text-[0.65rem] font-semibold uppercase tracking-[0.25em] text-gold-soft">
          Your score, your call
        </p>
        <h2 className="auth-panel-text mt-3 font-display text-2xl font-medium leading-snug tracking-tight text-paper">
          Track every title.
          <br />
          Score what you watch.
        </h2>
        <p className="auth-panel-text mt-3 max-w-xs text-sm leading-relaxed text-paper/60">
          Slate keeps a running ledger of everything you've seen, rated across five dimensions -
          story, direction, acting, technical, and impact.
        </p>
      </div>

      <div className="relative z-10 px-12 pb-8 text-center">
        <p className="text-xs text-paper/35">Slate - developed by polarky</p>
      </div>
    </div>
  )
}