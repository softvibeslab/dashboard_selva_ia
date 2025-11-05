/*
  # Add Profile Photo Column

  1. Changes
    - Add profile_photo column to users table
    - Store GoHighLevel profile photo URLs
    
  2. Security
    - Column is nullable (not all users have photos)
*/

-- Add profile photo column
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_photo text;
