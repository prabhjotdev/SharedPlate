import { useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { auth } from '../services/firebase'
import { useAppSelector, useAppDispatch } from '../store'
import { setTheme } from '../store/settingsSlice'
import { showToast } from '../store/uiSlice'

type Theme = 'light' | 'dark' | 'system'

export default function SettingsPage() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { theme } = useAppSelector((state) => state.settings)
  const { user } = useAppSelector((state) => state.auth)

  const handleThemeChange = (newTheme: Theme) => {
    dispatch(setTheme(newTheme))
  }

  const handleLogout = async () => {
    try {
      await signOut(auth)
      dispatch(showToast({ message: 'Logged out successfully', type: 'success' }))
      navigate('/login')
    } catch (error) {
      dispatch(showToast({ message: 'Failed to log out', type: 'error' }))
    }
  }

  const themeOptions: { value: Theme; label: string; icon: string }[] = [
    { value: 'light', label: 'Light', icon: '☀️' },
    { value: 'dark', label: 'Dark', icon: '🌙' },
    { value: 'system', label: 'System', icon: '💻' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2">
            <svg className="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Settings</h1>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* User Info */}
        <section className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
            Account
          </h2>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
              <span className="text-orange-600 dark:text-orange-300 font-semibold text-lg">
                {user?.email?.charAt(0).toUpperCase() || '?'}
              </span>
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                {user?.displayName || 'User'}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
            </div>
          </div>
        </section>

        {/* Theme Selection */}
        <section className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
            Appearance
          </h2>
          <div className="space-y-2">
            {themeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleThemeChange(option.value)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                  theme === option.value
                    ? 'bg-orange-50 dark:bg-orange-900/30 border-2 border-orange-500'
                    : 'bg-gray-50 dark:bg-gray-700 border-2 border-transparent hover:bg-gray-100 dark:hover:bg-gray-600'
                }`}
              >
                <span className="text-xl">{option.icon}</span>
                <span className={`font-medium ${
                  theme === option.value
                    ? 'text-orange-600 dark:text-orange-400'
                    : 'text-gray-700 dark:text-gray-200'
                }`}>
                  {option.label}
                </span>
                {theme === option.value && (
                  <svg className="w-5 h-5 text-orange-500 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </section>

        {/* App Info */}
        <section className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
            About
          </h2>
          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
            <div className="flex justify-between">
              <span>Version</span>
              <span className="text-gray-900 dark:text-white">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span>App</span>
              <span className="text-gray-900 dark:text-white">SharedPlate</span>
            </div>
          </div>
        </section>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 py-4 rounded-xl font-semibold hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
        >
          Log Out
        </button>
      </div>
    </div>
  )
}
