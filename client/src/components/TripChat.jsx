import { useState, useEffect, useRef, useCallback } from "react";
import { Send, Paperclip, Smile, ScrollText, ChevronLeft, Clock } from "lucide-react";
import useToast from "../hooks/useToast";

export default function TripChat({ tripId, username, userId, onBack, token }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const { showError } = useToast();

  // Scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Load chat history
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true);
        console.log("fetching msgs for tripId: ", tripId);
        const res = await fetch(`/api/trips/${tripId}/chat`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        console.log('Response status: ', res.status);

        if (!res.ok) {
          throw new Error(`HTTP ${res.status} : ${res.statusText}`);
        }

        const data = await res.json();
        console.log('Msgs loaded:', data);
        setMessages(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Fetch error: ', err.message);
        showError('Failed to load chat');
        setMessages([]);
      } finally {
        setLoading(false);
      }
    };

    if (tripId && token) fetchMessages();
    else setLoading(false);
  }, [tripId, token, showError]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const message = newMessage.trim();
    const tempId = Date.now();
    setNewMessage('');

    const optimisticMsg = {
      message_id: tempId,
      message: message,
      isPending: true
    };

    setMessages(prev => [...prev, optimisticMsg]);

    try {
      const res = await fetch(`/api/trips/${tripId}/chat`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          message,
          username: username || 'You' 
        })
      });

      if (!res.ok) throw new Error('Failed to send');
      
      // Optimistic update
      const serverMsg = await res.json();
      setMessages(prev => prev.map(msg => 
        msg.message_id === tempId ? serverMsg : msg
      ));

    } catch (err) {
      showError('Failed to send message');
      setNewMessage(prev => prev.filter(msg =>
        msg.message_id !== tempId)); // Restore
        setNewMessage(message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading chat...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-slate-100 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b p-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg">
            <ChevronLeft size={20} />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900">Trip Chat</h1>
            <p className="text-sm text-gray-600">Discuss plans with trip mates</p>
          </div>
          <div className="text-sm text-gray-500 bg-blue-100 px-3 py-1 rounded-full">
            {messages.length} messages
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-auto max-w-4xl mx-auto w-full px-4 py-6">
        {messages.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <ScrollText size={48} className="mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">No messages yet</h3>
            <p>Start the conversation with your trip mates!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => (
              <div 
                key={msg.message_id} 
                
                className={`flex ${msg.user_id === userId ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-xs lg:max-w-md p-4 rounded-2xl shadow-sm ${
                  msg.user_id === userId 
                    ? 'bg-emerald-500 text-white rounded-br-sm' 
                    : 'bg-white border rounded-bl-sm'
                }`}>
                  <div className="flex items-start gap-2 mb-1">
                    {msg.user_id !== userId && (
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <div className={`font-semibold text-sm ${
                        msg.user_id === userId ? 'text-emerald-100' : 'text-gray-900'
                      }`}>
                        {username}
                      </div>
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed mb-2">{msg.message}</p>
                  <div className="flex items-center gap-2 text-xs opacity-75">
                    <Clock size={12} />
                    <span>{new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="bg-white border-t p-4 max-w-4xl mx-auto">
        <div className="flex items-end gap-3">
          <Paperclip size={20} className="text-gray-500 p-2 hover:bg-gray-100 rounded-lg cursor-pointer opacity-60" />
          <input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 p-4 pr-12 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-transparent resize-none max-h-24"
            rows={1}
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="p-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-300 text-white rounded-2xl transition-all shadow-md hover:shadow-lg flex-shrink-0"
          >
            <Send size={20} />
          </button>
        </div>
      </form>
    </div>
  );
}
