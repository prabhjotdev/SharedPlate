import { useState, useEffect } from 'react';
import { usePWA } from '../../hooks/usePWA';

export default function InstallPrompt() {
  const {
    isIOS,
    isInstalled,
    isStandalone,
    canPromptInstall,
    promptInstall,
    dismissInstallPrompt,
  } = usePWA();

  const [showPrompt, setShowPrompt] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  useEffect(() => {
    // Don't show if already installed or in standalone mode
    if (isInstalled || isStandalone) return;

    // Show after a delay for better UX
    const timer = setTimeout(() => {
      if (canPromptInstall || isIOS) {
        setShowPrompt(true);
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [canPromptInstall, isIOS, isInstalled, isStandalone]);

  const handleInstall = async () => {
    if (isIOS) {
      setShowIOSInstructions(true);
    } else {
      const installed = await promptInstall();
      if (installed) {
        setShowPrompt(false);
      }
    }
  };

  const handleDismiss = () => {
    dismissInstallPrompt();
    setShowPrompt(false);
    setShowIOSInstructions(false);
  };

  if (!showPrompt || isStandalone) return null;

  return (
    <>
      {/* Main Install Prompt */}
      {!showIOSInstructions && (
        <div className="fixed inset-x-0 bottom-20 z-50 px-4 animate-slideInRight">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 max-w-sm mx-auto">
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center">
                <svg
                  className="w-7 h-7 text-primary-600 dark:text-primary-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Install SharedPlate
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mt-0.5">
                  Add to your home screen for quick access
                </p>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={handleDismiss}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Not Now
              </button>
              <button
                onClick={handleInstall}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-primary-600 rounded-xl hover:bg-primary-700 transition-colors"
              >
                Install
              </button>
            </div>
          </div>
        </div>
      )}

      {/* iOS Instructions Modal */}
      {showIOSInstructions && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={handleDismiss}
          />
          <div className="relative bg-white dark:bg-gray-800 w-full max-w-md rounded-t-2xl p-6 pb-safe animate-modalSlideUp">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-primary-600 dark:text-primary-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Install SharedPlate
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Follow these steps to add to your home screen:
              </p>
            </div>

            <ol className="space-y-4 mb-6">
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-8 h-8 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center text-primary-600 dark:text-primary-400 font-semibold text-sm">
                  1
                </span>
                <div className="flex-1">
                  <p className="text-gray-900 dark:text-white font-medium">
                    Tap the Share button
                  </p>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    Located at the bottom of your screen (Safari)
                  </p>
                  <div className="mt-2 flex justify-center">
                    <svg
                      className="w-8 h-8 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                      />
                    </svg>
                  </div>
                </div>
              </li>

              <li className="flex gap-3">
                <span className="flex-shrink-0 w-8 h-8 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center text-primary-600 dark:text-primary-400 font-semibold text-sm">
                  2
                </span>
                <div className="flex-1">
                  <p className="text-gray-900 dark:text-white font-medium">
                    Scroll and tap "Add to Home Screen"
                  </p>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    You may need to scroll down in the share menu
                  </p>
                </div>
              </li>

              <li className="flex gap-3">
                <span className="flex-shrink-0 w-8 h-8 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center text-primary-600 dark:text-primary-400 font-semibold text-sm">
                  3
                </span>
                <div className="flex-1">
                  <p className="text-gray-900 dark:text-white font-medium">
                    Tap "Add" to confirm
                  </p>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    SharedPlate will appear on your home screen
                  </p>
                </div>
              </li>
            </ol>

            <button
              onClick={handleDismiss}
              className="w-full py-3 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}
