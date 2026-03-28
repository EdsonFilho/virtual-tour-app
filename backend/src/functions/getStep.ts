import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions'
import { getStepById } from '../db/cosmosClient'

app.http('getStep', {
  methods: ['GET'],
  route: 'steps/{stepId}',
  authLevel: 'anonymous',
  handler: async (req: HttpRequest, _context: InvocationContext): Promise<HttpResponseInit> => {
    const { stepId } = req.params
    const lang = req.query.get('lang') ?? 'en'

    const step = await getStepById(stepId)
    if (!step) {
      return { status: 404, jsonBody: { error: 'Step not found' } }
    }

    // Return only the requested language content
    const content = step.content?.[lang] ?? step.content?.[Object.keys(step.content)[0]] ?? null

    return {
      status: 200,
      jsonBody: { ...step, resolvedContent: content },
    }
  },
})
