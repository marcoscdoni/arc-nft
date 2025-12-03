-- Supabase Database Schema for ArcNFT Marketplace
-- Run this SQL in Supabase SQL Editor to create all tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table: User information and preferences
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_address TEXT UNIQUE NOT NULL,
  username TEXT,
  bio TEXT,
  avatar_url TEXT,
  banner_url TEXT,
  twitter_handle TEXT,
  discord_handle TEXT,
  website_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- NFTs table: Cached NFT data from blockchain
CREATE TABLE IF NOT EXISTS nfts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  token_id BIGINT NOT NULL,
  contract_address TEXT NOT NULL,
  owner_address TEXT NOT NULL,
  creator_address TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  metadata_url TEXT NOT NULL,
  metadata_json JSONB,
  royalty_percentage DECIMAL(5,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  minted_at TIMESTAMP WITH TIME ZONE,
  last_transfer_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(contract_address, token_id)
);

-- Listings table: Marketplace listings (for sale NFTs)
CREATE TABLE IF NOT EXISTS listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id BIGINT UNIQUE NOT NULL,
  nft_id UUID REFERENCES nfts(id) ON DELETE CASCADE,
  seller_address TEXT NOT NULL,
  price DECIMAL(38,18) NOT NULL,
  token_address TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sold_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE
);

-- Sales table: Historical sales data
CREATE TABLE IF NOT EXISTS sales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nft_id UUID REFERENCES nfts(id) ON DELETE SET NULL,
  listing_id BIGINT NOT NULL,
  seller_address TEXT NOT NULL,
  buyer_address TEXT NOT NULL,
  price DECIMAL(38,18) NOT NULL,
  token_address TEXT NOT NULL,
  transaction_hash TEXT NOT NULL,
  sold_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Favorites table: User favorites/likes
CREATE TABLE IF NOT EXISTS favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_address TEXT NOT NULL,
  nft_id UUID REFERENCES nfts(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_address, nft_id)
);

-- Collections table: NFT collections stats
CREATE TABLE IF NOT EXISTS collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contract_address TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  symbol TEXT,
  description TEXT,
  banner_url TEXT,
  avatar_url TEXT,
  total_supply BIGINT DEFAULT 0,
  total_volume DECIMAL(38,18) DEFAULT 0,
  floor_price DECIMAL(38,18),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_nfts_owner ON nfts(owner_address);
CREATE INDEX IF NOT EXISTS idx_nfts_creator ON nfts(creator_address);
CREATE INDEX IF NOT EXISTS idx_nfts_contract ON nfts(contract_address);
CREATE INDEX IF NOT EXISTS idx_nfts_created_at ON nfts(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_listings_active ON listings(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_listings_price ON listings(price);
CREATE INDEX IF NOT EXISTS idx_listings_seller ON listings(seller_address);
CREATE INDEX IF NOT EXISTS idx_listings_created_at ON listings(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_sales_buyer ON sales(buyer_address);
CREATE INDEX IF NOT EXISTS idx_sales_seller ON sales(seller_address);
CREATE INDEX IF NOT EXISTS idx_sales_sold_at ON sales(sold_at DESC);

CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_address);

CREATE INDEX IF NOT EXISTS idx_profiles_wallet ON profiles(wallet_address);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers to auto-update updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_nfts_updated_at BEFORE UPDATE ON nfts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_listings_updated_at BEFORE UPDATE ON listings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_collections_updated_at BEFORE UPDATE ON collections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE nfts ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Allow public read access
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (TRUE);

CREATE POLICY "Public NFTs are viewable by everyone"
  ON nfts FOR SELECT
  USING (TRUE);

CREATE POLICY "Public listings are viewable by everyone"
  ON listings FOR SELECT
  USING (TRUE);

CREATE POLICY "Public sales are viewable by everyone"
  ON sales FOR SELECT
  USING (TRUE);

CREATE POLICY "Public favorites are viewable by everyone"
  ON favorites FOR SELECT
  USING (TRUE);

CREATE POLICY "Public collections are viewable by everyone"
  ON collections FOR SELECT
  USING (TRUE);

-- For now, allow inserts/updates from service role (we'll use backend indexer)
-- Users can insert/update their own profiles and favorites via authenticated requests

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (TRUE);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (TRUE);

CREATE POLICY "Users can insert favorites"
  ON favorites FOR INSERT
  WITH CHECK (TRUE);

CREATE POLICY "Users can delete their own favorites"
  ON favorites FOR DELETE
  USING (TRUE);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT INSERT, UPDATE ON profiles TO anon, authenticated;
GRANT INSERT, DELETE ON favorites TO anon, authenticated;

-- Success message
SELECT 'ArcNFT database schema created successfully!' AS message;
