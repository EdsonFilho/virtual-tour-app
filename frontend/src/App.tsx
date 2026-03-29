import { Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from '@/pages/LandingPage'
import TourPlayerPage from '@/pages/TourPlayerPage'
import { AdminAuthProvider } from '@/admin/AdminAuthContext'
import AdminGuard from '@/admin/components/AdminGuard'
import AdminLayout from '@/admin/components/AdminLayout'
import AdminLoginPage from '@/admin/pages/AdminLoginPage'
import AdminDashboardPage from '@/admin/pages/AdminDashboardPage'
import MuseumFormPage from '@/admin/pages/MuseumFormPage'
import TourFormPage from '@/admin/pages/TourFormPage'
import StepFormPage from '@/admin/pages/StepFormPage'
import StepListPage from '@/admin/pages/StepListPage'

export default function App() {
  return (
    <Routes>
      {/* Public tour routes */}
      <Route path="/tour/:museumSlug" element={<LandingPage />} />
      <Route path="/tour/:museumSlug/:tourType" element={<TourPlayerPage />} />

      {/* Admin routes */}
      <Route path="/admin" element={
        <AdminAuthProvider>
          <AdminGuard><AdminLayout /></AdminGuard>
        </AdminAuthProvider>
      }>
        <Route index element={<AdminDashboardPage />} />
        <Route path="museums/new" element={<MuseumFormPage />} />
        <Route path="museums/:museumId/edit" element={<MuseumFormPage />} />
        <Route path="museums/:museumId/tours" element={<TourFormPage />} />
        <Route path="museums/:museumId/steps" element={<StepListPage />} />
        <Route path="museums/:museumId/steps/new" element={<StepFormPage />} />
        <Route path="museums/:museumId/steps/:stepId/edit" element={<StepFormPage />} />
      </Route>
      <Route path="/admin/login" element={
        <AdminAuthProvider><AdminLoginPage /></AdminAuthProvider>
      } />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
