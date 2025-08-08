-- Remove test email addresses from the database
-- This script removes designers and related data for specific email addresses

-- Start a transaction
BEGIN;

-- Define the emails to remove
WITH emails_to_remove AS (
  SELECT unnest(ARRAY[
    'osamah96@gmail.com',
    'ftoordesignerpodcast@gmail.com', 
    'osama.k@meemain.org'
  ]) AS email
)

-- Delete from designer_requests first (foreign key constraint)
DELETE FROM designer_requests
WHERE designer_id IN (
  SELECT id FROM designers 
  WHERE email IN (SELECT email FROM emails_to_remove)
);

-- Delete from client_designers
DELETE FROM client_designers
WHERE designer_id IN (
  SELECT id FROM designers 
  WHERE email IN (SELECT email FROM emails_to_remove)
);

-- Delete from matches
DELETE FROM matches
WHERE designer_id IN (
  SELECT id FROM designers 
  WHERE email IN (SELECT email FROM emails_to_remove)
);

-- Delete from designer_embeddings
DELETE FROM designer_embeddings
WHERE designer_id IN (
  SELECT id FROM designers 
  WHERE email IN (SELECT email FROM emails_to_remove)
);

-- Delete from match_analytics
DELETE FROM match_analytics
WHERE designer_id IN (
  SELECT id FROM designers 
  WHERE email IN (SELECT email FROM emails_to_remove)
);

-- Finally, delete the designers themselves
DELETE FROM designers
WHERE email IN (
  SELECT email FROM emails_to_remove
);

-- Also check and remove from clients table if they exist there
DELETE FROM clients
WHERE email IN (
  SELECT email FROM emails_to_remove
);

-- Remove any OTP records for these emails
DELETE FROM custom_otps
WHERE email IN (
  SELECT email FROM emails_to_remove
);

-- Commit the transaction
COMMIT;

-- Show what was deleted
SELECT 'Removed all records for the following emails:' AS message;
SELECT unnest(ARRAY[
  'osamah96@gmail.com',
  'ftoordesignerpodcast@gmail.com', 
  'osama.k@meemain.org'
]) AS removed_emails;