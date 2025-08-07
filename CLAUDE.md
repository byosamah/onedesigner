# OneDesigner Project Knowledge Base

## Project Overview
OneDesigner is a platform that matches clients with pre-vetted designers using AI-powered matching. The system analyzes project briefs and designer profiles to find the perfect creative match.

## Key Features Implemented

### 1. Payment Integration (LemonSqueezy)
- **Issue Fixed**: Credits weren't reflecting after payment
- **Solution**: Fixed webhook to extract custom data from `meta.custom_data` instead of order attributes
- **Key Files**: 
  - `/src/app/api/webhooks/lemonsqueezy/route.ts`
  - Custom data structure: `{ credits: number, match_id: string }`

### 2. Designer Matching System
- **AI Provider**: DeepSeek (replaced Google AI/Gemini completely)
- **API Key**: `sk-7404080c428443b598ee8c76382afb39`
- **Key Features**:
  - Only approved designers show in matches
  - No duplicate designers for same client
  - Matches persist after payment
  - Realistic scoring (50-80% typical, 85%+ rare)

### 3. Speed Optimization (3-Phase Progressive Matching)
- **Phase 1**: Instant match (<50ms) - Local scoring + embeddings
- **Phase 2**: Refined match (~500ms) - Quick AI scoring  
- **Phase 3**: Final match (~2s) - Deep AI analysis
- **Database Tables**:
  - `designer_embeddings` - Pre-computed vector embeddings
  - `match_cache` - Caching match results
  - `designer_quick_stats` - Materialized view for fast lookups
- **Cron Job**: Hourly embedding precomputation at `/api/cron/embeddings`

### 4. UI/UX Improvements
- **Removed Elements**:
  - "Start New Project" button from payment success
  - "Download Contact Card" from match page
  - "Save to Favorites" from match page
  - "Other Great Options" box from match page
- **Added Features**:
  - "Find New Match" button that creates new match with same brief
  - Animated loading messages during match finding
  - Performance dashboard at `/admin/performance`
  - Designer approval system in admin panel

### 5. Design System Implementation (NEW - Aug 7, 2025)
- **Centralized Theme System**: `/src/lib/design-system/index.ts`
- **Updated Pages**:
  - Client purchase page - complete redesign
  - Admin login & dashboard - full theme integration
  - Designer apply flow - 4-step form with progress indicators
  - Designer verify page - modern OTP input
