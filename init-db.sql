-- URL Shortener Database Initialization Script
-- This script creates the necessary tables for the URL shortener application

-- Create urls table
CREATE TABLE IF NOT EXISTS urls (
    id SERIAL PRIMARY KEY,
    short_code VARCHAR(6) UNIQUE NOT NULL,
    original_url TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create clicks table for analytics
CREATE TABLE IF NOT EXISTS clicks (
    id SERIAL PRIMARY KEY,
    short_code VARCHAR(6) NOT NULL,
    clicked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_agent TEXT,
    ip_address INET,
    referer TEXT,
    FOREIGN KEY (short_code) REFERENCES urls(short_code) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_urls_short_code ON urls(short_code);
CREATE INDEX IF NOT EXISTS idx_urls_created_at ON urls(created_at);
CREATE INDEX IF NOT EXISTS idx_clicks_short_code ON clicks(short_code);
CREATE INDEX IF NOT EXISTS idx_clicks_clicked_at ON clicks(clicked_at);

-- Insert some sample data for testing (optional)
-- INSERT INTO urls (short_code, original_url) VALUES 
-- ('abc123', 'https://www.google.com'),
-- ('def456', 'https://www.github.com'),
-- ('ghi789', 'https://www.stackoverflow.com');

-- Create a view for URL statistics
CREATE OR REPLACE VIEW url_stats AS
SELECT 
    u.short_code,
    u.original_url,
    u.created_at,
    COUNT(c.id) as click_count,
    MAX(c.clicked_at) as last_clicked_at
FROM urls u
LEFT JOIN clicks c ON u.short_code = c.short_code
GROUP BY u.short_code, u.original_url, u.created_at;

-- Grant permissions (adjust as needed for your setup)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;
