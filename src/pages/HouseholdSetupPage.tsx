import { useState } from 'react'
import { useAppDispatch, useAppSelector } from '../store'
import { setHousehold } from '../store/householdSlice'
import { showToast } from '../store/uiSlice'
import { createHousehold, joinHouseholdWithCode, validateInviteCode } from '../services/householdService'

type SetupMode = 'choose' | 'create' | 'join'

export default function HouseholdSetupPage() {
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((state) => state.auth)
  const [mode, setMode] = useState<SetupMode>('choose')
  const [householdName, setHouseholdName] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [validatingCode, setValidatingCode] = useState(false)
  const [validatedHouseholdName, setValidatedHouseholdName] = useState<string | null>(null)

  const handleCreateHousehold = async () => {
    if (!user || !householdName.trim()) return

    setLoading(true)
    try {
      const household = await createHousehold(householdName.trim(), user)
      dispatch(setHousehold(household))
      dispatch(showToast({ message: 'Household created!', type: 'success' }))
    } catch (error) {
      console.error('Error creating household:', error)
      dispatch(showToast({ message: 'Failed to create household', type: 'error' }))
    } finally {
      setLoading(false)
    }
  }

  const handleValidateCode = async () => {
    if (inviteCode.length < 6) return

    setValidatingCode(true)
    setValidatedHouseholdName(null)

    try {
      const code = await validateInviteCode(inviteCode.toUpperCase())
      if (code) {
        setValidatedHouseholdName(code.householdName)
      } else {
        dispatch(showToast({ message: 'Invalid or expired code', type: 'error' }))
      }
    } catch (error) {
      dispatch(showToast({ message: 'Failed to validate code', type: 'error' }))
    } finally {
      setValidatingCode(false)
    }
  }

  const handleJoinHousehold = async () => {
    if (!user || !inviteCode.trim()) return

    setLoading(true)
    try {
      const household = await joinHouseholdWithCode(inviteCode.trim(), user)
      dispatch(setHousehold(household))
      dispatch(showToast({ message: `Joined ${household.name}!`, type: 'success' }))
    } catch (error) {
      console.error('Error joining household:', error)
      const message = error instanceof Error ? error.message : 'Failed to join household'
      dispatch(showToast({ message, type: 'error' }))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-4">
        <div className="flex items-center gap-3">
          {mode !== 'choose' && (
            <button onClick={() => { setMode('choose'); setValidatedHouseholdName(null); }} className="p-2 -ml-2">
              <svg className="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            {mode === 'choose' ? 'Welcome to SharedPlate' : mode === 'create' ? 'Create Household' : 'Join Household'}
          </h1>
        </div>
      </div>

      <div className="flex-1 p-4">
        {mode === 'choose' && (
          <div className="space-y-6">
            <div className="text-center py-8">
              <div className="text-6xl mb-4">🏠</div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Set Up Your Household
              </h2>
              <p className="text-gray-500 dark:text-gray-400">
                Create a household to share recipes with family & friends, or join an existing one.
              </p>
            </div>

            <button
              onClick={() => setMode('create')}
              className="w-full bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border-2 border-transparent hover:border-orange-500 transition-colors text-left"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Create a Household</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Start fresh and invite others to join</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => setMode('join')}
              className="w-full bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border-2 border-transparent hover:border-orange-500 transition-colors text-left"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Join a Household</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Enter an invite code from someone</p>
                </div>
              </div>
            </button>
          </div>
        )}

        {mode === 'create' && (
          <div className="space-y-6">
            <div className="text-center py-4">
              <div className="text-5xl mb-4">✨</div>
              <p className="text-gray-500 dark:text-gray-400">
                Give your household a name. You can invite others after.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Household Name
              </label>
              <input
                type="text"
                value={householdName}
                onChange={(e) => setHouseholdName(e.target.value)}
                placeholder="e.g., Smith Family, Roommates, etc."
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                autoFocus
              />
            </div>

            <button
              onClick={handleCreateHousehold}
              disabled={loading || !householdName.trim()}
              className="w-full bg-orange-500 text-white py-4 rounded-xl font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Household'}
            </button>
          </div>
        )}

        {mode === 'join' && (
          <div className="space-y-6">
            <div className="text-center py-4">
              <div className="text-5xl mb-4">🔑</div>
              <p className="text-gray-500 dark:text-gray-400">
                Enter the 6-character invite code you received.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Invite Code
              </label>
              <input
                type="text"
                value={inviteCode}
                onChange={(e) => {
                  setInviteCode(e.target.value.toUpperCase())
                  setValidatedHouseholdName(null)
                }}
                placeholder="e.g., ABC123"
                maxLength={6}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent text-center text-2xl tracking-widest font-mono"
                autoFocus
              />
            </div>

            {inviteCode.length === 6 && !validatedHouseholdName && (
              <button
                onClick={handleValidateCode}
                disabled={validatingCode}
                className="w-full bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white py-3 rounded-xl font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
              >
                {validatingCode ? 'Checking...' : 'Verify Code'}
              </button>
            )}

            {validatedHouseholdName && (
              <div className="bg-green-50 dark:bg-green-900/30 rounded-xl p-4 border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-3">
                  <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-sm text-green-600 dark:text-green-400">Valid code!</p>
                    <p className="font-semibold text-green-800 dark:text-green-200">
                      Join "{validatedHouseholdName}"
                    </p>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={handleJoinHousehold}
              disabled={loading || !validatedHouseholdName}
              className="w-full bg-orange-500 text-white py-4 rounded-xl font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Joining...' : 'Join Household'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
