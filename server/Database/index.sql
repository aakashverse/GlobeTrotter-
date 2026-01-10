-- Indexes for better performance
CREATE INDEX idx_trips_user ON trips(user_id);
CREATE INDEX idx_trips_status ON trips(status);
CREATE INDEX idx_stops_trip ON trip_stops(trip_id);
CREATE INDEX idx_itinerary_stop ON itinerary_items(stop_id);
CREATE INDEX idx_cities_country ON cities(country);
CREATE INDEX idx_activities_city ON activities(city_id);
CREATE INDEX idx_community_shared ON community_shares(shared_by);

-- Insert sample cities
INSERT INTO cities (city_name, country, region, cost_index, popularity_score, description) VALUES
('Paris', 'France', 'Europe', 8.5, 95, 'The City of Light - Famous for Eiffel Tower, Louvre, and romantic atmosphere'),
('Tokyo', 'Japan', 'Asia', 7.8, 90, 'A bustling metropolis blending tradition and modernity'),
('New York', 'USA', 'North America', 9.2, 92, 'The city that never sleeps - Times Square, Central Park, and more'),
('Bali', 'Indonesia', 'Asia', 5.5, 88, 'Tropical paradise with beaches, temples, and rich culture'),
('London', 'UK', 'Europe', 9.0, 91, 'Historic city with royal palaces, museums, and diverse culture');

-- Insert sample activities
INSERT INTO activities (activity_name, city_id, category, description, estimated_cost, duration_hours) VALUES
('Visit Eiffel Tower', 1, 'sightseeing', 'Iconic iron tower with stunning city views', 25.00, 2.5),
('Louvre Museum Tour', 1, 'culture', 'World-famous art museum', 20.00, 4.0),
('Tokyo Food Tour', 2, 'food', 'Explore authentic Japanese cuisine', 80.00, 3.0),
('Statue of Liberty', 3, 'sightseeing', 'Iconic American landmark', 25.00, 3.0),
('Beach Day in Seminyak', 4, 'adventure', 'Relax on beautiful beaches', 15.00, 6.0);