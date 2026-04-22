import { decode as nextAuthDecode, type JWTDecodeParams } from 'next-auth/jwt';

const DEVELOPMENT_NEXTAUTH_SECRET = 'development-secret-change-me';
const configuredNextAuthSecret = process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET;
const LEGACY_NEXTAUTH_SECRETS = [
  'dev-secret-change-me',
  'pYn8fR2kL5mN9qS1vX4zW7hJ0gB3eD6aC9xY2zL5mV8',
] as const;

export function getNextAuthSecret() {
  return configuredNextAuthSecret || DEVELOPMENT_NEXTAUTH_SECRET;
}

export async function decodeNextAuthJwt(params: JWTDecodeParams) {
  try {
    return await nextAuthDecode(params);
  } catch {
    // Fall through to the legacy secrets below.
  }

  const primarySecret = getNextAuthSecret();
  const secrets = [configuredNextAuthSecret, primarySecret, ...LEGACY_NEXTAUTH_SECRETS]
    .filter((secret): secret is string => Boolean(secret))
    .filter((secret, index, all) => all.indexOf(secret) === index);

  for (const secret of secrets) {
    if (secret === params.secret) {
      continue;
    }

    try {
      const token = await nextAuthDecode({ ...params, secret });
      if (token) {
        return token;
      }
    } catch {
      // Try the next legacy secret.
    }
  }

  return null;
}
