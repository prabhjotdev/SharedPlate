interface EmptyStateProps {
  icon: React.ReactNode
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
  secondaryAction?: {
    label: string
    onClick: () => void
  }
}

export default function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 animate-fadeIn">
      {/* Icon Container */}
      <div className="w-24 h-24 bg-primary-50 dark:bg-primary-900/30 rounded-3xl flex items-center justify-center mb-6 animate-bounceIn">
        <div className="text-primary-500 dark:text-primary-400">
          {icon}
        </div>
      </div>

      {/* Text Content */}
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 text-center">
        {title}
      </h2>
      <p className="text-gray-500 dark:text-gray-400 text-center mb-8 max-w-xs leading-relaxed">
        {description}
      </p>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        {action && (
          <button
            onClick={action.onClick}
            className="inline-flex items-center justify-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-700 transition-all active:scale-[0.98] shadow-sm min-h-[48px]"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {action.label}
          </button>
        )}
        {secondaryAction && (
          <button
            onClick={secondaryAction.onClick}
            className="inline-flex items-center justify-center gap-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-all active:scale-[0.98] min-h-[48px]"
          >
            {secondaryAction.label}
          </button>
        )}
      </div>
    </div>
  )
}

// Pre-built empty state variants for common use cases
export function RecipesEmptyState({ onAddClick }: { onAddClick: () => void }) {
  return (
    <EmptyState
      icon={
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      }
      title="No recipes yet"
      description="Start building your family cookbook! Add your first recipe and share it with your household."
      action={{
        label: "Add First Recipe",
        onClick: onAddClick,
      }}
    />
  )
}

export function ShoppingEmptyState({ onAddClick }: { onAddClick: () => void }) {
  return (
    <EmptyState
      icon={
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      }
      title="Your cart is empty"
      description="Time to stock up! Add items to your shopping list and never forget the essentials again."
      action={{
        label: "Add First Item",
        onClick: onAddClick,
      }}
    />
  )
}

export function LibraryEmptyState({ onBrowseClick }: { onBrowseClick?: () => void }) {
  return (
    <EmptyState
      icon={
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      }
      title="Library is empty"
      description="The recipe library is currently empty. Check back later for curated recipes!"
      action={onBrowseClick ? {
        label: "Refresh",
        onClick: onBrowseClick,
      } : undefined}
    />
  )
}

export function SearchEmptyState({ query, onClear }: { query: string; onClear: () => void }) {
  return (
    <EmptyState
      icon={
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      }
      title="No results found"
      description={`We couldn't find anything matching "${query}". Try a different search term.`}
      action={{
        label: "Clear Search",
        onClick: onClear,
      }}
    />
  )
}

export function MealPlannerEmptyState() {
  return (
    <EmptyState
      icon={
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      }
      title="No meals planned"
      description="Start planning your week! Tap the + button on any meal slot to add a recipe."
    />
  )
}

export function FilterEmptyState({ onClear }: { onClear: () => void }) {
  return (
    <EmptyState
      icon={
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
      }
      title="No matches"
      description="No recipes match your current filters. Try adjusting your criteria."
      action={{
        label: "Clear Filters",
        onClick: onClear,
      }}
    />
  )
}
