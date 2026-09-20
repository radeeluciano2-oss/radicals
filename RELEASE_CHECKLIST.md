# Chenie Voice Release Checklist

## Before release
- [ ] Configure all production secrets in the hosting provider.
- [ ] Apply and verify the Supabase schema.
- [ ] Configure Stripe products, prices, webhook, and Billing Portal.
- [ ] Set OpenAI usage limits and billing alerts.
- [ ] Confirm HTTPS and custom domain.
- [ ] Run `npm ci` and `npm run build`.
- [ ] Run the production smoke test.
- [ ] Test sign-up, sign-in, sign-out, TTS generation, history, checkout, and billing portal.
- [ ] Test invalid tokens and unauthorized access.
- [ ] Verify webhook duplicate events are ignored.
- [ ] Verify usage cannot become negative under concurrent requests.

## Launch
- [ ] Enable monitoring and error alerts.
- [ ] Keep a rollback version available.
- [ ] Publish Terms of Service and Privacy Policy.
- [ ] Confirm customer support contact details.
- [ ] Start with a controlled beta before public marketing.
