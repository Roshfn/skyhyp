import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import HomePage from './pages/HomePage'
import TradesPage from './pages/TradesPage'
import PerformancePage from './pages/PerformancePage'
import ReviewPage from './pages/ReviewPage'
import JournalFormPage from './pages/JournalFormPage'
import JournalDetailPage from './pages/JournalDetailPage'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/trades"
            element={
              <ProtectedRoute>
                <TradesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/performance"
            element={
              <ProtectedRoute>
                <PerformancePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/review"
            element={
              <ProtectedRoute>
                <ReviewPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/journals/new"
            element={
              <ProtectedRoute>
                <JournalFormPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/journals/:journalId"
            element={
              <ProtectedRoute>
                <JournalDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/journals/:journalId/edit"
            element={
              <ProtectedRoute>
                <JournalFormPage />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
