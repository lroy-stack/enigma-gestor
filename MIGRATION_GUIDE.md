# Supabase Migration Guide for WebContainer

## Issue
The Supabase CLI is not available in WebContainer environments, so commands like `npx supabase migration up` will fail.

## Solution
Migrations in WebContainer need to be applied through the Supabase Dashboard:

### Step 1: Access Your Supabase Dashboard
1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Log in to your account
3. Select your project

### Step 2: Apply Migrations
1. Navigate to the **SQL Editor** in your Supabase dashboard
2. Copy the content from your migration files in the `supabase/migrations/` directory
3. Paste and execute each migration file in chronological order

### Step 3: Verify Migrations
1. Go to the **Table Editor** to verify your tables were created
2. Check the **Database** section to confirm the schema matches your expectations

## Alternative: Automatic Migration Application
If you're using Supabase with proper connection setup, migrations are often applied automatically when:
- The project is connected to Supabase
- The environment variables are properly configured
- The database schema is synchronized

## Important Notes
- Never use Supabase CLI commands in WebContainer
- Always apply migrations through the web interface
- Keep your migration files for reference and version control