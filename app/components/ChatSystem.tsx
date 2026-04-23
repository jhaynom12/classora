'use client';

import { useState } from 'react';
import { MessageCircle, Send, X } from 'lucide-react';

interface ChatSystemProps {
  userRole?: string;
  userId?: string;
  userName?: string;
  schoolName?: string;
}

export default function ChatSystem({ userRole, userId, userName, schoolName }: ChatSystemProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');

  interface ChatMessage {
    id: number;
    from: string;
    text: string;
    time: string;
    isMe: boolean;
  }

  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 1, from: 'System', text: 'Welcome to Classora Chat!', time: '10:30 AM', isMe: false }
  ]);

  const sendMessage = () => {
    if (!message.trim()) return;
    const newMessage: ChatMessage = {
      id: messages.length + 1,
      from: userName || 'You',
      text: message,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true
    };
    setMessages([...messages, newMessage]);
    setMessage('');
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 shadow-2xl hover:scale-110 transition-all"
      >
        <MessageCircle className="w-6 h-6 text-white" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-80 sm:w-96 h-[500px] rounded-2xl overflow-hidden bg-gray-900 border border-gray-700 shadow-2xl flex flex-col">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-600 flex justify-between items-center gap-4">
        <h3 className="text-white font-bold flex-1">Classora Chat</h3>
        <button onClick={() => setIsOpen(false)} className="text-white hover:bg-white/20 p-1 rounded flex-shrink-0">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-800">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-2xl ${msg.isMe ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-200'}`}>
              {!msg.isMe && <p className="text-xs text-blue-400 mb-1">{msg.from}</p>}
              <p className="text-sm">{msg.text}</p>
              <p className="text-xs opacity-70 mt-1 text-right">{msg.time}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="p-4 bg-gray-900 border-t border-gray-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 rounded-xl bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:border-blue-500 outline-none"
          />
          <button onClick={sendMessage} className="p-2 rounded-xl bg-blue-600 hover:bg-blue-700 transition">
            <Send className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
