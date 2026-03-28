import { getContainer } from './cosmosClient'

// ── Museums ───────────────────────────────────────────────────────────────────

export async function listMuseums() {
  const { resources } = await getContainer('museums').items
    .query('SELECT * FROM c')
    .fetchAll()
  return resources
}

export async function upsertMuseum(doc: object) {
  const { resource } = await getContainer('museums').items.upsert(doc)
  return resource
}

export async function deleteMuseum(id: string) {
  await getContainer('museums').item(id, id).delete()
}

// ── Tours ─────────────────────────────────────────────────────────────────────

export async function listToursByMuseum(museumId: string) {
  const { resources } = await getContainer('tours').items
    .query({
      query: 'SELECT * FROM c WHERE c.museumId = @museumId',
      parameters: [{ name: '@museumId', value: museumId }],
    })
    .fetchAll()
  return resources
}

export async function upsertTour(doc: object) {
  const { resource } = await getContainer('tours').items.upsert(doc)
  return resource
}

export async function deleteTour(id: string) {
  await getContainer('tours').item(id, id).delete()
}

// ── Steps ─────────────────────────────────────────────────────────────────────

export async function listStepsByMuseum(museumId: string) {
  const { resources } = await getContainer('steps').items
    .query({
      query: 'SELECT * FROM c WHERE c.museumId = @museumId ORDER BY c.order',
      parameters: [{ name: '@museumId', value: museumId }],
    })
    .fetchAll()
  return resources
}

export async function upsertStep(doc: object) {
  const { resource } = await getContainer('steps').items.upsert(doc)
  return resource
}

export async function deleteStep(id: string) {
  await getContainer('steps').item(id, id).delete()
}
