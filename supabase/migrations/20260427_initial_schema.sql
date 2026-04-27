-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT UNIQUE,
    email TEXT UNIQUE,
    avatar_url TEXT,
    xrp_wallet_address TEXT UNIQUE,
    cp_total INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create rooms table
DO $$ BEGIN
    CREATE TYPE game_mode AS ENUM ('free', 'wager');
    CREATE TYPE room_status AS ENUM ('waiting', 'confirming', 'active', 'completed', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    host_user_id TEXT,
    guest_user_id TEXT,
    mode game_mode NOT NULL DEFAULT 'free',
    wager_amount_drops BIGINT,
    status room_status NOT NULL DEFAULT 'waiting',
    escrow_condition TEXT,
    escrow_sequence_host BIGINT,
    escrow_sequence_guest BIGINT,
    winner_user_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create matches table
CREATE TABLE IF NOT EXISTS matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
    player_one_id TEXT NOT NULL,
    player_two_id TEXT NOT NULL,
    winner_id TEXT NOT NULL,
    mode game_mode NOT NULL,
    wager_amount_drops BIGINT,
    cp_awarded INTEGER DEFAULT 50,
    duration_seconds INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create cp_transactions
DO $$ BEGIN
    CREATE TYPE cp_reason AS ENUM ('match_win');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS cp_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_wallet_id TEXT NOT NULL, 
    amount INTEGER NOT NULL,
    reason cp_reason NOT NULL,
    match_id UUID REFERENCES matches(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Postgres Function & Trigger to update cp_total automatically
CREATE OR REPLACE FUNCTION update_cp_total()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE users
    SET cp_total = cp_total + NEW.amount
    WHERE xrp_wallet_address = NEW.user_wallet_id OR id::text = NEW.user_wallet_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS cp_transaction_insert ON cp_transactions;

CREATE TRIGGER cp_transaction_insert
AFTER INSERT ON cp_transactions
FOR EACH ROW
EXECUTE FUNCTION update_cp_total();
