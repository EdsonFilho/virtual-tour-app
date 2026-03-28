import { BlobServiceClient } from '@azure/storage-blob'

const blobServiceClient = BlobServiceClient.fromConnectionString(
  process.env.BLOB_CONNECTION_STRING!,
)
const containerName = process.env.BLOB_CONTAINER_NAME ?? 'media'

export function getContainerClient() {
  return blobServiceClient.getContainerClient(containerName)
}

export function buildCdnUrl(blobPath: string): string {
  const base = (process.env.CDN_BASE_URL ?? '').replace(/\/$/, '')
  return `${base}/${blobPath}`
}

export async function blobExists(blobPath: string): Promise<boolean> {
  const container = getContainerClient()
  const blockBlob = container.getBlockBlobClient(blobPath)
  return blockBlob.exists()
}

export async function uploadBuffer(
  blobPath: string,
  buffer: Buffer,
  contentType: string,
): Promise<string> {
  const container = getContainerClient()
  const blockBlob = container.getBlockBlobClient(blobPath)
  await blockBlob.uploadData(buffer, {
    blobHTTPHeaders: { blobContentType: contentType },
  })
  return buildCdnUrl(blobPath)
}
