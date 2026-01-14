// src/components/EditTrip.jsx
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom'; // If using react-router
import useToast from '../hooks/useToast';

export default function EditTrip({ onNavigate, token }) {
  const [trip, setTrip] = useState({});
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({});
  const { showSuccess, showError } = useToast();

  // Parse trip data from URL
    useEffect(() => {
        if (trip) {
            setFormData({
                trip_name: trip.trip_name || '',
                description: trip.description || '',
                status: trip.status || 'upcoming',
                // ... other fields
            });
        }
    }, [trip]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`/api/trips/${trip.trip_id}`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        showSuccess('Trip updated!');
        onBack();
      } else {
        showError('Update failed');
      }
    } catch (err) {
      showError('Update failed');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-6">
      <input name="trip_name" defaultValue={trip.trip_name} placeholder="Trip Name" required />
      <textarea name="description" defaultValue={trip.description} placeholder="Description" />
      <select name="status">
        <option value="upcoming">Upcoming</option>
        <option value="ongoing">Ongoing</option>
        <option value="completed">Completed</option>
      </select>
      {/* Add other fields */}
      <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
        Update Trip
      </button>
      <button type="button" onClick={() => onNavigate('my-trips')} className="ml-2">
        Cancel
      </button>
    </form>
  );
}
