import { NavLink } from 'react-router-dom'

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-3 pb-safe">
      <div className="max-w-lg mx-auto flex justify-around">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 ${isActive ? 'text-orange-500' : 'text-gray-400'}`
          }
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
          <span className="text-xs font-medium">My Recipes</span>
        </NavLink>

        <NavLink
          to="/library"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 ${isActive ? 'text-orange-500' : 'text-gray-400'}`
          }
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
          <span className="text-xs font-medium">Library</span>
        </NavLink>
      </div>
    </nav>
  )
}
