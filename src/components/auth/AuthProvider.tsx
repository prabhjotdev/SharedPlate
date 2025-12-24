import { useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '../../services/firebase'
import { useAppDispatch } from '../../store'
import { setUser, setAllowed, setLoading, setError, logout } from '../../store/authSlice'

interface AuthProviderProps {
  children: React.ReactNode
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const dispatch = useAppDispatch()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in
        const user = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName,
        }
        dispatch(setUser(user))

        // Check if user is in allowedUsers collection, if not add them
        try {
          const allowedRef = doc(db, 'allowedUsers', user.email)
          const allowedSnap = await getDoc(allowedRef)

          if (!allowedSnap.exists()) {
            // Auto-register new users
            await setDoc(allowedRef, {
              email: user.email,
              displayName: user.displayName,
              uid: user.uid,
              createdAt: serverTimestamp(),
            })
          }

          dispatch(setAllowed(true))
        } catch (error) {
          console.error('Error checking/adding allowed users:', error)
          dispatch(setAllowed(false))
          dispatch(setError('Error verifying access. Please try again.'))
        }
      } else {
        // User is signed out
        dispatch(logout())
      }
      dispatch(setLoading(false))
    })

    return () => unsubscribe()
  }, [dispatch])

  return <>{children}</>
}
