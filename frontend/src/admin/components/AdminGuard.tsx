import { Navigate } from 'react-router-dom'
import { useAdminAuthContext } from '@/admin/AdminAuthContext'
import type { ReactNode } from 'react'

export default function AdminGuard({ children }: { children: ReactNode }) {
  const { user, isAdmin, isLoading } = useAdminAuthContext()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    )
  }

  if (!user) return <Navigate to="/admin/login" replace />

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-500 mb-4">Your account does not have admin permissions.</p>
          <a href="/.auth/logout" className="text-blue-600 underline">Sign out</a>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
