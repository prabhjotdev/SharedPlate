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
          className="block bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
        >
          <h3 className="font-medium text-gray-900">{recipe.title}</h3>
        </Link>
      ))}
    </div>
  )
}
