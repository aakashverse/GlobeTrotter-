import React from 'react';
import { ChevronRight, Search } from 'lucide-react'; // make sure lucide-react is installed

export default function Activity({ onBack }) {
  const activities = [
    { activity_id: 1, activity_name: 'Eiffel Tower Visit', category: 'sightseeing', description: 'Iconic landmark', estimated_cost: 25, duration_hours: 2.5 },
    { activity_id: 2, activity_name: 'Food Tour', category: 'food', description: 'Authentic cuisine', estimated_cost: 80, duration_hours: 3 },
    { activity_id: 3, activity_name: 'Beach Day', category: 'adventure', description: 'Relax by the sea', estimated_cost: 15, duration_hours: 6 }
  ];

  return (
    <div className="min-h-screen">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center space-x-4">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg">
            <ChevronRight className="w-6 h-6 rotate-180" />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Activity Search</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-md p-4 mb-8 flex items-center space-x-4">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search activities..."
            className="flex-1 outline-none"
          />
          <button className="px-4 py-2 border border-gray-300 rounded-lg">Group by</button>
          <button className="px-4 py-2 border border-gray-300 rounded-lg">Filter</button>
          <button className="px-4 py-2 border border-gray-300 rounded-lg">Sort by...</button>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-700">Results</h3>
          {activities.map((activity) => (
            <div key={activity.activity_id} className="bg-white rounded-xl shadow-md p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="text-xl font-semibold text-gray-800">
                    {activity.activity_name}
                  </h4>
                  <p className="text-sm text-blue-600 font-medium mt-1">
                    {activity.category}
                  </p>
                  <p className="text-gray-600 mt-2">{activity.description}</p>
                  <div className="flex items-center space-x-4 mt-3">
                    <span className="text-sm text-gray-600">💵 ${activity.estimated_cost}</span>
                    <span className="text-sm text-gray-600">⏱️ {activity.duration_hours}h</span>
                  </div>
                </div>
                <button className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                  Add
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
