CREATE TABLE trip_mates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  trip_id INT NOT NULL,
  mate_name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (trip_id) REFERENCES trips(trip_id) ON DELETE CASCADE,
  INDEX idx_trip_mate (trip_id)
);