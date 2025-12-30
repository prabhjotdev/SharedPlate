import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { collection, getDocs, query, where, addDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '../services/firebase'
import { useAppSelector, useAppDispatch } from '../store'
import { setTheme } from '../store/settingsSlice'
import { setHousehold, addInviteCode } from '../store/householdSlice'
import { showToast } from '../store/uiSlice'
import {
  createInviteCode,
  updateMemberPermission,
  removeMemberFromHousehold,
  leaveHousehold,
} from '../services/householdService'
import type { HouseholdMember, MemberPermission } from '../types'

type Theme = 'light' | 'dark' | 'system'

export default function SettingsPage() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { theme } = useAppSelector((state) => state.settings)
  const { user } = useAppSelector((state) => state.auth)
  const { household } = useAppSelector((state) => state.household)
  const [generatingCode, setGeneratingCode] = useState(false)
  const [inviteCode, setInviteCode] = useState<string | null>(null)
  const [managingMember, setManagingMember] = useState<string | null>(null)
  const [exporting, setExporting] = useState(false)
  const [importing, setImporting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const currentUserMember = household?.members.find(m => m.uid === user?.uid)
  const isOwnerOrAdmin = currentUserMember?.role === 'owner' || currentUserMember?.role === 'admin'

  const handleThemeChange = (newTheme: Theme) => {
    dispatch(setTheme(newTheme))
  }

  const handleLogout = async () => {
    try {
      await signOut(auth)
      dispatch(showToast({ message: 'Logged out successfully', type: 'success' }))
      navigate('/login')
    } catch (error) {
      dispatch(showToast({ message: 'Failed to log out', type: 'error' }))
    }
  }

  const handleGenerateInviteCode = async () => {
    if (!household || !user) return

    setGeneratingCode(true)
    try {
      const code = await createInviteCode(household.id, household.name, user.uid)
      setInviteCode(code.code)
      dispatch(addInviteCode(code))
      dispatch(showToast({ message: 'Invite code generated!', type: 'success' }))
    } catch (error) {
      dispatch(showToast({ message: 'Failed to generate code', type: 'error' }))
    } finally {
      setGeneratingCode(false)
    }
  }

  const handleCopyCode = () => {
    if (inviteCode) {
      navigator.clipboard.writeText(inviteCode)
      dispatch(showToast({ message: 'Code copied to clipboard!', type: 'success' }))
    }
  }

  const handlePermissionChange = async (member: HouseholdMember, permission: MemberPermission) => {
    if (!household) return

    try {
      await updateMemberPermission(household.id, member.uid, permission)
      // Update local state
      const updatedMembers = household.members.map(m =>
        m.uid === member.uid ? { ...m, permission } : m
      )
      dispatch(setHousehold({ ...household, members: updatedMembers }))
      dispatch(showToast({ message: 'Permission updated!', type: 'success' }))
    } catch (error) {
      dispatch(showToast({ message: 'Failed to update permission', type: 'error' }))
    }
    setManagingMember(null)
  }

  const handleRemoveMember = async (member: HouseholdMember) => {
    if (!household) return

    if (!confirm(`Remove ${member.displayName || member.email} from the household?`)) {
      return
    }

    try {
      await removeMemberFromHousehold(household.id, member.uid)
      const updatedMembers = household.members.filter(m => m.uid !== member.uid)
      dispatch(setHousehold({ ...household, members: updatedMembers }))
      dispatch(showToast({ message: 'Member removed', type: 'success' }))
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to remove member'
      dispatch(showToast({ message, type: 'error' }))
    }
    setManagingMember(null)
  }

  const handleLeaveHousehold = async () => {
    if (!household || !user) return

    if (!confirm('Are you sure you want to leave this household? You will lose access to shared recipes.')) {
      return
    }

    try {
      await leaveHousehold(household.id, user.uid)
      dispatch(setHousehold(null))
      dispatch(showToast({ message: 'Left household', type: 'success' }))
      navigate('/household-setup')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to leave household'
      dispatch(showToast({ message, type: 'error' }))
    }
  }

  // Export all recipes as JSON
  const handleExport = async () => {
    if (!household) return

    setExporting(true)
    try {
      const recipesQuery = query(
        collection(db, 'sharedRecipes'),
        where('householdId', '==', household.id)
      )
      const snapshot = await getDocs(recipesQuery)

      const recipes = snapshot.docs.map(doc => {
        const data = doc.data()
        return {
          title: data.title,
          ingredients: data.ingredients,
          steps: data.steps,
          notes: data.notes || '',
          servings: data.servings || null,
          prepTime: data.prepTime || null,
          cookTime: data.cookTime || null,
          difficulty: data.difficulty || null,
          category: data.category || null,
          isFavorite: data.isFavorite || false,
        }
      })

      const exportData = {
        exportedAt: new Date().toISOString(),
        householdName: household.name,
        recipeCount: recipes.length,
        recipes,
      }

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `sharedplate-recipes-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      dispatch(showToast({ message: `Exported ${recipes.length} recipes`, type: 'success' }))
    } catch (error) {
      console.error('Export error:', error)
      dispatch(showToast({ message: 'Failed to export recipes', type: 'error' }))
    } finally {
      setExporting(false)
    }
  }

  // Import recipes from JSON file
  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !household || !user) return

    setImporting(true)
    try {
      const text = await file.text()
      const data = JSON.parse(text)

      if (!data.recipes || !Array.isArray(data.recipes)) {
        throw new Error('Invalid backup file format')
      }

      let importedCount = 0
      for (const recipe of data.recipes) {
        if (!recipe.title || !recipe.ingredients || !recipe.steps) {
          continue // Skip invalid recipes
        }

        await addDoc(collection(db, 'sharedRecipes'), {
          title: recipe.title,
          ingredients: recipe.ingredients,
          steps: recipe.steps,
          notes: recipe.notes || '',
          servings: recipe.servings || null,
          prepTime: recipe.prepTime || null,
          cookTime: recipe.cookTime || null,
          difficulty: recipe.difficulty || null,
          category: recipe.category || null,
          isFavorite: recipe.isFavorite || false,
          householdId: household.id,
          createdBy: user.uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        })
        importedCount++
      }

      dispatch(showToast({ message: `Imported ${importedCount} recipes`, type: 'success' }))
    } catch (error) {
      console.error('Import error:', error)
      const message = error instanceof Error ? error.message : 'Failed to import recipes'
      dispatch(showToast({ message, type: 'error' }))
    } finally {
      setImporting(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const themeOptions: { value: Theme; label: string; icon: string }[] = [
    { value: 'light', label: 'Light', icon: '☀️' },
    { value: 'dark', label: 'Dark', icon: '🌙' },
    { value: 'system', label: 'System', icon: '💻' },
  ]

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'owner': return 'Owner'
      case 'admin': return 'Admin'
      default: return 'Member'
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'owner': return 'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300'
      case 'admin': return 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300'
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-8">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2">
            <svg className="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Settings</h1>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* User Info */}
        <section className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
            Account
          </h2>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
              <span className="text-primary-600 dark:text-primary-300 font-semibold text-lg">
                {user?.email?.charAt(0).toUpperCase() || '?'}
              </span>
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                {user?.displayName || 'User'}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
            </div>
          </div>
        </section>

        {/* Household Section */}
        {household && (
          <section className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
              Household
            </h2>

            {/* Household Name */}
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                <span className="text-lg">🏠</span>
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">{household.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {household.members.length} member{household.members.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            {/* Invite Code Generator */}
            <div className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Invite Others</p>
              {inviteCode ? (
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-lg px-4 py-3 font-mono text-lg text-center tracking-widest">
                    {inviteCode}
                  </div>
                  <button
                    onClick={handleCopyCode}
                    className="p-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors min-w-[48px] min-h-[48px]"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleGenerateInviteCode}
                  disabled={generatingCode}
                  className="w-full bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 py-3.5 rounded-xl font-medium hover:bg-primary-100 dark:hover:bg-primary-900/50 transition-colors disabled:opacity-50 min-h-[48px]"
                >
                  {generatingCode ? 'Generating...' : 'Generate Invite Code'}
                </button>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Share this code with family or friends.
              </p>
            </div>

            {/* Members List */}
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Members</p>
              <div className="space-y-3">
                {household.members.map((member) => (
                  <div key={member.uid} className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center">
                      <span className="text-gray-600 dark:text-gray-300 font-medium">
                        {member.email.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white truncate">
                        {member.displayName || member.email.split('@')[0]}
                        {member.uid === user?.uid && (
                          <span className="text-gray-500 dark:text-gray-400 text-sm ml-1">(you)</span>
                        )}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getRoleBadgeColor(member.role)}`}>
                          {getRoleLabel(member.role)}
                        </span>
                        {member.permission === 'view-only' && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">View only</span>
                        )}
                      </div>
                    </div>

                    {/* Member Actions (for owners/admins, not for self or owner) */}
                    {isOwnerOrAdmin && member.uid !== user?.uid && member.role !== 'owner' && (
                      <div className="relative">
                        <button
                          onClick={() => setManagingMember(managingMember === member.uid ? null : member.uid)}
                          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                          </svg>
                        </button>

                        {managingMember === member.uid && (
                          <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-700 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 z-10">
                            <button
                              onClick={() => handlePermissionChange(
                                member,
                                member.permission === 'full' ? 'view-only' : 'full'
                              )}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-t-lg"
                            >
                              {member.permission === 'full' ? 'Set View Only' : 'Grant Full Access'}
                            </button>
                            <button
                              onClick={() => handleRemoveMember(member)}
                              className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-b-lg"
                            >
                              Remove from Household
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Leave Household (not for owner) */}
            {currentUserMember?.role !== 'owner' && (
              <button
                onClick={handleLeaveHousehold}
                className="w-full mt-4 text-red-600 dark:text-red-400 py-2 text-sm font-medium hover:underline"
              >
                Leave Household
              </button>
            )}
          </section>
        )}

        {/* Dietary Filters */}
        <section className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
            Dietary Preferences
          </h2>
          <button
            onClick={() => navigate('/dietary-filters')}
            className="w-full flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-900 dark:text-white">Dietary Filters</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Manage ingredients to avoid</p>
              </div>
            </div>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </section>

        {/* Backup & Restore */}
        <section className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
            Backup & Restore
          </h2>
          <div className="space-y-3">
            {/* Export Button */}
            <button
              onClick={handleExport}
              disabled={exporting || !household}
              className="w-full flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900 dark:text-white">Export Recipes</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Download all recipes as JSON</p>
                </div>
              </div>
              {exporting ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
              ) : (
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
            </button>

            {/* Import Button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={importing || !household}
              className="w-full flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900 dark:text-white">Import Recipes</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Restore recipes from JSON backup</p>
                </div>
              </div>
              {importing ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-500"></div>
              ) : (
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
            </button>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
            Export creates a JSON file with all your recipes. Import adds recipes from a backup file.
          </p>
        </section>

        {/* Theme Selection */}
        <section className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
            Appearance
          </h2>
          <div className="space-y-2">
            {themeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleThemeChange(option.value)}
                className={`w-full flex items-center gap-3 p-3.5 rounded-xl transition-colors min-h-[52px] ${
                  theme === option.value
                    ? 'bg-primary-50 dark:bg-primary-900/30 border-2 border-primary-500'
                    : 'bg-gray-50 dark:bg-gray-700 border-2 border-transparent hover:bg-gray-100 dark:hover:bg-gray-600'
                }`}
              >
                <span className="text-xl">{option.icon}</span>
                <span className={`font-medium ${
                  theme === option.value
                    ? 'text-primary-600 dark:text-primary-400'
                    : 'text-gray-700 dark:text-gray-200'
                }`}>
                  {option.label}
                </span>
                {theme === option.value && (
                  <svg className="w-5 h-5 text-primary-600 dark:text-primary-400 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </section>

        {/* App Info */}
        <section className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
            About
          </h2>
          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
            <div className="flex justify-between">
              <span>Version</span>
              <span className="text-gray-900 dark:text-white">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span>App</span>
              <span className="text-gray-900 dark:text-white">SharedPlate</span>
            </div>
          </div>
        </section>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 py-4 rounded-xl font-semibold hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
        >
          Log Out
        </button>
      </div>
    </div>
  )
}
