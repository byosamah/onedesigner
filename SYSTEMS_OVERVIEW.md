# OneDesigner Systems Overview

## 1. Authentication & Session System
**Purpose**: Handle user authentication, sessions, and access control
**Source Files**:
- `/src/lib/auth/session-handlers.ts` - Centralized session management
- `/src/lib/auth/custom-otp.ts` - Custom OTP implementation
- `/src/lib/auth/otp.ts` - OTP utilities
- `/src/lib/auth/supabase-auth.ts` - Supabase authentication wrapper
- `/src/lib/constants/index.ts` - AUTH_COOKIES, OTP_CONFIG constants

**Features**:
- OTP-based authentication (no passwords)
- Separate client/designer/admin sessions
- Cookie-based session management
- Session validation middleware

## 2. Database System
**Purpose**: Manage all database operations and data access
**Provider**: Supabase (PostgreSQL)
**Source Files**:
- `/src/lib/supabase/server.ts` - Server-side Supabase client
- `/src/lib/supabase/client.ts` - Client-side Supabase client
- `/src/lib/database/base.ts` - Base database service class
- `/src/lib/database/designer-service.ts` - Designer-specific operations
- `/src/lib/database/client-service.ts` - Client-specific operations

**Key Tables**:
- `designers` - Designer profiles
- `clients` - Client accounts
- `briefs` - Project briefs
- `matches` - AI-generated matches
- `conversations` - Messaging conversations
- `messages` - Individual messages
- `designer_embeddings` - Vector embeddings for matching
- `match_cache` - Cached AI analysis
- `client_designers` - Unlocked designers per client

## 3. AI Matching System
**Purpose**: Match clients with designers using AI
**AI Provider**: DeepSeek API
**Source Files**:
- `/src/lib/ai/providers/deepseek.ts` - DeepSeek API integration
- `/src/lib/ai/providers/fallback.ts` - Fallback matching logic
- `/src/lib/ai/index.ts` - AI service orchestrator
- `/src/lib/ai/enhanced-matching-prompt.ts` - AI prompt templates
- `/src/lib/matching/enhanced-matcher.ts` - Enhanced matching algorithm
- `/src/lib/matching/optimized-matcher.ts` - Speed-optimized matcher
- `/src/lib/matching/simple-matcher.ts` - Basic matching logic
- `/src/lib/matching/embedding-service.ts` - Vector embedding service
- `/src/lib/matching/matching-cache.ts` - Match result caching
- `/src/lib/matching/explanation-generator.ts` - Match explanation generator

**Features**:
- 3-phase progressive matching (instant → refined → deep)
- Vector embeddings for similarity search
- AI-powered scoring (50-80% typical range)
- Personalized match explanations
- Result caching for performance

## 4. Payment System
**Purpose**: Handle payments and credit management
**Provider**: LemonSqueezy
**Source Files**:
- `/src/lib/lemonsqueezy/checkout.ts` - Checkout creation
- `/src/app/api/webhooks/lemonsqueezy/route.ts` - Payment webhook
- `/src/app/api/payment/create-checkout/route.ts` - Checkout API
- `/src/lib/api/payment.ts` - Payment API client

**Packages**:
- Starter: $5 for 3 matches
- Growth: $15 for 10 matches
- Scale: $30 for 25 matches

## 5. Email System
**Purpose**: Send transactional emails
**Provider**: Resend
**Source Files**:
- `/src/lib/email/send-email.ts` - Email sending utility
- `/src/lib/email/send-otp.ts` - OTP email sender
- `/src/lib/email/template-base.ts` - Base email template
- `/src/lib/email/templates/welcome-client.ts` - Welcome email
- `/src/lib/email/templates/designer-message-notification.ts` - Message notifications

**Features**:
- OTP verification emails
- Welcome emails
- Message notifications
- Designer approval notifications

## 6. Design System
**Purpose**: Centralized UI theming and components
**Source Files**:
- `/src/lib/design-system/index.ts` - Theme configuration
- `/src/components/shared/` - Shared UI components
- `/src/components/forms/` - Form components
- `/src/components/match/` - Match-related components
- `/src/components/messaging/` - Messaging components

