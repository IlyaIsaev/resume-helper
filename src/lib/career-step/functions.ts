import { createServerFn } from '@tanstack/react-start'
import { getRequestHeaders } from '@tanstack/react-start/server'
import { desc, eq } from 'drizzle-orm'
import * as v from 'valibot'
import { getDb } from '~/db'
import { careerStep } from '~/db/schema'
import { getAuth } from '~/lib/auth'
import { careerStepSchema } from './schema'

async function requireUser() {
  const headers = getRequestHeaders()
  const session = await getAuth().api.getSession({ headers })

  if (!session) {
    throw new Error('Unauthorized')
  }

  return session.user
}

export const listCareerSteps = createServerFn({ method: 'GET' }).handler(
  async () => {
    const user = await requireUser()
    const db = getDb()

    return db
      .select({
        id: careerStep.id,
        position: careerStep.position,
        startedOn: careerStep.startedOn,
        endedOn: careerStep.endedOn,
        description: careerStep.description,
        technologies: careerStep.technologies,
        createdAt: careerStep.createdAt,
      })
      .from(careerStep)
      .where(eq(careerStep.userId, user.id))
      .orderBy(desc(careerStep.createdAt))
  },
)

export const createCareerStep = createServerFn({ method: 'POST' })
  .validator((data) => v.parse(careerStepSchema, data))
  .handler(async ({ data }) => {
    const user = await requireUser()
    const db = getDb()
    const id = crypto.randomUUID()
    const createdAt = new Date()

    await db.insert(careerStep).values({
      id,
      userId: user.id,
      position: data.position,
      startedOn: data.dates.from,
      endedOn: data.dates.to || null,
      description: data.description,
      technologies: data.technologies,
      createdAt,
    })

    return {
      id,
      position: data.position,
      startedOn: data.dates.from,
      endedOn: data.dates.to || null,
      description: data.description,
      technologies: data.technologies,
      createdAt,
    }
  })
