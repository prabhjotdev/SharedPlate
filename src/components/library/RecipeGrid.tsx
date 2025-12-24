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

export default function RecipeGrid({ recipes }: RecipeGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3 p-4">
      {recipes.map((recipe) => (
        <Link
          key={recipe.id}
          to={`/library/${recipe.id}`}
          className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow"
        >
          <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">{recipe.title}</h3>
          <span className="text-xs text-gray-500">
            {categoryLabels[recipe.category] || recipe.category}
          </span>
        </Link>
      ))}
    </div>
  )
}