**Theme Features**:
- Dark/Light mode toggle
- Consistent color scheme (#f0ad4e accent)
- Atom logo branding
- Responsive design
- Animation classes (fadeIn, slideUp, etc.)

## 7. Configuration System
**Purpose**: Centralized configuration management
**Source Files**:
- `/src/config/index.ts` - Main configuration export
- `/src/config/matching/prompt.config.ts` - AI matching configuration
- `/src/config/forms/designer.config.ts` - Designer form configuration
- `/src/config/forms/brief.config.ts` - Brief form configuration

**Configurable Elements**:
- AI prompts and scoring weights
- Form fields and validation
- Business rules and thresholds
- Elimination criteria

## 8. API System
**Purpose**: RESTful API endpoints
**Framework**: Next.js App Router
**Source Files**:
- `/src/lib/api/responses.ts` - Standardized API responses
- `/src/lib/api/client.ts` - API client utilities
- `/src/lib/api/auth.ts` - Auth API client
- `/src/lib/api/designer.ts` - Designer API client
- `/src/lib/api/matches.ts` - Matches API client
- `/src/lib/api/admin.ts` - Admin API client

**Key Endpoints**:
- `/api/auth/*` - Authentication endpoints
- `/api/designer/*` - Designer operations
- `/api/client/*` - Client operations
- `/api/match/*` - Matching operations
- `/api/messages/*` - Messaging
- `/api/admin/*` - Admin operations

## 9. Messaging System
**Purpose**: Enable client-designer communication
**Source Files**:
- `/src/app/api/messages/send/route.ts` - Send message endpoint
- `/src/app/api/conversations/[id]/route.ts` - Conversation endpoints
- `/src/components/messaging/MessageModal.tsx` - Message modal UI
- `/src/app/client/conversations/page.tsx` - Conversation list
- `/src/app/client/conversations/[id]/page.tsx` - Conversation detail

**Features**:
- Real-time messaging
- Conversation management
- Match requests
- Email notifications

## 10. Admin System
**Purpose**: Platform administration
**Source Files**:
- `/src/app/admin/*` - Admin pages
- `/src/app/api/admin/*` - Admin API endpoints

**Features**:
- Designer approval/rejection
- Platform statistics
- Performance monitoring
- User management

## 11. Error Handling System
**Purpose**: Centralized error management
**Source Files**:
- `/src/lib/errors/index.ts` - Error types and handlers
- `/src/lib/api/responses.ts` - API error responses
- `/src/lib/toast.ts` - User-facing error notifications

## 12. Utilities & Helpers
**Source Files**:
- `/src/lib/cn.ts` - className utility
- `/src/lib/constants/index.ts` - App-wide constants
- `/src/lib/hooks/` - React hooks (useTheme, useAuth, useLocalStorage)

## 13. Testing System
**Location**: `/test/` directory
**Test Scripts**:
- `test-auth-security.sh` - Authentication security tests
- `test-login-security.sh` - Login security tests
- `test-ai-matching-flow.sh` - AI matching tests
- Various other test scripts

## 14. Build & Deployment System
**Provider**: Vercel
**Config Files**:
- `next.config.js` - Next.js configuration
- `package.json` - Dependencies and scripts
- `.env.production` - Production environment variables
- `vercel.json` - Vercel configuration

## 15. External Integrations

### Supabase (Database & Auth)
- URL: `https://frwchtwxpnrlpzksupgm.supabase.co`
- Provides: PostgreSQL database, authentication, real-time subscriptions

### DeepSeek (AI)
- API Key: `sk-7404080c428443b598ee8c76382afb39`
- Provides: AI matching and analysis

### LemonSqueezy (Payments)
- Webhook: `/api/webhooks/lemonsqueezy`
- Provides: Payment processing, subscription management

### Resend (Email)
- API Key: `re_KL6peoSX_KsWzKz8JhALUK3BdttMNS8M8`
- Provides: Transactional email sending

### Vercel (Hosting)
- Project: `onedesigner2`
- Provides: Hosting, serverless functions, CDN

## 16. MCP (Model Context Protocol) Integrations
**Purpose**: Enable Claude to interact with external services
**Integrations**:
- Supabase MCP - Database access
- Vercel MCP - Deployment management
- Resend MCP - Email sending

## File Structure Summary
```
/src/
├── app/                 # Next.js pages and API routes
├── components/          # React components
├── config/             # Configuration files
├── lib/                # Core libraries and utilities
│   ├── ai/            # AI matching logic
│   ├── api/           # API clients and responses
│   ├── auth/          # Authentication
│   ├── database/      # Database services
│   ├── design-system/ # Theme and styling
│   ├── email/         # Email templates and sending
│   ├── errors/        # Error handling
│   ├── hooks/         # React hooks
│   ├── matching/      # Matching algorithms
│   └── supabase/      # Supabase clients
├── migrations/         # Database migrations
└── test/              # Test scripts
```

## Environment Variables
- `NEXT_PUBLIC_APP_URL` - Application URL
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase public key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service key
- `DEEPSEEK_API_KEY` - DeepSeek AI API key
- `LEMONSQUEEZY_API_KEY` - LemonSqueezy API key
- `RESEND_API_KEY` - Resend email API key
- `NEXTAUTH_SECRET` - NextAuth secret
- `CRON_SECRET` - Cron job secret