import { useState, useEffect } from "react";
import { ChevronRight, Plus, MapPin, Trash2, DollarSign, Activity, Save, Clock, User } from "lucide-react";
import useToast from "../hooks/useToast";
const API = import.meta.env.VITE_API_URL;

export default function ItineraryBuilder({ tripId, onBack }) {
  const [stops, setStops] = useState([]);
  const [saving, setSaving] = useState(false);
  const { showSuccess, showError } = useToast();

  // load
   useEffect(() => {
  if (!tripId) return;

  const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toISOString().split('T')[0];  
  };
  
  fetch(`${API}/api/trips/${tripId}/itinerary`, { credentials: "include" })
    .then(res => {
      if (!res.ok) throw new Error('Failed');
      return res.json();
    })
    .then(data => {
      console.log('Backend data:', data.stops[0]);
      
      const loadedStops = (data.stops || []).map(stop => ({
        id: stop.id,
        city: stop.city || "",
        startDate: formatDate(stop.start_date) || "",
        endDate: formatDate(stop.end_date) || "",
        amount: stop.amount_spent || "",
        paid_by: stop.paid_by || "",
        activities: stop.activities || []  
      }));
      
      console.log('Loaded stops:', loadedStops[0]);
      setStops(loadedStops.length ? loadedStops : [createEmptyStop()]);
    })
    .catch(err => {
      console.error('Load failed:', err);
      setStops([createEmptyStop()]);
    });
}, [tripId]);


  const createEmptyStop = () => ({
    id: Date.now(),
    city: "", startDate: "", endDate: "", amount: "",
    paid_by: "", activities: [{ id: Date.now(), name: "", timeStart: "", timeEnd: "", grand_total: "", category: "sightseeing" }]
  });

  const addStop = () => setStops([...stops, createEmptyStop()]);
  const removeStop = (id) => setStops(stops.filter(s => s.id !== id));
  
  const updateStop = (id, field, value) => {
    setStops(stops.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const addActivity = (stopId) => {
    setStops(stops.map(stop => stop.id === stopId
      ? { ...stop, activities: [...stop.activities, { 
          id: Date.now(), name: "", timeStart: "", timeEnd: "", grand_total: "", category: "sightseeing" 
        }] }
      : stop
    ));
  };

  const updateActivity = (stopId, actId, field, value) => {
    setStops(stops.map(stop => stop.id === stopId
      ? { ...stop, activities: stop.activities.map(act => 
          act.id === actId ? { ...act, [field]: value } : act 
        ) }
      : stop
    ));
  };

  const removeActivity = (stopId, actId) => {
    setStops(stops.map(stop => stop.id === stopId
      ? { ...stop, activities: stop.activities.filter(a => a.id !== actId) }
      : stop
    ));
  };

  
  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API}/api/trips/${tripId}/itinerary`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stops })
      });
      
      if (res.ok) {
        showSuccess("Saved!");
        onBack();
      } else {
        showError("Save failed");
      }
    } catch (err) {
      showError("Save failed");
    } finally {
      setSaving(false);
    }
  };

  const totalBudget = stops.reduce((sum, s) => sum + Number(s.amount || 0), 0);
  const totalActivities = stops.reduce((sum, s) => sum + s.activities.length, 0);

  if (!stops.length) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* SIMPLE HEADER */}
      <div className="bg-white rounded-lg shadow p-6 mb-6 flex flex-col sm:flex-row gap-4 items-center sm:justify-between">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded">
          <ChevronRight className="w-5 h-5 rotate-180" />
        </button>
        
        <div className="text-center">
          <h1 className="text-2xl font-bold">Itinerary</h1>
          <div className="flex gap-4 text-sm mt-2">
            <span>{stops.length} stops</span>
            <span>{totalActivities} activities</span>
            <span>₹{totalBudget}</span>
          </div>
        </div>
        
        <button 
          onClick={handleSave} 
          disabled={saving}
          className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 flex items-center gap-2"
        >
          {saving ? "Saving..." : <> <Save size={16} /> Save </>}
        </button>
      </div>

      {/* SIMPLE STOPS */}
      <div className="space-y-4">
        {stops.map((stop, index) => (
          <div key={stop.id} className="bg-white p-6 rounded-lg shadow">
            {/* Stop Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 p-4 border rounded">
              <div>
                <label>City</label>
                <input 
                  value={stop.city} 
                  onChange={e => updateStop(stop.id, "city", e.target.value)}
                  className="w-full p-2 border rounded mt-1"
                />
              </div>
              <div>
                <label>Start</label>
                <input 
                  type="date" 
                  value={stop.startDate} 
                  onChange={e => updateStop(stop.id, "startDate", e.target.value)}
                  className="w-full p-2 border rounded mt-1"
                />
              </div>
              <div>
                <label>End</label>
                <input 
                  type="date" 
                  value={stop.endDate} 
                  onChange={e => updateStop(stop.id, "endDate", e.target.value)}
                  className="w-full p-2 border rounded mt-1"
                />
              </div>
              <div>
                <label>Amount</label>
                <input 
                  type="number" 
                  value={stop.amount} 
                  onChange={e => updateStop(stop.id, "amount", e.target.value)}
                  className="w-full p-2 border rounded mt-1"
                />
              </div>
            </div>

            {/* SIMPLE ACTIVITIES */}
            <div>
              {stop.activities.map(activity => (
                <div key={activity.id} className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded mb-2 items-center">
                  <select 
                    value={activity.category} 
                    onChange={e => updateActivity(stop.id, activity.id, "category", e.target.value)}
                    className="p-2 border rounded"
                  >
                    <option value="sightseeing">🏛️ Sightseeing</option>
                    <option value="food">🍽️ Food</option>
                    <option value="stay">🏨 Stay</option>
                    <option value="transport">🚕 Transport</option>
                  </select>
                  
                  <input 
                    value={activity.name} 
                    placeholder="Activity" 
                    onChange={e => updateActivity(stop.id, activity.id, "name", e.target.value)}
                    className="flex-1 p-2 border rounded"
                  />
                  
                  <input 
                    type="time" 
                    value={activity.timeStart} 
                    onChange={e => updateActivity(stop.id, activity.id, "timeStart", e.target.value)}
                    className="w-20 p-2 border rounded"
                  />
                  
                  <input 
                    type="time" 
                    value={activity.timeEnd} 
                    onChange={e => updateActivity(stop.id, activity.id, "timeEnd", e.target.value)}
                    className="w-20 p-2 border rounded"
                  />
                  
                  <input 
                    type="number" 
                    value={activity.grand_total} 
                    placeholder="0" 
                    onChange={e => updateActivity(stop.id, activity.id, "grand_total", e.target.value)}
                    className="w-20 p-2 border rounded"
                  />
                  
                  <button 
                    onClick={() => removeActivity(stop.id, activity.id)}
                    className="p-2 text-red-500 hover:bg-red-100 rounded"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              
              <button 
                onClick={() => addActivity(stop.id)}
                className="w-full p-2 text-green-600 hover:bg-green-50 rounded flex items-center gap-2"
              >
                <Plus size={16} /> Add Activity
              </button>
            </div>

            {stops.length > 1 && (
              <button 
                onClick={() => removeStop(stop.id)}
                className="mt-4 p-2 text-red-500 hover:bg-red-50 rounded w-full"
              >
                Remove Stop
              </button>
            )}
          </div>
        ))}
      </div>

      <button 
        onClick={addStop}
        className="w-full mt-6 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 flex items-center justify-center gap-2"
      >
        <Plus size={20} /> Add Stop
      </button>
    </div>
  );
}
