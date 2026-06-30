import { createBrowserRouter } from 'react-router-dom'
import { LoginPage } from './components/LoginPage'
import { RegisterPage } from './components/RegisterPage'
import { RequireAuth } from './components/RequireAuth'
import { DashboardPage } from './components/DashboardPage'
import { CommunityPage } from './components/CommunityPage'
import { StatsPage } from './components/StatsPage'
import { AchievementsPage } from './components/AchievementsPage'
import { ProfilePage } from './components/ProfilePage'

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    path: '/',
    element: <RequireAuth />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'community', element: <CommunityPage /> },
      { path: 'stats', element: <StatsPage /> },
      { path: 'achievements', element: <AchievementsPage /> },
      { path: 'profile', element: <ProfilePage /> },
    ],
  },
])
