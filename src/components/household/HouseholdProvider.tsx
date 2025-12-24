import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../../store'
import { setHousehold, setLoading, setError } from '../../store/householdSlice'
import { findUserHousehold } from '../../services/householdService'

interface HouseholdProviderProps {
  children: React.ReactNode
}

export default function HouseholdProvider({ children }: HouseholdProviderProps) {
  const dispatch = useAppDispatch()
  const { user, isAuthenticated, isAllowed } = useAppSelector((state) => state.auth)

  useEffect(() => {
    async function loadHousehold() {
      if (!user || !isAuthenticated || !isAllowed) {
        dispatch(setHousehold(null))
        return
      }

      dispatch(setLoading(true))

      try {
        const household = await findUserHousehold(user.uid)
        dispatch(setHousehold(household))
      } catch (error) {
        console.error('Error loading household:', error)
        dispatch(setError('Failed to load household'))
      }
    }

    loadHousehold()
  }, [user, isAuthenticated, isAllowed, dispatch])

  return <>{children}</>
}
