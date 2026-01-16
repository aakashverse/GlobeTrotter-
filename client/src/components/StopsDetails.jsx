import { useState } from "react";
import { ChevronLeft, MapPin, DollarSign, User, Clock, Users, Tag, CalendarDays } from "lucide-react";
import useToast from "../hooks/useToast";

export default function StopDetails({ stop, tripId, onBack, onEdit, onDelete }) {
  const [showActions, setShowActions] = useState(false);
  const { showSuccess, showError } = useToast();

  // Safe schema data
  const safeStop = {
    stop_id: stop?.stop_id || '',
    stop_name: stop?.stop_name || 'Unnamed Stop',
    work: stop?.work || 'No activities logged',
    amount_spent: parseFloat(stop?.amount_spent) || 0,
    paid_by: stop?.paid_by || 'Self',
    grand_total: parseFloat(stop?.grand_total) || 0,
    stop_order: stop?.stop_order || 1,
    city_id: stop?.city_id || 'N/A',
    created_at: stop?.created_at ? new Date(stop?.created_at).toLocaleString('en-IN') : 'Just now',
    updated_at: stop?.updated_at ? new Date(stop?.updated_at).toLocaleString('en-IN') : 'Never'
  };

  const handleDelete = async () => {
    if (!confirm(`Delete "${safeStop.stop_name}"?`)) return;
    
    try {
      const res = await fetch(`/api/trips/${tripId}/stops/${safeStop.stop_id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (res.ok) {
        showSuccess('Stop deleted!');
        onBack();
      } else showError('Delete failed');
    } catch (err) {
      showError('Delete failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simple Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button onClick={onBack} className="p-2 rounded-lg hover:bg-gray-100 flex items-center gap-2">
              <ChevronLeft size={20} />
              <span className="font-medium">Back</span>
            </button>

            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900">{safeStop.stop_name}</h1>
              <div className="flex items-center gap-4 text-sm text-gray-600 mt-1 justify-center">
                <span>Stop #{safeStop.stop_order}</span>
                <span>•</span>
                <span>{safeStop.created_at}</span>
              </div>
            </div>

            <button 
              onClick={() => setShowActions(!showActions)}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              <span className="w-8 h-8 bg-gray-200 rounded-full inline-flex items-center justify-center text-xs font-bold">
                •••
              </span>
            </button>
          </div>

          {/* Actions */}
          {showActions && (
            <div className="mt-3 flex gap-2 p-2 bg-gray-50 rounded-lg">
              <button onClick={() => onEdit?.(stop)} className="flex-1 p-2 rounded-lg hover:bg-blue-50 text-blue-700 font-medium flex items-center gap-2">
                <Edit3 size={16} /> Edit
              </button>
              <button onClick={handleDelete} className="flex-1 p-2 rounded-lg hover:bg-red-50 text-red-700 font-medium flex items-center gap-2">
                <Trash2 size={16} /> Delete
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Schema Cards */}
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        
        {/* 1. Main Info Card */}
        <div className="bg-white rounded-2xl shadow-sm border p-8">
          <div className="flex items-start gap-6 pb-6 border-b mb-6">
            <div className="flex-shrink-0">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                {safeStop.stop_order}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">{safeStop.stop_name}</h2>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <MapPin size={16} />
                  City ID: {safeStop.city_id}
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={16} />
                  Created: {safeStop.created_at}
                </span>
                {safeStop.updated_at !== safeStop.created_at && (
                  <span className="flex items-center gap-1">
                    <CalendarDays size={16} />
                    Updated: {safeStop.updated_at}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Amount Highlight */}
          <div className="text-center py-8 bg-emerald-50 rounded-xl border-4 border-emerald-200">
            <div className="text-4xl font-bold text-emerald-700 mb-2">
              ₹{safeStop.amount_spent.toLocaleString('en-IN')}
            </div>
            <div className="text-lg text-emerald-800 font-semibold">Amount Spent</div>
          </div>
        </div>

        {/* 2. Activities Card */}
        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            📋 Activities / Notes
          </h3>
          <div className="text-lg text-gray-700 whitespace-pre-wrap min-h-[100px] p-4 bg-gray-50 rounded-xl border">
            {safeStop.work}
          </div>
        </div>

        {/* 3. Financial Card */}
        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-emerald-500" />
            Financial Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="text-sm font-medium text-gray-600 uppercase tracking-wide mb-2">Amount Spent</div>
              <div className="text-3xl font-bold text-emerald-600">
                ₹{safeStop.amount_spent.toLocaleString('en-IN')}
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-600 uppercase tracking-wide mb-2">Paid By</div>
              <div className="text-2xl font-bold text-gray-900 bg-gray-100 px-4 py-2 rounded-xl inline-block">
                {safeStop.paid_by}
              </div>
            </div>
            {safeStop.grand_total > safeStop.amount_spent && (
              <div className="md:col-span-2 pt-4 border-t">
                <div className="text-sm font-medium text-gray-600 uppercase tracking-wide mb-2">Running Total</div>
                <div className="text-3xl font-bold text-blue-600">
                  ₹{safeStop.grand_total.toLocaleString('en-IN')}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 4. Technical Info Card */}
        <div className="bg-slate-50 rounded-2xl p-6 border">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Technical Info</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Stop ID</span>
              <code className="font-mono text-gray-900 bg-gray-100 px-2 py-1 rounded">{safeStop.stop_id}</code>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Trip ID</span>
              <code className="font-mono text-gray-900 bg-gray-100 px-2 py-1 rounded">{tripId}</code>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">City ID</span>
              <span className="font-mono bg-blue-100 px-2 py-1 rounded text-blue-800">{safeStop.city_id}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-600">Stop Order</span>
              <span className="font-semibold text-gray-900">{safeStop.stop_order}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
