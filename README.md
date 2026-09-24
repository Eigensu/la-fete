# La Fête - Premium Cake Shop E-Commerce Platform

A premium cake shop e-commerce platform with integrated Razorpay payments and WeFast delivery service.

## 🎂 About

La Fête is a full-featured e-commerce platform built specifically for a premium cake shop. It includes:
- **Product Catalog** - Browse and search premium cakes
- **Shopping Cart** - Add items and manage orders
- **Razorpay Integration** - Secure payment processing
- **WeFast Delivery** - Real-time delivery tracking
- **Order Management** - Complete order lifecycle management
- **Admin Dashboard** - Manage products, orders, and customers

## 🏗️ Architecture

This project uses a monorepo structure with the following applications and packages:

### Applications (`apps/`)
- **backend** - NestJS API server with TypeORM, PostgreSQL, Razorpay & WeFast integration
- **frontend** - Next.js 14 customer-facing e-commerce store
- **admin** - Next.js admin dashboard for managing products and orders

### Packages (`packages/`)
- **env-config** - Shared environment configuration with Zod validation
- **ui-components** - Shared UI component library (optional)
- **types** - Shared type definitions (optional)

## 🚀 Quick Start

### Prerequisites
- Node.js 22.18.0+
- pnpm 10.14.0+
- Docker & Docker Compose

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd la-fete
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start infrastructure services**
   ```bash
   docker-compose -f docker/docker-compose.yml up -d
   ```

5. **Run database migrations**
   ```bash
   pnpm run backend:dev
   # In another terminal:
   cd apps/backend
   pnpm run migration:run
   ```

6. **Start development servers**
   ```bash
   # Start all applications
   pnpm run dev

   # Or start individually
   pnpm run backend:dev    # Backend on http://localhost:3001
   pnpm run frontend:dev   # Frontend on http://localhost:3000
   ```

## 🛠️ Development

### Available Scripts

```bash
# Development
pnpm run dev                 # Start all apps in development mode
pnpm run backend:dev         # Start only backend
pnpm run frontend:dev        # Start only frontend

# Building
pnpm run build              # Build all applications
pnpm run build:packages     # Build only shared packages

# Code Quality
pnpm run lint:check         # Run ESLint
pnpm run format:check       # Check Prettier formatting
pnpm run format:fix         # Fix Prettier formatting
pnpm run type-check         # TypeScript type checking

# Environment
pnpm run env-encrypt        # Encrypt .env file
pnpm run env-decrypt        # Decrypt .env file
```

### Database Operations

```bash
cd apps/backend

# Generate migration
pnpm run migration:generate -- src/migrations/MigrationName

# Run migrations
pnpm run migration:run

# Revert migration
pnpm run migration:revert
```

## 🐳 Docker

### Development with Docker Compose

The project includes a complete Docker Compose setup for development:

```bash
# Start all services
docker-compose -f docker/docker-compose.yml up -d

# View logs
docker-compose -f docker/docker-compose.yml logs -f

# Stop services
docker-compose -f docker/docker-compose.yml down
```

### Services
- **PostgreSQL** - Database (port 5433)
- **Redis** - Cache (port 6379)
- **MinIO** - Object storage (port 9000, console 9001)

### Production Deployment

Build production images:

```bash
# Backend
docker build -f apps/backend/Dockerfile -t la-fete-backend .

# Frontend
docker build -f apps/frontend/Dockerfile -t la-fete-frontend .
```

## 📁 Project Structure

```
la-fete/
├── apps/
│   ├── backend/                 # NestJS API
│   │   ├── src/
│   │   │   ├── modules/         # Feature modules
│   │   │   ├── common/          # Shared utilities
│   │   │   ├── config/          # Configuration
│   │   │   └── migrations/      # Database migrations
│   │   └── Dockerfile
│   ├── frontend/                # Next.js app
│   │   ├── src/
│   │   │   ├── app/             # App Router pages
│   │   │   ├── components/      # React components
│   │   │   ├── hooks/           # Custom hooks
│   │   │   └── lib/             # Utilities
│   │   └── Dockerfile
│   └── admin/                   # Admin dashboard
├── packages/
│   ├── env-config/              # Environment validation
│   ├── ui-components/           # Shared components
│   └── types/                   # Shared types
├── docker/
│   ├── docker-compose.yml       # Development services
│   └── postgres.Dockerfile      # Custom PostgreSQL
├── .github/
│   └── workflows/               # CI/CD pipelines
└── ...config files
```

## 🔧 Technology Stack

