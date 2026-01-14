import { useState } from "react";
import { Send, Loader2, MapPin, ChevronLeft } from "lucide-react";

export default function JoinTripChat({onBack, onJoin}) {
  const [tripId, setTripId] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);

  const handleJoin = async (e) => {
    e?.preventDefault();
    
    const id = Number(tripId);
    console.log("Trip ID:", id, "Username:", username.trim());
    
    // Validation
    if (!tripId.trim() || isNaN(id) || id <= 0 || !username.trim()) {
      alert("Enter valid Trip ID and your name");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login first");
      return;
    }

    setLoading(true);

    try {
      console.log("1. Joining trip", id);
      
      // ✅ STEP 1: JOIN TRIP (add to trip_mates)
      const joinRes = await fetch(`/api/trips/${id}/join`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ mate_name: username.trim() })
      });

      console.log("Join response:", joinRes.status);

      if (!joinRes.ok) {
        const errorData = await joinRes.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || 'Failed to join trip');
      }

      console.log("✅ Joined trip successfully");

      // ✅ STEP 2: Verify access & get trip data
      console.log("2. Verifying trip access");
      const verifyRes = await fetch(`/api/trips/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log("Verify response:", verifyRes.status);

      if (!verifyRes.ok) {
        const errorData = await verifyRes.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || 'Access denied');
      }

      const tripData = await verifyRes.json();
      console.log("✅ Trip verified:", tripData);

      // Store and proceed
      localStorage.setItem(`chat_trip_${id}`, JSON.stringify({
        tripId: id,
        username: username.trim(),
        tripName: tripData.trip_name || `Trip ${id}`
      }));

      onJoin(id, username.trim());
      
    } catch (err) {
      console.error("❌ Join error:", err.message);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-slate-100 flex items-center justify-center p-4">
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 max-w-md w-full border border-white/50"> 
      <div className="text-center mb-8">
          <div className="w-20 h-20 bg-emerald-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-10 h-10 text-emerald-600" />
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
            Join Trip Chat
          </h2>
          <p className="text-gray-600">Enter details to join trip room</p>
        </div>

        <form onSubmit={handleJoin} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Your Name
            </label>
            <input
              type="text"
              placeholder="John Doe"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-transparent transition-all"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Trip ID
            </label>
            <input
              type="number"
              min="1"
              placeholder="123"
              value={tripId}
              onChange={(e) => setTripId(e.target.value)}
              className="w-full p-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-transparent transition-all"
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading || !tripId || !username.trim()}
            className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 disabled:from-gray-300 disabled:to-gray-400 text-white py-4 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex items-center justify-center space-x-2 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Checking...</span>
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                <span>Join Chat</span>
              </>
            )}
          </button>
        </form>

        <p className="text-xs text-gray-500 mt-6 text-center">
          Ask your trip organizer for the Trip ID
        </p>
      </div>
    </div>
  );
}
