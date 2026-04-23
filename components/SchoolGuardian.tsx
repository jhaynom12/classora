'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  Sparkles, 
  MessageCircle, 
  X, 
  Send,
  Zap,
  Shield,
  Star,
  TrendingUp,
  Award,
  Calendar,
  BookOpen,
  Users,
  Wallet,
  Heart,
  AlertCircle
} from 'lucide-react';

interface GuardianSuggestion {
  id: string;
  type: 'academic' | 'attendance' | 'finance' | 'wellness';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  action?: string;
}

export default function SchoolGuardian({ userRole, userName, schoolName }: { 
  userRole: string; 
  userName: string;
  schoolName: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [conversation, setConversation] = useState<{ role: 'user' | 'assistant'; content: string }[]>([
    { role: 'assistant', content: `Hello ${userName}! I'm School Guardian, your AI assistant for ${schoolName}. How can I help you today?` }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  // Role-specific suggestions
  const suggestions: GuardianSuggestion[] = [
    {
      id: '1',
      type: 'academic',
      title: 'Performance Alert',
      description: 'Your child\'s Chemistry score dropped by 8%. Recommended: Extra practice sessions.',
      priority: 'high',
      action: 'View Details'
    },
    {
      id: '2',
      type: 'attendance',
      title: 'Attendance Report',
      description: 'Overall attendance rate is 92% this term. 3 students below 75%.',
      priority: 'medium',
      action: 'View Students'
    },
    {
      id: '3',
      type: 'finance',
      title: 'Fee Reminder',
      description: 'Fee payment deadline approaching in 5 days. Outstanding: ₦3.5M',
      priority: 'high',
      action: 'Pay Now'
    },
    {
      id: '4',
      type: 'wellness',
      title: 'Wellness Tip',
      description: 'Exam week starting soon. Remind students to get adequate sleep.',
      priority: 'low',
      action: 'View Tips'
    },
  ];

  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'academic': return <BookOpen className="w-4 h-4" />;
      case 'attendance': return <Users className="w-4 h-4" />;
      case 'finance': return <Wallet className="w-4 h-4" />;
      case 'wellness': return <Heart className="w-4 h-4" />;
      default: return <Sparkles className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    if (priority === 'high') return 'border-red-500/30 bg-red-500/10';
    if (priority === 'medium') return 'border-yellow-500/30 bg-yellow-500/10';
    return 'border-blue-500/30 bg-blue-500/10';
  };

  const handleSend = async () => {
    if (!message.trim()) return;

    const userMessage = message;
    setConversation([...conversation, { role: 'user', content: userMessage }]);
    setMessage('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      let response = '';
      if (userMessage.toLowerCase().includes('grade') || userMessage.toLowerCase().includes('score')) {
        response = `Based on the latest assessment data, the class average is 74%. Your child is performing above average in Mathematics and needs improvement in Chemistry. Would you like specific study recommendations?`;
      } else if (userMessage.toLowerCase().includes('fee') || userMessage.toLowerCase().includes('payment')) {
        response = `Total outstanding fees: ₦3.5M. The deadline is in 5 days. You can make payments through the Finance section. Would you like me to help you set up a payment reminder?`;
      } else if (userMessage.toLowerCase().includes('attendance')) {
        response = `Current attendance rate is 92%. Students with below 75% attendance have been flagged. Would you like to see the detailed attendance report?`;
      } else {
        response = `I understand you're asking about "${userMessage}". Let me check the system for you. In the meantime, you can check the dashboard for more details. Is there anything specific you'd like to know about?`;
      }
      
      setConversation(prev => [...prev, { role: 'assistant', content: response }]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <>
      {/* School Guardian Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-6 z-50 p-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 shadow-2xl hover:scale-110 transition-all duration-300 group"
      >
        <Brain className="w-6 h-6 text-white" />
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse" />
      </button>

      {/* School Guardian Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            className="fixed bottom-40 right-6 z-50 w-[90vw] sm:w-[380px] h-[480px] max-h-[85vh] rounded-2xl overflow-hidden bg-gradient-to-br from-purple-900/95 to-pink-900/95 backdrop-blur-2xl border border-purple-500/30 shadow-2xl flex flex-col\"
          >
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-purple-600/30 to-pink-600/30 border-b border-purple-500/30">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center">
                    <Brain className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-white font-bold">School Guardian</h3>
                      <Sparkles className="w-4 h-4 text-yellow-400" />
                    </div>
                    <p className="text-purple-200 text-xs">AI Assistant • Online</p>
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

            {/* Suggestions Panel */}
            <div className="p-4 border-b border-purple-500/30 bg-white/5">
              <p className="text-xs text-purple-200 mb-3 flex items-center gap-1">
                <Zap className="w-3 h-3" />
                AI Insights for {userRole === 'parent' ? 'Your Child' : userRole === 'teacher' ? 'Your Class' : userRole === 'admin' ? 'School Overview' : 'You'}
              </p>
              <div className="space-y-2">
                {suggestions.slice(0, 2).map((suggestion) => (
                  <div
                    key={suggestion.id}
                    className={`p-3 rounded-xl border ${getPriorityColor(suggestion.priority)}`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {getTypeIcon(suggestion.type)}
                      <span className="text-white text-sm font-medium">{suggestion.title}</span>
                      {suggestion.priority === 'high' && (
                        <span className="text-xs px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-300">Urgent</span>
                      )}
                    </div>
                    <p className="text-gray-300 text-xs">{suggestion.description}</p>
                    {suggestion.action && (
                      <button className="mt-2 text-purple-300 text-xs hover:text-purple-200 transition-colors">
                        {suggestion.action} →
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Conversation */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {conversation.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] ${msg.role === 'user' ? 'order-2' : 'order-1'}`}>
                    {msg.role === 'assistant' && (
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center">
                          <Brain className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-xs text-purple-200">School Guardian</span>
                      </div>
                    )}
                    <div className={`rounded-2xl p-3 ${
                      msg.role === 'user' 
                        ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white' 
                        : 'bg-white/10 text-gray-200'
                    }`}>
                      <p className="text-sm">{msg.content}</p>
                    </div>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white/10 rounded-2xl p-3">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-100" />
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-200" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-purple-500/30 bg-white/5">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask School Guardian anything..."
                  className="flex-1 px-4 py-2 rounded-xl bg-white/10 border border-purple-500/30 text-white placeholder-gray-400 focus:border-purple-500 outline-none text-sm"
                />
                <button
                  onClick={handleSend}
                  className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-600 hover:shadow-lg transition-all"
                >
                  <Send className="w-5 h-5 text-white" />
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                School Guardian AI • Powered by Advanced Learning Models
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}