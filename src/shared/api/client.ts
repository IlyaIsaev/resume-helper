import { abortVar, wrap } from '@reatom/core';
import { toMerged } from 'es-toolkit';
import type { InferRequestType, InferResponseType } from 'hono/client';
import { hc } from 'hono/client';

import { session } from '@/shared/auth';

import type { AppType } from '../../../worker';

const api = hc<AppType>('/', {
  init: {
    credentials: 'include',
  },
  fetch: (input: RequestInfo | URL, init?: RequestInit) => {
    const { controller, unsubscribe } = abortVar.subscribe();

    return wrap(
      fetch(
        input,
        toMerged(init ?? {}, {
          signal: init?.signal ?? controller.signal,
        }),
      ),
    ).finally(() => {
      unsubscribe();
    });
  },
});

const retrySessionIfUnauthorized = async (
  response: Response,
): Promise<void> => {
  if (response.status !== 401) return;

  await wrap(session.retry());
};

const failedRequestMessage = async (
  response: Response,
  failedMessage: string,
): Promise<string> => {
  try {
    const body: unknown = await wrap(response.json());
    if (
      typeof body === 'object' &&
      body !== null &&
      'message' in body &&
      typeof body.message === 'string'
    ) {
      return body.message;
    }
  } catch {
    return `${failedMessage}: ${response.status}`;
  }

  return `${failedMessage}: ${response.status}`;
};

const readJson = async <T>(
  response: Response,
  failedMessage: string,
): Promise<T> => {
  await retrySessionIfUnauthorized(response);
  if (!response.ok) throw new Error(`${failedMessage}: ${response.status}`);

  return await wrap(response.json());
};

type CareerStepsResponse = InferResponseType<
  (typeof api.api)['career-steps']['$get'],
  200
>;

type CareerStepResponse = InferResponseType<
  (typeof api.api)['career-steps'][':id']['$get'],
  200
>;

type CreateCareerStepBody = InferRequestType<
  (typeof api.api)['career-steps']['$post']
>['json'];

type CreatedCareerStep = InferResponseType<
  (typeof api.api)['career-steps']['$post'],
  201
>;

type UpdateCareerStepBody = InferRequestType<
  (typeof api.api)['career-steps'][':id']['$put']
>['json'];

type UpdatedCareerStep = InferResponseType<
  (typeof api.api)['career-steps'][':id']['$put'],
  200
>;

type DemoUserCredentials = InferResponseType<
  (typeof api.api)['demo-user']['$get']
>;

type CreateDemoUserBody = InferRequestType<
  (typeof api.api)['demo-user']['$post']
>['json'];

export type CareerStepListCursor = NonNullable<
  CareerStepsResponse['nextCursor']
>;

export const clientApi = {
  async loadCareerSteps(input: {
    query?: string;
    sort?: 'startedOn-desc' | 'startedOn-asc';
    cursor?: CareerStepListCursor | null;
  }): Promise<CareerStepsResponse> {
    const query =
      input.query === undefined || input.query.length === 0
        ? {}
        : { q: input.query };
    const response = await wrap(
      api.api['career-steps'].$get({
        query: {
          ...query,
          sort: input.sort,
          cursor: input.cursor ? JSON.stringify(input.cursor) : undefined,
        },
      }),
    );

    return await readJson<CareerStepsResponse>(
      response,
      'GET /api/career-steps failed',
    );
  },

  async loadCareerStep(id: string): Promise<CareerStepResponse | null> {
    const response = await wrap(
      api.api['career-steps'][':id'].$get({ param: { id } }),
    );
    if (response.status === 404) return null;

    return await readJson<CareerStepResponse>(
      response,
      'GET /api/career-steps/:id failed',
    );
  },

  async createCareerStep(
    careerStepFields: CreateCareerStepBody,
  ): Promise<CreatedCareerStep> {
    const response = await wrap(
      api.api['career-steps'].$post({
        json: careerStepFields,
      }),
    );

    await retrySessionIfUnauthorized(response);
    if (!response.ok) {
      throw new Error(
        await failedRequestMessage(response, 'POST /api/career-steps failed'),
      );
    }

    return await wrap(response.json());
  },

  async updateCareerStep(
    id: string,
    careerStepFields: UpdateCareerStepBody,
  ): Promise<UpdatedCareerStep> {
    const response = await wrap(
      api.api['career-steps'][':id'].$put({
        param: { id },
        json: careerStepFields,
      }),
    );

    return await readJson<UpdatedCareerStep>(
      response,
      'PUT /api/career-steps/:id failed',
    );
  },

  async deleteCareerStep(id: string): Promise<void> {
    const response = await wrap(
      api.api['career-steps'][':id'].$delete({
        param: { id },
      }),
    );

    await retrySessionIfUnauthorized(response);
    if (!response.ok)
      throw new Error(
        `DELETE /api/career-steps/:id failed: ${response.status}`,
      );
  },

  async loadDemoUser(): Promise<DemoUserCredentials> {
    const response = await wrap(api.api['demo-user'].$get());

    return await readJson<DemoUserCredentials>(
      response,
      'GET /api/demo-user failed',
    );
  },

  async createDemoUser(demoSignIn: CreateDemoUserBody): Promise<void> {
    const response = await wrap(
      api.api['demo-user'].$post({
        json: demoSignIn,
      }),
    );
    if (!response.ok)
      throw new Error(`POST /api/demo-user failed: ${response.status}`);
  },

  async deleteUser(): Promise<void> {
    const response = await wrap(api.api['demo-user'].$delete());
    if (!response.ok)
      throw new Error(`DELETE /api/demo-user failed: ${response.status}`);
  },
};
