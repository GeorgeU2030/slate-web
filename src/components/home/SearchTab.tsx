import { useRef, useState } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { useSearchTitles } from '@/hooks/useTitles'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { TitleGridCard } from './TitleGridCard'
import { TitleGridSkeleton } from './TitleGridSkeleton'
import { EmptyState } from './EmptyState'
import { SearchInput } from './SearchInput'

export function SearchTab() {
  const ref = useRef<HTMLDivElement>(null)
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebouncedValue(query, 400)
  const { data, isLoading, isFetching } = useSearchTitles(debouncedQuery)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.fromTo(
          '.search-result-card',
          { opacity: 0, y: 14 },
          { opacity: 1, y: 0, duration: 0.4, stagger: 0.04, ease: 'power3.out' }
        )
      })
      return () => mm.revert()
    },
    { scope: ref, dependencies: [data?.length] }
  )

  const trimmed = debouncedQuery.trim()
  const tooShort = trimmed.length < 2
  const busy = !tooShort && (isLoading || isFetching)

  return (
    <div ref={ref}>
      <h1 className="font-display text-2xl font-medium tracking-tight text-ink sm:text-3xl">Search</h1>
      <p className="mt-2 text-sm text-ink-soft">Find any movie or show to rate it.</p>

      <div className="mt-5 max-w-md">
        <SearchInput
          label="Search movies and shows"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onClear={() => setQuery('')}
          placeholder="Search any movie or show…"
        />
      </div>

      <div className="mt-8" aria-live="polite">
        {tooShort ? (
          <EmptyState
            icon="ph:magnifying-glass"
            title="Start typing"
            description="Enter at least 2 characters to search across movies and TV."
          />
        ) : busy ? (
          <TitleGridSkeleton count={6} />
        ) : !data || data.length === 0 ? (
          <EmptyState
            icon="ph:binoculars"
            title="No matches"
            description={`Nothing came back for “${trimmed}”. Try a different spelling or a shorter title.`}
          />
        ) : (
          <>
            <p className="sr-only">
              {data.length} result{data.length === 1 ? '' : 's'} for {trimmed}
            </p>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {data.map((title) => (
                <div key={`${title.type}-${title.tmdbId}`} className="search-result-card">
                  <TitleGridCard title={title} />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}