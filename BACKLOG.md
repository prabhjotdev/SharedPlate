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

## Mobile-First HCI Improvements

*Based on established Human-Computer Interaction principles for touch-based interfaces.*

### Fitts's Law (Target Size & Distance)
*Larger + closer targets = faster interaction. Critical for one-handed phone use.*

- [ ] **Thumb Zone Layout** - Move primary actions (save, next step, check off) to bottom 1/3 of screen where thumb naturally rests
- [ ] **48dp Minimum Touch Targets** - Ensure all tappable elements meet accessibility minimum (audit current buttons)
- [ ] **Cooking Mode Large Checkboxes** - 56-64dp checkboxes during cooking (wet/messy hands = less precision)
- [ ] **Bottom Action Bar** - Move edit/delete/share from top header to bottom of recipe view
- [ ] **Full-Width Tap Areas** - Entire recipe card tappable, not just title text

### Hick's Law (Reduce Decision Time)
*Fewer choices = faster decisions. Use progressive disclosure.*

- [ ] **Progressive Disclosure** - Show basic recipe info first, tap to expand details (notes, nutrition, source)
- [ ] **Contextual Actions Only** - Show relevant actions based on context (no "Mark Cooked" until viewing recipe)
- [ ] **Smart Defaults** - Pre-fill serving size with last used value, remember sort preference
- [ ] **Filter Presets** - Quick filters like "Quick Meals (<30 min)", "Easy Recipes" instead of multiple dropdowns
- [ ] **Focused Cooking Mode** - Strip ALL UI except current step + next/prev buttons

### Miller's Law (Cognitive Chunking)
*Working memory holds 7±2 items. Group related information.*

- [ ] **Ingredient Grouping** - Chunk ingredients by type (Produce, Dairy, Pantry) or by cooking step
- [ ] **Step Progress Indicator** - Clear visual: "Step 3 of 7" with progress bar
- [ ] **Visual Section Dividers** - Clear breaks between ingredients, steps, and notes sections
- [ ] **Paginated Recipe List** - Show 5-7 recipes before scroll, avoid overwhelming grid views

### Norman's Gulfs (Execution & Evaluation)
*Make actions discoverable, show clear feedback.*

**Execution (What can I do?):**
- [ ] **Clear Affordances** - Buttons look tappable (shadows, depth, color contrast)
- [ ] **Visible Actions** - Don't hide critical functions in overflow menus
- [ ] **Icon + Label Buttons** - Text labels alongside icons, not icon-only

**Evaluation (What happened?):**
- [ ] **Immediate Tap Feedback** - Visual/haptic response on every interaction
- [ ] **State Visibility** - Clear "Saved", "Syncing...", "Offline" indicators
- [ ] **Action Confirmation** - Toast/snackbar confirming recipe added, deleted, etc.

### Nielsen's Usability Heuristics

- [ ] **System Status** - Loading skeletons, sync indicators, offline badge, progress bars
- [ ] **Real World Match** - Cooking terminology, familiar recipe card layout, intuitive icons
- [ ] **User Control & Freedom** - Undo delete action, easy back navigation, cancel mid-edit
- [ ] **Consistency** - Same gestures work everywhere, uniform button placement across screens
- [ ] **Error Prevention** - Confirm destructive actions, disable submit until form valid, auto-save drafts
- [ ] **Recognition Over Recall** - Show recent recipes, visible favorites section, ingredient autocomplete
- [ ] **Flexibility & Efficiency** - Swipe shortcuts for power users, simple tap path for beginners
- [ ] **Minimalist Design** - Remove decorative clutter, focus on content, adequate whitespace
- [ ] **Error Recovery** - "Recipe deleted - Undo" snackbar with 5s window, clear error messages with retry
- [ ] **Help & Documentation** - Onboarding tips, contextual hints on first use of features

### Cognitive Load Reduction

- [ ] **Single Task Focus** - Cooking mode shows ONE step at a time, nothing else on screen
- [ ] **Externalized Memory** - Checkboxes persist state so users don't have to remember
- [ ] **Visual Hierarchy** - Muted colors for secondary info, bold/larger for primary content
- [ ] **Spatial Consistency** - Navigation and actions always in same screen positions

### Accessibility (WCAG Compliance)

- [ ] **4.5:1 Contrast Ratio** - Ensure text legibility, especially important in bright kitchens
- [ ] **Respect System Font Size** - Scale text based on device accessibility settings
- [ ] **Large Text Cooking Mode** - Optional extra-large text mode for recipe steps
- [ ] **48x48dp Touch Targets** - With minimum 8dp spacing between targets
- [ ] **Reduce Motion Option** - Respect system "reduce motion" setting, disable animations
- [ ] **Screen Reader Labels** - Proper ARIA labels on all interactive elements

### Platform-Specific Polish

**iOS:**
- [ ] **Edge Swipe Back** - Swipe from left edge to navigate back
- [ ] **Native Pull-to-Refresh** - iOS-style rubber band effect
- [ ] **Haptic Feedback** - Taptic engine feedback on key actions
- [ ] **Safe Area Handling** - Proper padding for notch and Dynamic Island
- [ ] **Large Title Headers** - Collapsing header pattern on scroll

**Android:**
- [ ] **Material You Theming** - Dynamic colors based on wallpaper (Android 12+)
- [ ] **Predictive Back Gesture** - Support Android 14+ predictive back
- [ ] **Edge-to-Edge Content** - Content extends behind system bars
- [ ] **Back Button Handling** - Proper back stack management

### Quick Access & Shortcuts

- [ ] **Home Screen Widget** - Show "What's cooking?" or recent recipes
- [ ] **App Icon Quick Actions** - Long-press shortcuts: Add Recipe, Search, Random Recipe
- [ ] **Recently Viewed Section** - Quick access to last 3-5 viewed recipes on home

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
