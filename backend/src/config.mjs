import path from 'node:path';

export function loadConfig(env = process.env) {
  const nodeEnv = env.NODE_ENV ?? 'development';
  const sessionSecret = env.SESSION_SECRET ?? '';
  if (sessionSecret.length < 32) throw new Error('SESSION_SECRET must contain at least 32 characters.');
  const ttl = Number(env.SESSION_TTL_SECONDS ?? 28_800);
  if (!Number.isFinite(ttl) || ttl < 60) throw new Error('SESSION_TTL_SECONDS must be at least 60.');
  return Object.freeze({
    nodeEnv,
    port: Number(env.PORT ?? 4000),
    databasePath: env.DATABASE_PATH === ':memory:' ? ':memory:' : path.resolve(process.cwd(), env.DATABASE_PATH ?? './data/rollcall.db'),
    sessionSecret,
    sessionTtlSeconds: ttl,
    corsOrigin: (env.CORS_ORIGIN ?? (nodeEnv === 'production' ? 'https://roll-call-three.vercel.app' : 'http://localhost:8081')).replace(/\/+$/, ''),
    paymentWebhookSecret: env.PAYMENT_WEBHOOK_SECRET ?? '',
    invitationTtlSeconds: Number(env.INVITATION_TTL_SECONDS ?? 172800),
    otpTtlSeconds: Number(env.OTP_TTL_SECONDS ?? 600),
    onboardingBaseUrl: env.ONBOARDING_BASE_URL ?? 'http://localhost:8083/activate',
    exposeDevelopmentSecrets: nodeEnv !== 'production' && env.EXPOSE_DEV_ONBOARDING_SECRETS === 'true',
  });
}
