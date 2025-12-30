interface SkeletonProps {
  className?: string
}

// Base skeleton element
export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      className={`skeleton rounded ${className}`}
      aria-hidden="true"
    />
  )
}

// Recipe card skeleton for horizontal layout (MyRecipes)
export function RecipeCardSkeleton() {
  return (
    <div
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden animate-fadeIn"
      aria-label="Loading recipe"
      role="status"
    >
      <div className="flex min-h-[100px]">
        {/* Image placeholder */}
        <div className="w-24 flex-shrink-0 skeleton" />

        {/* Content */}
        <div className="flex-1 p-4 flex flex-col justify-between">
          <div>
            {/* Title */}
            <Skeleton className="h-5 w-3/4 mb-2" />
            {/* Subtitle */}
            <Skeleton className="h-3 w-1/2" />
          </div>
          {/* Meta row */}
          <div className="flex items-center gap-3 mt-2">
            <Skeleton className="h-4 w-16 rounded-full" />
            <Skeleton className="h-4 w-12 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  )
}

// Recipe grid skeleton for vertical cards (Library)
export function RecipeGridSkeleton() {
  return (
    <div
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden animate-fadeIn"
      aria-label="Loading recipe"
      role="status"
    >
      {/* Image placeholder */}
      <div className="h-24 skeleton" />

      {/* Content */}
      <div className="p-3">
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-2/3 mb-3" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
    </div>
  )
}

// Shopping list item skeleton
export function ShoppingItemSkeleton() {
  return (
    <div
      className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 dark:border-gray-700 animate-fadeIn"
      aria-label="Loading item"
      role="status"
    >
      {/* Checkbox */}
      <Skeleton className="w-6 h-6 rounded-full flex-shrink-0" />

      {/* Content */}
      <div className="flex-1">
        <Skeleton className="h-4 w-32 mb-1" />
        <Skeleton className="h-3 w-20" />
      </div>

      {/* Actions */}
      <Skeleton className="w-5 h-5 rounded" />
    </div>
  )
}

// Meal planner day skeleton
export function MealPlannerDaySkeleton() {
  return (
    <div
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden animate-fadeIn"
      aria-label="Loading day"
      role="status"
    >
      <div className="flex items-center gap-3 p-4">
        {/* Day circle */}
        <Skeleton className="w-12 h-12 rounded-full flex-shrink-0" />

        {/* Day info */}
        <div className="flex-1">
          <Skeleton className="h-5 w-24 mb-1" />
          <Skeleton className="h-3 w-32" />
        </div>

        {/* Chevron */}
        <Skeleton className="w-5 h-5" />
      </div>
    </div>
  )
}

// Full page loading skeleton
export function PageLoadingSkeleton({ message = 'Loading...' }: { message?: string }) {
  return (
    <div
      className="flex flex-col items-center justify-center py-16 px-6"
      role="status"
      aria-live="polite"
    >
      <div className="w-10 h-10 border-3 border-primary-200 dark:border-primary-800 border-t-primary-600 dark:border-t-primary-400 rounded-full animate-spin mb-4" />
      <p className="text-sm text-gray-500 dark:text-gray-400">{message}</p>
      <span className="sr-only">{message}</span>
    </div>
  )
}

// Recipe list skeleton (multiple cards)
export function RecipeListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3" role="status" aria-label={`Loading ${count} recipes`}>
      {Array.from({ length: count }).map((_, i) => (
        <RecipeCardSkeleton key={i} />
      ))}
      <span className="sr-only">Loading recipes</span>
    </div>
  )
}

// Recipe grid skeleton (multiple cards)
export function RecipeGridSkeletonList({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 p-4" role="status" aria-label={`Loading ${count} recipes`}>
      {Array.from({ length: count }).map((_, i) => (
        <RecipeGridSkeleton key={i} />
      ))}
      <span className="sr-only">Loading recipes</span>
    </div>
  )
}

// Shopping list skeleton
export function ShoppingListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div
      className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden"
      role="status"
      aria-label={`Loading ${count} items`}
    >
      {Array.from({ length: count }).map((_, i) => (
        <ShoppingItemSkeleton key={i} />
      ))}
      <span className="sr-only">Loading shopping list</span>
    </div>
  )
}

// Meal planner skeleton
export function MealPlannerSkeleton({ count = 7 }: { count?: number }) {
  return (
    <div className="space-y-3 p-4" role="status" aria-label="Loading meal planner">
      {Array.from({ length: count }).map((_, i) => (
        <MealPlannerDaySkeleton key={i} />
      ))}
      <span className="sr-only">Loading meal planner</span>
    </div>
  )
}
