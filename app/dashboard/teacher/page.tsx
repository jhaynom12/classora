'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, TrendingUp, Award, Calendar, Clock, Download, Eye, ChevronRight,
  Moon, Sun, User, LogOut, Bell, Star, Target, Brain, MessageCircle, BookOpen,
  Menu, X, Home, BarChart3, FileText, Settings, ChevronDown, Filter, Search,
  Upload, FileSpreadsheet, CheckCircle, AlertTriangle, ThumbsUp, Zap, Sparkles,
  Plus, Edit, Trash2, MoreVertical, Send, Paperclip, Mail, Phone, Video,
  Clock as ClockIcon, Calendar as CalendarIcon, Users as UsersIcon,
  GraduationCap, PieChart, Activity, AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { useTheme } from '@/components/theme-provider';
import ActionButtons from '@/app/components/ActionButtons';
import PerformanceInsights from '@/app/components/PerformanceInsights';
import TeacherClassManagement from '@/app/components/TeacherClassManagement';

interface Student {
  id: string;
  name: string;
  admissionNo: string;
  avatar: string;
  scores: {
    test1?: number;
    test2?: number;
    exam?: number;
    total?: number;
    grade?: string;
  };
  attendance: number;
  remarks?: string;
  parentContact: string;
  parentEmail: string;
}

interface Class {
  id: string;
  name: string;
  subject: string;
  students: Student[];
  averageScore: number;
  topPerformer: string;
  atRisk: number;
}

interface Assignment {
  id: string;
  title: string;
  subject: string;
  class: string;
  dueDate: string;
  totalMarks: number;
  submissions: number;
  totalStudents: number;
  status: 'active' | 'closed' | 'draft';
}

interface Message {
  id: string;
  from: string;
  fromName: string;
  message: string;
  date: string;
  read: boolean;
  isParent: boolean;
}

interface UpcomingEvent {
  id: string;
  title: string;
  date: string;
  type: 'exam' | 'meeting' | 'deadline';
  class: string;
}

