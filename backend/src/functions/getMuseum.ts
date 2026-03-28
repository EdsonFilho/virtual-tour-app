import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions'
import { getMuseumBySlug, getTourByMuseumAndType } from '../db/cosmosClient'

app.http('getMuseum', {
  methods: ['GET'],
  route: 'museums/{slug}',
  authLevel: 'anonymous',
  handler: async (req: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    const slug = req.params.slug

    const museum = await getMuseumBySlug(slug)
    if (!museum) {
      return { status: 404, jsonBody: { error: 'Museum not found' } }
    }

    // Fetch available tours to return summaries
    const tourTypes = ['fast', 'full']
    const tourSummaries = []
    for (const type of tourTypes) {
      const tour = await getTourByMuseumAndType(museum.id, type)
      if (tour) {
        tourSummaries.push({ type: tour.type, estimatedMinutes: tour.estimatedMinutes })
      }
    }

    return {
      status: 200,
      jsonBody: { ...museum, tours: tourSummaries },
    }
  },
})
