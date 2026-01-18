import { Bot, Sparkles } from "lucide-react";

export default function TripAI({
  aiQuery,
  setAiQuery,
  aiResponse,
  loadingAI,
  askTripAI,
}) {
  return (
    <div className="flex flex-col h-full w-full
                    bg-gradient-to-b from-indigo-50 to-purple-50
                    border border-indigo-200 rounded-3xl shadow-xl p-5">

      {/* HEADER */}
      <div className="flex items-center gap-2 pb-4 border-b border-indigo-200">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500
                        flex items-center justify-center shadow">
          <Bot className="w-5 h-5 text-white animate-pulse" />
        </div>
        <div>
          <h3 className="font-bold text-gray-900">Trip AI</h3>
          <p className="text-xs text-indigo-600">
            Planning assistant
          </p>
        </div>
      </div>

      {/* RESPONSE AREA */}
      <div className="flex-1 overflow-y-auto mt-4 pr-1 space-y-4">
        {aiResponse ? (
          <div className="p-4 bg-white/80 backdrop-blur
                          border border-indigo-200 rounded-2xl shadow">
            <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
              {aiResponse}
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center
                          text-center text-gray-400 h-full">
            <Sparkles className="w-6 h-6 mb-2 text-indigo-400 animate-pulse" />
            <p className="text-sm">
              Ask about places, food, weather, or plans ✨
            </p>
          </div>
        )}
      </div>

      {/* INPUT */}
      <div className="pt-4 border-t border-indigo-200 mt-4">
        <input
          value={aiQuery}
          onChange={(e) => setAiQuery(e.target.value)}
          placeholder="Weather, food, day-wise plan..."
          className="w-full mb-3 bg-white border-2 border-indigo-200
                     focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100
                     rounded-xl px-4 py-3 text-sm"
          onKeyDown={(e) => e.key === "Enter" && !loadingAI && askTripAI()}
          disabled={loadingAI}
        />

        <button
          onClick={askTripAI}
          disabled={!aiQuery.trim() || loadingAI}
          className="w-full bg-gradient-to-r from-indigo-500 to-purple-500
                     hover:from-indigo-600 hover:to-purple-600
                     text-white py-3 rounded-xl font-semibold
                     disabled:opacity-50 flex justify-center items-center gap-2"
        >
          {loadingAI ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white
                              rounded-full animate-spin" />
              Thinking…
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Ask Trip AI
            </>
          )}
        </button>
      </div>
    </div>
  );
}
