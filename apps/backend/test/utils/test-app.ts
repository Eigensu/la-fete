/* eslint-disable @typescript-eslint/no-explicit-any */
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { createHmac } from 'crypto';
import { join } from 'path';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { AppModule } from '../../src/app.module';
import { configureApp } from '../../src/app.setup';
import { UserRole } from '../../src/common/enums/user-role.enum';
import { EmailService } from '../../src/modules/auth/email.service';
import { BorzoService } from '../../src/modules/delivery/borzo.service';
import { RazorpayService } from '../../src/modules/payments/razorpay.service';
import { User } from '../../src/modules/users/entities/user.entity';

export const API = '/api/v1';

/**
 * Stand-ins for every service that talks to a third party. Nothing in the e2e
 * suite may leave the machine: Razorpay, Borzo and SMTP are all replaced.
 *
 * Razorpay signature verification is *not* stubbed — it is pure HMAC with no
 * network, and it's exactly the security check we want CI to guard.
 */
export function createStubs() {
  let razorpayOrderSeq = 0;
  const razorpay = {
    createOrder: jest.fn(
      async (amount: number, currency = 'INR', receipt: string) => ({
        id: `order_stub_${++razorpayOrderSeq}`,
        entity: 'order',
        amount: Math.round(amount * 100),
        currency,
        receipt,
        status: 'created',
      })
    ),
    verifyPaymentSignature: jest.fn(
      (orderId: string, paymentId: string, signature: string) =>
        RazorpayService.prototype.verifyPaymentSignature.call(
          null,
          orderId,
          paymentId,
          signature
        )
    ),
    getPaymentDetails: jest.fn(async (paymentId: string) => ({
      id: paymentId,
      status: 'captured',
    })),
    refundPayment: jest.fn(async (paymentId: string) => ({
      id: `rfnd_stub_${paymentId}`,
      status: 'processed',
    })),
  };

  const borzo = {
    calculateDistance: jest.fn(() => 5),
    estimateDelivery: jest.fn(async () => ({ estimatedCost: 150 })),
    createDelivery: jest.fn(async () => ({
      order_id: 'borzo_stub_1',
      status: 'new',
    })),
    trackDelivery: jest.fn(async () => ({ status: 'active' })),
    cancelDelivery: jest.fn(async () => ({ status: 'canceled' })),
    verifyWebhookSignature: jest.fn(() => true),
  };

  const email = {
    sendMail: jest.fn(async () => undefined),
  };

  return { razorpay, borzo, email };
}

export type Stubs = ReturnType<typeof createStubs>;

/** The suite wipes its database, so refuse anything that isn't obviously a
 *  throwaway test database — a stray exported DATABASE_URL must never be
 *  able to point this at dev or production data. */
export function assertDisposableDatabase(url: string | undefined): void {
  const dbName = url ? new URL(url).pathname.replace(/^\//, '') : '';
  if (!/(^|[_-])(e2e|test)([_-]|$)/i.test(dbName)) {
    throw new Error(
      `Refusing to run e2e tests against database "${dbName || '(none)'}": ` +
        'the suite drops and recreates its schema. Point DATABASE_URL at a ' +
        'dedicated database whose name contains "e2e" or "test" ' +
        '(e.g. lafete_e2e).'
    );
  }
}

/** Drops and rebuilds the schema from the entity definitions so every spec
 *  file starts from an empty, known database. */
export async function resetDatabase(): Promise<void> {
  assertDisposableDatabase(process.env.DATABASE_URL);
  const ds = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    entities: [join(__dirname, '../../src/modules/**/*.entity{.ts,.js}')],
    synchronize: true,
    dropSchema: true,
    logging: false,
  });
  await ds.initialize();
  await ds.destroy();
}

export async function createTestApp(): Promise<{
  app: INestApplication;
  stubs: Stubs;
  dataSource: DataSource;
}> {
  await resetDatabase();

  const stubs = createStubs();
  const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
    .overrideProvider(RazorpayService)
    .useValue(stubs.razorpay)
    .overrideProvider(BorzoService)
    .useValue(stubs.borzo)
    .overrideProvider(EmailService)
    .useValue(stubs.email)
    .compile();

  const app = moduleRef.createNestApplication({ logger: ['error', 'warn'] });
  configureApp(app);
  await app.init();

  return { app, stubs, dataSource: app.get(DataSource) };
}

/** Signs a payment the same way Razorpay Checkout does on success. */
export function razorpaySignature(
  razorpayOrderId: string,
  razorpayPaymentId: string
): string {
  return createHmac('sha256', process.env.RAZORPAY_KEY_SECRET as string)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex');
}

let userSeq = 0;

export interface TestUser {
  id: string;
  email: string;
  token: string;
}

export async function registerUser(
  app: INestApplication,
  overrides: Partial<{ email: string; password: string; phone: string }> = {}
): Promise<TestUser> {
  userSeq += 1;
  const body = {
    email: overrides.email ?? `customer${userSeq}.${Date.now()}@e2e.test`,
    password: overrides.password ?? 'Passw0rdE2E',
    phone: overrides.phone ?? `98765${String(10000 + userSeq).slice(-5)}`,
    firstName: 'E2E',
    lastName: `User${userSeq}`,
  };

  const res = await request(app.getHttpServer())
    .post(`${API}/auth/register`)
    .send(body)
    .expect(201);
  return {
    id: res.body.user.id,
    email: body.email,
    token: res.body.accessToken,
  };
}

/** Admin accounts can't be self-registered, so promote a fresh user directly
 *  in the database — the JWT strategy reloads the user (and role) per request. */
export async function registerAdmin(app: INestApplication): Promise<TestUser> {
  const user = await registerUser(app);
  await app
    .get(DataSource)
    .getRepository(User)
    .update({ id: user.id }, { role: UserRole.ADMIN });
  return user;
}

export const auth = (user: TestUser) => ({
  Authorization: `Bearer ${user.token}`,
});

/** yyyy-mm-dd for `days` from today, in local time (matches how the slot
 *  endpoints compute their lead-time window). */
export function isoDateFromToday(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function http(app: INestApplication) {
  return request(app.getHttpServer());
}

export type AnyBody = Record<string, any>;
