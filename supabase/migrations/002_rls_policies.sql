-- Enable Row Level Security on all tables
ALTER TABLE designers ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE briefs ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_unlocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE designer_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth_tokens ENABLE ROW LEVEL SECURITY;

-- Designers policies
-- Public can view public designer fields
CREATE POLICY "Public can view designer public fields" ON designers
  FOR SELECT
  USING (true);

-- Designers can update their own profile
CREATE POLICY "Designers can update own profile" ON designers
  FOR UPDATE
  USING (email = current_setting('app.current_user_email', true));

-- Service role can insert designers
CREATE POLICY "Service role can insert designers" ON designers
  FOR INSERT
  WITH CHECK (true);

-- Portfolios policies
-- Public can view portfolios
CREATE POLICY "Public can view portfolios" ON portfolios
  FOR SELECT
  USING (true);

-- Designers can manage their own portfolios
CREATE POLICY "Designers can manage own portfolios" ON portfolios
  FOR ALL
  USING (
    designer_id IN (
      SELECT id FROM designers 
      WHERE email = current_setting('app.current_user_email', true)
    )
  );

-- Clients policies
-- Clients can view their own data
CREATE POLICY "Clients can view own data" ON clients
  FOR SELECT
  USING (email = current_setting('app.current_user_email', true));

-- Service role can insert/update clients
CREATE POLICY "Service role can manage clients" ON clients
  FOR ALL
  WITH CHECK (true);

-- Briefs policies
-- Clients can view and create their own briefs
CREATE POLICY "Clients can manage own briefs" ON briefs
  FOR ALL
  USING (
    client_id IN (
      SELECT id FROM clients 
      WHERE email = current_setting('app.current_user_email', true)
    )
  );

-- Matches policies
-- Clients can view their own matches
CREATE POLICY "Clients can view own matches" ON matches
  FOR SELECT
  USING (
    client_id IN (
      SELECT id FROM clients 
      WHERE email = current_setting('app.current_user_email', true)
    )
  );

-- Designers can view matches where they are matched
CREATE POLICY "Designers can view their matches" ON matches
  FOR SELECT
  USING (
    designer_id IN (
      SELECT id FROM designers 
      WHERE email = current_setting('app.current_user_email', true)
    )
  );

-- Service role can create matches
CREATE POLICY "Service role can create matches" ON matches
  FOR INSERT
  WITH CHECK (true);

-- Match unlocks policies
-- Clients can view their own unlocks
CREATE POLICY "Clients can view own unlocks" ON match_unlocks
  FOR SELECT
  USING (
    client_id IN (
      SELECT id FROM clients 
      WHERE email = current_setting('app.current_user_email', true)
    )
  );

-- Service role can create unlocks
CREATE POLICY "Service role can create unlocks" ON match_unlocks
  FOR INSERT
  WITH CHECK (true);

-- Designer requests policies
-- Designers can view their own requests
CREATE POLICY "Designers can view own requests" ON designer_requests
  FOR SELECT
  USING (
    designer_id IN (
      SELECT id FROM designers 
      WHERE email = current_setting('app.current_user_email', true)
    )
  );

-- Designers can update their own requests
CREATE POLICY "Designers can respond to requests" ON designer_requests
  FOR UPDATE
  USING (
    designer_id IN (
      SELECT id FROM designers 
      WHERE email = current_setting('app.current_user_email', true)
    )
  );

-- Service role can create requests
CREATE POLICY "Service role can create requests" ON designer_requests
  FOR INSERT
  WITH CHECK (true);

-- Auth tokens policies
-- Service role only
CREATE POLICY "Service role manages auth tokens" ON auth_tokens
  FOR ALL
  WITH CHECK (true);