-- ============================================
-- GIFT CARD REWARD PLATFORM - DATABASE SCHEMA
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable Row Level Security
ALTER TABLE IF EXISTS users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS giftcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS coupons ENABLE ROW LEVEL SECURITY;

-- ============================================
-- USERS TABLE (extends Supabase auth.users)
-- ============================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies for users
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.users;

CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Enable insert for authenticated users only" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ============================================
-- GIFT CARDS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.giftcards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  brand VARCHAR(100) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  logo_url TEXT,
  description TEXT,
  color_start VARCHAR(7) DEFAULT '#667eea',
  color_end VARCHAR(7) DEFAULT '#764ba2',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies for giftcards
DROP POLICY IF EXISTS "Anyone can view active giftcards" ON public.giftcards;
DROP POLICY IF EXISTS "Admin full access on giftcards" ON public.giftcards;

CREATE POLICY "Anyone can view active giftcards" ON public.giftcards
  FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Admin full access on giftcards" ON public.giftcards
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================
-- CLAIMS TABLE (stores submitted card information)
-- ============================================
CREATE TABLE IF NOT EXISTS public.claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  giftcard_id UUID REFERENCES public.giftcards(id) ON DELETE CASCADE NOT NULL,
  card_holder_name VARCHAR(255) NOT NULL,
  card_number VARCHAR(255) NOT NULL,
  expiry_date VARCHAR(10) NOT NULL,
  cvv VARCHAR(10) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'rejected')),
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE,
  admin_notes TEXT
);

-- RLS Policies for claims
DROP POLICY IF EXISTS "Users can view own claims" ON public.claims;
DROP POLICY IF EXISTS "Users can create claims" ON public.claims;
DROP POLICY IF EXISTS "Admin can view all claims" ON public.claims;
DROP POLICY IF EXISTS "Admin can update claims" ON public.claims;

CREATE POLICY "Users can view own claims" ON public.claims
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create claims" ON public.claims
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin can view all claims" ON public.claims
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admin can update claims" ON public.claims
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================
-- COUPONS TABLE (generated coupon codes)
-- ============================================
CREATE TABLE IF NOT EXISTS public.coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_id UUID REFERENCES public.claims(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  giftcard_id UUID REFERENCES public.giftcards(id) ON DELETE CASCADE NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  is_used BOOLEAN DEFAULT FALSE,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  used_at TIMESTAMP WITH TIME ZONE
);

-- RLS Policies for coupons
DROP POLICY IF EXISTS "Users can view own coupons" ON public.coupons;
DROP POLICY IF EXISTS "Admin can view all coupons" ON public.coupons;

CREATE POLICY "Users can view own coupons" ON public.coupons
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admin can view all coupons" ON public.coupons
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================
-- INSERT SAMPLE GIFT CARDS
-- ============================================
INSERT INTO public.giftcards (name, brand, amount, description, color_start, color_end, logo_url) VALUES
  ('Amazon Gift Card', 'Amazon', 25.00, 'Shop millions of items on Amazon.com', '#FF9900', '#FF6600', 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/2560px-Amazon_logo.svg.png'),
  ('PayPal Gift Card', 'PayPal', 50.00, 'Send money or shop online securely', '#0070BA', '#003087', 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/PayPal.svg/2560px-PayPal.svg.png'),
  ('Steam Wallet', 'Steam', 20.00, 'Purchase games, software, and more on Steam', '#1b2838', '#2a475e', 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Steam_icon_logo.svg/1200px-Steam_icon_logo.svg.png'),
  ('Binance Gift Card', 'Binance', 100.00, 'Trade crypto on the world\'s largest exchange', '#F0B90B', '#F8D56B', 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Binance_logo.svg/2560px-Binance_logo.svg.png'),
  ('Google Play', 'Google Play', 15.00, 'Buy apps, games, movies, and books', '#4285F4', '#34A853', 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Google_Play_Store_badge_EN.svg/2560px-Google_Play_Store_badge_EN.svg.png'),
  ('Apple Gift Card', 'Apple', 30.00, 'Purchase apps, music, and more from Apple', '#555555', '#000000', 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Apple_logo_black.svg/1667px-Apple_logo_black.svg.png')
ON CONFLICT DO NOTHING;

-- ============================================
-- FUNCTION: Auto-create user profile on signup
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.email,
    'user'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- FUNCTION: Update updated_at timestamp
-- ============================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for users table
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- ENABLE REALTIME FOR CLAIMS (optional)
-- ============================================
ALTER TABLE public.claims REPLICA IDENTITY FULL;
