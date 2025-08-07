# Production Deployment Guide for OneDesigner.app

## 🚀 Deployment Checklist

### 1. Domain Configuration
- [x] Domain: `onedesigner.app` 
- [ ] DNS pointed to Vercel
- [ ] SSL certificate configured

### 2. Vercel Setup
1. **Connect Repository**:
   - Import project from GitHub: `ruzmaco/onedesigner`
   - Set framework preset to: `Next.js`
   - Set build command to: `npm run build`

2. **Environment Variables** (Add in Vercel Dashboard):
   ```
   NEXT_PUBLIC_APP_URL=https://onedesigner.app
   NEXT_PUBLIC_SUPABASE_URL=https://frwchtwxpnrlpzksupgm.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-supabase-anon-key]
   SUPABASE_SERVICE_ROLE_KEY=[your-supabase-service-key]
   NEXTAUTH_URL=https://onedesigner.app
   NEXTAUTH_SECRET=[generate-random-string]
   RESEND_API_KEY=[your-resend-key]
   EMAIL_FROM=magic@onedesigner.app
   LEMONSQUEEZY_API_KEY=[your-lemon-squeezy-key]
   LEMONSQUEEZY_WEBHOOK_SECRET=[your-webhook-secret]
   LEMONSQUEEZY_STORE_ID=[your-store-id]
   DEEPSEEK_API_KEY=sk-7404080c428443b598ee8c76382afb39
   CRON_SECRET=[generate-random-string]
   NODE_ENV=production
   ```

3. **Domain Configuration**:
   - Add custom domain: `onedesigner.app`
   - Add redirect from `www.onedesigner.app` to `onedesigner.app`

### 3. Supabase Configuration

1. **Authentication URLs**:
   - Site URL: `https://onedesigner.app`
   - Redirect URLs: 
     - `https://onedesigner.app/auth/callback`
     - `https://onedesigner.app/auth/verify`
     - `https://onedesigner.app/admin/verify`
     - `https://onedesigner.app/designer/login/verify`

2. **CORS Origins**:
   - Add: `https://onedesigner.app`
   - Add: `https://*.vercel.app` (for preview deployments)

### 4. LemonSqueezy Configuration

1. **Webhook URL**:
   - Set to: `https://onedesigner.app/api/webhooks/lemonsqueezy`

2. **Store Settings**:
   - Update store domain to: `onedesigner.app`
   - Update return URLs to use production domain

### 5. Email Configuration

1. **Resend Domain**:
   - Add and verify domain: `onedesigner.app`
   - Set up SPF, DKIM, DMARC records

2. **Email Templates**:
   - Update all email templates to use `onedesigner.app` branding

### 6. Post-Deployment Testing

- [ ] Homepage loads correctly
- [ ] Authentication flow works (OTP emails)
- [ ] Admin panel accessible
- [ ] Designer registration works
- [ ] Client brief submission works
- [ ] Payment flow functional
- [ ] AI matching system works
- [ ] Cron jobs running (check `/api/cron/embeddings`)

### 7. Monitoring Setup

1. **Vercel Analytics**:
   - Enable Web Analytics
   - Enable Speed Insights

2. **Error Monitoring**:
   - Set up error tracking (Sentry recommended)

### 8. SEO & Performance

1. **Meta Tags**:
   - Verify all pages have proper meta descriptions
   - Check OpenGraph tags

2. **Performance**:
   - Run Lighthouse audits
   - Optimize Core Web Vitals

## 🔧 Commands for Deployment

```bash
# Build and test locally first
npm run build
npm run start

# Deploy to Vercel (automatic on push to main)
git push origin main

# Manual deployment (if needed)
npx vercel --prod
```

## 📊 Post-Launch Monitoring

- **Performance**: Monitor Core Web Vitals in Vercel
- **Errors**: Check Vercel Function logs for API errors
- **Database**: Monitor Supabase usage and performance
- **Payments**: Track LemonSqueezy webhook success rates
- **AI**: Monitor DeepSeek API usage and costs

## 🚨 Troubleshooting

### Common Issues:

1. **Authentication not working**:
   - Check Supabase auth URLs configuration
   - Verify NEXTAUTH_URL environment variable

2. **Payments failing**:
   - Verify LemonSqueezy webhook URL
   - Check webhook secret matches

3. **AI matching not working**:
   - Verify DEEPSEEK_API_KEY is set
   - Check Supabase RLS policies for matches table

4. **Emails not sending**:
   - Verify Resend domain setup
   - Check EMAIL_FROM matches verified domain

5. **Cron jobs not running**:
   - Check CRON_SECRET environment variable
   - Verify Vercel cron configuration

## 📞 Support Contacts

- **Vercel Support**: support@vercel.com
- **Supabase Support**: support@supabase.io  
- **LemonSqueezy Support**: support@lemonsqueezy.com
- **Resend Support**: support@resend.com