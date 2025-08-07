# Supabase Email Configuration

## Enable Email Authentication in Supabase

1. **Go to your Supabase Dashboard**
   - Navigate to [Authentication → Providers](https://supabase.com/dashboard/project/frwchtwxpnrlpzksupgm/auth/providers)

2. **Configure Email Provider**
   - Email should be enabled by default
   - Make sure "Enable Email provider" is ON
   - Configure these settings:
     - **Enable email confirmations**: OFF (for easier testing)
     - **Enable Magic Link**: OFF
     - **Enable OTP**: ON
     - **OTP expiry duration**: 3600 (1 hour)

3. **Email Templates** (Optional)
   - Go to [Authentication → Email Templates](https://supabase.com/dashboard/project/frwchtwxpnrlpzksupgm/auth/templates)
   - You can customize the OTP email template
   - Default template variables:
     - `{{ .Token }}` - The 6-digit OTP code
     - `{{ .SiteURL }}` - Your site URL
     - `{{ .Email }}` - User's email

4. **SMTP Configuration** (For Production)
   - Go to [Settings → SMTP](https://supabase.com/dashboard/project/frwchtwxpnrlpzksupgm/settings/smtp)
   - By default, Supabase uses their email service (limited to 30 emails/hour)
   - For production, configure your own SMTP:
     - Sender email
     - Sender name
     - SMTP host, port, user, pass

## Testing Email OTP Flow

1. **In Development (Default Supabase Email)**
   - Emails will be sent from `noreply@mail.app.supabase.io`
   - Check your spam folder
   - Limited to 30 emails per hour

2. **View Email Logs**
   - Go to [Authentication → Logs](https://supabase.com/dashboard/project/frwchtwxpnrlpzksupgm/auth/logs)
   - You can see all authentication attempts and email sends

3. **For Local Testing**
   - You can use [Inbucket](https://github.com/inbucket/inbucket) for local email testing
   - Or check the Supabase logs for the OTP codes

## Common Issues

### "Email rate limit exceeded"
- You've hit the 30 emails/hour limit
- Solution: Wait an hour or configure custom SMTP

### OTP not arriving
- Check spam folder
- Check email logs in Supabase dashboard
- Verify email provider is enabled

### "Invalid OTP" error
- OTPs expire after 1 hour (configurable)
- Make sure you're using the latest code
- Check that you're entering all 6 digits

## Next Steps

1. For production, set up a proper SMTP provider:
   - SendGrid
   - AWS SES
   - Postmark
   - Or any SMTP service

2. Customize email templates for branding

3. Consider adding:
   - Rate limiting on your API endpoints
   - Captcha for preventing abuse
   - Email verification requirements