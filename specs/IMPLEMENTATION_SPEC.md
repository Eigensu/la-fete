# La Fête 365 - Detailed Implementation Specification

## Table of Contents
1. [Database Schema & Entities](#database-schema--entities)
2. [Module Structure](#module-structure)
3. [API Endpoints](#api-endpoints)
4. [Business Logic & Workflows](#business-logic--workflows)
5. [Background Jobs](#background-jobs)
6. [Security & Validation](#security--validation)

---

## 1. Database Schema & Entities

### Core Entities Overview
- User & Address Management
- Product Catalog with Variants
- Cart System (Persistent)
- Order Management with State Machine
- Payment Integration (Razorpay)
- Delivery Integration (Borzo)
- Delivery Slots with Capacity Management
- Notifications Log

---

### Entity: User
```typescript
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string; // Hashed with bcrypt

  @Column({ type: 'enum', enum: UserRole, default: UserRole.CUSTOMER })
  role: UserRole; // CUSTOMER | ADMIN

  @Column()
  phone: string; // Required for Borzo delivery coordination

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Address, address => address.user)
  addresses: Address[];

  @OneToMany(() => Order, order => order.user)
  orders: Order[];

  @OneToOne(() => Cart, cart => cart.user)
  cart: Cart;
}

enum UserRole {
  CUSTOMER = 'CUSTOMER',
  ADMIN = 'ADMIN'
}
```

---

### Entity: Address
```typescript
@Entity('addresses')
export class Address {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, user => user.addresses)
  user: User;

  @Column()
  label: string; // e.g., "Home", "Office"

  @Column()
  street: string;

  @Column()
  city: string;

  @Column()
  pincode: string;

  @Column({ type: 'decimal', precision: 10, scale: 7 })
  latitude: number; // CRITICAL for Borzo pricing

  @Column({ type: 'decimal', precision: 10, scale: 7 })
  longitude: number;

  @Column({ nullable: true })
  landmark: string;

  @Column({ default: false })
  isDefault: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
```


---

### Entity: Product
```typescript
@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string; // e.g., "Rose Pistachio Entremet"

  @Column({ type: 'text' })
  description: string; // Rich text/HTML

  @Column({ type: 'simple-array' })
  images: string[]; // S3 URLs

  @Column({ default: true })
  isAvailable: boolean;

  @Column({ nullable: true })
  category: string; // e.g., "Signature", "Seasonal"

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => ProductVariant, variant => variant.product, { cascade: true })
  variants: ProductVariant[];
}
```

---

### Entity: ProductVariant
```typescript
@Entity('product_variants')
export class ProductVariant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Product, product => product.variants)
  product: Product;

  @Column()
  name: string; // e.g., "500g", "1kg"

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number; // Each variant has its own price

  @Column({ type: 'int', default: 0 })
  stockQuantity: number; // Strict inventory per variant

  @Column({ nullable: true })
  sku: string; // Stock Keeping Unit

  @Column({ default: true })
  isAvailable: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
```


---

### Entity: Cart (Persistent)
```typescript
@Entity('carts')
export class Cart {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User, user => user.cart)
  @JoinColumn()
  user: User;

  @OneToMany(() => CartItem, item => item.cart, { cascade: true })
  items: CartItem[];

  @UpdateDateColumn()
  updatedAt: Date;
}
```

---

### Entity: CartItem
```typescript
@Entity('cart_items')
export class CartItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Cart, cart => cart.items)
  cart: Cart;

  @ManyToOne(() => ProductVariant)
  variant: ProductVariant;

  @Column({ type: 'int', default: 1 })
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  priceAtAdd: number; // Snapshot price when added to cart

  @CreateDateColumn()
  createdAt: Date;
}
```

---

### Entity: DeliverySlot
```typescript
@Entity('delivery_slots')
export class DeliverySlot {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'date' })
  date: Date; // e.g., 2026-02-14

  @Column({ type: 'time' })
  startTime: string; // e.g., "10:00:00"

  @Column({ type: 'time' })
  endTime: string; // e.g., "13:00:00"

  @Column({ type: 'int', default: 5 })
  maxCapacity: number; // Max 5 deliveries per slot

  @Column({ type: 'int', default: 0 })
  currentBookings: number;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
```


---

### Entity: Order
```typescript
@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  orderNumber: string; // e.g., "LF-2026-0001" (Auto-generated)

  @ManyToOne(() => User, user => user.orders)
  user: User;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
  status: OrderStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  subtotal: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  deliveryFee: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalAmount: number;

  @ManyToOne(() => DeliverySlot)
  deliverySlot: DeliverySlot;

  @ManyToOne(() => Address)
  deliveryAddress: Address;

  @Column({ type: 'text', nullable: true })
  customMessage: string; // For cake inscriptions

  @Column({ default: false })
  isGift: boolean;

  @Column({ type: 'text', nullable: true })
  specialInstructions: string;

  @OneToMany(() => OrderItem, item => item.order, { cascade: true })
  items: OrderItem[];

  @OneToOne(() => Payment, payment => payment.order)
  payment: Payment;

  @OneToOne(() => Delivery, delivery => delivery.order)
  delivery: Delivery;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  BAKING = 'BAKING',
  READY = 'READY',
  DISPATCHED = 'DISPATCHED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED'
}
```


---

### Entity: OrderItem
```typescript
@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Order, order => order.items)
  order: Order;

  @ManyToOne(() => ProductVariant)
  variant: ProductVariant;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  priceAtPurchase: number; // Snapshot price at order time

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  subtotal: number; // quantity * priceAtPurchase
}
```

---

### Entity: Payment
```typescript
@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Order, order => order.payment)
  @JoinColumn()
  order: Order;

  @Column()
  razorpayOrderId: string;

  @Column({ nullable: true })
  razorpayPaymentId: string; // Null until payment captured

  @Column({ nullable: true })
  razorpaySignature: string;

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.CREATED })
  status: PaymentStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ default: 'INR' })
  currency: string;

  @Column({ nullable: true })
  failureReason: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

enum PaymentStatus {
  CREATED = 'CREATED',
  CAPTURED = 'CAPTURED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED'
}
```


---

### Entity: Delivery
```typescript
@Entity('deliveries')
export class Delivery {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Order, order => order.delivery)
  @JoinColumn()
  order: Order;

  @Column({ nullable: true })
  borzoOrderId: string; // External ID from Borzo API

  @Column({ nullable: true })
  trackingUrl: string;

  @Column({ nullable: true })
  courierName: string;

  @Column({ nullable: true })
  courierPhone: string;

  @Column({ type: 'enum', enum: DeliveryStatus, default: DeliveryStatus.PENDING })
  status: DeliveryStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  estimatedCost: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  actualCost: number;

  @Column({ type: 'timestamp', nullable: true })
  pickedUpAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  deliveredAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

enum DeliveryStatus {
  PENDING = 'PENDING',
  SEARCHING = 'SEARCHING',
  ASSIGNED = 'ASSIGNED',
  PICKED_UP = 'PICKED_UP',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}
```

---

### Entity: Notification
```typescript
@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  user: User;

  @ManyToOne(() => Order, { nullable: true })
  order: Order;

  @Column({ type: 'enum', enum: NotificationType })
  type: NotificationType;

  @Column({ type: 'enum', enum: NotificationChannel })
  channel: NotificationChannel;

  @Column()
  recipient: string; // Email or phone number

  @Column({ type: 'text' })
  content: string;

  @Column({ default: false })
  isSent: boolean;

  @Column({ nullable: true })
  sentAt: Date;

  @Column({ nullable: true })
  errorMessage: string;

  @CreateDateColumn()
  createdAt: Date;
}

enum NotificationType {
  ORDER_CONFIRMATION = 'ORDER_CONFIRMATION',
  ORDER_DISPATCHED = 'ORDER_DISPATCHED',
  ORDER_DELIVERED = 'ORDER_DELIVERED',
  ORDER_CANCELLED = 'ORDER_CANCELLED'
}

enum NotificationChannel {
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  WHATSAPP = 'WHATSAPP'
}
```


---

## 2. Module Structure

### Recommended NestJS Module Organization

```
src/
├── modules/
│   ├── auth/
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── strategies/
│   │   │   ├── jwt.strategy.ts
│   │   │   └── local.strategy.ts
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts
│   │   │   └── roles.guard.ts
│   │   └── decorators/
│   │       └── roles.decorator.ts
│   │
│   ├── users/
│   │   ├── users.module.ts
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   └── entities/
│   │       ├── user.entity.ts
│   │       └── address.entity.ts
│   │
│   ├── products/
│   │   ├── products.module.ts
│   │   ├── products.controller.ts
│   │   ├── products.service.ts
│   │   └── entities/
│   │       ├── product.entity.ts
│   │       └── product-variant.entity.ts
│   │
│   ├── cart/
│   │   ├── cart.module.ts
│   │   ├── cart.controller.ts
│   │   ├── cart.service.ts
│   │   └── entities/
│   │       ├── cart.entity.ts
│   │       └── cart-item.entity.ts
│   │
│   ├── orders/
│   │   ├── orders.module.ts
│   │   ├── orders.controller.ts
│   │   ├── orders.service.ts
│   │   └── entities/
│   │       ├── order.entity.ts
│   │       └── order-item.entity.ts
│   │
│   ├── payments/
│   │   ├── payments.module.ts
│   │   ├── payments.controller.ts
│   │   ├── payments.service.ts
│   │   ├── razorpay.service.ts
│   │   └── entities/
│   │       └── payment.entity.ts
│   │
│   ├── delivery/
│   │   ├── delivery.module.ts
│   │   ├── delivery.controller.ts
│   │   ├── delivery.service.ts
│   │   ├── borzo.service.ts
│   │   └── entities/
│   │       ├── delivery.entity.ts
│   │       └── delivery-slot.entity.ts
│   │
│   ├── notifications/
│   │   ├── notifications.module.ts
│   │   ├── notifications.service.ts
│   │   ├── email.service.ts
│   │   ├── sms.service.ts
│   │   └── entities/
│   │       └── notification.entity.ts
│   │
│   └── admin/
│       ├── admin.module.ts
│       ├── admin.controller.ts
│       └── admin.service.ts
│
├── common/
│   ├── decorators/
│   ├── filters/
│   ├── interceptors/
│   └── pipes/
│
└── config/
    ├── database.config.ts
    ├── redis.config.ts
    └── app.config.ts
```


---

## 3. API Endpoints

### Authentication & Users

#### POST /auth/register
- **Body:** `{ email, password, phone, firstName, lastName }`
- **Response:** `{ user, accessToken }`
- **Logic:** Hash password, create user, return JWT

#### POST /auth/login
- **Body:** `{ email, password }`
- **Response:** `{ user, accessToken }`
- **Logic:** Validate credentials, return JWT

#### GET /users/profile
- **Auth:** Required (JWT)
- **Response:** User profile with addresses
- **Logic:** Return current user data

#### POST /users/addresses
- **Auth:** Required
- **Body:** `{ street, city, pincode, latitude, longitude, label, landmark }`
- **Response:** Created address
- **Logic:** Validate coordinates, create address

---

### Products

#### GET /products
- **Query:** `?category=Signature&available=true`
- **Response:** Array of products with variants
- **Logic:** Filter by category and availability

#### GET /products/:id
- **Response:** Product details with all variants
- **Logic:** Include stock information per variant

---

### Cart (Persistent)

#### GET /cart
- **Auth:** Required
- **Response:** Cart with items and calculated total
- **Logic:** Return user's cart with current prices

#### POST /cart/items
- **Auth:** Required
- **Body:** `{ variantId, quantity }`
- **Response:** Updated cart
- **Logic:** 
  - Check variant stock availability
  - Add or update cart item
  - Snapshot current price

#### PATCH /cart/items/:itemId
- **Auth:** Required
- **Body:** `{ quantity }`
- **Response:** Updated cart
- **Logic:** Validate stock, update quantity

#### DELETE /cart/items/:itemId
- **Auth:** Required
- **Response:** Updated cart
- **Logic:** Remove item from cart

#### DELETE /cart
- **Auth:** Required
- **Response:** Empty cart
- **Logic:** Clear all cart items


---

### Delivery Slots

#### GET /delivery/slots
- **Query:** `?startDate=2026-02-14&endDate=2026-02-21`
- **Response:** Available slots with capacity info
- **Logic:** 
  - Return slots for next 7 days
  - Show `availableCapacity = maxCapacity - currentBookings`
  - Filter out full slots

#### GET /delivery/estimate
- **Query:** `?latitude=19.0760&longitude=72.8777`
- **Response:** `{ estimatedCost, distance, duration }`
- **Logic:**
  - Call Borzo `/calculate-order` API
  - Add 10% safety buffer to cost
  - Check if within 25km radius

---

### Orders

#### POST /orders
- **Auth:** Required
- **Body:** 
```json
{
  "deliverySlotId": "uuid",
  "deliveryAddressId": "uuid",
  "customMessage": "Happy Birthday!",
  "isGift": true,
  "specialInstructions": "Ring doorbell twice"
}
```
- **Response:** Order with payment details
- **Logic:**
  1. **Transaction Start**
  2. Validate delivery slot capacity (lock row)
  3. Validate cart items stock
  4. Calculate delivery fee (call Borzo estimate)
  5. Create order with status PENDING
  6. Create order items (snapshot prices)
  7. Decrement variant stock
  8. Increment slot currentBookings
  9. Create Razorpay order
  10. Create Payment record (status: CREATED)
  11. Clear user's cart
  12. **Transaction Commit**
  13. Return order with Razorpay details

#### GET /orders
- **Auth:** Required
- **Response:** User's order history
- **Logic:** Return orders with items, payment, and delivery status

#### GET /orders/:id
- **Auth:** Required
- **Response:** Order details with tracking
- **Logic:** Include Borzo tracking URL if available


---

### Payments (Razorpay)

#### POST /payments/verify
- **Auth:** Required
- **Body:**
```json
{
  "orderId": "uuid",
  "razorpay_order_id": "order_xxx",
  "razorpay_payment_id": "pay_xxx",
  "razorpay_signature": "signature_xxx"
}
```
- **Response:** `{ success: true, order }`
- **Logic:**
  1. Verify signature using HMAC SHA256
  2. **Transaction Start**
  3. Update Payment status to CAPTURED
  4. Update Order status to CONFIRMED
  5. **Transaction Commit**
  6. Queue notification job (email + SMS)
  7. Return success

#### POST /payments/webhook
- **No Auth** (Razorpay webhook)
- **Body:** Razorpay event payload
- **Logic:**
  - Verify webhook signature
  - Handle events: `payment.captured`, `payment.failed`
  - Update payment and order status accordingly

---

### Delivery (Borzo)

#### POST /delivery/book/:orderId
- **Auth:** Admin only
- **Response:** `{ borzoOrderId, trackingUrl }`
- **Logic:**
  1. Validate order status is READY
  2. Get order delivery address with coordinates
  3. Call Borzo `/create-order` API:
```json
{
  "type": "standard",
  "matter": "Fragile Premium Cake",
  "vehicle_type_id": 8,
  "insurance_amount": order.totalAmount,
  "points": [
    {
      "address": "La Fête Kitchen, Mumbai",
      "contact_person": {
        "phone": "+91XXXXXXXXXX",
        "name": "La Fête Kitchen"
      }
    },
    {
      "address": order.deliveryAddress.street,
      "contact_person": {
        "phone": order.user.phone,
        "name": order.user.firstName
      },
      "latitude": order.deliveryAddress.latitude,
      "longitude": order.deliveryAddress.longitude
    }
  ]
}
```
  4. Save `borzoOrderId` and `trackingUrl` to Delivery entity
  5. Update Delivery status to SEARCHING
  6. Update Order status to DISPATCHED
  7. Queue notification job with tracking link

#### POST /delivery/webhook
- **No Auth** (Borzo webhook)
- **Body:** Borzo event payload
- **Logic:**
  - Verify webhook signature
  - Handle status updates: `courier_assigned`, `picked_up`, `delivered`
  - Update Delivery and Order status
  - Queue notifications for status changes


---

### Admin Panel

#### GET /admin/orders
- **Auth:** Admin only
- **Query:** `?date=2026-02-14&status=CONFIRMED`
- **Response:** Filtered orders with full details
- **Logic:** 
  - Filter by date range and status
  - Include customer info, items, delivery slot
  - Sort by delivery slot time

#### PATCH /admin/orders/:id/status
- **Auth:** Admin only
- **Body:** `{ status: "BAKING" }`
- **Response:** Updated order
- **Logic:**
  - Validate status transition (state machine)
  - Update order status
  - Queue notification if needed

#### GET /admin/analytics
- **Auth:** Admin only
- **Query:** `?startDate=2026-02-01&endDate=2026-02-28`
- **Response:**
```json
{
  "totalRevenue": 125000,
  "totalOrders": 45,
  "averageOrderValue": 2777.78,
  "topProducts": [
    { "productName": "Rose Pistachio", "orderCount": 12 }
  ],
  "deliveryPerformance": {
    "onTime": 42,
    "delayed": 3
  }
}
```

#### POST /admin/products
- **Auth:** Admin only
- **Body:** Product with variants
- **Response:** Created product
- **Logic:** Create product with variants in transaction

#### PATCH /admin/products/:id
- **Auth:** Admin only
- **Body:** Updated product data
- **Response:** Updated product

#### PATCH /admin/variants/:id/stock
- **Auth:** Admin only
- **Body:** `{ stockQuantity: 10 }`
- **Response:** Updated variant
- **Logic:** Update stock quantity

#### POST /admin/delivery-slots/generate
- **Auth:** Admin only
- **Body:** `{ startDate, endDate, slots: [...] }`
- **Response:** Created slots
- **Logic:** Bulk create delivery slots for date range


---

## 4. Business Logic & Workflows

### Order State Machine

```
PENDING → CONFIRMED → BAKING → READY → DISPATCHED → DELIVERED
    ↓                                        ↓
CANCELLED ←──────────────────────────────────┘
```

**Valid Transitions:**
- `PENDING → CONFIRMED` (Payment verified)
- `PENDING → CANCELLED` (Payment failed or timeout)
- `CONFIRMED → BAKING` (Admin starts preparation)
- `BAKING → READY` (Cake ready for pickup)
- `READY → DISPATCHED` (Borzo delivery booked)
- `DISPATCHED → DELIVERED` (Borzo confirms delivery)
- `CONFIRMED/BAKING → CANCELLED` (Admin cancellation with refund)

**Invalid Transitions:**
- Cannot go from `DELIVERED` to any other status
- Cannot go from `CANCELLED` to any other status
- Cannot skip states (e.g., `CONFIRMED` → `DISPATCHED`)

---

### Stock Management Logic

#### On Add to Cart:
- Check `variant.stockQuantity > 0`
- Do NOT decrement stock (cart is temporary)

#### On Order Creation:
- **Transaction:**
  - Lock variant rows (`SELECT FOR UPDATE`)
  - Validate `variant.stockQuantity >= orderItem.quantity`
  - Decrement `variant.stockQuantity`
  - If insufficient stock, rollback and return error

#### On Order Cancellation:
- **Transaction:**
  - Increment `variant.stockQuantity` for each order item
  - Decrement `deliverySlot.currentBookings`

---

### Delivery Slot Capacity Management

#### On Slot Query:
- Return slots where `currentBookings < maxCapacity`
- Show `availableCapacity = maxCapacity - currentBookings`

#### On Order Creation:
- **Transaction:**
  - Lock slot row (`SELECT FOR UPDATE`)
  - Check `slot.currentBookings < slot.maxCapacity`
  - Increment `slot.currentBookings`
  - If full, rollback and return error

#### On Order Cancellation:
- Decrement `slot.currentBookings`


---

### Razorpay Payment Flow

#### Step 1: Create Order (Backend)
```typescript
// In OrdersService.createOrder()
const razorpayOrder = await this.razorpayService.createOrder({
  amount: order.totalAmount * 100, // Convert to paise
  currency: 'INR',
  receipt: order.orderNumber,
  notes: {
    orderId: order.id,
    userId: user.id
  }
});

// Save to Payment entity
await this.paymentRepository.save({
  order,
  razorpayOrderId: razorpayOrder.id,
  amount: order.totalAmount,
  status: PaymentStatus.CREATED
});

// Return to frontend
return {
  order,
  razorpayKeyId: process.env.RAZORPAY_KEY_ID,
  razorpayOrderId: razorpayOrder.id,
  amount: order.totalAmount,
  currency: 'INR'
};
```

#### Step 2: Payment on Frontend
```javascript
// Frontend initiates Razorpay checkout
const options = {
  key: razorpayKeyId,
  amount: amount * 100,
  currency: 'INR',
  order_id: razorpayOrderId,
  handler: function(response) {
    // Send to backend for verification
    verifyPayment({
      orderId,
      razorpay_order_id: response.razorpay_order_id,
      razorpay_payment_id: response.razorpay_payment_id,
      razorpay_signature: response.razorpay_signature
    });
  }
};
```

#### Step 3: Verify Payment (Backend)
```typescript
// In PaymentsService.verifyPayment()
const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = dto;

// Verify signature
const text = `${razorpay_order_id}|${razorpay_payment_id}`;
const expectedSignature = crypto
  .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
  .update(text)
  .digest('hex');

if (expectedSignature !== razorpay_signature) {
  throw new BadRequestException('Invalid payment signature');
}

// Update in transaction
await this.dataSource.transaction(async (manager) => {
  await manager.update(Payment, { razorpayOrderId }, {
    razorpayPaymentId,
    razorpaySignature,
    status: PaymentStatus.CAPTURED
  });

  await manager.update(Order, { id: orderId }, {
    status: OrderStatus.CONFIRMED
  });
});

// Queue notification
await this.notificationQueue.add('order-confirmation', { orderId });
```


---

### Borzo Delivery Integration

#### Configuration
```typescript
// Store location (fixed)
const STORE_LOCATION = {
  address: 'La Fête Kitchen, [Full Address], Mumbai',
  latitude: 19.0760, // Replace with actual
  longitude: 72.8777, // Replace with actual
  contactPerson: {
    name: 'La Fête Kitchen',
    phone: '+91XXXXXXXXXX'
  }
};

const BORZO_CONFIG = {
  apiUrl: 'https://robot.borzodelivery.com/api/business/1.2',
  apiToken: process.env.BORZO_API_TOKEN,
  vehicleTypeId: 8, // Car (critical for cakes)
  deliveryRadius: 25000 // 25km in meters
};
```

#### Estimate Delivery Cost
```typescript
async estimateDelivery(latitude: number, longitude: number) {
  // Calculate distance
  const distance = this.calculateDistance(
    STORE_LOCATION.latitude,
    STORE_LOCATION.longitude,
    latitude,
    longitude
  );

  if (distance > BORZO_CONFIG.deliveryRadius) {
    throw new BadRequestException('Delivery address outside service area');
  }

  // Call Borzo API
  const response = await axios.post(
    `${BORZO_CONFIG.apiUrl}/calculate-order`,
    {
      matter: 'Fragile Premium Cake',
      vehicle_type_id: BORZO_CONFIG.vehicleTypeId,
      points: [
        {
          address: STORE_LOCATION.address,
          latitude: STORE_LOCATION.latitude,
          longitude: STORE_LOCATION.longitude
        },
        {
          address: 'Customer Address',
          latitude,
          longitude
        }
      ]
    },
    {
      headers: {
        'X-DV-Auth-Token': BORZO_CONFIG.apiToken
      }
    }
  );

  const estimatedCost = response.data.order.payment_amount;
  const safetyBuffer = estimatedCost * 0.10; // 10% buffer

  return {
    estimatedCost: estimatedCost + safetyBuffer,
    distance: response.data.order.distance,
    duration: response.data.order.delivery_interval_minutes
  };
}
```


#### Book Delivery
```typescript
async bookDelivery(orderId: string) {
  const order = await this.orderRepository.findOne({
    where: { id: orderId },
    relations: ['user', 'deliveryAddress', 'deliverySlot']
  });

  if (order.status !== OrderStatus.READY) {
    throw new BadRequestException('Order must be READY before booking delivery');
  }

  // Prepare Borzo payload
  const payload = {
    type: 'standard',
    matter: 'Fragile Premium Cake - Handle with Care',
    vehicle_type_id: BORZO_CONFIG.vehicleTypeId,
    insurance_amount: Math.round(order.totalAmount),
    points: [
      {
        address: STORE_LOCATION.address,
        contact_person: {
          name: STORE_LOCATION.contactPerson.name,
          phone: STORE_LOCATION.contactPerson.phone
        },
        latitude: STORE_LOCATION.latitude,
        longitude: STORE_LOCATION.longitude
      },
      {
        address: `${order.deliveryAddress.street}, ${order.deliveryAddress.city}, ${order.deliveryAddress.pincode}`,
        contact_person: {
          name: `${order.user.firstName} ${order.user.lastName}`,
          phone: order.user.phone
        },
        latitude: order.deliveryAddress.latitude,
        longitude: order.deliveryAddress.longitude,
        note: order.specialInstructions || ''
      }
    ]
  };

  // Call Borzo API
  const response = await axios.post(
    `${BORZO_CONFIG.apiUrl}/create-order`,
    payload,
    {
      headers: {
        'X-DV-Auth-Token': BORZO_CONFIG.apiToken
      }
    }
  );

  const borzoOrder = response.data.order;

  // Update database in transaction
  await this.dataSource.transaction(async (manager) => {
    await manager.update(Delivery, { order: { id: orderId } }, {
      borzoOrderId: borzoOrder.order_id,
      trackingUrl: borzoOrder.tracking_url,
      status: DeliveryStatus.SEARCHING,
      actualCost: borzoOrder.payment_amount
    });

    await manager.update(Order, { id: orderId }, {
      status: OrderStatus.DISPATCHED
    });
  });

  // Queue notification with tracking link
  await this.notificationQueue.add('order-dispatched', {
    orderId,
    trackingUrl: borzoOrder.tracking_url
  });

  return {
    borzoOrderId: borzoOrder.order_id,
    trackingUrl: borzoOrder.tracking_url
  };
}
```


---

## 5. Background Jobs (BullMQ)

### Queue Configuration
```typescript
// In app.module.ts
BullModule.forRoot({
  redis: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT),
  },
}),
BullModule.registerQueue(
  { name: 'notifications' },
  { name: 'delivery-scheduler' }
)
```

---

### Notification Queue

#### Job: order-confirmation
```typescript
@Processor('notifications')
export class NotificationProcessor {
  @Process('order-confirmation')
  async handleOrderConfirmation(job: Job<{ orderId: string }>) {
    const order = await this.orderRepository.findOne({
      where: { id: job.data.orderId },
      relations: ['user', 'items', 'items.variant', 'items.variant.product']
    });

    // Send Email
    await this.emailService.sendOrderConfirmation({
      to: order.user.email,
      orderNumber: order.orderNumber,
      items: order.items,
      totalAmount: order.totalAmount,
      deliverySlot: order.deliverySlot
    });

    // Send SMS
    await this.smsService.send({
      to: order.user.phone,
      message: `Your La Fête order ${order.orderNumber} is confirmed! We'll notify you when it's dispatched.`
    });

    // Log notification
    await this.notificationRepository.save({
      user: order.user,
      order,
      type: NotificationType.ORDER_CONFIRMATION,
      channel: NotificationChannel.EMAIL,
      recipient: order.user.email,
      isSent: true,
      sentAt: new Date()
    });
  }

  @Process('order-dispatched')
  async handleOrderDispatched(job: Job<{ orderId: string, trackingUrl: string }>) {
    const order = await this.orderRepository.findOne({
      where: { id: job.data.orderId },
      relations: ['user']
    });

    // Send Email with tracking link
    await this.emailService.sendOrderDispatched({
      to: order.user.email,
      orderNumber: order.orderNumber,
      trackingUrl: job.data.trackingUrl
    });

    // Send SMS with tracking link
    await this.smsService.send({
      to: order.user.phone,
      message: `Your La Fête order ${order.orderNumber} is on its way! Track: ${job.data.trackingUrl}`
    });
  }

  @Process('order-delivered')
  async handleOrderDelivered(job: Job<{ orderId: string }>) {
    const order = await this.orderRepository.findOne({
      where: { id: job.data.orderId },
      relations: ['user']
    });

    await this.emailService.sendOrderDelivered({
      to: order.user.email,
      orderNumber: order.orderNumber
    });
  }
}
```


---

### Delivery Scheduler Queue

#### Cron Job: Auto-book deliveries 2 hours before slot
```typescript
@Injectable()
export class DeliverySchedulerService {
  constructor(
    @InjectQueue('delivery-scheduler') private deliveryQueue: Queue,
  ) {}

  @Cron('0 */30 * * * *') // Every 30 minutes
  async scheduleDeliveries() {
    const twoHoursFromNow = new Date(Date.now() + 2 * 60 * 60 * 1000);

    // Find orders that are READY and have delivery slot in 2 hours
    const orders = await this.orderRepository.find({
      where: {
        status: OrderStatus.READY,
        deliverySlot: {
          date: Between(new Date(), twoHoursFromNow)
        }
      },
      relations: ['delivery']
    });

    for (const order of orders) {
      // Check if delivery not already booked
      if (!order.delivery?.borzoOrderId) {
        await this.deliveryQueue.add('auto-book-delivery', {
          orderId: order.id
        });
      }
    }
  }
}

@Processor('delivery-scheduler')
export class DeliverySchedulerProcessor {
  @Process('auto-book-delivery')
  async handleAutoBookDelivery(job: Job<{ orderId: string }>) {
    try {
      await this.deliveryService.bookDelivery(job.data.orderId);
      console.log(`Auto-booked delivery for order ${job.data.orderId}`);
    } catch (error) {
      console.error(`Failed to auto-book delivery: ${error.message}`);
      // Retry logic or alert admin
    }
  }
}
```

---

## 6. Security & Validation

### Authentication Guards

#### JWT Strategy
```typescript
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private userService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: any) {
    const user = await this.userService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
```

#### Roles Guard
```typescript
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<UserRole[]>('roles', context.getHandler());
    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    return requiredRoles.includes(user.role);
  }
}

// Usage in controller
@Roles(UserRole.ADMIN)
@UseGuards(JwtAuthGuard, RolesGuard)
@Patch('orders/:id/status')
async updateOrderStatus() {}
```


---

### DTOs with Validation

#### CreateOrderDto
```typescript
export class CreateOrderDto {
  @IsUUID()
  @IsNotEmpty()
  deliverySlotId: string;

  @IsUUID()
  @IsNotEmpty()
  deliveryAddressId: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  customMessage?: string;

  @IsBoolean()
  @IsOptional()
  isGift?: boolean;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  specialInstructions?: string;
}
```

#### AddToCartDto
```typescript
export class AddToCartDto {
  @IsUUID()
  @IsNotEmpty()
  variantId: string;

  @IsInt()
  @Min(1)
  @Max(10)
  quantity: number;
}
```

#### CreateAddressDto
```typescript
export class CreateAddressDto {
  @IsString()
  @IsNotEmpty()
  label: string;

  @IsString()
  @IsNotEmpty()
  street: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @Matches(/^[0-9]{6}$/)
  pincode: string;

  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;

  @IsString()
  @IsOptional()
  landmark?: string;
}
```

---

### Environment Variables

```env
# Database
DATABASE_URL="postgresql://neondb_owner:password@host/lafete365?sslmode=require"

# Redis
REDIS_HOST="localhost"
REDIS_PORT="6379"

# JWT
JWT_SECRET="your-super-secret-jwt-key-min-32-chars"
JWT_EXPIRATION="7d"

# Razorpay
RAZORPAY_KEY_ID="rzp_test_xxxxx"
RAZORPAY_KEY_SECRET="your_razorpay_secret"
RAZORPAY_WEBHOOK_SECRET="your_webhook_secret"

# Borzo
BORZO_API_URL="https://robot.borzodelivery.com/api/business/1.2"
BORZO_API_TOKEN="your_borzo_token"

# Store Location
STORE_LATITUDE="19.0760"
STORE_LONGITUDE="72.8777"
STORE_ADDRESS="La Fête Kitchen, Full Address, Mumbai"
STORE_PHONE="+91XXXXXXXXXX"

# Email (Nodemailer)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"
EMAIL_FROM="La Fête <noreply@lafete.com>"

# SMS (Twilio or similar)
SMS_PROVIDER_API_KEY="your_sms_api_key"
SMS_FROM="+91XXXXXXXXXX"

# AWS S3
AWS_REGION="ap-south-1"
AWS_ACCESS_KEY_ID="your_access_key"
AWS_SECRET_ACCESS_KEY="your_secret_key"
AWS_S3_BUCKET="lafete-images"

# App
NODE_ENV="development"
PORT="3001"
FRONTEND_URL="http://localhost:3000"
```


---

## 7. Email Templates (Minimalist Style)

### Order Confirmation Email
```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Georgia', serif; color: #2c2c2c; line-height: 1.8; }
    .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
    .header { border-bottom: 1px solid #e0e0e0; padding-bottom: 20px; margin-bottom: 30px; }
    .order-number { font-size: 14px; color: #888; letter-spacing: 1px; }
    .items { margin: 30px 0; }
    .item { padding: 15px 0; border-bottom: 1px solid #f5f5f5; }
    .total { font-size: 18px; font-weight: bold; margin-top: 20px; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #888; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0; font-size: 24px; font-weight: normal;">La Fête</h1>
      <p class="order-number">ORDER #{{orderNumber}}</p>
    </div>

    <p>Dear {{customerName}},</p>
    
    <p>Thank you for your order. We're preparing your premium cake with care.</p>

    <div class="items">
      <h3 style="font-weight: normal; font-size: 16px;">Your Order</h3>
      {{#each items}}
      <div class="item">
        <div>{{productName}} - {{variantName}}</div>
        <div style="color: #888;">Qty: {{quantity}} × ₹{{price}}</div>
      </div>
      {{/each}}
    </div>

    <div class="total">
      <div>Subtotal: ₹{{subtotal}}</div>
      <div>Delivery: ₹{{deliveryFee}}</div>
      <div style="margin-top: 10px;">Total: ₹{{totalAmount}}</div>
    </div>

    <div style="margin-top: 30px; padding: 20px; background: #f9f9f9;">
      <strong>Delivery Details</strong><br>
      {{deliveryDate}} | {{deliveryTime}}<br>
      {{deliveryAddress}}
    </div>

    {{#if customMessage}}
    <div style="margin-top: 20px;">
      <strong>Your Message:</strong><br>
      <em>"{{customMessage}}"</em>
    </div>
    {{/if}}

    <p style="margin-top: 30px;">We'll notify you when your order is dispatched.</p>

    <div class="footer">
      <p>La Fête | Premium Artisanal Cakes<br>
      Mumbai | {{storePhone}} | {{storeEmail}}</p>
    </div>
  </div>
</body>
</html>
```

---

## 8. Testing Strategy

### Unit Tests
- Services: Mock repositories and external APIs
- Guards: Test authentication and authorization logic
- Utilities: Test helper functions (distance calculation, etc.)

### Integration Tests
- API Endpoints: Test full request/response cycle
- Database: Test transactions and constraints
- Queue Jobs: Test job processing logic

### E2E Tests
- Complete order flow: Cart → Order → Payment → Delivery
- Admin workflows: Product management, order status updates
- Error scenarios: Payment failures, stock unavailability

---

## 9. Deployment Checklist

### Pre-Production
- [ ] Set up production database (Neon PostgreSQL)
- [ ] Configure Redis instance
- [ ] Set up AWS S3 bucket for images
- [ ] Register Razorpay production account
- [ ] Register Borzo production account
- [ ] Configure email service (SMTP/SendGrid)
- [ ] Set up SMS service (Twilio)
- [ ] Generate strong JWT secret
- [ ] Set up SSL certificates
- [ ] Configure CORS for production frontend URL

### Production Environment Variables
- [ ] Update all API keys to production values
- [ ] Set NODE_ENV=production
- [ ] Configure proper database connection pooling
- [ ] Set up error monitoring (Sentry)
- [ ] Configure logging (Winston/CloudWatch)

### Post-Deployment
- [ ] Test payment flow with real transactions
- [ ] Test Borzo delivery booking
- [ ] Verify email/SMS notifications
- [ ] Load test API endpoints
- [ ] Set up database backups
- [ ] Configure monitoring and alerts

---

## 10. Next Steps

1. **Phase 1: Core Setup**
   - Set up database entities and migrations
   - Implement authentication module
   - Create product and cart modules

2. **Phase 2: Order Flow**
   - Implement order creation with transactions
   - Integrate Razorpay payment
   - Set up delivery slot management

3. **Phase 3: Delivery Integration**
   - Implement Borzo service
   - Set up webhooks for status updates
   - Create delivery scheduler

4. **Phase 4: Notifications**
   - Set up BullMQ queues
   - Implement email templates
   - Configure SMS service

5. **Phase 5: Admin Panel**
   - Create admin endpoints
   - Implement analytics
   - Add product management

---

**Ready to start implementation? Let me know which module you'd like to build first!**
