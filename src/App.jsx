import React from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { CSSTransition, TransitionGroup } from 'react-transition-group'

import { AuthProvider, useAuth } from './contexts/AuthContext'
import { NotificationProvider, useNotifications } from './contexts/NotificationContext'
import { AlertProvider, useAlert } from './contexts/AlertContext'

import ToastStack from './components/ToastStack'
import AlertStack from './components/AlertStack'
import AnimatedLoader from './components/AnimatedLoader'
import SessionManager from './components/SessionManager'

import Landing from './pages/Landing'
import AuthPage from './pages/Auth'
import StudentDashboard from './pages/StudentDashboard'
import AdminDashboard from './pages/AdminDashboard'
import Notifications from './pages/Notifications'
import { getDashboardRoute } from './utils/authRouting'

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
    <TransitionGroup>
      <CSSTransition key={location.pathname} timeout={300} classNames="fade" unmountOnExit>
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
      </CSSTransition>
    </TransitionGroup>
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
