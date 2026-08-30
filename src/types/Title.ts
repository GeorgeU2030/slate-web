export type TitleType = 'Movie' | 'Tv'

export interface Title {
  tmdbId: number
  type: TitleType
  name: string
  originalTitle: string
  overview: string
  posterUrl: string
  backdropUrl: string
  date: string
  isOngoing: boolean
  seasonsCount: number | null
  completed: boolean | null
  genres: string[]
  productionCompanies: string[]
  watchProviders: string[]
  userTitleId: string | null
  overallScore: number | null
  recommended: boolean
  averageScore?: number | null
  ratingsCount?: number
}

export interface MyTitle extends Title {
  titleId: string
}