-- Migration 009: OTP Service Tables
-- Phase 7: Centralized OTP Management
-- This migration creates tables for the centralized OTP service

-- Create OTP codes table for centralized OTP management
CREATE TABLE IF NOT EXISTS otp_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  code VARCHAR(10) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('client', 'designer', 'admin')),
  purpose VARCHAR(20) NOT NULL CHECK (purpose IN ('login', 'signup', 'reset', 'verify')),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  attempts INTEGER DEFAULT 0,
  verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}',
  
  -- Indexes for performance
  INDEX idx_otp_email (email),
  INDEX idx_otp_expires (expires_at),
  INDEX idx_otp_type_purpose (type, purpose),
  INDEX idx_otp_verified (verified)
);

-- Add composite index for common queries
CREATE INDEX idx_otp_lookup ON otp_codes (email, type, purpose, verified, expires_at);

-- Create OTP rate limiting table
CREATE TABLE IF NOT EXISTS otp_rate_limits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  identifier VARCHAR(255) NOT NULL UNIQUE,
  last_request_at TIMESTAMP WITH TIME ZONE NOT NULL,
  request_count INTEGER DEFAULT 1,
  blocked_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for rate limit lookups
CREATE INDEX idx_rate_limit_identifier ON otp_rate_limits (identifier);
CREATE INDEX idx_rate_limit_blocked ON otp_rate_limits (blocked_until);

-- Create OTP audit log for security tracking
CREATE TABLE IF NOT EXISTS otp_audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  action VARCHAR(50) NOT NULL,
  type VARCHAR(20),
  purpose VARCHAR(20),
  success BOOLEAN DEFAULT false,
  error_message TEXT,
  ip_address INET,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for audit log queries
CREATE INDEX idx_otp_audit_email ON otp_audit_log (email);
CREATE INDEX idx_otp_audit_action ON otp_audit_log (action);
CREATE INDEX idx_otp_audit_created ON otp_audit_log (created_at);

-- Create function to clean up expired OTPs automatically
CREATE OR REPLACE FUNCTION cleanup_expired_otps()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM otp_codes
  WHERE expires_at < NOW()
    OR (verified = true AND verified_at < NOW() - INTERVAL '1 hour');
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  -- Also clean up old rate limits
  DELETE FROM otp_rate_limits
  WHERE blocked_until < NOW() - INTERVAL '1 day'
    OR (blocked_until IS NULL AND updated_at < NOW() - INTERVAL '7 days');
  
  -- Clean up old audit logs (keep 30 days)
  DELETE FROM otp_audit_log
  WHERE created_at < NOW() - INTERVAL '30 days';
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled job to clean up expired OTPs (if pg_cron is available)
-- Note: This requires pg_cron extension to be enabled
-- DO $$
-- BEGIN
--   IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
--     PERFORM cron.schedule('cleanup-expired-otps', '0 * * * *', 'SELECT cleanup_expired_otps();');
--   END IF;
-- END $$;

-- Add comments for documentation
COMMENT ON TABLE otp_codes IS 'Centralized OTP storage for all authentication flows';
COMMENT ON TABLE otp_rate_limits IS 'Rate limiting for OTP requests to prevent abuse';
COMMENT ON TABLE otp_audit_log IS 'Audit trail for OTP operations for security monitoring';

-- Grant permissions (adjust based on your user setup)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON otp_codes TO your_app_user;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON otp_rate_limits TO your_app_user;
-- GRANT SELECT, INSERT ON otp_audit_log TO your_app_user;

-- Migration verification
DO $$
BEGIN
  RAISE NOTICE 'OTP Service tables created successfully';
  RAISE NOTICE 'Tables created: otp_codes, otp_rate_limits, otp_audit_log';
  RAISE NOTICE 'Cleanup function created: cleanup_expired_otps()';
END $$;