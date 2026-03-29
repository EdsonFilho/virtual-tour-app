import { CosmosClient, Container } from '@azure/cosmos'

const client = new CosmosClient(process.env.COSMOS_CONNECTION_STRING!)
const db = client.database(process.env.COSMOS_DATABASE_NAME ?? 'virtual-tour')

export function getContainer(name: string): Container {
  return db.container(name)
}

export async function getMuseumBySlug(slug: string) {
  const container = getContainer('museums')
  const { resources } = await container.items
    .query({ query: 'SELECT * FROM c WHERE c.slug = @slug', parameters: [{ name: '@slug', value: slug }] })
    .fetchAll()
  return resources[0] ?? null
}

export async function getTourByMuseumAndType(museumId: string, type: string) {
  const container = getContainer('tours')
  const { resources } = await container.items
    .query({
      query: 'SELECT * FROM c WHERE c.museumId = @museumId AND c.type = @type',
      parameters: [
        { name: '@museumId', value: museumId },
        { name: '@type', value: type },
      ],
    })
    .fetchAll()
  return resources[0] ?? null
}

export async function getStepById(stepId: string) {
  const container = getContainer('steps')
  const { resource } = await container.item(stepId, stepId).read()
  return resource ?? null
}

export async function updateStepAudioUrl(stepId: string, lang: string, audioUrl: string) {
  const container = getContainer('steps')
  const { resource: step } = await container.item(stepId, stepId).read()
  if (!step) return
  step.content = step.content ?? {}
  step.content[lang] = { ...step.content[lang], audioUrl }
  await container.items.upsert(step)
}

export async function getStepsByIds(stepIds: string[]) {
  if (stepIds.length === 0) return []
  const container = getContainer('steps')
  const query = `SELECT * FROM c WHERE ARRAY_CONTAINS(@ids, c.id)`
  const { resources } = await container.items
    .query({ query, parameters: [{ name: '@ids', value: stepIds }] })
    .fetchAll()
  // Preserve order from stepIds
  const map = new Map(resources.map((s: { id: string }) => [s.id, s]))
  return stepIds.map((id) => map.get(id)).filter(Boolean)
}
