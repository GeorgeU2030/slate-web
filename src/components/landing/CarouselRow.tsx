import { useCallback, useEffect, useRef, useState } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Icon } from '@iconify/react'
import { TitleCard } from './TitleCard'
import { GUTTER, SCROLL_GUTTER } from '@/utils/layout'
import type { Title } from '@/types/Title'

gsap.registerPlugin(ScrollTrigger)

interface CarouselRowProps {
  eyebrow: string
  heading: string
  items?: Title[]
  isLoading?: boolean
  compact?: boolean
}

export function CarouselRow({ eyebrow, heading, items, isLoading, compact = false }: CarouselRowProps) {
  const sectionRef = useRef<HTMLDivElement>(null)
  const scrollerRef = useRef<HTMLDivElement>(null)

  const [progress, setProgress] = useState(0)
  const [thumbRatio, setThumbRatio] = useState(1)
  const [atStart, setAtStart] = useState(true)
  const [atEnd, setAtEnd] = useState(false)

  const syncScrollState = useCallback(() => {
    const scroller = scrollerRef.current
    if (!scroller) return
    const { scrollLeft, scrollWidth, clientWidth } = scroller
    const max = scrollWidth - clientWidth
    setThumbRatio(scrollWidth > 0 ? Math.min(1, clientWidth / scrollWidth) : 1)
    setProgress(max > 1 ? scrollLeft / max : 0)
    setAtStart(scrollLeft <= 1)
    setAtEnd(max <= 1 || scrollLeft >= max - 1)
  }, [])

  useEffect(() => {
    const scroller = scrollerRef.current
    if (!scroller) return
    syncScrollState()
    scroller.addEventListener('scroll', syncScrollState, { passive: true })
    const ro = new ResizeObserver(syncScrollState)
    ro.observe(scroller)
    return () => {
      scroller.removeEventListener('scroll', syncScrollState)
      ro.disconnect()
    }
  }, [syncScrollState, items, isLoading])

  useGSAP(
    () => {
      if (isLoading) return
      if (!items?.length) return

      const scroller = scrollerRef.current
      if (!scroller) return

      const cards = gsap.utils.toArray<HTMLElement>('.slate-card', scroller)
      const mm = gsap.matchMedia()

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.set(cards, { opacity: 0, y: 18, scale: 0.97 })

        ScrollTrigger.batch(cards, {
          start: 'left 90%',
          once: true,
          onEnter: (batch) =>
            gsap.to(batch, {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 0.45,
              ease: 'power2.out',
              stagger: 0.05,
            }),
        })
      })

      let isDown = false
      let startX = 0
      let startScroll = 0

      const onPointerDown = (e: PointerEvent) => {
        isDown = true
        startX = e.clientX
        startScroll = scroller.scrollLeft
        scroller.style.scrollSnapType = 'none'
        scroller.setPointerCapture(e.pointerId)
      }
      const onPointerMove = (e: PointerEvent) => {
        if (!isDown) return
        scroller.scrollLeft = startScroll - (e.clientX - startX)
      }
      const onPointerUp = () => {
        isDown = false
        scroller.style.scrollSnapType = ''
      }

      scroller.addEventListener('pointerdown', onPointerDown)
      scroller.addEventListener('pointermove', onPointerMove)
      scroller.addEventListener('pointerup', onPointerUp)
      scroller.addEventListener('pointercancel', onPointerUp)

      return () => {
        mm.revert()
        scroller.removeEventListener('pointerdown', onPointerDown)
        scroller.removeEventListener('pointermove', onPointerMove)
        scroller.removeEventListener('pointerup', onPointerUp)
        scroller.removeEventListener('pointercancel', onPointerUp)
      }
    },
    {
      scope: sectionRef,
      dependencies: [items, isLoading],
    }
  )

  const scrollByCard = (dir: 1 | -1) => {
    const scroller = scrollerRef.current
    if (!scroller) return
    const card = scroller.querySelector<HTMLElement>('.slate-card')
    const distance = (card?.offsetWidth ?? 280) + 24
    scroller.scrollBy({ left: dir * distance, behavior: 'smooth' })
  }

  const showProgress = !isLoading && thumbRatio < 1

  return (
    <section
      ref={sectionRef}
      className={`relative bg-paper ${compact ? 'py-8 first:pt-4' : 'pt-12 pb-10 sm:pt-16 sm:pb-12'}`}
    >
      <div className={`flex items-end justify-between ${GUTTER}`}>
        <div>
          <p className="font-mono text-xs font-medium uppercase tracking-[0.25em] text-brand">{eyebrow}</p>
          <h2 className="mt-2 font-display text-3xl font-medium tracking-tight text-ink sm:text-4xl">{heading}</h2>
        </div>
        <div className="hidden gap-2 sm:flex">
          <button
            aria-label="Previous"
            onClick={() => scrollByCard(-1)}
            disabled={atStart}
            className="btn btn-circle btn-outline border-paper-line text-ink/70 transition-colors hover:border-brand hover:bg-transparent hover:text-brand disabled:border-paper-line/60 disabled:text-ink/20"
          >
            <Icon icon="line-md:chevron-left" />
          </button>
          <button
            aria-label="Next"
            onClick={() => scrollByCard(1)}
            disabled={atEnd}
            className="btn btn-circle btn-outline border-paper-line text-ink/70 transition-colors hover:border-brand hover:bg-transparent hover:text-brand disabled:border-paper-line/60 disabled:text-ink/20"
          >
            <Icon icon="line-md:chevron-right" />
          </button>
        </div>
      </div>

      <div
        ref={scrollerRef}
        role="region"
        aria-label={heading}
        tabIndex={0}
        className={`slate-scroller mt-8 flex cursor-grab snap-x snap-mandatory select-none gap-6 overflow-x-auto scroll-smooth focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand ${GUTTER} ${SCROLL_GUTTER}`}
        style={{
          maskImage: 'linear-gradient(to right, transparent, black 3%, black 97%, transparent)',
        }}
      >
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="skeleton h-84 w-52 shrink-0 snap-start rounded-2xl bg-paper-dim" />
            ))
          : items?.map((item) => (
              <div key={item.tmdbId} className="slate-card shrink-0 snap-start">
                <TitleCard title={item} />
              </div>
            ))}
      </div>

      {showProgress && (
        <div className={`mt-5 ${GUTTER}`}>
          <div className="h-0.5 w-full overflow-hidden rounded-full bg-paper-line/70">
            <div
              className="h-full rounded-full bg-brand/70 transition-transform duration-150 ease-out"
              style={{
                width: `${thumbRatio * 100}%`,
                transform: `translateX(${(progress * (1 - thumbRatio) * 100) / thumbRatio}%)`,
              }}
            />
          </div>
        </div>
      )}
    </section>
  )
}