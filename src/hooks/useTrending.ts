import { useQuery } from '@tanstack/react-query'
import { titlesApi } from '@/services/titles'

export function useTrendingMovies() {
  return useQuery({
    queryKey: ['titles', 'trending', 'movies'],
    queryFn: titlesApi.trendingMovies,
  })
}

export function useTrendingTv() {
  return useQuery({
    queryKey: ['titles', 'trending', 'tv'],
    queryFn: titlesApi.trendingTv,
  })
}