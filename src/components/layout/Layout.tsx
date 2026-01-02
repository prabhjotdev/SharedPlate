import { Outlet } from 'react-router-dom'
import AppHeader from './AppHeader'
import BottomNav from './BottomNav'
import NotificationPrompt from '../notifications/NotificationPrompt'
import { useMealReminders } from '../../hooks/useMealReminders'

export default function Layout() {
  // Initialize meal reminder scheduling
  useMealReminders()

  return (
    <div className="min-h-screen bg-warm-50 dark:bg-gray-900 pb-20">
      <AppHeader />
      <main>
        <Outlet />
      </main>
      <BottomNav />
      <NotificationPrompt />
    </div>
  )
}
