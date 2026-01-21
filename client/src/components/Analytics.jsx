import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { useState, useEffect } from "react";
import Stat from "./Stat";
import { ChevronRight } from "lucide-react";

const COLORS = ["#22c55e", "#f97316", "#3b82f6", "#a855f7"];

export default function Analytics({ onBack }) {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/analytics', { credentials: "include" })
      .then(res => res.json())
      .then(data => {
        setAnalytics(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="p-10 text-center">Loading analytics...</div>;
  }

  if (!analytics) {
    return <div className="p-10 text-center text-red-500">Failed to load analytics</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      
      <header className="bg-white sticky top-0 z-20 border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ChevronRight className="w-6 h-6 rotate-180" />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">
            Admin Analytics
          </h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-10">

        {/* header cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Stat title="🔥 Active Today" value={analytics.activeUsersToday} />
          <Stat title="📈 Total Trips" value={analytics.totalTrips} />
          <Stat title="🌍 Countries" value={analytics.topCountries.length} />
          <Stat title="⏱ Avg Duration (days)" value={analytics.avgTripDuration} />
        </div>

        {/* weekly growth */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* weekly trips */}
          <div className="bg-white p-6 rounded-2xl shadow">
            <h3 className="font-bold mb-4">📈 Trips Growth (Weekly)</h3>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={analytics.tripsThisWeek}>
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="trips"
                  stroke="#3b82f6"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* trips acc. to status */}
          <div className="bg-white p-6 rounded-2xl shadow">
            <h3 className="font-bold mb-6 text-center">
              ⏳ Trips by Status
            </h3>

            <div className="flex flex-col md:flex-row items-center justify-center gap-8">

              {/* piee chart */}
              <div className="relative w-full max-w-[260px]">
                <PieChart width={260} height={260}>
                  <Pie
                    data={analytics.statusStats}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={100}
                    paddingAngle={4}
                  >
                    {analytics.statusStats.map((_, i) => (
                      <Cell
                        key={i}
                        fill={COLORS[i % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>

                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <p className="text-sm text-gray-500">Total Trips</p>
                  <p className="text-2xl font-bold">
                    {analytics.totalTrips}
                  </p>
                </div>
              </div>

              {/* pie's legend */}
              <div className="w-full max-w-xs space-y-3">
                {analytics.statusStats.map((stat, i) => (
                  <div
                    key={stat.status}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: COLORS[i % COLORS.length] }}
                      />
                      <span className="capitalize text-sm font-medium">
                        {stat.status}
                      </span>
                    </div>
                    <span className="font-semibold">
                      {stat.count}
                    </span>
                  </div>
                ))}
              </div>

            </div>
          </div>
        </div>

        {/* pop cities & countries */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* cities */}
          <div className="bg-white p-6 rounded-2xl shadow">
            <h3 className="font-bold mb-4">🌍 Popular Cities</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={analytics.popularCities}>
                <XAxis dataKey="destination" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="trips" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* {countries} */}
          <div className="bg-white p-6 rounded-2xl shadow">
            <h3 className="font-bold mb-4">🌍 Top Countries</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={analytics.topCountries} layout="vertical">
                <XAxis type="number" />
                <YAxis dataKey="country" type="category" />
                <Tooltip />
                <Bar dataKey="trips" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>

        </div>
      </main>
    </div>
  );
}
