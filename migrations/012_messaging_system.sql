-- Migration: Create messaging system for client-designer communication
-- Purpose: Allow clients to message designers after matching

-- 1. Conversations table - Tracks all conversations between clients and designers
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  designer_id UUID REFERENCES designers(id) ON DELETE CASCADE,
  brief_id UUID REFERENCES briefs(id) ON DELETE SET NULL,
  
  -- Status tracking
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'archived', 'declined', 'pending')),
  initiated_by VARCHAR(20) CHECK (initiated_by IN ('client', 'designer')),
  
  -- Metadata
  last_message_at TIMESTAMP WITH TIME ZONE,
  last_message_preview TEXT,
  client_unread_count INTEGER DEFAULT 0,
  designer_unread_count INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  -- Ensure unique conversation per match
  UNIQUE(match_id),
  -- Ensure both parties exist
  CONSTRAINT valid_participants CHECK (client_id IS NOT NULL AND designer_id IS NOT NULL)
);

-- 2. Messages table - Stores all messages in conversations
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  
  -- Sender information
  sender_id UUID NOT NULL,
  sender_type VARCHAR(20) NOT NULL CHECK (sender_type IN ('client', 'designer')),
  
  -- Message content
  content TEXT NOT NULL,
  
  -- Metadata
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  is_edited BOOLEAN DEFAULT FALSE,
  edited_at TIMESTAMP WITH TIME ZONE,
  
  -- Attachments (future enhancement)
  attachments JSONB DEFAULT '[]'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  -- Indexes for performance
  CONSTRAINT valid_content CHECK (char_length(content) > 0 AND char_length(content) <= 5000)
);

-- 3. Match requests table - Tracks initial contact requests
CREATE TABLE IF NOT EXISTS match_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  
  -- Participants
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  designer_id UUID NOT NULL REFERENCES designers(id) ON DELETE CASCADE,
  
  -- Request details
  initial_message TEXT NOT NULL,
  project_details JSONB, -- Store brief summary for quick reference
  
  -- Status tracking
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
  responded_at TIMESTAMP WITH TIME ZONE,
  response_message TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP + INTERVAL '7 days'),
  
  -- Ensure one request per match
  UNIQUE(match_id)
);

-- 4. Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_conversations_client_id ON conversations(client_id);
CREATE INDEX IF NOT EXISTS idx_conversations_designer_id ON conversations(designer_id);
CREATE INDEX IF NOT EXISTS idx_conversations_match_id ON conversations(match_id);
CREATE INDEX IF NOT EXISTS idx_conversations_status ON conversations(status);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message ON conversations(last_message_at DESC);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id, sender_type);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_is_read ON messages(is_read) WHERE is_read = FALSE;

CREATE INDEX IF NOT EXISTS idx_match_requests_designer_id ON match_requests(designer_id);
CREATE INDEX IF NOT EXISTS idx_match_requests_client_id ON match_requests(client_id);
CREATE INDEX IF NOT EXISTS idx_match_requests_status ON match_requests(status);
CREATE INDEX IF NOT EXISTS idx_match_requests_created_at ON match_requests(created_at DESC);

-- 5. Create function to update conversation metadata when new message is added
CREATE OR REPLACE FUNCTION update_conversation_on_message()
RETURNS TRIGGER AS $$
BEGIN
  -- Update conversation metadata
  UPDATE conversations 
  SET 
    last_message_at = NEW.created_at,
    last_message_preview = LEFT(NEW.content, 100),
    updated_at = CURRENT_TIMESTAMP,
    client_unread_count = CASE 
      WHEN NEW.sender_type = 'designer' THEN client_unread_count + 1 
      ELSE client_unread_count 
    END,
    designer_unread_count = CASE 
      WHEN NEW.sender_type = 'client' THEN designer_unread_count + 1 
      ELSE designer_unread_count 
    END
  WHERE id = NEW.conversation_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Create trigger for auto-updating conversation
DROP TRIGGER IF EXISTS trigger_update_conversation_on_message ON messages;
CREATE TRIGGER trigger_update_conversation_on_message
AFTER INSERT ON messages
FOR EACH ROW
EXECUTE FUNCTION update_conversation_on_message();

-- 7. Create function to mark messages as read
CREATE OR REPLACE FUNCTION mark_messages_as_read(
  p_conversation_id UUID,
  p_reader_type VARCHAR(20)
)
RETURNS INTEGER AS $$
DECLARE
  v_updated_count INTEGER;
BEGIN
  -- Mark messages as read
  UPDATE messages
  SET 
    is_read = TRUE,
    read_at = CURRENT_TIMESTAMP
  WHERE 
    conversation_id = p_conversation_id
    AND sender_type != p_reader_type
    AND is_read = FALSE;
  
  GET DIAGNOSTICS v_updated_count = ROW_COUNT;
  
  -- Reset unread count for the reader
  IF p_reader_type = 'client' THEN
    UPDATE conversations 
    SET client_unread_count = 0 
    WHERE id = p_conversation_id;
  ELSE
    UPDATE conversations 
    SET designer_unread_count = 0 
    WHERE id = p_conversation_id;
  END IF;
  
  RETURN v_updated_count;
END;
$$ LANGUAGE plpgsql;

-- 8. Add messaging-related columns to matches table
ALTER TABLE matches 
ADD COLUMN IF NOT EXISTS has_conversation BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS conversation_started_at TIMESTAMP WITH TIME ZONE;

-- 9. Create view for designer's incoming requests
CREATE OR REPLACE VIEW designer_match_requests AS
SELECT 
  mr.id,
  mr.match_id,
  mr.designer_id,
  mr.initial_message,
  mr.status,
  mr.created_at,
  mr.expires_at,
  c.email as client_email,
  c.id as client_id,
  b.project_type,
  b.industry,
  b.budget,
  b.timeline,
  b.description as project_description,
  m.score as match_score,
  conv.id as conversation_id,
  conv.designer_unread_count as unread_count
FROM match_requests mr
JOIN clients c ON mr.client_id = c.id
JOIN matches m ON mr.match_id = m.id
LEFT JOIN briefs b ON m.brief_id = b.id
LEFT JOIN conversations conv ON mr.conversation_id = conv.id
WHERE mr.status = 'pending'
ORDER BY mr.created_at DESC;

-- 10. Create view for client's conversations
CREATE OR REPLACE VIEW client_conversations AS
SELECT 
  conv.id,
  conv.match_id,
  conv.status,
  conv.last_message_at,
  conv.last_message_preview,
  conv.client_unread_count as unread_count,
  d.id as designer_id,
  d.first_name as designer_first_name,
  d.last_name as designer_last_name,
  d.title as designer_title,
  d.avatar_url as designer_avatar,
  m.score as match_score
FROM conversations conv
JOIN designers d ON conv.designer_id = d.id
JOIN matches m ON conv.match_id = m.id
ORDER BY conv.last_message_at DESC;

-- Comments
COMMENT ON TABLE conversations IS 'Tracks all conversations between clients and designers';
COMMENT ON TABLE messages IS 'Stores individual messages within conversations';
COMMENT ON TABLE match_requests IS 'Tracks initial contact requests from clients to designers';
COMMENT ON VIEW designer_match_requests IS 'View for designers to see incoming match requests';
COMMENT ON VIEW client_conversations IS 'View for clients to see their active conversations';