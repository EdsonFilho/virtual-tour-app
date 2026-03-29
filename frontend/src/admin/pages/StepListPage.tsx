import { useParams, Link, useLocation } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminListSteps, adminDeleteStep } from '@/admin/api'

export default function StepListPage() {
  const { museumId } = useParams<{ museumId: string }>()
  const qc = useQueryClient()
  const location = useLocation()
  const justSaved = location.state?.saved === true

  const { data: steps, isLoading } = useQuery({
    queryKey: ['admin', 'steps', museumId],
    queryFn: () => adminListSteps(museumId!),
  })

  const deleteMutation = useMutation({
    mutationFn: adminDeleteStep,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'steps', museumId] }),
  })

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold text-gray-900">Steps</h1>
        <Link
          to={`/admin/museums/${museumId}/steps/new`}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          + New Step
        </Link>
      </div>
      <p className="text-gray-500 text-sm mb-6">{museumId}</p>

      {justSaved && (
        <div className="mb-6 px-4 py-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
          Step saved successfully.
        </div>
      )}

      {isLoading && <p className="text-gray-500">Loading...</p>}

      {!isLoading && steps?.length === 0 && (
        <p className="text-gray-500">No steps yet. Create your first one.</p>
      )}

      <div className="space-y-1">
        {steps?.map(step => (
          <div key={step.id} className="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-4 py-2.5">
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-400 font-mono w-4">{step.order}</span>
              <span className="text-sm font-medium text-gray-800">{step.content?.en?.title ?? step.id}</span>
              <span className="text-xs text-gray-400 font-mono">{step.id}</span>
            </div>
            <div className="flex gap-3">
              <Link
                to={`/admin/museums/${museumId}/steps/${step.id}/edit`}
                className="text-xs text-blue-600 hover:underline"
              >
                Edit
              </Link>
              <button
                type="button"
                onClick={() => deleteMutation.mutate(step.id)}
                disabled={deleteMutation.isPending}
                className="text-xs text-red-500 hover:underline disabled:opacity-50"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
