-- Add Google OAuth support columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS password VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS picture VARCHAR(1000);

-- Make whatsapp_number optional
ALTER TABLE users ALTER COLUMN whatsapp_number DROP NOT NULL;

-- Create index for google_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id); 