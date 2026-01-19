import {
  ChevronLeft,
  Clock,
  IndianRupee,
  Edit3,
  Trash2,
  User,
  CalendarDays
} from "lucide-react";

export default function StopDetails({ stops = [], onEdit, onDelete }) {

  if (!stops.length) {
    return <div className="p-10 text-center text-gray-500">No stops available</div>;
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Stops */}
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        {stops.map((stop, index) => {
          const s = {
            id: stop.stop_id,
            name: stop.stop_name || "Unnamed Stop",
            work: stop.work || "No activities logged",
            amount: Number(stop.amount_spent) || 0,
            grandTotal: Number(stop.grand_total) || 0,
            paidBy: stop.paid_by || "Self",
            order: stop.stop_order || index + 1,
            created: stop.created_at
              ? new Date(stop.created_at).toLocaleString("en-IN")
              : "Just now"
          };

          return (
            <div
              key={s.id}
              className="bg-gray-200 border rounded-xl px-4 py-3 shadow-sm hover:shadow-md transition"
            >
              {/* Top Row */}
              <div className="flex justify-between items-start gap-4">

                {/* Left */}
                <div className="flex gap-3">
                  <span className="w-8 h-8 bg-blue-600 text-white rounded-lg text-sm flex items-center justify-center font-bold">
                    {s.order}
                  </span>

                  <div>
                    <p className="font-semibold leading-tight">{s.name}</p>
                    <p className="text-xs text-gray-900 flex items-center gap-1 mt-0.5">
                      <CalendarDays size={12} /> {s.created}
                    </p>
                  </div>
                </div>

                {/* Amount Highlight */}
                <div className="text-right">
                  <p className="flex items-center justify-end gap-1 text-green-600 font-bold text-lg">
                   <IndianRupee size={16} /> <b>{s.amount.toLocaleString("en-IN")}</b>
                  </p>
                  <p className="text-xs text-gray-900">
                    Running Total: ₹{s.grandTotal.toLocaleString("en-IN")}
                  </p>
                </div>
              </div>

              {/* Work / Notes */}
              <div className="mt-3 text-sm text-gray-800 bg-gray-50 rounded-lg px-3 py-2">
                {s.work}
              </div>

              {/* Footer */}
              <div className="flex justify-between items-center mt-3 text-xs text-gray-900">

                <span className="flex items-center gap-1">
                  <User size={12} /> Paid by {s.paidBy}
                </span>

                <div className="flex gap-2">
                  <button
                    onClick={() => onEdit?.(stop)}
                    className="p-1.5 hover:bg-blue-50 rounded-md text-blue-600"
                  >
                    <Edit3 size={14} />
                  </button>
                  <button
                    onClick={() => onDelete?.(s.id)}
                    className="p-1.5 hover:bg-red-50 rounded-md text-red-600"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
