import { useState, useEffect, useCallback } from 'react'

interface WakeLockState {
  isSupported: boolean
  isActive: boolean
  request: () => Promise<void>
  release: () => Promise<void>
}

export function useWakeLock(): WakeLockState {
  const [wakeLock, setWakeLock] = useState<WakeLockSentinel | null>(null)
  const [isActive, setIsActive] = useState(false)

  const isSupported = 'wakeLock' in navigator

  const request = useCallback(async () => {
    if (!isSupported) return

    try {
      const lock = await navigator.wakeLock.request('screen')
      setWakeLock(lock)
      setIsActive(true)

      lock.addEventListener('release', () => {
        setIsActive(false)
        setWakeLock(null)
      })
    } catch (err) {
      // Wake lock request failed (e.g., low battery, tab not visible)
      console.log('Wake Lock request failed:', err)
    }
  }, [isSupported])

  const release = useCallback(async () => {
    if (wakeLock) {
      await wakeLock.release()
      setWakeLock(null)
      setIsActive(false)
    }
  }, [wakeLock])

  // Re-acquire wake lock when page becomes visible again
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible' && isActive && !wakeLock) {
        await request()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [isActive, wakeLock, request])

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (wakeLock) {
        wakeLock.release()
      }
    }
  }, [wakeLock])

  return { isSupported, isActive, request, release }
}
