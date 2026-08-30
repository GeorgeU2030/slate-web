import { useNavigate } from 'react-router'
import { useTrendingMovies, useTrendingTv } from '@/hooks/useTrending'
import { Hero } from '@/components/landing/Hero'
import { CarouselRow } from '@/components/landing/CarouselRow'
import { ScoreLedger } from '@/components/landing/ScoreLedger'
import { GUTTER } from '@/utils/layout'

export default function Landing () {
  const { data: movies, isLoading: loadingMovies } = useTrendingMovies()
  const { data: shows, isLoading: loadingShows } = useTrendingTv()

  const navigate = useNavigate()

  return (
    <div className="bg-paper">
      <Hero backdropUrls={movies?.slice(0, 3).map((m) => m.backdropUrl)} />

      <main>
        <div id="movies">
          <CarouselRow eyebrow="Trending" heading="Movies on the slate" items={movies} isLoading={loadingMovies} />
        </div>

        <div id="tv" className="border-t border-paper-line">
          <CarouselRow eyebrow="Trending" heading="Series worth a binge" items={shows} isLoading={loadingShows} />
        </div>

        <div id="score" className="border-t border-paper-line">
          <ScoreLedger exampleTitle={movies?.[1]} />
        </div>

        <section className={`border-t border-paper-line py-24 text-center ${GUTTER}`}>
          <div className="flex items-center justify-center gap-2.5 text-ink">
            <img src="/slate.png" alt="Slate" className="h-8 w-8 rounded-lg shadow-sm shadow-ink/10" />
            <span className="font-display text-3xl font-medium tracking-tight">Slate</span>
          </div>

          <h2 className="mx-auto mt-6 max-w-xl font-display text-3xl font-medium tracking-tight text-ink sm:text-4xl">
            Stop guessing if it's worth the runtime.
          </h2>

          <button
            onClick={() => navigate('/register')}
            className="btn btn-primary btn-lg mt-8 rounded-full px-10 font-semibold"
          >
            Create your account
          </button>
        </section>
      </main>

      <footer className={`border-t border-paper-line py-10 text-sm text-ink-soft ${GUTTER}`}>
        <div className="flex flex-col items-center justify-between gap-5 sm:flex-row">
          <div className="flex items-center gap-2.5">
            <span>Slate - developed by</span>
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center">
                <img src="/Polarky.png" alt="Polarky" className="h-10 w-10 scale-125 object-contain" />
              </div>
              <span className="font-medium text-ink">polarky</span>
            </div>
          </div>
          <p>© {new Date().getFullYear()} polarky. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}