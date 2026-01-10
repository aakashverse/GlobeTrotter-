import { useState } from "react";
import { ChevronRight } from "lucide-react";

export default function Profile({ user, onBack, showToast }) {
  const [editing, setEditing] = useState(false);

  return (
    <div className="min-h-screen">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center space-x-4">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg">
            <ChevronRight className="w-6 h-6 rotate-180" />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">User Profile</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex items-start space-x-8">
            <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-4xl font-bold">
              {user?.first_name?.charAt(0)}
              {user?.last_name?.charAt(0)}
            </div>

            <div className="flex-1">
              {!editing ? (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">
                      {user?.first_name} {user?.last_name}
                    </h2>
                    <p className="text-gray-600">{user?.email}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="font-medium">+1 234 567 890</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Location</p>
                      <p className="font-medium">New York, USA</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setEditing(true)}
                    className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Edit Profile
                  </button>
                </div>
              ) : (
                <div>
                  <p className="text-gray-600 mb-4">
                    Edit mode - form fields would go here
                  </p>
                  <button
                    onClick={() => {
                      setEditing(false);
                      showToast("Profile updated!", "success");
                    }}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg"
                  >
                    Save Changes
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            Preplanned Trips
          </h3>
          <div className="grid grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-md p-6">
                <h4 className="font-semibold text-gray-800 mb-2">Trip {i}</h4>
                <button className="w-full bg-blue-50 text-blue-600 py-2 rounded-lg font-medium">
                  View
                </button>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
