import type { Museum, Tour, Step, Language } from '@/types'

const BASE = '/api'

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init)
  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${await res.text()}`)
  }
  return res.json() as Promise<T>
}

export function fetchMuseum(slug: string): Promise<Museum> {
  return fetchJson<Museum>(`${BASE}/museums/${slug}`)
}

export function fetchTour(slug: string, type: string): Promise<Tour> {
  return fetchJson<Tour>(`${BASE}/museums/${slug}/tours/${type}`)
}

export function fetchStep(stepId: string, lang: Language): Promise<Step> {
  return fetchJson<Step>(`${BASE}/steps/${stepId}?lang=${lang}`)
}

export async function requestTTS(stepId: string, lang: Language): Promise<string> {
  const res = await fetchJson<{ audioUrl: string }>(`${BASE}/audio/tts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ stepId, lang }),
  })
  return res.audioUrl
}
