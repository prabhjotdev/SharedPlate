import { Link } from 'react-router-dom'
import type { LibraryRecipe } from '../../types'

interface RecipeGridProps {
  recipes: LibraryRecipe[]
}

const categoryLabels: Record<string, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snacks: 'Snacks',
  desserts: 'Desserts',
  vegetarian: 'Vegetarian',
  'quick-meals': 'Quick Meals',
}

// Get category icon based on recipe category
const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'breakfast':
      return (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )
    case 'lunch':
      return (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      )
    case 'dinner':
      return (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    case 'desserts':
      return (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.701 2.701 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21v-7a2 2 0 00-2-2H5a2 2 0 00-2 2v7h18zm-3-9v-2a2 2 0 00-2-2H8a2 2 0 00-2 2v2h12z" />
        </svg>
      )
    case 'snacks':
      return (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      )
    case 'vegetarian':
      return (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      )
    case 'quick-meals':
      return (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      )
    default:
      return (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      )
  }
}

// Generate a consistent gradient based on category
const getCategoryGradient = (category: string) => {
  switch (category) {
    case 'breakfast':
      return 'from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30'
    case 'lunch':
      return 'from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30'
    case 'dinner':
      return 'from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30'
    case 'desserts':
      return 'from-pink-100 to-rose-100 dark:from-pink-900/30 dark:to-rose-900/30'
    case 'snacks':
      return 'from-yellow-100 to-lime-100 dark:from-yellow-900/30 dark:to-lime-900/30'
    case 'vegetarian':
      return 'from-teal-100 to-cyan-100 dark:from-teal-900/30 dark:to-cyan-900/30'
    case 'quick-meals':
      return 'from-blue-100 to-sky-100 dark:from-blue-900/30 dark:to-sky-900/30'
    default:
      return 'from-gray-100 to-slate-100 dark:from-gray-900/30 dark:to-slate-900/30'
  }
}

const getCategoryIconColor = (category: string) => {
  switch (category) {
    case 'breakfast':
      return 'text-amber-500 dark:text-amber-400'
    case 'lunch':
      return 'text-green-500 dark:text-green-400'
    case 'dinner':
      return 'text-purple-500 dark:text-purple-400'
    case 'desserts':
      return 'text-pink-500 dark:text-pink-400'
    case 'snacks':
      return 'text-yellow-600 dark:text-yellow-400'
    case 'vegetarian':
      return 'text-teal-500 dark:text-teal-400'
    case 'quick-meals':
      return 'text-blue-500 dark:text-blue-400'
    default:
      return 'text-gray-500 dark:text-gray-400'
  }
}

export default function RecipeGrid({ recipes }: RecipeGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3 p-4">
      {recipes.map((recipe) => (
        <Link
          key={recipe.id}
          to={`/library/${recipe.id}`}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-md transition-all active:scale-[0.98]"
        >
          {/* Image Placeholder */}
          <div className={`h-24 bg-gradient-to-br ${getCategoryGradient(recipe.category)} flex items-center justify-center`}>
            <div className={getCategoryIconColor(recipe.category)}>
              {getCategoryIcon(recipe.category)}
            </div>
          </div>

          {/* Content */}
          <div className="p-3">
            <h3 className="font-semibold text-sm text-gray-900 dark:text-white line-clamp-2 leading-snug min-h-[40px]">
              {recipe.title}
            </h3>
            <span className="inline-block mt-2 text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
              {categoryLabels[recipe.category] || recipe.category}
            </span>
          </div>
        </Link>
      ))}
    </div>
  )
}
