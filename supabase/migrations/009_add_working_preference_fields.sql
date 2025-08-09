-- Add working preference fields to briefs table for better storage and querying
ALTER TABLE briefs
ADD COLUMN IF NOT EXISTS update_frequency VARCHAR(50),
ADD COLUMN IF NOT EXISTS feedback_style VARCHAR(50),
ADD COLUMN IF NOT EXISTS change_flexibility VARCHAR(50);

-- Create indexes for faster queries on working preferences
CREATE INDEX IF NOT EXISTS idx_briefs_update_frequency ON briefs(update_frequency);
CREATE INDEX IF NOT EXISTS idx_briefs_feedback_style ON briefs(feedback_style);
CREATE INDEX IF NOT EXISTS idx_briefs_change_flexibility ON briefs(change_flexibility);

-- Add comments for documentation
COMMENT ON COLUMN briefs.update_frequency IS 'How often the client wants updates: daily, twice-weekly, weekly, bi-weekly';
COMMENT ON COLUMN briefs.feedback_style IS 'Client feedback style: very-detailed, balanced, high-level';
COMMENT ON COLUMN briefs.change_flexibility IS 'How flexible the client is with changes: very-flexible, moderately-flexible, fixed-requirements';