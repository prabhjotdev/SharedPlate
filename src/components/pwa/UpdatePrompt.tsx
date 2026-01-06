import { usePWA } from '../../hooks/usePWA';

export default function UpdatePrompt() {
  const { needsUpdate, applyUpdate } = usePWA();

  if (!needsUpdate) return null;

  return (
    <div
      className="fixed top-0 inset-x-0 z-50 bg-primary-600"
      style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))' }}
    >
      <div className="px-4 pb-3 pt-1">
        <div className="max-w-md mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <svg
              className="w-5 h-5 text-white flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            <span className="text-white text-sm font-medium">
              New version available!
            </span>
          </div>
          <button
            onClick={applyUpdate}
            className="px-4 py-1.5 bg-white text-primary-600 text-sm font-semibold rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
          >
            Update
          </button>
        </div>
      </div>
    </div>
  );
}
