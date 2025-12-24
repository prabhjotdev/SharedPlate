// Recipe Types

export type Category =
  | 'breakfast'
  | 'lunch'
  | 'dinner'
  | 'snacks'
  | 'desserts'
  | 'vegetarian'
  | 'quick-meals';

export interface SharedRecipe {
  id: string;
  title: string;
  ingredients: string;
  steps: string;
  notes?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  copiedFromLibrary?: string | null;
}

export interface LibraryRecipe {
  id: string;
  title: string;
  ingredients: string;
  steps: string;
  category: Category;
}

// Auth Types

export interface User {
  uid: string;
  email: string;
  displayName: string | null;
}

// Redux State Types

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isAllowed: boolean;
  loading: boolean;
  error: string | null;
}

export interface RecipesState {
  items: SharedRecipe[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
}

export interface LibraryState {
  items: LibraryRecipe[];
  loading: boolean;
  error: string | null;
  selectedCategory: Category | 'all';
}

export interface UIState {
  toastMessage: string | null;
  toastType: 'success' | 'error' | null;
}

export interface RootState {
  auth: AuthState;
  recipes: RecipesState;
  library: LibraryState;
  ui: UIState;
}