export default function TeacherDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [schoolName, setSchoolName] = useState('Your School');
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [showUploadMarksheet, setShowUploadMarksheet] = useState(false);
  const [showCreateAssignmentModal, setShowCreateAssignmentModal] = useState(false);
  const [newAssignmentTitle, setNewAssignmentTitle] = useState('');
  const [newAssignmentSubject, setNewAssignmentSubject] = useState('');
  const [newAssignmentClass, setNewAssignmentClass] = useState('');
  const [newAssignmentDueDate, setNewAssignmentDueDate] = useState('');
  const [newAssignmentTotalMarks, setNewAssignmentTotalMarks] = useState('100');
  const [newAssignmentInstructions, setNewAssignmentInstructions] = useState('');
  const [creatingAssignment, setCreatingAssignment] = useState(false);
  const [showEditAssignmentModal, setShowEditAssignmentModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [showMessages, setShowMessages] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [classes, setClasses] = useState<Class[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [loadingAssignments, setLoadingAssignments] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [marksheetData, setMarksheetData] = useState<any>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loadingDashboard, setLoadingDashboard] = useState(false);
  const { theme, toggleTheme } = useTheme();

  // Sample classes data (fallback when no data is fetched)
  // const sampleClasses: Class[] = classes.length > 0 ? classes : [];

  // Sample assignments - will be replaced with API call
  const [assignments, setAssignments] = useState<Assignment[]>([
    { id: '1', title: 'Algebra Worksheet', subject: 'Mathematics', class: 'SS2 Science', dueDate: '2024-04-18', totalMarks: 50, submissions: 28, totalStudents: 32, status: 'active' },
    { id: '2', title: 'Calculus Assignment', subject: 'Mathematics', class: 'SS2 Science', dueDate: '2024-04-25', totalMarks: 100, submissions: 15, totalStudents: 32, status: 'active' },
    { id: '3', title: 'Geometry Project', subject: 'Mathematics', class: 'SS2 Art', dueDate: '2024-04-20', totalMarks: 100, submissions: 10, totalStudents: 25, status: 'active' },
  ]);

  // Sample messages
  const messages: Message[] = [
    { id: '1', from: 'parent_adeola', fromName: 'Mr. K. (Adeola\'s Parent)', message: 'How is my daughter performing in Mathematics?', date: '2024-04-14', read: false, isParent: true },
    { id: '2', from: 'parent_chidi', fromName: 'Mrs. O. (Chidi\'s Parent)', message: 'Chidi seems to be struggling. Can we schedule a meeting?', date: '2024-04-13', read: true, isParent: true },
    { id: '3', from: 'admin', fromName: 'Principal', message: 'Staff meeting tomorrow at 2 PM', date: '2024-04-12', read: false, isParent: false },
  ];

  // Sample upcoming events
  const upcomingEvents: UpcomingEvent[] = [
    { id: '1', title: 'Mid-Term Examination', date: '2024-04-20', type: 'exam', class: 'All Classes' },
    { id: '2', title: 'Parent-Teacher Meeting', date: '2024-04-25', type: 'meeting', class: 'All Classes' },
    { id: '3', title: 'Assignment Deadline', date: '2024-04-18', type: 'deadline', class: 'SS2 Science' },
  ];

  useEffect(() => {
    setMounted(true);
    const savedUser = localStorage.getItem('classora_user');
    
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      fetchSchoolInfo();
    } else {
      window.location.href = '/';
    }

    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (user?.id) {
      fetchDashboardData();
      fetchAssignments();
      fetchClasses();
      fetchStudents();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user?.id) return;

    setLoadingDashboard(true);
    try {
      const response = await fetch('/api/dashboard/teacher', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('classora_token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
      }
    } catch (error) {
      console.error('Error fetching teacher dashboard data:', error);
    } finally {
      setLoadingDashboard(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/';
  };

  const fetchSchoolInfo = async () => {
    if (user?.schoolId) {
      try {
        const response = await fetch(`/api/school?schoolId=${user.schoolId}`);
        if (response.ok) {
          const school = await response.json();
          setSchoolName(school.name);
        }
      } catch (error) {
        console.error('Failed to fetch school info:', error);
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMarksheetData({
        fileName: file.name,
        rows: 32,
        columns: 5,
        preview: [
          { name: 'Adeola K.', admissionNo: 'STU001', test1: 85, test2: 82, exam: 88 },
          { name: 'Bola T.', admissionNo: 'STU002', test1: 72, test2: 75, exam: 70 },
          { name: 'Chidi O.', admissionNo: 'STU003', test1: 45, test2: 50, exam: 48 },
        ]
      });
    }
  };

  const handleOpenEditAssignmentModal = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setShowEditAssignmentModal(true);
  };

  const handleSaveAssignmentEdit = () => {
    if (!selectedAssignment) return;
    setAssignments(assignments.map((assignment) =>
      assignment.id === selectedAssignment.id ? selectedAssignment : assignment
    ));
    setShowEditAssignmentModal(false);
    setSelectedAssignment(null);
  };

  const handleCloseEditAssignmentModal = () => {
    setShowEditAssignmentModal(false);
    setSelectedAssignment(null);
  };

  const fetchAssignments = async () => {
    if (!user?.id) return;
    
    setLoadingAssignments(true);
    try {
      const response = await fetch(`/api/assignments?teacherId=${user.id}`);
      if (response.ok) {
        const data = await response.json();
        // Transform API data to match component interface
        const transformedAssignments = data.map((assignment: any) => ({
          id: assignment.id,
          title: assignment.title,
          subject: assignment.subject?.name || 'Unknown Subject',
          class: assignment.class?.name || 'Unknown Class',
          dueDate: new Date(assignment.dueDate).toLocaleDateString(),
          totalMarks: assignment.totalMarks,
          submissions: assignment._count?.submissions || 0,
          totalStudents: assignment.class?.enrollments?.length || 0,
          status: assignment.status || 'active'
        }));
        setAssignments(transformedAssignments);
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
    } finally {
      setLoadingAssignments(false);
    }
  };

  const fetchClasses = async () => {
    if (!user?.schoolId) return;

    setLoadingClasses(true);
    try {
      const response = await fetch(`/api/classes?schoolId=${user.schoolId}`);
      if (response.ok) {
        const data = await response.json();
        // Transform API data to match component interface
        const transformedClasses = data.map((cls: any) => ({
          id: cls.id,
          name: `${cls.name} ${cls.section}`,
          subject: 'Multiple Subjects', // We'll need to get this from class subjects
          students: cls.enrollments.map((enrollment: any) => ({
            id: enrollment.student.id,
            name: enrollment.student.name,
            admissionNo: enrollment.student.studentId || 'N/A',
            avatar: enrollment.student.name.split(' ').map((n: string) => n[0]).join(''),
            scores: { test1: 0, test2: 0, exam: 0, total: 0, grade: 'N/A' }, // We'll need to fetch marks
            attendance: 0, // We'll need to calculate this
            parentContact: 'N/A', // We'll need to get parent contact
            parentEmail: 'N/A'
          })),
          averageScore: 0, // Calculate from student scores
          topPerformer: 'N/A', // Calculate from student scores
          atRisk: 0 // Calculate from student scores
        }));
        setClasses(transformedClasses);
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
    } finally {
      setLoadingClasses(false);
    }
  };

  const fetchStudents = async () => {
    if (!user?.schoolId) return;

    setLoadingStudents(true);
    try {
      const response = await fetch(`/api/users?schoolId=${user.schoolId}&role=student`);
      if (response.ok) {
        const data = await response.json();
        // Transform API data to match component interface
        const transformedStudents = data.map((student: any) => ({
          id: student.id,
          name: student.name,
          admissionNo: student.studentId || 'N/A',
          avatar: student.name.split(' ').map((n: string) => n[0]).join(''),
          scores: { test1: 0, test2: 0, exam: 0, total: 0, grade: 'N/A' },
          attendance: 0,
          parentContact: 'N/A',
          parentEmail: 'N/A'
        }));
        setStudents(transformedStudents);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoadingStudents(false);
    }
  };

  const getUnreadMessages = () => messages.filter((m) => !m.read).length;
  const getTotalStudents = () => classes.reduce((sum, c) => sum + c.students.length, 0);
  const getAtRiskStudents = () => classes.reduce((sum, c) => sum + c.atRisk, 0);

  const availableSubjects = Array.from(new Set(classes.map((c) => c.subject)));

  const handleCreateAssignment = async () => {
    if (!newAssignmentTitle || !newAssignmentClass || !newAssignmentSubject || !newAssignmentDueDate) {
      return;
    }

    setCreatingAssignment(true);

    const selectedClassData = classes.find((c) => c.id === newAssignmentClass);
    const assignment: Assignment = {
      id: `new-${Date.now()}`,
      title: newAssignmentTitle,
      subject: newAssignmentSubject,
      class: selectedClassData?.name || 'Unknown Class',
      dueDate: new Date(newAssignmentDueDate).toLocaleDateString(),
      totalMarks: Number(newAssignmentTotalMarks) || 100,
      submissions: 0,
      totalStudents: selectedClassData?.students.length || 0,
      status: 'active'
    };

    setAssignments((prev) => [assignment, ...prev]);
    setShowCreateAssignmentModal(false);
    setNewAssignmentTitle('');
    setNewAssignmentSubject('');
    setNewAssignmentClass('');
    setNewAssignmentDueDate('');
    setNewAssignmentTotalMarks('100');
    setNewAssignmentInstructions('');
    setCreatingAssignment(false);
  };

  const getGradeColor = (grade: string) => {
    if (!grade) return 'text-gray-400';
    if (grade.startsWith('A')) return 'text-green-400';
    if (grade.startsWith('B')) return 'text-blue-400';
    if (grade.startsWith('C')) return 'text-yellow-400';
    return 'text-red-400';
  };

  if (!mounted || !user) return null;

  if (user.role !== 'teacher') {
    window.location.href = '/';
    return null;
  }

  // Show loading state while fetching initial data
  if (loadingClasses || loadingStudents) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const selectedClassData = classes.find(c => c.id === selectedClass);

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
                  { id: 'classes', icon: BookOpen, label: 'My Classes' },
                  { id: 'manage-classes', icon: Users, label: 'Manage Classes' },
                  { id: 'assignments', icon: FileText, label: 'Assignments' },
                  { id: 'messages', icon: MessageCircle, label: 'Messages', badge: getUnreadMessages() },
                  { id: 'analytics', icon: BarChart3, label: 'Analytics' },
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
                    {item.badge && item.badge > 0 && (
                      <span className="ml-auto w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
                        {item.badge}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Animated Background */}
      <div className="fixed inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-orange-500/20 rounded-full blur-3xl animate-float" />
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
                    { id: 'classes', label: 'My Classes' },
                    { id: 'manage-classes', label: 'Manage Classes' },
                    { id: 'assignments', label: 'Assignments' },
                    { id: 'messages', label: 'Messages', badge: getUnreadMessages() },
                    { id: 'analytics', label: 'Analytics' },
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
                    <p className="text-white/50 text-xs">Teacher</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-orange-500 to-red-600 flex items-center justify-center">
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
              Welcome back, {user.name}! 👩‍🏫
            </h1>
            <p className="text-gray-400 text-sm sm:text-base">Manage your classes, track performance, and engage with parents</p>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8"
          >
            <div className="relative rounded-2xl overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10 p-4 sm:p-6">
              <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/20 rounded-full blur-2xl" />
              <div className="relative">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="p-2 sm:p-3 rounded-xl bg-blue-500/20">
                    <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
                  </div>
                  <span className="text-xl sm:text-2xl font-bold text-white">{classes.length}</span>
                </div>
                <p className="text-gray-400 text-xs sm:text-sm">Classes</p>
                <p className="text-white/60 text-xs mt-1">Active classes</p>
              </div>
            </div>

            <div className="relative rounded-2xl overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10 p-4 sm:p-6">
              <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/20 rounded-full blur-2xl" />
              <div className="relative">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="p-2 sm:p-3 rounded-xl bg-green-500/20">
                    <Users className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" />
                  </div>
                  <span className="text-xl sm:text-2xl font-bold text-white">{getTotalStudents()}</span>
                </div>
                <p className="text-gray-400 text-xs sm:text-sm">Total Students</p>
                <p className="text-white/60 text-xs mt-1">Enrolled</p>
              </div>
            </div>

            <div className="relative rounded-2xl overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10 p-4 sm:p-6">
              <div className="absolute top-0 right-0 w-20 h-20 bg-yellow-500/20 rounded-full blur-2xl" />
              <div className="relative">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="p-2 sm:p-3 rounded-xl bg-yellow-500/20">
                    <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" />
                  </div>
                  <span className="text-xl sm:text-2xl font-bold text-white">{getAtRiskStudents()}</span>
                </div>
                <p className="text-gray-400 text-xs sm:text-sm">At-Risk Students</p>
                <p className="text-white/60 text-xs mt-1">Need attention</p>
              </div>
            </div>

            <div className="relative rounded-2xl overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10 p-4 sm:p-6">
              <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/20 rounded-full blur-2xl" />
              <div className="relative">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="p-2 sm:p-3 rounded-xl bg-purple-500/20">
                    <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
                  </div>
                  <span className="text-xl sm:text-2xl font-bold text-white">{getUnreadMessages()}</span>
                </div>
                <p className="text-gray-400 text-xs sm:text-sm">Unread Messages</p>
                <p className="text-white/60 text-xs mt-1">From parents</p>
              </div>
            </div>
          </motion.div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6 sm:space-y-8">
              {/* Class Performance Overview */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {classes.map((classItem, index) => (
                  <motion.div
                    key={classItem.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => {
                      setSelectedClass(classItem.id);
                      setActiveTab('classes');
                    }}
                    className="relative rounded-2xl overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10 hover:border-orange-500/30 transition-all cursor-pointer group"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-full blur-2xl" />
                    <div className="p-5 sm:p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-white font-bold text-lg">{classItem.name}</h3>
                          <p className="text-gray-400 text-sm">{classItem.subject}</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-white/30 group-hover:text-white/70 transition-colors" />
                      </div>
                      
                      <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-4">
                        <div className="text-center">
                          <p className="text-xl sm:text-2xl font-bold text-white">{classItem.students.length}</p>
                          <p className="text-gray-500 text-xs">Students</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xl sm:text-2xl font-bold text-blue-400">{classItem.averageScore}%</p>
                          <p className="text-gray-500 text-xs">Average</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xl sm:text-2xl font-bold text-yellow-400">{classItem.atRisk}</p>
                          <p className="text-gray-500 text-xs">At Risk</p>
                        </div>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-white/10">
                        <div className="flex justify-between text-xs text-gray-400 mb-2">
                          <span>Top Performer</span>
                          <span>{classItem.topPerformer}</span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-1.5">
                          <div 
                            className="h-1.5 rounded-full bg-gradient-to-r from-green-500 to-emerald-500"
                            style={{ width: `${classItem.averageScore}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <button
                  onClick={() => setShowUploadMarksheet(true)}
                  className="rounded-2xl overflow-hidden bg-gradient-to-r from-blue-600/20 to-indigo-600/20 backdrop-blur-xl border border-blue-500/30 p-6 text-center hover:scale-105 transition-transform"
                >
                  <Upload className="w-8 h-8 text-blue-400 mx-auto mb-3" />
                  <h3 className="text-white font-semibold">Upload Marksheet</h3>
                  <p className="text-gray-400 text-sm mt-1">Import student scores via CSV/Excel</p>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('assignments');
                    setShowCreateAssignmentModal(true);
                  }}
                  className="rounded-2xl overflow-hidden bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-xl border border-purple-500/30 p-6 text-center hover:scale-105 transition-transform"
                >
                  <FileText className="w-8 h-8 text-purple-400 mx-auto mb-3" />
                  <h3 className="text-white font-semibold">Create Assignment</h3>
                  <p className="text-gray-400 text-sm mt-1">Post new assignments for students</p>
                </button>

                <button
                  onClick={() => setActiveTab('messages')}
                  className="rounded-2xl overflow-hidden bg-gradient-to-r from-emerald-600/20 to-teal-600/20 backdrop-blur-xl border border-emerald-500/30 p-6 text-center hover:scale-105 transition-transform"
                >
                  <MessageCircle className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
                  <h3 className="text-white font-semibold">Message Parents</h3>
                  <p className="text-gray-400 text-sm mt-1">Communicate with parents</p>
                </button>
              </div>

              {/* Upcoming Events & Recent Messages */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Upcoming Events */}
                <div className="rounded-2xl overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10">
                  <div className="p-4 sm:p-6 border-b border-white/10">
                    <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-purple-400" />
                      Upcoming Events
                    </h2>
                  </div>
                  <div className="divide-y divide-white/10">
                    {upcomingEvents.map((event) => (
                      <div key={event.id} className="p-4 hover:bg-white/5 transition-colors">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${
                            event.type === 'exam' ? 'bg-red-500/20' :
                            event.type === 'meeting' ? 'bg-blue-500/20' :
                            'bg-yellow-500/20'
                          }`}>
                            {event.type === 'exam' && <BookOpen className="w-4 h-4 text-red-400" />}
                            {event.type === 'meeting' && <Users className="w-4 h-4 text-blue-400" />}
                            {event.type === 'deadline' && <ClockIcon className="w-4 h-4 text-yellow-400" />}
                          </div>
                          <div className="flex-1">
                            <p className="text-white font-medium">{event.title}</p>
                            <div className="flex justify-between items-center mt-1">
                              <p className="text-gray-400 text-sm">{event.class}</p>
                              <p className="text-gray-500 text-xs">{event.date}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Messages */}
                <div className="rounded-2xl overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10">
                  <div className="p-4 sm:p-6 border-b border-white/10">
                    <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                      <MessageCircle className="w-5 h-5 text-emerald-400" />
                      Recent Messages
                    </h2>
                  </div>
                  <div className="divide-y divide-white/10">
                    {messages.slice(0, 3).map((message) => (
                      <div key={message.id} className="p-4 hover:bg-white/5 transition-colors">
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-emerald-500/20">
                            <Mail className="w-4 h-4 text-emerald-400" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <p className="text-white font-medium text-sm">{message.fromName}</p>
                              {!message.read && <span className="w-2 h-2 bg-blue-400 rounded-full" />}
                            </div>
                            <p className="text-gray-400 text-xs mt-1 line-clamp-1">{message.message}</p>
                            <p className="text-gray-500 text-xs mt-1">{message.date}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => setActiveTab('messages')}
                    className="w-full p-3 text-center text-emerald-400 hover:bg-emerald-500/10 transition-colors text-sm"
                  >
                    View All Messages →
                  </button>
                </div>
              </div>

              {/* AI Teacher Assistant */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="rounded-2xl overflow-hidden bg-gradient-to-r from-orange-600/20 to-red-600/20 backdrop-blur-xl border border-orange-500/30 p-4 sm:p-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 sm:p-3 rounded-xl bg-orange-500/20">
                      <Brain className="w-5 h-5 sm:w-6 sm:h-6 text-orange-400" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold text-base sm:text-lg">AI Teaching Assistant</h3>
                      <p className="text-gray-300 text-sm">Insights to improve class performance</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-yellow-400" />
                    <span className="text-yellow-400 text-sm font-medium">AI Powered</span>
                  </div>
                </div>
                <div className="mt-4 space-y-3">
                  <p className="text-gray-300 text-sm sm:text-base">
                    📊 {classes[0]?.name || 'Your class'} average is 73%. {classes[0]?.atRisk || 0} student(s) are at risk of failing.
                  </p>
                  <p className="text-gray-300 text-sm sm:text-base">
                    💡 Chidi O. needs additional support in Mathematics. Consider scheduling extra help sessions.
                  </p>
                  <p className="text-gray-300 text-sm sm:text-base">
                    🎯 The class is performing well in algebra but struggling with calculus concepts.
                  </p>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button className="px-3 py-1.5 rounded-lg bg-orange-500/20 text-orange-400 text-sm hover:bg-orange-500/30 transition-colors">
                    Generate Report
                  </button>
                  <button className="px-3 py-1.5 rounded-lg bg-blue-500/20 text-blue-400 text-sm hover:bg-blue-500/30 transition-colors">
                    Identify At-Risk Students
                  </button>
                  <button className="px-3 py-1.5 rounded-lg bg-purple-500/20 text-purple-400 text-sm hover:bg-purple-500/30 transition-colors">
                    Get Lesson Plan Ideas
                  </button>
                </div>
              </motion.div>
            </div>
          )}

          {/* Classes Tab */}
          {activeTab === 'classes' && (
            <div className="space-y-6">
              {selectedClass ? (
                // Detailed Class View
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <button
                    onClick={() => setSelectedClass(null)}
                    className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
                  >
                    <ChevronRight className="w-4 h-4 rotate-180" />
                    Back to all classes
                  </button>

                  {/* Class Header */}
                  <div className="rounded-2xl overflow-hidden bg-gradient-to-r from-orange-600/20 to-red-600/20 backdrop-blur-xl border border-orange-500/30 p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h2 className="text-2xl font-bold text-white">{selectedClassData?.name}</h2>
                        <p className="text-gray-300">{selectedClassData?.subject}</p>
                        <p className="text-gray-400 text-sm mt-1">{selectedClassData?.students.length} Students Enrolled</p>
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => setShowUploadMarksheet(true)}
                          className="px-4 py-2 rounded-xl bg-blue-500/20 text-blue-400 text-sm hover:bg-blue-500/30 transition-colors flex items-center gap-2"
                        >
                          <Upload className="w-4 h-4" />
                          Upload Marksheet
                        </button>
                        <button className="px-4 py-2 rounded-xl bg-purple-500/20 text-purple-400 text-sm hover:bg-purple-500/30 transition-colors flex items-center gap-2">
                          <Download className="w-4 h-4" />
                          Export Data
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Class Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-4 text-center">
                      <p className="text-2xl font-bold text-white">{selectedClassData?.averageScore}%</p>
                      <p className="text-gray-400 text-sm">Class Average</p>
                    </div>
                    <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-4 text-center">
                      <p className="text-2xl font-bold text-green-400">{selectedClassData?.topPerformer}</p>
                      <p className="text-gray-400 text-sm">Top Performer</p>
                    </div>
                    <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-4 text-center">
                      <p className="text-2xl font-bold text-yellow-400">{selectedClassData?.atRisk}</p>
                      <p className="text-gray-400 text-sm">At-Risk Students</p>
                    </div>
                    <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-4 text-center">
                      <p className="text-2xl font-bold text-purple-400">85%</p>
                      <p className="text-gray-400 text-sm">Pass Rate</p>
                    </div>
                  </div>

                  {/* Students Table */}
                  <div className="rounded-2xl overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10">
                    <div className="p-6 border-b border-white/10 flex justify-between items-center flex-wrap gap-4">
                      <h3 className="text-xl font-bold text-white">Student Roster</h3>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search students..."
                          className="pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-blue-500 outline-none text-sm"
                        />
                      </div>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="border-b border-white/10">
                          <tr className="text-left text-gray-400 text-sm">
                            <th className="p-4">Student</th>
                            <th className="p-4">Admission No</th>
                            <th className="p-4">Test 1</th>
                            <th className="p-4">Test 2</th>
                            <th className="p-4">Exam</th>
                            <th className="p-4">Total</th>
                            <th className="p-4">Grade</th>
                            <th className="p-4">Attendance</th>
                            <th className="p-4">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                          {selectedClassData?.students.map((student) => (
                            <tr key={student.id} className="hover:bg-white/5 transition-colors cursor-pointer" onClick={() => setSelectedStudent(student)}>
                              <td className="p-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs">
                                    {student.avatar}
                                  </div>
                                  <span className="text-white text-sm">{student.name}</span>
                                </div>
                              </td>
                              <td className="p-4 text-gray-300 text-sm">{student.admissionNo}</td>
                              <td className="p-4 text-white text-sm">{student.scores.test1 || '-'}</td>
                              <td className="p-4 text-white text-sm">{student.scores.test2 || '-'}</td>
                              <td className="p-4 text-white text-sm">{student.scores.exam || '-'}</td>
                              <td className="p-4 text-white font-semibold">{student.scores.total || '-'}</td>
                              <td className={`p-4 font-semibold ${getGradeColor(student.scores.grade || '')}`}>{student.scores.grade || '-'}</td>
                              <td className="p-4">
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                  student.attendance >= 90 ? 'bg-green-500/20 text-green-400' : 
                                  student.attendance >= 75 ? 'bg-yellow-500/20 text-yellow-400' : 
                                  'bg-red-500/20 text-red-400'
                                }`}>
                                  {student.attendance}%
                                </span>
                              </td>
                              <td className="p-4">
                                <div className="flex items-center gap-2">
                                  <a 
                                    href={`/dashboard/student/profile?studentId=${student.admissionNo}`}
                                    onClick={(e) => e.stopPropagation()}
                                    className="p-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors"
                                    title="View Profile"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </a>
                                  <button className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                                    <MoreVertical className="w-4 h-4 text-gray-400" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </motion.div>
              ) : (
                // All Classes Grid
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {classes.map((classItem) => (
                    <motion.div
                      key={classItem.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      onClick={() => setSelectedClass(classItem.id)}
                      className="relative rounded-2xl overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10 hover:border-orange-500/30 transition-all cursor-pointer group"
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-full blur-2xl" />
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="text-white font-bold text-xl">{classItem.name}</h3>
                            <p className="text-gray-400">{classItem.subject}</p>
                          </div>
                          <ChevronRight className="w-5 h-5 text-white/30 group-hover:text-white/70 transition-colors" />
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4 mb-4">
                          <div className="text-center">
                            <p className="text-2xl font-bold text-white">{classItem.students.length}</p>
                            <p className="text-gray-500 text-xs">Students</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold text-blue-400">{classItem.averageScore}%</p>
                            <p className="text-gray-500 text-xs">Average</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold text-yellow-400">{classItem.atRisk}</p>
                            <p className="text-gray-500 text-xs">At Risk</p>
                          </div>
                        </div>
                        
                        <div className="mt-4 pt-4 border-t border-white/10">
                          <div className="flex justify-between text-xs text-gray-400 mb-2">
                            <span>Top Performer</span>
                            <span>{classItem.topPerformer}</span>
                          </div>
                          <div className="w-full bg-white/10 rounded-full h-1.5">
                            <div 
                              className="h-1.5 rounded-full bg-gradient-to-r from-green-500 to-emerald-500"
                              style={{ width: `${classItem.averageScore}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Manage Classes Tab */}
          {activeTab === 'manage-classes' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <TeacherClassManagement />
            </motion.div>
          )}

          {/* Assignments Tab */}
          {activeTab === 'assignments' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex justify-end">
                <button
                  onClick={() => setShowCreateAssignmentModal(true)}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-medium hover:shadow-xl transition-all flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Create New Assignment
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {assignments.map((assignment) => (
                  <div key={assignment.id} className="rounded-2xl overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10 p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                      <div>
                        <h3 className="text-white font-bold text-lg">{assignment.title}</h3>
                        <div className="flex flex-wrap items-center gap-3 mt-1">
                          <span className="text-gray-400 text-sm">{assignment.subject}</span>
                          <span className="text-gray-500 text-xs">•</span>
                          <span className="text-gray-400 text-sm">{assignment.class}</span>
                          <span className="text-gray-500 text-xs">•</span>
                          <span className="text-gray-400 text-sm">Total Marks: {assignment.totalMarks}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-xs px-3 py-1 rounded-full ${
                          assignment.status === 'active' ? 'bg-green-500/20 text-green-400' :
                          assignment.status === 'closed' ? 'bg-red-500/20 text-red-400' :
                          'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {assignment.status.toUpperCase()}
                        </span>
                        <button onClick={() => handleOpenEditAssignmentModal(assignment)} className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                          <Edit className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <ClockIcon className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-400 text-sm">Due: {assignment.dueDate}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <UsersIcon className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-400 text-sm">{assignment.submissions}/{assignment.totalStudents} Submitted</span>
                        </div>
                      </div>
                      <div className="w-full sm:w-48">
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                          <span>Submission Rate</span>
                          <span>{Math.round(assignment.submissions / assignment.totalStudents * 100)}%</span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-1.5">
                          <div 
                            className="h-1.5 rounded-full bg-gradient-to-r from-green-500 to-emerald-500"
                            style={{ width: `${assignment.submissions / assignment.totalStudents * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          <AnimatePresence>
            {showCreateAssignmentModal && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
                onClick={() => setShowCreateAssignmentModal(false)}
              >
                <motion.div
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0.95 }}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full max-w-2xl rounded-3xl bg-slate-950/95 border border-white/10 p-6 shadow-2xl backdrop-blur-xl"
                >
                  <div className="flex items-center justify-between gap-4 mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-white">Create New Assignment</h2>
                      <p className="text-sm text-gray-400">Add assignment details and publish for your class.</p>
                    </div>
                    <button
                      onClick={() => setShowCreateAssignmentModal(false)}
                      className="rounded-full p-2 bg-white/5 text-gray-300 hover:bg-white/10 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Title</label>
                      <input
                        value={newAssignmentTitle}
                        onChange={(e) => setNewAssignmentTitle(e.target.value)}
                        placeholder="Enter assignment title"
                        className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-blue-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Class</label>
                        <select
                          value={newAssignmentClass}
                          onChange={(e) => setNewAssignmentClass(e.target.value)}
                          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-blue-500"
                        >
                          <option value="">Select class</option>
                          {classes.map((classItem) => (
                            <option key={classItem.id} value={classItem.id}>{classItem.name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Subject</label>
                        <select
                          value={newAssignmentSubject}
                          onChange={(e) => setNewAssignmentSubject(e.target.value)}
                          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-blue-500"
                        >
                          <option value="">Select subject</option>
                          {availableSubjects.map((subject) => (
                            <option key={subject} value={subject}>{subject}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Due Date</label>
                        <input
                          type="date"
                          value={newAssignmentDueDate}
                          onChange={(e) => setNewAssignmentDueDate(e.target.value)}
                          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Total Marks</label>
                        <input
                          type="number"
                          min={1}
                          value={newAssignmentTotalMarks}
                          onChange={(e) => setNewAssignmentTotalMarks(e.target.value)}
                          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Instructions</label>
                      <textarea
                        value={newAssignmentInstructions}
                        onChange={(e) => setNewAssignmentInstructions(e.target.value)}
                        rows={4}
                        placeholder="Add assignment details, questions or instructions"
                        className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-blue-500 resize-none"
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 mt-4">
                      <button
                        onClick={handleCreateAssignment}
                        disabled={creatingAssignment}
                        className="flex-1 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 px-5 py-3 text-white font-semibold hover:shadow-xl transition-all disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {creatingAssignment ? 'Creating...' : 'Publish Assignment'}
                      </button>
                      <button
                        onClick={() => setShowCreateAssignmentModal(false)}
                        className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-white hover:bg-white/10 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {showEditAssignmentModal && selectedAssignment && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
                onClick={handleCloseEditAssignmentModal}
              >
                <motion.div
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0.95 }}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full max-w-2xl rounded-3xl bg-slate-950/95 border border-white/10 p-6 shadow-2xl backdrop-blur-xl"
                >
                  <div className="flex items-center justify-between gap-4 mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-white">Edit Assignment</h2>
                      <p className="text-sm text-gray-400">Update assignment details before saving.</p>
                    </div>
                    <button
                      onClick={handleCloseEditAssignmentModal}
                      className="rounded-full p-2 bg-white/5 text-gray-300 hover:bg-white/10 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Title</label>
                      <input
                        value={selectedAssignment.title}
                        onChange={(e) => setSelectedAssignment((prev) => prev ? { ...prev, title: e.target.value } : prev)}
                        placeholder="Enter assignment title"
                        className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-blue-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Class</label>
                        <select
                          value={selectedAssignment.class}
                          onChange={(e) => setSelectedAssignment((prev) => prev ? { ...prev, class: e.target.value } : prev)}
                          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-blue-500"
                        >
                          {classes.map((classItem) => (
                            <option key={classItem.id} value={classItem.name}>{classItem.name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Subject</label>
                        <input
                          value={selectedAssignment.subject}
                          onChange={(e) => setSelectedAssignment((prev) => prev ? { ...prev, subject: e.target.value } : prev)}
                          placeholder="Enter subject"
                          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Due Date</label>
                        <input
                          type="date"
                          value={new Date(selectedAssignment.dueDate).toISOString().split('T')[0]}
                          onChange={(e) => setSelectedAssignment((prev) => prev ? { ...prev, dueDate: new Date(e.target.value).toLocaleDateString() } : prev)}
                          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Total Marks</label>
                        <input
                          type="number"
                          min={1}
                          value={selectedAssignment.totalMarks}
                          onChange={(e) => setSelectedAssignment((prev) => prev ? { ...prev, totalMarks: Number(e.target.value) } : prev)}
                          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Status</label>
                      <select
                        value={selectedAssignment.status}
                        onChange={(e) => setSelectedAssignment((prev) => prev ? { ...prev, status: e.target.value as Assignment['status'] } : prev)}
                        className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-blue-500"
                      >
                        <option value="active">Active</option>
                        <option value="closed">Closed</option>
                        <option value="draft">Draft</option>
                      </select>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 mt-4">
                      <button
                        onClick={handleSaveAssignmentEdit}
                        className="flex-1 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 px-5 py-3 text-white font-semibold hover:shadow-xl transition-all"
                      >
                        Save Changes
                      </button>
                      <button
                        onClick={handleCloseEditAssignmentModal}
                        className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-white hover:bg-white/10 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Messages Tab */}
          {activeTab === 'messages' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              <div className="lg:col-span-2 rounded-2xl overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10">
                <div className="p-6 border-b border-white/10">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-emerald-400" />
                    Messages from Parents
                    {getUnreadMessages() > 0 && (
                      <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">{getUnreadMessages()} unread</span>
                    )}
                  </h2>
                </div>
                <div className="divide-y divide-white/10 max-h-[600px] overflow-y-auto">
                  {messages.map((message) => (
                    <div key={message.id} className={`p-6 hover:bg-white/5 transition-colors ${!message.read ? 'bg-blue-500/5' : ''}`}>
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
                            <div>
                              <span className="text-white font-semibold">{message.fromName}</span>
                              <span className={`text-xs ml-2 px-1.5 py-0.5 rounded-full ${
                                message.isParent ? 'bg-green-500/20 text-green-400' : 'bg-purple-500/20 text-purple-400'
                              }`}>
                                {message.isParent ? 'Parent' : 'Admin'}
                              </span>
                            </div>
                            <span className="text-gray-500 text-xs">{message.date}</span>
                          </div>
                          <p className="text-gray-300 text-sm">{message.message}</p>
                          {!message.read && (
                            <span className="inline-block mt-2 text-xs text-blue-400">New</span>
                          )}
                          <div className="flex gap-2 mt-3">
                            <button className="text-xs px-3 py-1 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors">
                              Reply
                            </button>
                            <button className="text-xs px-3 py-1 rounded-lg bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition-colors">
                              View Student Profile
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10">
                <div className="p-6 border-b border-white/10">
                  <h3 className="text-white font-bold">Send Message to Parent</h3>
                  <p className="text-gray-400 text-sm">Communicate with parents about student progress</p>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Select Student</label>
                    <select className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:border-blue-500 outline-none">
                      <option>Adeola K. (SS2 Science)</option>
                      <option>Chidi O. (SS2 Science)</option>
                      <option>Faith A. (SS2 Art)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Subject</label>
                    <input
                      type="text"
                      placeholder="e.g., Mathematics Performance"
                      className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Message</label>
                    <textarea 
                      rows={5}
                      placeholder="Type your message here..."
                      className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-blue-500 outline-none resize-none"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                      <Paperclip className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-400 text-sm">Attach File</span>
                      <input type="file" className="hidden" />
                    </label>
                  </div>
                  <button className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold hover:shadow-xl transition-all flex items-center justify-center gap-2">
                    <Send className="w-4 h-4" />
                    Send Message
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="rounded-2xl overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10 p-6">
                  <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-blue-400" />
                    Grade Distribution
                  </h3>
                  <div className="space-y-3">
                    {[
                      { grade: 'A', count: 8, color: 'bg-green-500' },
                      { grade: 'B', count: 15, color: 'bg-blue-500' },
                      { grade: 'C', count: 10, color: 'bg-yellow-500' },
                      { grade: 'D/F', count: 4, color: 'bg-red-500' },
                    ].map((item) => (
                      <div key={item.grade}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-300">Grade {item.grade}</span>
                          <span className="text-white">{item.count} students</span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${item.color}`}
                            style={{ width: `${(item.count / 37) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10 p-6">
                  <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-400" />
                    Performance Trends
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-300">Class Average Trend</span>
                        <span className="text-green-400">+5%</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2">
                        <div className="h-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-500" style={{ width: '75%' }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-300">Submission Rate</span>
                        <span className="text-blue-400">+8%</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2">
                        <div className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600" style={{ width: '82%' }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-300">Attendance Rate</span>
                        <span className="text-yellow-400">+2%</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2">
                        <div className="h-2 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500" style={{ width: '88%' }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl overflow-hidden bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-xl border border-blue-500/30 p-6">
                <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                  <Brain className="w-5 h-5 text-blue-400" />
                  AI-Powered Recommendations
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5">
                    <div className="w-8 h-8 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                      <AlertTriangle className="w-4 h-4 text-yellow-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium">At-Risk Students Identified</p>
                      <p className="text-gray-300 text-sm">Chidi O., David E. are showing consistent decline in performance. Schedule parent meetings.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5">
                    <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                      <ThumbsUp className="w-4 h-4 text-green-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium">Top Performers</p>
                      <p className="text-gray-300 text-sm">Esther N., Adeola K. are excelling. Consider them for peer tutoring roles.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                      <Target className="w-4 h-4 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium">Suggested Focus Areas</p>
                      <p className="text-gray-300 text-sm">Class needs reinforcement in calculus and organic chemistry concepts.</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Upload Marksheet Modal */}
      <AnimatePresence>
        {showUploadMarksheet && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowUploadMarksheet(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-2xl max-h-[80vh] overflow-y-auto rounded-2xl bg-white/10 backdrop-blur-2xl border border-white/20"
            >
              <div className="p-6 border-b border-white/10">
                <h3 className="text-2xl font-bold text-white">Upload Marksheet</h3>
                <p className="text-gray-400 text-sm">Import student scores from CSV or Excel file</p>
              </div>
              <div className="p-6 space-y-6">
                <div
                  className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
                    isDragging ? 'border-blue-500 bg-blue-500/10' : 'border-white/20 hover:border-blue-500/50'
                  }`}
                  onDragEnter={() => setIsDragging(true)}
                  onDragLeave={() => setIsDragging(false)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    const file = e.dataTransfer.files[0];
                    if (file) handleFileUpload({ target: { files: [file] } } as any);
                  }}
                >
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-white mb-2">Drag & drop your file here</p>
                  <p className="text-gray-400 text-sm mb-4">or</p>
                  <label className="inline-block px-4 py-2 rounded-xl bg-blue-500/20 text-blue-400 text-sm hover:bg-blue-500/30 transition-colors cursor-pointer">
                    Browse Files
                    <input type="file" accept=".csv,.xlsx,.xls" onChange={handleFileUpload} className="hidden" />
                  </label>
                  <p className="text-gray-500 text-xs mt-4">Supports CSV, Excel files. Max 10MB</p>
                </div>

                {marksheetData && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-white font-semibold">Preview: {marksheetData.fileName}</h4>
                      <span className="text-green-400 text-sm">✓ Valid format</span>
                    </div>
                    <div className="rounded-xl overflow-hidden bg-white/5 border border-white/10">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-white/5">
                            <tr className="text-left text-gray-400">
                              <th className="p-3">Name</th>
                              <th className="p-3">Admission No</th>
                              <th className="p-3">Test 1</th>
                              <th className="p-3">Test 2</th>
                              <th className="p-3">Exam</th>
                             </tr>
                          </thead>
                          <tbody className="divide-y divide-white/10">
                            {marksheetData.preview.map((row: any, idx: number) => (
                              <tr key={idx} className="text-gray-300">
                                <td className="p-3">{row.name}</td>
                                <td className="p-3">{row.admissionNo}</td>
                                <td className="p-3">{row.test1}</td>
                                <td className="p-3">{row.test2}</td>
                                <td className="p-3">{row.exam}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span>{marksheetData.rows} rows, {marksheetData.columns} columns detected</span>
                    </div>
                  </motion.div>
                )}

                <div>
                  <label className="block text-gray-400 text-sm mb-2">Select Class</label>
                  <select className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:border-blue-500 outline-none">
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>{c.name} - {c.subject}</option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowUploadMarksheet(false)}
                    className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={!marksheetData}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold hover:shadow-xl transition-all disabled:opacity-50"
                  >
                    Upload & Process
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Student Detail Modal */}
      <AnimatePresence>
        {selectedStudent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setSelectedStudent(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-lg max-h-[80vh] overflow-y-auto rounded-2xl bg-white/10 backdrop-blur-2xl border border-white/20"
            >
              <div className="p-6 border-b border-white/10 bg-gradient-to-r from-blue-600/20 to-indigo-600/20">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl">
                    {selectedStudent.avatar}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">{selectedStudent.name}</h3>
                    <p className="text-gray-300">{selectedStudent.admissionNo}</p>
                  </div>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-white/5 rounded-xl text-center">
                    <p className="text-gray-400 text-sm">Total Score</p>
                    <p className="text-2xl font-bold text-white">{selectedStudent.scores.total || '-'}%</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-xl text-center">
                    <p className="text-gray-400 text-sm">Grade</p>
                    <p className={`text-2xl font-bold ${getGradeColor(selectedStudent.scores.grade || '')}`}>{selectedStudent.scores.grade || '-'}</p>
                  </div>
                </div>
                <div className="p-4 bg-white/5 rounded-xl">
                  <p className="text-gray-400 text-sm mb-2">Performance Breakdown</p>
                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-300">Test 1</span>
                        <span className="text-white">{selectedStudent.scores.test1 || 0}%</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-1.5">
                        <div className="h-1.5 rounded-full bg-blue-500" style={{ width: `${selectedStudent.scores.test1 || 0}%` }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-300">Test 2</span>
                        <span className="text-white">{selectedStudent.scores.test2 || 0}%</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-1.5">
                        <div className="h-1.5 rounded-full bg-purple-500" style={{ width: `${selectedStudent.scores.test2 || 0}%` }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-300">Exam</span>
                        <span className="text-white">{selectedStudent.scores.exam || 0}%</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-1.5">
                        <div className="h-1.5 rounded-full bg-green-500" style={{ width: `${selectedStudent.scores.exam || 0}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-white/5 rounded-xl">
                  <p className="text-gray-400 text-sm mb-2">Parent Contact</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-300 text-sm">{selectedStudent.parentContact}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-300 text-sm">{selectedStudent.parentEmail}</span>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-yellow-500/10 rounded-xl border border-yellow-500/30">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-5 h-5 text-yellow-400" />
                    <p className="text-yellow-400 font-semibold">AI Insight</p>
                  </div>
                  <p className="text-gray-300 text-sm">
                    {selectedStudent.scores.total && selectedStudent.scores.total < 60 
                      ? `${selectedStudent.name} needs additional support in ${selectedClassData?.subject}. Consider scheduling extra help sessions.`
                      : `${selectedStudent.name} is performing well. Continue with current learning strategies.`}
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowMessages(true)}
                    className="flex-1 py-3 rounded-xl bg-blue-500/20 text-blue-400 font-semibold hover:bg-blue-500/30 transition-colors flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Message Parent
                  </button>
                  <button
                    onClick={() => setSelectedStudent(null)}
                    className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
              <div className="p-4 hover:bg-white/5 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="p-1.5 rounded-full bg-blue-500/20">
                    <Bell className="w-3 h-3 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium text-sm">New Assignment Submission</p>
                    <p className="text-gray-400 text-xs mt-1">Adeola K. submitted Algebra Worksheet</p>
                    <p className="text-gray-500 text-xs mt-1">2 hours ago</p>
                  </div>
                </div>
              </div>
              <div className="p-4 hover:bg-white/5 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="p-1.5 rounded-full bg-green-500/20">
                    <MessageCircle className="w-3 h-3 text-green-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium text-sm">New Message from Parent</p>
                    <p className="text-gray-400 text-xs mt-1">Mr. K. (Adeola's Parent) sent a message</p>
                    <p className="text-gray-500 text-xs mt-1">5 hours ago</p>
                  </div>
                </div>
              </div>
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
              <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-r from-orange-500 to-red-600 flex items-center justify-center mb-3">
                <User className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-white font-bold text-lg">{user.name}</h3>
              <p className="text-gray-400 text-sm">Teacher • {schoolName}</p>
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




