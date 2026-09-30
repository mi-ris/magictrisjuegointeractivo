/*
# Create game_attempts table for tracking child progress

1. New Tables
- `game_attempts`: records every attempt a child makes on a level
  - `id` (uuid, primary key)
  - `user_id` (uuid, references auth.users, identifies the child)
  - `card_id` (text, identifies which word/level, e.g. "card-MAMÁ")
  - `card_value` (text, the word being practiced, e.g. "MAMÁ")
  - `step` (text, which game step: 'identify' or 'wordBuild')
  - `is_correct` (boolean, whether the attempt was correct)
  - `wrong_choice` (text, nullable, what the child picked if wrong)
  - `attempts_count` (int, how many tries before success on that level session)
  - `time_spent_ms` (int, nullable, how long the level took)
  - `created_at` (timestamptz, when the attempt happened)

2. Security
- Enable RLS on `game_attempts`.
- Owner-scoped CRUD: each authenticated user can only access their own attempts.
- No anon access since this app has sign-in.
*/

CREATE TABLE IF NOT EXISTS game_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  card_id text NOT NULL,
  card_value text NOT NULL,
  step text NOT NULL DEFAULT 'identify',
  is_correct boolean NOT NULL DEFAULT true,
  wrong_choice text,
  attempts_count integer NOT NULL DEFAULT 0,
  time_spent_ms integer,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_game_attempts_user_id ON game_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_game_attempts_card_id ON game_attempts(card_id);
CREATE INDEX IF NOT EXISTS idx_game_attempts_created_at ON game_attempts(created_at DESC);

ALTER TABLE game_attempts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_attempts" ON game_attempts;
CREATE POLICY "select_own_attempts" ON game_attempts FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_attempts" ON game_attempts;
CREATE POLICY "insert_own_attempts" ON game_attempts FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_attempts" ON game_attempts;
CREATE POLICY "update_own_attempts" ON game_attempts FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_attempts" ON game_attempts;
CREATE POLICY "delete_own_attempts" ON game_attempts FOR DELETE
  TO authenticated USING (auth.uid() = user_id);
