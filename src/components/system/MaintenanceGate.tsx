import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { useAppStatusStore } from '@/store/useAppStatusStore'
import { axiosInstance } from '@/services/axios'
import { Maintenance } from '@/pages/Maintenance'

const HEALTH_CHECK_PATH = '/health'
const HEALTH_TIMEOUT_MS = 6000

const BASE_DELAY_MS = 5000
const MAX_DELAY_MS = 60000

function delayForAttempt(attempt: number) {
  const raw = Math.min(BASE_DELAY_MS * 1.6 ** attempt, MAX_DELAY_MS)
  const jitter = raw * 0.15 * (Math.random() * 2 - 1)
  return Math.round(raw + jitter)
}

interface MaintenanceGateProps {
  children: ReactNode
}

export function MaintenanceGate({ children }: MaintenanceGateProps) {
  const isOffline = useAppStatusStore((s) => s.isOffline)
  const isServerDown = useAppStatusStore((s) => s.isServerDown)
  const isDown = isOffline || isServerDown

  const [isRetrying, setIsRetrying] = useState(false)
  const [secondsUntilNextCheck, setSecondsUntilNextCheck] = useState<number | null>(null)
  const [lastCheckedAt, setLastCheckedAt] = useState<Date | null>(null)

  const attemptRef = useRef(0)
  const nextCheckAtRef = useRef(Date.now() + BASE_DELAY_MS)
  const inFlightRef = useRef<AbortController | null>(null)

  const runCheck = useCallback(async (): Promise<boolean> => {
    inFlightRef.current?.abort()
    const controller = new AbortController()
    inFlightRef.current = controller

    try {
      await axiosInstance.get(HEALTH_CHECK_PATH, {
        signal: controller.signal,
        timeout: HEALTH_TIMEOUT_MS,
      })
      const { setOffline, setServerDown } = useAppStatusStore.getState()
      setOffline(false)
      setServerDown(false)
      attemptRef.current = 0
      return true
    } catch {
      return false
    } finally {
      setLastCheckedAt(new Date())
      if (inFlightRef.current === controller) inFlightRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!isDown) {
      setSecondsUntilNextCheck(null)
      return
    }

    attemptRef.current = 0
    nextCheckAtRef.current = Date.now() + delayForAttempt(0)
    let cancelled = false

    const tick = async () => {
      if (cancelled) return

      const remaining = nextCheckAtRef.current - Date.now()
      if (remaining > 0) {
        setSecondsUntilNextCheck(Math.ceil(remaining / 1000))
        return
      }

      setSecondsUntilNextCheck(null)
      const recovered = await runCheck()
      if (cancelled || recovered) return

      attemptRef.current += 1
      nextCheckAtRef.current = Date.now() + delayForAttempt(attemptRef.current)
    }

    const id = window.setInterval(tick, 1000)
    return () => {
      cancelled = true
      window.clearInterval(id)
      inFlightRef.current?.abort()
    }
  }, [isDown, runCheck])

  const handleRetry = async () => {
    setIsRetrying(true)
    attemptRef.current = 0
    const recovered = await runCheck()
    if (!recovered) nextCheckAtRef.current = Date.now() + delayForAttempt(0)
    setIsRetrying(false)
  }

  useEffect(() => {
    const handleBrowserOffline = () => useAppStatusStore.getState().setOffline(true)

    const handleBrowserOnline = () => {
      attemptRef.current = 0
      nextCheckAtRef.current = Date.now()
      void runCheck()
    }

    window.addEventListener('offline', handleBrowserOffline)
    window.addEventListener('online', handleBrowserOnline)
    if (!navigator.onLine) handleBrowserOffline()

    return () => {
      window.removeEventListener('offline', handleBrowserOffline)
      window.removeEventListener('online', handleBrowserOnline)
    }
  }, [runCheck])

  if (!isDown) return <>{children}</>

  return (
    <Maintenance
      reason={isOffline ? 'offline' : 'server'}
      onRetry={handleRetry}
      isRetrying={isRetrying}
      secondsUntilNextCheck={secondsUntilNextCheck}
      lastCheckedAt={lastCheckedAt}
    />
  )
}