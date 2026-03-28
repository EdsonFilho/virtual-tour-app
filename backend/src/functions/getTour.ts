import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions'
import { getMuseumBySlug, getTourByMuseumAndType, getStepsByIds } from '../db/cosmosClient'

app.http('getTour', {
  methods: ['GET'],
  route: 'museums/{slug}/tours/{type}',
  authLevel: 'anonymous',
  handler: async (req: HttpRequest, _context: InvocationContext): Promise<HttpResponseInit> => {
    const { slug, type } = req.params

    const museum = await getMuseumBySlug(slug)
    if (!museum) {
      return { status: 404, jsonBody: { error: 'Museum not found' } }
    }

    const tour = await getTourByMuseumAndType(museum.id, type)
    if (!tour) {
      return { status: 404, jsonBody: { error: 'Tour not found' } }
    }

    const steps = await getStepsByIds(tour.stepIds ?? [])

    return {
      status: 200,
      jsonBody: { ...tour, steps },
    }
  },
})
