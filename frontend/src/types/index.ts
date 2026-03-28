export type Language = string // e.g. 'en', 'pt', 'es'
export type TourType = 'fast' | 'full'
export type StepType = 'artwork' | 'directions'

export interface Museum {
  id: string
  slug: string
  name: Record<Language, string>
  languages: Language[]
  location: string
  heroImageUrl: string
  tours: TourSummary[]
}

export interface TourSummary {
  type: TourType
  estimatedMinutes: number
}

export interface Tour {
  id: string
  museumId: string
  type: TourType
  estimatedMinutes: number
  steps: Step[]
}

export interface StepContent {
  title: string
  description: string
  audioUrl: string | null // null = needs TTS
}

export interface Step {
  id: string
  museumId: string
  type: StepType
  order: number
  imageUrls: string[]
  content: Record<Language, StepContent>
}
