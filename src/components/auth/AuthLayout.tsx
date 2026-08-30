import { useRef, type ReactNode } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { useNavigate } from 'react-router'
import { AuthPanel } from './AuthPanel'
import { useTrendingMovies } from '@/hooks/useTrending'
import { GUTTER } from '@/utils/layout'

interface AuthLayoutProps {
  children: ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  const ref = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const { data: movies } = useTrendingMovies()

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.fromTo(
          '.auth-form-side',
          { opacity: 0, x: -20 },
          { opacity: 1, x: 0, duration: 0.7, ease: 'power3.out' }
        )
      })
      return () => mm.revert()
    },
    { scope: ref }
  )

  return (
    <div ref={ref} className="flex min-h-screen bg-paper">
      <div className="auth-form-side flex w-full flex-col lg:w-1/2">
        <nav className={`flex items-center justify-between py-6 ${GUTTER}`}>
          <button
            onClick={() => navigate('/landing')}
            className="flex items-center gap-2.5 rounded-lg text-ink transition-opacity hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
          >
            <img src="/slate.png" alt="" className="h-8 w-8 rounded-lg" />
            <span className="font-display text-lg font-medium tracking-tight">Slate</span>
          </button>
        </nav>

        <div className="flex flex-1 flex-col items-center justify-center px-6 py-10 sm:px-12 lg:px-16">
          <div className="w-full max-w-sm">{children}</div>
        </div>
      </div>

      <AuthPanel posterUrls={movies?.map((m) => m.posterUrl)} />
    </div>
  )
}