import { NavLink, Outlet } from 'react-router-dom'
import { useAdminAuthContext } from '@/admin/AdminAuthContext'

export default function AdminLayout() {
  const { adminUser } = useAdminAuthContext()

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-56 bg-gray-900 text-white flex flex-col">
        <div className="px-4 py-5 border-b border-gray-700">
          <p className="font-bold text-lg">Admin Panel</p>
          <p className="text-xs text-gray-400 truncate mt-1">{adminUser?.email}</p>
        </div>
        <nav className="flex-1 px-2 py-4 space-y-1">
          <NavLink
            to="/admin"
            end
            className={({ isActive }) =>
              `block px-3 py-2 rounded text-sm font-medium ${isActive ? 'bg-gray-700' : 'hover:bg-gray-800'}`
            }
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/admin/museums/new"
            className={({ isActive }) =>
              `block px-3 py-2 rounded text-sm font-medium ${isActive ? 'bg-gray-700' : 'hover:bg-gray-800'}`
            }
          >
            + New Museum
          </NavLink>
        </nav>
        <div className="px-4 py-4 border-t border-gray-700">
          <a
            href="/.auth/logout"
            className="text-sm text-gray-400 hover:text-white"
          >
            Sign out
          </a>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 bg-gray-50 p-8 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
