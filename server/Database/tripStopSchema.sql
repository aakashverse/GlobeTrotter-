CREATE TABLE trip_stops (
    stop_id INT PRIMARY KEY AUTO_INCREMENT,
    trip_id INT NOT NULL,
    city_id INT NOT NULL,
    stop_order INT NOT NULL,
    start_date DATE,
    end_date DATE,
    notes TEXT,
    stop_name VARCHAR(30),
    amount_spent DECIMAL(10,0) DEFAULT 0,
    paid_by VARCHAR(20),
    grand_total DECIMAL(10,0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (trip_id) REFERENCES trips(trip_id) ON DELETE CASCADE,
    FOREIGN KEY (city_id) REFERENCES cities(city_id) ON DELETE CASCADE
);