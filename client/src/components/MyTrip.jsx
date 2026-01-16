import { useState, useEffect } from "react";
import { ChevronRight, Search, MapPin } from "lucide-react"; 
import TripCard from "./TripCard";
import useToast from "../hooks/useToast";

export default function MyTrips({ onNavigate, user }) {
  const [trips, setTrips] = useState([]);
  const [myTrips, setMyTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const {showSuccess, showError} = useToast();

  const handleDeleteTrip = async (tripId) => {
    try {
      const res = await fetch(`/api/trips/${tripId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if(!res.ok) throw new Error(`Delete Failed: ${res.status}`);
      setTrips(prev => prev.filter(trip => trip.trip_id !== tripId));
      setMyTrips(prev => prev.filter(trip => trip.trip_id !== tripId));
      showSuccess('Trip deleted!');
    } catch(err) {
      showError('Delete failed');
    }
  };
  
  const handleEditTrip = (trip) => {
    onNavigate(`/trips/${trip.trip_id}/edit`, {trip});
  };

  const handleNewStop = (tripId) => {
    onNavigate(`/trips/${tripId}/new-stop`);
  };

  useEffect(() => {
    const fetchAllTrips = async () => {
      try {
        setLoading(true);

        // ✅ 1. Owned trips only
        const ownedRes = await fetch("/api/trips", {
          credentials: 'include'
        });
        if(!ownedRes.ok) throw new Error('Failed to fetch owned trips');
        const ownedData = await ownedRes.json();

        // ✅ 2. ALL trips (owned + joined) - Use correct endpoint
        const allRes = await fetch(`/api/users/${user.user_id}/trips`, {
          credentials: 'include'
        });
        if(!allRes.ok) throw new Error('Failed to fetch all trips');  // ✅ Fixed
        const allData = await allRes.json();

        setTrips(Array.isArray(ownedData) ? ownedData : []);
        setMyTrips(Array.isArray(allData) ? allData : []);

      } catch (err) {
        console.error('Fetch error:', err);
        showError("Failed to load trips");
        setTrips([]);
        setMyTrips([]);
      } finally {
        setLoading(false);
      }
    };
    
    // ✅ FIXED: Check user exists (from login cookie)
    if(user) {
      fetchAllTrips();
    } else {
      onNavigate('login');
      setLoading(false);
    }
  }, [user, onNavigate]);  // ✅ Use user prop instead of undefined token

  const filteredTrips = myTrips.filter(trip =>
    trip.trip_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trip.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trip.status?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg text-gray-500">Loading your trips...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center space-x-4">
          <button
            onClick={() => onNavigate("dashboard")}
            className="p-2 hover:bg-gray-100 rounded-lg transition-all"
          >
            <ChevronRight className="w-6 h-6 rotate-180" />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">
            My Trips ({filteredTrips.length})
          </h1>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm p-4 mb-8 flex items-center space-x-4 border">
          <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search trips by name or place..."
            className="flex-1 outline-none py-2 text-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {filteredTrips.length === 0 ? (
          <div className="text-center py-20">
            <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No trips found</h3>
            <p className="text-gray-500 mb-6">Create your first trip!</p>
            <button 
              onClick={() => onNavigate('create-trip')}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              + New Trip
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTrips.map((trip) => (
              <TripCard 
                key={trip.trip_id}
                trip={trip}
                role={trip.role || 'owner'}
                onDelete={handleDeleteTrip}
                onEditTrip={handleEditTrip}
                onNewStop={handleNewStop}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
