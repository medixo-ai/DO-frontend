import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import AppLayout from './components/layout/AppLayout'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import DashboardPage from './pages/dashboard/DashboardPage'
import AISearchPage from './pages/dashboard/AISearchPage'
import DocumentsPage from './pages/dashboard/DocumentsPage'
import UploadPage from './pages/dashboard/UploadPage'
import DocumentDetailPage from './pages/dashboard/DocumentDetailPage'
import DepartmentsPage from './pages/dashboard/DepartmentsPage'
import AnalyticsPage from './pages/dashboard/AnalyticsPage'
import UsersPage from './pages/admin/UsersPage'
import SettingsPage from './pages/dashboard/SettingsPage'
import ProfilePage from './pages/dashboard/ProfilePage'
import ApprovalsPage from './pages/dashboard/ApprovalsPage'
import ContradictionsPage from './pages/dashboard/ContradictionsPage'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
      </div>
    )
  }
  if (!user) return <Navigate to="/login" replace />
  return children
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
      </div>
    )
  }
  if (user) return <Navigate to="/dashboard" replace />
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
            <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />
            <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="search" element={<AISearchPage />} />
              <Route path="documents" element={<DocumentsPage />} />
              <Route path="documents/:id" element={<DocumentDetailPage />} />
              <Route path="upload" element={<UploadPage />} />
              <Route path="departments" element={<DepartmentsPage />} />
              <Route path="analytics" element={<AnalyticsPage />} />
              <Route path="users" element={<UsersPage />} />
              <Route path="approvals" element={<ApprovalsPage />} />
              <Route path="contradictions" element={<ContradictionsPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="profile" element={<ProfilePage />} />
            </Route>
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}
