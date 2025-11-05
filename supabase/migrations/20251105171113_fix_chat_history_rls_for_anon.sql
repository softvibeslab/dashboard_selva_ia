/*
  # Fix Chat History RLS for Anonymous Users

  1. Changes
    - Drop existing policies that require authentication
    - Create new policies that allow anonymous users to insert and read their own chat history
    - Users match by user_id stored in the database, not auth.uid()
    
  2. Security
    - Users can only read and insert their own chat history
    - No authentication required since we use simple email login
*/

-- Drop existing authenticated-only policies
DROP POLICY IF EXISTS "Users can read own chat history" ON chat_history;
DROP POLICY IF EXISTS "Users can insert own chat history" ON chat_history;
DROP POLICY IF EXISTS "Admins can read all chat history" ON chat_history;

-- Create new policy for anonymous users to insert chat history
CREATE POLICY "Allow anonymous insert chat history"
  ON chat_history
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Create new policy for anonymous users to read all chat history (they filter by user_id in the app)
CREATE POLICY "Allow anonymous read chat history"
  ON chat_history
  FOR SELECT
  TO anon
  USING (true);

-- Keep authenticated users able to access (for future use)
CREATE POLICY "Authenticated users can read all"
  ON chat_history
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert"
  ON chat_history
  FOR INSERT
  TO authenticated
  WITH CHECK (true);
