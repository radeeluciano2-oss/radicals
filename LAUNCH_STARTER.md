# Chenie Voice — Launch Starter

This package prepares the repository for a controlled deployment. It does not create
hosting accounts, purchase a domain, or insert secret API credentials.

## Recommended launch order

1. Create a GitHub repository and push this project.
2. Create a Render web service from the repository.
3. Select the included Docker deployment configuration.
4. Add production environment variables in Render.
5. Create the Supabase project and apply the SQL schema.
6. Configure Stripe products, prices, webhook signing secret, and Billing Portal.
7. Add the OpenAI API key with spending limits and alerts.
8. Deploy and verify `/api/health`.
9. Run the end-to-end beta test with one test account.
10. Invite a small group of beta users before public launch.

## Required production variables

Use the names in `.env.example`. Add them through the hosting provider's secret
manager rather than committing them to GitHub.

Keep these server-only:
- OPENAI_API_KEY
- SUPABASE_SERVICE_ROLE_KEY
- STRIPE_SECRET_KEY
- STRIPE_WEBHOOK_SECRET
- INTERNAL_CRON_SECRET

Frontend build variables should use the `VITE_` prefix only when the application
explicitly requires them in browser code. Never expose server secrets through Vite.

## First beta test

- Register a new user.
- Sign in and sign out.
- Generate a short audio clip.
- Confirm the generation is saved in history.
- Confirm character usage decreases once.
- Try an unauthorized API request.
- Test checkout in Stripe test mode.
- Send a signed test webhook.
- Confirm duplicate webhook delivery does not duplicate processing.
- Confirm billing portal access is restricted to the signed-in user.

## Go-live gate

Do not publicly market the service until authentication, usage limits, payment status,
webhook handling, privacy terms, support contact information, and monitoring have been
reviewed and tested.
