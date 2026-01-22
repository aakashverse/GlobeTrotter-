CREATE DATABASE IF NOT EXISTS globetrotter;
USE globetrotter;


-- Users Table
CREATE TABLE users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20),
    city VARCHAR(100),
    country VARCHAR(100),
    profile_photo VARCHAR(255),
    additional_info TEXT,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- city table
CREATE TABLE cities (
    city_id INT PRIMARY KEY AUTO_INCREMENT,
    city_name VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL,
    region VARCHAR(100),
    cost_index DECIMAL(5,2), -- 1-10 scale
    popularity_score INT DEFAULT 0,
    description TEXT,
    image_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- activity table
CREATE TABLE activities (
    activity_id INT PRIMARY KEY AUTO_INCREMENT,
    activity_name VARCHAR(200) NOT NULL,
    city_id INT,
    estimated_cost DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    time_start TIME,
    end_start TIME,
    FOREIGN KEY (city_id) REFERENCES cities(city_id) ON DELETE CASCADE
);

-- trips table
CREATE TABLE trips (
    trip_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    trip_name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    start_date DATE,
    end_date DATE,
    total_budget DECIMAL(12,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- trip mates table
CREATE TABLE trip_mates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  trip_id INT NOT NULL,
  mate_name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (trip_id) REFERENCES trips(trip_id) ON DELETE CASCADE,
  INDEX idx_trip_mate (trip_id)
);

-- trip stops table
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

-- trip messages
CREATE TABLE trip_messages (
    message_id INT PRIMARY KEY AUTO_INCREMENT,
    trip_id INT NOT NULL,
    user_id INT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (trip_id) REFERENCES trips(trip_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- itinerary table
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

-- budget table
CREATE TABLE expenses (
    expense_id INT PRIMARY KEY AUTO_INCREMENT,
    trip_id INT NOT NULL,
    title VARCHAR(100) NOT NULL,          
    category VARCHAR(50) NOT NULL,        
    amount DECIMAL(10,2) NOT NULL,
    paid_by VARCHAR(50),                 
    payment_mode VARCHAR(30),           
    expense_date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (trip_id) REFERENCES trips(trip_id) ON DELETE CASCADE
);


-- saved destinations
CREATE TABLE saved_destinations (
    saved_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    city_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (city_id) REFERENCES cities(city_id) ON DELETE CASCADE,
    UNIQUE KEY unique_save (user_id, city_id)
);
