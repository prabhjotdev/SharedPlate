import { Routes, Route, Navigate } from 'react-router-dom'
import { useAppSelector } from './store'

// Pages (to be implemented)
import LoginPage from './pages/LoginPage'
import MyRecipesPage from './pages/MyRecipesPage'
import LibraryPage from './pages/LibraryPage'
import RecipeViewPage from './pages/RecipeViewPage'
import LibraryViewPage from './pages/LibraryViewPage'
import AddRecipePage from './pages/AddRecipePage'
import EditRecipePage from './pages/EditRecipePage'

// Components
import Layout from './components/layout/Layout'
import AuthProvider from './components/auth/AuthProvider'
import Toast from './components/common/Toast'

// Protected Route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isAllowed, loading } = useAppSelector((state) => state.auth)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  if (!isAuthenticated || !isAllowed) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public route */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<MyRecipesPage />} />
          <Route path="library" element={<LibraryPage />} />
          <Route path="recipe/:id" element={<RecipeViewPage />} />
          <Route path="recipe/:id/edit" element={<EditRecipePage />} />
          <Route path="library/:id" element={<LibraryViewPage />} />
          <Route path="new" element={<AddRecipePage />} />
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Global Toast */}
      <Toast />
    </AuthProvider>
  )
}

export default App
