CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    profile_type VARCHAR(20) CHECK (profile_type IN ('student','parent','teacher')),
    ethnicity VARCHAR(30),
    dys_mode BOOLEAN DEFAULT FALSE,
    hpi_mode BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE scores (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    module VARCHAR(30),
    score INT,
    created_at TIMESTAMP DEFAULT NOW()
);