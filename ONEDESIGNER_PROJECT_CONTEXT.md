# OneDesigner Project Context

## Project Overview
OneDesigner is a cutting-edge platform that revolutionizes how clients discover and connect with pre-vetted designers through AI-powered matching. The platform analyzes project briefs and designer profiles to create perfect creative partnerships.

**Live URL**: https://onedesigner.app  
**Tech Stack**: Next.js 14, TypeScript, Supabase, DeepSeek AI, LemonSqueezy, Vercel  
**Architecture**: Fully centralized microservices with feature flags

## 🏗️ Core Architecture: 8-Phase Centralized System

OneDesigner has been transformed through a comprehensive 8-phase centralization architecture that eliminated code duplication and created a maintainable, scalable foundation:

### **Phase 1: DataService** - Database Operations
- **File**: `/src/lib/core/data-service.ts`
- **Purpose**: Centralized database operations with query caching (5-min TTL)
- **Features**: Singleton pattern, transaction support, specialized error handling
- **Methods**: 25+ database operations (clients, designers, matches, briefs)
- **Status**: ✅ ACTIVE (`USE_NEW_DATA_SERVICE=true`)

### **Phase 2: ErrorManager** - Error Handling
- **File**: `/src/lib/core/error-manager.ts`  
- **Purpose**: Centralized error classification and monitoring
- **Features**: Error levels (LOW/MEDIUM/HIGH/CRITICAL), context-aware responses
- **Handlers**: Database, validation, authentication, API, and generic errors
- **Status**: ✅ ACTIVE (`USE_ERROR_MANAGER=true`)

### **Phase 3: RequestPipeline** - Middleware Architecture
- **File**: `/src/lib/core/pipeline.ts`
- **Purpose**: Middleware chain for requests (auth, rate limiting, CORS, logging)
- **Features**: 8 pre-built middlewares with extensible architecture
- **Integration**: Authentication pipelines, per-endpoint rate limiting
- **Status**: ✅ ACTIVE (`USE_REQUEST_PIPELINE=true`)

### **Phase 4: ConfigManager** - Configuration Centralization  
- **File**: `/src/lib/core/config-manager.ts`
- **Purpose**: Multi-source configuration with schema validation
- **Features**: 51 centralized config values, environment + file + database sources
- **Security**: Sensitive data protection with priority system
- **Status**: ✅ ACTIVE (`USE_CONFIG_MANAGER=true`)

### **Phase 5: BusinessRules** - Business Logic Consolidation
- **File**: `/src/lib/core/business-rules.ts`
- **Purpose**: Centralized business validation and rules engine
- **Features**: Credit management, matching rules, security validation, pricing
- **Rules**: 15+ business rule categories with comprehensive validation
- **Status**: ✅ ACTIVE (`USE_BUSINESS_RULES=true`)

### **Phase 6: LoggingService** - Centralized Logging
- **File**: `/src/lib/core/logging-service.ts`
- **Purpose**: Structured logging with correlation IDs
- **Features**: Log levels, sensitive data redaction, request tracking
- **Migration**: Replaced 625 console.log statements across codebase
- **Status**: ✅ ACTIVE (`USE_CENTRALIZED_LOGGING=true`)

### **Phase 7: OTPService** - Unified OTP Management
- **File**: `/src/lib/core/otp-service.ts`
- **Purpose**: Consolidated OTP generation, validation, and rate limiting
- **Features**: 60s cooldown, multi-purpose support (login/signup/reset/verify)
- **Storage**: Supabase `auth_tokens` table with proper indexing
- **Status**: ✅ ACTIVE (`USE_OTP_SERVICE=true`)

### **Phase 8: EmailService** - Email System Unification
- **File**: `/src/lib/core/email-service.ts`
- **Purpose**: Template-based email system with queue management
- **Features**: Rate limiting (60/min), retry logic, consistent branding
- **Templates**: OTP, welcome, match notifications, payment confirmations
- **Status**: ✅ ACTIVE (`USE_EMAIL_SERVICE=true`)

## 🎯 Business Model & Core Features

### **Designer-Client Matching System**
- **AI Provider**: DeepSeek (unlimited requests, high-quality responses)
- **Matching Process**: 3-phase progressive matching (instant → refined → final)
- **Scoring**: Realistic 50-80% typical range, 85%+ for exceptional matches
- **Uniqueness**: No duplicate designers per client, persistent matches after payment

### **Payment & Credit System**
- **Provider**: LemonSqueezy integration
- **Packages**: 
  - Starter: $5 for 3 matches
  - Growth: $15 for 10 matches  
  - Scale: $30 for 25 matches
- **Credits**: 1 credit = 1 designer unlock
- **Persistence**: Same designer shown after payment (no re-matching)

### **Working Request System** 
- **Flow**: Client → Send Working Request → Designer (Accept/Decline within 72h) → Contact Revealed
- **Brief Capture**: Complete project details stored in JSONB snapshot
- **Communication**: Email-based notifications for all status changes
- **Deadline**: 72-hour response window with countdown timers

