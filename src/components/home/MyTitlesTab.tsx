import { useMemo, useRef, useState } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { SegmentedControl } from './SegmentedControl'
import { useMyTitles } from '@/hooks/useTitles'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { groupByYear } from '@/utils/groupByYear'
import { TitleGridCard } from './TitleGridCard'
import { TitleGridSkeleton } from './TitleGridSkeleton'
import { EmptyState } from './EmptyState'
import { SearchInput } from './SearchInput'

type SectionKey = 'movies' | 'shows'

export function MyTitlesTab() {
  const ref = useRef<HTMLDivElement>(null)
  const [query, setQuery] = useState('')
  const [section, setSection] = useState<SectionKey>('movies')
  const debouncedQuery = useDebouncedValue(query, 300)

  const { data, isLoading } = useMyTitles({ q: debouncedQuery.trim() || undefined })

  const movies = useMemo(() => (data ?? []).filter((t) => t.type.toLowerCase() === 'movie'), [data])
  const shows = useMemo(() => (data ?? []).filter((t) => t.type.toLowerCase() === 'tv'), [data])

  const activeList = section === 'movies' ? movies : shows
  const activeGroups = useMemo(() => groupByYear(activeList), [activeList])

  const topRatedActive = useMemo(
    () => [...activeList].sort((a, b) => (b.overallScore ?? -1) - (a.overallScore ?? -1)).slice(0, 6),
    [activeList]
  )

  const scored = activeList.filter((t) => t.overallScore != null)
  const average = scored.length
    ? scored.reduce((sum, t) => sum + (t.overallScore ?? 0), 0) / scored.length
    : null

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.fromTo(
          '.mytitles-year-group',
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: 'power3.out' }
        )
      })
      return () => mm.revert()
    },
    { scope: ref, dependencies: [activeGroups.length, isLoading, section] }
  )

  const noun = section === 'movies' ? 'movies' : 'shows'

  return (
    <div ref={ref} className="space-y-10">
      <div>
        <h1 className="font-display text-2xl font-medium tracking-tight text-ink sm:text-3xl">Your ledger</h1>

        <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-1 text-sm text-ink-soft">
          <span>
            <span className="tabular-figs font-semibold text-ink">{activeList.length}</span> {noun} rated
          </span>
          {average != null && (
            <span>
              average <span className="tabular-figs font-semibold text-ink">{average.toFixed(1)}</span>
              <span className="text-ink/40"> / 10</span>
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput
          label="Search your rated titles"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onClear={() => setQuery('')}
          placeholder="Search your titles…"
          className="sm:max-w-xs"
        />
        <SegmentedControl<SectionKey>
          label="Filter by type"
          options={[
            { value: 'movies', label: 'Movies', count: movies.length || undefined },
            { value: 'shows', label: 'TV Shows', count: shows.length || undefined },
          ]}
          value={section}
          onChange={setSection}
        />
      </div>

      {!debouncedQuery && topRatedActive.length > 0 && (
        <section>
          <p className="font-mono text-xs font-medium uppercase tracking-[0.25em] text-brand">Your best</p>
          <h2 className="mt-1 font-display text-xl font-medium tracking-tight text-ink sm:text-2xl">
            Top rated {noun}
          </h2>
          <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {topRatedActive.map((title, index) => (
              <TitleGridCard key={title.titleId} title={title} rank={index + 1} hideRatedBadge />
            ))}
          </div>
        </section>
      )}

      <div aria-live="polite">
        {isLoading ? (
          <TitleGridSkeleton count={6} />
        ) : activeGroups.length === 0 ? (
          debouncedQuery ? (
            <EmptyState
              icon="ph:binoculars"
              title="No matches"
              description={`None of your ${noun} match “${debouncedQuery.trim()}”.`}
              action={{ label: 'Clear search', onClick: () => setQuery('') }}
            />
          ) : (
            <EmptyState
              icon="ph:bookmark-simple"
              title={`No ${noun} yet`}
              description={`Rate your first ${section === 'movies' ? 'movie' : 'show'} and it'll show up here, grouped by year.`}
            />
          )
        ) : (
          <div className="space-y-10">
            {activeGroups.map((group) => (
              <section key={group.year} className="mytitles-year-group">
                <div className="flex items-baseline gap-3">
                  <h2 className="tabular-figs font-display text-xl font-medium tracking-tight text-ink sm:text-2xl">
                    {group.year}
                  </h2>
                  <span className="tabular-figs text-xs text-ink/40">{group.titles.length}</span>
                  <span className="h-px flex-1 bg-paper-line" aria-hidden="true" />
                </div>
                <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
                  {group.titles.map((title) => (
                    <TitleGridCard key={title.titleId} title={title} hideRatedBadge />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}