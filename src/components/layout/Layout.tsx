import { Outlet } from 'react-router-dom'
import AppHeader from './AppHeader'
import BottomNav from './BottomNav'

export default function Layout() {
  return (
    <div className="min-h-screen bg-warm-50 dark:bg-gray-900 pb-20">
      <AppHeader />
      <main>
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
