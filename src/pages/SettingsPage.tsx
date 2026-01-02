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
import NotificationSettings from '../components/notifications/NotificationSettings'
import type { HouseholdMember, MemberPermission } from '../types'

type Theme = 'light' | 'dark' | 'system'

// Collapsible section component
function SettingsSection({
  title,
  icon,
  iconBg,
  children,
  defaultOpen = false,
}: {
  title: string
  icon: React.ReactNode
  iconBg: string
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden transition-all duration-200">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors active:scale-[0.995]"
      >
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg}`}>
          {icon}
        </div>
        <span className="flex-1 font-semibold text-gray-900 dark:text-white">{title}</span>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div
        className={`transition-all duration-200 ease-in-out overflow-hidden ${
          isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-4 pb-4 pt-0">{children}</div>
      </div>
    </section>
  )
}

// Settings row component for navigation items
function SettingsRow({
  icon,
  iconBg,
  title,
  subtitle,
  onClick,
  rightElement,
  destructive = false,
}: {
  icon: React.ReactNode
  iconBg: string
  title: string
  subtitle?: string
  onClick?: () => void
  rightElement?: React.ReactNode
  destructive?: boolean
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all active:scale-[0.98] min-h-[56px]"
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
        {icon}
      </div>
      <div className="flex-1 text-left min-w-0">
        <p className={`font-medium ${destructive ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
          {title}
        </p>
        {subtitle && <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{subtitle}</p>}
      </div>
      {rightElement || (
        <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      )}
    </button>
  )
}

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
  const [loggingOut, setLoggingOut] = useState(false)
  const [copiedCode, setCopiedCode] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const currentUserMember = household?.members.find(m => m.uid === user?.uid)
  const isOwnerOrAdmin = currentUserMember?.role === 'owner' || currentUserMember?.role === 'admin'

  const handleThemeChange = (newTheme: Theme) => {
    dispatch(setTheme(newTheme))
  }

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      await signOut(auth)
      dispatch(showToast({ message: 'Logged out successfully', type: 'success' }))
      navigate('/login')
    } catch (error) {
      dispatch(showToast({ message: 'Failed to log out', type: 'error' }))
      setLoggingOut(false)
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
      setCopiedCode(true)
      dispatch(showToast({ message: 'Code copied!', type: 'success' }))
      setTimeout(() => setCopiedCode(false), 2000)
    }
  }

  const handlePermissionChange = async (member: HouseholdMember, permission: MemberPermission) => {
    if (!household) return

    try {
      await updateMemberPermission(household.id, member.uid, permission)
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
          continue
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
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const themeOptions: { value: Theme; label: string; icon: React.ReactNode }[] = [
    {
      value: 'light',
      label: 'Light',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
    {
      value: 'dark',
      label: 'Dark',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      ),
    },
    {
      value: 'system',
      label: 'System',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
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
      case 'owner': return 'bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-300'
      case 'admin': return 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300'
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
    }
  }

  return (
    <div className="min-h-screen bg-warm-50 dark:bg-gray-900 pb-24">
      {/* Header */}
      <div className="sticky top-14 z-30 bg-warm-50 dark:bg-gray-900 px-4 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors active:scale-95 min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <svg className="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Settings</h1>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Profile Card */}
        <section className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-2xl">
                {user?.email?.charAt(0).toUpperCase() || '?'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-lg text-gray-900 dark:text-white truncate">
                {user?.displayName || 'User'}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
              {household && (
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400">
                    {household.name}
                  </span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Household Section */}
        {household && (
          <SettingsSection
            title="Household"
            icon={
              <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            }
            iconBg="bg-green-100 dark:bg-green-900/30"
            defaultOpen={true}
          >
            {/* Household Info */}
            <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-lg">
                🏠
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900 dark:text-white">{household.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {household.members.length} member{household.members.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            {/* Invite Code */}
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Invite Others</p>
              {inviteCode ? (
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-xl px-4 py-3 font-mono text-lg text-center tracking-widest text-gray-900 dark:text-white">
                    {inviteCode}
                  </div>
                  <button
                    onClick={handleCopyCode}
                    className={`p-3 rounded-xl transition-all active:scale-95 min-w-[48px] min-h-[48px] ${
                      copiedCode
                        ? 'bg-green-500 text-white'
                        : 'bg-primary-600 text-white hover:bg-primary-700'
                    }`}
                  >
                    {copiedCode ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    )}
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleGenerateInviteCode}
                  disabled={generatingCode}
                  className="w-full bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 py-3.5 rounded-xl font-medium hover:bg-primary-100 dark:hover:bg-primary-900/50 transition-all active:scale-[0.98] disabled:opacity-50 min-h-[48px] flex items-center justify-center gap-2"
                >
                  {generatingCode ? (
                    <>
                      <div className="w-4 h-4 border-2 border-primary-600 dark:border-primary-400 border-t-transparent rounded-full animate-spin" />
                      Generating...
                    </>
                  ) : (
                    'Generate Invite Code'
                  )}
                </button>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Share this code with family or friends.
              </p>
            </div>

            {/* Members List */}
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Members</p>
              <div className="space-y-2">
                {household.members.map((member) => (
                  <div key={member.uid} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
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

                    {isOwnerOrAdmin && member.uid !== user?.uid && member.role !== 'owner' && (
                      <div className="relative">
                        <button
                          onClick={() => setManagingMember(managingMember === member.uid ? null : member.uid)}
                          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 min-w-[44px] min-h-[44px] flex items-center justify-center"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                          </svg>
                        </button>

                        {managingMember === member.uid && (
                          <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-700 rounded-xl shadow-lg border border-gray-200 dark:border-gray-600 z-10 overflow-hidden">
                            <button
                              onClick={() => handlePermissionChange(
                                member,
                                member.permission === 'full' ? 'view-only' : 'full'
                              )}
                              className="w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                            >
                              {member.permission === 'full' ? 'Set View Only' : 'Grant Full Access'}
                            </button>
                            <button
                              onClick={() => handleRemoveMember(member)}
                              className="w-full text-left px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
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

            {currentUserMember?.role !== 'owner' && (
              <button
                onClick={handleLeaveHousehold}
                className="w-full text-red-600 dark:text-red-400 py-2 text-sm font-medium hover:underline"
              >
                Leave Household
              </button>
            )}
          </SettingsSection>
        )}

        {/* Preferences Section */}
        <SettingsSection
          title="Preferences"
          icon={
            <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
          }
          iconBg="bg-purple-100 dark:bg-purple-900/30"
          defaultOpen={true}
        >
          {/* Dietary Filters */}
          <SettingsRow
            icon={
              <svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            }
            iconBg="bg-amber-100 dark:bg-amber-900/30"
            title="Dietary Filters"
            subtitle="Manage ingredients to avoid"
            onClick={() => navigate('/dietary-filters')}
          />

          {/* Theme Selection */}
          <div className="mt-3">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Appearance</p>
            <div className="grid grid-cols-3 gap-2">
              {themeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleThemeChange(option.value)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all active:scale-95 min-h-[72px] ${
                    theme === option.value
                      ? 'bg-primary-100 dark:bg-primary-900/50 border-2 border-primary-500 text-primary-600 dark:text-primary-400'
                      : 'bg-gray-50 dark:bg-gray-700/50 border-2 border-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {option.icon}
                  <span className="text-sm font-medium">{option.label}</span>
                </button>
              ))}
            </div>
          </div>
        </SettingsSection>

        {/* Notifications Section */}
        <SettingsSection
          title="Notifications"
          icon={
            <svg className="w-5 h-5 text-rose-600 dark:text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          }
          iconBg="bg-rose-100 dark:bg-rose-900/30"
        >
          <NotificationSettings />
        </SettingsSection>

        {/* Data & Storage Section */}
        <SettingsSection
          title="Data & Storage"
          icon={
            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
            </svg>
          }
          iconBg="bg-blue-100 dark:bg-blue-900/30"
        >
          {/* Export */}
          <SettingsRow
            icon={
              <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            }
            iconBg="bg-blue-100 dark:bg-blue-900/30"
            title="Export Recipes"
            subtitle="Download all recipes as JSON"
            onClick={handleExport}
            rightElement={
              exporting ? (
                <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              ) : undefined
            }
          />

          {/* Import */}
          <div className="mt-2">
            <SettingsRow
              icon={
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              }
              iconBg="bg-green-100 dark:bg-green-900/30"
              title="Import Recipes"
              subtitle="Restore recipes from JSON backup"
              onClick={() => fileInputRef.current?.click()}
              rightElement={
                importing ? (
                  <div className="w-5 h-5 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
                ) : undefined
              }
            />
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />

          <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 px-1">
            Export creates a JSON file with all your recipes. Import adds recipes from a backup file.
          </p>
        </SettingsSection>

        {/* About Section */}
        <SettingsSection
          title="About"
          icon={
            <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          iconBg="bg-gray-100 dark:bg-gray-700"
        >
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600 dark:text-gray-400">Version</span>
              <span className="font-medium text-gray-900 dark:text-white">1.0.0</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600 dark:text-gray-400">App</span>
              <span className="font-medium text-gray-900 dark:text-white">SharedPlate</span>
            </div>
          </div>
        </SettingsSection>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="w-full bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 py-4 rounded-2xl font-semibold hover:bg-red-100 dark:hover:bg-red-900/50 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loggingOut ? (
            <>
              <div className="w-5 h-5 border-2 border-red-600 dark:border-red-400 border-t-transparent rounded-full animate-spin" />
              Logging out...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Log Out
            </>
          )}
        </button>
      </div>
    </div>
  )
}
