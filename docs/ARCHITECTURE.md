# SharedPlate - MVP Architecture Design

A private collaborative recipe web app for two siblings to store, share, and browse recipes.

---

## Table of Contents

1. [High-Level Architecture](#high-level-architecture)
2. [Technology Stack](#technology-stack)
3. [Data Models](#data-models)
4. [Screen Flow & Pages](#screen-flow--pages)
5. [Firebase Data Interactions](#firebase-data-interactions)
6. [Redux State Structure](#redux-state-structure)
7. [Component Hierarchy](#component-hierarchy)
8. [Authentication Flow](#authentication-flow)
9. [Explicitly Excluded Features](#explicitly-excluded-features)

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT (React)                          │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │   Pages      │  │  Components  │  │   Redux Store        │  │
│  │              │  │              │  │                      │  │
│  │ - Login      │  │ - RecipeCard │  │ - auth (user state)  │  │
│  │ - MyRecipes  │  │ - RecipeForm │  │ - recipes (shared)   │  │
│  │ - Library    │  │ - NavBar     │  │ - library (prebuilt) │  │
│  │ - RecipeView │  │ - SearchBar  │  │ - ui (loading, etc)  │  │
│  │ - AddRecipe  │  │ - CategoryTabs│ │                      │  │
│  │ - EditRecipe │  │              │  │                      │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      FIREBASE SERVICES                          │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐  │
│  │  Authentication  │  │    Firestore     │  │   Hosting    │  │
│  │                  │  │                  │  │              │  │
│  │ - Email/Password │  │ - sharedRecipes  │  │ - Static     │  │
│  │ - Google OAuth   │  │ - libraryRecipes │  │   React App  │  │
│  │ - Invite-only    │  │ - allowedUsers   │  │              │  │
│  └──────────────────┘  └──────────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

| Layer          | Technology                    | Purpose                           |
|----------------|-------------------------------|-----------------------------------|
| Frontend       | React 18                      | UI framework                      |
| Routing        | React Router v6               | Client-side navigation            |
| State          | Redux Toolkit                 | Global state management           |
| Styling        | Tailwind CSS                  | Utility-first CSS                 |
| Backend        | Firebase                      | BaaS (Backend as a Service)       |
| Database       | Cloud Firestore               | NoSQL document database           |
| Auth           | Firebase Authentication       | Email/password + OAuth            |
| Hosting        | Firebase Hosting              | Static site hosting               |

---

## Data Models

### Firestore Collections

#### 1. `sharedRecipes` (User-created shared recipes)

```typescript
interface SharedRecipe {
  id: string;                    // Auto-generated document ID
  title: string;                 // Recipe title
  ingredients: string;           // Free-text ingredients
  steps: string;                 // Free-text cooking steps
  notes?: string;                // Optional notes
  createdBy: string;             // User UID who created it
  createdAt: Timestamp;          // When created
  updatedAt: Timestamp;          // Last modified
  copiedFromLibrary?: string;    // Library recipe ID if copied
}
```

#### 2. `libraryRecipes` (Pre-built curated recipes)

```typescript
interface LibraryRecipe {
  id: string;                    // Auto-generated document ID
  title: string;                 // Recipe title
  ingredients: string;           // Free-text ingredients
  steps: string;                 // Free-text cooking steps
  category: Category;            // Recipe category
  imageUrl?: string;             // Optional placeholder image
}

type Category =
  | 'breakfast'
  | 'lunch'
  | 'dinner'
  | 'snacks'
  | 'desserts'
  | 'vegetarian'
  | 'quick-meals';
```

#### 3. `allowedUsers` (Invite-only access control)

```typescript
interface AllowedUser {
  email: string;                 // Allowed email address
  addedAt: Timestamp;            // When added to allowlist
}
```

### Example Documents

```javascript
// sharedRecipes/abc123
{
  id: "abc123",
  title: "Mom's Chocolate Chip Cookies",
  ingredients: "2 cups flour\n1 cup butter\n1 cup sugar\n2 eggs\n1 cup chocolate chips",
  steps: "1. Preheat oven to 350°F\n2. Mix dry ingredients\n3. Cream butter and sugar\n4. Combine and fold in chips\n5. Bake 12 minutes",
  notes: "Don't overbake! Take out when edges are golden.",
  createdBy: "user123uid",
  createdAt: Timestamp,
  updatedAt: Timestamp,
  copiedFromLibrary: null
}

// libraryRecipes/lib456
{
  id: "lib456",
  title: "Classic Pancakes",
  ingredients: "1 cup flour\n1 egg\n1 cup milk\n2 tbsp butter\n1 tbsp sugar",
  steps: "1. Mix dry ingredients\n2. Add wet ingredients\n3. Cook on griddle until bubbles form\n4. Flip and cook 1 more minute",
  category: "breakfast"
}

// allowedUsers/email@example.com
{
  email: "sibling1@email.com",
  addedAt: Timestamp
}
```

---

## Screen Flow & Pages

### Page List

| Route                  | Page Component    | Purpose                              |
|------------------------|-------------------|--------------------------------------|
| `/login`               | LoginPage         | Authentication entry point           |
| `/`                    | MyRecipesPage     | Shared recipe list (home)            |
| `/library`             | LibraryPage       | Browse pre-built recipes             |
| `/recipe/:id`          | RecipeViewPage    | View single recipe (cook mode)       |
| `/recipe/:id/edit`     | EditRecipePage    | Edit existing recipe                 |
| `/new`                 | AddRecipePage     | Create new recipe                    |
| `/library/:id`         | LibraryViewPage   | View library recipe before adding    |

### Screen Flow Diagram

```
                    ┌─────────────┐
                    │   Login     │
                    │   Page      │
                    └──────┬──────┘
                           │ (authenticated)
                           ▼
    ┌──────────────────────────────────────────┐
    │              Bottom Nav Bar              │
    │  [My Recipes]              [Library]     │
    └──────────────────────────────────────────┘
           │                          │
           ▼                          ▼
    ┌─────────────┐            ┌─────────────┐
    │ My Recipes  │            │   Library   │
    │   (Home)    │            │   Browse    │
    │             │            │             │
    │ - List view │            │ - Categories│
    │ - Search    │            │ - Grid view │
    │ - + button  │            │             │
    └──────┬──────┘            └──────┬──────┘
           │                          │
           ▼                          ▼
    ┌─────────────┐            ┌─────────────┐
    │ Recipe View │            │Library View │
    │ (Cook Mode) │            │             │
    │             │            │ [Add to     │
    │ - Clean UI  │            │  My List]   │
    │ - Edit btn  │            │             │
    └──────┬──────┘            └─────────────┘
           │
     ┌─────┴─────┐
     ▼           ▼
┌─────────┐ ┌─────────┐
│  Edit   │ │   Add   │
│ Recipe  │ │  New    │
│  Form   │ │ Recipe  │
└─────────┘ └─────────┘
```

### Page Descriptions

#### 1. Login Page (`/login`)
- Email/password form
- "Sign in with Google" button
- Clean, minimal design
- Redirect to home after auth

#### 2. My Recipes Page (`/`) - HOME
- Header with app name
- Search bar (filter by title)
- List of recipe cards (title only, tap to view)
- Floating "+" button to add new recipe
- Empty state: "No recipes yet. Create one or browse the library!"
- Bottom navigation

#### 3. Library Page (`/library`)
- Category tabs/pills (horizontal scroll): All, Breakfast, Dinner, etc.
- Grid of recipe cards
- Tap card to view details
- Bottom navigation

#### 4. Recipe View Page (`/recipe/:id`)
- **Cook Mode**: Distraction-free, large text
- Title (large)
- Ingredients section
- Steps section
- Notes section (if exists)
- Edit button (top right)
- Delete button (with confirmation)
- Back button

#### 5. Library View Page (`/library/:id`)
- Same as Recipe View but:
- No edit/delete buttons
- "Add to My Recipes" button at bottom
- Shows success toast when added

#### 6. Add Recipe Page (`/new`)
- Form with:
  - Title (required)
  - Ingredients (textarea)
  - Steps (textarea)
  - Notes (textarea, optional)
- Save button
- Cancel button

#### 7. Edit Recipe Page (`/recipe/:id/edit`)
- Same form as Add Recipe
- Pre-populated with existing data
- Save Changes button
- Cancel button

---

## Firebase Data Interactions

### Authentication

```typescript
// Auth service functions

// Sign in with email/password
signInWithEmailAndPassword(auth, email, password)

// Sign in with Google
signInWithPopup(auth, googleProvider)

// Sign out
signOut(auth)

// Auth state listener
onAuthStateChanged(auth, (user) => {
  if (user) {
    // Check if user is in allowedUsers
    // Dispatch to Redux
  }
})
```

### Firestore Operations

```typescript
// === SHARED RECIPES ===

// Fetch all shared recipes (real-time)
const unsubscribe = onSnapshot(
  collection(db, 'sharedRecipes'),
  (snapshot) => {
    const recipes = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    dispatch(setRecipes(recipes));
  }
);

// Create new recipe
await addDoc(collection(db, 'sharedRecipes'), {
  title,
  ingredients,
  steps,
  notes,
  createdBy: user.uid,
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp(),
  copiedFromLibrary: null
});

// Update recipe
await updateDoc(doc(db, 'sharedRecipes', recipeId), {
  title,
  ingredients,
  steps,
  notes,
  updatedAt: serverTimestamp()
});

// Delete recipe
await deleteDoc(doc(db, 'sharedRecipes', recipeId));

// === LIBRARY RECIPES ===

// Fetch all library recipes (one-time, can cache)
const snapshot = await getDocs(collection(db, 'libraryRecipes'));
const libraryRecipes = snapshot.docs.map(doc => ({
  id: doc.id,
  ...doc.data()
}));

// Copy library recipe to shared
await addDoc(collection(db, 'sharedRecipes'), {
  title: libraryRecipe.title,
  ingredients: libraryRecipe.ingredients,
  steps: libraryRecipe.steps,
  notes: '',
  createdBy: user.uid,
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp(),
  copiedFromLibrary: libraryRecipe.id
});

// === ACCESS CONTROL ===

// Check if user is allowed
const allowedRef = doc(db, 'allowedUsers', user.email);
const allowedSnap = await getDoc(allowedRef);
if (!allowedSnap.exists()) {
  signOut(auth);
  throw new Error('Access denied');
}
```

### Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper: Check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }

    // Helper: Check if user email is in allowed list
    function isAllowedUser() {
      return isAuthenticated() &&
        exists(/databases/$(database)/documents/allowedUsers/$(request.auth.token.email));
    }

    // Shared recipes - only allowed users can CRUD
    match /sharedRecipes/{recipeId} {
      allow read, write: if isAllowedUser();
    }

    // Library recipes - read-only for allowed users
    match /libraryRecipes/{recipeId} {
      allow read: if isAllowedUser();
      allow write: if false; // Admin only via console
    }

    // Allowed users - no client access
    match /allowedUsers/{email} {
      allow read: if isAuthenticated() &&
        request.auth.token.email == email;
      allow write: if false; // Admin only
    }
  }
}
```

---

## Redux State Structure

```typescript
interface RootState {
  auth: AuthState;
  recipes: RecipesState;
  library: LibraryState;
  ui: UIState;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isAllowed: boolean;        // Passed allowedUsers check
  loading: boolean;
  error: string | null;
}

interface User {
  uid: string;
  email: string;
  displayName: string | null;
}

interface RecipesState {
  items: SharedRecipe[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
}

interface LibraryState {
  items: LibraryRecipe[];
  loading: boolean;
  error: string | null;
  selectedCategory: Category | 'all';
}

interface UIState {
  toastMessage: string | null;
  toastType: 'success' | 'error' | null;
}
```

### Redux Slices

```typescript
// authSlice.ts
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action) => { ... },
    setLoading: (state, action) => { ... },
    setError: (state, action) => { ... },
    logout: (state) => { ... }
  }
});

// recipesSlice.ts
const recipesSlice = createSlice({
  name: 'recipes',
  initialState,
  reducers: {
    setRecipes: (state, action) => { ... },
    setLoading: (state, action) => { ... },
    setSearchQuery: (state, action) => { ... }
  }
});

// librarySlice.ts
const librarySlice = createSlice({
  name: 'library',
  initialState,
  reducers: {
    setLibraryRecipes: (state, action) => { ... },
    setSelectedCategory: (state, action) => { ... }
  }
});

// uiSlice.ts
const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    showToast: (state, action) => { ... },
    hideToast: (state) => { ... }
  }
});
```

---

## Component Hierarchy

```
App
├── AuthProvider (Firebase auth listener)
├── Routes
│   ├── PublicRoute
│   │   └── LoginPage
│   │       ├── LoginForm
│   │       └── GoogleSignInButton
│   │
│   └── ProtectedRoute (requires auth + allowed)
│       ├── Layout
│       │   ├── Header
│       │   └── BottomNav
│       │
│       ├── MyRecipesPage
│       │   ├── SearchBar
│       │   ├── RecipeList
│       │   │   └── RecipeCard (multiple)
│       │   ├── EmptyState
│       │   └── FloatingAddButton
│       │
│       ├── LibraryPage
│       │   ├── CategoryTabs
│       │   └── RecipeGrid
│       │       └── LibraryCard (multiple)
│       │
│       ├── RecipeViewPage
│       │   ├── RecipeHeader
│       │   ├── IngredientsSection
│       │   ├── StepsSection
│       │   ├── NotesSection
│       │   └── ActionButtons (Edit, Delete)
│       │
│       ├── LibraryViewPage
│       │   ├── RecipeHeader
│       │   ├── IngredientsSection
│       │   ├── StepsSection
│       │   └── AddToMyRecipesButton
│       │
│       ├── AddRecipePage
│       │   └── RecipeForm
│       │
│       └── EditRecipePage
│           └── RecipeForm
│
└── Toast (global notification)
```

---

## Authentication Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    User visits app                          │
└─────────────────────────────┬───────────────────────────────┘
                              │
                              ▼
              ┌───────────────────────────────┐
              │  Check Firebase Auth State    │
              └───────────────┬───────────────┘
                              │
            ┌─────────────────┴─────────────────┐
            │                                   │
            ▼                                   ▼
   ┌─────────────────┐                ┌─────────────────┐
   │  Not Logged In  │                │   Logged In     │
   └────────┬────────┘                └────────┬────────┘
            │                                   │
            ▼                                   ▼
   ┌─────────────────┐                ┌─────────────────┐
   │ Show Login Page │                │ Check if email  │
   │                 │                │ in allowedUsers │
   │ - Email/Pass    │                └────────┬────────┘
   │ - Google OAuth  │                         │
   └────────┬────────┘           ┌─────────────┴─────────────┐
            │                    │                           │
            ▼                    ▼                           ▼
   ┌─────────────────┐  ┌─────────────────┐      ┌─────────────────┐
   │ Firebase Auth   │  │    ALLOWED      │      │   NOT ALLOWED   │
   │   (on success)  │  │                 │      │                 │
   └────────┬────────┘  │ → Show App      │      │ → Sign Out      │
            │           │ → Load Recipes  │      │ → Show Error    │
            │           └─────────────────┘      │ → Back to Login │
            │                                    └─────────────────┘
            ▼
   ┌─────────────────┐
   │ Check allowed   │
   │ (loop back up)  │
   └─────────────────┘
```

---

## Explicitly Excluded Features

The following features are **intentionally NOT included** in MVP v1:

| Feature                  | Reason for Exclusion                              |
|--------------------------|---------------------------------------------------|
| **Ratings & Reviews**    | Only 2 users, verbal feedback suffices            |
| **Comments on Recipes**  | Can use Notes field; no discussion needed         |
| **Grocery Lists**        | Out of scope; use separate apps                   |
| **Nutrition Tracking**   | Adds complexity; not core to sharing recipes      |
| **Meal Planning**        | Future feature; MVP is storage-focused            |
| **Public Sharing**       | Private app for 2 users only                      |
| **Social Features**      | No follows, likes, or social feed                 |
| **AI Features**          | No recipe generation, suggestions, or parsing     |
| **Image Upload**         | Simplifies storage; text-only for MVP             |
| **Recipe Scaling**       | Nice-to-have; users can math                      |
| **Cooking Timers**       | Use phone's timer                                 |
| **Offline Mode**         | Firebase handles some caching; full offline later |
| **Recipe Import/Export** | Manual entry only for MVP                         |
| **Multiple Collections** | Single shared list is sufficient                  |
| **Recipe Versioning**    | Simple edit overwrites; no history                |
| **User Profiles**        | Only 2 known users; no profiles needed            |
| **Email Notifications**  | App is simple enough without them                 |
| **Recipe Tags**          | Categories in library only; shared list is flat   |

---

## File Structure (Suggested)

```
src/
├── components/
│   ├── common/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── TextArea.tsx
│   │   ├── Toast.tsx
│   │   └── LoadingSpinner.tsx
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── BottomNav.tsx
│   │   └── Layout.tsx
│   ├── recipes/
│   │   ├── RecipeCard.tsx
│   │   ├── RecipeList.tsx
│   │   ├── RecipeForm.tsx
│   │   ├── IngredientsSection.tsx
│   │   ├── StepsSection.tsx
│   │   └── SearchBar.tsx
│   └── library/
│       ├── LibraryCard.tsx
│       ├── RecipeGrid.tsx
│       └── CategoryTabs.tsx
├── pages/
│   ├── LoginPage.tsx
│   ├── MyRecipesPage.tsx
│   ├── LibraryPage.tsx
│   ├── RecipeViewPage.tsx
│   ├── LibraryViewPage.tsx
│   ├── AddRecipePage.tsx
│   └── EditRecipePage.tsx
├── store/
│   ├── index.ts
│   ├── authSlice.ts
│   ├── recipesSlice.ts
│   ├── librarySlice.ts
│   └── uiSlice.ts
├── services/
│   ├── firebase.ts          # Firebase config
│   ├── auth.ts              # Auth functions
│   └── recipes.ts           # Firestore operations
├── hooks/
│   ├── useAuth.ts
│   ├── useRecipes.ts
│   └── useLibrary.ts
├── types/
│   └── index.ts             # TypeScript interfaces
├── utils/
│   └── helpers.ts
├── data/
│   └── libraryRecipes.json  # Seed data for library
├── App.tsx
├── index.tsx
└── index.css                # Tailwind imports
```

---

## Seed Data Example (Library Recipes)

The library should be seeded with 30-80 recipes. Here's a sample structure:

```json
[
  {
    "title": "Classic Pancakes",
    "category": "breakfast",
    "ingredients": "1 cup all-purpose flour\n2 tbsp sugar\n1 tsp baking powder\n1/2 tsp salt\n1 cup milk\n1 egg\n2 tbsp melted butter",
    "steps": "1. Whisk dry ingredients in a bowl\n2. Make a well, add milk, egg, and butter\n3. Stir until just combined (lumps are okay)\n4. Heat griddle to 350°F\n5. Pour 1/4 cup batter per pancake\n6. Flip when bubbles form\n7. Cook until golden"
  },
  {
    "title": "Avocado Toast",
    "category": "breakfast",
    "ingredients": "2 slices bread\n1 ripe avocado\nSalt and pepper\nRed pepper flakes\n1 tbsp olive oil",
    "steps": "1. Toast bread until golden\n2. Mash avocado with fork\n3. Spread on toast\n4. Drizzle with olive oil\n5. Season with salt, pepper, and red pepper flakes"
  },
  {
    "title": "Quick Stir Fry",
    "category": "dinner",
    "ingredients": "...",
    "steps": "..."
  }
]
```

---

## Next Steps for Implementation

1. **Setup**: Initialize React app with Vite, install dependencies
2. **Firebase**: Create project, configure auth + Firestore
3. **Seed Data**: Populate libraryRecipes collection
4. **Auth Flow**: Implement login + access control
5. **Core Pages**: Build My Recipes + Library pages
6. **CRUD**: Implement create/edit/delete recipes
7. **Polish**: Add loading states, toasts, empty states
8. **Deploy**: Firebase Hosting

---

*Document Version: 1.0*
*Last Updated: December 2024*
