CREATE TYPE game_mode AS ENUM ('free', 'wager');
CREATE TYPE room_status AS ENUM ('waiting', 'confirming', 'active', 'completed', 'cancelled');
CREATE TYPE cp_reason AS ENUM ('match_win');

CREATE TABLE users (
    id TEXT PRIMARY KEY, -- Will be the Xaman wallet address
    username TEXT UNIQUE,
    avatar_url TEXT,
    cp_total INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    host_user_id TEXT REFERENCES users(id),
    guest_user_id TEXT REFERENCES users(id),
    mode game_mode NOT NULL,
    wager_amount_drops BIGINT,
    status room_status NOT NULL DEFAULT 'waiting',
    escrow_condition TEXT,
    escrow_sequence_host BIGINT,
    escrow_sequence_guest BIGINT,
    winner_user_id TEXT REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID REFERENCES rooms(id),
    player_one_id TEXT REFERENCES users(id),
    player_two_id TEXT REFERENCES users(id),
    winner_id TEXT REFERENCES users(id),
    mode game_mode NOT NULL,
    wager_amount_drops BIGINT,
    cp_awarded INTEGER DEFAULT 0,
    duration_seconds INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE cp_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT REFERENCES users(id),
    amount INTEGER NOT NULL,
    reason cp_reason NOT NULL,
    match_id UUID REFERENCES matches(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
