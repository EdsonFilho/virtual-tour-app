import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link, useLocation } from 'react-router-dom'
import { adminListMuseums, adminDeleteMuseum } from '@/admin/api'

export default function AdminDashboardPage() {
  const qc = useQueryClient()
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const location = useLocation()
  const justSaved = location.state?.saved === true

  const { data: museums, isLoading, error } = useQuery({
    queryKey: ['admin', 'museums'],
    queryFn: adminListMuseums,
  })

  const deleteMutation = useMutation({
    mutationFn: adminDeleteMuseum,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'museums'] })
      setConfirmDelete(null)
    },
  })

  if (isLoading) return <p className="text-gray-500">Loading museums...</p>
  if (error) return <p className="text-red-600">Failed to load museums.</p>

  return (
    <div>
      {justSaved && (
        <div className="mb-6 px-4 py-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
          Museum saved successfully.
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Museums</h1>
        <Link
          to="/admin/museums/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          + New Museum
        </Link>
      </div>

      {museums?.length === 0 && (
        <p className="text-gray-500">No museums yet. Create your first one.</p>
      )}

      <div className="grid gap-4">
        {museums?.map(museum => (
          <div key={museum.id} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-semibold text-gray-900">
                  {museum.name?.en ?? museum.id}
                </h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  /{museum.slug} · {museum.location}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Languages: {museum.languages?.join(', ')}
                </p>
              </div>
              <div className="flex gap-2">
                <Link
                  to={`/admin/museums/${museum.id}/edit`}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50"
                >
                  Edit
                </Link>
                <Link
                  to={`/admin/museums/${museum.id}/steps/new`}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50"
                >
                  Steps
                </Link>
                <Link
                  to={`/admin/museums/${museum.id}/tours`}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50"
                >
                  Tours
                </Link>
                <button
                  onClick={() => setConfirmDelete(museum.id)}
                  className="px-3 py-1.5 text-sm border border-red-200 text-red-600 rounded hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Delete confirmation */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 shadow-xl max-w-sm w-full mx-4">
            <h3 className="font-bold text-gray-900 mb-2">Delete museum?</h3>
            <p className="text-sm text-gray-500 mb-4">
              This will permanently delete the museum record. Tours and steps must be deleted separately.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteMutation.mutate(confirmDelete)}
                disabled={deleteMutation.isPending}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
