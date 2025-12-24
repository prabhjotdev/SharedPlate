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
| Frontend       | React 18           |
| Routing        | React Router v6    |
| State          | Redux Toolkit      |
| Styling        | Tailwind CSS       |
| Backend        | Firebase           |
| Database       | Cloud Firestore    |
| Auth           | Firebase Auth      |
| Hosting        | Firebase Hosting   |

## Core Features (MVP)

- **Authentication**: Email/password + Google OAuth (invite-only for 2 users)
- **Shared Recipes**: Create, view, edit, delete recipes in a shared collection
- **Recipe Library**: Browse 30-80 curated recipes by category
- **Cook Mode**: Clean, distraction-free recipe viewing

## Intentionally Excluded (MVP)

- Ratings & reviews
- Comments on recipes
- Grocery lists
- Nutrition tracking
- Meal planning
- Public sharing
- Social features
- AI features
- Image uploads
- Recipe scaling
- Offline mode

## Project Status

**Phase: Design Complete**

This repository contains the MVP design documentation. Implementation has not yet begun.

## License

MIT License - See [LICENSE](./LICENSE) for details.
