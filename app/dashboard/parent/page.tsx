'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, TrendingUp, Award, Calendar, Clock, Download, Eye, ChevronRight,
  Moon, Sun, User, LogOut, Bell, Star, Target, Brain, MessageCircle, Heart,
  Activity, Menu, X, Home, BarChart3, FileText, Settings, ChevronDown, Filter,
  Search, ExternalLink, CheckCircle, Circle, AlertTriangle, ThumbsUp, Zap,
  Sparkles, Wallet, CreditCard, Phone, Mail, MapPin, School, BookOpen,
  Clock as ClockIcon, DollarSign, Receipt, Calendar as CalendarIcon, Check,
  XCircle, Loader, Send, Paperclip, Smile, MoreVertical, PhoneCall, Video,
  Star as StarIcon
} from 'lucide-react';
import Link from 'next/link';
import { useTheme } from '@/components/theme-provider';
import ActionButtons from '@/app/components/ActionButtons';
import PerformanceInsights from '@/app/components/PerformanceInsights';

interface Child {
  id: string;
  name: string;
  class: string;
  avatar: string;
  averageScore: number;
  predictedGrade: string;
  attendance: number;
  rank: number;
  totalStudents: number;
  teacher: string;
  teacherEmail: string;
  teacherPhone: string;
  subjects: {
    name: string;
    score: number;
    grade: string;
    trend: 'up' | 'down' | 'stable';
    teacher: string;
    improvement: number;
    remark: string;
  }[];
  recentActivities: {
    id: string;
    activity: string;
    date: string;
    type: 'submission' | 'score' | 'attendance' | 'achievement';
    score?: number;
  }[];
  upcomingEvents: {
    id: string;
    title: string;
    date: string;
    type: 'exam' | 'meeting' | 'deadline';
  }[];
  feeStatus: {
    term: string;
    amount: number;
    paid: number;
    due: number;
    status: 'paid' | 'partial' | 'unpaid';
    dueDate: string;
  };
}

interface Message {
  id: string;
  childId: string;
  childName: string;
  teacher: string;
  message: string;
  date: string;
  isFromTeacher: boolean;
  read: boolean;
}

interface Payment {
  id: string;
  childId: string;
  childName: string;
  amount: number;
  date: string;
  method: string;
  reference: string;
  status: 'success' | 'pending' | 'failed';
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  author: string;
  priority: 'high' | 'medium' | 'low';
  image?: string;
}

