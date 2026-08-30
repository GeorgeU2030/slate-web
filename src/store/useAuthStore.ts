import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authApi } from '@/services/auth'

interface AuthState {
  accessToken: string | null
  isAuthenticated: boolean
  setAccessToken: (accessToken: string) => void
  clearTokens: () => void
  refreshAccessToken: () => Promise<string>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      isAuthenticated: false,

      setAccessToken: (accessToken) => set({ accessToken, isAuthenticated: true }),

      clearTokens: () => set({ accessToken: null, isAuthenticated: false }),

      refreshAccessToken: async () => {
        try {
          const tokens = await authApi.refresh()
          set({ accessToken: tokens.accessToken, isAuthenticated: true })
          return tokens.accessToken
        } catch (err) {
          get().clearTokens()
          throw err
        }
      },
    }),
    {
      name: 'slate-auth',
      partialize: (state) => ({
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)