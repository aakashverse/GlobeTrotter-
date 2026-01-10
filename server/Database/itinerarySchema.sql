-- daily activities 

CREATE TABLE itinerary_items (
    itinerary_id INT PRIMARY KEY AUTO_INCREMENT,
    stop_id INT NOT NULL,
    activity_id INT,
    day_number INT NOT NULL,
    activity_name VARCHAR(200) NOT NULL,
    activity_time TIME,
    estimated_cost DECIMAL(10,2) DEFAULT 0,
    actual_cost DECIMAL(10,2),
    notes TEXT,
    item_order INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (stop_id) REFERENCES trip_stops(stop_id) ON DELETE CASCADE,
    FOREIGN KEY (activity_id) REFERENCES activities(activity_id) ON DELETE SET NULL
);
