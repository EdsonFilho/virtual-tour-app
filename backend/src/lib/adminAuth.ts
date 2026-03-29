import { HttpRequest, HttpResponseInit } from '@azure/functions'

interface ClientPrincipal {
  userId: string
  userDetails: string
  identityProvider: string
}

function parseClientPrincipal(req: HttpRequest): ClientPrincipal | null {
  if (process.env.DEV_ADMIN_BYPASS === 'true') {
    return { userId: 'dev', userDetails: 'dev@localhost', identityProvider: 'dev' }
  }
  const header = req.headers.get('x-ms-client-principal')
  if (!header) return null
  try {
    return JSON.parse(Buffer.from(header, 'base64').toString('utf-8')) as ClientPrincipal
  } catch {
    return null
  }
}

export function requireAdmin(req: HttpRequest): HttpResponseInit | null {
  const principal = parseClientPrincipal(req)
  if (!principal) {
    return { status: 401, jsonBody: { error: 'Unauthorized' } }
  }
  const allowedIds = (process.env.ADMIN_USER_IDS ?? '').split(',').map(s => s.trim()).filter(Boolean)
  if (allowedIds.length === 0) {
    return { status: 403, jsonBody: { error: 'Admin access is not configured' } }
  }
  if (!allowedIds.includes(principal.userId)) {
    return { status: 403, jsonBody: { error: 'Forbidden' } }
  }
  return null
}

export function getAdminUser(req: HttpRequest): ClientPrincipal | null {
  return parseClientPrincipal(req)
}
