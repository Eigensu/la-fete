import { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { DeliverySlot } from '../src/modules/delivery/entities/delivery-slot.entity';
import { Payment } from '../src/modules/payments/entities/payment.entity';
import { ProductVariant } from '../src/modules/products/entities/product-variant.entity';
import { Product } from '../src/modules/products/entities/product.entity';
import {
  API,
  AnyBody,
  Stubs,
  TestUser,
  auth,
  createTestApp,
  http,
  isoDateFromToday,
  razorpaySignature,
  registerAdmin,
  registerUser,
} from './utils/test-app';

/**
 * End-to-end: a real Nest app on a real Postgres, driven purely over HTTP.
 * Razorpay, Borzo and SMTP are stubbed (see utils/test-app.ts); everything
 * else — validation, guards, transactions, row locks — is the production code.
 */
describe('Checkout flow (e2e)', () => {
  let app: INestApplication;
  let stubs: Stubs;
  let dataSource: DataSource;
  let admin: TestUser;

  const PRICE = 1200;
  const DELIVERY_FEE = 150;

  /** Admin-side catalog setup, via the same endpoints the admin panel uses. */
  async function createProductWithVariant(
    stockQuantity: number,
    price = PRICE
  ) {
    const suffix = `${Date.now()}-${Math.floor(Math.random() * 1e6)}`;

    const category = await http(app)
      .post(`${API}/admin/categories`)
      .set(auth(admin))
      .send({ name: `Cakes ${suffix}`, slug: `cakes-${suffix}` })
      .expect(201);

    const product = await http(app)
      .post(`${API}/admin/products`)
      .set(auth(admin))
      .send({
        name: `Chocolate Truffle ${suffix}`,
        slug: `chocolate-truffle-${suffix}`,
        description: 'Dark chocolate ganache',
        categoryId: category.body.id,
        isAvailable: true,
      })
      .expect(201);

    const variant = await http(app)
      .post(`${API}/admin/products/${product.body.id}/variants`)
      .set(auth(admin))
      .send({ name: '500g', price, weight: 0.5, stockQuantity })
      .expect(201);

    return {
      productId: product.body.id as string,
      variantId: variant.body.id as string,
      slug: product.body.slug,
    };
  }

  async function createAddress(user: TestUser): Promise<string> {
    const res = await http(app)
      .post(`${API}/addresses`)
      .set(auth(user))
      .send({
        label: 'Home',
        fullName: 'E2E Customer',
        phone: '9876543210',
        addressLine1: '12 Bakery Lane',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        latitude: 19.076,
        longitude: 72.8777,
        isDefault: true,
      })
      .expect(201);
    return res.body.id;
  }

  function addToCart(
    user: TestUser,
    productId: string,
    variantId: string,
    quantity: number
  ) {
    return http(app)
      .post(`${API}/cart/items`)
      .set(auth(user))
      .send({ productId, variantId, quantity });
  }

  async function firstAvailableSlotId(): Promise<string> {
    const res = await http(app)
      .get(`${API}/delivery/slots`)
      .query({ minLeadDays: 1, endDate: isoDateFromToday(10) })
      .expect(200);
    expect(res.body.length).toBeGreaterThan(0);
    return res.body[0].id;
  }

  function placeOrder(user: TestUser, body: AnyBody) {
    return http(app).post(`${API}/orders`).set(auth(user)).send(body);
  }

  async function stockOf(variantId: string): Promise<number> {
    const v = await dataSource
      .getRepository(ProductVariant)
      .findOneByOrFail({ id: variantId });
    return v.stockQuantity;
  }

  beforeAll(async () => {
    ({ app, stubs, dataSource } = await createTestApp());
    admin = await registerAdmin(app);

    await http(app)
      .post(`${API}/delivery/slots/generate`)
      .set(auth(admin))
      .send({ startDate: isoDateFromToday(1), endDate: isoDateFromToday(10) })
      .expect(201);
  });

  afterAll(async () => {
    await app?.close();
  });

  describe('smoke', () => {
    it('GET /health responds ok', async () => {
      const res = await http(app).get(`${API}/health`).expect(200);
      expect(res.body.status).toBe('ok');
    });

    it('never serialises password hashes', async () => {
      const user = await registerUser(app);
      const res = await http(app)
        .post(`${API}/auth/login`)
        .send({ email: user.email, password: 'Passw0rdE2E' })
        .expect(200);
      expect(res.body.accessToken).toEqual(expect.any(String));
      expect(res.body.user.password).toBeUndefined();
    });
  });

  describe('catalog', () => {
    let catalog: { productId: string; variantId: string; slug: string };

    beforeAll(async () => {
      catalog = await createProductWithVariant(5);
    });

    it('lists the product publicly and serves it by slug', async () => {
      const list = await http(app)
        .get(`${API}/products`)
        .query({ limit: 100 })
        .expect(200);
      expect(list.body.data.map((p: AnyBody) => p.id)).toContain(
        catalog.productId
      );

      const one = await http(app)
        .get(`${API}/products/${catalog.slug}`)
        .expect(200);
      expect(one.body.id).toBe(catalog.productId);
    });

    it('filters by collection, including legacy subcategory rows', async () => {
      // Collections come from the sheet import, not the admin API.
      await dataSource
        .getRepository(Product)
        .update({ id: catalog.productId }, { collections: ['dark chocolate'] });

      const res = await http(app)
        .get(`${API}/products`)
        .query({ subcategory: 'Dark Chocolate' })
        .expect(200);
      expect(res.body.data.map((p: AnyBody) => p.id)).toContain(
        catalog.productId
      );
    });
  });

  describe('cart', () => {
    it('adds items to the cart', async () => {
      const customer = await registerUser(app);
      const { productId, variantId } = await createProductWithVariant(5);

      await addToCart(customer, productId, variantId, 2).expect(201);

      const cart = await http(app)
        .get(`${API}/cart`)
        .set(auth(customer))
        .expect(200);
      expect(cart.body.cart.items).toHaveLength(1);
      expect(cart.body.cart.items[0].quantity).toBe(2);
      expect(cart.body.hasUnavailableItems).toBe(false);
    });
  });

  /**
   * One checkout runs in beforeAll and every test below only inspects its
   * outcome, so each test can run on its own (`-t`) and a broken checkout
   * surfaces once, as a hook failure, rather than as a cascade.
   */
  describe('checkout: order → payment → delivery → fulfilment', () => {
    let customer: TestUser;
    let catalog: { productId: string; variantId: string; slug: string };
    let addressId: string;
    let slotId: string;
    let slotBookingsBefore: number;
    let orderResponse: AnyBody;
    let order: AnyBody;

    beforeAll(async () => {
      customer = await registerUser(app);
      catalog = await createProductWithVariant(5);
      addressId = await createAddress(customer);
      slotId = await firstAvailableSlotId();
      slotBookingsBefore = (
        await dataSource
          .getRepository(DeliverySlot)
          .findOneByOrFail({ id: slotId })
      ).currentBookings;

      await addToCart(customer, catalog.productId, catalog.variantId, 2).expect(
        201
      );
      const res = await placeOrder(customer, {
        deliverySlotId: slotId,
        deliveryAddressId: addressId,
        customMessage: 'Happy Birthday!',
        isGift: true,
      }).expect(201);

      orderResponse = res.body;
      order = res.body.order;
    });

    it('prices and confirms the order', () => {
      expect(order.orderNumber).toMatch(/^LF-\d{4}-\d{4}$/);
      expect(order.status).toBe('CONFIRMED');
      expect(Number(order.subtotal)).toBe(2 * PRICE);
      expect(Number(order.deliveryFee)).toBe(DELIVERY_FEE);
      expect(Number(order.totalAmount)).toBe(2 * PRICE + DELIVERY_FEE);
      expect(order.items).toHaveLength(1);
      expect(order.deliverySlot.id).toBe(slotId);
      expect(order.deliveryAddress.id).toBe(addressId);
    });

    it('captures payment', () => {
      expect(orderResponse.payment).toMatchObject({
        success: true,
        status: 'PAID',
        amount: 2 * PRICE + DELIVERY_FEE,
      });
    });

    it('decrements stock, books the slot and empties the cart', async () => {
      expect(await stockOf(catalog.variantId)).toBe(3);

      const slot = await dataSource
        .getRepository(DeliverySlot)
        .findOneByOrFail({ id: slotId });
      expect(slot.currentBookings).toBe(slotBookingsBefore + 1);

      const cart = await http(app)
        .get(`${API}/cart`)
        .set(auth(customer))
        .expect(200);
      expect(cart.body.cart.items).toHaveLength(0);
    });

    it('shows the order in the customer’s history', async () => {
      const list = await http(app)
        .get(`${API}/orders`)
        .set(auth(customer))
        .expect(200);
      expect(list.body.map((o: AnyBody) => o.id)).toEqual([order.id]);

      const one = await http(app)
        .get(`${API}/orders/${order.id}`)
        .set(auth(customer))
        .expect(200);
      expect(one.body.orderNumber).toBe(order.orderNumber);
    });

    it('books a (mock) delivery that can be tracked', async () => {
      const res = await http(app)
        .get(`${API}/delivery/track/${order.id}`)
        .set(auth(customer))
        .expect(200);
      expect(res.body.trackingInfo.status).toBe('ASSIGNED');
      expect(res.body.trackingInfo.trackingUrl).toBe(
        `/orders/${order.id}/track`
      );
    });

    it('verifies a correctly signed Razorpay payment', async () => {
      const payment = await dataSource
        .getRepository(Payment)
        .findOneOrFail({ where: { order: { id: order.id } } });
      const razorpayPaymentId = 'pay_e2e_ok';

      const res = await http(app)
        .post(`${API}/payments/verify`)
        .set(auth(customer))
        .send({
          orderId: order.id,
          razorpay_order_id: payment.razorpayOrderId,
          razorpay_payment_id: razorpayPaymentId,
          razorpay_signature: razorpaySignature(
            payment.razorpayOrderId,
            razorpayPaymentId
          ),
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      const updated = await dataSource
        .getRepository(Payment)
        .findOneByOrFail({ id: payment.id });
      expect(updated.status).toBe('CAPTURED');
      expect(updated.razorpayPaymentId).toBe(razorpayPaymentId);
    });

    it('rejects a tampered Razorpay signature', async () => {
      const payment = await dataSource
        .getRepository(Payment)
        .findOneOrFail({ where: { order: { id: order.id } } });

      await http(app)
        .post(`${API}/payments/verify`)
        .set(auth(customer))
        .send({
          orderId: order.id,
          razorpay_order_id: payment.razorpayOrderId,
          razorpay_payment_id: 'pay_e2e_forged',
          razorpay_signature: razorpaySignature(
            payment.razorpayOrderId,
            'pay_something_else'
          ),
        })
        .expect(400);
    });

    it('walks the admin through the fulfilment state machine', async () => {
      for (const status of ['BAKING', 'READY', 'DISPATCHED', 'DELIVERED']) {
        const res = await http(app)
          .patch(`${API}/admin/orders/${order.id}/status`)
          .set(auth(admin))
          .send({ status })
          .expect(200);
        expect(res.body.status).toBe(status);
      }

      // Terminal state: no way back.
      await http(app)
        .patch(`${API}/admin/orders/${order.id}/status`)
        .set(auth(admin))
        .send({ status: 'CANCELLED' })
        .expect(400);
    });

    it('lets the admin find the order by number', async () => {
      const res = await http(app)
        .get(`${API}/admin/orders`)
        .query({ search: order.orderNumber })
        .set(auth(admin))
        .expect(200);
      expect(res.body.map((o: AnyBody) => o.id)).toContain(order.id);
    });

    it('never calls real third-party services', () => {
      expect(stubs.borzo.createDelivery).not.toHaveBeenCalled();
      expect(stubs.email.sendMail).not.toHaveBeenCalled();
    });
  });

  describe('access control', () => {
    let owner: TestUser;
    let stranger: TestUser;
    let orderId: string;

    beforeAll(async () => {
      owner = await registerUser(app);
      stranger = await registerUser(app);
      const { productId, variantId } = await createProductWithVariant(5);
      const addressId = await createAddress(owner);
      await addToCart(owner, productId, variantId, 1).expect(201);
      const res = await placeOrder(owner, {
        deliverySlotId: await firstAvailableSlotId(),
        deliveryAddressId: addressId,
      }).expect(201);
      orderId = res.body.order.id;
    });

    it('requires a token to place or read orders', async () => {
      await http(app).post(`${API}/orders`).send({}).expect(401);
      await http(app).get(`${API}/orders`).expect(401);
      await http(app).get(`${API}/cart`).expect(401);
    });

    it('rejects a forged token', async () => {
      await http(app)
        .get(`${API}/orders`)
        .set('Authorization', 'Bearer not.a.jwt')
        .expect(401);
    });

    it('hides one customer’s order from another', async () => {
      await http(app)
        .get(`${API}/orders/${orderId}`)
        .set(auth(stranger))
        .expect(404);
      const list = await http(app)
        .get(`${API}/orders`)
        .set(auth(stranger))
        .expect(200);
      expect(list.body).toEqual([]);
    });

    it('keeps admin endpoints admin-only', async () => {
      await http(app).get(`${API}/admin/orders`).set(auth(owner)).expect(403);
      await http(app)
        .patch(`${API}/admin/orders/${orderId}/status`)
        .set(auth(owner))
        .send({ status: 'BAKING' })
        .expect(403);
      await http(app)
        .post(`${API}/admin/products`)
        .set(auth(owner))
        .send({ name: 'x', slug: 'x', description: 'x', categoryId: orderId })
        .expect(403);
    });
  });

  describe('order failure modes', () => {
    it('refuses to place an order from an empty cart', async () => {
      const user = await registerUser(app);
      const addressId = await createAddress(user);
      const res = await placeOrder(user, {
        deliverySlotId: await firstAvailableSlotId(),
        deliveryAddressId: addressId,
      }).expect(400);
      expect(res.body.message).toMatch(/cart is empty/i);
    });

    it('validates the order payload', async () => {
      const user = await registerUser(app);
      await placeOrder(user, {
        deliverySlotId: 'nope',
        deliveryAddressId: 'nope',
      }).expect(400);
      await placeOrder(user, {
        deliverySlotId: await firstAvailableSlotId(),
        deliveryAddressId: await createAddress(user),
        totalAmount: 1, // clients must not be able to set prices
      }).expect(400);
    });

    it('will not add more to the cart than is in stock', async () => {
      const user = await registerUser(app);
      const { productId, variantId } = await createProductWithVariant(2);
      const res = await addToCart(user, productId, variantId, 3).expect(400);
      expect(res.body.message).toMatch(/not enough stock/i);
    });

    it('rolls everything back when the delivery slot is full', async () => {
      const user = await registerUser(app);
      const { productId, variantId } = await createProductWithVariant(5);
      const addressId = await createAddress(user);
      await addToCart(user, productId, variantId, 1).expect(201);

      const slotRepo = dataSource.getRepository(DeliverySlot);
      const slotId = await firstAvailableSlotId();
      const slot = await slotRepo.findOneByOrFail({ id: slotId });
      const originalBookings = slot.currentBookings;
      await slotRepo.update(
        { id: slotId },
        { currentBookings: slot.maxCapacity }
      );

      try {
        const res = await placeOrder(user, {
          deliverySlotId: slotId,
          deliveryAddressId: addressId,
        }).expect(400);
        expect(res.body.message).toMatch(/slot is full/i);

        expect(await stockOf(variantId)).toBe(5);
        const cart = await http(app)
          .get(`${API}/cart`)
          .set(auth(user))
          .expect(200);
        expect(cart.body.cart.items).toHaveLength(1);
      } finally {
        await slotRepo.update(
          { id: slotId },
          { currentBookings: originalBookings }
        );
      }
    });

    it('rolls back when the delivery address belongs to nobody', async () => {
      const user = await registerUser(app);
      const { productId, variantId } = await createProductWithVariant(5);
      await addToCart(user, productId, variantId, 2).expect(201);

      await placeOrder(user, {
        deliverySlotId: await firstAvailableSlotId(),
        deliveryAddressId: '00000000-0000-4000-8000-000000000000',
      }).expect(404);

      // Stock was decremented inside the transaction before the address
      // lookup failed — it must have been rolled back.
      expect(await stockOf(variantId)).toBe(5);
    });

    it('sells the last units exactly once under concurrent checkouts', async () => {
      const { productId, variantId } = await createProductWithVariant(3);
      const slotId = await firstAvailableSlotId();

      const buyers = await Promise.all([registerUser(app), registerUser(app)]);
      const addresses: string[] = [];
      for (const buyer of buyers) {
        addresses.push(await createAddress(buyer));
        await addToCart(buyer, productId, variantId, 3).expect(201);
      }

      const results = await Promise.all(
        buyers.map((buyer, i) =>
          placeOrder(buyer, {
            deliverySlotId: slotId,
            deliveryAddressId: addresses[i],
          })
        )
      );

      expect(results.map((r) => r.status).sort()).toEqual([201, 400]);
      expect(results.find((r) => r.status === 400)?.body.message).toMatch(
        /insufficient stock/i
      );
      expect(await stockOf(variantId)).toBe(0);
    });
  });
});
