# SharedPlate Feature Backlog

## Quick Wins (Small but impactful)

- [x] **Recipe Search** - Find recipes by name as list grows
- [x] **Prep Time / Cook Time** - Essential recipe metadata fields
- [x] **Difficulty Level** - Easy / Medium / Hard indicator
- [ ] **Recipe Source** - Where it came from (URL, cookbook, family, etc.)

## Better Cooking Experience

- [x] **Ingredient Checkboxes** - Check off ingredients while cooking
- [x] **Step Checkboxes** - Check off steps as you go
- [ ] **Keep Screen Awake** - Prevent screen timeout while cooking
- [ ] **Copy as Text** - Share recipe via text/message

## Organization

- [x] **Sort Recipes** - By name, date added, last cooked
- [ ] **Favorite/Star Recipes** - Quick access to top recipes
- [ ] **Last Cooked Date** - Track when you made it
- [ ] **Recipe Categories/Tags** - Organize recipes (breakfast, dinner, dessert, quick meals, etc.)
- [x] **Recipe Filtering** - Filter by category, cook time, etc.

## Dietary Preferences & Restrictions

- [ ] **Dietary Profiles** - Pre-defined profiles: Gluten-free, Dairy-free, Nut-free, Vegetarian, Vegan, Shellfish-free, Low-sodium, etc.
- [ ] **Custom Restrictions** - Add specific ingredients to avoid (e.g., cilantro, spicy foods)
- [ ] **Library Filtering** - Library page hides or flags recipes containing restricted ingredients (user's choice: hide vs show with warning)
- [ ] **Smart Ingredient Matching** - Fuzzy matching to handle variations (e.g., "milk" matches "whole milk", "skim milk" but not "coconut milk")
- [ ] **Restriction Settings Page** - Manage dietary profiles and custom restrictions in Settings
- [ ] **Per-User Preferences** - Each household member can have their own dietary settings

*Note: My Recipes page is NOT filtered - users are responsible for their own recipes.*

## Meal Planning

- [ ] **Weekly Meal Planner** - Drag and drop recipes to days of the week

## Shopping & Pantry

- [ ] **Shopping List** - Auto-generate from selected recipes
- [ ] **Shared Shopping List** - Household members can check off items in real-time
- [ ] **Pantry Tracking** - Track what ingredients you have at home
- [ ] **Smart Suggestions** - Suggest recipes based on pantry items

## Media & Presentation

- [ ] **Recipe Photos** - Upload images for recipes
- [ ] **Step-by-Step Cooking Mode** - Large text, swipe through steps hands-free
- [ ] **Cooking Timers** - Built-in timers for each step

## Import & Export

- [ ] **Import from URL** - Scrape recipes from popular recipe websites
- [ ] **Export to PDF** - Generate printable recipe cards
- [ ] **Backup/Restore** - Export and import all recipes as JSON

## Social & Collaboration

- [ ] **Recipe Comments** - Household members can add tips and variations
- [ ] **Recipe Ratings** - Rate recipes within household
- [ ] **Cooking History** - Track what you've cooked and when
- [ ] **Public Sharing** - Share individual recipes via link outside household

## Smart Features

- [ ] **Ingredient Substitutions** - Suggest alternatives for missing ingredients
- [ ] **Nutritional Info** - Calculate calories and macros
- [ ] **Voice/Hands-Free Mode** - Navigate recipes with voice commands
- [ ] **Push Notifications** - New recipes added, meal plan reminders

## Mobile App

- [ ] **PWA (Progressive Web App)** - Add service worker + manifest for "Add to Home Screen" install, offline support. Easiest option with minimal code changes.
- [ ] **Capacitor Native App** - Wrap existing React app in native shell. Publish to App Store / Google Play Store. Access to native features (push notifications, camera for recipe photos, etc.).
- [ ] **React Native Rewrite** - Full native experience with better performance. More development effort but best UX. Could share business logic with web app.

## UI/UX Modernization

### Visual Polish
- [ ] **Skeleton Loading States** - Replace spinners with content-shaped skeleton loaders that shimmer while loading
- [ ] **Micro-interactions** - Subtle animations on button taps, checkbox completion, card interactions
- [ ] **Recipe Card Redesign** - Add image placeholders with food icons, subtle shadows, hover lift effects
- [ ] **Glassmorphism Elements** - Frosted glass effect on modals and overlays for modern depth
- [ ] **Custom Illustrations** - Hand-drawn style empty states and onboarding graphics
- [ ] **Animated Success States** - Confetti or checkmark animation when completing all steps

### Navigation & Gestures
- [ ] **Bottom Sheet Modals** - Slide-up sheets for actions (delete, share, duplicate) instead of modals
- [ ] **Swipe Actions** - Swipe left/right on recipe cards for quick actions (favorite, delete)
- [ ] **Page Transitions** - Smooth slide/fade animations between pages
- [ ] **Pull-down Quick Search** - iOS-style pull down to reveal search on home page
- [ ] **Gesture Navigation** - Swipe from edge to go back

### Recipe Experience
- [ ] **Hero Image Layout** - Full-width image at top of recipe view with overlapping content card
- [ ] **Sticky Section Headers** - Ingredients/Steps headers stick while scrolling
- [ ] **Floating Progress Bar** - Shows cooking progress (X/Y steps done) at bottom while viewing recipe
- [ ] **Quick Actions FAB Menu** - Expandable floating button with timer, scale, share options

### Modern Patterns
- [ ] **Optimistic Updates** - Instant UI feedback, sync in background
- [ ] **Haptic Feedback** - Vibration on key actions (mobile)
- [ ] **Animated Tab Bar** - Smooth indicator animation, icon bounce on select
- [ ] **Staggered List Animations** - Cards animate in sequence when loading
- [ ] **Blur Behind Modals** - Background blur when dialogs open

### Onboarding & Discovery
- [ ] **Welcome Tutorial** - Swipeable intro screens for first-time users
- [ ] **Feature Tooltips** - Contextual hints for new features
- [ ] **Smart Empty States** - Actionable empty states with illustrations and CTAs

---

## Completed Features

- [x] Google and email/password authentication
- [x] Household collaboration with invite codes
- [x] Recipe CRUD (create, read, update, delete)
- [x] Recipe library to copy from
- [x] Serving size scaling
- [x] Dark mode
- [x] Member permissions management
- [x] Delete confirmation modal
- [x] Pull to refresh
- [x] Better empty states
- [x] Duplicate recipe functionality
- [x] Recipe search
- [x] Prep time / Cook time fields
- [x] Difficulty level indicator
- [x] Recipe filtering (by difficulty, cook time)
- [x] Recipe sorting (newest, oldest, name A-Z/Z-A)
- [x] Ingredient and step checkboxes while cooking
