-- Fix Remaining Database Items for OneDesigner
-- All tables exist, just need indexes and constraints

-- 1. Add indexes for client_designers (if not exist)
CREATE INDEX IF NOT EXISTS idx_client_designers_client ON client_designers(client_id);
CREATE INDEX IF NOT EXISTS idx_client_designers_designer ON client_designers(designer_id);

-- 2. Add indexes for otp_codes (if not exist)
CREATE INDEX IF NOT EXISTS idx_otp_email_code ON otp_codes(email, code) WHERE verified = FALSE;
CREATE INDEX IF NOT EXISTS idx_otp_expires ON otp_codes(expires_at) WHERE verified = FALSE;
CREATE INDEX IF NOT EXISTS idx_otp_email_purpose ON otp_codes(email, purpose) WHERE verified = FALSE;

-- 3. Add indexes for email_queue (if not exist)
CREATE INDEX IF NOT EXISTS idx_email_queue_status ON email_queue(status, scheduled_for) WHERE status IN ('pending', 'processing');
CREATE INDEX IF NOT EXISTS idx_email_queue_created ON email_queue(created_at);
CREATE INDEX IF NOT EXISTS idx_email_queue_priority ON email_queue(priority DESC, created_at ASC) WHERE status = 'pending';

-- 4. Add indexes for audit_logs (if not exist)
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_correlation ON audit_logs(correlation_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at DESC);

-- 5. Add index for rate_limits (if not exist)
CREATE INDEX IF NOT EXISTS idx_rate_limits_lookup ON rate_limits(identifier, action, window_end) WHERE window_end > NOW();

-- 6. Fix match_unlocks payment_id constraint (allow NULL for credit-based unlocks)
DO $$
BEGIN
    -- Check if the column exists and is NOT NULL
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'match_unlocks' 
        AND column_name = 'payment_id' 
        AND is_nullable = 'NO'
    ) THEN
        ALTER TABLE match_unlocks ALTER COLUMN payment_id DROP NOT NULL;
        RAISE NOTICE 'Fixed: match_unlocks.payment_id now allows NULL';
    ELSE
        RAISE NOTICE 'Skipped: match_unlocks.payment_id already allows NULL';
    END IF;
END $$;

-- 7. Add conversation columns to matches (if not exist)
DO $$
BEGIN
    -- Add has_conversation column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'matches' 
        AND column_name = 'has_conversation'
    ) THEN
        ALTER TABLE matches ADD COLUMN has_conversation BOOLEAN DEFAULT FALSE;
        RAISE NOTICE 'Added: matches.has_conversation column';
    ELSE
        RAISE NOTICE 'Skipped: matches.has_conversation already exists';
    END IF;

    -- Add conversation_started_at column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'matches' 
        AND column_name = 'conversation_started_at'
    ) THEN
        ALTER TABLE matches ADD COLUMN conversation_started_at TIMESTAMPTZ;
        RAISE NOTICE 'Added: matches.conversation_started_at column';
    ELSE
        RAISE NOTICE 'Skipped: matches.conversation_started_at already exists';
    END IF;
END $$;

-- 8. Create cleanup function for expired OTPs
CREATE OR REPLACE FUNCTION cleanup_expired_otps()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM otp_codes 
    WHERE expires_at < NOW() - INTERVAL '1 day'
      AND verified = FALSE;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE 'Cleaned up % expired OTP codes', deleted_count;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- 9. Create cleanup function for old audit logs (keep 90 days)
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM audit_logs 
    WHERE created_at < NOW() - INTERVAL '90 days';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE 'Cleaned up % old audit logs', deleted_count;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- 10. Grant permissions (if needed)
GRANT ALL ON client_designers TO authenticated;
GRANT ALL ON otp_codes TO authenticated;
GRANT ALL ON email_queue TO authenticated;
GRANT ALL ON audit_logs TO authenticated;
GRANT ALL ON rate_limits TO authenticated;

-- 11. Test the cleanup functions
SELECT cleanup_expired_otps() as expired_otps_cleaned;
SELECT cleanup_old_audit_logs() as old_logs_cleaned;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '✅ Migration completed successfully!';
    RAISE NOTICE 'Indexes created for all tables';
    RAISE NOTICE 'Constraints fixed on match_unlocks';
    RAISE NOTICE 'Columns added to matches table';
    RAISE NOTICE 'Cleanup functions created';
    RAISE NOTICE '';
    RAISE NOTICE '🎉 Your database is now ready for the centralized architecture!';
END $$;