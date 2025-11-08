/*
  # Update Users Table with GoHighLevel Data

  1. Changes
    - Add user_type column for GHL user ID
    - Keep role column for internal roles
    - Insert real users from GHL

  2. Notes
    - user_type stores the GHL user ID
    - role stores internal role (admin, user, etc.)
*/

-- Add user_type column if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS user_type text;

-- Insert real GHL users
INSERT INTO users (email, user_type, role, name) VALUES
  ('carloshmartinez.biz@gmail.com', 'gDXm4rIB6In8qkt5uzJY', 'user', 'Carlos Martinez'),
  ('clara.marxeting@gmail.com', 'tWduuT0rn3qVlgWKJiRx', 'user', 'Clara Marketing'),
  ('gonzalo.selvadentro@gmail.com', 'UZa6pmz2KCBTAXgEGXE8', 'admin', 'Gonzalo Selvadentro'),
  ('crodriguez@selvadentrotulum.com', 'vWerQ2MELDsCSFFKxkJQ', 'user', 'C. Rodriguez'),
  ('d.general@selvadentrotulum.com', 'oMl1JU0hlkLyWDhkTwCS', 'admin', 'Director General'),
  ('supporr@whatsnap.ai', '1SNwHCyKPl2ujvlZnTD6', 'user', 'Support Whatsnap'),
  ('luis@whatsnap.ai', 'IDRYy2kJeYnt7sQhsXfa', 'user', 'Luis Whatsnap'),
  ('mcienfuegos@selvadentrotulum.com', 'jVFCuWoAZEFJ7x85sJTz', 'user', 'M. Cienfuegos'),
  ('recepcion@selvadentrotulum.com', 'vhdm6etm8bf1ntO6fg9g', 'user', 'Recepción'),
  ('mmolina@selvadentrotulum.com', 'NbVUWwCOFUA5phlcZpGm', 'user', 'M. Molina')
ON CONFLICT (email) DO UPDATE SET
  user_type = EXCLUDED.user_type,
  name = EXCLUDED.name,
  role = EXCLUDED.role;
