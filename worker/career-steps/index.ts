import { vValidator } from '@hono/valibot-validator';
import { and, asc, desc, eq, gt, isNull, lt, or, sql } from 'drizzle-orm';
import { type Context, Hono, type Next } from 'hono';
import { csrf } from 'hono/csrf';
import * as v from 'valibot';

import { createAuth, isTrustedAuthOrigin } from '../auth';
import { createDatabase } from '../db/client';
import { careerStep } from '../db/schema';
import {
  deleteUserById,
  isDemoUserEmail,
  isDemoUserExpired,
} from '../demo-user/demo-users';

const CAREER_STEP_PAGE_SIZE = 20;

type CareerStepsContext = {
  Bindings: Env;
  Variables: {
    userId: string;
    email: string;
  };
};

const careerStepListSelect = {
  id: careerStep.id,
  position: careerStep.position,
  startedOn: careerStep.startedOn,
  endedOn: careerStep.endedOn,
  description: careerStep.description,
  technologies: careerStep.technologies,
  createdAt: careerStep.createdAt,
};

const careerStepIdSchema = v.object({
  id: v.pipe(v.string(), v.minLength(1)),
});

const careerStepDatesSchema = v.pipe(
  v.object({
    from: v.pipe(
      v.string(),
      v.minLength(1, 'Start date is required'),
      v.isoDate('Start date is invalid'),
    ),
    to: v.union([
      v.literal(''),
      v.pipe(v.string(), v.isoDate('End date is invalid')),
    ]),
  }),
  v.check(
    (range) => !range.to || range.to >= range.from,
    'End date must be on or after the start date',
  ),
);

const careerStepFieldsSchema = v.object({
  id: v.optional(v.pipe(v.string(), v.minLength(1))),
  position: v.pipe(
    v.string(),
    v.trim(),
    v.minLength(1, 'Position is required'),
    v.maxLength(120, 'Position is too long'),
  ),
  dates: careerStepDatesSchema,
  description: v.pipe(
    v.string(),
    v.trim(),
    v.minLength(1, 'Description is required'),
    v.maxLength(4000, 'Description is too long'),
  ),
  technologies: v.pipe(
    v.string(),
    v.trim(),
    v.minLength(1, 'Technologies are required'),
    v.maxLength(2000, 'Technologies is too long'),
  ),
});

const careerStepSortSchema = v.picklist(['startedOn-desc', 'startedOn-asc']);

const careerStepListCursorSchema = v.object({
  startedOn: v.pipe(v.string(), v.isoDate()),
  createdAt: v.pipe(v.string(), v.isoTimestamp()),
  id: v.pipe(v.string(), v.minLength(1, 'Id is required')),
});

type CareerStepListCursor = v.InferOutput<typeof careerStepListCursorSchema>;

type CareerStepSort = v.InferOutput<typeof careerStepSortSchema>;

const optionalCursorSchema = v.optional(
  v.pipe(
    v.string(),
    v.transform((value) => JSON.parse(value) as unknown),
    careerStepListCursorSchema,
  ),
);

const optionalLimitSchema = v.optional(
  v.pipe(
    v.string(),
    v.transform((value) => Number(value)),
    v.number(),
    v.integer(),
    v.minValue(1),
    v.transform((value) => Math.min(value, CAREER_STEP_PAGE_SIZE)),
  ),
);

const careerStepListQuerySchema = v.object({
  q: v.optional(v.pipe(v.string(), v.trim())),
  sort: v.optional(careerStepSortSchema, 'startedOn-desc'),
  cursor: optionalCursorSchema,
  limit: optionalLimitSchema,
});

const matchesPresentLabel = (needle: string): boolean =>
  needle.length > 0 && 'present'.includes(needle);

const careerStepSearchNeedle = (query: string): string =>
  query.trim().toLowerCase();

const toIsoCreatedAt = (createdAt: Date | string): string =>
  createdAt instanceof Date ? createdAt.toISOString() : createdAt;

const toCareerStep = (step: {
  id: string;
  position: string;
  startedOn: string;
  endedOn: string | null;
  description: string;
  technologies: string;
  createdAt: Date | string;
}) => ({
  id: step.id,
  position: step.position,
  startedOn: step.startedOn,
  endedOn: step.endedOn,
  description: step.description,
  technologies: step.technologies,
  createdAt: toIsoCreatedAt(step.createdAt),
});

const ownedCareerStep = (stepId: string, userId: string) =>
  and(eq(careerStep.id, stepId), eq(careerStep.userId, userId));

const careerStepSearchCondition = (needle: string) => {
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
};

const careerStepCursorCondition = (
  sort: CareerStepSort,
  cursor: CareerStepListCursor,
) => {
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
};

