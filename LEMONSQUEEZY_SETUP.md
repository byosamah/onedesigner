# Lemon Squeezy Setup Instructions

## 1. Create Products in Lemon Squeezy

Go to your Lemon Squeezy dashboard and create these products:

### Product 1: Starter Pack
- **Name**: 3 Designer Matches
- **Price**: $5.00
- **Description**: Get matched with 3 perfect designers for your project
- **Single payment** (not subscription)
- After creating, copy the **Variant ID**

### Product 2: Growth Pack
- **Name**: 10 Designer Matches  
- **Price**: $15.00
- **Description**: Get matched with 10 designers - perfect for multiple projects
- **Single payment** (not subscription)
- After creating, copy the **Variant ID**

### Product 3: Scale Pack
- **Name**: 25 Designer Matches
- **Price**: $30.00
- **Description**: Get matched with 25 designers - ideal for agencies and teams
- **Single payment** (not subscription)
- After creating, copy the **Variant ID**

## 2. Update Variant IDs

Once you have the variant IDs, update them in `/src/lib/lemonsqueezy/client.ts`:

```typescript
export const PRODUCTS = {
  STARTER_PACK: {
    name: '3 Designer Matches',
    price: 5,
    credits: 3,
    variantId: 'YOUR_STARTER_VARIANT_ID', // <-- Update this
  },
  GROWTH_PACK: {
    name: '10 Designer Matches',
    price: 15,
    credits: 10,
    variantId: 'YOUR_GROWTH_VARIANT_ID', // <-- Update this
  },
  SCALE_PACK: {
    name: '25 Designer Matches',
    price: 30,
    credits: 25,
    variantId: 'YOUR_SCALE_VARIANT_ID', // <-- Update this
  },
}
```

## 3. Set Up Webhook

1. Go to **Settings → Webhooks** in Lemon Squeezy
2. Click **Add webhook**
3. Configure:
   - **URL**: `https://yourdomain.com/api/webhooks/lemonsqueezy` 
     - For local testing: Use ngrok or similar: `https://xxx.ngrok.io/api/webhooks/lemonsqueezy`
   - **Signing secret**: Click to generate one
   - **Events to send**: Select these (one-time payments only):
     - ✅ order_created
     - ✅ order_refunded

4. Copy the **Signing secret** and update `.env.local`:
```
LEMONSQUEEZY_WEBHOOK_SECRET=your-webhook-secret-here
```

## 4. Run Database Migration

Run the payments migration in Supabase:
1. Go to SQL Editor in Supabase
2. Copy contents of `/supabase/migrations/003_payments_and_credits.sql`
3. Run it

## 5. Test the Integration

1. Start your dev server with updated env vars
2. Go through the client flow
3. When you see a match, click one of the payment packages
4. Complete the test purchase in Lemon Squeezy
5. Check that:
   - Payment completes successfully
   - Webhook is received (check logs)
   - Credits are added to client
   - Match is unlocked

## 6. Configure Checkout Experience (Optional)

In Lemon Squeezy, you can customize:
- Checkout theme/colors
- Receipt emails
- Thank you page
- Custom fields

## Current Implementation

✅ Payment packages UI
✅ Checkout creation API
✅ Webhook handling
✅ Credit system
✅ Payment recording
✅ Match unlocking after payment

## Next Steps

1. Add variant IDs to the code
2. Set up webhook with signing secret
3. Test end-to-end flow
4. Add email notifications
5. Create customer portal for viewing credits/purchases