import { create } from 'zustand'

interface AppStatusState {
  isOffline: boolean
  isServerDown: boolean
  setOffline: (value: boolean) => void
  setServerDown: (value: boolean) => void
  reset: () => void
}

export const useAppStatusStore = create<AppStatusState>((set) => ({
  isOffline: false,
  isServerDown: false,
  setOffline: (value) => set({ isOffline: value }),
  setServerDown: (value) => set({ isServerDown: value }),
  reset: () => set({ isOffline: false, isServerDown: false }),
}))