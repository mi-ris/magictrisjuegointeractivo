/*
# Create profiles table

1. New Tables
- `profiles`: Stores user profile data for the learning game.
  - `id` (uuid, primary key, references auth.users)
  - `username` (text)
  - `email` (text)
  - `nickname` (text, display name for the child)
  - `avatar` (text, emoji avatar)
  - `score` (integer, total stars earned)
  - `streak` (integer, consecutive days played)
  - `progress_index` (integer, current level position - starts at 0 so level 1 is unlocked)
  - `last_login` (timestamptz)
  - `created_at` (timestamptz)

2. Security
- Enable RLS on `profiles`.
- Owner-scoped CRUD: each authenticated user can only access their own profile row.
- The `id` column defaults to `auth.uid()` so inserts from the client work without explicitly passing it.

3. Important Notes
- progress_index defaults to 0, meaning the first level (index 0) is always unlocked for new users.
- The app creates a profile row after registration. If the trigger-created row is missing, the app inserts one manually.
*/

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text DEFAULT 'Gumi',
  email text DEFAULT '',
  nickname text DEFAULT 'Amigo',
  avatar text DEFAULT '🌈',
  score integer NOT NULL DEFAULT 0,
  streak integer NOT NULL DEFAULT 0,
  progress_index integer NOT NULL DEFAULT 0,
  last_login timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "delete_own_profile" ON profiles;
CREATE POLICY "delete_own_profile" ON profiles
  FOR DELETE TO authenticated
  USING (auth.uid() = id);