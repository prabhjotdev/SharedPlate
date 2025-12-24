import { Link } from 'react-router-dom'
import type { SharedRecipe } from '../../types'

interface RecipeListProps {
  recipes: SharedRecipe[]
}

export default function RecipeList({ recipes }: RecipeListProps) {
  return (
    <div className="space-y-3">
      {recipes.map((recipe) => (
        <Link
          key={recipe.id}
          to={`/recipe/${recipe.id}`}
          className="block bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow"
        >
          <h3 className="font-medium text-gray-900 dark:text-white">{recipe.title}</h3>
        </Link>
      ))}
    </div>
  )
}
