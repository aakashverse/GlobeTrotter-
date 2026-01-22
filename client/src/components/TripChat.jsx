import { useState, useEffect, useRef, useCallback } from "react";
import { Send, ScrollText, ChevronLeft, Bot } from "lucide-react";
import { io } from "socket.io-client";
import useToast from "../hooks/useToast";
import TripAI from "./TripAI";
// const baseURL = import.meta.env.VITE_API_URL;

export default function TripChat({ tripId, userId, firstName, onBack }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [showMobileAI, setShowMobileAI] = useState(false);
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
      const res = await fetch(`/api/trips/${tripId}/ai-assistant`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ userQuery: aiQuery })
      });
      
      if (!res.ok) throw new Error(`AI API error: ${res.status}`);
      
      const data = await res.json();
      setAiResponse(data.response || "No response from AI 🤖");
      setAiQuery('');
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

  // Load chat history
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await fetch(`/api/trips/${tripId}/chat?limit=50`, {
          credentials: 'include'
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        // console.log('📥 Loaded history:', data.length, 'messages');
        
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
      // console.log('SOCKET CONNECTED:', socket.id);
      setIsConnected(true);
      socket.emit("joinTrip", { tripId, userId });
    };

    const handleDisconnect = () => {
      // console.log('SOCKET DISCONNECTED');
      setIsConnected(false);
    };

    const handleConnectError = (err) => {
      console.error('Connect error:', err.message);
      setIsConnected(false);
      showError('Connection failed');
    };

    // Proper newMessage handler
    const handleNewMessage = (msg) => {
      // console.log(' RECEIVED:', msg);
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
    
    {/* header */}
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

    {/* cchat+ai */}
    <div className="flex flex-1 overflow-hidden min-h-0">

      <div className="flex flex-col flex-1">

        {/* msgs */}
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
                      {!isOwn && !isSameSender && (
                        <span className="text-xs text-gray-500 mb-1 ml-1 font-semibold">
                          {msg.first_name}
                        </span>
                      )}

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

        <form
          onSubmit={sendMessage}
          className="bg-white/80 backdrop-blur-lg border-t border-gray-200/50 p-4 px-6 shadow-2xl"
        >
          <div className="flex gap-3 items-end">
            <input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1 bg-white/70 border border-gray-200 hover:border-gray-300 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10 rounded-2xl px-5 py-3 text-base placeholder-gray-500 transition-all duration-200 focus:outline-none"
              placeholder="Message your tripmates..."
              disabled={!isConnected}
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || !isConnected}
              className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:opacity-50 shadow-lg hover:shadow-xl text-white p-4 rounded-2xl transition-all"
            >
              <Send size={20} />
            </button>
          </div>
          {!isConnected && (
            <p className="text-xs text-red-500 mt-2 text-center font-medium animate-pulse">
              Reconnecting...
            </p>
          )}
        </form>

        <button
          onClick={() => setShowMobileAI(true)}
          className="lg:hidden fixed bottom-24 right-4 z-40
                     bg-gradient-to-r from-indigo-500 to-purple-500
                     text-white p-4 rounded-full shadow-xl
                     flex items-center justify-center"
          >
          <Bot className="w-6 h-6" />
        </button>
      </div>

      {/* trip ai */}
      <div className="hidden lg:flex flex-col w-[360px] border-l bg-gradient-to-b from-indigo-50 to-purple-50">
        <div className="sticky top-[72px] h-[calc(100vh-72px)] overflow-y-auto p-4">
          <TripAI
            tripId={tripId}
            aiQuery={aiQuery}
            setAiQuery={setAiQuery}
            aiResponse={aiResponse}
            loadingAI={loadingAI}
            askTripAI={askTripAI}
          />
        </div>
      </div>
    </div>

    {/* responsive views */}
<div
  className={`fixed inset-0 z-50 lg:hidden transition-all duration-300
    ${showMobileAI ? "visible" : "invisible"}`}
>
 
  <div
    onClick={() => setShowMobileAI(false)}
    className={`absolute inset-0 bg-black/40 transition-opacity
      ${showMobileAI ? "opacity-100" : "opacity-0"}`}
  />

  
  <div
    className={`absolute right-0 top-0 h-full w-[90%] max-w-sm
      bg-gradient-to-b from-indigo-50 to-purple-50
      shadow-2xl transform transition-transform duration-300
      ${showMobileAI ? "translate-x-0" : "translate-x-full"}`}
  >
    
    <div className="flex items-center justify-between p-4 border-b">
      <h3 className="font-bold text-gray-900">Trip AI</h3>
      <button
        onClick={() => setShowMobileAI(false)}
        className="text-sm text-indigo-600 font-semibold"
      >
        Close
      </button>
    </div>

    
    <div className="h-[calc(100%-56px)] p-4">
      <TripAI
        tripId={tripId}
        aiQuery={aiQuery}
        setAiQuery={setAiQuery}
        aiResponse={aiResponse}
        loadingAI={loadingAI}
        askTripAI={askTripAI}
      />
    </div>
  </div>
</div>
</div>
)};
 