import type { MyTitle } from '@/types/Title'

export interface YearGroup {
  year: number
  titles: MyTitle[]
}

export function groupByYear(titles: MyTitle[]): YearGroup[] {
  const map = new Map<number, MyTitle[]>()

  for (const title of titles) {
    const year = title.date ? new Date(title.date).getFullYear() : 0
    if (!map.has(year)) map.set(year, [])
    map.get(year)!.push(title)
  }

  return Array.from(map.entries())
    .map(([year, items]) => ({
      year,
      titles: [...items].sort((a, b) => (b.overallScore ?? -1) - (a.overallScore ?? -1)),
    }))
    .sort((a, b) => b.year - a.year)
}