- **New Branding**:
  - Atom logo icon throughout the app (35 files updated)
  - Favicon at `/public/icon.svg`
  - Consistent color scheme (#f0ad4e accent)
- **Terminology Change**: "Credits" → "Matches" throughout UI

### 6. Supabase MCP Integration (NEW - Aug 7, 2025)
- **Configuration**: `~/.config/claude/claude_desktop_config.json`
- **Project Ref**: `frwchtwxpnrlpzksupgm`
- **Mode**: Read-only for safety
- **Benefits**: Direct database access for Claude

## Critical Business Rules

### Designer Approval Flow
1. Designers register but are NOT automatically approved
2. Admin (osamah96@gmail.com) must approve via `/admin/designers`
3. Only approved designers (`is_approved = true`) show in matches
4. Unapproved designers see "Your profile is under review" message

### Match Creation Rules
1. Each match must have unique designer per client
2. Check `client_designers` table to avoid duplicates
3. Create `designer_requests` with 7-day expiration
4. Match status progression: `pending` → `unlocked` → `completed`

### Payment & Credits
1. Clients can use credits (1 credit = 1 unlock) or purchase packages
2. Packages: Starter ($5/3), Growth ($15/10), Scale ($30/25)
3. Credits are added via webhook after successful payment
4. Match persists after payment - same designer shown

## Technical Architecture

### Database Schema
```sql
-- Key tables
designers (is_approved, is_verified, first_name, last_name, etc.)
clients (email, match_credits)
briefs (project_type, industry, styles[], etc.)
matches (score, reasons[], status)
client_designers (tracks unlocked designers)
designer_embeddings (vector embeddings for similarity)
match_cache (AI analysis cache)
```

### API Endpoints
- `/api/match/find` - Original matching endpoint
- `/api/match/find-optimized` - SSE streaming endpoint for progressive matching
- `/api/client/matches/:id/unlock` - Unlock designer with credit
- `/api/cron/embeddings` - Precompute embeddings (requires x-cron-secret header)
- `/api/admin/designers/:id/approve` - Approve designer

### Environment Variables
```bash
DEEPSEEK_API_KEY=sk-7404080c428443b598ee8c76382afb39
CRON_SECRET=your-secure-random-string
# Other standard vars...
```

## Common Issues & Solutions

### Issue: Designer names showing as "Designer K***"
**Cause**: Property name mismatch between API (snake_case) and frontend (camelCase)
**Solution**: Map `first_name` → `firstName`, `last_name` → `lastName`

### Issue: "ALL_DESIGNERS_UNLOCKED" error
**Cause**: Client has unlocked all available designers
**Solution**: Show friendly message directing to dashboard

### Issue: Match showing same designer repeatedly
**Cause**: Not checking `client_designers` table
**Solution**: Filter out already unlocked designers in queries

### Issue: Slow match results
**Solution**: Implemented 3-phase progressive matching with embeddings

## Development Workflow

### Running Locally
```bash
npm run dev
# Test cron job
curl -X GET http://localhost:3000/api/cron/embeddings \
  -H "x-cron-secret: your-secret"
```

### Database Migrations
1. Run migrations in order (001-007)
2. Use `007_speed_optimization_tables_fixed.sql` (not the original)
3. Required for speed optimization

### Testing Checklist
- [ ] Create brief → Match appears instantly
- [ ] Unlock with credit → Credits deducted
- [ ] Purchase package → Credits added via webhook
- [ ] Find New Match → Different designer shown
- [ ] Admin approve designer → Shows in matches
- [ ] Performance dashboard shows metrics
- [ ] Design system theme toggle works
- [ ] All logos display atom icon

## Important Notes

1. **NEVER create duplicate designers** - Always check `client_designers` table
2. **NEVER show unapproved designers** - Filter by `is_approved = true`
3. **NEVER use fallback matching** - Only use AI (DeepSeek has no rate limits)
4. **ALWAYS persist matches** - Same designer after payment
5. **ALWAYS use realistic scores** - 50-80% typical range
6. **ALWAYS use design system** - Import theme from `/src/lib/design-system`

## Recent Changes Log

### Latest Session (Aug 7, 2025) - Design System Update
- **Updated client/purchase page** to match test mode design
- **Replaced "credits" with "matches"** throughout purchase page
- **Created new atom logo** favicon and replaced all header logos (35 files)
- **Updated admin pages** (login & dashboard) with full design system
- **Updated designer apply flow** with 4-step progress indicators
- **Fixed progress bar alignment** - labels now properly under bars
- **Updated designer verify page** with modern OTP input design
- **Set up Supabase MCP** for direct database access in Claude
- **Created documentation**: `SUPABASE_MCP_SETUP.md` and `PROJECT_PROGRESS_SUMMARY.md`

### Previous Session (Speed Optimization)
- Implemented complete speed optimization with 3-phase matching
- Added streaming SSE support for progressive enhancement
- Created performance monitoring dashboard
- Added animated loading messages
- Removed "Other Great Options" section
- Fixed all property name mismatches

### Earlier Sessions
- Fixed LemonSqueezy webhook integration
- Switched from Google AI to DeepSeek
- Implemented designer approval system
- Added "Find New Match" functionality
- Redesigned dashboard to show only unlocked designers

## Todo for Next Session
- [ ] Test Supabase MCP connection after Claude restart
- [ ] Update remaining pages (auth, match, payment) with design system
- [ ] Configure production CRON_SECRET
- [ ] Deploy to Vercel with cron jobs
- [ ] Monitor performance metrics in production
- [ ] Consider adding Redis for distributed caching
- [ ] Implement designer analytics dashboard
- [ ] Add more micro-interactions and animations

## Design System Reference

### Theme Structure
```typescript
const theme = getTheme(isDarkMode)
// Available properties:
theme.bg              // Background
theme.cardBg          // Card backgrounds
theme.nestedBg        // Nested elements
theme.border          // Border color
theme.accent          // Primary accent (#f0ad4e)
theme.success         // Success color
theme.error           // Error color
theme.text.primary    // Main text
theme.text.secondary  // Secondary text
theme.text.muted      // Muted text
theme.tagBg           // Tag backgrounds
```

### Common Patterns
- Navigation: Atom logo + theme toggle
- Cards: `rounded-3xl` with theme borders
- Buttons: Accent color with `hover:scale-[1.02]`
- Forms: Nested backgrounds with focus rings
- Animations: `animate-fadeIn`, `animate-slideUp`

## File Structure
```
/src/
  /app/
    /admin/           # Admin pages (updated)
    /client/          # Client pages (updated)
    /designer/        # Designer pages (updated)
    /brief/           # Brief flow (updated)
    /test-redesign/   # Reference designs
  /lib/
    /design-system/   # Centralized theme system
/public/
  icon.svg           # New atom logo favicon
  logo.svg           # Header logo (24x24)
```