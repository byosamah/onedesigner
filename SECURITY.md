# Security Policy

## Reporting Security Vulnerabilities

If you discover a security vulnerability in OneDesigner, please report it responsibly:

1. **Do NOT** create a public GitHub issue for security vulnerabilities
2. Email details to the project maintainer privately
3. Include steps to reproduce the vulnerability
4. Allow reasonable time for a fix before public disclosure

## Environment Variables

This project requires sensitive environment variables to function. Follow these guidelines:

### Setup
1. Copy `.env.example` to `.env.local`
2. Fill in your own API keys and secrets
3. **NEVER** commit `.env.local` or any file containing real secrets

### Required Secrets
- **Supabase**: Database credentials (get from Supabase dashboard)
- **DeepSeek**: AI API key (get from DeepSeek platform)
- **LemonSqueezy**: Payment processing credentials
- **Resend**: Email service API key
- **NextAuth**: Session signing secret (generate with `openssl rand -hex 32`)

### Secret Generation
For secrets that need to be generated (like NEXTAUTH_SECRET):
```bash
openssl rand -hex 32
```

## Security Best Practices

### For Contributors
- Never hardcode API keys, passwords, or secrets in code
- Use environment variables for all sensitive configuration
- Never log sensitive data (passwords, API keys, tokens)
- Review code changes for accidental secret exposure before committing

### For Users
- Rotate your API keys if you suspect they've been exposed
- Use strong, unique passwords for all service accounts
- Enable 2FA where available (Supabase, GitHub, Vercel)
- Keep dependencies updated to patch security vulnerabilities

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| Latest  | :white_check_mark: |

## Security Features

OneDesigner implements several security measures:

- **Session Management**: HTTP-only cookies with secure flags
- **OTP Verification**: Rate-limited one-time passwords
- **Webhook Verification**: HMAC signature validation for payment webhooks
- **Input Validation**: Schema validation for all API inputs
- **SQL Injection Prevention**: Prepared statements via Supabase client
- **CORS**: Restricted to allowed domains
- **Rate Limiting**: Request throttling to prevent abuse

## Disclosure Policy

We aim to patch critical security vulnerabilities within 48 hours of confirmed report and will acknowledge security researchers who report responsibly.
