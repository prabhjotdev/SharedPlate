import { useState, useEffect, useCallback, useRef } from 'react'

interface WakeLockState {
  isSupported: boolean
  isActive: boolean
  request: () => Promise<void>
  release: () => Promise<void>
}

export function useWakeLock(): WakeLockState {
  const wakeLockRef = useRef<WakeLockSentinel | null>(null)
  const [isActive, setIsActive] = useState(false)

  const isSupported = 'wakeLock' in navigator

  const request = useCallback(async () => {
    if (!isSupported || wakeLockRef.current) return

    try {
      const lock = await navigator.wakeLock.request('screen')
      wakeLockRef.current = lock
      setIsActive(true)

      lock.addEventListener('release', () => {
        setIsActive(false)
        wakeLockRef.current = null
      })
    } catch (err) {
      // Wake lock request failed (e.g., low battery, tab not visible)
      console.log('Wake Lock request failed:', err)
    }
  }, [isSupported])

  const release = useCallback(async () => {
    if (wakeLockRef.current) {
      try {
        await wakeLockRef.current.release()
      } catch (err) {
        // Ignore errors on release
      }
      wakeLockRef.current = null
      setIsActive(false)
    }
  }, [])

  // Re-acquire wake lock when page becomes visible again
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible' && isActive && !wakeLockRef.current) {
        try {
          const lock = await navigator.wakeLock.request('screen')
          wakeLockRef.current = lock
          lock.addEventListener('release', () => {
            setIsActive(false)
            wakeLockRef.current = null
          })
        } catch (err) {
          console.log('Wake Lock re-acquire failed:', err)
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [isActive])

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch(() => {})
        wakeLockRef.current = null
      }
    }
  }, [])

  return { isSupported, isActive, request, release }
}
