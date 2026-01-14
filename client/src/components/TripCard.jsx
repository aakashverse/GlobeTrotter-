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
  X
} from "lucide-react";
import StopDetails from "./StopsDetails";

export default function TripCard({ trip, onDelete, onEditTrip, onNewStop, token, role }) {  
  const [stops, setStops] = useState([]);  
  const [showStopsModal, setShowStopsModal] = useState(false);  
  const [loadingStops, setLoadingStops] = useState(false);

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
  
  // Fetch stops
  useEffect(() => {
    if (trip.trip_id && token) {
      fetchStops();
    }
  }, [trip.trip_id, token]);

  const fetchStops = async () => {
    setLoadingStops(true);
    try {
      const res = await fetch(`/api/trips/${trip.trip_id}/stops`, {
        headers: { Authorization: `Bearer ${token}` }
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

  const handleEdit = () => {
    onEditTrip(trip);
  };

  const toggleStopsModal = () => {
    setShowStopsModal(!showStopsModal);
  };

  return (
    <>
      <div className={`rounded-xl p-6 border-l-4 bg-white shadow-sm hover:shadow-md transition-all cursor-pointer ${status.classes}`}>
        {/* header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="font-bold text-lg text-gray-900 truncate">
              {trip.trip_name}
            </h3>
            {trip.description && (
              <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                {trip.description}
              </p>
            )}
          </div>

          {/* Role Badge */}
          {role && (
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ml-3 ${
              role === 'owner' 
                ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' 
                : 'bg-green-100 text-green-800 border border-green-200'
            }`}>
              {role === 'owner' ? '👑 Owner' : '👥 Member'}
            </span>
          )}

          { /* Status Badge */}
          <span className={`flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-md border ${status.classes}`}>
            {status.icon}
            {status.label}
          </span>
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
            {stops.length} Stop{stops.length !== 1 ? 's' : ''} Details
          </button>
        </div>

        {/* Trip Mates */}
        {trip.trip_mates && Array.isArray(trip.trip_mates) && trip.trip_mates.length > 0 && (
          <div className="mb-4 flex items-center gap-2 text-sm text-gray-700">
            <Users size={16} />
            <div className="flex flex-wrap gap-1">
              {trip.trip_mates.map((mate, idx) => (
                <span key={idx} className="px-2 py-1 bg-gray-100 rounded-md text-xs">
                  {mate}
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
        <div className="flex gap-2">
          <button
            onClick={handleEdit}
            className="flex items-center gap-1 px-4 py-2 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-xl shadow-md hover:shadow-lg transition-all flex-1 justify-center"
          >
            <Pencil size={16} />
            Edit
          </button>

          <button
            onClick={() => onNewStop(trip.trip_id)}
            className="flex items-center gap-1 px-4 py-2 text-sm bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-md hover:shadow-lg transition-all flex-1 justify-center"
          >
            <Plus size={16} />
            New Stop
          </button>

          <button
            onClick={handleDelete}
            className="flex items-center gap-1 px-4 py-2 text-sm bg-red-500 hover:bg-red-600 text-white rounded-xl shadow-md hover:shadow-lg transition-all flex-1 justify-center"
          >
            <Trash2 size={16} />
            Delete
          </button>
        </div>
      </div>

      {/* ✅ FIXED: Complete Modal */}
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
              <StopDetails stops={stops} loading={loadingStops} tripId={trip.trip_id} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
