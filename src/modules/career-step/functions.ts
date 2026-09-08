import { createServerFn } from '@tanstack/react-start';
import { getRequestHeaders } from '@tanstack/react-start/server';
import { and, desc, eq } from 'drizzle-orm';
import * as v from 'valibot';
import { getAuth } from '@/modules/auth';
import { getDb } from '~/db';
import { careerStep } from '~/db/schema';
import {
  careerStepSchema,
  deleteCareerStepSchema,
  updateCareerStepSchema,
} from './schema';

async function requireUser() {
  const headers = getRequestHeaders();
  const session = await getAuth().api.getSession({ headers });

  if (!session) {
    throw new Error('Unauthorized');
  }

  return session.user;
}

export const listCareerSteps = createServerFn({ method: 'GET' }).handler(
  async () => {
    const user = await requireUser();
    const db = getDb();

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
      .orderBy(desc(careerStep.createdAt));
  },
);

export const getCareerStep = createServerFn({ method: 'GET' })
  .validator((data) =>
    v.parse(v.pipe(v.string(), v.minLength(1, 'Id is required')), data),
  )
  .handler(async ({ data: id }) => {
    const user = await requireUser();
    const db = getDb();

    const [step] = await db
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
      .where(and(eq(careerStep.id, id), eq(careerStep.userId, user.id)))
      .limit(1);

    return step ?? null;
  });

export const createCareerStep = createServerFn({ method: 'POST' })
  .validator((data) => v.parse(careerStepSchema, data))
  .handler(async ({ data }) => {
    const user = await requireUser();
    const db = getDb();
    const id = crypto.randomUUID();
    const createdAt = new Date();

    await db.insert(careerStep).values({
      id,
      userId: user.id,
      position: data.position,
      startedOn: data.dates.from,
      endedOn: data.dates.to || null,
      description: data.description,
      technologies: data.technologies,
      createdAt,
    });

    return {
      id,
      position: data.position,
      startedOn: data.dates.from,
      endedOn: data.dates.to || null,
      description: data.description,
      technologies: data.technologies,
      createdAt,
    };
  });

export const updateCareerStep = createServerFn({ method: 'POST' })
  .validator((data) => v.parse(updateCareerStepSchema, data))
  .handler(async ({ data }) => {
    const user = await requireUser();
    const db = getDb();
    const endedOn = data.dates.to || null;

    const updated = await db
      .update(careerStep)
      .set({
        position: data.position,
        startedOn: data.dates.from,
        endedOn,
        description: data.description,
        technologies: data.technologies,
      })
      .where(and(eq(careerStep.id, data.id), eq(careerStep.userId, user.id)))
      .returning({ id: careerStep.id });

    if (updated.length === 0) {
      throw new Error('Career step not found');
    }

    return {
      id: data.id,
      position: data.position,
      startedOn: data.dates.from,
      endedOn,
      description: data.description,
      technologies: data.technologies,
    };
  });

export const deleteCareerStep = createServerFn({ method: 'POST' })
  .validator((data) => v.parse(deleteCareerStepSchema, data))
  .handler(async ({ data }) => {
    const user = await requireUser();
    const db = getDb();

    const deleted = await db
      .delete(careerStep)
      .where(and(eq(careerStep.id, data.id), eq(careerStep.userId, user.id)))
      .returning({ id: careerStep.id });

    if (deleted.length === 0) {
      throw new Error('Career step not found');
    }

    return { id: data.id };
  });
