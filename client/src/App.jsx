import React, { Suspense, lazy, useEffect, useMemo } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'

import { AuthProvider, useAuth } from './contexts/AuthContext'
import { NotificationProvider } from './contexts/NotificationContext'
import { AlertProvider } from './contexts/AlertContext'

import ToastStack from './components/ToastStack'
import AlertStack from './components/AlertStack'
import AnimatedLoader from './components/AnimatedLoader'
import SessionManager from './components/SessionManager'
import Seo from './components/Seo'

import Landing from './pages/Landing'
import { getDashboardRoute } from './utils/authRouting'

const AuthPage = lazy(() => import('./pages/Auth'))
const StudentDashboard = lazy(() => import('./pages/StudentDashboard'))
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'))
const Notifications = lazy(() => import('./pages/Notifications'))

function ProtectedRoute({ children, role }) {
  const { currentUser, profile, loading } = useAuth()

  if (loading) {
    return <AnimatedLoader />
  }

  if (!currentUser) return <Navigate to="/auth" replace />

  if (profile?.role !== role) {
    return <Navigate to={getDashboardRoute(profile?.role)} replace />
  }

  return children
}

function MainRoutes() {
  const location = useLocation()
  const { currentUser, profile, loading } = useAuth()

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [location.pathname])

  const seo = useMemo(() => {
    if (location.pathname === '/') {
      return {
        title: 'Gyanvatsala Library | Focused Study Space and Reading Culture',
        description: 'Join Gyanvatsala Library for focused study hours, stronger reading habits, disciplined routines, and a calm learning environment.',
        path: '/',
        robots: 'index,follow',
        jsonLd: {
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': 'WebSite',
              name: 'Gyanvatsala Library',
              url: import.meta.env.VITE_SITE_URL || 'http://localhost:5173',
              description: 'Library website for readers and students looking for disciplined study spaces, curated books, and a strong reading culture.',
            },
            {
              '@type': 'Organization',
              name: 'Gyanvatsala Library',
              url: import.meta.env.VITE_SITE_URL || 'http://localhost:5173',
              description: 'A student-focused library built around reading habits, concentration, disciplined study, and long-term academic growth.',
            },
          ],
        },
      }
    }

    if (location.pathname === '/auth') {
      return {
        title: 'Login | Gyanvatsala Library',
        description: 'Secure sign in for students and admins of Gyanvatsala Library.',
        path: '/auth',
        robots: 'noindex,follow',
      }
    }

    return {
      title: 'Dashboard | Gyanvatsala Library',
      description: 'Private dashboard for Gyanvatsala Library users.',
      path: location.pathname,
      robots: 'noindex,nofollow',
    }
  }, [location.pathname])

  if (loading) {
    return <AnimatedLoader />
  }

  const adminDashboard = (
    <ProtectedRoute role="admin">
      <AdminDashboard />
    </ProtectedRoute>
  )

  const studentDashboard = (
    <ProtectedRoute role="student">
      <StudentDashboard />
    </ProtectedRoute>
  )

  return (
    <>
      <Seo {...seo} />
      <Suspense fallback={<AnimatedLoader />}>
        <Routes location={location}>
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<AuthPage />} />

          <Route path="/admin" element={adminDashboard} />
          <Route path="/admin/students" element={adminDashboard} />
          <Route path="/admin/ebooks" element={adminDashboard} />
          <Route path="/admin/fees" element={adminDashboard} />
          <Route path="/admin/due-soon" element={adminDashboard} />
          <Route path="/admin/defaulters" element={adminDashboard} />
          <Route path="/admin/earnings" element={adminDashboard} />

          <Route path="/student" element={studentDashboard} />
          <Route path="/student/dashboard" element={studentDashboard} />

          <Route
            path="/notifications"
            element={
              <ProtectedRoute role={profile?.role}>
                <Notifications />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard"
            element={
              currentUser && profile?.role ? (
                <Navigate to={getDashboardRoute(profile.role)} replace />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </>
  )
}

export default function App() {
  return (
    <AlertProvider>
      <AuthProvider>
        <NotificationProvider>
          <SessionManager />
          <MainRoutes />
          <ToastStack />
          <AlertStack />
        </NotificationProvider>
      </AuthProvider>
    </AlertProvider>
  )
}
