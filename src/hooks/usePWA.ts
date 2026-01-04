import { useState, useEffect, useCallback } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface PWAState {
  isInstallable: boolean;
  isInstalled: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  isStandalone: boolean;
  needsUpdate: boolean;
}

export function usePWA() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [pwaState, setPwaState] = useState<PWAState>({
    isInstallable: false,
    isInstalled: false,
    isIOS: false,
    isAndroid: false,
    isStandalone: false,
    needsUpdate: false,
  });

  useEffect(() => {
    // Detect platform and installation state
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true;

    // Check if already installed (localStorage flag)
    const isInstalled = localStorage.getItem('pwa-installed') === 'true' || isStandalone;

    setPwaState((prev) => ({
      ...prev,
      isIOS,
      isAndroid,
      isStandalone,
      isInstalled,
    }));

    // Listen for beforeinstallprompt (Android/Desktop Chrome)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
      setPwaState((prev) => ({
        ...prev,
        isInstallable: true,
      }));
    };

    // Listen for app installed
    const handleAppInstalled = () => {
      localStorage.setItem('pwa-installed', 'true');
      setInstallPrompt(null);
      setPwaState((prev) => ({
        ...prev,
        isInstallable: false,
        isInstalled: true,
      }));
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Listen for service worker updates
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setPwaState((prev) => ({
                  ...prev,
                  needsUpdate: true,
                }));
              }
            });
          }
        });
      });
    }
  }, []);

  // Trigger the install prompt
  const promptInstall = useCallback(async () => {
    if (!installPrompt) return false;

    try {
      await installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;

      if (outcome === 'accepted') {
        localStorage.setItem('pwa-installed', 'true');
        setInstallPrompt(null);
        setPwaState((prev) => ({
          ...prev,
          isInstallable: false,
          isInstalled: true,
        }));
        return true;
      }
    } catch (error) {
      console.error('Error prompting install:', error);
    }

    return false;
  }, [installPrompt]);

  // Reload to apply update
  const applyUpdate = useCallback(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.waiting?.postMessage({ type: 'SKIP_WAITING' });
        window.location.reload();
      });
    }
  }, []);

  // Dismiss install prompt (don't show again for a while)
  const dismissInstallPrompt = useCallback(() => {
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
    setInstallPrompt(null);
    setPwaState((prev) => ({
      ...prev,
      isInstallable: false,
    }));
  }, []);

  // Check if install prompt was recently dismissed
  const wasRecentlyDismissed = useCallback(() => {
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (!dismissed) return false;

    const dismissedTime = parseInt(dismissed, 10);
    const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);

    // Show again after 7 days
    return daysSinceDismissed < 7;
  }, []);

  return {
    ...pwaState,
    promptInstall,
    applyUpdate,
    dismissInstallPrompt,
    wasRecentlyDismissed,
    canPromptInstall: pwaState.isInstallable && !wasRecentlyDismissed(),
  };
}
