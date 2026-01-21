import { X, Save } from "lucide-react";
import { useState } from "react";
import useToast from "../hooks/useToast";

export default function EditTripModal({ trip, onClose, onUpdated }) {
  const [form, setForm] = useState({
    trip_name: trip.trip_name || "",
    description: trip.description || "",
    start_date: trip.start_date?.split("T")[0] || "",
    end_date: trip.end_date?.split("T")[0] || "",
    total_budget: trip.total_budget || ""
  });

  const [loading, setLoading] = useState(false);
  const {showSuccess, showError} = useToast();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch(`$/api/trips/${trip.trip_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form)
      });

      if(!res.ok) throw new Error();
      const data = await res.json();
      onUpdated(data.trip);
      showSuccess('Trip updated Successfully!')
      onClose();

    } catch {
      showError("Failed to update trip");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold">Edit Trip</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <input
            name="trip_name"
            value={form.trip_name}
            onChange={handleChange}
            className="w-full border rounded-xl px-4 py-2"
            placeholder="Trip Name"
          />

          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            className="w-full border rounded-xl px-4 py-2"
            placeholder="Description"
          />

          <div className="grid grid-cols-2 gap-3">
            <input
              type="date"
              name="start_date"
              value={form.start_date}
              onChange={handleChange}
              className="border rounded-xl px-4 py-2"
            />
            <input
              type="date"
              name="end_date"
              value={form.end_date}
              onChange={handleChange}
              className="border rounded-xl px-4 py-2"
            />
          </div>

          <input
            type="number"
            name="total_budget"
            value={form.total_budget}
            onChange={handleChange}
            className="w-full border rounded-xl px-4 py-2"
            placeholder="Total Budget"
          />
        </div>

        {/* Footer */}
        <div className="p-6 border-t flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded-xl border">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-5 py-2 bg-blue-600 text-white rounded-xl flex items-center gap-2"
          >
            <Save size={16} />
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
