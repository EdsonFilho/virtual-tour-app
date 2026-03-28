import type { MuseumWritePayload, TourWritePayload, StepWritePayload, AdminUser } from './types'

const BASE = '/api/mgmt'

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init)
  if (!res.ok) throw new Error(`API error ${res.status}: ${await res.text()}`)
  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

export function adminGetMe(): Promise<AdminUser> {
  return fetchJson<AdminUser>(`${BASE}/me`)
}

// Museums
export function adminListMuseums(): Promise<MuseumWritePayload[]> {
  return fetchJson<MuseumWritePayload[]>(`${BASE}/museums`)
}
export function adminSaveMuseum(data: MuseumWritePayload): Promise<MuseumWritePayload> {
  return fetchJson<MuseumWritePayload>(`${BASE}/museums`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
}
export function adminDeleteMuseum(id: string): Promise<void> {
  return fetchJson<void>(`${BASE}/museums/${id}`, { method: 'DELETE' })
}

// Tours
export function adminListTours(museumId: string): Promise<TourWritePayload[]> {
  return fetchJson<TourWritePayload[]>(`${BASE}/museums/${museumId}/tours`)
}
export function adminSaveTour(museumId: string, data: TourWritePayload): Promise<TourWritePayload> {
  return fetchJson<TourWritePayload>(`${BASE}/museums/${museumId}/tours`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
}
export function adminDeleteTour(id: string): Promise<void> {
  return fetchJson<void>(`${BASE}/tours/${id}`, { method: 'DELETE' })
}

// Steps
export function adminListSteps(museumId: string): Promise<StepWritePayload[]> {
  return fetchJson<StepWritePayload[]>(`${BASE}/museums/${museumId}/steps`)
}
export function adminSaveStep(museumId: string, data: StepWritePayload): Promise<StepWritePayload> {
  return fetchJson<StepWritePayload>(`${BASE}/museums/${museumId}/steps`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
}
export function adminDeleteStep(id: string): Promise<void> {
  return fetchJson<void>(`${BASE}/steps/${id}`, { method: 'DELETE' })
}

// Media
export function adminUploadMedia(museumId: string, type: 'image' | 'audio', file: File): Promise<{ cdnUrl: string; blobPath: string }> {
  const form = new FormData()
  form.append('museumId', museumId)
  form.append('type', type)
  form.append('file', file)
  return fetchJson<{ cdnUrl: string; blobPath: string }>(`${BASE}/media/upload`, {
    method: 'POST',
    body: form,
  })
}
export function adminDeleteMedia(blobPath: string): Promise<void> {
  return fetchJson<void>(`${BASE}/media`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ blobPath }),
  })
}