const toListCursor = (step: {
  startedOn: string;
  createdAt: Date | string;
  id: string;
}): CareerStepListCursor => ({
  startedOn: step.startedOn,
  createdAt: toIsoCreatedAt(step.createdAt),
  id: step.id,
});

const requireSession = async (
  context: Context<CareerStepsContext>,
  next: Next,
) => {
  const currentSession = await createAuth(context.env).api.getSession({
    headers: context.req.raw.headers,
  });
  if (!currentSession) return context.json({ message: 'Unauthorized' }, 401);

  const { id: userId, email, createdAt } = currentSession.user;
  const createdAtDate =
    createdAt instanceof Date ? createdAt : new Date(createdAt);

  if (isDemoUserEmail(email) && isDemoUserExpired(createdAtDate)) {
    await deleteUserById(createDatabase(context.env.DB), userId);

    return context.json({ message: 'Unauthorized' }, 401);
  }

  context.set('userId', userId);
  context.set('email', email);

  await next();
};

export const careerSteps = new Hono<CareerStepsContext>()
  .use(
    csrf({
      origin: (origin, context) =>
        isTrustedAuthOrigin(origin, context.env.BETTER_AUTH_URL),
    }),
  )
  .use(requireSession)
  .get('/', vValidator('query', careerStepListQuerySchema), async (context) => {
    const { q = '', sort, cursor, limit } = context.req.valid('query');
    const database = createDatabase(context.env.DB);
    const needle = careerStepSearchNeedle(q);
    const pageSize = limit ?? CAREER_STEP_PAGE_SIZE;
    const filters = [eq(careerStep.userId, context.get('userId'))];

    if (needle) {
      const search = careerStepSearchCondition(needle);
      if (search) filters.push(search);
    }

    if (cursor) {
      const cursorFilter = careerStepCursorCondition(sort, cursor);
      if (cursorFilter) filters.push(cursorFilter);
    }

    const orderBy =
      sort === 'startedOn-asc'
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

    const rows = await database
      .select(careerStepListSelect)
      .from(careerStep)
      .where(and(...filters))
      .orderBy(...orderBy)
      .limit(pageSize + 1);

    const hasMore = rows.length > pageSize;
    const page = hasMore ? rows.slice(0, pageSize) : rows;
    const last = page[page.length - 1];

    return context.json(
      {
        items: page.map(toCareerStep),
        nextCursor: hasMore && last ? toListCursor(last) : null,
      },
      200,
    );
  })
  .get('/:id', vValidator('param', careerStepIdSchema), async (context) => {
    const { id } = context.req.valid('param');
    const database = createDatabase(context.env.DB);

    const [step] = await database
      .select(careerStepListSelect)
      .from(careerStep)
      .where(ownedCareerStep(id, context.get('userId')))
      .limit(1);
    if (!step) return context.json({ message: 'Career step not found' }, 404);

    return context.json(toCareerStep(step), 200);
  })
  .post('/', vValidator('json', careerStepFieldsSchema), async (context) => {
    const fields = context.req.valid('json');
    const database = createDatabase(context.env.DB);
    const createdAt = new Date();
    const id = fields.id ?? crypto.randomUUID();

    const [created] = await database
      .insert(careerStep)
      .values({
        id,
        userId: context.get('userId'),
        position: fields.position,
        startedOn: fields.dates.from,
        endedOn: fields.dates.to || null,
        description: fields.description,
        technologies: fields.technologies,
        createdAt,
      })
      .returning(careerStepListSelect);
    if (!created)
      return context.json({ message: 'Could not create career step' }, 500);

    return context.json(toCareerStep(created), 201);
  })
  .put(
    '/:id',
    vValidator('param', careerStepIdSchema),
    vValidator('json', careerStepFieldsSchema),
    async (context) => {
      const { id } = context.req.valid('param');
      const fields = context.req.valid('json');
      const database = createDatabase(context.env.DB);
      const endedOn = fields.dates.to || null;

      const [updated] = await database
        .update(careerStep)
        .set({
          position: fields.position,
          startedOn: fields.dates.from,
          endedOn,
          description: fields.description,
          technologies: fields.technologies,
        })
        .where(ownedCareerStep(id, context.get('userId')))
        .returning(careerStepListSelect);
      if (!updated)
        return context.json({ message: 'Career step not found' }, 404);

      return context.json(toCareerStep(updated), 200);
    },
  )
  .delete('/:id', vValidator('param', careerStepIdSchema), async (context) => {
    const { id } = context.req.valid('param');
    const database = createDatabase(context.env.DB);

    const [deleted] = await database
      .delete(careerStep)
      .where(ownedCareerStep(id, context.get('userId')))
      .returning({ id: careerStep.id });
    if (!deleted)
      return context.json({ message: 'Career step not found' }, 404);

    return context.body(null, 204);
  });
