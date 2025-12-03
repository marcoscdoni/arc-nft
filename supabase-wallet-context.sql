-- Helper function to set wallet context for RLS
-- Run this SQL in Supabase SQL Editor

CREATE OR REPLACE FUNCTION set_wallet_context(wallet TEXT)
RETURNS void AS $$
BEGIN
  PERFORM set_config('app.user_wallet', wallet, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION set_wallet_context TO anon, authenticated;

SELECT 'Wallet context function created successfully!' AS message;
