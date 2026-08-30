export type TabKey = 'trending' | 'mine' | 'search'

export const HOME_TABS: { id: TabKey; label: string; icon: string; activeIcon: string }[] = [
  { id: 'trending', label: 'Trending', icon: 'ph:trend-up', activeIcon: 'ph:trend-up-bold' },
  { id: 'mine', label: 'My Titles', icon: 'ph:bookmark-simple', activeIcon: 'ph:bookmark-simple-fill' },
  { id: 'search', label: 'Search', icon: 'ph:magnifying-glass', activeIcon: 'ph:magnifying-glass-bold' },
]