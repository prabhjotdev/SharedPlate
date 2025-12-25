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
  expiresAt: Date;
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

export interface RootState {
  auth: AuthState;
  recipes: RecipesState;
  library: LibraryState;
  ui: UIState;
  household: HouseholdState;
}
