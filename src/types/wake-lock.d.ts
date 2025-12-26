// Type definitions for Screen Wake Lock API
// https://w3c.github.io/screen-wake-lock/

interface WakeLockSentinel extends EventTarget {
  readonly released: boolean
  readonly type: 'screen'
  release(): Promise<void>
  onrelease: ((this: WakeLockSentinel, ev: Event) => void) | null
}

interface WakeLock {
  request(type: 'screen'): Promise<WakeLockSentinel>
}

interface Navigator {
  readonly wakeLock: WakeLock
}
