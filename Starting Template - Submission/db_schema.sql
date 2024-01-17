
-- Enforce foreign key constraints
PRAGMA foreign_keys=ON;

BEGIN TRANSACTION;

-- Users Table for Author information
CREATE TABLE IF NOT EXISTS users (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL,
    full_name TEXT,
    password TEXT -- if you decide to implement authentication
);

-- Blog Posts Table for storing draft and published articles
CREATE TABLE IF NOT EXISTS blog_posts (
    post_id INTEGER PRIMARY KEY AUTOINCREMENT,
    author_id INTEGER,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    status TEXT CHECK( status IN ('draft','published') ) DEFAULT 'draft',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    published_at DATETIME,
    read_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    FOREIGN KEY (author_id) REFERENCES users(user_id)
);

-- Comments Table for storing reader comments
CREATE TABLE IF NOT EXISTS comments (
    comment_id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id INTEGER,
    commenter_name TEXT NOT NULL,
    comment_text TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES blog_posts(post_id)
);

-- Likes Table for storing likes on articles
CREATE TABLE IF NOT EXISTS likes (
    like_id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id INTEGER,
    user_id INTEGER, -- Optional: if you track which user liked the post
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES blog_posts(post_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Blog Settings Table for storing blog-wide settings like title and author name
CREATE TABLE IF NOT EXISTS blog_settings (
    setting_id INTEGER PRIMARY KEY AUTOINCREMENT,
    blog_title TEXT,
    author_name TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert default settings
INSERT INTO blog_settings (blog_title, author_name) VALUES ('My Awesome Blog', 'Default Author');

COMMIT;

