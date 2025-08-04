-- Add isDefault column to shops table
ALTER TABLE shops ADD COLUMN is_default BOOLEAN DEFAULT FALSE NOT NULL;

-- Create unique constraint to ensure only one default shop per user
-- (This will be enforced at application level in TypeScript as well)
