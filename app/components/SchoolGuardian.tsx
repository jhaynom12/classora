"use client";

import { useState, useEffect, useRef } from "react";
import { Brain, Sparkles, Send, X, MessageCircle, Zap, BookOpen, GraduationCap, Users, Heart } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function SchoolGuardian({ userRole, userName, schoolName, context }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    if (!messages.length) {
      let welcomeMessage = getWelcomeMessage();
      setMessages([{
        id: "1",
        role: "assistant",
        content: welcomeMessage,
        timestamp: new Date()
      }]);
    }
  }, [userRole]);

  function getWelcomeMessage(): string {
    switch(userRole) {
      case "parent":
        return `👋 Hello ${userName}! I'm School Guardian, your AI assistant for ${schoolName}.

As a parent, I can help you with:
• 📊 Track your child's academic progress
• 📅 Upcoming exams and assignments
• 💰 Fee payment schedules and reminders
• 📈 Personalized learning insights
• 💡 Study tips for your child
• 🎯 Subject-specific recommendations

What would you like to know about your child's education today?`;
      
      case "student":
        return `🎓 Hello ${userName}! I'm School Guardian, your personal AI study assistant.

I can help you with:
• 📚 Understanding difficult subjects
• 📝 Homework and assignment help
• ⏰ Study schedules and time management
• 🎯 Exam preparation strategies
• 💪 Motivation and study tips
• 🔍 Explanations of concepts

Ask me anything about your studies! What subject would you like help with?`;
      
      case "teacher":
        return `👩‍🏫 Hello ${userName}! I'm School Guardian, your AI teaching assistant.

I can help you with:
• 📊 Class performance analytics
• 🎯 Identifying at-risk students
• 📝 Creating lesson plans
• 💡 Teaching strategies and tips
• 📈 Tracking student progress
• 🤝 Parent communication suggestions

How can I support your teaching today?`;
      
      default:
        return `Hello ${userName}! I'm School Guardian, your AI assistant for ${schoolName}. How can I help with your educational journey today?`;
    }
  }

  async function sendMessage() {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: input,
          role: userRole
        })
      });

      const data = await response.json();
      const aiResponse = data.response;

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: aiResponse,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('AI API call failed:', error);
      // Fallback to simulated response
      const response = generateAIResponse(input, userRole, context);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
    } finally {
      setIsLoading(false);
    }
  }

  function generateAIResponse(question: string, role: string, context: any): string {
    const q = question.toLowerCase();
    
    // Role-specific responses
    if (userRole === "parent") {
      const childName = context?.childName || "your child";
      
      if (q.includes("grade") || q.includes("score") || q.includes("performance")) {
        return `📊 ${childName}'s Current Performance:
• Mathematics: 85% (Excellent - Top of class)
• English: 78% (Good - Above average)
• Physics: 72% (Satisfactory - Improving)
• Chemistry: 68% (Needs attention - 15% below target)
• Biology: 82% (Very good)

💡 Recommendation: Focus on Chemistry for 30 minutes daily. Practice balancing equations and organic chemistry concepts.

Would you like me to suggest specific practice materials?`;
      }
      
      if (q.includes("exam") || q.includes("test")) {
        return `📅 Upcoming Exams for ${childName}:
• Mathematics: April 20th (10:00 AM, Hall A)
• Physics: April 22nd (2:00 PM, Lab 2)  
• English: April 25th (9:00 AM, Hall B)

📖 Topics to Review:
• Mathematics: Algebra, Trigonometry, Calculus
• Physics: Mechanics, Electricity, Optics
• English: Composition, Comprehension, Summary

💡 Tip: Create a study schedule with 45-minute focused sessions. Would you like me to create a personalized study plan?`;
      }
      
      if (q.includes("fee") || q.includes("payment")) {
        return `💰 Fee Status for ${childName}:
• Term: Second Term 2024
• Total Fees: ₦150,000
• Paid: ₦150,000
• Outstanding: ₦0
• Due Date: April 25th

✅ All fees are paid up to date!

Would you like to see the fee breakdown or payment history?`;
      }
      
      if (q.includes("attendance")) {
        return `✅ Attendance Report for ${childName}:
• Current Term: 95%
• Class Average: 92%
• Status: Excellent

🎯 Your child's attendance is above average! Consistent attendance correlates with 20% higher scores.

Keep up the great work! Would you like attendance history for previous terms?`;
      }
      
      if (q.includes("teacher") || q.includes("contact")) {
        return `👩‍🏫 Class Teacher Information:
• Name: Mrs. Adebayo
• Subject: Mathematics
• Email: adebayo@classora.com
• Phone: +234 802 345 6789

📝 You can send a message directly through the Messages tab in your dashboard.

Would you like me to help you draft a message to the teacher?`;
      }
      
      if (q.includes("homework") || q.includes("assignment")) {
        return `📝 Pending Assignments for ${childName}:
• Algebra Worksheet (Mathematics) - Due April 18th
• Lab Report (Chemistry) - Due April 19th

✅ Completed: Essay: Climate Change (English)

💡 Tip: Help your child break down large assignments into smaller tasks. Would you like me to suggest a completion schedule?`;
      }
      
      if (q.includes("study") || q.includes("learn") || q.includes("improve")) {
        return `📖 Effective Study Strategies for ${childName}:

1. 🍅 Pomodoro Method: 45 minutes study, 15 minutes break
2. 🔄 Active Recall: Test yourself instead of just re-reading
3. 📅 Spaced Repetition: Review material after 1, 3, 7 days
4. 👨‍🏫 Teach Others: Explaining concepts reinforces learning
5. 😴 Sleep: 8 hours improves retention by 40%

For Chemistry specifically: Practice 5 balancing equations daily. Would you like me to generate practice problems?`;
      }
      
      if (q.includes("motivation") || q.includes("encourage")) {
        return `🌟 Encouragement for ${childName}:

"Your child is showing great improvement in Mathematics and Biology! The dedication is paying off.

Remember: Small daily improvements lead to remarkable results. Every practice session builds confidence.

💪 Keep encouraging them - your support makes a huge difference!

Would you like specific strategies to keep them motivated?`;
      }
    }
    
    else if (userRole === "student") {
      if (q.includes("math") || q.includes("mathematics") || q.includes("algebra")) {
        return `📐 Mathematics Help:

I can help you with:
• Algebra: Solving equations, quadratic formula, factoring
• Trigonometry: Sin, Cos, Tan, identities
• Calculus: Derivatives, limits, integrals
• Geometry: Shapes, angles, proofs

What specific math topic are you struggling with? Give me an example problem and I'll help you solve it step by step!`;
      }
      
      if (q.includes("chemistry")) {
        return `🧪 Chemistry Help:

Key topics I can explain:
• Balancing chemical equations
• Organic chemistry (alkanes, alkenes, alkynes)
• Acids, bases, and salts
• Periodic table trends
• Chemical bonding

💡 Tip: Practice balancing 5 equations daily. Would you like me to give you some practice problems with solutions?`;
      }
      
      if (q.includes("physics")) {
        return `⚡ Physics Help:

I can explain:
• Mechanics (motion, forces, energy)
• Electricity (circuits, Ohm's law)
• Optics (light, mirrors, lenses)
• Thermodynamics (heat, temperature)

Which topic would you like me to explain? Feel free to ask specific questions!`;
      }
      
      if (q.includes("english")) {
        return `📖 English Help:

I can assist with:
• Essay writing (structure, thesis, conclusion)
• Comprehension passages
• Grammar and punctuation
• Literature analysis
• Vocabulary building

What would you like help with? Send me your essay topic or passage and I'll help you analyze it!`;
      }
      
      if (q.includes("exam") || q.includes("test") || q.includes("prepare")) {
        return `📚 Exam Preparation Guide:

1. Start Early: Begin review at least 5 days before exam
2. Create a Schedule: Study 2 subjects per day
3. Practice Past Questions: Familiarize with exam pattern
4. Form Study Groups: Discuss and explain concepts
5. Take Breaks: 10-minute break every hour
6. Sleep Well: 8 hours before exam day

🎯 Your next exam: Mathematics on April 20th
Topics: Algebra, Trigonometry, Calculus

Would you like me to quiz you on these topics?`;
      }
      
      if (q.includes("study") || q.includes("learn")) {
        return `💡 Proven Study Techniques:

1. Active Recall: Close the book and recite what you learned
2. Feynman Technique: Explain concepts as if teaching a child
3. Mind Maps: Visual connections between ideas
4. Pomodoro: 25 min study, 5 min break
5. Practice Problems: Do more than just read

🎯 Recommended: 2 hours daily (45min Math, 45min Science, 30min English)

Would you like a customized study schedule based on your weak subjects?`;
      }
      
      if (q.includes("grade") || q.includes("score") || q.includes("performance")) {
        return `📊 Your Current Performance:

• Mathematics: 85% (A) - Excellent! 🎉
• English: 78% (B+) - Good
• Physics: 72% (B) - Improving
• Chemistry: 68% (B-) - Needs attention
• Biology: 82% (A-) - Very Good

📈 Overall Average: 77% (B+)
🎯 Target: 80% (A-)

💡 Focus 30 minutes daily on Chemistry to boost your average by 5-8%!
Would you like specific Chemistry practice problems?`;
      }
    }
    
    else if (userRole === "teacher") {
      if (q.includes("at risk") || q.includes("struggling")) {
        return `⚠️ At-Risk Students Identified:

1. Chidi O. (48% average)
   • Risk factors: Low scores, declining trend
   • Recommendation: Schedule parent meeting

2. David E. (68% average)
   • Risk factors: Below class average
   • Recommendation: Extra help sessions

3. Bola T. (65% average)
   • Risk factors: Inconsistent performance
   • Recommendation: Weekly progress check

💡 Suggested intervention: Group remedial session for Chemistry on Thursday.

Would you like me to draft messages to parents of at-risk students?`;
      }
      
      if (q.includes("class") || q.includes("average")) {
        return `📊 Class Performance Overview (SS2 Science):

• Class Average: 74%
• Top Performer: Esther N. (87%)
• Students above 80%: 8 students
• Students below 60%: 3 students
• Submission Rate: 82%

📈 Trends: Mathematics (+5%), Chemistry (-3%)

💡 Recommendation: Focus on Chemistry concepts this week.
Would you like a detailed breakdown by subject?`;
      }
      
      if (q.includes("lesson") || q.includes("plan")) {
        return `📝 Lesson Plan Suggestions for Next Week:

Monday (Mathematics):
• Topic: Quadratic Equations
• Activity: Problem-solving session
• Assessment: 10 practice problems

Tuesday (Physics):
• Topic: Electricity and Circuits
• Activity: Lab experiment
• Assessment: Lab report

Wednesday (Chemistry):
• Topic: Organic Chemistry
• Activity: Group discussion
• Assessment: Quiz

Would you like me to generate detailed lesson notes for any topic?`;
      }
    }
    
    // Default responses for general questions
    if (q.includes("hello") || q.includes("hi") || q.includes("hey")) {
      return `Hello ${userName}! 👋

I'm here to help with your educational needs. 

${userRole === "parent" ? "Ask me about your child's grades, upcoming exams, or study tips!" : 
  userRole === "student" ? "Ask me about homework help, exam preparation, or subject explanations!" : 
  "Ask me about class performance, lesson planning, or student insights!"}

What would you like to know?`;
    }
    
    if (q.includes("thank")) {
      return `You're very welcome! 🎓

I'm always here to help with your educational journey. Feel free to ask me anything about grades, exams, study tips, or any subject you're learning.

Is there anything else I can assist you with today?`;
    }
    
    if (q.includes("help")) {
      return `🔍 Here's what I can help you with:

${userRole === "parent" ? 
  "• Check your child's grades and performance\n• View upcoming exams and assignments\n• Track fee payments and due dates\n• Get study tips for your child\n• Contact teachers\n• Understand attendance reports" : 
userRole === "student" ? 
  "• Understand difficult subjects and concepts\n• Get homework help and explanations\n• Prepare for exams with practice questions\n• Create study schedules\n• Learn effective study techniques\n• Improve specific subjects" :
  "• Analyze class performance metrics\n• Identify at-risk students\n• Create lesson plans\n• Get teaching strategies\n• Track student progress\n• Communicate with parents"}

What specific help do you need? Just ask!`;
    }
    
    // General educational Q&A
    if (q.includes("what is") || q.includes("explain") || q.includes("how to")) {
      return `📚 I'd be happy to explain that!

Since I'm your educational AI assistant, I can help explain concepts in Mathematics, Physics, Chemistry, Biology, English, and more.

Could you please specify which subject or concept you'd like me to explain? For example:
• "Explain photosynthesis"
• "How to solve quadratic equations"
• "What is Newton's first law"

I'll give you a clear, easy-to-understand explanation!`;
    }
    
    // Fallback response
    return `🤔 I understand you're asking about "${question}".

As your educational AI assistant, I specialize in:
• 📊 Grades and academic performance
• 📅 Exams and assignments
• 📚 Subject explanations (Math, Science, English)
• 💡 Study tips and techniques
• 🎯 Personalized learning strategies

Could you please rephrase your question or ask me something specific about your education? I'm here to help! 🎓`;
  }

  return (
    <>
      {/* Chat Button - Blue */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 shadow-2xl hover:scale-110 transition-all duration-300"
      >
        <MessageCircle className="w-6 h-6 text-white" />
      </button>

      {/* AI Guardian Button - Purple */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-6 z-50 p-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 shadow-2xl hover:scale-110 transition-all duration-300"
      >
        <Brain className="w-6 h-6 text-white" />
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse" />
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[min(92vw,450px)] max-h-[85vh] h-[min(85vh,650px)] rounded-2xl overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 border border-purple-500/30 shadow-2xl flex flex-col">
          {/* Header - With visible close button */}
          <div className="p-4 bg-gradient-to-r from-purple-600 to-pink-600 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-white" />
              <h3 className="text-white font-bold">School Guardian AI</h3>
              <Sparkles className="w-4 h-4 text-yellow-400" />
            </div>
            <button 
              onClick={() => setIsOpen(false)} 
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
          
          <p className="px-4 py-2 text-xs text-purple-300 bg-purple-900/30 border-b border-purple-500/30">
            AI Assistant • {userRole === "parent" ? "Parent Mode" : userRole === "student" ? "Student Mode" : "Teacher Mode"}
          </p>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl ${msg.role === "user" ? "bg-purple-600 text-white" : "bg-gray-700 text-gray-200"}`}>
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  <p className="text-xs opacity-70 mt-2 text-right">{msg.timestamp.toLocaleTimeString()}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-700 rounded-2xl p-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-100" />
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-200" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-700 bg-gray-800/50">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Ask me anything about your education..."
                className="flex-1 px-4 py-2 rounded-xl bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:border-purple-500 outline-none"
              />
              <button 
                onClick={sendMessage} 
                disabled={isLoading} 
                className="p-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:shadow-lg transition disabled:opacity-50"
              >
                <Send className="w-5 h-5 text-white" />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Ask about grades, exams, study tips, homework help, or any educational topic
            </p>
          </div>
        </div>
      )}
    </>
  );
}

