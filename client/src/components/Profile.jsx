import { ChevronLeft, Mail, User, MapPin, Calendar } from "lucide-react";

export default function Profile({ onBack, user }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">

      {/* Header */}
      <header className="bg-white/80 backdrop-blur sticky top-0 z-20 border-b">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-200 rounded-xl transition"
          >
            <ChevronLeft />
          </button>

          <h1 className="absolute left-1/2 -translate-x-1/2 text-xl font-bold">
            My Profile
          </h1>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-10 space-y-10">

        {/* Profile Card */}
        <div className="bg-white rounded-3xl shadow-xl p-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10" />

          <div className="relative flex items-center gap-6">
            <img
              src={user.profile_photo || `https://ui-avatars.com/api/?name=${user.first_name || "User"}`}
              alt="Profile"
              className="w-24 h-24 rounded-full border-4 border-white shadow-md object-cover"
            />

            <div>
              <h2 className="text-2xl font-black">
                {user.first_name} {user.last_name}
              </h2>
              <div className="flex items-center gap-2 text-gray-600 mt-1">
                <Mail className="w-4 h-4" />
                {user.email || "email not provided"}
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6">
          {[
            { label: "Trips", value: user.totalTrips ?? 0 },
            { label: "Completed", value: user.completedTrips ?? 0 },
            { label: "Destinations", value: user.destinations ?? 0 }
          ].map((stat, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl shadow-md p-6 text-center
                         hover:shadow-xl hover:-translate-y-1 transition-all"
            >
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Details */}
        <div className="bg-white rounded-3xl shadow-lg p-8">
          <h3 className="font-bold text-lg mb-6">Personal Details</h3>

          <div className="space-y-4">
            <Detail icon={<User />} label="Username" value={user.first_name || "—"} />
            <Detail icon={<MapPin />} label="Country" value={user.city} />
            <Detail
              icon={<Calendar />}
              label="Joined"
              value={user.createdAt ? new Date(user.createdAt).toDateString() : "—"}
            />
          </div>
        </div>

      </div>
    </div>
  );
}

function Detail({ icon, label, value }) {
  return (
    <div className="flex items-center gap-4">
      <div className="p-2 bg-gray-100 rounded-xl text-gray-600">
        {icon}
      </div>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="font-medium text-gray-800">{value}</p>
      </div>
    </div>
  );
}
