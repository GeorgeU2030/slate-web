import type { Title } from './Title'

export interface RatingScores {
  storyScore: number
  actingScore: number
  directionScore: number
  technicalScore: number
  impactScore: number
}

export interface UserTitleDetail extends Title, RatingScores {
  titleId: string
  averageScore: number | null
  ratingsCount: number
  review: string
}

export interface RatePayload extends RatingScores {
  tmdbId: number
  type: 'movie' | 'tv'
  review: string
  recommended: boolean
  completed?: boolean
}

export interface UpdateRatingPayload extends RatingScores {
  review: string
  recommended: boolean
  completed?: boolean
}