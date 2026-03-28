/**
 * Development seed script — populates Cosmos DB with one test museum.
 * Run: npx ts-node src/seed/seedData.ts
 */
import { CosmosClient } from '@azure/cosmos'
import * as dotenv from 'dotenv'
dotenv.config()

const client = new CosmosClient(process.env.COSMOS_CONNECTION_STRING!)
const db = client.database(process.env.COSMOS_DATABASE_NAME ?? 'virtual-tour')

async function seed() {
  console.log('Seeding database...')

  // Museum
  await db.container('museums').items.upsert({
    id: 'test-museum',
    slug: 'test-museum',
    name: { en: 'Test Museum', pt: 'Museu de Teste', es: 'Museo de Prueba' },
    languages: ['en', 'pt', 'es'],
    location: 'São Paulo, Brazil',
    heroImageUrl: 'https://placehold.co/800x400/2d2d2d/ffffff?text=Test+Museum',
  })

  // Steps
  const steps = [
    {
      id: 'step-001',
      museumId: 'test-museum',
      type: 'artwork',
      order: 1,
      imageUrls: ['https://placehold.co/600x400/4a4a4a/ffffff?text=Artwork+1'],
      content: {
        en: {
          title: 'The First Artwork',
          description: 'This is a description of the first artwork. It was created in the early 20th century and represents the beginning of modern art in the region.',
          audioUrl: null,
        },
        pt: {
          title: 'A Primeira Obra',
          description: 'Esta é uma descrição da primeira obra. Foi criada no início do século XX e representa o início da arte moderna na região.',
          audioUrl: null,
        },
        es: {
          title: 'La Primera Obra',
          description: 'Esta es una descripción de la primera obra. Fue creada a principios del siglo XX y representa el comienzo del arte moderno en la región.',
          audioUrl: null,
        },
      },
    },
    {
      id: 'step-002',
      museumId: 'test-museum',
      type: 'directions',
      order: 2,
      imageUrls: [],
      content: {
        en: {
          title: 'Walk to the next room',
          description: 'Turn right at the end of this gallery and follow the corridor to Room 2.',
          audioUrl: null,
        },
        pt: {
          title: 'Vá para a próxima sala',
          description: 'Vire à direita no final desta galeria e siga pelo corredor até a Sala 2.',
          audioUrl: null,
        },
        es: {
          title: 'Camina a la siguiente sala',
          description: 'Gira a la derecha al final de esta galería y sigue el pasillo hasta la Sala 2.',
          audioUrl: null,
        },
      },
    },
    {
      id: 'step-003',
      museumId: 'test-museum',
      type: 'artwork',
      order: 3,
      imageUrls: ['https://placehold.co/600x400/6a6a6a/ffffff?text=Artwork+2'],
      content: {
        en: {
          title: 'The Second Artwork',
          description: 'This striking piece from the 1950s explores themes of identity and transformation through bold colors and abstract forms.',
          audioUrl: null,
        },
        pt: {
          title: 'A Segunda Obra',
          description: 'Esta peça marcante dos anos 1950 explora temas de identidade e transformação por meio de cores vibrantes e formas abstratas.',
          audioUrl: null,
        },
        es: {
          title: 'La Segunda Obra',
          description: 'Esta llamativa pieza de los años 1950 explora temas de identidad y transformación a través de colores audaces y formas abstractas.',
          audioUrl: null,
        },
      },
    },
  ]

  for (const step of steps) {
    await db.container('steps').items.upsert(step)
  }

  // Tours
  await db.container('tours').items.upsert({
    id: 'test-museum-fast',
    museumId: 'test-museum',
    type: 'fast',
    estimatedMinutes: 15,
    stepIds: ['step-001', 'step-003'], // skips directions step
  })

  await db.container('tours').items.upsert({
    id: 'test-museum-full',
    museumId: 'test-museum',
    type: 'full',
    estimatedMinutes: 30,
    stepIds: ['step-001', 'step-002', 'step-003'],
  })

  console.log('Seed complete.')
}

seed().catch(console.error)
