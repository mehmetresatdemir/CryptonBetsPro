-- CryptonBets Production Deployment SQL
-- Optimized for production environment

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- Create production database user
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'cryptonbets_prod') THEN
        CREATE ROLE cryptonbets_prod WITH LOGIN PASSWORD 'CHANGE_THIS_SECURE_PASSWORD';
    END IF;
END
$$;

-- Grant necessary permissions
GRANT CONNECT ON DATABASE cryptonbets_production TO cryptonbets_prod;
GRANT USAGE ON SCHEMA public TO cryptonbets_prod;
GRANT CREATE ON SCHEMA public TO cryptonbets_prod;

-- Performance optimizations
ALTER SYSTEM SET shared_preload_libraries = 'pg_stat_statements';
ALTER SYSTEM SET pg_stat_statements.track = 'all';
ALTER SYSTEM SET effective_cache_size = '3GB';
ALTER SYSTEM SET shared_buffers = '1GB';
ALTER SYSTEM SET work_mem = '16MB';
ALTER SYSTEM SET maintenance_work_mem = '256MB';
ALTER SYSTEM SET checkpoint_completion_target = 0.9;
ALTER SYSTEM SET wal_buffers = '16MB';
ALTER SYSTEM SET default_statistics_target = 100;

-- Security settings
ALTER SYSTEM SET log_statement = 'all';
ALTER SYSTEM SET log_duration = on;
ALTER SYSTEM SET log_line_prefix = '%t [%p]: [%l-1] user=%u,db=%d,app=%a,client=%h ';

-- Reload configuration
SELECT pg_reload_conf();

-- Production ready schema and data will be loaded from full backup
\i cryptonbets_full_backup.sql
