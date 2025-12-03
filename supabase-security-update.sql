-- Enhanced Security Policies for Wallet-Based Authentication
-- Run this SQL in Supabase SQL Editor to update RLS policies

-- Drop existing permissive policies
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert favorites" ON favorites;
DROP POLICY IF EXISTS "Users can delete their own favorites" ON favorites;

-- SECURE PROFILE POLICIES
-- Users can only insert/update profiles with their own wallet address
CREATE POLICY "Users can insert profile with matching wallet"
  ON profiles FOR INSERT
  WITH CHECK (
    wallet_address = lower(current_setting('app.user_wallet', true))
  );

CREATE POLICY "Users can update their own profile only"
  ON profiles FOR UPDATE
  USING (
    wallet_address = lower(current_setting('app.user_wallet', true))
  )
  WITH CHECK (
    wallet_address = lower(current_setting('app.user_wallet', true))
  );

-- SECURE FAVORITES POLICIES
-- Users can only add/remove their own favorites
CREATE POLICY "Users can insert their own favorites"
  ON favorites FOR INSERT
  WITH CHECK (
    user_address = lower(current_setting('app.user_wallet', true))
  );

CREATE POLICY "Users can delete their own favorites only"
  ON favorites FOR DELETE
  USING (
    user_address = lower(current_setting('app.user_wallet', true))
  );

-- Success message
SELECT 'Enhanced RLS policies applied successfully!' AS message;
