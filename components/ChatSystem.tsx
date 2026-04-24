'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, 
  Send, 
  X, 
  Users, 
  User,
  Phone,
  Video,
  Paperclip,
  Smile,
  CheckCheck,
  Clock,
  Search,
  Plus,
  Settings,
  Bell,
  ChevronRight,
  Pin,
  Reply,
  Copy,
  Trash2,
  Flag
} from 'lucide-react';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: 'student' | 'teacher' | 'parent' | 'admin';
  senderAvatar: string;
  senderProfession?: string; // Short profession tag like "Dr", "Eng"
  senderChildrenCount?: number; // Number of children for parents
  content: string;
  timestamp: string;
  read: boolean;
  delivered: boolean;
  type: 'text' | 'image' | 'file';
  replyTo?: string;
}

interface ChatRoom {
  id: string;
  name: string;
  type: 'individual' | 'group' | 'class' | 'school';
  participants: string[];
  unreadCount: number;
  lastMessage: string;
  lastMessageTime: string;
  avatar: string;
}

export default function ChatSystem({ userRole, userId, userName, schoolName }: { 
  userRole: string; 
  userId: string; 
  userName: string;
  schoolName: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeRoom, setActiveRoom] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [rooms, setRooms] = useState<ChatRoom[]>([
    {
      id: 'school-general',
      name: '🏫 School General',
      type: 'school',
      participants: ['all'],
      unreadCount: 3,
      lastMessage: 'School will be closed on Friday',
      lastMessageTime: '10:30 AM',
      avatar: '🏫'
    },
    {
      id: 'class-ss2-science',
      name: '📚 SS2 Science Class',
      type: 'class',
      participants: ['teacher', 'students'],
      unreadCount: 5,
      lastMessage: 'Homework due tomorrow',
      lastMessageTime: '9:15 AM',
      avatar: '📚'
    },
    {
      id: 'parent-teacher',
      name: '👨‍👩‍👧 Parent-Teacher Group',
      type: 'group',
      participants: ['parents', 'teachers'],
      unreadCount: 2,
      lastMessage: 'Parent meeting scheduled',
      lastMessageTime: 'Yesterday',
      avatar: '👨‍👩‍👧'
    },
  ]);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      senderId: 'teacher1',
      senderName: 'Mrs. Adebayo',
      senderRole: 'teacher',
      senderAvatar: 'MA',
      content: 'Welcome to the School General chat! Feel free to ask questions.',
      timestamp: '10:30 AM',
      read: true,
      delivered: true,
      type: 'text'
    },
    {
      id: '2',
      senderId: 'admin1',
      senderName: 'School Admin',
      senderRole: 'admin',
      senderAvatar: 'SA',
      content: 'Reminder: School assembly at 8 AM tomorrow.',
      timestamp: '10:32 AM',
      read: false,
      delivered: true,
      type: 'text'
    },
    {
      id: '3',
      senderId: 'parent1',
      senderName: 'Dr. Adeola Johnson',
      senderRole: 'parent',
      senderAvatar: 'DA',
      senderProfession: 'Dr',
      senderChildrenCount: 2,
      content: 'Thank you for the update. My children will be there.',
      timestamp: '10:35 AM',
      read: true,
      delivered: true,
      type: 'text'
    },
    {
      id: '4',
      senderId: 'parent2',
      senderName: 'Mr. Bola Williams',
      senderRole: 'parent',
      senderAvatar: 'BW',
      senderProfession: 'Eng',
      senderChildrenCount: 1,
      content: 'Good morning everyone! Looking forward to the assembly.',
      timestamp: '10:37 AM',
      read: false,
      delivered: true,
      type: 'text'
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const sendMessage = () => {
    if (!messageInput.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: userId,
      senderName: userName,
      senderRole: userRole as any,
      senderAvatar: userName.charAt(0).toUpperCase(),
      content: messageInput,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false,
      delivered: true,
      type: 'text'
    };

    setMessages([...messages, newMessage]);
    setMessageInput('');
  };

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 shadow-2xl hover:scale-110 transition-all duration-300 group"
      >
        <MessageCircle className="w-6 h-6 text-white" />
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
          {rooms.reduce((sum, r) => sum + r.unreadCount, 0)}
        </span>
      </button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            className="fixed bottom-24 right-6 z-50 w-[90vw] sm:w-96 h-[600px] max-h-[80vh] rounded-2xl overflow-hidden bg-white/10 backdrop-blur-2xl border border-white/20 shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 border-b border-white/10">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold">Schoolix Chat</h3>
                    <p className="text-gray-400 text-xs">{rooms.length} conversations</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>

            {/* Chat Rooms List or Active Chat */}
            {!activeRoom ? (
              <div className="flex-1 overflow-y-auto">
                {rooms.map((room) => (
                  <button
                    key={room.id}
                    onClick={() => setActiveRoom(room.id)}
                    className="w-full p-4 flex items-center gap-3 hover:bg-white/5 transition-colors border-b border-white/10"
                  >
                    <div className="relative">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 flex items-center justify-center text-2xl">
                        {room.avatar}
                      </div>
                      {room.unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
                          {room.unreadCount}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 text-left">
                      <div className="flex justify-between">
                        <span className="text-white font-medium">{room.name}</span>
                        <span className="text-gray-500 text-xs">{room.lastMessageTime}</span>
                      </div>
                      <p className="text-gray-400 text-sm truncate">{room.lastMessage}</p>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-white/10 bg-white/5">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setActiveRoom(null)}
                      className="p-1 rounded-lg hover:bg-white/10 transition-colors"
                    >
                      <ChevronRight className="w-5 h-5 text-gray-400 rotate-180" />
                    </button>
                    <div className="flex-1">
                      <h4 className="text-white font-medium">{rooms.find(r => r.id === activeRoom)?.name}</h4>
                      <p className="text-gray-400 text-xs">Online • 12 members</p>
                    </div>
                    <button className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                      <Phone className="w-4 h-4 text-gray-400" />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                      <Video className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.senderId === userId ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex gap-2 max-w-[80%] ${message.senderId === userId ? 'flex-row-reverse' : ''}`}>
                        {message.senderId !== userId && (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs">
                            {message.senderAvatar}
                          </div>
                        )}
                        <div className={`rounded-2xl p-3 ${
                          message.senderId === userId 
                            ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white' 
                            : 'bg-white/10 text-gray-200'
                        }`}>
                          {message.senderId !== userId && (
                            <p className="text-xs opacity-70 mb-1 flex items-center gap-2">
                              <span>{message.senderName}</span>
                              {message.senderRole === 'parent' ? (
                                <span className="text-xs px-1.5 py-0.5 rounded-full bg-green-500/20 text-green-300">
                                  {message.senderProfession ? `${message.senderProfession} • ${message.senderChildrenCount || 0} child${(message.senderChildrenCount || 0) !== 1 ? 'ren' : ''}` : `Parent • ${message.senderChildrenCount || 0} child${(message.senderChildrenCount || 0) !== 1 ? 'ren' : ''}`}
                                </span>
                              ) : (
                                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                                  message.senderRole === 'teacher' ? 'bg-blue-500/20 text-blue-300' :
                                  message.senderRole === 'admin' ? 'bg-purple-500/20 text-purple-300' :
                                  'bg-gray-500/20 text-gray-300'
                                }`}>
                                  {message.senderRole === 'teacher' ? 'Teacher' :
                                   message.senderRole === 'admin' ? 'Admin' : 'Student'}
                                </span>
                              )}
                            </p>
                          )}
                          <p className="text-sm">{message.content}</p>
                          <div className={`flex items-center gap-1 mt-1 text-xs ${
                            message.senderId === userId ? 'text-white/70' : 'text-gray-400'
                          }`}>
                            <span>{message.timestamp}</span>
                            {message.senderId === userId && (
                              message.read ? <CheckCheck className="w-3 h-3" /> : <Clock className="w-3 h-3" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-white/10 bg-white/5">
                  <div className="flex items-center gap-2">
                    <button className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                      <Paperclip className="w-5 h-5 text-gray-400" />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                      <Smile className="w-5 h-5 text-gray-400" />
                    </button>
                    <input
                      type="text"
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      placeholder="Type a message..."
                      className="flex-1 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-blue-500 outline-none"
                    />
                    <button
                      onClick={sendMessage}
                      className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 hover:shadow-lg transition-all"
                    >
                      <Send className="w-5 h-5 text-white" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}