export default function ParentDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [schoolName, setSchoolName] = useState('Your School');
  const [selectedChild, setSelectedChild] = useState<string | null>(null);
  const [showReport, setShowReport] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [showPayments, setShowPayments] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [newMessage, setNewMessage] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState<string>('');
  const [isMobile, setIsMobile] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [selectedChildId, setSelectedChildId] = useState<string>('1');

  // Sample children data
  const children: Child[] = [
    {
      id: '1',
      name: 'Adeola K.',
      class: 'SS2 Science',
      avatar: 'AK',
      averageScore: 78,
      predictedGrade: 'B+',
      attendance: 95,
      rank: 8,
      totalStudents: 45,
      teacher: 'Mrs. Adebayo',
      teacherEmail: 'adebayo@classora.com',
      teacherPhone: '+234 802 345 6789',
      subjects: [
        { name: 'Mathematics', score: 85, grade: 'A', trend: 'up', teacher: 'Mrs. Adebayo', improvement: 8, remark: 'Excellent progress in algebra' },
        { name: 'English', score: 78, grade: 'B+', trend: 'stable', teacher: 'Mr. Johnson', improvement: 2, remark: 'Good performance in literature' },
        { name: 'Physics', score: 72, grade: 'B', trend: 'up', teacher: 'Dr. Okonkwo', improvement: 5, remark: 'Improved in mechanics' },
        { name: 'Chemistry', score: 68, grade: 'B-', trend: 'down', teacher: 'Mrs. Eze', improvement: -4, remark: 'Need focus on organic chemistry' },
        { name: 'Biology', score: 82, grade: 'A-', trend: 'up', teacher: 'Prof. Williams', improvement: 7, remark: 'Excellent in practicals' },
      ],
      recentActivities: [
        { id: '1', activity: 'Submitted Mathematics assignment', date: '2024-04-14', type: 'submission' },
        { id: '2', activity: 'Scored 85% in Mathematics test', date: '2024-04-13', type: 'score', score: 85 },
        { id: '3', activity: 'Attended Physics practical', date: '2024-04-12', type: 'attendance' },
        { id: '4', activity: 'Achieved Top Performer award', date: '2024-04-10', type: 'achievement' },
      ],
      upcomingEvents: [
        { id: '1', title: 'Mid-Term Examination', date: '2024-04-20', type: 'exam' },
        { id: '2', title: 'Parent-Teacher Meeting', date: '2024-04-25', type: 'meeting' },
      ],
      feeStatus: {
        term: 'Second Term 2024',
        amount: 150000,
        paid: 150000,
        due: 0,
        status: 'paid',
        dueDate: '2024-03-30',
      },
    },
    {
      id: '2',
      name: 'Bola K.',
      class: 'JSS3 Art',
      avatar: 'BK',
      averageScore: 85,
      predictedGrade: 'A-',
      attendance: 98,
      rank: 3,
      totalStudents: 38,
      teacher: 'Mrs. Okafor',
      teacherEmail: 'okafor@classora.com',
      teacherPhone: '+234 803 456 7890',
      subjects: [
        { name: 'Mathematics', score: 88, grade: 'A', trend: 'up', teacher: 'Mrs. Okafor', improvement: 10, remark: 'Outstanding problem-solving skills' },
        { name: 'English', score: 85, grade: 'A-', trend: 'up', teacher: 'Mr. Adele', improvement: 6, remark: 'Excellent writing skills' },
        { name: 'Social Studies', score: 82, grade: 'B+', trend: 'stable', teacher: 'Mr. Musa', improvement: 3, remark: 'Good understanding' },
        { name: 'Art', score: 90, grade: 'A', trend: 'up', teacher: 'Mrs. Ibrahim', improvement: 12, remark: 'Creative excellence' },
      ],
      recentActivities: [
        { id: '1', activity: 'Scored 90% in Art project', date: '2024-04-14', type: 'score', score: 90 },
        { id: '2', activity: 'Submitted English essay', date: '2024-04-13', type: 'submission' },
        { id: '3', activity: 'Perfect attendance this week', date: '2024-04-12', type: 'attendance' },
      ],
      upcomingEvents: [
        { id: '1', title: 'Art Exhibition', date: '2024-04-22', type: 'deadline' },
        { id: '2', title: 'Mathematics Quiz', date: '2024-04-18', type: 'exam' },
      ],
      feeStatus: {
        term: 'Second Term 2024',
        amount: 120000,
        paid: 100000,
        due: 20000,
        status: 'partial',
        dueDate: '2024-04-25',
      },
    },
  ];

  // Sample messages
  const messages: Message[] = [
    { id: '1', childId: '1', childName: 'Adeola K.', teacher: 'Mrs. Adebayo', message: 'Adeola has been showing great improvement in Mathematics. Keep up the good work at home!', date: '2024-04-14', isFromTeacher: true, read: false },
    { id: '2', childId: '1', childName: 'Adeola K.', teacher: 'Mrs. Eze', message: 'Please encourage Adeola to practice more chemistry problems.', date: '2024-04-13', isFromTeacher: true, read: true },
    { id: '3', childId: '2', childName: 'Bola K.', teacher: 'Mrs. Okafor', message: 'Bola is doing exceptionally well in Mathematics!', date: '2024-04-12', isFromTeacher: true, read: false },
  ];

  // Sample payments
  const payments: Payment[] = [
    { id: '1', childId: '1', childName: 'Adeola K.', amount: 150000, date: '2024-03-25', method: 'Bank Transfer', reference: 'TRX-001234', status: 'success' },
    { id: '2', childId: '2', childName: 'Bola K.', amount: 100000, date: '2024-03-20', method: 'Card Payment', reference: 'TRX-001235', status: 'success' },
  ];

  // Sample announcements
  const announcements: Announcement[] = [
    { id: '1', title: 'Parent-Teacher Conference', content: 'Schedule your meeting with teachers for April 25th', date: '2024-04-15', author: 'Principal', priority: 'high' },
    { id: '2', title: 'Mid-Term Break', content: 'School will be closed from April 25th to April 30th', date: '2024-04-14', author: 'Admin', priority: 'medium' },
    { id: '3', title: 'Fee Payment Deadline', content: 'Second term fees due by April 25th', date: '2024-04-13', author: 'Bursary', priority: 'high' },
  ];

  useEffect(() => {
    setMounted(true);
    const savedUser = localStorage.getItem('classora_user');
    const savedSchool = localStorage.getItem('classora_school_name');
    
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    } else {
      window.location.href = '/';
    }
    
    if (savedSchool) {
      setSchoolName(savedSchool);
    }

    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/';
  };

  const getGradeColor = (grade: string) => {
    if (grade.startsWith('A')) return 'text-green-400';
    if (grade.startsWith('B')) return 'text-blue-400';
    if (grade.startsWith('C')) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getTrendIcon = (trend: string) => {
    if (trend === 'up') return <TrendingUp className="w-4 h-4 text-green-400" />;
    if (trend === 'down') return <TrendingUp className="w-4 h-4 text-red-400 rotate-180" />;
    return <div className="w-4 h-4 bg-gray-400 rounded-full" />;
  };

  const getStatusColor = (status: string) => {
    if (status === 'paid') return 'text-green-400 bg-green-500/10';
    if (status === 'partial') return 'text-yellow-400 bg-yellow-500/10';
    return 'text-red-400 bg-red-500/10';
  };

  const getPriorityColor = (priority: string) => {
    if (priority === 'high') return 'text-red-400 bg-red-500/10';
    if (priority === 'medium') return 'text-yellow-400 bg-yellow-500/10';
    return 'text-blue-400 bg-blue-500/10';
  };

  const selectedChildData = children.find(c => c.id === selectedChild);
  const unreadMessages = messages.filter(m => !m.read).length;
  const totalDue = children.reduce((sum, c) => sum + c.feeStatus.due, 0);

  if (!mounted || !user) return null;

  if (user.role !== 'parent') {
    window.location.href = '/';
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      {/* Action Buttons - Chat & AI Guardian */}
      <ActionButtons />

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          >
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              className="absolute left-0 top-0 bottom-0 w-72 bg-white/10 backdrop-blur-2xl border-r border-white/10 p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">C</span>
                  </div>
                  <span className="text-white font-semibold">Classora</span>
                </div>
                <button onClick={() => setMobileMenuOpen(false)} className="p-2 rounded-lg bg-white/10">
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
              <div className="space-y-2">
                {[
                  { id: 'overview', icon: Home, label: 'Overview' },
                  { id: 'children', icon: Users, label: 'My Children' },
                  { id: 'messages', icon: MessageCircle, label: 'Messages' },
                  { id: 'payments', icon: Wallet, label: 'Payments' },
                  { id: 'calendar', icon: Calendar, label: 'Calendar' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      activeTab === item.id
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        : 'text-gray-400 hover:bg-white/5'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Animated Background */}
      <div className="fixed inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-500/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-float-delayed" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl animate-pulse-slow" />
      </div>

      {/* Header */}
      <div className="relative z-10">
        <div className="bg-white/5 backdrop-blur-xl border-b border-white/10 sticky top-0 z-20">
          <div className="container mx-auto px-4 sm:px-6 py-4">
            <div className="flex justify-between items-center">
              {/* Left Section */}
              <div className="flex items-center gap-3 md:gap-4">
                <button
                  onClick={() => setMobileMenuOpen(true)}
                  className="p-2 rounded-lg bg-white/5 md:hidden"
                >
                  <Menu className="w-5 h-5 text-white" />
                </button>
                
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">C</span>
                  </div>
                  <span className="text-white font-semibold hidden sm:inline">Classora</span>
                  <span className="text-white/30 hidden sm:inline">•</span>
                  <span className="text-white/80 text-sm truncate max-w-[150px] sm:max-w-none">{schoolName}</span>
                </div>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-1 ml-6">
                  {[
                    { id: 'overview', label: 'Overview' },
                    { id: 'children', label: 'My Children' },
                    { id: 'messages', label: 'Messages', badge: unreadMessages },
                    { id: 'payments', label: 'Payments' },
                    { id: 'calendar', label: 'Calendar' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        activeTab === item.id
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {item.label}
                      {item.badge && item.badge > 0 && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  ))}
                  {/* FORUM BUTTON IN TOP NAVIGATION */}
                  <button onClick={() => router.push('/dashboard/forum')} className="p-2 rounded-full bg-pink-500/20 text-pink-400 hover:bg-pink-500/30 transition-colors ml-2">
                    <MessageCircle className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Right Section */}
              <div className="flex items-center gap-2 sm:gap-4">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <Bell className="w-5 h-5 text-white/70" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                </button>

                {/* PROFILE BUTTON - ADDED HERE */}
                <Link href="/dashboard/parent/profile">
                  <button className="px-3 py-2 rounded-xl bg-emerald-500/20 text-emerald-400 text-sm hover:bg-emerald-500/30 transition-colors flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Profile
                  </button>
                </Link>

                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
                >
                  {theme === 'light' ? <Moon className="w-5 h-5 text-white/70" /> : <Sun className="w-5 h-5 text-yellow-400" />}
                </button>
                
                <button
                  onClick={() => setShowProfile(!showProfile)}
                  className="flex items-center gap-2 md:gap-3 pl-2 md:pl-4 border-l border-white/10"
                >
                  <div className="text-right hidden sm:block">
                    <p className="text-white font-semibold text-sm">{user.name}</p>
                    <p className="text-white/50 text-xs">Parent</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
          {/* Welcome Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 sm:mb-8"
          >
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              Welcome back, {user.name}! 👨‍👩‍👧
            </h1>
            <p className="text-gray-400 text-sm sm:text-base">Track your children's academic journey in real-time</p>
          </motion.div>

          {/* Quick Stats - Responsive Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8"
          >
            <div className="relative rounded-2xl overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10 p-4 sm:p-6">
              <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/20 rounded-full blur-2xl" />
              <div className="relative">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="p-2 sm:p-3 rounded-xl bg-emerald-500/20">
                    <Users className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400" />
                  </div>
                  <span className="text-xl sm:text-2xl font-bold text-white">{children.length}</span>
                </div>
                <p className="text-gray-400 text-xs sm:text-sm">Children Enrolled</p>
                <p className="text-white/60 text-xs mt-1">Active students</p>
              </div>
            </div>

            <div className="relative rounded-2xl overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10 p-4 sm:p-6">
              <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/20 rounded-full blur-2xl" />
              <div className="relative">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="p-2 sm:p-3 rounded-xl bg-purple-500/20">
                    <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
                  </div>
                  <span className="text-xl sm:text-2xl font-bold text-white">{unreadMessages}</span>
                </div>
                <p className="text-gray-400 text-xs sm:text-sm">Unread Messages</p>
                <p className="text-white/60 text-xs mt-1">From teachers</p>
              </div>
            </div>

            <div className="relative rounded-2xl overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10 p-4 sm:p-6">
              <div className="absolute top-0 right-0 w-20 h-20 bg-yellow-500/20 rounded-full blur-2xl" />
              <div className="relative">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="p-2 sm:p-3 rounded-xl bg-yellow-500/20">
                    <Wallet className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" />
                  </div>
                  <span className="text-xl sm:text-2xl font-bold text-white">₦{totalDue.toLocaleString()}</span>
                </div>
                <p className="text-gray-400 text-xs sm:text-sm">Total Due</p>
                <p className="text-white/60 text-xs mt-1">Across all children</p>
              </div>
            </div>

            <div className="relative rounded-2xl overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10 p-4 sm:p-6">
              <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/20 rounded-full blur-2xl" />
              <div className="relative">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="p-2 sm:p-3 rounded-xl bg-blue-500/20">
                    <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
                  </div>
                  <span className="text-xl sm:text-2xl font-bold text-white">4</span>
                </div>
                <p className="text-gray-400 text-xs sm:text-sm">Upcoming Events</p>
                <p className="text-white/60 text-xs mt-1">This month</p>
              </div>
            </div>
          </motion.div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6 sm:space-y-8">
              {/* Children Overview Cards */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-6"
              >
                {children.map((child, index) => (
                  <motion.div
                    key={child.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => {
                      setSelectedChild(child.id);
                      setActiveTab('children');
                    }}
                    className="relative rounded-2xl overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10 hover:border-emerald-500/30 transition-all cursor-pointer group"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-full blur-2xl" />
                    <div className="p-5 sm:p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold">
                            {child.avatar}
                          </div>
                          <div>
                            <h3 className="text-white font-bold text-lg">{child.name}</h3>
                            <p className="text-gray-400 text-sm">{child.class}</p>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-white/30 group-hover:text-white/70 transition-colors" />
                      </div>
                      
                      <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-4">
                        <div className="text-center">
                          <p className="text-xl sm:text-2xl font-bold text-white">{child.averageScore}%</p>
                          <p className="text-gray-500 text-xs">Average</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xl sm:text-2xl font-bold text-purple-400">{child.predictedGrade}</p>
                          <p className="text-gray-500 text-xs">Predicted</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xl sm:text-2xl font-bold text-green-400">{child.attendance}%</p>
                          <p className="text-gray-500 text-xs">Attendance</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs sm:text-sm">
                        <span className="text-gray-400">Rank: #{child.rank}/{child.totalStudents}</span>
                        <span className="text-gray-400">Teacher: {child.teacher}</span>
                      </div>
                      
                      {/* Quick Stats Bar */}
                      <div className="mt-4 pt-4 border-t border-white/10">
                        <div className="flex justify-between text-xs text-gray-400">
                          <span>Progress</span>
                          <span>{child.averageScore}% to target</span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-1.5 mt-2">
                          <div 
                            className="h-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"
                            style={{ width: `${child.averageScore}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              {/* Recent Activities & Announcements */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Activities */}
                <div className="rounded-2xl overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10">
                  <div className="p-4 sm:p-6 border-b border-white/10">
                    <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                      <Activity className="w-5 h-5 text-blue-400" />
                      Recent Activities
                    </h2>
                  </div>
                  <div className="divide-y divide-white/10 max-h-96 overflow-y-auto">
                    {[...children.flatMap(c => c.recentActivities)]
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .slice(0, 5)
                      .map((activity, index) => (
                        <div key={index} className="p-4 hover:bg-white/5 transition-colors">
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg ${
                              activity.type === 'submission' ? 'bg-blue-500/20' :
                              activity.type === 'score' ? 'bg-green-500/20' :
                              activity.type === 'attendance' ? 'bg-orange-500/20' :
                              'bg-yellow-500/20'
                            }`}>
                              {activity.type === 'submission' && <FileText className="w-4 h-4 text-blue-400" />}
                              {activity.type === 'score' && <Star className="w-4 h-4 text-green-400" />}
                              {activity.type === 'attendance' && <Users className="w-4 h-4 text-orange-400" />}
                              {activity.type === 'achievement' && <Award className="w-4 h-4 text-yellow-400" />}
                            </div>
                            <div className="flex-1">
                              <p className="text-white text-sm">{activity.activity}</p>
                              <div className="flex justify-between items-center mt-1">
                                <p className="text-gray-500 text-xs">{activity.date}</p>
                                {activity.score && (
                                  <span className="text-green-400 text-xs font-semibold">+{activity.score}%</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Announcements */}
                <div className="rounded-2xl overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10">
                  <div className="p-4 sm:p-6 border-b border-white/10">
                    <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                      <Bell className="w-5 h-5 text-purple-400" />
                      Announcements
                    </h2>
                  </div>
                  <div className="divide-y divide-white/10 max-h-96 overflow-y-auto">
                    {announcements.map((announcement) => (
                      <div key={announcement.id} className="p-4 hover:bg-white/5 transition-colors">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${getPriorityColor(announcement.priority)}`}>
                            <Bell className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between flex-wrap gap-2">
                              <p className="text-white font-medium text-sm">{announcement.title}</p>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${getPriorityColor(announcement.priority)}`}>
                                {announcement.priority}
                              </span>
                            </div>
                            <p className="text-gray-400 text-xs mt-1">{announcement.content}</p>
                            <p className="text-gray-500 text-xs mt-1">{announcement.date} • {announcement.author}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* AI Parent Insight */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="rounded-2xl overflow-hidden bg-gradient-to-r from-emerald-600/20 to-teal-600/20 backdrop-blur-xl border border-emerald-500/30 p-4 sm:p-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 sm:p-3 rounded-xl bg-emerald-500/20">
                      <Brain className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold text-base sm:text-lg">AI Parent Assistant</h3>
                      <p className="text-gray-300 text-sm">Personalized insights for your children</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-yellow-400" />
                    <span className="text-yellow-400 text-sm font-medium">AI Powered</span>
                  </div>
                </div>
                <div className="mt-4 space-y-3">
                  <p className="text-gray-300 text-sm sm:text-base">
                    📊 {children[0].name} is showing strong improvement in Mathematics. {children[1].name} is excelling in Art.
                  </p>
                  <p className="text-gray-300 text-sm sm:text-base">
                    💡 Schedule a parent-teacher meeting for {children.find(c => c.feeStatus.status === 'partial')?.name || children[0].name} to discuss fee payment plan.
                  </p>
                  <p className="text-gray-300 text-sm sm:text-base">
                    🎯 Both children have upcoming exams next week. Create a study schedule to help them prepare.
                  </p>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 text-sm hover:bg-emerald-500/30 transition-colors">
                    Schedule Meeting
                  </button>
                  <button className="px-3 py-1.5 rounded-lg bg-purple-500/20 text-purple-400 text-sm hover:bg-purple-500/30 transition-colors">
                    Get Study Tips
                  </button>
                  <button className="px-3 py-1.5 rounded-lg bg-blue-500/20 text-blue-400 text-sm hover:bg-blue-500/30 transition-colors">
                    View Progress Report
                  </button>
                </div>
              </motion.div>
            </div>
          )}

          {activeTab === 'insights' && selectedChildId && (
            <PerformanceInsights
              studentId={selectedChildId}
              userRole="parent"
              studentName={children.find(c => c.id === selectedChildId)?.name}
            />
          )}

          {/* Children Tab - Detailed View */}
          {activeTab === 'children' && (
            <div className="space-y-6">
              {selectedChild ? (
                // Detailed Child View
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <button
                    onClick={() => setSelectedChild(null)}
                    className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
                  >
                    <ChevronRight className="w-4 h-4 rotate-180" />
                    Back to all children
                  </button>

                  {/* Child Header */}
                  <div className="rounded-2xl overflow-hidden bg-gradient-to-r from-emerald-600/20 to-teal-600/20 backdrop-blur-xl border border-emerald-500/30 p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-xl">
                          {selectedChildData?.avatar}
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-white">{selectedChildData?.name}</h2>
                          <p className="text-gray-300">{selectedChildData?.class}</p>
                          <p className="text-gray-400 text-sm mt-1">Teacher: {selectedChildData?.teacher}</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <button className="px-4 py-2 rounded-xl bg-blue-500/20 text-blue-400 text-sm hover:bg-blue-500/30 transition-colors flex items-center gap-2">
                          <MessageCircle className="w-4 h-4" />
                          Message Teacher
                        </button>
                        <button className="px-4 py-2 rounded-xl bg-purple-500/20 text-purple-400 text-sm hover:bg-purple-500/30 transition-colors flex items-center gap-2">
                          <Download className="w-4 h-4" />
                          Report
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-4 text-center">
                      <p className="text-2xl font-bold text-white">{selectedChildData?.averageScore}%</p>
                      <p className="text-gray-400 text-sm">Average Score</p>
                    </div>
                    <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-4 text-center">
                      <p className="text-2xl font-bold text-purple-400">{selectedChildData?.predictedGrade}</p>
                      <p className="text-gray-400 text-sm">Predicted Grade</p>
                    </div>
                    <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-4 text-center">
                      <p className="text-2xl font-bold text-green-400">{selectedChildData?.attendance}%</p>
                      <p className="text-gray-400 text-sm">Attendance</p>
                    </div>
                    <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-4 text-center">
                      <p className="text-2xl font-bold text-yellow-400">#{selectedChildData?.rank}/{selectedChildData?.totalStudents}</p>
                      <p className="text-gray-400 text-sm">Class Rank</p>
                    </div>
                  </div>

                  {/* Subjects Performance */}
                  <div className="rounded-2xl overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10">
                    <div className="p-6 border-b border-white/10">
                      <h3 className="text-xl font-bold text-white">Subject Performance</h3>
                    </div>
                    <div className="divide-y divide-white/10">
                      {selectedChildData?.subjects.map((subject, index) => (
                        <div key={index} className="p-6">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-white font-semibold text-lg">{subject.name}</span>
                                <span className="text-white/50 text-sm">• {subject.teacher}</span>
                                {subject.trend === 'up' && <span className="text-green-400 text-xs flex items-center gap-1"><TrendingUp className="w-3 h-3" /> +{subject.improvement}%</span>}
                                {subject.trend === 'down' && <span className="text-red-400 text-xs flex items-center gap-1"><TrendingUp className="w-3 h-3 rotate-180" /> {subject.improvement}%</span>}
                              </div>
                              <p className="text-gray-400 text-sm mt-1">{subject.remark}</p>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <p className="text-2xl font-bold text-white">{subject.score}%</p>
                                <p className={`font-semibold ${getGradeColor(subject.grade)}`}>{subject.grade}</p>
                              </div>
                            </div>
                          </div>
                          <div className="relative">
                            <div className="w-full bg-white/10 rounded-full h-2">
                              <div 
                                className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600"
                                style={{ width: `${subject.score}%` }}
                              />
                            </div>
                            <div className="flex justify-between mt-2 text-xs">
                              <span className="text-white/60">Your Score: {subject.score}%</span>
                              <span className="text-white/60">Target: 80%</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Fee Status */}
                  <div className="rounded-2xl overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10">
                    <div className="p-6 border-b border-white/10">
                      <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Wallet className="w-5 h-5 text-yellow-400" />
                        Fee Status
                      </h3>
                    </div>
                    <div className="p-6">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-gray-400">{selectedChildData?.feeStatus.term}</span>
                        <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(selectedChildData?.feeStatus.status || '')}`}>
                          {selectedChildData?.feeStatus.status?.toUpperCase()}
                        </span>
                      </div>
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Total Amount</span>
                          <span className="text-white">₦{(selectedChildData?.feeStatus?.amount ?? 0).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Amount Paid</span>
                          <span className="text-green-400">₦{(selectedChildData?.feeStatus?.paid ?? 0).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Outstanding Balance</span>
                          <span className="text-red-400">₦{(selectedChildData?.feeStatus?.due ?? 0).toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2 mb-4">
                        <div 
                          className="h-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-500"
                          style={{ width: `${(selectedChildData?.feeStatus?.paid ?? 0) / (selectedChildData?.feeStatus?.amount ?? 1) * 100}%` }}
                        />
                      </div>
                      {selectedChildData?.feeStatus?.due && selectedChildData.feeStatus.due > 0 && (
                        <button className="w-full py-2 rounded-xl bg-yellow-500/20 text-yellow-400 text-sm hover:bg-yellow-500/30 transition-colors">
                          Pay Outstanding ₦{selectedChildData.feeStatus.due.toLocaleString()}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Teacher Contact */}
                  <div className="rounded-2xl overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10">
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <MessageCircle className="w-5 h-5 text-purple-400" />
                        Contact Class Teacher
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                          <Mail className="w-5 h-5 text-gray-400" />
                          <span className="text-gray-300">{selectedChildData?.teacherEmail}</span>
                          <button className="ml-auto text-blue-400 text-sm">Copy</button>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                          <Phone className="w-5 h-5 text-gray-400" />
                          <span className="text-gray-300">{selectedChildData?.teacherPhone}</span>
                          <button className="ml-auto text-blue-400 text-sm">Call</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                // All Children Grid
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {children.map((child) => (
                    <motion.div
                      key={child.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      onClick={() => setSelectedChild(child.id)}
                      className="relative rounded-2xl overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10 hover:border-emerald-500/30 transition-all cursor-pointer group"
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-full blur-2xl" />
                      <div className="p-6">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-14 h-14 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-lg">
                            {child.avatar}
                          </div>
                          <div>
                            <h3 className="text-white font-bold text-xl">{child.name}</h3>
                            <p className="text-gray-400">{child.class}</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4 mb-4">
                          <div className="text-center">
                            <p className="text-2xl font-bold text-white">{child.averageScore}%</p>
                            <p className="text-gray-500 text-xs">Average</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold text-purple-400">{child.predictedGrade}</p>
                            <p className="text-gray-500 text-xs">Predicted</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold text-green-400">{child.attendance}%</p>
                            <p className="text-gray-500 text-xs">Attendance</p>
                          </div>
                        </div>
                        
                        <button className="w-full py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm transition-colors">
                                                          <Link href={`/dashboard/student/profile?id=${child.id}`}>
                                  <button className="mt-3 w-full py-2 rounded-xl bg-purple-500/20 text-purple-400 text-sm hover:bg-purple-500/30 transition-colors">
                                    View Full Profile →
                                  </button>
                                </Link>
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Messages Tab */}
          {activeTab === 'messages' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              {/* Messages List */}
              <div className="lg:col-span-2 rounded-2xl overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10">
                <div className="p-6 border-b border-white/10">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-purple-400" />
                    Messages from Teachers
                    {unreadMessages > 0 && (
                      <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">{unreadMessages} unread</span>
                    )}
                  </h2>
                </div>
                <div className="divide-y divide-white/10 max-h-[600px] overflow-y-auto">
                  {messages.map((message) => (
                    <div key={message.id} className={`p-6 hover:bg-white/5 transition-colors ${!message.read ? 'bg-blue-500/5' : ''}`}>
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
                            <div>
                              <span className="text-white font-semibold">{message.teacher}</span>
                              <span className="text-gray-500 text-sm ml-2">• {message.childName}</span>
                            </div>
                            <span className="text-gray-500 text-xs">{message.date}</span>
                          </div>
                          <p className="text-gray-300 text-sm">{message.message}</p>
                          {!message.read && (
                            <span className="inline-block mt-2 text-xs text-blue-400">New</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Compose Message */}
              <div className="rounded-2xl overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10">
                <div className="p-6 border-b border-white/10">
                  <h3 className="text-white font-bold">Send Message</h3>
                  <p className="text-gray-400 text-sm">Contact your child's teacher</p>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Select Child</label>
                    <select className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:border-blue-500 outline-none">
                      {children.map(child => (
                        <option key={child.id} value={child.id}>{child.name} - {child.class}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Select Teacher</label>
                    <select className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:border-blue-500 outline-none">
                      <option>Mrs. Adebayo (Mathematics)</option>
                      <option>Mrs. Eze (Chemistry)</option>
                      <option>Mrs. Okafor (Mathematics)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Message</label>
                    <textarea 
                      rows={4}
                      placeholder="Type your message here..."
                      className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-blue-500 outline-none resize-none"
                    />
                  </div>
                  <button className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold hover:shadow-xl transition-all flex items-center justify-center gap-2">
                    <Send className="w-4 h-4" />
                    Send Message
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Payments Tab */}
          {activeTab === 'payments' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Payment Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6 text-center">
                  <p className="text-gray-400 text-sm">Total Fees</p>
                  <p className="text-3xl font-bold text-white">₦{children.reduce((sum, c) => sum + c.feeStatus.amount, 0).toLocaleString()}</p>
                </div>
                <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6 text-center">
                  <p className="text-gray-400 text-sm">Total Paid</p>
                  <p className="text-3xl font-bold text-green-400">₦{children.reduce((sum, c) => sum + c.feeStatus.paid, 0).toLocaleString()}</p>
                </div>
                <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6 text-center">
                  <p className="text-gray-400 text-sm">Total Due</p>
                  <p className="text-3xl font-bold text-red-400">₦{totalDue.toLocaleString()}</p>
                </div>
              </div>

              {/* Payment History */}
              <div className="rounded-2xl overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10">
                <div className="p-6 border-b border-white/10">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Receipt className="w-5 h-5 text-green-400" />
                    Payment History
                  </h2>
                </div>
                <div className="divide-y divide-white/10">
                  {payments.map((payment) => (
                    <div key={payment.id} className="p-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                            <CheckCircle className="w-5 h-5 text-green-400" />
                          </div>
                          <div>
                            <p className="text-white font-semibold">{payment.childName}</p>
                            <p className="text-gray-400 text-sm">{payment.method} • {payment.reference}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-white font-bold">₦{payment.amount.toLocaleString()}</p>
                          <p className="text-gray-400 text-sm">{payment.date}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="w-full p-4 text-center text-blue-400 hover:bg-blue-500/10 transition-colors">
                  View All Transactions
                </button>
              </div>

              {/* Make Payment */}
              <div className="rounded-2xl overflow-hidden bg-gradient-to-r from-yellow-600/20 to-orange-600/20 backdrop-blur-xl border border-yellow-500/30">
                <div className="p-6">
                  <h3 className="text-white font-bold text-lg mb-2">Make a Payment</h3>
                  <p className="text-gray-300 text-sm mb-4">Pay school fees, exam fees, or other charges</p>
                  <button className="px-6 py-2 rounded-xl bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 transition-colors">
                    Pay Now
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Calendar Tab */}
          {activeTab === 'calendar' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10"
            >
              <div className="p-6 border-b border-white/10">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-purple-400" />
                  Upcoming Events
                </h2>
              </div>
              <div className="divide-y divide-white/10">
                {[...children.flatMap(c => c.upcomingEvents.map(e => ({ ...e, childName: c.name })))]
                  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                  .map((event, index) => (
                    <div key={index} className="p-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                            event.type === 'exam' ? 'bg-red-500/20' :
                            event.type === 'meeting' ? 'bg-blue-500/20' :
                            'bg-yellow-500/20'
                          }`}>
                            {event.type === 'exam' && <BookOpen className="w-5 h-5 text-red-400" />}
                            {event.type === 'meeting' && <Users className="w-5 h-5 text-blue-400" />}
                            {event.type === 'deadline' && <ClockIcon className="w-5 h-5 text-yellow-400" />}
                          </div>
                          <div>
                            <p className="text-white font-semibold">{event.title}</p>
                            <p className="text-gray-400 text-sm">{event.childName}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-white">{event.date}</p>
                          <p className="text-gray-400 text-sm capitalize">{event.type}</p>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Notifications Panel */}
      <AnimatePresence>
        {showNotifications && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="fixed top-20 right-4 z-50 w-80 sm:w-96 rounded-2xl bg-white/10 backdrop-blur-2xl border border-white/20 shadow-2xl"
          >
            <div className="p-4 border-b border-white/10">
              <h3 className="text-white font-bold">Notifications</h3>
            </div>
            <div className="max-h-96 overflow-y-auto divide-y divide-white/10">
              {announcements.map((announcement) => (
                <div key={announcement.id} className="p-4 hover:bg-white/5 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className={`p-1.5 rounded-full ${getPriorityColor(announcement.priority)}`}>
                      <Bell className="w-3 h-3" />
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium text-sm">{announcement.title}</p>
                      <p className="text-gray-400 text-xs mt-1">{announcement.content}</p>
                      <p className="text-gray-500 text-xs mt-1">{announcement.date}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full p-3 text-center text-blue-400 hover:bg-blue-500/10 transition-colors text-sm">
              Mark all as read
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Profile Panel */}
      <AnimatePresence>
        {showProfile && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="fixed top-20 right-4 z-50 w-80 rounded-2xl bg-white/10 backdrop-blur-2xl border border-white/20 shadow-2xl"
          >
            <div className="p-6 text-center border-b border-white/10">
              <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center mb-3">
                <User className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-white font-bold text-lg">{user.name}</h3>
              <p className="text-gray-400 text-sm">Parent • {schoolName}</p>
            </div>
            <div className="p-4 space-y-2">
              <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors">
                <User className="w-5 h-5 text-gray-400" />
                <span className="text-gray-300 text-sm">My Profile</span>
              </button>
              <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors">
                <Settings className="w-5 h-5 text-gray-400" />
                <span className="text-gray-300 text-sm">Settings</span>
              </button>
              <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors">
                <Bell className="w-5 h-5 text-gray-400" />
                <span className="text-gray-300 text-sm">Notification Preferences</span>
              </button>
              <button onClick={handleLogout} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-red-500/10 transition-colors text-red-400">
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(30px, -30px); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(-30px, 30px); }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.2); }
        }
        .animate-float {
          animation: float 12s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 14s ease-in-out infinite;
        }
        .animate-pulse-slow {
          animation: pulse-slow 8s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
