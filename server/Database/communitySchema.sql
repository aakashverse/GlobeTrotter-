-- for shared itineraries (daily activities)

CREATE TABLE community_shares (
    share_id INT PRIMARY KEY AUTO_INCREMENT,
    trip_id INT NOT NULL,
    shared_by INT NOT NULL,
    title VARCHAR(200),
    description TEXT,
    likes_count INT DEFAULT 0,
    views_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (trip_id) REFERENCES trips(trip_id) ON DELETE CASCADE,
    FOREIGN KEY (shared_by) REFERENCES users(user_id) ON DELETE CASCADE
);