import type { Title, MyTitle, TitleType } from "@/types/Title"
import type { UserTitleDetail, RatePayload, UpdateRatingPayload } from "@/types/Rating"
import { axiosInstance } from "./axios"

export interface MyTitlesParams {
  year?: number
  type?: TitleType
  q?: string
}

export const titlesApi = {
  trendingMovies: () =>
    axiosInstance.get<Title[]>('/titles/trending/movies').then((r) => r.data),

  trendingTv: () =>
    axiosInstance.get<Title[]>('/titles/trending/tv').then((r) => r.data),

  myTitles: (params?: MyTitlesParams) =>
    axiosInstance.get<MyTitle[]>('/titles', { params }).then((r) => r.data),

  search: (query: string) =>
    axiosInstance.get<Title[]>('/titles/search', { params: { q: query } }).then((r) => r.data),

  getUserTitle: (userTitleId: string) =>
    axiosInstance.get<UserTitleDetail>(`/titles/${userTitleId}`).then((r) => r.data),

  rate: (payload: RatePayload) =>
    axiosInstance.post<UserTitleDetail>('/titles', payload).then((r) => r.data),

  updateRating: (userTitleId: string, payload: UpdateRatingPayload) =>
    axiosInstance.patch<UserTitleDetail>(`/titles/${userTitleId}`, payload).then((r) => r.data),

  deleteRating: (userTitleId: string) =>
    axiosInstance.delete(`/titles/${userTitleId}`),
}