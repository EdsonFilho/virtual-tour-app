import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions'
import { requireAdmin } from '../../lib/adminAuth'
import { listStepsByMuseum, upsertStep, deleteStep } from '../../db/adminCosmosClient'

app.http('adminListSteps', {
  methods: ['GET'],
  route: 'mgmt/museums/{museumId}/steps',
  authLevel: 'anonymous',
  handler: async (req: HttpRequest, _context: InvocationContext): Promise<HttpResponseInit> => {
    const deny = requireAdmin(req)
    if (deny) return deny
    const steps = await listStepsByMuseum(req.params.museumId)
    return { status: 200, jsonBody: steps }
  },
})

app.http('adminSaveStep', {
  methods: ['POST'],
  route: 'mgmt/museums/{museumId}/steps',
  authLevel: 'anonymous',
  handler: async (req: HttpRequest, _context: InvocationContext): Promise<HttpResponseInit> => {
    const deny = requireAdmin(req)
    if (deny) return deny
    const body = await req.json() as object
    const result = await upsertStep({ ...body, museumId: req.params.museumId })
    return { status: 200, jsonBody: result }
  },
})

app.http('adminDeleteStep', {
  methods: ['DELETE'],
  route: 'mgmt/steps/{id}',
  authLevel: 'anonymous',
  handler: async (req: HttpRequest, _context: InvocationContext): Promise<HttpResponseInit> => {
    const deny = requireAdmin(req)
    if (deny) return deny
    await deleteStep(req.params.id)
    return { status: 204 }
  },
})
