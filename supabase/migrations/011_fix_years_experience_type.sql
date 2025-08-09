-- Change years_experience from integer to varchar to support ranges like "3-5"
ALTER TABLE designers 
ALTER COLUMN years_experience TYPE VARCHAR(20) USING years_experience::VARCHAR;