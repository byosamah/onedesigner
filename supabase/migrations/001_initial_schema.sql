-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create Designer table
CREATE TABLE IF NOT EXISTS designers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  -- Public fields (always visible)
  first_name VARCHAR(100) NOT NULL,
  last_initial CHAR(1) NOT NULL,
  title VARCHAR(200) NOT NULL,
  city VARCHAR(100) NOT NULL,
  country VARCHAR(100) NOT NULL,
  years_experience INTEGER NOT NULL,
  rating DECIMAL(2,1) DEFAULT 4.5,
  total_projects INTEGER DEFAULT 0,
  avatar_url TEXT,
  
  -- Protected fields (require payment)
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(200) UNIQUE NOT NULL,
  phone VARCHAR(50),
  website_url VARCHAR(500),
  calendar_url VARCHAR(500),
  linkedin_url VARCHAR(500),
  
  -- Profile data
  bio TEXT,
  styles TEXT[] DEFAULT '{}',
  industries TEXT[] DEFAULT '{}',
  tools TEXT[] DEFAULT '{}',
  hourly_rate DECIMAL(10,2),
  availability VARCHAR(50) DEFAULT 'available',
  response_time VARCHAR(50) DEFAULT '24 hours',
  timezone VARCHAR(50),
  
  -- Privacy settings
  is_contactable BOOLEAN DEFAULT true,
  hide_phone BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  
  -- Subscription
  subscription_tier VARCHAR(50) DEFAULT 'free',
  subscription_end TIMESTAMP,
  
  -- System fields
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  last_active_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Portfolio table
CREATE TABLE IF NOT EXISTS portfolios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  designer_id UUID NOT NULL REFERENCES designers(id) ON DELETE CASCADE,
  
  title VARCHAR(255) NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  project_type VARCHAR(100) NOT NULL,
  industry VARCHAR(100),
  client VARCHAR(200),
  
  -- Protected fields
  case_study_url TEXT,
  
  featured BOOLEAN DEFAULT false,
  "order" INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Client table
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(200) UNIQUE NOT NULL,
  
  -- Profile (optional)
  name VARCHAR(200),
  company VARCHAR(200),
  website VARCHAR(500),
  
  -- Payment
  customer_id VARCHAR(200), -- Lemon Squeezy customer ID
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Brief table
CREATE TABLE IF NOT EXISTS briefs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  
  -- Project details
  project_type VARCHAR(100) NOT NULL,
  industry VARCHAR(100) NOT NULL,
  timeline VARCHAR(100) NOT NULL,
  budget VARCHAR(100),
  
  -- Style preferences
  styles TEXT[] DEFAULT '{}',
  inspiration TEXT,
  requirements TEXT,
  
  -- Matching preferences
  timezone VARCHAR(50),
  communication TEXT[] DEFAULT '{}',
  
  status VARCHAR(50) DEFAULT 'active',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Match table
CREATE TABLE IF NOT EXISTS matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  brief_id UUID NOT NULL REFERENCES briefs(id) ON DELETE CASCADE,
  designer_id UUID NOT NULL REFERENCES designers(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  
  -- Match data
  score DECIMAL(5,2) NOT NULL,
  reasons JSONB NOT NULL DEFAULT '[]',
  personalized_reasons JSONB NOT NULL DEFAULT '[]',
  
  -- Status
  status VARCHAR(50) DEFAULT 'pending',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  viewed_at TIMESTAMP,
  unlocked_at TIMESTAMP,
  
  UNIQUE(brief_id, designer_id)
);

-- Create MatchUnlock table
CREATE TABLE IF NOT EXISTS match_unlocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  match_id UUID UNIQUE NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  
  -- Payment info
  payment_id VARCHAR(200) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create DesignerRequest table
CREATE TABLE IF NOT EXISTS designer_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  match_id UUID UNIQUE NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  designer_id UUID NOT NULL REFERENCES designers(id) ON DELETE CASCADE,
  
  -- Request status
  status VARCHAR(50) DEFAULT 'pending',
  
  -- Timestamps
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  viewed_at TIMESTAMP,
  responded_at TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  
  -- Response
  response VARCHAR(50),
  message TEXT
);

-- Create AuthToken table
CREATE TABLE IF NOT EXISTS auth_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(200) NOT NULL,
  token VARCHAR(255) UNIQUE NOT NULL,
  type VARCHAR(50) NOT NULL,
  
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_designers_email ON designers(email);
CREATE INDEX idx_designers_availability_rating ON designers(availability, rating);
CREATE INDEX idx_portfolios_designer_id ON portfolios(designer_id);
CREATE INDEX idx_clients_email ON clients(email);
CREATE INDEX idx_briefs_client_status ON briefs(client_id, status);
CREATE INDEX idx_matches_client_status ON matches(client_id, status);
CREATE INDEX idx_matches_designer_status ON matches(designer_id, status);
CREATE INDEX idx_match_unlocks_client_id ON match_unlocks(client_id);
CREATE INDEX idx_designer_requests_designer_status ON designer_requests(designer_id, status);
CREATE INDEX idx_auth_tokens_email_type ON auth_tokens(email, type);
CREATE INDEX idx_auth_tokens_token ON auth_tokens(token);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_designers_updated_at BEFORE UPDATE ON designers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_portfolios_updated_at BEFORE UPDATE ON portfolios
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_briefs_updated_at BEFORE UPDATE ON briefs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();