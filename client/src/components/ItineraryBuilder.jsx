import { useState, useEffect } from "react";
import { 
  ChevronRight, Plus, MapPin, Trash2, GripVertical, Calendar, DollarSign,
  Activity, Save, Clock, Clipboard, 
  UserRound,
  User
} from "lucide-react";
import useToast from "../hooks/useToast";

export default function ItineraryBuilder({ tripId, onBack }) {
  const [stops, setStops] = useState([{
    id: tripId,
    city: "",
    startDate: "", 
    endDate: "",
    amount: "",
    activities: [{ id: Date.now(), name: "", timeStart: "", timeEnd: "", cost: "", category: "" }],
    stop_order: "",
    paid_by: "",
    grand_total: ""
  }]);

  console.log("Trip ID: ",tripId);

  // Load existing stops
  useEffect(() => {
    if (tripId) {
      fetch(`/api/trips/${tripId}/itinerary`, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      })
      .then(res => res.json())
      .then(data => {
        const formattedStops = (data.stops || []).map(stop => ({
          id: stop.id,
          city: stop.city || '',
          startDate: stop.start_date || '',
          endDate: stop.end_date || '',
          amount: stop.amount || '',
          activities: (stop.activities || []).map(act => ({
            ...act
          })),
          grand_total: stop.amount + stop.grand_total
        }));
        setStops(formattedStops.length ? formattedStops : stops);
      })
      .catch(() => setStops(stops));
    }
  }, [tripId]);

  const [saving, setSaving] = useState(false);
  const [dragging, setDragging] = useState(null);
  const { showSuccess, showError } = useToast();

  // Core functions (unchanged)
  const addStop = () => setStops([...stops, {
    id: Date.now() + 1,
    city: "", startDate: "", endDate: "", amount: "",
    activities: [{ id: Date.now(), name: "", timeStart: "", timeEnd: "", amount: "" }]
  }]);

  const removeStop = (stopId) => setStops(stops.filter(s => s.id !== stopId));
  const updateStop = (stopId, field, value) => {
    setStops(stops.map(stop => stop.id === stopId ? { ...stop, [field]: value } : stop));
  };

  const addActivity = (stopId) => {
    setStops(stops.map(stop => stop.id === stopId 
      ? { ...stop, activities: [...stop.activities, { 
          id: Date.now(), name: "", timeStart: "", timeEnd: "", amount: ""
        }] } 
      : stop
    ));
  };

  const updateActivity = (stopId, activityId, field, value) => {
    setStops(stops.map(stop => stop.id === stopId
      ? { ...stop, activities: stop.activities.map(act => 
          act.id === activityId ? { ...act, [field]: value } : act
        ) }
      : stop
    ));
  };

  const removeActivity = (stopId, activityId) => {
    setStops(stops.map(stop => stop.id === stopId
      ? { ...stop, activities: stop.activities.filter(a => a.id !== activityId) }
      : stop
    ));
  };

  // Drag & Drop
  const handleDragStart = (e, index) => setDragging(index);
  const handleDragOver = (e) => e.preventDefault();
  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    const dragIndex = dragging;
    if (dragIndex === null || dragIndex === dropIndex) return;
    
    const newStops = [...stops];
    const [draggedStop] = newStops.splice(dragIndex, 1);
    newStops.splice(dropIndex, 0, draggedStop);
    setStops(newStops);
    setDragging(null);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/trips/${tripId}/itinerary`, {
        method: "POST",
        credentials: 'include',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stops })
      });

      if (!res.ok) throw new Error("Failed to save itinerary");
      showSuccess("Itinerary saved!");
      onBack();
    } catch (err) {
      showError("Save failed: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const totalBudget = stops.reduce((sum, stop) => sum + parseFloat(stop.amount || 0), 0);
  const totalActivities = stops.reduce((sum, stop) => sum + stop.activities.length, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simple Clean Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg">
            <ChevronRight className="w-5 h-5 rotate-180" />
          </button>
          
           <div className="text-center space-y-1">
            <h1 className="text-2xl font-bold text-gray-900">
              Itinerary View/Build
            </h1>
            <div className="flex items-center justify-center gap-6 text-sm text-gray-600 font-medium">
              <span className="flex items-center gap-1">
                <MapPin size={16} className="text-indigo-500" />
                {stops.length} stops
              </span>
              <span className="flex items-center gap-1">
                <Activity size={16} className="text-emerald-500" />
                {totalActivities} activities
              </span>
              <span className="flex items-center gap-1">
                <DollarSign size={16} className="text-amber-500" />
                ₹{totalBudget.toLocaleString()}
              </span>
            </div>
          </div>
          
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-emerald-500 text-white font-medium rounded-lg hover:bg-emerald-600 disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? "Saving..." : <> <Save size={16} /> Save </>}
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Stops List */}
        <div className="space-y-4">
          {stops.map((stop, index) => (
            <div
              key={stop.id}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
              className={`p-6 bg-white rounded-xl border shadow-sm hover:shadow-md transition-all ${
                dragging === index ? 'ring-2 ring-blue-200 shadow-md' : ''
              }`}
            >
              {/* Stop Header */}
              <div className="flex items-start justify-between mb-6 pb-4 border-b">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-10 h-10 bg-blue-500 text-white rounded-lg flex items-center justify-center font-bold">
                    {index + 1}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-3">
                      <MapPin size={16} className="text-blue-500 flex-shrink-0" />
                      <input
                        value={stop.city}
                        onChange={(e) => updateStop(stop.id, "city", e.target.value)}
                        placeholder="City name"
                        className="w-full text-xl font-semibold bg-transparent outline-none border-b border-gray-200 pb-1"
                      />
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        {/* <Calendar size={16} /> */}
                        <input
                          type="date"
                          value={stop.startDate}
                          onChange={(e) => updateStop(stop.id, "startDate", e.target.value)}
                          className="bg-transparent border-none outline-none"
                        />
                        {/* <span>to</span> */}
                        <input
                          type="date"
                          value={stop.endDate}
                          onChange={(e) => updateStop(stop.id, "endDate", e.target.value)}
                          className="bg-transparent border-none outline-none"
                        />
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <DollarSign size={16} />
                        <input
                          type="number"
                          value={stop.amount}
                          onChange={(e) => updateStop(stop.id, "amount", e.target.value)}
                          placeholder="0"
                          className="w-24 text-right bg-transparent border-b border-gray-200 pb-1 outline-none"
                        />
                      </div>

                      <div className="flex items-center gap-2 mb-3">
                      <User size={16} className="text-blue-500 flex-shrink-0" />
                      <input
                        value={stop.paid_by}
                        onChange={(e) => updateStop(stop.id, "paid_by", e.target.value)}
                        placeholder="Paid by"
                        className="w-full text-md font-semibold bg-transparent outline-none border-b border-gray-200 pb-1"
                      />
                    </div>
                    </div>
                  </div>
                </div>
                
                {stops.length > 1 && (
                  <button
                    onClick={() => removeStop(stop.id)}
                    className="p-2 hover:bg-red-50 rounded-lg text-red-500 hover:text-red-600 ml-4"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>

              {/* Activities */}
              <div className="space-y-3">
                {stop.activities.map((activity) => (
                  <div key={activity.id} className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg group hover:bg-gray-100">
                    <GripVertical size={16} className="text-gray-400 cursor-move flex-shrink-0" />
                    
                    <select
                      value={activity.category}
                      onChange={(e) => updateActivity(stop.id, activity.id, "category", e.target.value)}
                      className="px-3 py-2 border rounded-md text-sm bg-white"
                    >
                      <option value="sightseeing">🏛️ Sightseeing</option>
                      <option value="food & Drinks">🍽️ Food & Drinks</option>
                      <option value="stay">🏨 Stay</option>
                      <option value="transport">🚕 Transport</option>
                      <option value="shopping">🛍️ Shopping</option>
                      <option value="others">Others</option>
                    </select>
                    
                    <input
                      value={activity.name}
                      onChange={(e) => updateActivity(stop.id, activity.id, "name", e.target.value)}
                      placeholder="Activity name"
                      className="flex-1 py-2 px-3 border rounded-md outline-none"
                    />
                    
                    <div className="flex items-center gap-2 text-sm">
                      <div className="flex items-center gap-1 px-3 py-1 bg-white border rounded-md">
                        <Clock size={14} />
                        <input
                          type="time"
                          value={activity.timeStart}
                          onChange={(e) => updateActivity(stop.id, activity.id, "timeStart", e.target.value)}
                          className="w-16 bg-transparent border-none outline-none"
                        />
                        <span>-</span>
                        <input
                          type="time"
                          value={activity.timeEnd}
                          onChange={(e) => updateActivity(stop.id, activity.id, "timeEnd", e.target.value)}
                          className="w-16 bg-transparent border-none outline-none"
                        />
                      </div>
                      
                      <input
                        type="number"
                        value={activity.grand_total}
                        onChange={(e) => updateActivity(stop.id, activity.id, "grand_total", e.target.value)}
                        placeholder="0"
                        className="w-20 px-3 py-2 border rounded-md text-right"
                      />
                    </div>
                    
                    <button
                      onClick={() => removeActivity(stop.id, activity.id)}
                      className="p-2 hover:bg-red-100 rounded-lg text-red-500 opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                
                <button
                  onClick={() => addActivity(stop.id)}
                  className="flex items-center gap-2 px-4 py-2 text-emerald-600 hover:bg-emerald-50 rounded-lg font-medium"
                >
                  <Plus size={16} />
                  Add Activity
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add Stop Button */}
        <button
          onClick={addStop}
          className="w-full p-8 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all flex items-center justify-center gap-3 group"
        >
          <Plus className="w-8 h-8 text-gray-400 group-hover:text-blue-500" />
          <span className="text-lg font-semibold text-gray-700 group-hover:text-blue-600">
            Add Another Stop
          </span>
        </button>
      </main>
    </div>
  );
}
