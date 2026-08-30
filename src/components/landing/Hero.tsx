import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { Icon } from '@iconify/react'
import { GUTTER } from '@/utils/layout'

interface HeroProps {
  backdropUrls?: string[]
}

export function Hero({ backdropUrls = [] }: HeroProps) {
  const ref = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const [loadedSet, setLoadedSet] = useState<Set<number>>(new Set())
  const [activeIndex, setActiveIndex] = useState(0)
  const [navLit, setNavLit] = useState(false)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap
          .timeline({ defaults: { ease: 'power3.out' } })
          .set('.hero-line', { yPercent: 110 })
          .set('.hero-fade', { opacity: 0, y: 16 })
          .to('.hero-line', { yPercent: 0, duration: 0.9, stagger: 0.08 })
          .to('.hero-fade', { opacity: 1, y: 0, duration: 0.8, stagger: 0.1 }, 0.4)
      })

      return () => mm.revert()
    },
    { scope: ref }
  )

  useEffect(() => {
    const heroEl = ref.current
    if (!heroEl) return
    let ticking = false
    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        setNavLit(window.scrollY > heroEl.offsetHeight - 96)
        ticking = false
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (backdropUrls.length < 2) return
    const id = setInterval(() => {
      setActiveIndex((i) => (i + 1) % backdropUrls.length)
    }, 6000)
    return () => clearInterval(id)
  }, [backdropUrls.length])

  const markLoaded = (i: number) =>
    setLoadedSet((prev) => {
      const next = new Set(prev)
      next.add(i)
      return next
    })

  const scrollToScore = () => {
    document.getElementById('score')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <>
      <nav
        className={`fixed inset-x-0 top-0 z-50 flex items-center justify-between py-4 transition-colors duration-500 ${GUTTER} ${
          navLit
            ? 'border-b border-paper-line bg-paper/90 text-ink shadow-sm backdrop-blur-md'
            : 'border-b border-transparent bg-transparent text-paper'
        }`}
      >
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2.5 font-display text-2xl font-medium tracking-tight"
        >
          <img src="/slate.png" alt="Slate" className="h-8 w-8 rounded-lg shadow-sm shadow-ink/30" />
          Slate
        </button>
        <div className={`hidden items-center gap-8 text-sm font-medium sm:flex ${navLit ? 'text-ink/70' : 'text-paper/80'}`}>
          <a href="#movies" className="transition-colors hover:text-brand">Movies</a>
          <a href="#tv" className="transition-colors hover:text-brand">TV</a>
          <a href="#score" className="transition-colors hover:text-brand">How scoring works</a>
        </div>
        <button
          onClick={() => navigate('/login')}
          className="btn btn-primary rounded-xl px-5 font-semibold"
        >
          Sign in
        </button>
      </nav>

      <header ref={ref} className="relative flex min-h-[92vh] items-end overflow-hidden bg-ink">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,color-mix(in_oklab,var(--color-gold-dim)_16%,transparent),transparent_60%)]" />

        {backdropUrls.map((url, i) => (
          <img
            key={url}
            src={url}
            alt=""
            onLoad={() => markLoaded(i)}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
              loadedSet.has(i) && i === activeIndex ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ))}

        <div className="absolute inset-0 bg-linear-to-t from-ink via-ink/70 to-ink/20" />
        <div className="absolute inset-0 bg-linear-to-r from-ink/90 via-ink/40 to-transparent" />

        <div className={`relative z-10 max-w-3xl pb-32 sm:pb-40 ${GUTTER}`}>
          <p className="hero-fade font-mono text-xs uppercase tracking-[0.3em] text-gold-soft">Now screening</p>
          <h1 className="mt-4 overflow-hidden">
            <span className="hero-line block font-display text-5xl font-medium leading-[1.05] tracking-tight text-paper sm:text-7xl">
              Every title,
            </span>
            <span className="hero-line block font-display text-5xl font-medium leading-[1.05] tracking-tight text-paper sm:text-7xl">
              scored <span className="text-brand-bright">on the record.</span>
            </span>
          </h1>
          <p className="hero-fade mt-6 max-w-lg text-base text-paper/70 sm:text-lg">
            Slate tracks what's trending, breaks down the score behind every title, and keeps an
            honest ledger of what's actually worth your time.
          </p>
          <div className="hero-fade mt-8 flex flex-wrap items-center gap-4">
            <button
              onClick={() => navigate('/register')}
              className="btn btn-primary btn-lg rounded-xl px-8 font-semibold"
            >
              Start tracking
            </button>
            <button
              onClick={scrollToScore}
              className="btn btn-outline btn-lg rounded-xl border-paper/30 px-8 font-semibold text-paper hover:border-paper hover:bg-paper/10 hover:text-paper"
            >
              <Icon icon="tabler:player-play" />
              See how it works
            </button>
          </div>
        </div>

        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-16 sm:h-20"
          style={{
            background:
              'linear-gradient(to bottom, ' +
              'color-mix(in oklab, var(--color-paper) 0%, transparent) 0%, ' +
              'color-mix(in oklab, var(--color-paper) 8%, transparent) 45%, ' +
              'color-mix(in oklab, var(--color-paper) 38%, transparent) 72%, ' +
              'color-mix(in oklab, var(--color-paper) 82%, transparent) 89%, ' +
              'var(--color-paper) 100%)',
          }}
          aria-hidden="true"
        />
      </header>
    </>
  )
}