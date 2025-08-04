-- PostgreSQL initialization script
-- This file is automatically run when the database container starts for the first time

-- Create the main database if it doesn't exist
-- (This is usually handled by the POSTGRES_DB environment variable)

-- Set timezone
SET timezone = 'UTC';

-- Enable extensions if needed
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- The actual tables will be created by Drizzle migrations
-- This file can be used for any initial setup, permissions, etc.
