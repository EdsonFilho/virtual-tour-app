import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link, useLocation } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminListSteps, adminSaveStep, adminDeleteStep } from '@/admin/api'
import MediaUpload from '@/admin/components/MediaUpload'
import type { StepWritePayload } from '@/admin/types'

const empty = (museumId: string): StepWritePayload => ({
  id: '', type: 'artwork', order: 1, imageUrls: [], museumId,
  content: { en: { title: '', description: '', audioUrl: null } },
} as StepWritePayload & { museumId: string })

export default function StepFormPage() {
  const { museumId, stepId } = useParams<{ museumId: string; stepId: string }>()
  const isEdit = !!stepId
  const navigate = useNavigate()
  const location = useLocation()
  const justSaved = location.state?.saved === true
  const qc = useQueryClient()
  const [form, setForm] = useState<StepWritePayload>(empty(museumId!))
  const [error, setError] = useState<string | null>(null)

  const { data: steps } = useQuery({
    queryKey: ['admin', 'steps', museumId],
    queryFn: () => adminListSteps(museumId!),
    enabled: isEdit,
  })

  useEffect(() => {
    if (isEdit && steps) {
      const existing = steps.find(s => s.id === stepId)
      if (existing) setForm(existing)
    }
  }, [isEdit, steps, stepId])

  const saveMutation = useMutation({
    mutationFn: (data: StepWritePayload) => adminSaveStep(museumId!, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'steps', museumId] })
      navigate(`/admin/museums/${museumId}/steps/new`, { state: { saved: true } })
    },
    onError: () => setError('Failed to save step.'),
  })

  const languages = Object.keys(form.content)

  function setContent(lang: string, field: string, value: string | null) {
    setForm(f => ({
      ...f,
      content: { ...f.content, [lang]: { ...f.content[lang], [field]: value } },
    }))
  }

  function addLanguage(lang: string) {
    if (form.content[lang]) return
    setForm(f => ({
      ...f,
      content: { ...f.content, [lang]: { title: '', description: '', audioUrl: null } },
    }))
  }

  function addImageUrl(url: string) {
    setForm(f => ({ ...f, imageUrls: [...f.imageUrls, url] }))
  }

  function removeImageUrl(idx: number) {
    setForm(f => ({ ...f, imageUrls: f.imageUrls.filter((_, i) => i !== idx) }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.id) { setError('Step ID is required.'); return }
    saveMutation.mutate(form)
  }

  const deleteMutation = useMutation({
    mutationFn: adminDeleteStep,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'steps', museumId] }),
  })

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Steps</h1>
      <p className="text-gray-500 text-sm mb-4">{museumId}</p>

      {justSaved && (
        <div className="mb-6 px-4 py-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
          Step saved successfully.
        </div>
      )}

      {steps && steps.length > 0 && (
        <div className="mb-8">
          <div className="space-y-1">
            {steps.map(step => (
              <div key={step.id} className="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-4 py-2.5">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-400 font-mono w-4">{step.order}</span>
                  <span className="text-sm font-medium text-gray-800">{step.content?.en?.title ?? step.id}</span>
                  <span className="text-xs text-gray-400 font-mono">{step.id}</span>
                </div>
                <div className="flex gap-2">
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
      )}

      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        {isEdit ? 'Edit Step' : 'New Step'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="label">Step ID</label>
            <input
              type="text"
              value={form.id}
              onChange={e => setForm(f => ({ ...f, id: e.target.value }))}
              disabled={isEdit}
              placeholder="step-001"
              className="input"
            />
          </div>
          <div>
            <label className="label">Type</label>
            <select
              value={form.type}
              onChange={e => setForm(f => ({ ...f, type: e.target.value as 'artwork' | 'directions' }))}
              className="input"
            >
              <option value="artwork">Artwork</option>
              <option value="directions">Directions</option>
            </select>
          </div>
          <div>
            <label className="label">Order</label>
            <input
              type="number"
              value={form.order}
              onChange={e => setForm(f => ({ ...f, order: parseInt(e.target.value) }))}
              className="input"
              min={1}
            />
          </div>
        </div>

        <div>
          <label className="label">Images</label>
          <div className="space-y-2">
            {form.imageUrls.map((url, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <img src={url} alt="" className="h-10 w-14 object-cover rounded" />
                <span className="text-xs text-gray-500 truncate flex-1">{url}</span>
                <button type="button" onClick={() => removeImageUrl(idx)} className="text-red-500 text-xs">Remove</button>
              </div>
            ))}
            <MediaUpload
              museumId={museumId!}
              type="image"
              onUploaded={addImageUrl}
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="label mb-0">Content</label>
            <select
              onChange={e => { if (e.target.value) addLanguage(e.target.value) }}
              defaultValue=""
              className="text-sm border border-gray-300 rounded px-2 py-1"
            >
              <option value="">+ Add language</option>
              {['en', 'pt', 'es', 'uk', 'ja'].filter(l => !form.content[l]).map(l => (
                <option key={l} value={l}>{l.toUpperCase()}</option>
              ))}
            </select>
          </div>

          <div className="space-y-4">
            {languages.map(lang => (
              <div key={lang} className="border border-gray-200 rounded-lg p-4">
                <p className="text-xs font-mono font-bold text-gray-500 mb-3">{lang.toUpperCase()}</p>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={form.content[lang]?.title ?? ''}
                    onChange={e => setContent(lang, 'title', e.target.value)}
                    placeholder="Title"
                    className="input"
                  />
                  <textarea
                    value={form.content[lang]?.description ?? ''}
                    onChange={e => setContent(lang, 'description', e.target.value)}
                    placeholder="Description"
                    rows={3}
                    className="input"
                  />
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Audio (leave empty to use TTS)</p>
                    <MediaUpload
                      museumId={museumId!}
                      type="audio"
                      currentUrl={form.content[lang]?.audioUrl}
                      onUploaded={url => setContent(lang, 'audioUrl', url)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={saveMutation.isPending}
            className="px-5 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {saveMutation.isPending ? 'Saving...' : 'Save Step'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin')}
            className="px-5 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
