import { useState } from "react";


export default function TripAI(){
    const [aiQuery, setAiQuery] = useState('');
    const [aiResponse, setAiResponse] = useState('');
    
    const askAI = async () => {
    try {
       const res = await fetch(`/api/trips/${tripId}/ai-assistant`, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         credentials: 'include',
         body: JSON.stringify({ query: aiQuery })
       });
       const data = await res.json();
       setAiResponse(data.response);
       setAiQuery('');
       } catch (err) {
         console.error('AI Error:', err);
       }
    };

// Add to your chat UI:
<div className="border-t p-4 bg-gradient-to-r from-purple-50 to-pink-50">
  <div className="flex gap-2">
    <input
      value={aiQuery}
      onChange={(e) => setAiQuery(e.target.value)}
      placeholder="Ask AI: Best restaurants? Weather? Budget tips?"
      className="flex-1 border rounded-xl px-4 py-2 focus:ring-2 focus:ring-purple-500"
    />
    <button onClick={askAI} className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-xl">
      🤖 AI
    </button>
  </div>
  {aiResponse && (
    <div className="mt-3 p-4 bg-white/70 rounded-2xl shadow-lg border-l-4 border-purple-400">
      <p className="text-sm text-gray-800">{aiResponse}</p>
    </div>
  )}
</div>

}
