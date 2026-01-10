CREATE TABLE activities (
    activity_id INT PRIMARY KEY AUTO_INCREMENT,
    activity_name VARCHAR(200) NOT NULL,
    city_id INT,
    category VARCHAR(50), -- sightseeing, food, adventure, etc.
    description TEXT,
    estimated_cost DECIMAL(10,2),
    duration_hours DECIMAL(4,2),
    image_url VARCHAR(255),
    popularity_score INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (city_id) REFERENCES cities(city_id) ON DELETE CASCADE
);