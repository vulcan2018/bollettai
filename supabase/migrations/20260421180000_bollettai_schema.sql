-- BollettAI Schema
-- Run this in Supabase SQL Editor

-- Create dedicated schema
CREATE SCHEMA IF NOT EXISTS bollettai;

-- Users table
CREATE TABLE bollettai.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  company_name TEXT,
  vat_number TEXT,
  phone TEXT,
  tier TEXT NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'base', 'pro')),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  analyses_this_month INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Analyses table (stores each bolletta analysis)
CREATE TABLE bollettai.analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES bollettai.users(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  fornitore TEXT,
  pod TEXT,
  potenza_impegnata TEXT,
  periodo_fatturazione TEXT,
  consumo_totale_kwh NUMERIC,
  consumo_f1 NUMERIC,
  consumo_f2 NUMERIC,
  consumo_f3 NUMERIC,
  costo_energia NUMERIC,
  oneri_sistema NUMERIC,
  imposte NUMERIC,
  totale NUMERIC,
  valutazione TEXT CHECK (valutazione IN ('promossa', 'bocciata', 'sufficiente')),
  problemi TEXT[],
  suggerimenti TEXT[],
  risparmio_potenziale NUMERIC,
  raw_response JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Contacts table (stores contact form submissions)
CREATE TABLE bollettai.contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  responded BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE bollettai.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE bollettai.analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE bollettai.contacts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
CREATE POLICY "Users can view own profile" ON bollettai.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON bollettai.users
  FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for analyses
CREATE POLICY "Users can view own analyses" ON bollettai.analyses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own analyses" ON bollettai.analyses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Contacts are insert-only for authenticated users, admin-readable via service key
CREATE POLICY "Anyone can submit contact form" ON bollettai.contacts
  FOR INSERT WITH CHECK (true);

-- Indexes
CREATE INDEX idx_analyses_user_id ON bollettai.analyses(user_id);
CREATE INDEX idx_analyses_created_at ON bollettai.analyses(created_at DESC);
CREATE INDEX idx_users_email ON bollettai.users(email);

-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION bollettai.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO bollettai.users (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create user profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION bollettai.handle_new_user();

-- Function to reset monthly analysis count (run via cron)
CREATE OR REPLACE FUNCTION bollettai.reset_monthly_analyses()
RETURNS void AS $$
BEGIN
  UPDATE bollettai.users SET analyses_this_month = 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
