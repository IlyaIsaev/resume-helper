const LOCAL_DEV_ORIGINS = [
  'http://127.0.0.1:3000',
  'http://localhost:3000',
  'http://127.0.0.1:3100',
  'http://localhost:3100',
] as const satisfies ReadonlyArray<string>;

export const trustedOriginsFor = (betterAuthUrl: string): Array<string> => {
  const origin = new URL(betterAuthUrl).origin;

  if (LOCAL_DEV_ORIGINS.some((localOrigin) => localOrigin === origin)) {
    return [...LOCAL_DEV_ORIGINS];
  }

  return [origin];
};

export const isTrustedAuthOrigin = ({
  origin,
  betterAuthUrl,
}: {
  origin: string;
  betterAuthUrl: string;
}): boolean => trustedOriginsFor(betterAuthUrl).includes(origin);
