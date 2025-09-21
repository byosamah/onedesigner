# OneDesigner Constitution

## Core Principles

### I. Centralized Architecture (NON-NEGOTIABLE)
All business logic must flow through the 8-phase centralized architecture:
- **DataService**: All database operations with caching and transaction support
- **ErrorManager**: Standardized error classification and monitoring
- **RequestPipeline**: Middleware architecture for authentication, rate limiting, CORS
- **ConfigManager**: Multi-source configuration with schema validation
- **BusinessRules**: Consolidated business logic validation
- **LoggingService**: Structured logging with correlation IDs and sensitive data redaction
- **OTPService**: Unified OTP management with rate limiting
- **EmailService**: Template-based email system with queue management

### II. Feature-First Development
Every new feature requires:
- Feature flag implementation for safe deployment
- Backward compatibility with existing systems
- Integration with centralized services (no direct database access)
- Comprehensive test coverage including unit, integration, and E2E tests

### III. AI-Powered Matching Excellence
The core matching system must maintain:
- Only approved designers appear in matches (`is_approved = true`)
- No duplicate designers per client (enforce via `client_designers` table)
- Realistic scoring ranges (50-80% typical, 85%+ rare)
- 3-phase progressive matching: instant (<50ms), refined (~500ms), final (~2s)
- DeepSeek API as primary AI provider with proper error handling

### IV. Authentication-First Flow
All user interactions require proper authentication:
- **Designers**: Signup → Verify Email → Application → Admin Approval → Active
- **Clients**: Signup → Verify Email → Brief Creation → Match Access
- OTP verification with 60-second rate limiting and 5-minute expiry
- Session validation across all protected routes

### V. Quality and Observability
Mandatory standards for all code:
- TypeScript with strict type checking
- ESLint and Prettier compliance (build-time disabled for speed)
- Correlation ID tracking across all requests
- Structured logging with appropriate log levels
- CodeRabbit reviews for critical changes
- Cypress E2E testing for user flows

## Business Rules and Constraints

### Payment and Credit System
- Credits are atomic units: 1 credit = 1 designer unlock
- Payment packages: Starter ($5/3), Growth ($15/10), Scale ($30/25)
- LemonSqueezy webhook integration for automatic credit allocation
- Credits must persist after payment with same designer shown

### Designer Approval Workflow
- Manual admin approval required for all new designers
- Profile edits trigger re-approval process (`is_approved = false`)
- Approved status tracked with timestamps (`last_approved_at`)
- Admin dashboard at `/admin/designers` for approval management

### Security and Privacy
- Sensitive data redaction in all logging
- CORS configuration for production deployment
- Rate limiting: OTP (60s cooldown), Email (60/min), API endpoints
- Environment-based configuration with proper secret management

## Development Workflow

### Code Standards
- Always use centralized services instead of direct implementations
- Feature flags must be used for all significant changes
- No console.log statements (use LoggingService)
- Proper TypeScript interfaces for all data structures
- Component consistency through design system (`/src/lib/design-system`)

### Testing Requirements
- Unit tests for all centralized services
- Integration tests for API endpoints
- Cypress E2E tests for critical user flows
- Database tests with proper transaction handling
- Error scenario testing with ErrorManager

### Deployment Process
1. Code changes with proper git commits
2. Feature flag validation in staging
3. CodeRabbit review for quality assurance
4. GitHub push followed by Vercel deployment
5. Production monitoring and rollback procedures

## Technology Stack Constraints

### Core Technologies
- **Frontend**: Next.js 14+ with TypeScript and Tailwind CSS
- **Backend**: Next.js API routes with middleware pipeline
- **Database**: Supabase PostgreSQL with RLS policies
- **AI Provider**: DeepSeek API (primary), fallback strategies prohibited
- **Email**: Resend API with template system
- **Payment**: LemonSqueezy with webhook automation

### Architecture Requirements
- Centralized service layer (`/src/lib/core/`)
- Configuration management (`/src/config/`)
- Feature flag system (`/src/lib/features.ts`)
- Structured documentation (`/*/CLAUDE.md` pattern)

## Governance

This constitution supersedes all other development practices and must be followed for all OneDesigner development work. Any violation requires immediate correction and documentation of remediation steps.

### Amendment Process
1. Constitutional changes require documentation in project CLAUDE.md
2. Breaking changes must include migration strategy
3. Feature flag rollout plan for gradual adoption
4. Approval from lead developer (osamah96@gmail.com)

### Compliance Verification
- All PRs must verify constitutional compliance
- Centralized service usage mandatory (no direct database access)
- Feature flag implementation for all significant changes
- Test coverage requirements must be met

**Version**: 1.0.0 | **Ratified**: 2025-09-21 | **Last Amended**: 2025-09-21