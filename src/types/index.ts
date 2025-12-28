// Recipe Types

export type Category =
  | 'breakfast'
  | 'lunch'
  | 'dinner'
  | 'snacks'
  | 'desserts'
  | 'vegetarian'
  | 'quick-meals';

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface SharedRecipe {
  id: string;
  title: string;
  ingredients: string;
  steps: string;
  notes?: string;
  servings?: number;
  prepTime?: number; // in minutes
  cookTime?: number; // in minutes
  difficulty?: Difficulty;
  category?: string; // Custom category ID or default category name
  isFavorite?: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  copiedFromLibrary?: string | null;
  householdId?: string;
}

// Household Types

export type MemberRole = 'owner' | 'admin' | 'member';
export type MemberPermission = 'full' | 'view-only';

export interface HouseholdMember {
  uid: string;
  email: string;
  displayName: string | null;
  role: MemberRole;
  permission: MemberPermission;
  joinedAt: Date;
}

export interface Household {
  id: string;
  name: string;
  createdBy: string;
  createdAt: Date;
  members: HouseholdMember[];
}

export interface InviteCode {
  id: string;
  code: string;
  householdId: string;
  householdName: string;
  createdBy: string;
  createdAt: Date;
  expiresAt: Date | null; // null means never expires
  used: boolean;
}

export interface LibraryRecipe {
  id: string;
  title: string;
  ingredients: string;
  steps: string;
  category: Category;
  servings?: number;
  prepTime?: number; // in minutes
  cookTime?: number; // in minutes
  difficulty?: Difficulty;
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

export interface HouseholdState {
  household: Household | null;
  inviteCodes: InviteCode[];
  loading: boolean;
  error: string | null;
}

// Shopping List Types

export type DefaultShoppingCategory =
  | 'produce'
  | 'fruits'
  | 'dairy'
  | 'meat'
  | 'bakery'
  | 'frozen'
  | 'pantry'
  | 'beverages'
  | 'snacks'
  | 'household'
  | 'other';

export interface ShoppingItem {
  id: string;
  name: string;
  quantity: string;
  category: string; // Can be default or custom category
  isChecked: boolean;
  isFavorite: boolean;
  note?: string;
  addedBy: string;
  addedByName?: string;
  householdId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CustomCategory {
  id: string;
  name: string;
  householdId: string;
  createdBy: string;
  createdAt: Date;
}

export interface ShoppingListState {
  items: ShoppingItem[];
  customCategories: CustomCategory[];
  loading: boolean;
  error: string | null;
}

// Recipe Categories Types (Custom categories for filtering)

export interface RecipeCategory {
  id: string;
  name: string;
  householdId: string;
  createdBy: string;
  createdAt: Date;
}

// Library Categories Types (Dietary Filter)

export interface DietaryFilter {
  id: string;
  name: string;
  blockedIngredients: string[]; // Ingredients to AVOID
  householdId: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LibraryCategoryState {
  dietaryFilters: DietaryFilter[];
  activeDietaryFilterId: string | null;
  loading: boolean;
  error: string | null;
}

export interface RootState {
  auth: AuthState;
  recipes: RecipesState;
  library: LibraryState;
  ui: UIState;
  household: HouseholdState;
  shopping: ShoppingListState;
  libraryCategories: LibraryCategoryState;
}
