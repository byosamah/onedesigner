# Vercel Environment Variables Setup for OneDesigner.app

## 📋 Step-by-Step Vercel Configuration

### 1. Access Vercel Dashboard
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your `onedesigner` project
3. Go to **Settings** → **Environment Variables**

### 2. Add Environment Variables

Copy and paste these **exact** environment variables into Vercel:

#### 🌐 Domain & App Configuration
```
NEXT_PUBLIC_APP_URL
https://onedesigner.app
```

#### 🔐 Authentication & Security
```
NEXTAUTH_URL
https://onedesigner.app
```

```
NEXTAUTH_SECRET
898b848f7289de7aef74edccf4f9a0a899ca6f125a048cb588ca388aa2db97c6
```

```
CRON_SECRET
20e0ddd37fc67741e38fdd0ed00c7f09c3e2264d385cd868f2a2ff22984882a8
```

#### 🗄️ Supabase Configuration
```
NEXT_PUBLIC_SUPABASE_URL
https://frwchtwxpnrlpzksupgm.supabase.co
```

```
NEXT_PUBLIC_SUPABASE_ANON_KEY
[GET FROM YOUR SUPABASE DASHBOARD → Settings → API]
```

```
SUPABASE_SERVICE_ROLE_KEY
[GET FROM YOUR SUPABASE DASHBOARD → Settings → API]
```

#### 🤖 AI Configuration
```
DEEPSEEK_API_KEY
sk-7404080c428443b598ee8c76382afb39
```

#### 📧 Email Configuration
```
EMAIL_FROM
magic@onedesigner.app
```

```
RESEND_API_KEY
[GET FROM YOUR RESEND DASHBOARD → API Keys]
```

#### 💳 Payment Configuration
```
LEMONSQUEEZY_API_KEY
[GET FROM LEMONSQUEEZY DASHBOARD → Settings → API]
```

```
LEMONSQUEEZY_WEBHOOK_SECRET
[GET FROM LEMONSQUEEZY WEBHOOK SETTINGS]
```

```
LEMONSQUEEZY_STORE_ID
[GET FROM LEMONSQUEEZY DASHBOARD → Stores]
```

#### 🌍 Environment
```
NODE_ENV
production
```

#### 📊 Analytics (Optional)
```
NEXT_PUBLIC_VERCEL_ANALYTICS_ID
[AUTO-GENERATED WHEN YOU ENABLE VERCEL ANALYTICS]
```

## 📝 How to Find Missing Values

### Supabase Keys:
1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your project: `frwchtwxpnrlpzksupgm`
3. Go to **Settings** → **API**
4. Copy:
   - `anon` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`

### Resend API Key:
1. Go to [resend.com/api-keys](https://resend.com/api-keys)
2. Create a new API key
3. Copy the key → `RESEND_API_KEY`

### LemonSqueezy Configuration:
1. Go to [app.lemonsqueezy.com/settings/api](https://app.lemonsqueezy.com/settings/api)
2. Create API key → `LEMONSQUEEZY_API_KEY`
3. Go to **Webhooks** → Create webhook
4. Set URL: `https://onedesigner.app/api/webhooks/lemonsqueezy`
5. Copy signing secret → `LEMONSQUEEZY_WEBHOOK_SECRET`
6. Get Store ID from **Stores** page → `LEMONSQUEEZY_STORE_ID`

## ✅ Verification Checklist

After adding all variables:

- [ ] Total variables: 13-14 (analytics optional)
- [ ] All secrets are unique and secure
- [ ] Supabase keys match your project
- [ ] LemonSqueezy webhook points to production URL
- [ ] Email sender domain matches `onedesigner.app`
- [ ] NODE_ENV is set to `production`

## 🚨 Important Security Notes

1. **Never commit these values to Git**
2. **Keep secrets secure and unique**
3. **Regenerate secrets if compromised**
4. **Use production keys only for production**

## 🔄 After Setting Variables

1. Go to **Deployments** tab in Vercel
2. Click **Redeploy** on your latest deployment
3. Select **Use existing Build Cache: No**
4. Click **Redeploy**

This ensures the new environment variables are applied to your deployment.

## 📞 Support

If you encounter issues:
- Supabase keys not working → Check project URL matches
- LemonSqueezy webhook failing → Verify webhook URL and secret
- Email not sending → Verify Resend domain setup
- Authentication issues → Check NEXTAUTH_SECRET and URL