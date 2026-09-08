import { createServerFn, createServerOnlyFn } from '@tanstack/react-start';
import { getRequestHeaders } from '@tanstack/react-start/server';
import { and, asc, desc, eq, gt, isNull, lt, or, sql } from 'drizzle-orm';
import * as v from 'valibot';
import { getAuth } from '@/modules/auth/index.server';
import { getDb } from '~/db';
import { careerStep } from '~/db/schema';
import {
  type CareerStepListCursor,
  type CareerStepSort,
  careerStepListInputSchema,
  careerStepSearchNeedle,
  matchesPresentLabel,
} from './list-query';
import {
  deleteCareerStepSchema,
  toCareerStep,
  updateCareerStepSchema,
} from './schema';

const requireUser = createServerOnlyFn(async () => {
  const headers = getRequestHeaders();
  const session = await getAuth().api.getSession({ headers });

  if (!session) {
    throw new Error('Unauthorized');
  }

  return session.user;
});

const careerStepListSelect = {
  id: careerStep.id,
  position: careerStep.position,
  startedOn: careerStep.startedOn,
  endedOn: careerStep.endedOn,
  description: careerStep.description,
  technologies: careerStep.technologies,
  createdAt: careerStep.createdAt,
};

function careerStepSearchCondition(needle: string) {
  const fieldMatch = or(
    sql`instr(lower(${careerStep.position}), ${needle}) > 0`,
    sql`instr(lower(${careerStep.description}), ${needle}) > 0`,
    sql`instr(lower(${careerStep.technologies}), ${needle}) > 0`,
    sql`instr(lower(${careerStep.startedOn}), ${needle}) > 0`,
    sql`instr(lower(coalesce(${careerStep.endedOn}, '')), ${needle}) > 0`,
    sql`instr(lower(${careerStep.id}), ${needle}) > 0`,
  );

  if (matchesPresentLabel(needle)) {
    return or(fieldMatch, isNull(careerStep.endedOn));
  }

  return fieldMatch;
}

function careerStepCursorCondition(
  sort: CareerStepSort,
  cursor: CareerStepListCursor,
) {
  const createdAt = new Date(cursor.createdAt);
  const startedOnCmp =
    sort === 'startedOn-asc'
      ? gt(careerStep.startedOn, cursor.startedOn)
      : lt(careerStep.startedOn, cursor.startedOn);

  return or(
    startedOnCmp,
    and(
      eq(careerStep.startedOn, cursor.startedOn),
      lt(careerStep.createdAt, createdAt),
    ),
    and(
      eq(careerStep.startedOn, cursor.startedOn),
      eq(careerStep.createdAt, createdAt),
      gt(careerStep.id, cursor.id),
    ),
  );
}

function toListCursor(step: {
  startedOn: string;
  createdAt: Date | string;
  id: string;
}): CareerStepListCursor {
  return {
    startedOn: step.startedOn,
    createdAt:
      step.createdAt instanceof Date
        ? step.createdAt.toISOString()
        : step.createdAt,
    id: step.id,
  };
}

export const listCareerSteps = createServerFn({ method: 'GET' })
  .validator((data) => v.parse(careerStepListInputSchema, data ?? {}))
  .handler(async ({ data }) => {
    const user = await requireUser();
    const db = getDb();
    const needle = careerStepSearchNeedle(data.query);
    const filters = [eq(careerStep.userId, user.id)];

    if (needle) {
      const search = careerStepSearchCondition(needle);
      if (search) filters.push(search);
    }

    if (data.cursor) {
      const cursor = careerStepCursorCondition(data.sort, data.cursor);
      if (cursor) filters.push(cursor);
    }

    const orderBy =
      data.sort === 'startedOn-asc'
        ? [
            asc(careerStep.startedOn),
            desc(careerStep.createdAt),
            asc(careerStep.id),
          ]
        : [
            desc(careerStep.startedOn),
            desc(careerStep.createdAt),
            asc(careerStep.id),
          ];

    const rows = await db
      .select(careerStepListSelect)
      .from(careerStep)
      .where(and(...filters))
      .orderBy(...orderBy)
      .limit(data.limit + 1);

    const hasMore = rows.length > data.limit;
    const page = hasMore ? rows.slice(0, data.limit) : rows;
    const last = page[page.length - 1];

    return {
      items: page,
      nextCursor: hasMore && last ? toListCursor(last) : null,
    };
  });

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

    return step ? toCareerStep(step) : null;
  });

export const createCareerStep = createServerFn({ method: 'POST' })
  .validator((data) => v.parse(updateCareerStepSchema, data))
  .handler(async ({ data }) => {
    const user = await requireUser();
    const db = getDb();
    const createdAt = new Date();

    await db.insert(careerStep).values({
      id: data.id,
      userId: user.id,
      position: data.position,
      startedOn: data.dates.from,
      endedOn: data.dates.to || null,
      description: data.description,
      technologies: data.technologies,
      createdAt,
    });

    return {
      id: data.id,
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
