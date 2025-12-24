import type { Category } from '../../types'

interface CategoryTabsProps {
  categories: { value: Category | 'all'; label: string }[]
  selected: Category | 'all'
  onChange: (category: Category | 'all') => void
}

export default function CategoryTabs({ categories, selected, onChange }: CategoryTabsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-4 px-4 scrollbar-hide">
      {categories.map((category) => (
        <button
          key={category.value}
          onClick={() => onChange(category.value)}
          className={`px-4 py-2 rounded-full whitespace-nowrap font-medium text-sm transition-colors ${
            selected === category.value
              ? 'bg-orange-500 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {category.label}
        </button>
      ))}
    </div>
  )
}
