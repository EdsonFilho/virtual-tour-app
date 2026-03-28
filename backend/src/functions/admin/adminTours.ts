import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions'
import { requireAdmin } from '../../lib/adminAuth'
import { listToursByMuseum, upsertTour, deleteTour } from '../../db/adminCosmosClient'

app.http('adminListTours', {
  methods: ['GET'],
  route: 'mgmt/museums/{museumId}/tours',
  authLevel: 'anonymous',
  handler: async (req: HttpRequest, _context: InvocationContext): Promise<HttpResponseInit> => {
    const deny = requireAdmin(req)
    if (deny) return deny
    const tours = await listToursByMuseum(req.params.museumId)
    return { status: 200, jsonBody: tours }
  },
})

app.http('adminSaveTour', {
  methods: ['POST'],
  route: 'mgmt/museums/{museumId}/tours',
  authLevel: 'anonymous',
  handler: async (req: HttpRequest, _context: InvocationContext): Promise<HttpResponseInit> => {
    const deny = requireAdmin(req)
    if (deny) return deny
    const body = await req.json() as object
    const result = await upsertTour({ ...body, museumId: req.params.museumId })
    return { status: 200, jsonBody: result }
  },
})

app.http('adminDeleteTour', {
  methods: ['DELETE'],
  route: 'mgmt/tours/{id}',
  authLevel: 'anonymous',
  handler: async (req: HttpRequest, _context: InvocationContext): Promise<HttpResponseInit> => {
    const deny = requireAdmin(req)
    if (deny) return deny
    await deleteTour(req.params.id)
    return { status: 204 }
  },
})