### Backend
- **NestJS** - Progressive Node.js framework
- **TypeORM** - Object-relational mapping
- **PostgreSQL** - Primary database
- **Redis** - Caching and sessions
- **Razorpay** - Payment gateway integration
- **WeFast** - Delivery service integration
- **Bull** - Job queue for background tasks
- **Nodemailer** - Email notifications
- **Sharp** - Image processing
- **JWT** - Authentication

### Frontend
- **Next.js 14** - React framework with App Router
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Framer Motion** - Animation library
- **Zustand** - State management
- **React Hook Form** - Form handling
- **Zod** - Schema validation
- **Axios** - HTTP client
- **Swiper** - Touch slider for product images

### DevOps & Tooling
- **Turbo** - Monorepo build system
- **pnpm** - Package manager
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Husky** - Git hooks
- **Docker** - Containerization
- **GitHub Actions** - CI/CD

## 🔐 Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
# Database
DATABASE_URL="postgresql://admin:admin@localhost:5433/lafete-db"

# Redis
REDIS_URL="redis://localhost:6379"

# JWT
JWT_SECRET="your-jwt-secret-here"

# MinIO
MINIO_ENDPOINT="localhost"
MINIO_ROOT_USER="minioadmin"
MINIO_ROOT_PASSWORD="minioadmin"

# NextAuth
NEXTAUTH_SECRET="your-nextauth-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# Razorpay Payment Gateway
RAZORPAY_KEY_ID="your-razorpay-key-id"
RAZORPAY_KEY_SECRET="your-razorpay-key-secret"
RAZORPAY_WEBHOOK_SECRET="your-razorpay-webhook-secret"

# WeFast Delivery Integration
WEFAST_API_KEY="your-wefast-api-key"
WEFAST_API_SECRET="your-wefast-api-secret"
WEFAST_BASE_URL="https://api.wefast.com/v1"
WEFAST_WEBHOOK_SECRET="your-wefast-webhook-secret"

# Email Configuration
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-email-password"

# Store Configuration
STORE_NAME="La Fête"
STORE_EMAIL="contact@lafete.com"
STORE_PHONE="+91-XXXXXXXXXX"

# API URLs
API_URL="http://localhost:3001"
GRAPHQL_ENDPOINT="http://localhost:3001/graphql"
```

## 🧪 Testing

```bash
cd apps/backend
pnpm run test       # unit tests (src/**/*.spec.ts)
pnpm run test:cov
pnpm run test:e2e   # end-to-end suite (test/**/*.e2e-spec.ts), needs Postgres
```

### End-to-end suite

`apps/backend/test/checkout-flow.e2e-spec.ts` boots the real Nest app against
a real Postgres and drives it over HTTP: register → admin creates catalog →
cart → order → payment verification → delivery tracking → admin fulfilment,
plus the failure modes (access control, empty cart, full slot, rollbacks,
two customers racing for the last units).

Razorpay, Borzo and SMTP are replaced with stubs in `test/utils/test-app.ts`,
so no secrets or network access are needed. Each run **drops and recreates
the schema** of the database it points at — use a dedicated one:

```bash
createdb lafete_e2e   # or any empty database you don't mind wiping
DATABASE_URL=postgresql://<user>@localhost:5432/lafete_e2e pnpm --filter backend test:e2e
```

### CI

`.github/workflows/ci.yml` runs on every pull request and on pushes to `main`:

| Job | What it checks |
| --- | --- |
| Lint & type-check | ESLint (errors fail, warnings don't) and `tsc` for backend, frontend, env-config |
| Backend unit tests | `jest` |
| Backend e2e | the suite above, against a Postgres 16 service container |
| Build | `nest build` and `next build` |
| Migrations replay & drift check | runs every migration on an empty DB, then `migration:check` fails if the result differs from the entities |

If the drift check fails, you changed an entity without a migration (or the
reverse): run `pnpm --filter backend migration:generate src/migrations/<Name>`
against an up-to-date database and commit the result.

`CI OK` aggregates the required jobs; mark that single check as required in
the `main` branch protection rule.

## 📝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email support@lafete.com or contact us through our website.

## 🎂 Features

- **Product Management** - Add, edit, and manage cake products with images
- **Shopping Cart** - Persistent cart with real-time updates
- **Secure Checkout** - Razorpay payment integration
- **Order Tracking** - Real-time delivery tracking with WeFast
- **User Accounts** - Customer registration and order history
- **Admin Dashboard** - Comprehensive admin panel
- **Email Notifications** - Order confirmations and updates
- **Image Optimization** - Automatic image processing with Sharp
- **Responsive Design** - Mobile-first approach

---

Built with ❤️ for cake lovers