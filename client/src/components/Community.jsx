import { ChevronRight, Search } from "lucide-react";

export default function Community({ onBack }) {
  return (
    <div className="min-h-screen">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center space-x-4">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg">
            <ChevronRight className="w-6 h-6 rotate-180" />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Community</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-md p-4 mb-8 flex items-center space-x-4">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search community..."
            className="flex-1 outline-none"
          />
          <button className="px-4 py-2 border border-gray-300 rounded-lg">
            Group by
          </button>
          <button className="px-4 py-2 border border-gray-300 rounded-lg">
            Filter
          </button>
          <button className="px-4 py-2 border border-gray-300 rounded-lg">
            Sort by...
          </button>
        </div>

        <div className="space-y-6">
          <h3 className="text-xl font-bold text-gray-800">Community Tab</h3>
          <p className="text-gray-600">
            Community section where users can share their experiences about
            trips or activities.
          </p>

          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                    JD
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800">
                      Shared Trip {i}
                    </h4>
                    <p className="text-sm text-gray-500">by John Doe</p>
                    <p className="text-gray-600 mt-2">
                      Amazing experience exploring new destinations!
                    </p>
                    <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                      <span>❤️ 24</span>
                      <span>👁️ 156</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
