# Chenie Voice v4 — SaaS foundation

This version adds the next commercial foundation:

- Supabase schema for profiles, usage, and generation history
- Stripe Checkout endpoint and webhook skeleton
- Environment-based configuration checks
- Rate limiting on TTS requests
- OpenAI TTS generation with validation
- Responsive commercial-style interface

## Run locally

```bash
npm install
cp .env.example .env
npm run dev
```

Open the Vite URL shown in the terminal.

## Configure

1. Add `OPENAI_API_KEY` for real MP3 generation.
2. Create a Supabase project and run `supabase/schema.sql`.
3. Add Supabase environment variables.
4. Create Stripe recurring prices and add the price IDs.
5. Add `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET`.
6. Before launch, implement authenticated request verification, usage transactions, subscription synchronization, email flows, logging, and production secrets management.

## Important

This is a deployable foundation, not a finished live SaaS. Authentication and entitlement checks must be completed before accepting paid customers.


## v5 authentication milestone

- Added Supabase email/password sign-in and sign-up UI.
- Added bearer-token verification middleware to TTS and checkout routes.
- Configure both server-side Supabase variables and Vite `VITE_SUPABASE_*` variables.
- Run the SQL schema before testing account creation.
- Production still requires verified billing entitlements, transactional usage limits, email configuration, and security review.


## v6 usage and entitlement milestone

- Added authenticated `/api/usage` endpoint.
- Added server-side character allowance checks.
- Added generation records and profile usage updates.
- Added remaining-character display in the frontend.

Before production launch, replace the simple read-then-update usage operation with a database transaction/RPC to prevent concurrent-request race conditions, and connect Stripe webhooks to update paid plan entitlements.


## v7 billing and concurrency milestone

- Replaced read-then-update usage logic with an atomic Supabase RPC using row locking.
- Added Stripe checkout metadata for user ID, plan, and character allowance.
- Added webhook handling skeleton for completed checkout and canceled subscriptions.
- Run the updated `supabase/schema.sql` before testing.

Before launch, verify Stripe webhook signatures, handle invoice payment failures and subscription updates, reset monthly usage on a scheduled billing cycle, and test all entitlement transitions.


## v8 lifecycle and monthly reset milestone

- Added an internal monthly reset endpoint protected by `INTERNAL_CRON_SECRET`.
- Added webhook handling for subscription creation/update.
- Added payment-failure status handling.
- Use a trusted scheduler (for example, a platform cron job) to call the monthly reset endpoint once per billing cycle.

Before launch, replace the global reset with a billing-period-aware reset, verify plan limits from your pricing configuration, and add automated tests for webhook idempotency and duplicate events.


## v9 customer dashboard milestone

- Added Studio/Dashboard navigation.
- Added account overview and usage display.
- Added authenticated generation history endpoint.
- Added recent generation history UI.

Before launch, add pagination, export/delete history controls, billing portal integration, and robust authorization tests.


## v10 billing portal milestone

- Added authenticated Stripe Billing Portal endpoint.
- Added dashboard button for customers to manage billing.
- Customers can access Stripe-hosted billing management once the Stripe customer ID is stored.

Configure the Stripe Customer Portal in Stripe Dashboard before testing. Add webhook idempotency, plan-specific entitlements, and payment-history display before production launch.


## v11 security and webhook reliability milestone

- Added Stripe event idempotency storage to prevent duplicate webhook processing.
- Added basic security response headers.
- Added a Supabase table for processed Stripe events.

Before launch:
- Restrict the service-role key to the server only.
- Configure HTTPS and trusted origins.
- Add webhook retry monitoring and reconciliation jobs.
- Add automated tests for duplicate, out-of-order, and failed webhook events.
- Review privacy, terms, refund, and data-retention requirements.


## v12 deployment preparation

### Local verification

```bash
npm install
npm run build
npm start
npm run smoke
```

### Container deployment

```bash
docker build -t chenie-voice .
docker run --env-file .env -p 8787:8787 chenie-voice
```

### Production checklist

- Use HTTPS and a managed domain.
- Keep `SUPABASE_SERVICE_ROLE_KEY` server-side only.
- Configure Stripe webhook endpoint to `/api/stripe/webhook`.
- Configure Stripe Customer Portal.
- Set a strong `INTERNAL_CRON_SECRET`.
- Add platform monitoring and alerting.
- Run the smoke test after deployment.
- Perform a security review before charging customers.
