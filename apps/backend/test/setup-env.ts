/**
 * Runs before any e2e test file is imported. Nest reads several of these at
 * module-decoration time (JwtModule secret, Google strategy, Razorpay keys),
 * so they must be in process.env before AppModule is required.
 *
 * Values set here win over the repo-root .env that ConfigModule loads,
 * because dotenv never overwrites a key that is already present — so a
 * developer's real SMTP / Razorpay credentials can't leak into a test run.
 */
const defaults: Record<string, string> = {
  NODE_ENV: 'test',
  DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/lafete_e2e',

  JWT_SECRET: 'e2e-jwt-secret-that-is-at-least-32-characters-long',
  JWT_EXPIRATION: '15m',
  JWT_REFRESH_SECRET: 'e2e-refresh-secret-that-is-at-least-32-characters',
  JWT_REFRESH_EXPIRATION: '30d',

  RAZORPAY_KEY_ID: 'rzp_test_e2e',
  RAZORPAY_KEY_SECRET: 'e2e-razorpay-secret',
  RAZORPAY_WEBHOOK_SECRET: 'e2e-razorpay-webhook-secret',

  GOOGLE_CLIENT_ID: 'e2e-google-client-id',
  GOOGLE_CLIENT_SECRET: 'e2e-google-client-secret',
  GOOGLE_CALLBACK_URL: 'http://localhost:3001/api/v1/auth/google/callback',

  BORZO_API_URL: 'http://borzo.invalid',
  BORZO_API_TOKEN: 'e2e-borzo-token',

  FRONTEND_URL: 'http://localhost:3000',
};

for (const [key, value] of Object.entries(defaults)) {
  // DATABASE_URL may be supplied by CI / the developer; everything else is
  // forced so tests are deterministic regardless of the local .env.
  if (key === 'DATABASE_URL' && process.env.DATABASE_URL) continue;
  process.env[key] = value;
}

// Blank (not unset) so the root .env can't fill them back in: EmailService
// then falls back to logging instead of sending real mail.
process.env.SMTP_HOST = '';
process.env.SMTP_USER = '';
process.env.SMTP_PASSWORD = '';
