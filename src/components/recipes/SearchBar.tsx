import { useAppDispatch, useAppSelector } from '../../store'
import { setSearchQuery } from '../../store/recipesSlice'

export default function SearchBar() {
  const dispatch = useAppDispatch()
  const { searchQuery } = useAppSelector((state) => state.recipes)

  return (
    <div className="relative">
      <svg
        className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
      <input
        type="text"
        placeholder="Search recipes..."
        value={searchQuery}
        onChange={(e) => dispatch(setSearchQuery(e.target.value))}
        className="w-full pl-10 pr-4 py-3.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all placeholder-gray-400 text-base"
      />
    </div>
  )
}
