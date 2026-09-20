# Chenie Voice Deployment Runbook

## 1. Prepare services

Create/configure:
- Supabase project and database schema
- OpenAI API key with spending limits
- Stripe products and recurring prices
- Hosting service with HTTPS

## 2. Configure secrets

Set every variable in `.env.example` in the hosting provider's secret manager.
Never commit `.env` files or expose the Supabase service-role key in frontend code.

## 3. Apply database schema

Run `supabase/schema.sql` in the Supabase SQL editor, then verify:
- Row Level Security is enabled
- The monthly reset function exists
- Stripe event storage exists
- The authenticated user can read only their own rows

## 4. Configure Stripe

Set the webhook URL to:

`https://YOUR_DOMAIN/api/stripe/webhook`

Subscribe to the checkout, subscription, and invoice payment events used by the server.
Use the Billing Portal for customer self-service.

## 5. Deploy

Build and deploy the Docker image. Confirm:

- `/api/health` returns HTTP 200
- `/api/config` does not reveal secrets
- An authenticated user can generate audio
- A generation appears in history
- Usage is deducted atomically
- Checkout and webhook signatures are verified

## 6. Post-deployment

Run the smoke test against the deployed URL:

```bash
APP_URL=https://YOUR_DOMAIN npm run smoke
```

Before launch, perform a complete review of authentication, authorization, billing edge cases,
rate limits, data retention, abuse prevention, and monitoring.
