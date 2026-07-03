CREATE TABLE IF NOT EXISTS leads (
    id SERIAL PRIMARY KEY,
    lead_number INT UNIQUE NOT NULL,
    lead_origin VARCHAR(100),
    lead_source VARCHAR(100),
    total_visits INT,
    time_spent_on_website INT,
    page_views_per_visit NUMERIC(5,2),
    last_activity VARCHAR(100),
    conversion_score INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);