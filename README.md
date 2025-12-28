# SharedPlate

A private collaborative recipe web app designed for two siblings to store, share, and cook together.

## Overview

SharedPlate is a simple, mobile-first recipe application that allows two users to:
- Store and manage personal recipes in a shared collection
- Browse a curated library of pre-built recipes
- View recipes in a clean, distraction-free "cook mode"

## Documentation

- **[Architecture Design](./docs/ARCHITECTURE.md)** - High-level architecture, data models, API interactions, and Redux state structure
- **[Wireframes](./docs/WIREFRAMES.md)** - ASCII wireframes and Tailwind styling notes

## Tech Stack

| Layer          | Technology         |
|----------------|--------------------|
| Frontend       | React 18 + Vite    |
| Routing        | React Router v6    |
| State          | Redux Toolkit      |
| Styling        | Tailwind CSS       |
| Backend        | Firebase           |
| Database       | Cloud Firestore    |
| Auth           | Firebase Auth      |
| Hosting        | Firebase Hosting   |

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Features

### Core Features
- **Authentication**: Email/password + Google OAuth (invite-only via allowlist)
- **Household System**: Create/join households with invite codes
- **Shared Recipes**: Create, view, edit, delete recipes in a shared collection
- **Recipe Library**: Browse curated recipes by category
- **Cook Mode**: Clean, distraction-free recipe viewing with step-by-step navigation

### Recipe Management
- **Recipe Details**: Title, ingredients, steps, notes, servings, prep/cook time, difficulty
- **Favorites**: Mark recipes as favorites for quick access
- **Recipe Author**: See who created each recipe
- **Copy from Library**: Add library recipes to your collection
- **Serving Scaler**: Adjust ingredient quantities based on serving size

### Filtering & Categories
- **Custom Categories**: Create custom categories (e.g., "Baking", "Grilling", "Instant Pot")
- **Category Filtering**: Filter recipes by category on Library and My Recipes pages
- **Search**: Search recipes by title
- **Advanced Filters**: Filter by difficulty, cooking time
- **Sort Options**: Sort by name, time, newest/oldest

### Dietary Filters
- **Custom Dietary Filters**: Create filters with blocked ingredients to avoid
- **Real-time Checking**: See warnings when creating recipes with blocked ingredients
- **Recipe Flagging**: Recipes containing blocked ingredients are flagged with warnings
- **Hide Blocked Recipes**: Option to hide recipes with restricted ingredients

### Shopping List
- **Add Items**: Add items with quantity, category, and notes
- **Custom Categories**: Create custom shopping categories
- **Check Off Items**: Mark items as purchased
- **Favorite Items**: Quick-add frequently purchased items
- **Category Organization**: Items grouped by category

### UI/UX
- **Mobile-First Design**: Optimized for mobile devices
- **Dark Mode**: Full dark mode support
- **Pull to Refresh**: Refresh content with pull gesture
- **Toast Notifications**: Feedback for user actions
- **Bottom Navigation**: Easy access to main sections

## Intentionally Excluded

- Ratings & reviews
- Comments on recipes
- Nutrition tracking
- Meal planning
- Public sharing
- Social features
- AI features
- Image uploads
- Offline mode

## License

MIT License - See [LICENSE](./LICENSE) for details.
