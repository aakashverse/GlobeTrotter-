import { useState, useEffect, useRef, useCallback } from "react";
import { Send, ScrollText, ChevronLeft, Sparkles } from "lucide-react";
import { io } from "socket.io-client";
import useToast from "../hooks/useToast";

export default function TripChat({ tripId, userId, firstName, onBack }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);
  const { showError } = useToast();

  // ai state
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [loadingAI, setLoadingAI] = useState(false);

  const askTripAI = async () => {
    if (!aiQuery.trim()) return;
    
    setLoadingAI(true);
    setAiResponse(''); // Clear previous response
    
    try {
      const res = await fetch(`http://localhost:5000/api/trips/${tripId}/ai-assistant`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ query: aiQuery })
      });
      
      if (!res.ok) throw new Error(`AI API error: ${res.status}`);
      
      const data = await res.json();
      setAiResponse(data.response || "No response from AI 🤖");
    } catch (err) {
      console.error('AI Error:', err);
      setAiResponse("AI is offline. Try again later! 😅");
    } finally {
      setLoadingAI(false);
    }
  };

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => scrollToBottom(), [messages]);

  // ✅ FIXED: Load chat history
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await fetch(`/api/trips/${tripId}/chat?limit=50`, {
          credentials: 'include'
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        console.log('📥 Loaded history:', data.length, 'messages');
        
        const fixedMessages = Array.isArray(data) ? data.map(msg => ({
          ...msg,
          message_id: msg.message_id || msg.id || `hist-${Date.now()}-${Math.random()}`,
          first_name: msg.first_name || msg.username || 'Unknown'
        })) : [];
        setMessages(fixedMessages);
      } catch (err) {
        console.error('Fetch error:', err);
        showError('Failed to load chat');
        setMessages([]);
      } finally {
        setLoading(false);
      }
    };
    if (tripId) fetchMessages();
  }, [tripId, showError]);

  //  Socket setup
  useEffect(() => {
    if (!tripId) return;

    socketRef.current = io("http://localhost:5000", {
      withCredentials: true,
      transports: ["websocket"]
    });

    const socket = socketRef.current;

    const handleConnect = () => {
      console.log('SOCKET CONNECTED:', socket.id);
      setIsConnected(true);
      socket.emit("joinTrip", { tripId, userId });
    };

    const handleDisconnect = () => {
      console.log('SOCKET DISCONNECTED');
      setIsConnected(false);
    };

    const handleConnectError = (err) => {
      console.error('Connect error:', err.message);
      setIsConnected(false);
      showError('Connection failed');
    };

    // Proper newMessage handler
    const handleNewMessage = (msg) => {
      console.log('📨 RECEIVED:', msg);
      setMessages(prev => {
        // Check if message already exists (exact match or optimistic)
        const exists = prev.some(m => 
          m.message_id === msg.message_id || 
          (m.tempId === msg.tempId) ||
          (m.user_id === msg.user_id && m.message === msg.message && m.isOptimistic)
        );
        
        if (exists) return prev; // Already have it
        
        return [...prev, msg]; // Add new message
      });
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect_error', handleConnectError);
    socket.on('newMessage', handleNewMessage);

    return () => {
      console.log('🧹 Cleaning up socket');
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('connect_error', handleConnectError);
      socket.off('newMessage', handleNewMessage);
      socket.disconnect();
    };
  }, [tripId, userId, showError]);

  // sendMessage
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socketRef.current?.connected) return;

    const trimmedMessage = newMessage.trim();
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const optimisticMsg = {
      message_id: tempId,
      tempId, //  Send tempId to server too
      user_id: userId,
      first_name: firstName || 'You',
      message: trimmedMessage,
      created_at: new Date().toISOString(),
      isOptimistic: true
    };
    
    setMessages(prev => [...prev, optimisticMsg]);
    setNewMessage('');

    socketRef.current.emit("sendMessage", { 
      tripId, 
      message: trimmedMessage,
      tempId 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading chat...</div>
      </div>
    );
  }

   return (
  <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-indigo-50">
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 p-4 flex items-center gap-4 shadow-sm sticky top-0 z-10">
      <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
        <ChevronLeft size={20} />
      </button>
      <h1 className="font-bold text-xl bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
        Trip Chat
      </h1>
      <div className="ml-auto flex items-center gap-2 text-xs font-medium">
        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
        <span className={isConnected ? 'text-green-600' : 'text-red-600'}>
          {isConnected ? 'Online' : 'Offline'}
        </span>
      </div>
    </header>

    <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-4">
      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 py-20">
          <div className="w-20 h-20 bg-gray-200/50 rounded-3xl flex items-center justify-center mb-6">
            <ScrollText size={32} className="text-gray-400" />
          </div>
          <p className="text-2xl font-semibold text-gray-600 mb-2">No messages yet</p>
          <p className="text-sm">Start the conversation with your tripmates!</p>
        </div>
      ) : (
        <>
          {messages.map((msg, index) => {
          const isOwn = Number(msg.user_id) === Number(userId);
          const prevMsg = messages[index - 1];
          const isSameSender =
          prevMsg && Number(prevMsg.user_id) === Number(msg.user_id);

       return (
    <div
      key={`${msg.message_id}-${index}`}
      className={`flex w-full ${
        isOwn ? "justify-end" : "justify-start"
      } ${isSameSender ? "mt-1" : "mt-4"}`}
    >
      <div className={`flex flex-col ${isOwn ? "items-end" : "items-start"} max-w-[70%]`}>
        
        {/* Sender name (only for received, once per group) */}
        {!isOwn && !isSameSender && (
          <span className="text-xs text-gray-500 mb-1 ml-1 font-semibold">
            {msg.first_name}
          </span>
        )}

        {/* MESSAGE BUBBLE */}
        <div
          className={`px-4 py-3 rounded-2xl shadow-md break-words ${
            isOwn
              ? "bg-emerald-600 text-white rounded-br-sm"
              : "bg-white text-gray-800 border border-gray-300 rounded-bl-sm"
          }`}
        >
          <p className="text-sm leading-relaxed">{msg.message}</p>

          <div
            className={`flex justify-end mt-1 text-[11px] ${
              isOwn ? "text-emerald-100" : "text-gray-400"
            }`}
          >
            {new Date(msg.created_at).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
            {isOwn && (
              <span className="ml-1">
                {msg.isOptimistic ? "⌛" : "✓✓"}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
})}

        </>
      )}
      <div ref={messagesEndRef} />
    </div>

    <form onSubmit={sendMessage} className="bg-white/80 backdrop-blur-lg border-t border-gray-200/50 p-4 px-6 shadow-2xl">
      <div className="flex gap-3 items-end">
        <input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1 bg-white/70 border border-gray-200 hover:border-gray-300 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10 rounded-2xl px-5 py-3 text-base placeholder-gray-500 transition-all duration-200 resize-none focus:outline-none"
          placeholder="Message your tripmates..."
          disabled={!isConnected}
        />
        <button 
          type="submit" 
          disabled={!newMessage.trim() || !isConnected}
          className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:opacity-50 disabled:shadow-none shadow-lg hover:shadow-xl text-white p-4 rounded-2xl transition-all duration-200 flex-shrink-0"
        >
          <Send size={20} />
        </button>
      </div>
      {!isConnected && (
        <p className="text-xs text-red-500 mt-2 text-center font-medium animate-pulse">Reconnecting...</p>
      )}
    </form>

    {/* trip ai */}
     <div className="border-t pt-4 mt-6 bg-gradient-to-r from-indigo-50 to-purple-50 p-5 rounded-2xl">
    <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
      <Sparkles className="w-6 h-6 text-indigo-500 animate-pulse" />
      Trip AI Assistant
    </h3>
    
    <div className="flex gap-3">
      <input
        value={aiQuery}
        onChange={(e) => setAiQuery(e.target.value)}
        placeholder="Weather in Delhi? Best restaurants? Day 2 plan?"
        className="flex-1 bg-white border-2 border-indigo-200 hover:border-indigo-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 rounded-2xl px-5 py-3 text-base placeholder-gray-500 transition-all"
        onKeyDown={(e) => e.key === 'Enter' && !loadingAI && askTripAI()}
        disabled={loadingAI}
      />
      <button 
        onClick={askTripAI}
        disabled={!aiQuery.trim() || loadingAI}
        className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all flex-shrink-0 flex items-center gap-2"
      >
        {loadingAI ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            AI...
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5" />
            Ask
          </>
        )}
      </button>
    </div>


  {/* AI Response Bubble - Same style as chat */}
   {aiResponse && (
      <div className="mt-6 p-4 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 backdrop-blur-sm border border-indigo-200 rounded-3xl shadow-xl">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
            <Sparkles className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <h4 className="font-bold text-indigo-900 text-sm mb-1">Trip AI</h4>
            <p className="text-xs text-indigo-600 opacity-90">Generated for {tripId}</p>
          </div>
        </div>
        <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">{aiResponse}</p>
        <button
          onClick={() => setAiResponse('')}
          className="mt-3 text-xs text-indigo-500 hover:text-indigo-700 font-medium ml-auto block"
        >
          Clear
        </button>
      </div>
    )}

  </div>
</div>
);

}
