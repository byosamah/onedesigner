-- Migration: Optimize matching with combined query function
-- This function combines multiple queries into one for better performance
-- Maintains 100% backward compatibility

CREATE OR REPLACE FUNCTION get_matching_data(p_brief_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  -- Combine all matching data into a single query result
  SELECT json_build_object(
    'brief', brief_data.brief,
    'existing_matches', COALESCE(matches_data.matches, '[]'::json),
    'available_designers', COALESCE(designers_data.designers, '[]'::json)
  ) INTO result
  FROM (
    -- Get brief with client data
    SELECT row_to_json(t) as brief
    FROM (
      SELECT b.*,
             row_to_json(c) as client
      FROM briefs b
      LEFT JOIN clients c ON b.client_id = c.id
      WHERE b.id = p_brief_id
    ) t
  ) brief_data,
  LATERAL (
    -- Get existing matches with designer data
    SELECT COALESCE(json_agg(
      json_build_object(
        'id', m.id,
        'score', m.score,
        'status', m.status,
        'reasons', m.reasons,
        'personalized_reasons', m.personalized_reasons,
        'created_at', m.created_at,
        'designer', row_to_json(d)
      ) ORDER BY m.created_at DESC
    ), '[]'::json) as matches
    FROM matches m
    JOIN designers d ON m.designer_id = d.id
    WHERE m.brief_id = p_brief_id
  ) matches_data,
  LATERAL (
    -- Get available designers (approved, verified, not busy)
    SELECT COALESCE(json_agg(
      row_to_json(d) ORDER BY d.years_experience DESC
    ), '[]'::json) as designers
    FROM designers d
    WHERE d.is_approved = true
      AND d.is_verified = true
      AND d.availability != 'unavailable'
      AND d.availability != 'busy'
      -- Exclude designers already matched with this brief's client
      AND NOT EXISTS (
        SELECT 1
        FROM matches m2
        JOIN briefs b2 ON m2.brief_id = b2.id
        WHERE m2.designer_id = d.id
          AND b2.client_id = (
            SELECT client_id FROM briefs WHERE id = p_brief_id
          )
      )
  ) designers_data;

  RETURN result;
END;
$$;

-- Add comment for documentation
COMMENT ON FUNCTION get_matching_data(UUID) IS
'Optimized function to get all matching-related data in a single query.
Returns brief, existing matches, and available designers as JSON.
Created for performance optimization while maintaining backward compatibility.';

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION get_matching_data(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_matching_data(UUID) TO service_role;