-- Create project_requests table for contact messages
CREATE TABLE IF NOT EXISTS public.project_requests (
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

-- Create indexes for project_requests
CREATE INDEX IF NOT EXISTS idx_project_requests_designer ON public.project_requests(designer_id);
CREATE INDEX IF NOT EXISTS idx_project_requests_client ON public.project_requests(client_id);
CREATE INDEX IF NOT EXISTS idx_project_requests_match ON public.project_requests(match_id);
CREATE INDEX IF NOT EXISTS idx_project_requests_status ON public.project_requests(status);
CREATE INDEX IF NOT EXISTS idx_project_requests_created ON public.project_requests(created_at DESC);

-- Enable RLS
ALTER TABLE public.project_requests ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for project_requests
CREATE POLICY "Service role full access" ON public.project_requests
  FOR ALL USING (true) WITH CHECK (true);

-- Create designer_notifications table
CREATE TABLE IF NOT EXISTS public.designer_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  designer_id UUID REFERENCES public.designers(id) ON DELETE CASCADE NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('unlock', 'contact', 'approval', 'system')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for designer_notifications
CREATE INDEX IF NOT EXISTS idx_designer_notifications_designer ON public.designer_notifications(designer_id);
CREATE INDEX IF NOT EXISTS idx_designer_notifications_read ON public.designer_notifications(read);
CREATE INDEX IF NOT EXISTS idx_designer_notifications_type ON public.designer_notifications(type);
CREATE INDEX IF NOT EXISTS idx_designer_notifications_created ON public.designer_notifications(created_at DESC);

-- Enable RLS
ALTER TABLE public.designer_notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for designer_notifications
CREATE POLICY "Service role full access" ON public.designer_notifications
  FOR ALL USING (true) WITH CHECK (true);

-- Create trigger function for unlock notifications
CREATE OR REPLACE FUNCTION notify_designer_on_unlock()
RETURNS TRIGGER AS $$
BEGIN
  -- When a match status changes to 'unlocked', notify the designer
  IF NEW.status = 'unlocked' AND (OLD.status IS NULL OR OLD.status != 'unlocked') THEN
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

-- Create trigger for unlock notifications
DROP TRIGGER IF EXISTS trigger_notify_designer_on_unlock ON public.matches;
CREATE TRIGGER trigger_notify_designer_on_unlock
  AFTER UPDATE ON public.matches
  FOR EACH ROW
  EXECUTE FUNCTION notify_designer_on_unlock();

-- Create trigger function for contact notifications
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

-- Create trigger for contact notifications
DROP TRIGGER IF EXISTS trigger_notify_designer_on_contact ON public.project_requests;
CREATE TRIGGER trigger_notify_designer_on_contact
  AFTER INSERT ON public.project_requests
  FOR EACH ROW
  EXECUTE FUNCTION notify_designer_on_contact();