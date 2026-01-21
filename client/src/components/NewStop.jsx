// src/components/NewStop.jsx
import { useState } from 'react';
import { Plus, MapPin, DollarSign, Users, X } from 'lucide-react';
import useToast from '../hooks/useToast';

export default function NewStop({ tripId, onBack }) {
  const [formData, setFormData] = useState({
    stop_name: '',
    work: '',
    amount: '',
    paid_by: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { showSuccess, showError } = useToast();

  const validateForm = () => {
    const newErrors = {};
    if (!formData.stop_name.trim()) newErrors.stop_name = 'Stop name is required';
    if (!formData.amount || formData.amount <= 0) newErrors.amount = 'Valid amount required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/trips/${tripId}/stops`, {
        method: 'POST',
        credentials: 'include',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          stop_name: formData.stop_name.trim(),
          work: formData.work.trim(),
          amount_spent: parseFloat(formData.amount) || 0,
          paid_by: formData.paid_by.trim(),
        })
      });

      if (res.ok) {
        showSuccess('Stop added!');
        onBack?.(); // Back to my-trips
      } else {
        const errorData = await res.json();
        showError(errorData.error || 'Failed to add stop');
      }
    } catch (err) {
      showError('Network error. Please try again.');
    } finally {
        // <StopDetails stop={stop}/>
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 py-12 px-4">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-emerald-400 to-green-500 
                          rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
            <Plus className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
            Add New Stop
          </h1>
          <p className="text-gray-600">Trip ID: <span className="font-mono bg-blue-100 px-2 py-1 rounded-full text-sm">{tripId}</span></p>
        </div>

        {/* Form Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Stop Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Stop Name
              </label>
              <input 
                className={`w-full px-4 py-3 rounded-2xl border-2 transition-all focus:ring-4 focus:ring-emerald-200
                           ${errors.stop_name ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-emerald-300 focus:border-emerald-400'}`}
                placeholder="e.g., Taj Mahal, Delhi Street Food"
                value={formData.stop_name}
                onChange={(e) => setFormData({...formData, stop_name: e.target.value})}
                required 
              />
              {errors.stop_name && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <span>•</span> {errors.stop_name}
                </p>
              )}
            </div>

            {/* Activities */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Activities/Work
              </label>
              <input 
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl hover:border-emerald-300 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-200 transition-all"
                placeholder="e.g., Sightseeing, Shopping, Food tour"
                value={formData.work}
                onChange={(e) => setFormData({...formData, work: e.target.value})}
              />
            </div>

            {/* Amount */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Amount (₹)
                </label>
                <input 
                  type="number"
                  className={`w-full px-4 py-3 rounded-2xl border-2 transition-all focus:ring-4 focus:ring-emerald-200
                             ${errors.amount ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-emerald-300 focus:border-emerald-400'}`}
                  placeholder="5000"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  min="0"
                  step="0.01"
                  required
                />
                {errors.amount && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <span>•</span> {errors.amount}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Paid By
                </label>
                <input 
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl hover:border-emerald-300 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-200 transition-all"
                  placeholder="e.g., Self, Friends"
                  value={formData.paid_by}
                  onChange={(e) => setFormData({...formData, paid_by: e.target.value})}
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-4">
              <button 
                type="submit" 
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-semibold py-4 px-6 rounded-2xl shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    Add Stop
                  </>
                )}
              </button>
              
              <button 
                type="button"
                onClick={onBack}
                className="px-6 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-2xl shadow-md hover:shadow-lg transition-all duration-200"
              >
                <X className="w-5 h-5 inline mr-1" />
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
