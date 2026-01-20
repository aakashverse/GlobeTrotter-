import { useState } from "react";
import { Send, Loader2, MapPin, ChevronRight } from "lucide-react";
const API_BASE = import.meta.env.VITE_API_URL;

export default function JoinTripChat({onJoin, onBack}) {
  const [tripId, setTripId] = useState("");
  const [loading, setLoading] = useState(false);

  const handleJoin = async (e) => {
    e?.preventDefault();
    
    const id = Number(tripId);
    // console.log("Trip ID:", id);
    
    // Validation
    if (!tripId.trim() || isNaN(id) || id <= 0) {
      alert("Enter valid Trip ID and your name");
      return;
    }

    setLoading(true);

    try {
      // console.log("1. Joining trip", id);
      
      // join trip
      const joinRes = await fetch(`${API_BASE}/api/trips/${id}/join`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
      });

      // console.log("Join response:", joinRes.status);

      if (!joinRes.ok) {
        const errorData = await joinRes.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || 'Failed to join trip');
      }

      // console.log("Joined trip successfully");

      //  Verify access & get trip data
      const verifyRes = await fetch(`/api/trips/${id}`, {
        credentials: 'include',
      });

      // console.log("Verify response:", verifyRes.status);

      if (!verifyRes.ok) {
        const errorData = await verifyRes.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || 'Access denied');
      }

      const tripData = await verifyRes.json();
      // console.log(" Trip verified:", tripData);

      // Store and proceed
      localStorage.setItem(`chat_trip_${id}`, JSON.stringify({
        tripId: id,
        tripName: tripData.trip_name || `Trip ${id}`
      }));

      onJoin(id);
      
    } catch (err) {
      console.error("Join error:", err.message);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <header className="bg-white sticky top-0 z-20 border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ChevronRight className="w-6 h-6 rotate-180" />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">
            Back
          </h1>
        </div>
      </header>
   
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full">

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <MapPin className="text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold">Join Trip Chat</h2>
          <p className="text-gray-600">Enter Trip ID to join</p>
        </div>

        <form onSubmit={handleJoin} className="space-y-6">
          <input
            type="number"
            min="1"
            placeholder="Trip ID"
            value={tripId}
            onChange={(e) => setTripId(e.target.value)}
            disabled={loading}
            className="w-full p-4 border rounded-2xl focus:ring-2 focus:ring-emerald-300"
          />

          <button
            type="submit"
            disabled={loading || !tripId}
            className="w-full bg-emerald-500 text-white py-4 rounded-2xl font-bold flex justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" /> : <Send />}
            {loading ? "Joining..." : "Join Chat"}
          </button>
        </form>

        <p className="text-xs text-gray-500 text-center mt-4">
          Ask your trip owner for the Trip ID
        </p>
      </div>
    </div>
    </>
  );
}
