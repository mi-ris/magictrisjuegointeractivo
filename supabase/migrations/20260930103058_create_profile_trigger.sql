/*
# Create auto-profile trigger on user signup

1. Changes
- Creates a `handle_new_user` function that inserts a row into `profiles` when a new auth user is created.
- Creates a trigger on `auth.users` that fires AFTER INSERT to call the function.
- The function uses `new.id` as the profile `id` and extracts the display name from user metadata.

2. Security
- The function is SECURITY DEFINER so it can insert into `profiles` even though the trigger runs in the auth context.
- The function has a fixed search_path to prevent search_path injection.

3. Important Notes
- This ensures every new user gets a profile row automatically on signup.
- If the profile already exists (idempotent), the INSERT is skipped via ON CONFLICT.
*/

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, email, nickname)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    new.email,
    COALESCE(new.raw_user_meta_data->>'display_name', 'Amigo')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();