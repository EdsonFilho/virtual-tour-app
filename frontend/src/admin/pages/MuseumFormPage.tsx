import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminListMuseums, adminSaveMuseum } from '@/admin/api'
import MediaUpload from '@/admin/components/MediaUpload'
import type { MuseumWritePayload } from '@/admin/types'

const ALL_LANGUAGES = ['en', 'pt', 'es', 'uk', 'ja']

const empty: MuseumWritePayload = {
  id: '', slug: '', name: {}, languages: ['en'], location: '', heroImageUrl: '',
}

export default function MuseumFormPage() {
  const { museumId } = useParams<{ museumId: string }>()
  const isEdit = !!museumId
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [form, setForm] = useState<MuseumWritePayload>(empty)
  const [error, setError] = useState<string | null>(null)

  const { data: museums } = useQuery({
    queryKey: ['admin', 'museums'],
    queryFn: adminListMuseums,
    enabled: isEdit,
  })

  useEffect(() => {
    if (isEdit && museums) {
      const existing = museums.find(m => m.id === museumId)
      if (existing) setForm(existing)
    }
  }, [isEdit, museums, museumId])

  const saveMutation = useMutation({
    mutationFn: adminSaveMuseum,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'museums'] })
      navigate('/admin')
    },
    onError: () => setError('Failed to save museum. Please try again.'),
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.id || !form.slug) { setError('ID and slug are required.'); return }
    saveMutation.mutate({ ...form, id: form.slug })
  }

  function setName(lang: string, value: string) {
    setForm(f => ({ ...f, name: { ...f.name, [lang]: value } }))
  }

  function toggleLanguage(lang: string) {
    setForm(f => ({
      ...f,
      languages: f.languages.includes(lang)
        ? f.languages.filter(l => l !== lang)
        : [...f.languages, lang],
    }))
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        {isEdit ? 'Edit Museum' : 'New Museum'}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Field label="Slug (URL identifier)">
          <input
            type="text"
            value={form.slug}
            onChange={e => setForm(f => ({ ...f, slug: e.target.value, id: e.target.value }))}
            disabled={isEdit}
            placeholder="e.g. mam-sp"
            className="input"
          />
        </Field>

        <Field label="Location">
          <input
            type="text"
            value={form.location}
            onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
            placeholder="e.g. São Paulo, Brazil"
            className="input"
          />
        </Field>

        <Field label="Languages">
          <div className="flex gap-2 flex-wrap">
            {ALL_LANGUAGES.map(lang => (
              <button
                key={lang}
                type="button"
                onClick={() => toggleLanguage(lang)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium border ${form.languages.includes(lang)
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
              >
                {lang.toUpperCase()}
              </button>
            ))}
          </div>
        </Field>

        <Field label="Museum Name (per language)">
          <div className="space-y-2">
            {form.languages.map(lang => (
              <div key={lang} className="flex items-center gap-2">
                <span className="text-xs font-mono text-gray-500 w-6">{lang}</span>
                <input
                  type="text"
                  value={form.name[lang] ?? ''}
                  onChange={e => setName(lang, e.target.value)}
                  placeholder={`Name in ${lang}`}
                  className="input flex-1"
                />
              </div>
            ))}
          </div>
        </Field>

        <Field label="Hero Image">
          <MediaUpload
            museumId={form.slug || 'new'}
            type="image"
            currentUrl={form.heroImageUrl}
            onUploaded={url => setForm(f => ({ ...f, heroImageUrl: url }))}
          />
        </Field>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={saveMutation.isPending}
            className="px-5 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {saveMutation.isPending ? 'Saving...' : 'Save Museum'}
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
    </div>
  )
}
