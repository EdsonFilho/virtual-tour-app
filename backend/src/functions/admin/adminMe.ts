import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions'
import { requireAdmin, getAdminUser } from '../../lib/adminAuth'

app.http('adminMe', {
  methods: ['GET'],
  route: 'mgmt/me',
  authLevel: 'anonymous',
  handler: async (req: HttpRequest, _context: InvocationContext): Promise<HttpResponseInit> => {
    const deny = requireAdmin(req)
    if (deny) return deny
    const user = getAdminUser(req)!
    return { status: 200, jsonBody: { userId: user.userId, email: user.userDetails } }
  },
})
