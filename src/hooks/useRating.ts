import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { titlesApi } from '@/services/titles'
import type { RatePayload, UpdateRatingPayload } from '@/types/Rating'

export function useUserTitleDetail(userTitleId: string | undefined) {
  return useQuery({
    queryKey: ['titles', 'detail', userTitleId],
    queryFn: () => titlesApi.getUserTitle(userTitleId!),
    enabled: !!userTitleId,
  })
}

export function useRateTitle() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: RatePayload) => titlesApi.rate(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['titles'] })
    },
  })
}

export function useUpdateRating(userTitleId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: UpdateRatingPayload) => titlesApi.updateRating(userTitleId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['titles'] })
    },
  })
}

export function useDeleteRating(userTitleId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => titlesApi.deleteRating(userTitleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['titles'] })
    },
  })
}