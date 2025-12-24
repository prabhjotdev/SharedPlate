import { useEffect } from 'react'
import { useAppSelector, useAppDispatch } from '../../store'
import { hideToast } from '../../store/uiSlice'

export default function Toast() {
  const dispatch = useAppDispatch()
  const { toastMessage, toastType } = useAppSelector((state) => state.ui)

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        dispatch(hideToast())
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [toastMessage, dispatch])

  if (!toastMessage) return null

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 animate-slide-up">
      <div
        className={`p-4 rounded-xl shadow-lg flex items-center gap-3 ${
          toastType === 'success' ? 'bg-gray-900 text-white' : 'bg-red-500 text-white'
        }`}
      >
        {toastType === 'success' ? (
          <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        )}
        <span>{toastMessage}</span>
      </div>
    </div>
  )
}
