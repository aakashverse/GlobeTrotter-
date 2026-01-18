-- Indexes for better performance
CREATE INDEX idx_trips_user ON trips(user_id);
CREATE INDEX idx_trips_status ON trips(status);
CREATE INDEX idx_stops_trip ON trip_stops(trip_id);
CREATE INDEX idx_itinerary_stop ON itinerary_items(stop_id);
CREATE INDEX idx_cities_country ON cities(country);
CREATE INDEX idx_activities_city ON activities(city_id);
CREATE INDEX idx_community_shared ON community_shares(shared_by);
