import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions'
import { requireAdmin } from '../../lib/adminAuth'
import { listMuseums, upsertMuseum, deleteMuseum } from '../../db/adminCosmosClient'

app.http('adminListMuseums', {
  methods: ['GET'],
  route: 'mgmt/museums',
  authLevel: 'anonymous',
  handler: async (req: HttpRequest, _context: InvocationContext): Promise<HttpResponseInit> => {
    const deny = requireAdmin(req)
    if (deny) return deny
    const museums = await listMuseums()
    return { status: 200, jsonBody: museums }
  },
})

app.http('adminSaveMuseum', {
  methods: ['POST'],
  route: 'mgmt/museums',
  authLevel: 'anonymous',
  handler: async (req: HttpRequest, _context: InvocationContext): Promise<HttpResponseInit> => {
    const deny = requireAdmin(req)
    if (deny) return deny
    const body = await req.json() as object
    const result = await upsertMuseum(body)
    return { status: 200, jsonBody: result }
  },
})

app.http('adminDeleteMuseum', {
  methods: ['DELETE'],
  route: 'mgmt/museums/{id}',
  authLevel: 'anonymous',
  handler: async (req: HttpRequest, _context: InvocationContext): Promise<HttpResponseInit> => {
    const deny = requireAdmin(req)
    if (deny) return deny
    const { id } = req.params
    await deleteMuseum(id)
    return { status: 204 }
  },
})
