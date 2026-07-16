/*
# Create profiles and user_tools_data tables

1. New Tables
- `profiles`: User profile data (full name, profession, avatar URL)
- `user_tools_data`: AI-generated tool content per user
2. Security
- RLS enabled on both tables with owner-scoped CRUD policies
*/

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  profession text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

CREATE TABLE IF NOT EXISTS user_tools_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  tool_type text,
  input_data jsonb,
  generated_content text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE user_tools_data ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_tools" ON user_tools_data;
CREATE POLICY "select_own_tools" ON user_tools_data FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_tools" ON user_tools_data;
CREATE POLICY "insert_own_tools" ON user_tools_data FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_tools" ON user_tools_data;
CREATE POLICY "update_own_tools" ON user_tools_data FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_tools" ON user_tools_data;
CREATE POLICY "delete_own_tools" ON user_tools_data FOR DELETE
  TO authenticated USING (auth.uid() = user_id);
