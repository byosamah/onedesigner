# Complete Vercel Environment Variables for OneDesigner.app

## 🎯 Ready to Copy-Paste into Vercel

### ✅ Complete Variables (Copy these exactly):

```
Variable Name: NEXT_PUBLIC_APP_URL
Value: https://onedesigner.app

Variable Name: NEXTAUTH_URL  
Value: https://onedesigner.app

Variable Name: NEXTAUTH_SECRET
Value: 898b848f7289de7aef74edccf4f9a0a899ca6f125a048cb588ca388aa2db97c6

Variable Name: CRON_SECRET
Value: 20e0ddd37fc67741e38fdd0ed00c7f09c3e2264d385cd868f2a2ff22984882a8

Variable Name: NEXT_PUBLIC_SUPABASE_URL
Value: https://frwchtwxpnrlpzksupgm.supabase.co

Variable Name: DEEPSEEK_API_KEY
Value: sk-7404080c428443b598ee8c76382afb39

Variable Name: EMAIL_FROM
Value: hello@onedesigner.app

Variable Name: RESEND_API_KEY
Value: re_KL6peoSX_KsWzKz8JhALUK3BdttMNS8M8

Variable Name: NODE_ENV
Value: production
```

### 🔍 Need to Get From Your Dashboards:

#### Supabase Keys (2 variables needed):
1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Select project: `frwchtwxpnrlpzksupgm` 
3. Go to **Settings** → **API**
4. Copy these two keys:

```
Variable Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: [Copy the "anon" key - starts with "eyJ"]

Variable Name: SUPABASE_SERVICE_ROLE_KEY  
Value: [Copy the "service_role" key - starts with "eyJ"]
```

#### LemonSqueezy Keys (3 variables needed):
1. Go to [app.lemonsqueezy.com](https://app.lemonsqueezy.com)
2. **For API Key**:
   - Go to **Settings** → **API**
   - Create/copy API key
3. **For Store ID**:
   - Go to **Stores** 
   - Copy the store ID number
4. **For Webhook Secret**:
   - Go to **Settings** → **Webhooks**
   - Create webhook with URL: `https://onedesigner.app/api/webhooks/lemonsqueezy`
   - Copy the signing secret

```
Variable Name: LEMONSQUEEZY_API_KEY
Value: eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiI5NGQ1OWNlZi1kYmI4LTRlYTUtYjE3OC1kMjU0MGZjZDY5MTkiLCJqdGkiOiIxYzE1YTY5YjgyMDVjMzU1M2JiMmE1OGI1NDI2NGFlZTkxN2UyZWQzZTZlNGExMWI3Y2VjMDFhMTkyMzdlZWM1ZTViNTJhY2U1MzNmNzI2MyIsImlhdCI6MTc1NDYwMjU3NS4xMjM0MiwibmJmIjoxNzU0NjAyNTc1LjEyMzQyMiwiZXhwIjoyMDcwMTM1Mzc1LjA5MTA1Nywic3ViIjoiMjMxMTAzOCIsInNjb3BlcyI6W119.APdYAJlDKHQVWImDSUzmH-bdW-Jsa6YQvNONmMQb5NAWt8ayRVzyImADmJXC7TpuGJaIVp7qaIR_cftGtjEcopnurlKOeOLh3S7q_GXq9pV9nTUyXDan_-TMslPo3QNh9S4zvcNmZ2cdcmzc_8UHj4Jd7YHwSnx6ZPXToOTV5qOCiIYZesbIT5IPfMOqabRgxOTsP5_BWQVIjLpCRF1AHa1Y0cTIVjrj9jeLVdxCuX0d-uTbwiMdMK9JwguQ5W3AETGvfdSYm1zf44QLbT3lwnXTnEoXAHihP5mF5kglOxDWp4e05aexPLnbwzbNb-H9CLjLcllUHIMkmKF_EKWoNTk0mFIj3ZHxJQ7i4qnCY1fsUkLsG_Gd7ARs4YEi_HCI2eLOzArTx9nG9qelMydmGl2KQ6zAZ9MfJVOt9DHVFXYm53qB_A5VNhrSRd6x7gN0b1I_ZQyIlu00Sc6tJprC1g5ojaVdPqfsEvUlF4DCLU0vYFdAMnRxBxPlCkWcHWb6

Variable Name: LEMONSQUEEZY_STORE_ID
Value: [Your store ID - just the number]

Variable Name: LEMONSQUEEZY_WEBHOOK_SECRET
Value: [Your webhook signing secret]
```

## 📋 Quick Checklist:

- [ ] 9 variables ready to copy-paste ✅
- [ ] 2 Supabase keys from dashboard
- [ ] 3 LemonSqueezy keys from dashboard
- [ ] **Total: 14 environment variables**

## 🚀 After Adding All Variables:

1. **Redeploy in Vercel**:
   - Go to **Deployments** tab
   - Click **Redeploy** on latest deployment
   - Select **Use existing Build Cache: No**
   - Click **Redeploy**

2. **Verify deployment**:
   - Check that build completes successfully
   - Test the live URL once deployed

## 🔧 Testing Your Setup:

Once all variables are set, you can test locally by creating a `.env.local` file with all these variables and running:

```bash
npm run check-env
```

This will validate all environment variables are properly configured.