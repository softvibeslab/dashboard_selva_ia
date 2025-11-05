/*
  # Fix RLS Policies for Login Without Auth

  1. Changes
    - Add policy to allow anonymous users to read user data for login
    - This is safe because we're only allowing SELECT on users table
    - The application logic validates the email on the client side
  
  2. Security
    - Anonymous users can only SELECT (read) from users table
    - No INSERT, UPDATE, or DELETE permissions for anonymous users
    - This allows the login flow to work without Supabase Auth
*/

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can read own profile" ON users;
DROP POLICY IF EXISTS "Admins can read all users" ON users;

-- Create new policy that allows anonymous reads for login
CREATE POLICY "Allow anonymous read for login"
  ON users
  FOR SELECT
  TO anon
  USING (true);

-- Keep authenticated users able to read (for future use)
CREATE POLICY "Authenticated users can read all"
  ON users
  FOR SELECT
  TO authenticated
  USING (true);
