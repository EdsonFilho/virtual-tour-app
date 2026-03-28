import { getContainerClient } from './blobClient'

export async function deleteBlob(blobPath: string): Promise<void> {
  await getContainerClient().getBlockBlobClient(blobPath).delete()
}

export async function listBlobsByPrefix(prefix: string): Promise<string[]> {
  const paths: string[] = []
  for await (const blob of getContainerClient().listBlobsFlat({ prefix })) {
    paths.push(blob.name)
  }
  return paths
}
