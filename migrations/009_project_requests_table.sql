-- Create project_requests table for client-designer contact
CREATE TABLE IF NOT EXISTS project_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  designer_id UUID REFERENCES designers(id) ON DELETE CASCADE,
  message TEXT,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  client_email VARCHAR(255),
  brief_details JSONB,
  approved_at TIMESTAMP,
  rejected_at TIMESTAMP,
  rejection_reason TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_project_requests_designer_id ON project_requests(designer_id);
CREATE INDEX idx_project_requests_client_id ON project_requests(client_id);
CREATE INDEX idx_project_requests_match_id ON project_requests(match_id);
CREATE INDEX idx_project_requests_status ON project_requests(status);

-- Add trigger to update updated_at
CREATE OR REPLACE FUNCTION update_project_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER project_requests_updated_at_trigger
BEFORE UPDATE ON project_requests
FOR EACH ROW
EXECUTE FUNCTION update_project_requests_updated_at();