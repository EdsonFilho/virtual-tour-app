import { useAdminAuthContext } from '@/admin/AdminAuthContext'
import { Navigate } from 'react-router-dom'

export default function AdminLoginPage() {
  const { user, isAdmin, isLoading } = useAdminAuthContext()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    )
  }

  if (isAdmin) return <Navigate to="/admin" replace />

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-xl shadow-sm p-8 w-full max-w-sm text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Panel</h1>
        <p className="text-gray-500 mb-6 text-sm">Sign in with your Microsoft account to continue.</p>

        {user && !isAdmin ? (
          <div>
            <p className="text-red-600 text-sm mb-4">
              Your account (<strong>{user.userDetails}</strong>) does not have admin access.
            </p>
            <a
              href="/.auth/logout"
              className="text-sm text-gray-500 underline"
            >
              Sign out and try a different account
            </a>
          </div>
        ) : (
          <a
            href="/.auth/login/aad?post_login_redirect_uri=/admin"
            className="inline-block w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Sign in with Microsoft
          </a>
        )}
      </div>
    </div>
  )
}
