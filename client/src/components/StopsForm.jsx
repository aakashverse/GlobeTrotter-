import { useState } from "react";
import { Plus, X, DollarSign, MapPin, User, Save, ChevronLeft } from "lucide-react";
import useToast from "../hooks/useToast";

export default function StopsForm({ tripId, onBack, onSaveStops }) {
  const [stops, setStops] = useState([{
    stop_name: "",
    notes: "",
    amount: "",
    paid_by: "",
    grand_total: "0",
  }]);

  const { showSuccess, showError } = useToast();
  
  // sdtop exist or not
  if (!stops || stops.length === 0) {
    return (
      <div className="p-12 text-center text-gray-500">
        <MapPin size={48} className="mx-auto mb-4 opacity-50" />
        <h3 className="text-xl font-semibold mb-2">No Stops Yet</h3>
        <p>Add your first stop to see details here!</p>
      </div>
    );
  }

  // Add new stop
  const addStop = () => {
    setStops([...stops, {
      stop_name: "",
      notes: "",
      amount: "",
      paid_by: "",
      grand_total: "0",
    }]);
  };

  // Remove stop 
  const removeStop = (index) => {
    if (stops.length > 1) {
      const newStops = stops.filter((_, i) => i !== index);
      setStops(newStops);
    }
  };

  // update stop field
  const updateStop = (index, field, value) => {
    const newStops = [...stops];
    newStops[index][field] = value;
    setStops(newStops);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all stops
    const validStops = stops.filter(stop => 
      stop.stop_name.trim()
    );

    if (validStops.length === 0) {
      showError("Please fill at least one stop");
      return;
    }

    const stopsData = validStops.map(stop => ({
      trip_id: tripId,
      stop_name: stop.stop_name.trim(),
      notes: stop.notes.trim(),
      amount_spent: parseFloat(stop.amount),
      paid_by: stop.paid_by.trim(),
      grand_total: parseFloat(stop.grand_total),
    }));

    try {
      const res = await fetch("/api/trip-stops", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(stopsData),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to save stops");
      }

      const data = await res.json();
      showSuccess(`${data.length} stops saved!`);
      onSaveStops(data);
      onBack();
    } catch (err) {
      showError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
      <header className="bg-white/90 backdrop-blur-sm shadow-sm sticky top-0 z-20 border-b">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="p-3 hover:bg-gray-100 rounded-2xl flex items-center gap-2 text-lg"
            >
              <ChevronLeft size={24} />
              <span>Back</span>
            </button>
            
            <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
              Add Multiple Stops
            </h1>

            <div className="text-sm text-gray-600 bg-blue-100 px-3 py-1 rounded-xl">
              {stops.length} stop{stops.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {stops.map((stop, index) => (
            <div key={index} className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 border border-white/50 relative group">
              {/* Stop Header */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-2xl flex items-center justify-center text-white font-bold text-lg">
                    {index + 1}
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">Stop {index + 1}</h3>
                </div>

                {stops.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeStop(index)}
                    className="p-2 hover:bg-red-50 rounded-2xl text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>

              {/* Stop Fields */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Stop Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <MapPin size={18} className="text-emerald-500" />
                    <span>Stop Name <span className="text-red-500">*</span></span>
                  </label>
                  <input
                    type="text"
                    value={stop.stop_name}
                    onChange={(e) => updateStop(index, 'stop_name', e.target.value)}
                    className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:border-emerald-400 focus:outline-none focus:ring-4 focus:ring-emerald-100/50 shadow-sm text-lg pl-12"
                    placeholder={`Stop ${index + 1} name...`}
                    required
                  />
                </div>

                {/* Work/Purpose */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <span className="w-5 h-5">📋</span>
                    <span>Work/Purpose <span className="text-red-500">*</span></span>
                  </label>
                  <textarea
                    rows={2}
                    value={stop.work}
                    onChange={(e) => updateStop(index, 'work', e.target.value)}
                    className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-100/50 shadow-sm text-lg resize-none"
                    placeholder="Layover, sightseeing, dinner, fuel..."
                    required
                  />
                </div>

                {/* Amount & Paid By */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <DollarSign size={18} className="text-orange-500" />
                      Amount <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={stop.amount}
                      onChange={(e) => updateStop(index, 'amount', e.target.value)}
                      className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:border-orange-400 focus:outline-none focus:ring-4 focus:ring-orange-100/50 shadow-sm text-lg pl-12"
                      placeholder="1500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <User size={18} className="text-purple-500" />
                      Paid By <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={stop.paid_by}
                      onChange={(e) => updateStop(index, 'paid_by', e.target.value)}
                      className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:border-purple-400 focus:outline-none focus:ring-4 focus:ring-purple-100/50 shadow-sm text-lg pl-12"
                      placeholder="John, Sarah, Split..."
                      required
                    />
                  </div>
                </div>

                {/* Grand Total */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <DollarSign size={18} className="text-green-500" />
                    Grand Total Till This Stop
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={stop.grand_total}
                    onChange={(e) => updateStop(index, 'grand_total', e.target.value)}
                    className="w-full p-4 border-2 border-emerald-200 bg-emerald-50 rounded-2xl focus:border-emerald-400 focus:outline-none focus:ring-4 focus:ring-emerald-100/50 shadow-sm text-xl font-bold pl-12 text-emerald-800"
                    placeholder="4500"
                  />
                </div>
              </div>
            </div>
          ))}

          {/* Add Stop Button */}
          <div className="flex justify-center pt-8">
            <button
              type="button"
              onClick={addStop}
              className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold rounded-2xl shadow-xl hover:shadow-2xl transition-all"
            >
              <Plus size={24} />
              Add Another Stop
            </button>
          </div>

          {/* Submit All */}
          <button
            type="submit"
            className="w-full py-5 px-8 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold text-xl rounded-3xl shadow-2xl hover:shadow-3xl hover:from-emerald-600 hover:to-green-700 transition-all flex items-center justify-center gap-3"
          >
            <Save size={28} />
            Save All {stops.length} Stop{stops.length !== 1 ? 's' : ''}
          </button>
        </form>
      </main>
    </div>
  );
}
