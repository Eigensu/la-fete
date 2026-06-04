# Environment Configuration

This project uses a **single root `.env` file** for all environment variables.

## Setup

1. Copy the example file:
   ```bash
   cp .env.example .env
   ```

2. Update the `.env` file with your actual values:
   - **DATABASE_URL**: Your Neon PostgreSQL connection string
   - **JWT_SECRET**: Generate a secure random string (min 32 characters)
   - **NEXTAUTH_SECRET**: Generate a secure random string (min 32 characters)
   - **RAZORPAY_KEY_ID** & **RAZORPAY_KEY_SECRET**: Your Razorpay credentials
   - **WEFAST_API_KEY** & **WEFAST_API_SECRET**: Your WeFast credentials
   - Other configuration as needed

## How it works

- The root `.env` file is loaded by both backend and frontend
- Backend uses `@nestjs/config` to load from root `.env`
- Frontend (Next.js) automatically loads `.env` from the project root
- All apps share the same environment variables

## Security

- Never commit `.env` to git (it's in `.gitignore`)
- Use `.env.example` as a template
- Use `pnpm run env-encrypt` to encrypt sensitive values for production
