import { useState, useEffect } from "react";
import {
  Calendar,
  Users,
  Trash2,
  MapPin,
  Clock,
  CheckCircle,
  Plus,
  Pencil,
  Pin,
  X,
  Sparkles
} from "lucide-react";
import StopDetails from "./StopsDetails";
import EditTripModal from "./EditTrip";
const baseURL = import.meta.env.VITE_API_URL;

export default function TripCard({ trip, onDelete, onNewStop, role, onTripUpdate }) {  
  const [stops, setStops] = useState([]);  
  const [showStopsModal, setShowStopsModal] = useState(false);  
  const [loadingStops, setLoadingStops] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [tripMates, setTripMates] = useState([]);
  
  // ai states
  const [showQuickAI, setShowQuickAI] = useState(false);
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [loadingAI, setLoadingAI] = useState(false);

  const statusConfig = {
    ongoing: {
      label: "Ongoing",
      icon: <Clock size={14} />,
      classes: "bg-yellow-100 text-yellow-800 border-yellow-400"
    },
    upcoming: {
      label: "Upcoming", 
      icon: <Calendar size={14} />,
      classes: "bg-blue-100 text-blue-800 border-blue-400"
    },
    completed: {
      label: "Completed",
      icon: <CheckCircle size={14} />,
      classes: "bg-green-100 text-green-800 border-green-400"
    }
  };

  const status = statusConfig[trip.status] || {
    label: "Unknown",
    icon: null,
    classes: "bg-gray-100 text-gray-800 border-gray-300"
  };
  
  // ai handler
  const askTripAI = async () => {
    if (!aiQuery.trim()) return;
    setLoadingAI(true);
    try {
      const res = await fetch(`${baseURL}/api/trips/${trip.trip_id}/ai-assistant`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ userQuery: aiQuery })
      });
      const data = await res.json();
      setAiResponse(data.response);
      setAiQuery('');
    } catch (err) {
      setAiResponse("Sorry, AI is taking a coffee break! 😅");
    } finally {
      setLoadingAI(false);
    }
  };
  
  // Fetch stops and mates
  useEffect(() => {
    if (trip.trip_id) {
      fetchStops();
      fetchTripMates();
    }
  }, [trip.trip_id]);
  
  // fetch tripamtes
  const fetchTripMates = async () => {
  try {
    const res = await fetch(`${baseURL}/api/trips/${trip.trip_id}/mates`, {
      credentials: 'include'
    });
    if (res.ok) {
      const data = await res.json();
      setTripMates(data || []);
    }
    } catch (err) {
      console.error('Failed to fetch mates:', err);
    }
  };

  const fetchStops = async () => {
    setLoadingStops(true);
    try {
      const res = await fetch(`${baseURL}/api/trips/${trip.trip_id}/stops`, {
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setStops(data || []);
      }
    } catch (err) {
      console.error('Failed to fetch stops:', err);
    } finally {
      setLoadingStops(false);
    }
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (confirm("Delete this trip?")) {
      onDelete(trip.trip_id);
    }
  };

  const handleEdit = (e) => {
    e?.stopPropagation();
    setShowEditModal(true);
  };

  const toggleStopsModal = () => {
    setShowStopsModal(!showStopsModal);
  };

  return (
    <>
      <div className={`rounded-xl p-6 border-l-4 bg-white shadow-sm hover:shadow-md transition-all cursor-pointer ${status.classes}`}>
        {/* header */}
          <div className="flex items-start justify-between mb-6 gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-xl text-gray-900 mb-2 truncate">{trip.trip_name}</h3>
            {trip.description && (
              <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">{trip.description}</p>
            )}
          </div>

        {/* Right side - Role + Status with SPACE */}
        <div className="flex flex-col items-end gap-2 min-w-fit">
          {role && (
            <span className={`px-3 py-1.5 text-xs font-bold rounded-lg shadow-sm ${
              role === 'owner' 
                ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white shadow-yellow-300/50' 
                : 'bg-gradient-to-r from-emerald-400 to-teal-400 text-white shadow-emerald-300/50'
            }`}>
              {role === 'owner' ? '👑 Owner' : '👥 Member'}
            </span>
          )}
          
        <span className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg shadow-sm ${status.classes}`}>
          {status.icon}
          {status.label}
            </span>
          </div>
        </div>

        {/* Meta Info */}
        <div className="flex items-center justify-between gap-4 text-sm text-gray-600 mb-4">
          <span className="flex items-center gap-1">
            <MapPin size={14} />
            {loadingStops ? '...' : stops.length} stops
          </span>

          {trip.start_date && (
            <span className="flex items-center gap-1">
              <Calendar size={14} />
              {new Date(trip.start_date).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
            </span>
          )}

          {/* Proper Modal Toggle */}
          <button
            type="button"
            onClick={toggleStopsModal}
            className="flex items-center gap-1 px-4 py-2 text-sm bg-amber-100 hover:bg-amber-200 text-amber-800 border border-amber-300 rounded-lg transition-all hover:shadow-sm disabled:opacity-50"
            disabled={loadingStops}
          >
            <Pin size={14} />
             Stops Details
          </button>
        </div>

        {/* Trip Mates */}
        {tripMates.length > 0 && (
          <div className="mb-4 flex items-center gap-2 text-sm text-gray-700">
            <Users size={16} />
            <div className="flex flex-wrap gap-1">
              {tripMates.map((mate, idx) => (
                <span key={idx} className="px-2 py-1 bg-gray-100 rounded-md text-xs">
                  {mate.mate_name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Budget */}
        {trip.total_budget && Number(trip.total_budget) > 0 && (
          <div className="mb-6 pt-4 border-t text-sm font-semibold text-gray-900">
            💰 Total Budget: ₹{Number(trip.total_budget).toLocaleString("en-IN")}
          </div>
        )}
        
        {/* Action Buttons */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <button onClick={handleEdit} className="flex items-center gap-1 px-3 py-2 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded-xl shadow-md hover:shadow-lg transition-all justify-center">
            <Pencil size={14} /> Edit
          </button>


          <button onClick={() => onNewStop(trip.trip_id)} className="flex items-center gap-1 px-3 py-2 text-xs bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-md hover:shadow-lg transition-all justify-center">
            <Plus size={14} /> Add Stop
          </button>

          <button onClick={handleDelete} className="flex items-center gap-1 px-3 py-2 text-xs bg-red-500 hover:bg-red-600 text-white rounded-xl shadow-md hover:shadow-lg transition-all justify-center">
            <Trash2 size={14} /> Delete
          </button>

          {/* AI btn */}
          <button
            onClick={() => setShowQuickAI(true)}
            className="flex items-center gap-1 px-3 py-2 text-xs bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all justify-center"
            title="Ask AI about this trip"
          >
            <Sparkles size={14} />
            AI
          </button>
        </div>
      </div>

       {/* Quick AI Modal */}
      {showQuickAI && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full max-h-[80vh] shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-8 h-8 animate-pulse" />
                  <div>
                    <h2 className="text-xl font-bold">{trip.trip_name} AI</h2>
                    <p className="text-indigo-100 text-sm">Ask about weather, food, plans...</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowQuickAI(false)}
                  className="p-2 hover:bg-white/20 rounded-2xl transition-all"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* AI Chat */}
            <div className="p-6 max-h-96 overflow-y-auto">
              {aiResponse && (
                <div className="mb-4 p-4 bg-indigo-50 border-l-4 border-indigo-400 rounded-2xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-5 h-5 text-indigo-500" />
                    <span className="text-sm font-semibold text-indigo-800">Trip AI</span>
                  </div>
                  <p className="text-sm text-gray-800 leading-relaxed">{aiResponse}</p>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-6 border-t bg-gray-50">
              <div className="flex gap-3">
                <input
                  value={aiQuery}
                  onChange={(e) => setAiQuery(e.target.value)}
                  placeholder="Weather? Restaurants? Day 2 plan?"
                  className="flex-1 bg-white border-2 border-gray-200 hover:border-indigo-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 rounded-2xl px-4 py-3 placeholder-gray-500 transition-all"
                  onKeyDown={(e) => e.key === 'Enter' && !loadingAI && askTripAI()}
                />
                <button
                  onClick={askTripAI}
                  disabled={!aiQuery.trim() || loadingAI}
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 disabled:opacity-50 text-white px-6 py-3 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all flex-shrink-0 flex items-center gap-2"
                >
                  {loadingAI ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Sparkles className="w-5 h-5" />
                  )}
                  Ask
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/*Complete Modal */}
      {showStopsModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="p-6 border-b flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{trip.trip_name} Stops</h2>
                <p className="text-gray-600">{stops.length} stops</p>
              </div> 
              <button
                onClick={toggleStopsModal}
                className="p-2 hover:bg-gray-100 rounded-xl transition-all"
              >
                <X size={24} />
              </button>
            </div>
            
            {/* Modal Content */}
            <div className="max-h-96 overflow-auto p-6">
              <StopDetails stops={stops} tripId={trip.trip_id} />
            </div>
          </div>
        </div>
      )}

      {showEditModal && (
          <EditTripModal
            trip={trip}
            onClose={() => setShowEditModal(false)}
            onUpdated={ (updatedTrip) => {
              onTripUpdate(updatedTrip);
              setShowEditModal(false);
            }}
          />
      )}
    </>
  );
}
