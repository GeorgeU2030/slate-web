import { useRef, useState } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { useNavigate } from 'react-router'
import { Icon } from '@iconify/react'
import { TrendingTab } from '@/components/home/TrendingTab'
import { MyTitlesTab } from '@/components/home/MyTitlesTab'
import { SearchTab } from '@/components/home/SearchTab'
import { HOME_TABS, type TabKey } from '@/components/home/homeTabs'
import { useAuthStore } from '@/store/useAuthStore'
import { authApi } from '@/services/auth'
import { GUTTER } from '@/utils/layout'

export default function Home() {
  const ref = useRef<HTMLDivElement>(null)
  const tabListRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const clearTokens = useAuthStore((s) => s.clearTokens)
  const [tab, setTab] = useState<TabKey>('trending')

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.fromTo('.home-content', { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' })
      })
      return () => mm.revert()
    },
    { scope: ref, dependencies: [tab] }
  )

  const handleLogout = async () => {
    try {
      await authApi.logout()
    } finally {
      clearTokens()
      navigate('/login')
    }
  }

  const onTabKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
    e.preventDefault()
    const idx = HOME_TABS.findIndex((t) => t.id === tab)
    const next =
      e.key === 'ArrowRight' ? (idx + 1) % HOME_TABS.length : (idx - 1 + HOME_TABS.length) % HOME_TABS.length
    setTab(HOME_TABS[next].id)
    tabListRef.current?.querySelector<HTMLElement>(`#tab-${HOME_TABS[next].id}`)?.focus()
  }

  return (
    <div ref={ref} className="min-h-screen bg-paper pb-24 lg:pb-0">
      <header className={`sticky top-0 z-40 border-b border-paper-line bg-paper/85 backdrop-blur-md ${GUTTER}`}>
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center gap-2.5 text-ink">
            <img src="/slate.png" alt="" className="h-8 w-8 rounded-lg" />
            <span className="font-display text-2xl font-medium tracking-tight">Slate</span>
          </div>

          <div className="dropdown dropdown-end">
            <button
              tabIndex={0}
              aria-label="Account menu"
              className="btn btn-circle btn-ghost h-10 w-10 min-h-0 text-ink/70 hover:bg-paper-dim"
            >
              <Icon icon="ph:user-circle" className="text-2xl" />
            </button>
            <ul className="menu dropdown-content z-50 mt-2 w-48 rounded-xl border border-paper-line bg-paper p-1.5 shadow-lg shadow-ink/10">
              <li>
                <button onClick={handleLogout} className="rounded-lg text-sm text-ink">
                  <Icon icon="ph:sign-out" className="text-base" aria-hidden="true" />
                  Log out
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div
          ref={tabListRef}
          role="tablist"
          aria-label="Slate sections"
          onKeyDown={onTabKeyDown}
          className="hidden gap-8 lg:flex"
        >
          {HOME_TABS.map((item) => {
            const selected = tab === item.id
            return (
              <button
                key={item.id}
                id={`tab-${item.id}`}
                role="tab"
                aria-selected={selected}
                aria-controls={`panel-${item.id}`}
                tabIndex={selected ? 0 : -1}
                onClick={() => setTab(item.id)}
                className={`relative pb-3 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand ${
                  selected ? 'text-ink' : 'text-ink/45 hover:text-ink/70'
                }`}
              >
                {item.label}
                {selected && <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-brand" />}
              </button>
            )
          })}
        </div>
      </header>

      <main className={`pb-16 pt-8 ${GUTTER}`}>
        {HOME_TABS.map((item) => (
          <div
            key={item.id}
            id={`panel-${item.id}`}
            role="tabpanel"
            aria-labelledby={`tab-${item.id}`}
            hidden={tab !== item.id}
            className="home-content"
          >
            {tab === item.id && (
              <>
                {item.id === 'trending' && <TrendingTab />}
                {item.id === 'mine' && <MyTitlesTab />}
                {item.id === 'search' && <SearchTab />}
              </>
            )}
          </div>
        ))}
      </main>

      <nav
        className="dock z-40 border-t border-paper-line bg-paper/95 backdrop-blur-md lg:hidden"
        aria-label="Slate sections"
      >
        {HOME_TABS.map((item) => {
          const selected = tab === item.id
          return (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              aria-current={selected ? 'page' : undefined}
              className={selected ? 'dock-active text-brand' : 'text-ink/50'}
            >
              <Icon icon={selected ? item.activeIcon : item.icon} className="text-xl" aria-hidden="true" />
              <span className="dock-label">{item.label}</span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}