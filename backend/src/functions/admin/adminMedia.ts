import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions'
import { requireAdmin } from '../../lib/adminAuth'
import { uploadBuffer, buildCdnUrl } from '../../storage/blobClient'
import { deleteBlob } from '../../storage/adminBlobClient'
import Busboy from 'busboy'
import { randomUUID } from 'crypto'

app.http('adminUploadMedia', {
  methods: ['POST'],
  route: 'mgmt/media/upload',
  authLevel: 'anonymous',
  handler: async (req: HttpRequest, _context: InvocationContext): Promise<HttpResponseInit> => {
    const deny = requireAdmin(req)
    if (deny) return deny

    const contentType = req.headers.get('content-type') ?? ''
    if (!contentType.includes('multipart/form-data')) {
      return { status: 400, jsonBody: { error: 'Expected multipart/form-data' } }
    }

    const { museumId, type, buffer, filename, mimeType } = await parseMultipart(req, contentType)

    if (!museumId || !type || !buffer || !filename) {
      return { status: 400, jsonBody: { error: 'museumId, type, and file are required' } }
    }

    const ext = filename.split('.').pop() ?? 'bin'
    const blobPath = `${museumId}/${type}s/${randomUUID()}-${filename}`
    const cdnUrl = await uploadBuffer(blobPath, buffer, mimeType ?? 'application/octet-stream')

    return { status: 200, jsonBody: { cdnUrl, blobPath } }
  },
})

app.http('adminDeleteMedia', {
  methods: ['DELETE'],
  route: 'mgmt/media',
  authLevel: 'anonymous',
  handler: async (req: HttpRequest, _context: InvocationContext): Promise<HttpResponseInit> => {
    const deny = requireAdmin(req)
    if (deny) return deny
    const { blobPath } = await req.json() as { blobPath?: string }
    if (!blobPath) return { status: 400, jsonBody: { error: 'blobPath is required' } }
    await deleteBlob(blobPath)
    return { status: 204 }
  },
})

function parseMultipart(req: HttpRequest, contentType: string): Promise<{
  museumId?: string
  type?: string
  buffer?: Buffer
  filename?: string
  mimeType?: string
}> {
  return new Promise((resolve, reject) => {
    const busboy = Busboy({ headers: { 'content-type': contentType } })
    const fields: Record<string, string> = {}
    let buffer: Buffer | undefined
    let filename: string | undefined
    let mimeType: string | undefined

    busboy.on('field', (name, value) => { fields[name] = value })
    busboy.on('file', (_field, stream, info) => {
      filename = info.filename
      mimeType = info.mimeType
      const chunks: Buffer[] = []
      stream.on('data', (chunk: Buffer) => chunks.push(chunk))
      stream.on('end', () => { buffer = Buffer.concat(chunks) })
    })
    busboy.on('finish', () => resolve({ ...fields, buffer, filename, mimeType }))
    busboy.on('error', reject)

    req.arrayBuffer().then(ab => busboy.write(Buffer.from(ab)))
  })
}
