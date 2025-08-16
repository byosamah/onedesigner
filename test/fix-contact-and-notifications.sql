-- ======================================
-- FIX CONTACT DESIGNER & NOTIFICATIONS
-- ======================================
-- This script creates the missing tables for:
-- 1. Project requests (contact designer messages)
-- 2. Designer notifications (unlock & contact notifications)

-- Drop tables if they exist (for clean setup)
DROP TABLE IF EXISTS public.project_requests CASCADE;
DROP TABLE IF EXISTS public.designer_notifications CASCADE;

-- ======================================
-- 1. CREATE PROJECT_REQUESTS TABLE
-- ======================================
CREATE TABLE public.project_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID REFERENCES public.matches(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  designer_id UUID REFERENCES public.designers(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  client_email VARCHAR(255),
  brief_details JSONB,
  approved_at TIMESTAMP WITH TIME ZONE,
  rejected_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_project_requests_designer ON public.project_requests(designer_id);
CREATE INDEX idx_project_requests_client ON public.project_requests(client_id);
CREATE INDEX idx_project_requests_match ON public.project_requests(match_id);
CREATE INDEX idx_project_requests_status ON public.project_requests(status);
CREATE INDEX idx_project_requests_created ON public.project_requests(created_at DESC);

-- Enable RLS
ALTER TABLE public.project_requests ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Service role full access" ON public.project_requests
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Designers can view their requests" ON public.project_requests
  FOR SELECT USING (auth.uid()::text = designer_id::text);

CREATE POLICY "Clients can view their requests" ON public.project_requests
  FOR SELECT USING (auth.uid()::text = client_id::text);

-- ======================================
-- 2. CREATE DESIGNER_NOTIFICATIONS TABLE
-- ======================================
CREATE TABLE public.designer_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  designer_id UUID REFERENCES public.designers(id) ON DELETE CASCADE NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('unlock', 'contact', 'approval', 'system')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_designer_notifications_designer ON public.designer_notifications(designer_id);
CREATE INDEX idx_designer_notifications_read ON public.designer_notifications(read);
CREATE INDEX idx_designer_notifications_type ON public.designer_notifications(type);
CREATE INDEX idx_designer_notifications_created ON public.designer_notifications(created_at DESC);

-- Enable RLS
ALTER TABLE public.designer_notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Service role full access" ON public.designer_notifications
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Designers can view their notifications" ON public.designer_notifications
  FOR SELECT USING (auth.uid()::text = designer_id::text);

CREATE POLICY "Designers can update their notifications" ON public.designer_notifications
  FOR UPDATE USING (auth.uid()::text = designer_id::text);

-- ======================================
-- 3. MIGRATE EXISTING DATA (if any)
-- ======================================
-- Check if there are any designer_requests that should be migrated
DO $$
BEGIN
  -- Check if designer_requests table exists
  IF EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'designer_requests'
  ) THEN
    -- Migrate data from designer_requests to project_requests if needed
    INSERT INTO public.project_requests (
      match_id,
      client_id,
      designer_id,
      message,
      status,
      created_at
    )
    SELECT 
      dr.match_id,
      m.client_id,
      dr.designer_id,
      'Previous request - no message saved',
      CASE 
        WHEN dr.status = 'accepted' THEN 'approved'
        WHEN dr.status = 'declined' THEN 'rejected'
        ELSE 'pending'
      END,
      dr.created_at
    FROM public.designer_requests dr
    JOIN public.matches m ON m.id = dr.match_id
    WHERE NOT EXISTS (
      SELECT 1 FROM public.project_requests pr 
      WHERE pr.match_id = dr.match_id 
      AND pr.designer_id = dr.designer_id
    );
    
    RAISE NOTICE 'Migrated existing designer_requests to project_requests';
  END IF;
END $$;

-- ======================================
-- 4. CREATE TRIGGER FOR UNLOCK NOTIFICATIONS
-- ======================================
CREATE OR REPLACE FUNCTION notify_designer_on_unlock()
RETURNS TRIGGER AS $$
BEGIN
  -- When a match status changes to 'unlocked', notify the designer
  IF NEW.status = 'unlocked' AND OLD.status != 'unlocked' THEN
    INSERT INTO public.designer_notifications (
      designer_id,
      type,
      title,
      message,
      data
    ) VALUES (
      NEW.designer_id,
      'unlock',
      '🎉 New Client Unlocked You!',
      'A client has unlocked your profile and can now contact you.',
      jsonb_build_object(
        'match_id', NEW.id,
        'client_id', NEW.client_id
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_notify_designer_on_unlock ON public.matches;
CREATE TRIGGER trigger_notify_designer_on_unlock
  AFTER UPDATE ON public.matches
  FOR EACH ROW
  EXECUTE FUNCTION notify_designer_on_unlock();

-- ======================================
-- 5. CREATE TRIGGER FOR CONTACT NOTIFICATIONS
-- ======================================
CREATE OR REPLACE FUNCTION notify_designer_on_contact()
RETURNS TRIGGER AS $$
BEGIN
  -- When a new project request is created, notify the designer
  INSERT INTO public.designer_notifications (
    designer_id,
    type,
    title,
    message,
    data
  ) VALUES (
    NEW.designer_id,
    'contact',
    '📧 New Message from Client',
    COALESCE(LEFT(NEW.message, 100), 'A client wants to work with you on their project.'),
    jsonb_build_object(
      'request_id', NEW.id,
      'match_id', NEW.match_id,
      'client_id', NEW.client_id
    )
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_notify_designer_on_contact ON public.project_requests;
CREATE TRIGGER trigger_notify_designer_on_contact
  AFTER INSERT ON public.project_requests
  FOR EACH ROW
  EXECUTE FUNCTION notify_designer_on_contact();

-- ======================================
-- 6. TEST DATA (Optional - Comment out in production)
-- ======================================
-- Uncomment to create test notification
/*
INSERT INTO public.designer_notifications (
  designer_id,
  type,
  title,
  message,
  data
) VALUES (
  (SELECT id FROM public.designers WHERE is_approved = true LIMIT 1),
  'system',
  '🔔 Notification System Active',
  'The notification system is now working properly.',
  '{}'
);
*/

-- ======================================
-- 7. VERIFY SETUP
-- ======================================
DO $$
DECLARE
  pr_exists BOOLEAN;
  dn_exists BOOLEAN;
BEGIN
  -- Check if tables exist
  SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'project_requests'
  ) INTO pr_exists;
  
  SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'designer_notifications'
  ) INTO dn_exists;
  
  IF pr_exists AND dn_exists THEN
    RAISE NOTICE '✅ SUCCESS: Both tables created successfully!';
    RAISE NOTICE '• project_requests table is ready';
    RAISE NOTICE '• designer_notifications table is ready';
    RAISE NOTICE '• Triggers are installed for automatic notifications';
  ELSE
    RAISE EXCEPTION '❌ ERROR: Table creation failed';
  END IF;
END $$;

-- Show current state
SELECT 'project_requests' as table_name, COUNT(*) as row_count FROM public.project_requests
UNION ALL
SELECT 'designer_notifications', COUNT(*) FROM public.designer_notifications;