import { useQuery } from '@tanstack/react-query'
import { titlesApi, type MyTitlesParams } from '@/services/titles'

export function useMyTitles(params: MyTitlesParams) {
  return useQuery({
    queryKey: ['titles', 'mine', params],
    queryFn: () => titlesApi.myTitles(params),
    placeholderData: (prev) => prev, 
  })
}

export function useSearchTitles(query: string) {
  return useQuery({
    queryKey: ['titles', 'search', query],
    queryFn: () => titlesApi.search(query),
    enabled: query.trim().length >= 2, 
  })
}