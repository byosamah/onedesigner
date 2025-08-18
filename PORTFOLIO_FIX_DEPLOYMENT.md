# Designer Profile Fix - Deployment Guide

## What Was Fixed

### 1. **Portfolio Images Not Displaying** ✅
- **Problem**: Portfolio images were stored in the `tools` array column as a workaround
- **Solution**: Added dedicated `portfolio_image_1`, `portfolio_image_2`, `portfolio_image_3` columns
- **Files Changed**:
  - `/src/lib/database/designer-service.ts` - Now uses proper columns
  - `/scripts/add-portfolio-columns.js` - Migration script

### 2. **Edit Mode Inconsistency** ✅
- **Problem**: Fields were editable without clicking "Edit Profile" when profile wasn't approved
- **Solution**: All fields now require clicking "Edit Profile" button to edit
- **Files Changed**:
  - `/src/app/designer/profile/page.tsx` - Line 206: Changed `!isEditing && profile?.is_approved` to `!isEditing`
  - Auto-enables edit mode when coming from rejection modal

### 3. **Profile Update Permissions** ✅
- **Problem**: Portfolio images and avatar couldn't be updated through profile page
- **Solution**: Added these fields to editable fields list in API
- **Files Changed**:
  - `/src/app/api/designer/profile/route.ts` - Added portfolio_image_1/2/3 and avatar_url to editable fields

## Deployment Steps

### Step 1: Run Database Migration (5 minutes)
```bash
# Add the portfolio columns and migrate existing data
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyd2NodHd4cG5ybHB6a3N1cGdtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDQxNjM1OCwiZXhwIjoyMDY5OTkyMzU4fQ.etecMSfQ317vkouRXaMX3Jqg669kf5KL4pE08V03TV8" node scripts/add-portfolio-columns.js
```

### Step 2: Test the Fix (2 minutes)
```bash
# Run the test script to verify everything works
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyd2NodHd4cG5ybHB6a3N1cGdtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDQxNjM1OCwiZXhwIjoyMDY5OTkyMzU4fQ.etecMSfQ317vkouRXaMX3Jqg669kf5KL4pE08V03TV8" node test/test-portfolio-fix.js
```

### Step 3: Commit and Deploy (5 minutes)
```bash
# Commit the changes
git add .
git commit -m "fix: Fix portfolio images storage and profile edit consistency

- Add dedicated portfolio_image columns to database
- Migrate portfolio data from tools array to proper columns  
- Fix edit mode to always require Edit Profile button click
- Auto-enable edit mode when coming from rejection modal
- Add portfolio images and avatar to editable fields in API"

# Push to GitHub
git push origin main

# Deploy to Vercel
vercel --prod
```

## Testing After Deployment

### Test Case 1: Portfolio Images Display
1. Login as a designer who has portfolio images
2. Go to `/designer/profile`
3. **Expected**: Portfolio images should display in the grid

### Test Case 2: Edit Mode Consistency
1. Login as any designer (approved or not)
2. Go to `/designer/profile`
3. Try to edit fields without clicking "Edit Profile"
4. **Expected**: All fields should be disabled until "Edit Profile" is clicked

### Test Case 3: Rejection Flow
1. Login as a rejected designer
2. Close the rejection modal
3. **Expected**: Edit mode should be automatically enabled

### Test Case 4: Save Portfolio Images
1. Click "Edit Profile"
2. Upload new portfolio images (when implemented)
3. Save changes
4. **Expected**: Images should persist after page reload

## Rollback Plan

If issues occur, rollback by:
1. Revert the code changes: `git revert HEAD && git push origin main`
2. The database changes are backward compatible (new columns don't affect existing code)

## Files Changed Summary

```
modified:   src/lib/database/designer-service.ts
modified:   src/app/designer/profile/page.tsx  
modified:   src/app/api/designer/profile/route.ts
created:    scripts/add-portfolio-columns.js
created:    test/test-portfolio-fix.js
```

## Known Limitations

1. **Country/City API**: Still using different sources (static vs dynamic) - will be fixed in Phase 2
2. **Image Upload UI**: Upload buttons show but don't work yet - need file upload implementation
3. **Profile Picture**: Shows "Change Photo" button but doesn't work - needs upload handler

## Next Steps (Phase 2)

1. Implement actual image upload functionality
2. Unify country/city API across application and profile
3. Add image optimization and storage in Supabase Storage
4. Implement drag-and-drop for portfolio images

---

**Estimated Total Deployment Time**: 12 minutes
**Risk Level**: Low (backward compatible changes)
**Testing Required**: Yes - test all 4 cases above