import { ChevronRight, Search, Users, MapPin, Activity, BarChart3, Users2, Landmark, TrendingUp } from "lucide-react";

export default function AdminPanel({ onBack }) {
  const stats = [
    { title: "Total Users", value: "12,345", change: "+12%", icon: Users, color: "text-blue-600", bg: "bg-blue-100" },
    { title: "Popular Cities", value: "45", change: "+8%", icon: MapPin, color: "text-emerald-600", bg: "bg-emerald-100" },
    { title: "Popular Activities", value: "89", change: "+15%", icon: Activity, color: "text-purple-600", bg: "bg-purple-100" },
    { title: "Total Trips", value: "2,567", change: "+22%", icon: Users2, color: "text-orange-600", bg: "bg-orange-100" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-20 border-b border-white/50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button onClick={onBack} className="p-2 hover:bg-gray-200 rounded-xl transition-all">
              <ChevronRight className="w-6 h-6 rotate-180" />
            </button>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Admin Panel
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Search & Filters */}
        <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl p-6 mb-12 border border-white/50">
          <div className="flex flex-col lg:flex-row lg:items-center lg:space-x-4 space-y-4 lg:space-y-0">
            <div className="flex items-center flex-1 space-x-3 p-4 bg-white rounded-2xl border shadow-sm">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search users, cities, activities..."
                className="flex-1 outline-none text-lg placeholder-gray-500"
              />
            </div>
            <div className="flex space-x-3">
              <button className="px-6 py-3 bg-white hover:bg-gray-50 rounded-2xl font-semibold border shadow-sm hover:shadow-md transition-all whitespace-nowrap">
                Group by
              </button>
              <button className="px-6 py-3 bg-white hover:bg-gray-50 rounded-2xl font-semibold border shadow-sm hover:shadow-md transition-all whitespace-nowrap">
                Filter
              </button>
              <button className="px-6 py-3 bg-white hover:bg-gray-50 rounded-2xl font-semibold border shadow-sm hover:shadow-md transition-all whitespace-nowrap">
                Sort by...
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 mb-12">
          {/* Stats Cards */}
          {stats.map((stat, index) => (
            <div key={index} className="group bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/50 hover:shadow-2xl transition-all hover:-translate-y-2">
              <div className="flex items-center justify-between mb-6">
                <div className={`p-3 rounded-2xl ${stat.bg} group-hover:scale-110 transition-transform`}>
                  <stat.icon className={`w-8 h-8 ${stat.color}`} />
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm font-semibold text-gray-600">{stat.title}</p>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`bg-gradient-to-r ${stat.color} h-2 rounded-full shadow-sm`}
                  style={{ width: '85%' }}
                />
              </div>
              <p className={`text-sm font-medium mt-2 ${stat.color}`}>{stat.change} from last month</p>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Left Column - Vertical Bar Chart + Pie Chart */}
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl p-8 border border-white/50 space-y-8">
            <div className="flex items-center space-x-3">
              <BarChart3 className="w-7 h-7 text-gray-700" />
              <h3 className="text-2xl font-bold text-gray-900">User Activity</h3>
            </div>
            
            {/* Vertical Bar Chart */}
            <div className="space-y-1">
              <div className="flex items-end justify-between h-32 space-x-2">
                <div className="bg-gradient-to-t from-orange-400 to-orange-500 w-16 rounded-lg shadow-lg flex-1 mx-1 group-hover:scale-105" style={{ height: '85%' }} />
                <div className="bg-gradient-to-t from-blue-400 to-blue-500 w-16 rounded-lg shadow-lg flex-1 mx-1 group-hover:scale-105" style={{ height: '70%' }} />
                <div className="bg-gradient-to-t from-emerald-400 to-emerald-500 w-16 rounded-lg shadow-lg flex-1 mx-1 group-hover:scale-105" style={{ height: '95%' }} />
                <div className="bg-gradient-to-t from-purple-400 to-purple-500 w-16 rounded-lg shadow-lg flex-1 mx-1 group-hover:scale-105" style={{ height: '60%' }} />
              </div>
              <div className="flex justify-between text-xs text-gray-600">
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
              </div>
            </div>

            {/* Pie Chart */}
            <div className="relative">
              <div className="w-48 h-48 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full mx-auto relative shadow-lg">
                <div className="absolute inset-0 w-32 h-32 bg-white rounded-full mx-auto shadow-inner"></div>
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-32 h-32 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full shadow-lg"></div>
              </div>
              <div className="text-center mt-4">
                <p className="text-2xl font-bold text-gray-900">78%</p>
                <p className="text-sm text-gray-600">Active Users</p>
              </div>
            </div>
          </div>

          {/* Right Column - Stats + Horizontal Bar Chart */}
          <div className="space-y-8">
            {/* Popular Stats */}
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl p-8 border border-white/50">
              <div className="flex items-center space-x-3 mb-6">
                <Users2 className="w-7 h-7 text-gray-700" />
                <h3 className="text-2xl font-bold text-gray-900">Top Metrics</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                  <span className="text-sm font-medium text-gray-700">New Users</span>
                  <span className="font-bold text-xl text-gray-900">1,234</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                  <span className="text-sm font-medium text-gray-700">Trips Booked</span>
                  <span className="font-bold text-xl text-gray-900">567</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                  <span className="text-sm font-medium text-gray-700">Revenue</span>
                  <span className="font-bold text-xl text-emerald-600">$45.2K</span>
                </div>
              </div>
            </div>

            {/* Horizontal Bar Chart */}
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl p-8 border border-white/50">
              <div className="flex items-center space-x-3 mb-6">
                <TrendingUp className="w-7 h-7 text-gray-700" />
                <h3 className="text-2xl font-bold text-gray-900">Activity Trend</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm font-medium text-gray-700 mb-2">
                    <span>Paris</span>
                    <span>92%</span>
                  </div>
                  <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full shadow-sm" style={{width: '92%'}} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm font-medium text-gray-700 mb-2">
                    <span>Tokyo</span>
                    <span>78%</span>
                  </div>
                  <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-3 rounded-full shadow-sm" style={{width: '78%'}} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm font-medium text-gray-700 mb-2">
                    <span>London</span>
                    <span>65%</span>
                  </div>
                  <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div className="bg-gradient-to-r from-purple-500 to-purple-600 h-3 rounded-full shadow-sm" style={{width: '65%'}} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
