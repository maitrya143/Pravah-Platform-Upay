-- Create users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    volunteer_id VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    city VARCHAR(100),
    center_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create volunteer_roster table
CREATE TABLE volunteer_roster (
    id SERIAL PRIMARY KEY,
    volunteer_id VARCHAR(50) NOT NULL,
    center_id INTEGER NOT NULL,
    status VARCHAR(50) DEFAULT 'active',
    joined_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (volunteer_id) REFERENCES users(volunteer_id),
    UNIQUE(volunteer_id, center_id)
);

-- Create indexes
CREATE INDEX idx_users_volunteer_id ON users(volunteer_id);
CREATE INDEX idx_users_center_id ON users(center_id);
CREATE INDEX idx_volunteer_roster_center_id ON volunteer_roster(center_id);

