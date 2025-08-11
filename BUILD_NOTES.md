# Build Notes for OneDesigner

## Build Warnings Explained

### 1. Font Override Warning (FIXED)
- **Warning**: "Failed to find font override values for font `Bricolage Grotesque`"
- **Solution**: Added `adjustFontFallback: false` to font configuration
- **Impact**: None - font still works correctly

### 2. Edge Runtime Warning (FIXED)
- **Warning**: "A Node.js API is used (process.cwd) which is not supported in the Edge Runtime"
- **Solution**: Added runtime check for process.cwd availability
- **Impact**: None - middleware uses Node.js runtime, not Edge

### 3. Configuration Initialization (FIXED)
- **Warning**: "Configuration not initialized, using environment fallback"
- **Solution**: Suppressed warnings during build time
- **Impact**: None - expected behavior during static generation

### 4. Dynamic Server Usage (EXPECTED)
- **Warning**: "Page couldn't be rendered statically because it used `cookies`"
- **Impact**: None - these pages MUST be dynamic for authentication

## Dynamic Pages (Server-Rendered)

The following pages are intentionally dynamic because they require authentication:

### Client Pages
- `/client/dashboard` - Requires client authentication
- `/client/conversations/[id]` - Requires client authentication
- `/client/match/[id]` - Requires client authentication

### Designer Pages  
- `/designer/dashboard` - Requires designer authentication
- `/designer/profile` - Requires designer authentication

### Admin Pages
- `/admin/dashboard` - Requires admin authentication

### Match Pages
- `/match/[briefId]` - Dynamic content based on brief

## Static Pages (Pre-Rendered)

All other pages are statically generated at build time for optimal performance:
- Homepage (`/`)
- Login pages
- Signup pages
- Brief creation pages
- Payment pages

## Build Optimization Status

✅ **Font Warning**: Fixed with `adjustFontFallback: false`
✅ **Edge Runtime**: Fixed with conditional process.cwd check
✅ **Config Warnings**: Suppressed during build time
✅ **Dynamic Pages**: Working as intended for auth-protected routes

## Performance Notes

- Static pages load instantly (pre-rendered HTML)
- Dynamic pages render on-demand (required for authentication)
- API routes run as serverless functions
- All warnings are now resolved or documented as expected behavior