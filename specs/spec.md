This detailed technical specification outlines the backend architecture for **La Fête 365**, a premium cake e-commerce platform. The system is built using **NestJS**, **PostgreSQL** (via **TypeORM**), and integrates **Razorpay** for payments and **Borzo (WeFast)** for hyper-local delivery.

### **1. System Architecture & Tech Stack**

* **Framework:** NestJS (Node.js) - Chosen for its modular architecture, dependency injection, and TypeScript support.
* **Database:** PostgreSQL 16+
* **ORM:** TypeORM (Data Mapper pattern recommended for complex logic).
* **Task Queue:** BullMQ (Redis) - Critical for handling background jobs like sending emails or triggering delivery requests without blocking the API.
* **Storage:** AWS S3 (or similar) for storing high-resolution cake images.
* **Containerization:** Docker & Docker Compose.

---

### **2. Database Schema Design (TypeORM Entities)**

The schema is designed to handle the "Premium" nature of the brand, including specific delivery slots, gift messages, and strict inventory management.

#### **A. Users & Authentication**

* **Entity:** `User`
* `id` (UUID)
* `email` (Unique)
* `password` (Hashed)
* `role` (Enum: `CUSTOMER`, `ADMIN`)
* `phone` (Required for delivery coordination)


* **Entity:** `Address`
* `id` (UUID)
* `userId` (FK)
* `street`, `city`, `pincode`
* `latitude`, `longitude` (**Crucial**: Borzo requires coordinates for accurate pricing).



#### **B. Product Catalog**

* **Entity:** `Product`
* `id` (UUID)
* `name` (e.g., "Rose Pistachio Entremet")
* `description` (Rich text)
* `basePrice` (Decimal)
* `images` (Array of Strings)
* `isAvailable` (Boolean)
* `variants` (One-to-Many: e.g., 500g, 1kg)



#### **C. Order Management**

* **Entity:** `Order`
* `id` (UUID)
* `orderNumber` (Auto-increment, user-facing ID)
* `userId` (FK)
* `status` (Enum: `PENDING`, `CONFIRMED`, `BAKING`, `READY`, `DISPATCHED`, `DELIVERED`, `CANCELLED`)
* `totalAmount` (Decimal)
* `deliverySlot` (Timestamp: e.g., `2026-02-14 14:00:00`)
* `customMessage` (String: For cake inscriptions/cards)
* `isGift` (Boolean)



#### **D. Integrations**

* **Entity:** `Payment`
* `id` (UUID)
* `orderId` (FK)
* `razorpayOrderId` (String)
* `razorpayPaymentId` (String, nullable until success)
* `status` (Enum: `CREATED`, `CAPTURED`, `FAILED`)


* **Entity:** `Delivery`
* `id` (UUID)
* `orderId` (FK)
* `borzoOrderId` (String: External ID from WeFast)
* `trackingUrl` (String)
* `courierName` (String)
* `courierPhone` (String)
* `deliveryStatus` (Enum: `SEARCHING`, `ASSIGNED`, `PICKED_UP`, `COMPLETED`)



---

### **3. Module Breakdown & API Logic**

#### **Module 1: Payment (Razorpay Integration)**

**Goal:** Securely capture payments before confirming the order.

1. **Create Order Endpoint:** `POST /payments/create-order`
* **Logic:**
* Calculate `totalAmount` from the database (never trust client-side prices).
* Call Razorpay API to generate an `order_id`.
* Return `key_id`, `amount`, `currency`, and `order_id` to the frontend.




2. **Verify Payment Endpoint:** `POST /payments/verify`
* **Logic:**
* Receive `razorpay_order_id`, `razorpay_payment_id`, and `razorpay_signature`.
* Verify signature using HMAC SHA256.
* **Transaction:** If valid, update `Payment` status to `CAPTURED` and `Order` status to `CONFIRMED`.





#### **Module 2: Logistics (Borzo/WeFast Integration)**

**Goal:** Automate hyper-local delivery booking.

1. **Estimate Delivery Cost:** `GET /delivery/estimate`
* **Input:** User's Lat/Long.
* **Logic:** Call Borzo API (`/calculate-order`) with store location (fixed) and user location. Add a safety buffer (e.g., 10%) to the cost.


2. **Book Delivery (Admin/Auto):** `POST /delivery/book/:orderId`
* **Trigger:** Can be manual (Admin button) or scheduled (Cron job 2 hours before `deliverySlot`).
* **Payload to Borzo:**
```json
{
  "type": "standard",
  "matter": "Fragile Cake",
  "vehicle_type_id": 8, // "Car" - Critical for cakes to prevent damage
  "insurance_amount": 2000, // Order value
  "points": [
    { "address": "La Fête Kitchen", "contact_person": { "phone": "+91..." } },
    { "address": "User Address", "contact_person": { "phone": "User Phone" } }
  ]
}

```


* **Response:** Save `borzo_order_id` and `tracking_url` to the database.



#### **Module 3: Admin Panel**

**Goal:** Manage operations for "Premium" service.

* `GET /admin/orders`: Filter by date and status (e.g., "Show all orders for tomorrow").
* `PATCH /admin/orders/:id/status`: Update status (e.g., change `CONFIRMED` to `BAKING`).
* `GET /admin/analytics`: View total revenue, popular cakes, and delivery performance.

---

### **4. Security & Configuration**

* **Environment Variables (`.env`):**
```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=secret
DB_NAME=lafete365
JWT_SECRET=complex_secret_key
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...
BORZO_API_URL=https://robot.borzodelivery.com/api/business/1.2
BORZO_API_TOKEN=...

```


* **Guards:**
* `JwtAuthGuard`: Protects customer routes.
* `RolesGuard`: Protects admin routes (requires `role === 'ADMIN'`).


* **Validation:** Use `class-validator` DTOs for all inputs (e.g., ensuring `deliverySlot` is in the future).

### **5. Detailed Order Flow (State Machine)**

1. **User** adds Cake to Cart -> `POST /cart`.
2. **User** checks out -> `POST /orders` (Status: `PENDING`).
3. **User** pays via Razorpay -> `POST /payments/verify` (Status: `CONFIRMED`).
4. **Admin** sees order -> Kitchen starts baking -> Admin updates status to `BAKING`.
5. **System/Admin** books Borzo -> Status `DISPATCHED`.
6. **Borzo Webhook** confirms delivery -> Status `DELIVERED`.

**Would you like me to generate the specific NestJS service code for the `BorzoService` class to handle the API communication?**