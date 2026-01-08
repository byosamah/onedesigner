# OneDesigner

<div align="center">
  <img src="public/icon.svg" alt="OneDesigner Logo" width="80" height="80">

  ### AI-Powered Designer-Client Matching Platform

  *Revolutionizing how clients discover and connect with pre-vetted designers through intelligent AI-powered matching.*

  [![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
  [![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green?logo=supabase)](https://supabase.com/)
  [![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel)](https://vercel.com/)
  [![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)
</div>

---

## Overview

OneDesigner is a full-stack platform that uses AI to match clients with the perfect designers for their projects. The platform features a sophisticated 3-phase matching algorithm, secure payment processing, and a complete workflow for designer-client collaboration.

## Features

### For Clients
- **Smart AI Matching**: Advanced algorithm analyzes project briefs to find ideal designers
- **Progressive Matching**: Results that improve in real-time (instant → refined → final)
- **Credit System**: Flexible pay-per-match pricing with volume discounts
- **Working Requests**: One-click system to initiate project collaboration
- **Quality Assurance**: All designers are pre-vetted and admin-approved

### For Designers
- **Application System**: Multi-step portfolio submission process
- **Dashboard**: Manage incoming requests and track opportunities
- **Profile Management**: Showcase skills, experience, and portfolio
- **Project Requests**: 72-hour response window for new opportunities

### For Admins
- **Designer Management**: Review and approve designer applications
- **System Monitoring**: Health checks and performance metrics
- **Content Management**: Blog system for design tips and insights

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 14, React 18, TypeScript, Tailwind CSS |
| **Backend** | Next.js API Routes, Serverless Functions |
| **Database** | Supabase (PostgreSQL) with Row Level Security |
| **AI** | DeepSeek API for intelligent matching |
| **Payments** | LemonSqueezy for subscriptions and one-time payments |
| **Email** | Resend with professional HTML templates |
| **Auth** | Custom OTP-based authentication with secure sessions |
| **Deployment** | Vercel with edge optimization |
| **Testing** | Cypress for E2E, custom test suites |

---

## Getting Started

### Prerequisites

- **Node.js 18+** - [Download](https://nodejs.org/)
- **npm** or **yarn** - Comes with Node.js
- **Supabase Account** - [Sign up](https://supabase.com/)
- **DeepSeek API Key** - [Get API Key](https://platform.deepseek.com/)
- **LemonSqueezy Account** - [Sign up](https://lemonsqueezy.com/) (for payments)
- **Resend Account** - [Sign up](https://resend.com/) (for emails)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/byosamah/onedesigner.git
   cd onedesigner
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` and fill in your credentials (see [Environment Variables](#environment-variables) below).

4. **Set up the database**

   In your Supabase SQL Editor, run the migrations in order:
   ```
   supabase/migrations/001_initial_schema.sql
   supabase/migrations/002_auth_tokens.sql
   supabase/migrations/003_matching_tables.sql
   ...
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open in browser**
   ```
   http://localhost:3000
   ```

---

## Environment Variables

Create a `.env.local` file based on `.env.example`. Here's what each variable does:

### Required Variables

| Variable | Description | Where to Get It |
|----------|-------------|-----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | [Supabase Dashboard](https://supabase.com/dashboard) → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous/public key | Same as above |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-side only) | Same as above |
| `NEXTAUTH_SECRET` | Session encryption key | Generate with `openssl rand -hex 32` |
| `NEXTAUTH_URL` | Your app URL | `http://localhost:3000` for dev |
| `DEEPSEEK_API_KEY` | DeepSeek API key for AI matching | [DeepSeek Platform](https://platform.deepseek.com/) |
| `LEMONSQUEEZY_API_KEY` | LemonSqueezy API key | [LemonSqueezy Settings](https://app.lemonsqueezy.com/settings/api) |
| `LEMONSQUEEZY_WEBHOOK_SECRET` | Webhook signing secret | [LemonSqueezy Webhooks](https://app.lemonsqueezy.com/settings/webhooks) |
| `LEMONSQUEEZY_STORE_ID` | Your LemonSqueezy store ID | LemonSqueezy Dashboard |
| `RESEND_API_KEY` | Resend email API key | [Resend Dashboard](https://resend.com/api-keys) |
| `ADMIN_EMAIL` | Admin user email address | Your email |
| `CRON_SECRET` | Secret for cron job authentication | Generate with `openssl rand -hex 32` |

### Feature Flags (all `true` by default)

```bash
USE_NEW_DATA_SERVICE=true      # Centralized database operations
USE_ERROR_MANAGER=true         # Structured error handling
USE_REQUEST_PIPELINE=true      # Middleware architecture
USE_CONFIG_MANAGER=true        # Configuration management
USE_BUSINESS_RULES=true        # Business logic validation
USE_CENTRALIZED_LOGGING=true   # Structured logging
USE_OTP_SERVICE=true           # OTP management
USE_EMAIL_SERVICE=true         # Email system
```

---

## Project Structure

```
onedesigner/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── api/               # API routes
│   │   ├── client/            # Client pages
│   │   ├── designer/          # Designer pages
│   │   ├── admin/             # Admin dashboard
│   │   └── blog/              # Blog system
│   ├── components/            # React components
│   ├── lib/
│   │   ├── core/              # Centralized services (8-phase architecture)
│   │   ├── ai/                # AI matching system
│   │   ├── supabase/          # Database client
│   │   └── hooks/             # Custom React hooks
│   └── config/                # Configuration files
├── supabase/
│   └── migrations/            # Database migrations
├── public/                    # Static assets
├── cypress/                   # E2E tests
└── scripts/                   # Utility scripts
```

---

## Architecture

OneDesigner uses an 8-phase centralized architecture for maintainability and scalability:

| Phase | Service | Description |
|-------|---------|-------------|
| 1 | **DataService** | Database operations with 5-min query caching |
| 2 | **ErrorManager** | Error classification and structured handling |
| 3 | **RequestPipeline** | Middleware chain for auth, rate limiting, CORS |
| 4 | **ConfigManager** | Centralized configuration with validation |
| 5 | **BusinessRules** | Credit management, matching rules, validation |
| 6 | **LoggingService** | Correlation IDs and structured logging |
| 7 | **OTPService** | Unified OTP with 60-second cooldown |
| 8 | **EmailService** | Template-based emails with queue management |

---

## API Endpoints

### Matching
- `POST /api/match/find` - Find matching designers
- `POST /api/match/find-optimized` - Progressive matching with SSE
- `POST /api/match/find-new` - Create new match with auto-unlock

### Client
- `POST /api/client/briefs` - Create project brief
- `POST /api/client/matches/[id]/unlock` - Unlock designer profile
- `POST /api/client/matches/[id]/contact` - Send working request

### Designer
- `POST /api/designer/apply` - Submit application
- `GET /api/designer/project-requests` - View incoming requests
- `POST /api/designer/project-requests/[id]/respond` - Accept/decline

### Admin
- `GET /api/admin/designers` - List all designers
- `POST /api/admin/designers/[id]/approve` - Approve designer
- `GET /api/health` - System health check

---

## Payment System

### Credit Packages
| Package | Price | Credits |
|---------|-------|---------|
| Starter | $5 | 3 matches |
| Growth | $15 | 10 matches |
| Scale | $30 | 25 matches |

### Webhook Setup
1. Go to [LemonSqueezy Webhooks](https://app.lemonsqueezy.com/settings/webhooks)
2. Add webhook URL: `https://your-domain.com/api/webhooks/lemonsqueezy`
3. Copy the signing secret to `LEMONSQUEEZY_WEBHOOK_SECRET`
4. Enable event: `order_created`

---

## Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run typecheck    # Run TypeScript checks
npm run format       # Format code with Prettier
```

### Testing

```bash
# E2E Tests with Cypress
npm run cypress:open    # Interactive mode
npm run cypress:run     # Headless mode

# Run specific test suites
./test/test-data-service.sh
./test/test-ai-matching-flow.sh
```

---

## Deployment

### Deploy to Vercel

1. **Connect to Vercel**
   ```bash
   npm i -g vercel
   vercel login
   vercel link
   ```

2. **Add environment variables**

   Go to Vercel Dashboard → Project → Settings → Environment Variables

   Add all variables from your `.env.local`

3. **Deploy**
   ```bash
   vercel --prod
   ```

### Post-Deployment Checklist
- [ ] Verify environment variables are set
- [ ] Test payment webhook with LemonSqueezy test mode
- [ ] Confirm emails are being sent via Resend
- [ ] Test AI matching with a sample brief
- [ ] Set up the admin account

---

## Security

- **Session Management**: HTTP-only cookies with secure flags
- **OTP Verification**: Rate-limited (60-second cooldown)
- **Webhook Verification**: HMAC signature validation
- **Input Validation**: Zod schemas for all API inputs
- **SQL Injection Prevention**: Prepared statements via Supabase
- **Rate Limiting**: Request throttling per endpoint

See [SECURITY.md](SECURITY.md) for our security policy.

---

## Documentation

Detailed documentation is available in CLAUDE.md files throughout the codebase:

- **[Main Documentation](CLAUDE.md)** - Complete system overview
- **[API Routes](src/app/api/CLAUDE.md)** - API documentation
- **[Core Services](src/lib/core/CLAUDE.md)** - Architecture details
- **[Components](src/components/CLAUDE.md)** - UI components
- **[Database](supabase/CLAUDE.md)** - Schema documentation

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Follow the centralized architecture patterns
4. Add tests for new functionality
5. Update relevant documentation
6. Commit your changes (`git commit -m 'Add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Support

- **Documentation**: Check the CLAUDE.md files in each directory
- **Issues**: [GitHub Issues](https://github.com/byosamah/onedesigner/issues)
- **Discussions**: [GitHub Discussions](https://github.com/byosamah/onedesigner/discussions)

---

<div align="center">
  <strong>Built with ❤️ for designers and clients everywhere</strong>

  *Making creative connections effortless through AI*
</div>
