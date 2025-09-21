
# OneDesigner Database Cleanup Safety Checklist

## ✅ Pre-Cleanup Verification

- [ ] Code analysis completed with no legacy references found
- [ ] All conversation/message functionality replaced with Working Request System
- [ ] OTP functionality using auth_tokens table via OTPService
- [ ] Admin authentication using hardcoded check (osamah96@gmail.com)
- [ ] Blog functionality confirmed as unused or properly migrated
- [ ] Application tested with all 8 centralized phases active
- [ ] Database backup created and verified

## ✅ Safe Tables for Removal

Based on analysis, these tables are safe to remove:

- [ ] `conversations` - Replaced by project_requests (Working Request System)
- [ ] `messages` - Messaging replaced by email-based Working Requests
- [ ] `custom_otps` - Replaced by auth_tokens (OTPService Phase 7)
- [ ] `match_unlocks` - Functionality moved to client_designers table
- [ ] `designer_requests` - Replaced by project_requests
- [ ] `credit_purchases` - Purchase tracking moved to payments table
- [ ] `match_analytics` - Analytics moved to centralized system
- [ ] `activity_log` - Replaced by LoggingService (Phase 6)
- [ ] `blog_posts` - Blog feature appears to be legacy
- [ ] `admin_users` - Admin hardcoded as osamah96@gmail.com

## ✅ Post-Cleanup Verification

- [ ] Application starts without errors
- [ ] Client signup and authentication working
- [ ] Designer signup and authentication working
- [ ] Match finding and unlocking working
- [ ] Working Request System functional
- [ ] Payment processing working
- [ ] Admin dashboard accessible
- [ ] All 8 centralized phases functioning correctly

## 🚨 Emergency Rollback Plan

If any issues occur:
1. Stop the application immediately
2. Run the rollback script in database-cleanup-plan.sql
3. Restore backed up tables
4. Restart application and verify functionality
5. Investigate and fix issues before re-attempting cleanup

## 📞 Support

If you encounter issues during cleanup:
- Check application logs for specific errors
- Verify all feature flags are properly set
- Ensure centralized services are functioning
- Contact: osamah96@gmail.com
