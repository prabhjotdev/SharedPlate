import { Link } from 'react-router-dom'
import { useAppSelector } from '../../store'

export default function AppHeader() {
  const { user } = useAppSelector((state) => state.auth)
  const { household } = useAppSelector((state) => state.household)

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between px-4 h-14">
        {/* App Name / Household */}
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            SharedPlate
          </h1>
          {household && (
            <span className="text-sm text-gray-500 dark:text-gray-400 hidden sm:inline">
              • {household.name}
            </span>
          )}
        </div>

        {/* Profile / Settings Button */}
        <Link
          to="/settings"
          className="flex items-center gap-2 p-2 -mr-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors min-w-[44px] min-h-[44px] justify-center"
          aria-label="Settings"
        >
          <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
            <span className="text-primary-600 dark:text-primary-300 font-semibold text-sm">
              {user?.email?.charAt(0).toUpperCase() || '?'}
            </span>
          </div>
        </Link>
      </div>
    </header>
  )
}
