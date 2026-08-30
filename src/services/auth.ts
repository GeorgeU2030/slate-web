import { axiosInstance } from "./axios"

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  email: string
  password: string
  fullName: string
}

export interface GoogleLoginPayload {
  code: string
}

export interface AuthTokens {
  accessToken: string
}

export const authApi = {
  login: (payload: LoginPayload) =>
    axiosInstance.post<AuthTokens>('/auth/login', payload).then((r) => r.data),

  register: (payload: RegisterPayload) =>
    axiosInstance.post<AuthTokens>('/auth/register', payload).then((r) => r.data),

  refresh: () =>
    axiosInstance.post<AuthTokens>('/auth/refresh').then((r) => r.data),

  logout: () => axiosInstance.post('/auth/logout'),

  google: (payload: GoogleLoginPayload) =>
    axiosInstance.post<AuthTokens>('/auth/google', payload).then((r) => r.data),
}