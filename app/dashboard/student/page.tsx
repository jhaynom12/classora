'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, TrendingUp, Award, Calendar, Clock, Download, Eye, ChevronRight,
  Moon, Sun, User, LogOut, Bell, Star, Target, Brain, AlertCircle,
  Menu, X, Home, BarChart3, FileText, MessageCircle, Settings,
  ChevronDown, Filter, Search, ExternalLink, CheckCircle, Circle,
  AlertTriangle, ThumbsUp, Zap, Sparkles
} from "lucide-react";
import Link from "next/link";
import { useTheme } from "@/components/theme-provider";
import ActionButtons from "@/app/components/ActionButtons";
import PerformanceInsights from "@/app/components/PerformanceInsights";

interface Subject {
  name: string;
  score: number;
  grade: string;
  trend: "up" | "down" | "stable";
  teacher: string;
  remark: string;
  improvement: number;
}

interface Exam {
  name: string;
  date: string;
  subject: string;
  time: string;
  venue: string;
  topics: string[];
}

interface Assignment {
  name: string;
  subject: string;
  dueDate: string;
  status: "pending" | "submitted" | "late";
  description: string;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  author: string;
  priority: "high" | "medium" | "low";
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  date: string;
  icon: string;
}

export default function StudentDashboard() {
  const [user, setUser] = useState<any>(null);
  const [schoolName, setSchoolName] = useState("Your School");
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const subjects: Subject[] = [
    { name: "Mathematics", score: 85, grade: "A", trend: "up", teacher: "Mrs. Adebayo", remark: "Excellent progress in algebra", improvement: 8 },
    { name: "English", score: 78, grade: "B+", trend: "stable", teacher: "Mr. Johnson", remark: "Good performance in literature", improvement: 2 },
    { name: "Physics", score: 72, grade: "B", trend: "up", teacher: "Dr. Okonkwo", remark: "Improved in mechanics", improvement: 5 },
    { name: "Chemistry", score: 68, grade: "B-", trend: "down", teacher: "Mrs. Eze", remark: "Need focus on organic chemistry", improvement: -4 },
    { name: "Biology", score: 82, grade: "A-", trend: "up", teacher: "Prof. Williams", remark: "Excellent in practicals", improvement: 7 },
  ];

  const exams: Exam[] = [
    { name: "Mid-Term Examination", subject: "Mathematics", date: "2024-04-20", time: "10:00 AM", venue: "Hall A", topics: ["Algebra", "Trigonometry", "Calculus"] },
    { name: "Practical Test", subject: "Physics", date: "2024-04-22", time: "2:00 PM", venue: "Lab 2", topics: ["Mechanics", "Electricity", "Optics"] },
    { name: "Essay Writing", subject: "English", date: "2024-04-25", time: "9:00 AM", venue: "Hall B", topics: ["Composition", "Comprehension", "Summary"] },
  ];

  const assignments: Assignment[] = [
    { name: "Algebra Worksheet", subject: "Mathematics", dueDate: "2024-04-18", status: "pending", description: "Complete questions 1-15 on quadratic equations" },
    { name: "Lab Report", subject: "Chemistry", dueDate: "2024-04-19", status: "pending", description: "Write up the acid-base titration experiment" },
    { name: "Essay: Climate Change", subject: "English", dueDate: "2024-04-17", status: "submitted", description: "500-word essay on climate impact" },
  ];

  const announcements: Announcement[] = [
    { id: "1", title: "School Assembly", content: "All students must attend the assembly on Friday at 8 AM", date: "2024-04-15", author: "Principal", priority: "high" },
    { id: "2", title: "Mid-Term Break", content: "School will be closed from April 25th to April 30th", date: "2024-04-14", author: "Admin", priority: "medium" },
    { id: "3", title: "Science Fair", content: "Register for the annual science fair by April 20th", date: "2024-04-13", author: "Science Dept", priority: "high" },
  ];

  const achievements: Achievement[] = [
    { id: "1", title: "Top Performer - Mathematics", description: "Highest score in class test", date: "2024-04-01", icon: "🏆" },
    { id: "2", title: "Perfect Attendance", description: "100% attendance for March", date: "2024-03-31", icon: "⭐" },
    { id: "3", title: "Science Quiz Winner", description: "First place in inter-class competition", date: "2024-03-25", icon: "🔬" },
  ];

  useEffect(() => {
    setMounted(true);
    const savedUser = localStorage.getItem("classora_user");
    const savedSchool = localStorage.getItem("classora_school_name");
    if (savedUser) setUser(JSON.parse(savedUser));
    else window.location.href = "/";
    if (savedSchool) setSchoolName(savedSchool);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = "/";
  };

  const getGradeColor = (grade: string) => {
    if (grade.startsWith("A")) return "text-green-400";
    if (grade.startsWith("B")) return "text-blue-400";
    if (grade.startsWith("C")) return "text-yellow-400";
    return "text-red-400";
  };

  const getTrendIcon = (trend: string) => {
    if (trend === "up") return <TrendingUp className="w-4 h-4 text-green-400" />;
    if (trend === "down") return <TrendingUp className="w-4 h-4 text-red-400 rotate-180" />;
    return <div className="w-4 h-4 bg-gray-400 rounded-full" />;
  };

  const getStatusColor = (status: string) => {
    if (status === "submitted") return "text-green-400 bg-green-500/10";
    if (status === "pending") return "text-yellow-400 bg-yellow-500/10";
    return "text-red-400 bg-red-500/10";
  };

  const getPriorityColor = (priority: string) => {
    if (priority === "high") return "text-red-400 bg-red-500/10";
    if (priority === "medium") return "text-yellow-400 bg-yellow-500/10";
    return "text-blue-400 bg-blue-500/10";
  };

  const averageScore = Math.round(subjects.reduce((acc, s) => acc + s.score, 0) / subjects.length);
  const predictedGrade = averageScore >= 80 ? "A" : averageScore >= 70 ? "B+" : averageScore >= 60 ? "B" : "C+";
  const pendingAssignments = assignments.filter(a => a.status === "pending").length;
  const upcomingExams = exams.length;

  if (!mounted || !user) return null;
  if (user.role !== "student") { window.location.href = "/"; return null; }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      <ActionButtons />

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm md:hidden" onClick={() => setMobileMenuOpen(false)}>
            <motion.div initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }} className="absolute left-0 top-0 bottom-0 w-72 bg-white/10 backdrop-blur-2xl border-r border-white/10 p-6" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-8"><div className="flex items-center gap-2"><div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center"><span className="text-white font-bold text-sm">C</span></div><span className="text-white font-semibold">Classora</span></div><button onClick={() => setMobileMenuOpen(false)} className="p-2 rounded-lg bg-white/10"><X className="w-5 h-5 text-white" /></button></div>
              <div className="space-y-2">{[{ id: "overview", icon: Home, label: "Overview" }, { id: "insights", icon: Brain, label: "AI Insights" }, { id: "subjects", icon: BookOpen, label: "Subjects" }, { id: "exams", icon: Calendar, label: "Exams" }, { id: "assignments", icon: FileText, label: "Assignments" }, { id: "achievements", icon: Award, label: "Achievements" }].map((item) => (<button key={item.id} onClick={() => { setActiveTab(item.id); setMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === item.id ? "bg-blue-500/20 text-blue-400 border border-blue-500/30" : "text-gray-400 hover:bg-white/5"}`}><item.icon className="w-5 h-5" /><span>{item.label}</span></button>))}</div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="fixed inset-0"><div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl animate-float" /><div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-float-delayed" /><div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl animate-pulse-slow" /></div>

      <div className="relative z-10">
        <div className="bg-white/5 backdrop-blur-xl border-b border-white/10">
          <div className="container mx-auto px-4 sm:px-6 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3 md:gap-4">
                <button onClick={() => setMobileMenuOpen(true)} className="p-2 rounded-lg bg-white/5 md:hidden"><Menu className="w-5 h-5 text-white" /></button>
                <div className="flex items-center gap-2"><div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center"><span className="text-white font-bold text-sm">C</span></div><span className="text-white font-semibold hidden sm:inline">Classora</span><span className="text-white/30 hidden sm:inline">•</span><span className="text-white/80 text-sm truncate max-w-[150px] sm:max-w-none">{schoolName}</span></div>
                <div className="hidden md:flex items-center gap-1 ml-6">{[{ id: "overview", label: "Overview" }, { id: "insights", label: "AI Insights" }, { id: "subjects", label: "Subjects" }, { id: "exams", label: "Exams" }, { id: "assignments", label: "Assignments" }, { id: "achievements", label: "Achievements" }].map((item) => (<button key={item.id} onClick={() => setActiveTab(item.id)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === item.id ? "bg-blue-500/20 text-blue-400" : "text-gray-400 hover:text-white hover:bg-white/5"}`}>{item.label}</button>))}</div>
              </div>
              <div className="flex items-center gap-2 sm:gap-4">
                <button onClick={() => setShowNotifications(!showNotifications)} className="relative p-2 rounded-full bg-white/5"><Bell className="w-5 h-5 text-white/70" /><span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" /></button>
                <Link href="/dashboard/student/profile"><button className="px-3 py-2 rounded-xl bg-blue-500/20 text-blue-400 text-sm hover:bg-blue-500/30 transition-colors flex items-center gap-2"><User className="w-4 h-4" />Profile</button></Link>
                <button onClick={toggleTheme} className="p-2 rounded-full bg-white/5">{theme === "light" ? <Moon className="w-5 h-5 text-white/70" /> : <Sun className="w-5 h-5 text-yellow-400" />}</button>
                <button onClick={() => setShowProfile(!showProfile)} className="flex items-center gap-2 md:gap-3 pl-2 md:pl-4 border-l border-white/10"><div className="text-right hidden sm:block"><p className="text-white font-semibold text-sm">{user.name}</p><p className="text-white/50 text-xs">Student</p></div><div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center"><User className="w-4 h-4 text-white" /></div></button>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 sm:mb-8"><h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Welcome back, {user.name}! 👋</h1><p className="text-gray-400 text-sm sm:text-base">Here is your academic overview</p></motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="relative rounded-2xl overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10 p-4 sm:p-6"><div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/20 rounded-full blur-2xl" /><div className="relative"><div className="flex items-center justify-between mb-3 sm:mb-4"><div className="p-2 sm:p-3 rounded-xl bg-blue-500/20"><Award className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" /></div><span className="text-xl sm:text-2xl font-bold text-white">{averageScore}%</span></div><p className="text-gray-400 text-xs sm:text-sm">Average Score</p><p className="text-white/60 text-xs mt-1">Across all subjects</p></div></div>
            <div className="relative rounded-2xl overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10 p-4 sm:p-6"><div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/20 rounded-full blur-2xl" /><div className="relative"><div className="flex items-center justify-between mb-3 sm:mb-4"><div className="p-2 sm:p-3 rounded-xl bg-purple-500/20"><Brain className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" /></div><span className="text-xl sm:text-2xl font-bold text-white">{predictedGrade}</span></div><p className="text-gray-400 text-xs sm:text-sm">Predicted Grade</p><p className="text-white/60 text-xs mt-1">AI-powered prediction</p></div></div>
            <div className="relative rounded-2xl overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10 p-4 sm:p-6"><div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/20 rounded-full blur-2xl" /><div className="relative"><div className="flex items-center justify-between mb-3 sm:mb-4"><div className="p-2 sm:p-3 rounded-xl bg-emerald-500/20"><Star className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400" /></div><span className="text-xl sm:text-2xl font-bold text-white">{achievements.length}</span></div><p className="text-gray-400 text-xs sm:text-sm">Achievements</p><p className="text-white/60 text-xs mt-1">This semester</p></div></div>
            <div className="relative rounded-2xl overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10 p-4 sm:p-6"><div className="absolute top-0 right-0 w-20 h-20 bg-orange-500/20 rounded-full blur-2xl" /><div className="relative"><div className="flex items-center justify-between mb-3 sm:mb-4"><div className="p-2 sm:p-3 rounded-xl bg-orange-500/20"><Target className="w-5 h-5 sm:w-6 sm:h-6 text-orange-400" /></div><span className="text-xl sm:text-2xl font-bold text-white">94%</span></div><p className="text-gray-400 text-xs sm:text-sm">Attendance</p><p className="text-white/60 text-xs mt-1">This term</p></div></div>
          </motion.div>

          {activeTab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
              <div className="lg:col-span-2">
                <div className="rounded-2xl overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10"><div className="p-4 sm:p-6 border-b border-white/10"><h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2"><BookOpen className="w-5 h-5 text-blue-400" />Recent Performance</h2></div><div className="divide-y divide-white/10">{subjects.slice(0, 3).map((subject, index) => (<div key={subject.name} className="p-4 sm:p-6 hover:bg-white/5 transition-colors cursor-pointer" onClick={() => setSelectedSubject(subject.name)}><div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3"><div className="flex items-center gap-2 flex-wrap"><span className="text-white font-semibold">{subject.name}</span><span className="text-white/50 text-sm">• {subject.teacher}</span>{subject.trend === "up" && <span className="text-green-400 text-xs flex items-center gap-1"><TrendingUp className="w-3 h-3" /> +{subject.improvement}%</span>}{subject.trend === "down" && <span className="text-red-400 text-xs flex items-center gap-1"><TrendingUp className="w-3 h-3 rotate-180" /> {subject.improvement}%</span>}</div><div className="flex items-center gap-2">{getTrendIcon(subject.trend)}<span className={`font-bold ${getGradeColor(subject.grade)}`}>{subject.grade}</span><ChevronRight className="w-4 h-4 text-white/30" /></div></div><div className="relative"><div className="w-full bg-white/10 rounded-full h-2"><div className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600" style={{ width: `${subject.score}%` }} /></div><div className="flex justify-between mt-2"><span className="text-white/60 text-xs">Score: {subject.score}%</span><span className="text-white/60 text-xs">Class Avg: 72%</span></div></div><p className="text-gray-400 text-xs mt-2">{subject.remark}</p></div>))}</div><button onClick={() => setActiveTab("subjects")} className="w-full p-3 sm:p-4 text-center text-blue-400 hover:bg-blue-500/10 transition-colors text-sm font-medium">View All Subjects →</button></div>
              </div>
              <div className="space-y-6">
                <div className="rounded-2xl overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10"><div className="p-4 sm:p-6 border-b border-white/10"><h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2"><Calendar className="w-5 h-5 text-purple-400" />Upcoming Exams ({upcomingExams})</h2></div><div className="divide-y divide-white/10 max-h-80 overflow-y-auto">{exams.slice(0, 3).map((exam, index) => (<div key={index} className="p-4 hover:bg-white/5 transition-colors"><div className="flex items-center justify-between mb-2 flex-wrap gap-2"><span className="text-white font-semibold text-sm sm:text-base">{exam.name}</span><span className="text-xs text-white/50">{exam.subject}</span></div><div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm"><span className="text-gray-400">{exam.date}</span><span className="text-gray-500">•</span><span className="text-gray-400">{exam.time}</span><span className="text-gray-500">•</span><span className="text-gray-400">{exam.venue}</span></div></div>))}</div><button onClick={() => setActiveTab("exams")} className="w-full p-3 sm:p-4 text-center text-purple-400 hover:bg-purple-500/10 transition-colors text-sm font-medium">View All Exams →</button></div>
                <div className="rounded-2xl overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10"><div className="p-4 sm:p-6 border-b border-white/10"><h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2"><Clock className="w-5 h-5 text-orange-400" />Assignments ({pendingAssignments} pending)</h2></div><div className="divide-y divide-white/10 max-h-80 overflow-y-auto">{assignments.filter(a => a.status !== "submitted").slice(0, 3).map((assignment, index) => (<div key={index} className="p-4 hover:bg-white/5 transition-colors"><div className="flex items-center justify-between mb-2 flex-wrap gap-2"><span className="text-white font-semibold text-sm sm:text-base">{assignment.name}</span><span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(assignment.status)}`}>{assignment.status}</span></div><div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm"><span className="text-gray-400">{assignment.subject}</span><span className="text-gray-500">•</span><span className="text-gray-400">Due: {assignment.dueDate}</span></div></div>))}</div><button onClick={() => setActiveTab("assignments")} className="w-full p-3 sm:p-4 text-center text-orange-400 hover:bg-orange-500/10 transition-colors text-sm font-medium">View All Assignments →</button></div>
              </div>
            </div>
          )}

          {activeTab === "insights" && user && (
            <PerformanceInsights 
              studentId={user.id} 
              userRole="student"
              studentName={user.name}
            />
          )}

          {activeTab === "subjects" && (
            <div className="rounded-2xl overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10"><div className="p-4 sm:p-6 border-b border-white/10"><h2 className="text-lg sm:text-xl font-bold text-white">All Subjects Performance</h2><p className="text-gray-400 text-sm mt-1">Detailed breakdown of each subject</p></div><div className="divide-y divide-white/10">{subjects.map((subject, index) => (<div key={subject.name} className="p-4 sm:p-6 hover:bg-white/5 transition-colors cursor-pointer" onClick={() => setSelectedSubject(subject.name)}><div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4"><div><div className="flex items-center gap-2 flex-wrap"><span className="text-white font-semibold text-lg">{subject.name}</span><span className="text-white/50 text-sm">• {subject.teacher}</span>{subject.trend === "up" && <span className="text-green-400 text-xs flex items-center gap-1"><TrendingUp className="w-3 h-3" /> +{subject.improvement}%</span>}{subject.trend === "down" && <span className="text-red-400 text-xs flex items-center gap-1"><TrendingUp className="w-3 h-3 rotate-180" /> {subject.improvement}%</span>}</div><p className="text-gray-400 text-sm mt-1">{subject.remark}</p></div><div className="flex items-center gap-4"><div className="text-right"><p className="text-2xl font-bold text-white">{subject.score}%</p><p className={`font-semibold ${getGradeColor(subject.grade)}`}>{subject.grade}</p></div><ChevronRight className="w-5 h-5 text-white/30" /></div></div><div className="relative"><div className="w-full bg-white/10 rounded-full h-3"><div className="h-3 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600" style={{ width: `${subject.score}%` }} /></div><div className="flex justify-between mt-2 text-xs"><span className="text-white/60">Your Score: {subject.score}%</span><span className="text-white/60">Class Average: 72%</span><span className="text-white/60">Target: 80%</span></div></div></div>))}</div></div>
          )}

          {activeTab === "exams" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">{exams.map((exam, index) => (<div key={index} className="rounded-2xl overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10 p-4 sm:p-6"><div className="flex items-start justify-between mb-4"><div><h3 className="text-white font-bold text-lg">{exam.name}</h3><p className="text-gray-400 text-sm">{exam.subject}</p></div><div className="p-2 rounded-lg bg-purple-500/20"><Calendar className="w-5 h-5 text-purple-400" /></div></div><div className="space-y-2 mb-4"><div className="flex justify-between text-sm"><span className="text-gray-400">Date</span><span className="text-white">{exam.date}</span></div><div className="flex justify-between text-sm"><span className="text-gray-400">Time</span><span className="text-white">{exam.time}</span></div><div className="flex justify-between text-sm"><span className="text-gray-400">Venue</span><span className="text-white">{exam.venue}</span></div></div><div className="border-t border-white/10 pt-3"><p className="text-gray-400 text-sm mb-2">Topics to cover:</p><div className="flex flex-wrap gap-2">{exam.topics.map((topic, i) => (<span key={i} className="text-xs px-2 py-1 rounded-full bg-white/10 text-gray-300">{topic}</span>))}</div></div></div>))}</div>
          )}

          {activeTab === "assignments" && (
            <div className="space-y-4">{assignments.map((assignment, index) => (<div key={index} className="rounded-2xl overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10 p-4 sm:p-6"><div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4"><div className="flex items-center gap-3">{assignment.status === "submitted" ? <CheckCircle className="w-6 h-6 text-green-400" /> : assignment.status === "pending" ? <Circle className="w-6 h-6 text-yellow-400" /> : <AlertTriangle className="w-6 h-6 text-red-400" />}<div><h3 className="text-white font-bold text-lg">{assignment.name}</h3><p className="text-gray-400 text-sm">{assignment.subject}</p></div></div><span className={`text-sm px-3 py-1 rounded-full ${getStatusColor(assignment.status)} w-fit`}>{assignment.status.toUpperCase()}</span></div><p className="text-gray-300 text-sm mb-3">{assignment.description}</p><div className="flex items-center gap-4 text-sm"><span className="text-gray-400">Due: {assignment.dueDate}</span>{assignment.status === "pending" && <button className="text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1">Submit Now <ExternalLink className="w-3 h-3" /></button>}</div></div>))}</div>
          )}

          {activeTab === "achievements" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{achievements.map((achievement) => (<div key={achievement.id} className="rounded-2xl overflow-hidden bg-gradient-to-r from-yellow-500/10 to-orange-500/10 backdrop-blur-xl border border-yellow-500/30 p-4 sm:p-6"><div className="flex items-center gap-4"><div className="text-4xl">{achievement.icon}</div><div className="flex-1"><h3 className="text-white font-bold text-lg">{achievement.title}</h3><p className="text-gray-400 text-sm">{achievement.description}</p><p className="text-gray-500 text-xs mt-2">Achieved: {achievement.date}</p></div><Award className="w-8 h-8 text-yellow-400" /></div></div>))}</div>
          )}

          <div className="mt-6 sm:mt-8 rounded-2xl overflow-hidden bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-xl border border-blue-500/30 p-4 sm:p-6"><div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"><div className="flex items-center gap-3"><div className="p-2 sm:p-3 rounded-xl bg-blue-500/20"><Brain className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" /></div><div><h3 className="text-white font-semibold text-base sm:text-lg">AI Learning Assistant</h3><p className="text-gray-300 text-sm">Personalized insights based on your performance</p></div></div><div className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-yellow-400" /><span className="text-yellow-400 text-sm font-medium">AI Powered</span></div></div><div className="mt-4 space-y-3"><p className="text-gray-300 text-sm sm:text-base">📊 Based on your performance, you are showing strong improvement in Mathematics and Biology. Your consistency is impressive!</p><p className="text-gray-300 text-sm sm:text-base">🎯 Focus on Chemistry practice problems to raise your score by 10-15%. Recommended: 30 minutes daily practice.</p><p className="text-gray-300 text-sm sm:text-base">💡 Your next exam is {exams[0].name} on {exams[0].date}. Review {exams[0].topics.join(", ")}.</p></div><div className="mt-4 flex flex-wrap gap-2"><button className="px-3 py-1.5 rounded-lg bg-blue-500/20 text-blue-400 text-sm hover:bg-blue-500/30 transition-colors">Get Study Plan</button><button className="px-3 py-1.5 rounded-lg bg-purple-500/20 text-purple-400 text-sm hover:bg-purple-500/30 transition-colors">Ask AI Assistant</button><button className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 text-sm hover:bg-emerald-500/30 transition-colors">View Recommendations</button></div></div>
        </div>
      </div>

      <AnimatePresence>{selectedSubject && (() => { const subject = subjects.find(s => s.name === selectedSubject); if (!subject) return null; return (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedSubject(null)}><motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} onClick={(e) => e.stopPropagation()} className="relative w-full max-w-lg rounded-2xl bg-white/10 backdrop-blur-2xl border border-white/20"><div className={`p-6 bg-gradient-to-r ${subject.name === "Mathematics" ? "from-blue-600 to-indigo-600" : subject.name === "English" ? "from-orange-600 to-red-600" : subject.name === "Physics" ? "from-purple-600 to-pink-600" : subject.name === "Chemistry" ? "from-emerald-600 to-green-600" : "from-cyan-600 to-blue-600"}`}><div className="flex items-center justify-between"><div><h3 className="text-2xl font-bold text-white">{subject.name}</h3><p className="text-white/80">Teacher: {subject.teacher}</p></div><div className="text-right"><p className="text-3xl font-bold text-white">{subject.score}%</p><p className={`font-bold ${getGradeColor(subject.grade)}`}>{subject.grade}</p></div></div></div><div className="p-6 space-y-4"><div className="grid grid-cols-2 gap-4"><div className="p-4 bg-white/5 rounded-xl text-center"><p className="text-gray-400 text-sm">Class Average</p><p className="text-2xl font-bold text-white">72%</p></div><div className="p-4 bg-white/5 rounded-xl text-center"><p className="text-gray-400 text-sm">Your Rank</p><p className="text-2xl font-bold text-white">8/45</p></div></div><div className="p-4 bg-white/5 rounded-xl"><p className="text-gray-300 text-sm">{subject.remark}</p></div><div className={`p-4 rounded-xl ${subject.trend === "up" ? "bg-green-500/10 border border-green-500/30" : subject.trend === "down" ? "bg-red-500/10 border border-red-500/30" : "bg-blue-500/10 border border-blue-500/30"}`}><p className="text-sm">{subject.trend === "up" && `📈 Great improvement! You have increased by ${subject.improvement}% Keep up the momentum!`}{subject.trend === "down" && `📉 Your score dropped by ${Math.abs(subject.improvement)}%. Focus on the recommended study areas.`}{subject.trend === "stable" && "📊 You are maintaining consistent performance. Aim for a 5% improvement next assessment."}</p></div><div className="p-4 bg-blue-500/10 rounded-xl border border-blue-500/30"><div className="flex items-center gap-2 mb-2"><Brain className="w-5 h-5 text-blue-400" /><p className="text-blue-400 font-semibold">AI Study Recommendation</p></div><p className="text-gray-300 text-sm">{subject.name === "Chemistry" ? "Review organic chemistry chapters 4-6. Practice balancing equations daily." : subject.name === "Mathematics" ? "Focus on calculus problems. Complete 5 practice questions daily." : "Continue with your current study routine. You are on the right track!"}</p></div><button onClick={() => setSelectedSubject(null)} className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold transition-colors">Close</button></div></motion.div></motion.div>); })()}</AnimatePresence>

      <AnimatePresence>{showNotifications && (<motion.div initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 100 }} className="fixed top-20 right-4 z-50 w-80 sm:w-96 rounded-2xl bg-white/10 backdrop-blur-2xl border border-white/20 shadow-2xl"><div className="p-4 border-b border-white/10"><h3 className="text-white font-bold">Notifications</h3></div><div className="max-h-96 overflow-y-auto divide-y divide-white/10">{announcements.map((announcement) => (<div key={announcement.id} className="p-4 hover:bg-white/5 transition-colors"><div className="flex items-start gap-3"><div className={`p-1.5 rounded-full ${getPriorityColor(announcement.priority)}`}><Bell className="w-3 h-3" /></div><div className="flex-1"><p className="text-white font-medium text-sm">{announcement.title}</p><p className="text-gray-400 text-xs mt-1">{announcement.content}</p><p className="text-gray-500 text-xs mt-1">{announcement.date}</p></div></div></div>))}</div><button className="w-full p-3 text-center text-blue-400 hover:bg-blue-500/10 transition-colors text-sm">Mark all as read</button></motion.div>)}</AnimatePresence>

      <AnimatePresence>{showProfile && (<motion.div initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 100 }} className="fixed top-20 right-4 z-50 w-80 rounded-2xl bg-white/10 backdrop-blur-2xl border border-white/20 shadow-2xl"><div className="p-6 text-center border-b border-white/10"><div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center mb-3"><User className="w-10 h-10 text-white" /></div><h3 className="text-white font-bold text-lg">{user.name}</h3><p className="text-gray-400 text-sm">Student • {schoolName}</p></div><div className="p-4 space-y-2"><button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors"><User className="w-5 h-5 text-gray-400" /><span className="text-gray-300 text-sm">My Profile</span></button><button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors"><Settings className="w-5 h-5 text-gray-400" /><span className="text-gray-300 text-sm">Settings</span></button><button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors"><Bell className="w-5 h-5 text-gray-400" /><span className="text-gray-300 text-sm">Notification Preferences</span></button><button onClick={handleLogout} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-red-500/10 transition-colors text-red-400"><LogOut className="w-5 h-5" /><span>Logout</span></button></div></motion.div>)}</AnimatePresence>

      <style jsx>{`
        @keyframes float { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(30px, -30px); } }
        @keyframes float-delayed { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(-30px, 30px); } }
        @keyframes pulse-slow { 0%, 100% { opacity: 0.2; transform: scale(1); } 50% { opacity: 0.5; transform: scale(1.2); } }
        .animate-float { animation: float 12s ease-in-out infinite; }
        .animate-float-delayed { animation: float-delayed 14s ease-in-out infinite; }
        .animate-pulse-slow { animation: pulse-slow 8s ease-in-out infinite; }
      `}</style>
    </div>
  );
}
