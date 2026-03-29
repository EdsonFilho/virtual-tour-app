import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminListTours, adminSaveTour, adminDeleteTour, adminListSteps } from '@/admin/api'
import type { TourWritePayload } from '@/admin/types'

const TOUR_TYPES = ['fast', 'full'] as const

export default function TourFormPage() {
  const { museumId } = useParams<{ museumId: string }>()
  const qc = useQueryClient()
  const [saved, setSaved] = useState<string | null>(null)

  function handleSaved(key: string) {
    setSaved(key)
    setTimeout(() => setSaved(null), 3000)
    qc.invalidateQueries({ queryKey: ['admin', 'tours', museumId] })
  }

  const { data: tours, isLoading: toursLoading } = useQuery({
    queryKey: ['admin', 'tours', museumId],
    queryFn: () => adminListTours(museumId!),
  })

  const { data: steps } = useQuery({
    queryKey: ['admin', 'steps', museumId],
    queryFn: () => adminListSteps(museumId!),
  })

  if (toursLoading) return <p className="text-gray-500">Loading...</p>

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Tours</h1>
      <p className="text-gray-500 text-sm mb-6">{museumId}</p>

      <div className="space-y-6">
        {TOUR_TYPES.map(type => {
          const existing = tours?.find(t => t.type === type)
          return (
            <TourEditor
              key={type}
              museumId={museumId!}
              type={type}
              initial={existing}
              allSteps={steps ?? []}
              savedKey={saved}
              onSaved={handleSaved}
              onDeleted={() => qc.invalidateQueries({ queryKey: ['admin', 'tours', museumId] })}
            />
          )
        })}
      </div>
    </div>
  )
}

function TourEditor({
  museumId, type, initial, allSteps, savedKey, onSaved, onDeleted,
}: {
  museumId: string
  type: string
  initial?: TourWritePayload
  allSteps: { id: string; content?: Record<string, { title?: string }> }[]
  savedKey: string | null
  onSaved: (key: string) => void
  onDeleted: () => void
}) {
  const [form, setForm] = useState<TourWritePayload>(
    initial ?? { id: `${museumId}-${type}`, type: type as 'fast' | 'full', estimatedMinutes: 30, stepIds: [] }
  )

  useEffect(() => {
    if (initial) setForm(initial)
  }, [initial])

  const saveMutation = useMutation({
    mutationFn: (data: TourWritePayload) => adminSaveTour(museumId, data),
    onSuccess: () => onSaved(type),
  })

  const deleteMutation = useMutation({
    mutationFn: () => adminDeleteTour(form.id),
    onSuccess: onDeleted,
  })

  function toggleStep(stepId: string) {
    setForm(f => ({
      ...f,
      stepIds: f.stepIds.includes(stepId)
        ? f.stepIds.filter(s => s !== stepId)
        : [...f.stepIds, stepId],
    }))
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-gray-900 capitalize">{type} Tour</h2>
        {initial && (
          <button
            type="button"
            onClick={() => deleteMutation.mutate()}
            disabled={deleteMutation.isPending}
            className="text-xs text-red-600 hover:underline disabled:opacity-50"
          >
            Delete tour
          </button>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <label className="label">Estimated Minutes</label>
          <input
            type="number"
            value={form.estimatedMinutes}
            onChange={e => setForm(f => ({ ...f, estimatedMinutes: parseInt(e.target.value) }))}
            className="input w-32"
            min={1}
          />
        </div>

        <div>
          <label className="label">Steps (check to include, order = step order)</label>
          {allSteps.length === 0 && <p className="text-sm text-gray-400">No steps yet. Create steps first.</p>}
          <div className="space-y-1 mt-1">
            {allSteps.map(step => (
              <label key={step.id} className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.stepIds.includes(step.id)}
                  onChange={() => toggleStep(step.id)}
                />
                <span className="font-mono text-xs text-gray-500">{step.id}</span>
                <span className="text-gray-700">{step.content?.en?.title ?? ''}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => saveMutation.mutate(form)}
            disabled={saveMutation.isPending}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {saveMutation.isPending ? 'Saving...' : 'Save'}
          </button>
          {savedKey === type && (
            <span className="px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
              Tour saved successfully.
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
