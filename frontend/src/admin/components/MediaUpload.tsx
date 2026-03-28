import { useRef, useState } from 'react'
import { adminUploadMedia } from '@/admin/api'

interface Props {
  museumId: string
  type: 'image' | 'audio'
  currentUrl?: string | null
  onUploaded: (cdnUrl: string) => void
}

export default function MediaUpload({ museumId, type, currentUrl, onUploaded }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleFile(file: File) {
    setUploading(true)
    setError(null)
    try {
      const { cdnUrl } = await adminUploadMedia(museumId, type, file)
      onUploaded(cdnUrl)
    } catch (e) {
      setError('Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-2">
      {currentUrl && type === 'image' && (
        <img src={currentUrl} alt="Current" className="h-24 rounded object-cover" />
      )}
      {currentUrl && type === 'audio' && (
        <audio controls src={currentUrl} className="w-full" />
      )}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
        >
          {uploading ? 'Uploading...' : `Upload ${type}`}
        </button>
        {currentUrl && (
          <span className="text-xs text-gray-500 truncate max-w-xs">{currentUrl}</span>
        )}
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
      <input
        ref={inputRef}
        type="file"
        accept={type === 'image' ? 'image/*' : 'audio/*'}
        className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
      />
    </div>
  )
}
