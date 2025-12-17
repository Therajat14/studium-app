-- 1. Create the base social profile table
CREATE TABLE IF NOT EXISTS users_social (
    user_id VARCHAR(255) PRIMARY KEY, -- Will store the MongoDB ObjectId
    follower_count INT DEFAULT 0,
    following_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create the connections table for Following/Followers
CREATE TABLE IF NOT EXISTS connections (
    id SERIAL PRIMARY KEY,
    follower_id VARCHAR(255) REFERENCES users_social(user_id) ON DELETE CASCADE,
    following_id VARCHAR(255) REFERENCES users_social(user_id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(follower_id, following_id) -- Prevents duplicate follows
);



