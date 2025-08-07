-- Add match credits to clients table
ALTER TABLE clients 
ADD COLUMN match_credits INTEGER DEFAULT 0;

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  order_id VARCHAR(200) UNIQUE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(10) NOT NULL,
  status VARCHAR(50) NOT NULL, -- completed, refunded, failed
  product_name VARCHAR(200),
  credits_purchased INTEGER,
  lemonsqueezy_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes
CREATE INDEX idx_payments_client_id ON payments(client_id);
CREATE INDEX idx_payments_order_id ON payments(order_id);
CREATE INDEX idx_payments_status ON payments(status);

-- Add trigger for updated_at
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- RLS policies for payments
CREATE POLICY "Clients can view own payments" ON payments
  FOR SELECT
  USING (
    client_id IN (
      SELECT id FROM clients 
      WHERE email = current_setting('app.current_user_email', true)
    )
  );

CREATE POLICY "Service role can manage payments" ON payments
  FOR ALL
  WITH CHECK (true);