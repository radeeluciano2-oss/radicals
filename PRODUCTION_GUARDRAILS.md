# Production Guardrails

Run the environment validation before deploying:

```bash
npm run validate:env
```

The validator checks that required server-side configuration exists and that `APP_URL`
uses HTTP or HTTPS. It does not verify whether credentials are valid, whether Stripe
webhooks are configured correctly, or whether Supabase policies are secure.

## Safe handling

- Store secrets only in the hosting provider's secret manager.
- Never commit `.env` files.
- Do not place service-role, Stripe secret, or OpenAI keys in frontend variables.
- Use Stripe test mode before accepting real payments.
- Review logs for accidental secret disclosure.
- Rotate credentials immediately if they are exposed.
