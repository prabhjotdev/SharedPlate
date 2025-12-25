import type { Difficulty } from '../../types'

export type TimeFilter = 'all' | 'quick' | 'medium' | 'long'

interface RecipeFiltersProps {
  difficulty: Difficulty | 'all'
  timeFilter: TimeFilter
  onDifficultyChange: (difficulty: Difficulty | 'all') => void
  onTimeFilterChange: (time: TimeFilter) => void
}

const DIFFICULTY_OPTIONS: { value: Difficulty | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
]

const TIME_OPTIONS: { value: TimeFilter; label: string }[] = [
  { value: 'all', label: 'Any time' },
  { value: 'quick', label: '<15 min' },
  { value: 'medium', label: '15-30 min' },
  { value: 'long', label: '>30 min' },
]

export default function RecipeFilters({
  difficulty,
  timeFilter,
  onDifficultyChange,
  onTimeFilterChange,
}: RecipeFiltersProps) {
  return (
    <div className="space-y-3 mb-4">
      {/* Difficulty Filter */}
      <div>
        <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 block">
          Difficulty
        </label>
        <div className="flex flex-wrap gap-2">
          {DIFFICULTY_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => onDifficultyChange(option.value)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                difficulty === option.value
                  ? option.value === 'easy'
                    ? 'bg-green-500 text-white'
                    : option.value === 'medium'
                    ? 'bg-yellow-500 text-white'
                    : option.value === 'hard'
                    ? 'bg-red-500 text-white'
                    : 'bg-orange-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Time Filter */}
      <div>
        <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 block">
          Total Time
        </label>
        <div className="flex flex-wrap gap-2">
          {TIME_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => onTimeFilterChange(option.value)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                timeFilter === option.value
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
