CREATE TABLE budget_breakdown (
    budget_id INT PRIMARY KEY AUTO_INCREMENT,
    trip_id INT NOT NULL,
    category VARCHAR(50) NOT NULL, -- transport, accommodation, food, activities
    estimated_amount DECIMAL(10,2) DEFAULT 0,
    actual_amount DECIMAL(10,2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (trip_id) REFERENCES trips(trip_id) ON DELETE CASCADE
);
