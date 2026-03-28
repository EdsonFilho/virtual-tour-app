import { useQuery } from '@tanstack/react-query'
import { fetchMuseum, fetchTour } from '@/api'
import type { TourType } from '@/types'

export function useMuseum(slug: string) {
  return useQuery({
    queryKey: ['museum', slug],
    queryFn: () => fetchMuseum(slug),
    enabled: !!slug,
  })
}

export function useTour(slug: string, type: TourType | string) {
  return useQuery({
    queryKey: ['tour', slug, type],
    queryFn: () => fetchTour(slug, type),
    enabled: !!slug && !!type,
  })
}
