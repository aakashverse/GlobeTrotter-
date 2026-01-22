import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { ChevronRight } from "lucide-react"; 

const COLORS = ["#22c55e", "#3b82f6", "#f97316", "#a855f7", "#ef4444"];

export default function ExpenseDashboard({ tripId, onBack }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch(`/api/trips/${tripId}/expenses`, { credentials: "include" })
      .then(res => res.json())
      .then(setData);
  }, [tripId]);

  if (!data) return <p className="p-6">Loading expenses...</p>;

  return (
    <div className="p-6 space-y-6">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg">
            <ChevronRight className="w-5 h-5 rotate-180" />
        </button>

      {/* Total */}
      <div className="bg-white p-6 rounded-xl shadow text-center">
        <p className="text-gray-500">Total Spent</p>
        <p className="text-3xl font-bold text-emerald-600">
          ₹{data.analytics.totalSpent}
        </p>
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">

        {/* Category */}
        <div className="bg-white p-5 rounded-xl shadow">
          <h3 className="font-semibold mb-3">Where money went</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={data.analytics.byCategory}
                dataKey="total"
                nameKey="category"
                outerRadius={80}
              >
                {data.analytics.byCategory.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Daily */}
        <div className="bg-white p-5 rounded-xl shadow">
          <h3 className="font-semibold mb-3">Daily spending</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={data.analytics.byDate}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line dataKey="total" stroke="#3b82f6" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>

      </div>

      {/* Expense List */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        {data.expenses.map(e => (
          <div key={e.expense_id} className="flex justify-between p-4 border-b">
            <div>
              <p className="font-medium">{e.title}</p>
              <p className="text-xs text-gray-500">
                {e.category} • {e.paid_by}
              </p>
            </div>
            <p className="font-bold text-emerald-600">₹{e.amount}</p>
          </div>
        ))}
      </div>

    </div>
  );
}