### **Quality Control**
- **Designer Approval**: Manual admin approval required (`is_approved = true`)
- **Profile Edits**: Require re-approval (sets `is_approved=false`)  
- **Admin Dashboard**: Complete designer management at `/admin/designers`
- **Verification**: Email + profile completion required

## 🔧 Technical Implementation

### **Database Schema (Supabase)**
```sql
-- Core Tables
designers (is_approved, is_verified, first_name, last_name, avatar_url, edited_after_approval)
clients (email, match_credits, first_name, last_name)
briefs (project_type, industry, styles[], timeline, budget, requirements)
matches (score, reasons[], status, client_id, designer_id)
client_designers (tracks unlocked designers to prevent duplicates)

-- Speed Optimization
designer_embeddings (vector embeddings for similarity matching)
match_cache (AI analysis cache with TTL)
designer_quick_stats (materialized view for fast lookups)

-- Communication System  
project_requests (match_id, message, status, brief_snapshot, response_deadline)
auth_tokens (email, code, type, purpose, created_at, expires_at)
```

### **API Architecture**
```
/api/
├── match/
│   ├── find              # Original matching endpoint
│   ├── find-optimized    # SSE streaming for progressive matching
│   └── find-new         # Create new match with auto-unlock
├── client/
│   ├── matches/[id]/
│   │   ├── unlock       # Unlock designer with credit
│   │   └── contact      # Send working request
│   └── dashboard        # Client dashboard data
├── designer/
│   ├── apply           # Designer application submission
│   ├── project-requests # Fetch pending requests
│   └── dashboard       # Designer dashboard data
├── admin/
│   └── designers/[id]/approve # Approve/reject designers
├── cron/
│   └── embeddings      # Precompute embeddings (hourly)
└── webhooks/
    └── lemonsqueezy    # Payment processing
```

### **Authentication Flow**

**Designer Journey**:
1. **Signup** (`/designer/signup`) → Email + Password
2. **Verify Email** (`/designer/signup/verify`) → OTP verification  
3. **Application** (`/designer/apply`) → 6-step detailed form
4. **Admin Review** → Manual approval required
5. **Dashboard Access** (`/designer/dashboard`) → View requests & profile

**Client Journey**:  
1. **Signup** (`/client/signup`) → Email + Password
2. **Verify Email** (`/client/signup/verify`) → OTP verification
3. **Brief Creation** (`/brief`) → Detailed project requirements
4. **View Matches** (`/client/dashboard`) → AI-powered designer matches
5. **Working Requests** → Contact designers directly

### **AI Matching Algorithm**
- **Phase 1**: Instant match (<50ms) using pre-computed embeddings
- **Phase 2**: Refined scoring (~500ms) with quick AI analysis
- **Phase 3**: Deep AI analysis (~2s) with detailed reasoning
- **Factors**: Style compatibility, experience, availability, portfolio relevance
- **Elimination**: Automatic filtering of inappropriate matches

## 🎨 Design System & UI/UX

### **Design Philosophy**
- **Theme**: Modern, clean, professional with atom-inspired branding
- **Colors**: Primary accent `#f0ad4e` (warm orange), clean grays and whites
- **Typography**: System fonts with clear hierarchy
- **Components**: Centralized design system at `/src/lib/design-system/`

### **Key UI Components**
- **Modals**: Working request, success notifications, brief viewer
- **Cards**: Designer profile cards, working request cards, match display
- **Forms**: Multi-step designer application, client brief creation
- **Navigation**: Consistent header with role-based navigation
- **Dashboards**: Clean, card-based layouts for both clients and designers

### **Branding Updates**
- **Logo**: Atom icon (35 files updated) representing connection and innovation
- **Favicon**: `/public/icon.svg` - consistent atom branding
- **Terminology**: "Credits" renamed to "Matches" for clarity

## 📊 Business Rules & Validation

### **Critical Business Rules**
1. **Designer Approval**: Only approved designers appear in matches
2. **Uniqueness**: No duplicate designers per client (enforced via `client_designers`)
3. **Match Persistence**: Same designer after payment, no re-matching
4. **Credit System**: 1 credit = 1 unlock, packages provide bulk credits
5. **Response Deadlines**: 72-hour window for designer responses
6. **Profile Edits**: Require admin re-approval for quality control

### **Security & Rate Limiting**
- **OTP**: 60-second cooldown between requests, 5-minute expiry
- **Email**: 60 emails per minute per type with queue management
- **API**: Rate limiting per endpoint via RequestPipeline
- **Session**: Secure session management with proper validation
- **CORS**: Configured for production domains only

---

**OneDesigner represents a successful transformation from a scattered codebase to a well-architected, scalable platform that delivers exceptional value to both designers and clients through AI-powered matching and streamlined communication.**

*Last Updated: September 2025*  
*Version: 2.2.0*  
*Status: Production Ready*