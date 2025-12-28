import { Routes, Route, Navigate } from 'react-router-dom'
import { useAppSelector } from './store'

// Pages
import LoginPage from './pages/LoginPage'
import MyRecipesPage from './pages/MyRecipesPage'
import LibraryPage from './pages/LibraryPage'
import RecipeViewPage from './pages/RecipeViewPage'
import LibraryViewPage from './pages/LibraryViewPage'
import AddRecipePage from './pages/AddRecipePage'
import EditRecipePage from './pages/EditRecipePage'
import SettingsPage from './pages/SettingsPage'
import HouseholdSetupPage from './pages/HouseholdSetupPage'
import ShoppingListPage from './pages/ShoppingListPage'
import DietaryFiltersPage from './pages/DietaryFiltersPage'

// Components
import Layout from './components/layout/Layout'
import AuthProvider from './components/auth/AuthProvider'
import HouseholdProvider from './components/household/HouseholdProvider'
import ThemeProvider from './components/theme/ThemeProvider'
import Toast from './components/common/Toast'

// Protected Route wrapper - requires authentication
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isAllowed, loading } = useAppSelector((state) => state.auth)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  if (!isAuthenticated || !isAllowed) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

// Household Route wrapper - requires household membership
function HouseholdRoute({ children }: { children: React.ReactNode }) {
  const { household, loading } = useAppSelector((state) => state.household)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  if (!household) {
    return <Navigate to="/household-setup" replace />
  }

  return <>{children}</>
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <HouseholdProvider>
          <Routes>
            {/* Public route */}
            <Route path="/login" element={<LoginPage />} />

            {/* Household setup - requires auth but not household */}
            <Route
              path="/household-setup"
              element={
                <ProtectedRoute>
                  <HouseholdSetupPage />
                </ProtectedRoute>
              }
            />

            {/* Protected routes - require auth + household */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <HouseholdRoute>
                    <Layout />
                  </HouseholdRoute>
                </ProtectedRoute>
              }
            >
              <Route index element={<MyRecipesPage />} />
              <Route path="library" element={<LibraryPage />} />
              <Route path="shopping" element={<ShoppingListPage />} />
              <Route path="recipe/:id" element={<RecipeViewPage />} />
              <Route path="recipe/:id/edit" element={<EditRecipePage />} />
              <Route path="library/:id" element={<LibraryViewPage />} />
              <Route path="new" element={<AddRecipePage />} />
            </Route>

            {/* Settings (outside layout to have its own header) */}
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <HouseholdRoute>
                    <SettingsPage />
                  </HouseholdRoute>
                </ProtectedRoute>
              }
            />

            {/* Dietary Filters */}
            <Route
              path="/dietary-filters"
              element={
                <ProtectedRoute>
                  <HouseholdRoute>
                    <DietaryFiltersPage />
                  </HouseholdRoute>
                </ProtectedRoute>
              }
            />

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>

          {/* Global Toast */}
          <Toast />
        </HouseholdProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
