'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import PerformanceInsights from '@/app/components/PerformanceInsights';
import { 
  Users, TrendingUp, Award, Calendar, Clock, Download, Eye, ChevronRight,
  Moon, Sun, User, LogOut, Bell, Star, Target, Brain, Settings as SettingsIcon,
  Menu, X, Home, BarChart3, FileText, ChevronDown, Filter, Search, Plus, Edit,
  Trash2, MoreVertical, Mail, Phone, Globe, Shield, Database, Cloud, Server,
  Cpu, Activity, AlertCircle, CheckCircle, XCircle, RefreshCw, Upload,
  Download as DownloadIcon, Printer, Copy, Lock, Unlock, UserCheck, UserX,
  School, BookOpen, CreditCard, Wallet, PieChart, LineChart, Users as UsersIcon,
  GraduationCap, Briefcase, Calendar as CalendarIcon, MessageCircle,
  FileSpreadsheet, Settings, Palette, Layout, Code, Terminal, ShieldCheck, Zap, Sparkles
} from 'lucide-react';
import { useTheme } from '@/components/theme-provider';
import ActionButtons from '@/app/components/ActionButtons';

interface SchoolStats {
  totalStudents: number;
  totalTeachers: number;
  totalStaff: number;
  totalParents: number;
  totalClasses: number;
  totalSubjects: number;
  averageAttendance: number;
  averageScore: number;
  revenue: { total: number; collected: number; pending: number; };
  activeUsers: number;
  systemHealth: number;
}

interface UserData {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'teacher' | 'parent' | 'staff' | 'admin' | 'hod' | 'superadmin' | 'superadmin-assistant';
  status: 'active' | 'inactive' | 'suspended';
  joinDate: string;
  lastLogin: string;
  avatar: string;
}

interface ClassData {
  id: string;
  name: string;
  section: string;
  students: number;
  teacher: string;
  averageScore: number;
  status: 'active' | 'inactive';
}

interface FeeStructure {
  id: string;
  className: string;
  amount: number;
  term: string;
  academicYear: string;
  dueDate: string;
}

interface Activity {
  id: string;
  user: string;
  action: string;
  details: string;
  date: string;
  type: 'user' | 'payment' | 'system' | 'academic';
}

interface SystemLog {
  id: string;
  level: 'info' | 'warning' | 'error';
  message: string;
  source: string;
  timestamp: string;
}

export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null);
  const [schoolName, setSchoolName] = useState('Your School');
  const [editingSchool, setEditingSchool] = useState(false);
  const [tempSchoolName, setTempSchoolName] = useState('');
  const [isSavingSchoolName, setIsSavingSchoolName] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [showAddUser, setShowAddUser] = useState(false);
  const [showUploadMarksheet, setShowUploadMarksheet] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [loadingStats, setLoadingStats] = useState(false);
  const [fetchedStats, setFetchedStats] = useState<SchoolStats | null>(null);
  const [fetchedClasses, setFetchedClasses] = useState<ClassData[]>([]);
  const [fetchedUsers, setFetchedUsers] = useState<UserData[]>([]);
  const [fetchedFeeStructures, setFetchedFeeStructures] = useState<FeeStructure[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [schoolSettings, setSchoolSettings] = useState({
    gradingScale: 'A:70-100,B:50-69,C:0-49',
    assessmentWeights: 'test1:15,test2:15,exam:70',
    academicYear: '2024/2025',
    currentTerm: 'First Term'
  });
  const [loadingSettings, setLoadingSettings] = useState(false);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('classora_token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
  };
  const [showAddFeeStructure, setShowAddFeeStructure] = useState(false);
  
  // Form state for dynamic visibility
  const [selectedAssignmentMethod, setSelectedAssignmentMethod] = useState('');
  const [selectedStudentMethod, setSelectedStudentMethod] = useState('');
  const [selectedParentMethod, setSelectedParentMethod] = useState('');

  // Add user form state
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'student' as 'student' | 'teacher' | 'parent' | 'staff',
    password: ''
  });
  const [isCreatingUser, setIsCreatingUser] = useState(false);

  // Edit user form state
  const [showEditUser, setShowEditUser] = useState(false);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [editUserForm, setEditUserForm] = useState({
    name: '',
    email: '',
    role: 'student' as 'student' | 'teacher' | 'parent' | 'staff',
    password: '',
    studentId: '',
    staffId: '',
    classId: '',
    phone: '',
    status: 'active' as 'active' | 'inactive'
  });
  const [isUpdatingUser, setIsUpdatingUser] = useState(false);
  const [availableClasses, setAvailableClasses] = useState<any[]>([]);

  const defaultStats: SchoolStats = {
    totalStudents: 0, totalTeachers: 0, totalStaff: 0, totalParents: 0,
    totalClasses: 0, totalSubjects: 0, averageAttendance: 0, averageScore: 0,
    revenue: { total: 0, collected: 0, pending: 0 },
    activeUsers: 0, systemHealth: 100
  };

  const stats = fetchedStats || defaultStats;

  const fetchStats = async () => {
    if (!user?.schoolId) return;

    setLoadingStats(true);
    try {
      // Fetch classes for stats
      const classesResponse = await fetch(`/api/classes?schoolId=${user.schoolId}`, {
        headers: { ...getAuthHeaders(), 'Cache-Control': 'no-cache' }
      });
      const classesData = classesResponse.ok ? await classesResponse.json() : [];

      // Fetch users for stats
      const usersResponse = await fetch(`/api/users?schoolId=${user.schoolId}`, {
        headers: { ...getAuthHeaders(), 'Cache-Control': 'no-cache' }
      });
      const usersData = usersResponse.ok ? await usersResponse.json() : [];

      // Calculate stats from API data
      const totalStudents = Array.isArray(usersData) ? usersData.filter((u: any) => u.role === 'student').length : 0;
      const totalTeachers = Array.isArray(usersData) ? usersData.filter((u: any) => u.role === 'teacher').length : 0;
      const totalStaff = Array.isArray(usersData) ? usersData.filter((u: any) => u.role === 'staff').length : 0;
      const totalParents = Array.isArray(usersData) ? usersData.filter((u: any) => u.role === 'parent').length : 0;
      const totalClasses = Array.isArray(classesData) ? classesData.length : 0;

      // Transform classes data
      const transformedClasses = classesData.map((cls: any) => ({
        id: cls.id,
        name: cls.name,
        section: cls.section,
        students: cls.enrollments?.length || 0,
        teacher: cls.teacher?.name || 'Not Assigned',
        averageScore: 0, // We'll need to calculate this from marks
        status: cls.isActive ? 'active' : 'inactive'
      }));

      // Transform users data
      const transformedUsers = usersData.map((u: any) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        status: u.isActive ? 'active' : 'inactive',
        joinDate: new Date(u.createdAt).toLocaleDateString(),
        lastLogin: u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : 'Never',
        avatar: u.name.split(' ').map((n: string) => n[0]).join('')
      }));

      setFetchedStats({
        totalStudents,
        totalTeachers,
        totalStaff,
        totalParents,
        totalClasses,
        totalSubjects: 0, // We'll need a subjects API
        averageAttendance: 0, // We'll need to calculate this
        averageScore: 0, // We'll need to calculate this
        revenue: { total: 0, collected: 0, pending: 0 }, // We'll need a payments API
        activeUsers: usersData.filter((u: any) => u.isActive).length,
        systemHealth: 100
      });

      setFetchedClasses(transformedClasses);
      setFetchedUsers(transformedUsers);

    } catch (error) {
      console.error('Error fetching admin stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchFeeStructures = async () => {
    if (!user?.schoolId) return;

    try {
      const response = await fetch('/api/fee-structures', {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const feeStructuresData = await response.json();
        const transformedFeeStructures = feeStructuresData.map((fs: any) => ({
          id: fs.id,
          className: fs.class ? `${fs.class.name} ${fs.class.section}` : fs.student ? fs.student.name : 'All Classes',
          amount: fs.amount,
          term: fs.term,
          academicYear: fs.academicYear,
          dueDate: new Date(fs.dueDate).toLocaleDateString()
        }));
        setFetchedFeeStructures(transformedFeeStructures);
      }
    } catch (error) {
      console.error('Error fetching fee structures:', error);
    }
  };

  const users: UserData[] = fetchedUsers;

  const classes: ClassData[] = fetchedClasses;

  const feeStructure: FeeStructure[] = fetchedFeeStructures;

  const activities: Activity[] = [];

  const systemLogs: SystemLog[] = [];

  useEffect(() => {
    setMounted(true);
    const savedUser = localStorage.getItem('classora_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    } else {
      window.location.href = '/';
    }
  }, []);

  useEffect(() => {
    if (user?.schoolId) {
      try {
        fetchSchoolInfo().catch(err => console.error('School info:', err));
        fetchSchoolSettings().catch(err => console.error('Settings:', err));
        fetchStats().catch(err => console.error('Stats:', err));
        fetchFeeStructures().catch(err => console.error('Fees:', err));
      } catch (error) {
        console.error('Dashboard init:', error);
      }
    }
  }, [user?.schoolId]);

  const fetchSchoolInfo = async () => {
    if (user?.schoolId) {
      try {
        const response = await fetch(`/api/school?schoolId=${user.schoolId}`, {
          headers: { ...getAuthHeaders(), 'Cache-Control': 'no-cache' }
        });
        if (response.ok) {
          const school = await response.json();
          setSchoolName(school.name);
          localStorage.setItem('classora_school_name', school.name);
        }
      } catch (error) {
        console.error('Failed to fetch school info:', error);
      }
    }
  };

  const fetchSchoolSettings = async () => {
    if (user?.schoolId) {
      setLoadingSettings(true);
      try {
        const response = await fetch(`/api/school/settings?schoolId=${user.schoolId}`, {
          headers: getAuthHeaders()
        });
        if (response.ok) {
          const settings = await response.json();
          setSchoolSettings(settings);
        }
      } catch (error) {
        console.error('Failed to fetch school settings:', error);
      } finally {
        setLoadingSettings(false);
      }
    }
  };

  const saveSchoolSettings = async (newSettings: Partial<typeof schoolSettings>) => {
    if (user?.schoolId) {
      setLoadingSettings(true);
      try {
        const response = await fetch(`/api/school/settings?schoolId=${user.schoolId}`, {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify(newSettings)
        });
        if (response.ok) {
          const updatedSettings = await response.json();
          setSchoolSettings(updatedSettings);
          setErrorMessage('');
        } else {
          const error = await response.json();
          setErrorMessage(error.error || 'Failed to update school settings');
        }
      } catch (error) {
        console.error('Failed to save school settings:', error);
        setErrorMessage('Failed to save school settings');
      } finally {
        setLoadingSettings(false);
      }
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/';
  };

  const saveSchoolName = async () => {
    const nameToSave = editingSchool ? tempSchoolName.trim() : schoolName.trim();
    if (!nameToSave || !user?.schoolId) {
      setErrorMessage('School name cannot be empty.');
      return;
    }

    console.log('Save button clicked');
    setIsSavingSchoolName(true);

    try {
      const response = await fetch(`/api/settings/school?schoolId=${user.schoolId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ name: nameToSave })
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      if (response.ok) {
        setSchoolName(nameToSave);
        localStorage.setItem('classora_school_name', nameToSave);
        setEditingSchool(false);
        setErrorMessage('');
        alert('School name saved successfully!');
      } else {
        const message = data.error || 'Failed to update school name';
        setErrorMessage(message);
        alert('Error: ' + message);
      }
    } catch (error) {
      console.error('Failed to update school name:', error);
      const message = (error as Error).message || 'Network error while updating school name';
      setErrorMessage(message);
      alert('Failed to save: ' + message);
    } finally {
      setIsSavingSchoolName(false);
    }
  };

  const handleAddUser = async () => {
    if (!newUser.name.trim() || !newUser.email.trim() || !newUser.password.trim() || !user?.schoolId) {
      alert('Please fill in all required fields (name, email, password).');
      return;
    }

    setIsCreatingUser(true);
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          ...newUser,
          schoolId: user.schoolId
        })
      });

      const data = await response.json();

      if (response.ok) {
        setNewUser({ name: '', email: '', role: 'student', password: '' });
        setShowAddUser(false);
        alert('User created successfully!');
        // Refresh the stats to show the new user
        fetchStats();
      } else {
        alert(data.error || 'Failed to create user');
      }
    } catch (error) {
      console.error('Create user error:', error);
      alert('Failed to create user');
    } finally {
      setIsCreatingUser(false);
    }
  };

  const handleEditUser = (userData: UserData) => {
    setEditingUser(userData);
    setEditUserForm({
      name: userData.name,
      email: userData.email,
      role: (userData.role as any) || 'student',
      password: '',
      studentId: '',
      staffId: '',
      classId: '',
      phone: '',
      status: (userData.status === 'suspended' ? 'inactive' : userData.status) as 'active' | 'inactive'
    });

    // Fetch available classes for the school
    if (user?.schoolId) {
      fetch(`/api/classes/list?schoolId=${user.schoolId}`, {
        headers: getAuthHeaders()
      })
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setAvailableClasses(data);
          }
        })
        .catch(err => console.error('Failed to fetch classes:', err));
    }

    setShowEditUser(true);
  };

  const handleUpdateUser = async () => {
    if (!editingUser || !editUserForm.name.trim() || !editUserForm.email.trim()) {
      alert('Please fill in required fields (name, email).');
      return;
    }

    setIsUpdatingUser(true);
    try {
      const updateData: any = {
        name: editUserForm.name,
        email: editUserForm.email,
        role: editUserForm.role,
        phone: editUserForm.phone || null,
        isActive: editUserForm.status === 'active'
      };

      // Add password if provided
      if (editUserForm.password.trim()) {
        updateData.password = editUserForm.password;
      }

      // Add role-specific fields
      if (editUserForm.role === 'student' && editUserForm.studentId) {
        updateData.studentId = editUserForm.studentId;
      }
      if ((editUserForm.role === 'teacher' || editUserForm.role === 'staff') && editUserForm.staffId) {
        updateData.staffId = editUserForm.staffId;
      }

      // Add class assignment for students
      if (editUserForm.role === 'student' && editUserForm.classId) {
        updateData.classId = editUserForm.classId;
      }

      const response = await fetch(`/api/users/${editingUser.id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updateData)
      });

      const data = await response.json();

      if (response.ok) {
        setShowEditUser(false);
        setEditingUser(null);
        alert('User updated successfully!');
        fetchStats();
      } else {
        alert(data.error || 'Failed to update user');
      }
    } catch (error) {
      console.error('Update user error:', error);
      alert('Failed to update user');
    } finally {
      setIsUpdatingUser(false);
    }
  };

  const getRoleColor = (role: string) => {
    switch(role) {
      case 'student': return 'text-blue-400 bg-blue-500/20';
      case 'teacher': return 'text-orange-400 bg-orange-500/20';
      case 'parent': return 'text-emerald-400 bg-emerald-500/20';
      case 'staff': return 'text-purple-400 bg-purple-500/20';
      case 'admin': return 'text-red-400 bg-red-500/20';
      case 'hod': return 'text-indigo-400 bg-indigo-500/20';
      case 'superadmin': return 'text-sky-400 bg-sky-500/20';
      case 'superadmin-assistant': return 'text-violet-400 bg-violet-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getStatusColor = (status: string) => {
    if (status === 'active') return 'text-green-400 bg-green-500/20';
    if (status === 'inactive') return 'text-yellow-400 bg-yellow-500/20';
    return 'text-red-400 bg-red-500/20';
  };

  const getLogLevelColor = (level: string) => {
    if (level === 'info') return 'text-blue-400 bg-blue-500/20';
    if (level === 'warning') return 'text-yellow-400 bg-yellow-500/20';
    return 'text-red-400 bg-red-500/20';
  };

  if (!mounted || !user) return null;
  if (user.role !== 'admin' && user.role !== 'superadmin' && user.role !== 'superadmin-assistant') { window.location.href = '/'; return null; }

  // Show loading state while fetching initial data
  if (loadingStats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
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
                  { id: 'users', icon: Users, label: 'User Management' },
                  { id: 'academics', icon: BookOpen, label: 'Academics' },
                  { id: 'finance', icon: Wallet, label: 'Finance' },
                  { id: 'settings', icon: Settings, label: 'Settings' },
                  { id: 'system', icon: Server, label: 'System' },
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
                <Link href="/dashboard/admin/management">
                  <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-purple-400 hover:bg-purple-500/20 border border-purple-500/30 mt-2">
                    <Settings className="w-5 h-5" />
                    <span>School Management</span>
                  </button>
                </Link>
                <Link href="/dashboard/admin/results">
                  <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-green-400 hover:bg-green-500/20 border border-green-500/30 mt-2">
                    <FileText className="w-5 h-5" />
                    <span>Result Portal</span>
                  </button>
                </Link>
                <Link href="/dashboard/forum">
                  <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-pink-400 hover:bg-pink-500/20 border border-pink-500/30 mt-2">
                    <MessageCircle className="w-5 h-5" />
                    <span>Community Forum</span>
                  </button>
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Animated Background */}
      <div className="fixed inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-red-500/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-float-delayed" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl animate-pulse-slow" />
      </div>

      {/* Header */}
      <div className="relative z-10">
        <div className="bg-white/5 backdrop-blur-xl border-b border-white/10 sticky top-0 z-20">
          <div className="container mx-auto px-4 sm:px-6 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3 md:gap-4">
                <button onClick={() => setMobileMenuOpen(true)} className="p-2 rounded-lg bg-white/5 md:hidden">
                  <Menu className="w-5 h-5 text-white" />
                </button>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">C</span>
                  </div>
                  <span className="text-white font-semibold hidden sm:inline">Classora</span>
                  <span className="text-white/30 hidden sm:inline">•</span>
                  {editingSchool ? (
                    <div className="flex items-center gap-2">
                      <input type="text" value={tempSchoolName} onChange={(e) => setTempSchoolName(e.target.value)} className="bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-white text-sm outline-none focus:border-blue-500" autoFocus onKeyPress={(e) => e.key === 'Enter' && saveSchoolName()} />
                      <button onClick={saveSchoolName} className="text-green-400 text-xs">Save</button>
                      <button onClick={() => setEditingSchool(false)} className="text-red-400 text-xs">Cancel</button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-white/80 text-sm">{schoolName}</span>
                      <button onClick={() => setEditingSchool(true)} className="text-gray-400 hover:text-white"><Edit className="w-3 h-3" /></button>
                    </div>
                  )}
                  {errorMessage && <div className="text-red-400 text-xs mt-1">{errorMessage}</div>}
                </div>
                <div className="hidden md:flex items-center gap-1 ml-6">
                  {[
                    { id: 'overview', label: 'Overview' },
                    { id: 'users', label: 'Users' },
                    { id: 'academics', label: 'Academics' },
                    { id: 'finance', label: 'Finance' },
                    { id: 'settings', label: 'Settings' },
                    { id: 'system', label: 'System' },
                  ].map((item) => (
                    <button key={item.id} onClick={() => setActiveTab(item.id)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === item.id ? 'bg-blue-500/20 text-blue-400' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
                      {item.label}
                    </button>
                  ))}
                  <Link href="/dashboard/admin/management">
                    <button className="px-4 py-2 rounded-lg text-sm font-medium transition-all bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 ml-2">
                      School Mgmt
                    </button>
                  </Link>
                  <Link href="/dashboard/admin/results">
                    <button className="px-4 py-2 rounded-lg text-sm font-medium transition-all bg-green-500/20 text-green-400 hover:bg-green-500/30 ml-2">
                      Results
                    </button>
                  </Link>
                  <Link href="/dashboard/forum">
                    <button className="px-4 py-2 rounded-lg text-sm font-medium transition-all bg-pink-500/20 text-pink-400 hover:bg-pink-500/30 ml-2">
                      Forum
                    </button>
                  </Link>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-4">
                <button onClick={() => setShowNotifications(!showNotifications)} className="relative p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors">
                  <Bell className="w-5 h-5 text-white/70" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                </button>
                <button onClick={toggleTheme} className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors">
                  {theme === 'light' ? <Moon className="w-5 h-5 text-white/70" /> : <Sun className="w-5 h-5 text-yellow-400" />}
                </button>
                <button onClick={() => setShowProfile(!showProfile)} className="flex items-center gap-2 md:gap-3 pl-2 md:pl-4 border-l border-white/10">
                  <div className="text-right hidden sm:block">
                    <p className="text-white font-semibold text-sm">{user.name}</p>
                    <p className="text-white/50 text-xs">Administrator</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-red-500 to-pink-600 flex items-center justify-center">
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
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Welcome back, {user.name}! 👑</h1>
            <p className="text-gray-400 text-sm sm:text-base">Manage your school, monitor performance, and configure settings</p>
          </motion.div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6 sm:space-y-8">
              {/* Key Stats Grid */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <div className="relative rounded-2xl overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10 p-4 sm:p-6">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/20 rounded-full blur-2xl" />
                  <div className="relative">
                    <div className="flex items-center justify-between mb-3 sm:mb-4"><div className="p-2 sm:p-3 rounded-xl bg-blue-500/20"><GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" /></div><span className="text-xl sm:text-2xl font-bold text-white">{stats.totalStudents}</span></div>
                    <p className="text-gray-400 text-xs sm:text-sm">Total Students</p>
                    <p className="text-white/60 text-xs mt-1">+12 this month</p>
                  </div>
                </div>
                <div className="relative rounded-2xl overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10 p-4 sm:p-6">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-orange-500/20 rounded-full blur-2xl" />
                  <div className="relative">
                    <div className="flex items-center justify-between mb-3 sm:mb-4"><div className="p-2 sm:p-3 rounded-xl bg-orange-500/20"><Users className="w-5 h-5 sm:w-6 sm:h-6 text-orange-400" /></div><span className="text-xl sm:text-2xl font-bold text-white">{stats.totalTeachers}</span></div>
                    <p className="text-gray-400 text-xs sm:text-sm">Total Teachers</p>
                    <p className="text-white/60 text-xs mt-1">+3 this month</p>
                  </div>
                </div>
                <div className="relative rounded-2xl overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10 p-4 sm:p-6">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/20 rounded-full blur-2xl" />
                  <div className="relative">
                    <div className="flex items-center justify-between mb-3 sm:mb-4"><div className="p-2 sm:p-3 rounded-xl bg-green-500/20"><Wallet className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" /></div><span className="text-xl sm:text-2xl font-bold text-white">₦{(stats.revenue.collected / 1000000).toFixed(1)}M</span></div>
                    <p className="text-gray-400 text-xs sm:text-sm">Revenue Collected</p>
                    <p className="text-white/60 text-xs mt-1">86% of total</p>
                  </div>
                </div>
                <div className="relative rounded-2xl overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10 p-4 sm:p-6">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/20 rounded-full blur-2xl" />
                  <div className="relative">
                    <div className="flex items-center justify-between mb-3 sm:mb-4"><div className="p-2 sm:p-3 rounded-xl bg-purple-500/20"><Activity className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" /></div><span className="text-xl sm:text-2xl font-bold text-white">{stats.systemHealth}%</span></div>
                    <p className="text-gray-400 text-xs sm:text-sm">System Health</p>
                    <p className="text-white/60 text-xs mt-1">All systems operational</p>
                  </div>
                </div>
              </motion.div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                <button onClick={() => setShowUploadMarksheet?.(true)} className="rounded-2xl overflow-hidden bg-gradient-to-r from-blue-600/20 to-indigo-600/20 backdrop-blur-xl border border-blue-500/30 p-6 text-center hover:scale-105 transition-transform">
                  <Upload className="w-8 h-8 text-blue-400 mx-auto mb-3" />
                  <h3 className="text-white font-semibold">Upload Marksheet</h3>
                  <p className="text-gray-400 text-sm mt-1">Import student scores</p>
                </button>

                <Link href="/dashboard/admin/management">
                  <div className="rounded-2xl overflow-hidden bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-xl border border-purple-500/30 p-6 text-center hover:scale-105 transition-transform cursor-pointer">
                    <Settings className="w-8 h-8 text-purple-400 mx-auto mb-3" />
                    <h3 className="text-white font-semibold">School Management</h3>
                    <p className="text-gray-400 text-sm mt-1">Manage classes, subjects, teachers and students</p>
                  </div>
                </Link>

                <Link href="/dashboard/admin/results">
                  <div className="rounded-2xl overflow-hidden bg-gradient-to-r from-green-600/20 to-emerald-600/20 backdrop-blur-xl border border-green-500/30 p-6 text-center hover:scale-105 transition-transform cursor-pointer">
                    <FileText className="w-8 h-8 text-green-400 mx-auto mb-3" />
                    <h3 className="text-white font-semibold">Result Portal</h3>
                    <p className="text-gray-400 text-sm mt-1">Manage student results and report cards</p>
                  </div>
                </Link>

                <Link href="/dashboard/forum">
                  <div className="rounded-2xl overflow-hidden bg-gradient-to-r from-pink-600/20 to-rose-600/20 backdrop-blur-xl border border-pink-500/30 p-6 text-center hover:scale-105 transition-transform cursor-pointer">
                    <MessageCircle className="w-8 h-8 text-pink-400 mx-auto mb-3" />
                    <h3 className="text-white font-semibold">Community Forum</h3>
                    <p className="text-gray-400 text-sm mt-1">Parent-Teacher discussions</p>
                  </div>
                </Link>

                <button onClick={() => setActiveTab('messages')} className="rounded-2xl overflow-hidden bg-gradient-to-r from-emerald-600/20 to-teal-600/20 backdrop-blur-xl border border-emerald-500/30 p-6 text-center hover:scale-105 transition-transform">
                  <MessageCircle className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
                  <h3 className="text-white font-semibold">Message Parents</h3>
                  <p className="text-gray-400 text-sm mt-1">Communicate with parents</p>
                </button>
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="rounded-2xl overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10 p-6">
                  <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2"><PieChart className="w-5 h-5 text-blue-400" />Performance Overview</h3>
                  <div className="space-y-4">
                    <div><div className="flex justify-between text-sm mb-2"><span className="text-gray-300">Average Score</span><span className="text-white">{stats.averageScore}%</span></div><div className="w-full bg-white/10 rounded-full h-2"><div className="h-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-500" style={{ width: `${stats.averageScore}%` }} /></div></div>
                    <div><div className="flex justify-between text-sm mb-2"><span className="text-gray-300">Attendance Rate</span><span className="text-white">{stats.averageAttendance}%</span></div><div className="w-full bg-white/10 rounded-full h-2"><div className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600" style={{ width: `${stats.averageAttendance}%` }} /></div></div>
                  </div>
                </div>
                <div className="rounded-2xl overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10 p-6">
                  <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2"><LineChart className="w-5 h-5 text-green-400" />Revenue Overview</h3>
                  <div className="space-y-4">
                    <div><div className="flex justify-between text-sm mb-2"><span className="text-gray-300">Total Revenue</span><span className="text-white">₦{(stats.revenue.total / 1000000).toFixed(1)}M</span></div><div className="w-full bg-white/10 rounded-full h-2"><div className="h-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-500" style={{ width: `100%` }} /></div></div>
                    <div><div className="flex justify-between text-sm mb-2"><span className="text-gray-300">Collected</span><span className="text-white">₦{(stats.revenue.collected / 1000000).toFixed(1)}M</span></div><div className="w-full bg-white/10 rounded-full h-2"><div className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600" style={{ width: `${(stats.revenue.collected / stats.revenue.total) * 100}%` }} /></div></div>
                    <div><div className="flex justify-between text-sm mb-2"><span className="text-gray-300">Pending</span><span className="text-yellow-400">₦{(stats.revenue.pending / 1000000).toFixed(1)}M</span></div><div className="w-full bg-white/10 rounded-full h-2"><div className="h-2 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500" style={{ width: `${(stats.revenue.pending / stats.revenue.total) * 100}%` }} /></div></div>
                  </div>
                </div>
              </div>

              {/* Recent Activities & System Status */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="rounded-2xl overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10">
                  <div className="p-6 border-b border-white/10"><h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2"><Activity className="w-5 h-5 text-purple-400" />Recent Activities</h2></div>
                  <div className="divide-y divide-white/10 max-h-96 overflow-y-auto">
                    {activities.map((activity) => (
                      <div key={activity.id} className="p-4 hover:bg-white/5 transition-colors">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${activity.type === 'user' ? 'bg-blue-500/20' : activity.type === 'payment' ? 'bg-green-500/20' : 'bg-purple-500/20'}`}>
                            {activity.type === 'user' && <User className="w-4 h-4 text-blue-400" />}
                            {activity.type === 'payment' && <Wallet className="w-4 h-4 text-green-400" />}
                            {activity.type === 'system' && <Server className="w-4 h-4 text-purple-400" />}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between flex-wrap gap-2">
                              <p className="text-white font-medium text-sm">{activity.action}</p>
                              <span className="text-gray-500 text-xs">{activity.date}</span>
                            </div>
                            <p className="text-gray-400 text-xs mt-1">{activity.details}</p>
                            <p className="text-gray-500 text-xs mt-1">By: {activity.user}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-2xl overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10">
                  <div className="p-6 border-b border-white/10"><h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2"><Server className="w-5 h-5 text-cyan-400" />System Status</h2></div>
                  <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between"><span className="text-gray-300">API Server</span><span className="text-green-400 flex items-center gap-1"><CheckCircle className="w-4 h-4" /> Operational</span></div>
                    <div className="flex items-center justify-between"><span className="text-gray-300">Database</span><span className="text-green-400 flex items-center gap-1"><CheckCircle className="w-4 h-4" /> Operational</span></div>
                    <div className="flex items-center justify-between"><span className="text-gray-300">AI Service</span><span className="text-green-400 flex items-center gap-1"><CheckCircle className="w-4 h-4" /> Operational</span></div>
                    <div className="flex items-center justify-between"><span className="text-gray-300">Offline Sync</span><span className="text-yellow-400 flex items-center gap-1"><AlertCircle className="w-4 h-4" /> Partial Outage</span></div>
                    <div className="flex items-center justify-between"><span className="text-gray-300">Last Backup</span><span className="text-gray-300">Today, 03:00 AM</span></div>
                  </div>
                </div>
              </div>

              {/* AI Admin Insight - Only show when school has data */}
              {stats.totalStudents > 0 && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="rounded-2xl overflow-hidden bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-xl border border-blue-500/30 p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3"><div className="p-2 sm:p-3 rounded-xl bg-blue-500/20"><Brain className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" /></div><div><h3 className="text-white font-semibold text-base sm:text-lg">AI Admin Assistant</h3><p className="text-gray-300 text-sm">Strategic insights for school management</p></div></div>
                    <div className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-yellow-400" /><span className="text-yellow-400 text-sm font-medium">AI Powered</span></div>
                  </div>
                  <div className="mt-4 space-y-3">
                    <p className="text-gray-300 text-sm sm:text-base">📊 Student enrollment increased by 12% this month. Projected growth: 8% next month.</p>
                    <p className="text-gray-300 text-sm sm:text-base">💰 Outstanding fees: ₦3.5M. Send automated reminders to 45 parents with pending payments.</p>
                    <p className="text-gray-300 text-sm sm:text-base">🎓 Top performing class: SS3 Science (78% average). Needs recognition.</p>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button className="px-3 py-1.5 rounded-lg bg-blue-500/20 text-blue-400 text-sm hover:bg-blue-500/30 transition-colors">Generate Report</button>
                    <button className="px-3 py-1.5 rounded-lg bg-purple-500/20 text-purple-400 text-sm hover:bg-purple-500/30 transition-colors">Send Reminders</button>
                    <button className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 text-sm hover:bg-emerald-500/30 transition-colors">Export Data</button>
                  </div>
                </motion.div>
              )}
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="text" placeholder="Search users..." className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-blue-500 outline-none text-sm" />
                </div>
                <button onClick={() => setShowAddUser(true)} className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-medium hover:shadow-xl transition-all flex items-center gap-2 justify-center">
                  <Plus className="w-4 h-4" />Add New User
                </button>
              </div>
              <div className="rounded-2xl overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b border-white/10">
                      <tr className="text-left text-gray-400 text-sm">
                        <th className="p-4">User</th>
                        <th className="p-4">Email</th>
                        <th className="p-4">Role</th>
                        <th className="p-4">Status</th>
                        <th className="p-4">Join Date</th>
                        <th className="p-4">Last Login</th>
                        <th className="p-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {users.map((userItem) => (
                        <tr key={userItem.id} className="hover:bg-white/5 transition-colors cursor-pointer" onClick={() => setSelectedUser(userItem)}>
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs">
                                {userItem.avatar}
                              </div>
                              <span className="text-white text-sm">{userItem.name}</span>
                            </div>
                           </td>
                          <td className="p-4 text-gray-300 text-sm">{userItem.email}</td>
                          <td className="p-4">
                            <span className={`text-xs px-2 py-1 rounded-full ${getRoleColor(userItem.role)}`}>
                              {userItem.role}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(userItem.status)}`}>
                              {userItem.status}
                            </span>
                          </td>
                          <td className="p-4 text-gray-300 text-sm">{userItem.joinDate}</td>
                          <td className="p-4 text-gray-300 text-sm">{userItem.lastLogin}</td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              {userItem.role === 'student' && (
                                <a 
                                  href={`/dashboard/student/profile?studentId=${userItem.id}`}
                                  onClick={(e) => e.stopPropagation()}
                                  className="p-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors"
                                  title="View Profile"
                                >
                                  <Eye className="w-4 h-4" />
                                </a>
                              )}
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditUser(userItem);
                                }}
                                className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30 transition-colors"
                                title="Edit User"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
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
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-4 text-center">
                  <p className="text-2xl font-bold text-white">{stats.totalStudents}</p>
                  <p className="text-gray-400 text-sm">Students</p>
                </div>
                <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-4 text-center">
                  <p className="text-2xl font-bold text-white">{stats.totalTeachers}</p>
                  <p className="text-gray-400 text-sm">Teachers</p>
                </div>
                <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-4 text-center">
                  <p className="text-2xl font-bold text-white">{stats.totalParents}</p>
                  <p className="text-gray-400 text-sm">Parents</p>
                </div>
                <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-4 text-center">
                  <p className="text-2xl font-bold text-white">{stats.totalStaff}</p>
                  <p className="text-gray-400 text-sm">Staff</p>
                </div>
              </div>
            </div>
          )}

          {/* Academics Tab */}
          {activeTab === 'academics' && (
            <div className="rounded-2xl overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10">
              <div className="p-6 border-b border-white/10 flex justify-between items-center flex-wrap gap-4">
                <h2 className="text-xl font-bold text-white">Classes & Sections</h2>
                <button className="px-4 py-2 rounded-xl bg-blue-500/20 text-blue-400 text-sm hover:bg-blue-500/30 transition-colors flex items-center gap-2">
                  <Plus className="w-4 h-4" />Add Class
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-white/10">
                    <tr className="text-left text-gray-400 text-sm">
                      <th className="p-4">Class</th>
                      <th className="p-4">Section</th>
                      <th className="p-4">Students</th>
                      <th className="p-4">Teacher</th>
                      <th className="p-4">Average Score</th>
                      <th className="p-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {classes.map((classItem) => (
                      <tr key={classItem.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-4 text-white font-medium">{classItem.name}</td>
                        <td className="p-4 text-gray-300">{classItem.section}</td>
                        <td className="p-4 text-gray-300">{classItem.students}</td>
                        <td className="p-4 text-gray-300">{classItem.teacher}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <span className="text-white">{classItem.averageScore}%</span>
                            <div className="w-16 bg-white/10 rounded-full h-1.5">
                              <div className="h-1.5 rounded-full bg-green-500" style={{ width: `${classItem.averageScore}%` }} />
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`text-xs px-2 py-1 rounded-full ${classItem.status === 'active' ? 'text-green-400 bg-green-500/20' : 'text-red-400 bg-red-500/20'}`}>
                            {classItem.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Finance Tab */}
          {activeTab === 'finance' && (
            <div className="rounded-2xl overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10">
              <div className="p-6 border-b border-white/10 flex justify-between items-center flex-wrap gap-4">
                <h2 className="text-xl font-bold text-white">Fee Structure</h2>
                <button
                  onClick={() => setShowAddFeeStructure(true)}
                  className="px-4 py-2 rounded-xl bg-blue-500/20 text-blue-400 text-sm hover:bg-blue-500/30 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />Add Fee Structure
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-white/10">
                    <tr className="text-left text-gray-400 text-sm">
                      <th className="p-4">Class</th>
                      <th className="p-4">Term</th>
                      <th className="p-4">Amount</th>
                      <th className="p-4">Academic Year</th>
                      <th className="p-4">Due Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {feeStructure.map((fee) => (
                      <tr key={fee.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-4 text-white">{fee.className}</td>
                        <td className="p-4 text-gray-300">{fee.term}</td>
                        <td className="p-4 text-white">₦{fee.amount.toLocaleString()}</td>
                        <td className="p-4 text-gray-300">{fee.academicYear}</td>
                        <td className="p-4 text-gray-300">{fee.dueDate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="rounded-2xl overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10 p-6">
                <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2"><School className="w-5 h-5 text-blue-400" />School Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">School Name</label>
                    <div className="flex items-center gap-2">
                      <input type="text" value={schoolName} onChange={(e) => setSchoolName(e.target.value)} className="flex-1 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:border-blue-500 outline-none" />
                      <button type="button" onClick={saveSchoolName} disabled={isSavingSchoolName} className="px-4 py-2 rounded-xl bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors disabled:opacity-50">
                        {isSavingSchoolName ? 'Saving...' : 'Save'}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">School Email</label>
                    <input type="email" defaultValue="info@school.com" className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:border-blue-500 outline-none" />
                  </div>
                </div>
              </div>
              <div className="rounded-2xl overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10 p-6">
                <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2"><Award className="w-5 h-5 text-purple-400" />Grading System</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Grading Scale (format: A:70-100,B:50-69,C:0-49)</label>
                    <input 
                      type="text" 
                      value={schoolSettings.gradingScale} 
                      onChange={(e) => setSchoolSettings(prev => ({ ...prev, gradingScale: e.target.value }))}
                      className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:border-blue-500 outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Assessment Weights (format: test1:15,test2:15,exam:70)</label>
                    <input 
                      type="text" 
                      value={schoolSettings.assessmentWeights} 
                      onChange={(e) => setSchoolSettings(prev => ({ ...prev, assessmentWeights: e.target.value }))}
                      className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:border-blue-500 outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Academic Year</label>
                    <input 
                      type="text" 
                      value={schoolSettings.academicYear} 
                      onChange={(e) => setSchoolSettings(prev => ({ ...prev, academicYear: e.target.value }))}
                      className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:border-blue-500 outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Current Term</label>
                    <input 
                      type="text" 
                      value={schoolSettings.currentTerm} 
                      onChange={(e) => setSchoolSettings(prev => ({ ...prev, currentTerm: e.target.value }))}
                      className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:border-blue-500 outline-none" 
                    />
                  </div>
                  <button 
                    onClick={() => saveSchoolSettings(schoolSettings)}
                    disabled={loadingSettings}
                    className="w-full px-4 py-2 rounded-xl bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition-colors disabled:opacity-50"
                  >
                    {loadingSettings ? 'Saving...' : 'Save Settings'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* System Tab */}
          {activeTab === 'system' && (
            <div className="rounded-2xl overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10">
              <div className="p-6 border-b border-white/10">
                <h2 className="text-xl font-bold text-white flex items-center gap-2"><Terminal className="w-5 h-5 text-cyan-400" />System Logs</h2>
              </div>
              <div className="divide-y divide-white/10 max-h-96 overflow-y-auto">
                {systemLogs.map((log) => (
                  <div key={log.id} className="p-4 hover:bg-white/5 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className={`p-1.5 rounded-full ${getLogLevelColor(log.level)}`}>
                        {log.level === 'info' && <CheckCircle className="w-3 h-3" />}
                        {log.level === 'warning' && <AlertCircle className="w-3 h-3" />}
                        {log.level === 'error' && <XCircle className="w-3 h-3" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-medium text-sm">{log.message}</p>
                        <p className="text-gray-400 text-xs mt-1">Source: {log.source} • {log.timestamp}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* User Detail Modal */}
      <AnimatePresence>
        {selectedUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setSelectedUser(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md rounded-2xl bg-white/10 backdrop-blur-2xl border border-white/20 p-6"
            >
              <h3 className="text-xl font-bold text-white mb-4">{selectedUser.name}</h3>
              <p className="text-gray-300">Role: {selectedUser.role}</p>
              <p className="text-gray-300">Email: {selectedUser.email}</p>
              <button onClick={() => setSelectedUser(null)} className="mt-4 px-4 py-2 rounded-xl bg-white/10 text-white">Close</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add User Modal */}
      <AnimatePresence>
        {showAddUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowAddUser(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md rounded-2xl bg-white/10 backdrop-blur-2xl border border-white/20 p-6"
            >
              <h3 className="text-xl font-bold text-white mb-4">Add New User</h3>
              <input 
                type="text" 
                placeholder="Full Name" 
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                className="w-full mb-3 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/50 focus:border-blue-500 outline-none" 
              />
              <input 
                type="email" 
                placeholder="Email" 
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                className="w-full mb-3 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/50 focus:border-blue-500 outline-none" 
              />
              <input 
                type="password" 
                placeholder="Password" 
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                className="w-full mb-3 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/50 focus:border-blue-500 outline-none" 
              />
              <select 
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value as any })}
                className="w-full mb-3 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:border-blue-500 outline-none"
              >
                <option value="student" className="bg-gray-800">Student</option>
                <option value="teacher" className="bg-gray-800">Teacher</option>
                <option value="parent" className="bg-gray-800">Parent</option>
                <option value="staff" className="bg-gray-800">Staff</option>
              </select>
              <button 
                onClick={handleAddUser}
                disabled={isCreatingUser}
                className="w-full py-2 rounded-xl bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 disabled:opacity-50 transition-colors"
              >
                {isCreatingUser ? 'Creating...' : 'Create User'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit User Modal */}
      <AnimatePresence>
        {showEditUser && editingUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowEditUser(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md rounded-2xl bg-white/10 backdrop-blur-2xl border border-white/20 p-6 max-h-[90vh] overflow-y-auto"
            >
              <h3 className="text-xl font-bold text-white mb-4">Edit User</h3>
              
              <input 
                type="text" 
                placeholder="Full Name" 
                value={editUserForm.name}
                onChange={(e) => setEditUserForm({ ...editUserForm, name: e.target.value })}
                className="w-full mb-3 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/50 focus:border-blue-500 outline-none" 
              />
              
              <input 
                type="email" 
                placeholder="Email" 
                value={editUserForm.email}
                onChange={(e) => setEditUserForm({ ...editUserForm, email: e.target.value })}
                className="w-full mb-3 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/50 focus:border-blue-500 outline-none" 
              />
              
              <input 
                type="password" 
                placeholder="New Password (leave empty to keep current)" 
                value={editUserForm.password}
                onChange={(e) => setEditUserForm({ ...editUserForm, password: e.target.value })}
                className="w-full mb-3 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/50 focus:border-blue-500 outline-none" 
              />

              <input 
                type="tel" 
                placeholder="Phone Number" 
                value={editUserForm.phone}
                onChange={(e) => setEditUserForm({ ...editUserForm, phone: e.target.value })}
                className="w-full mb-3 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/50 focus:border-blue-500 outline-none" 
              />

              <select 
                value={editUserForm.role}
                onChange={(e) => setEditUserForm({ ...editUserForm, role: e.target.value as any })}
                className="w-full mb-3 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:border-blue-500 outline-none bg-gray-800"
              >
                <option value="student" className="bg-gray-900">Student</option>
                <option value="teacher" className="bg-gray-900">Teacher</option>
                <option value="parent" className="bg-gray-900">Parent</option>
                <option value="staff" className="bg-gray-900">Staff</option>
              </select>

              <select 
                value={editUserForm.status}
                onChange={(e) => setEditUserForm({ ...editUserForm, status: e.target.value as any })}
                className="w-full mb-3 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:border-blue-500 outline-none bg-gray-800"
              >
                <option value="active" className="bg-gray-900">Active</option>
                <option value="inactive" className="bg-gray-900">Inactive</option>
              </select>

              {editUserForm.role === 'student' && (
                <>
                  <input 
                    type="text" 
                    placeholder="Student ID" 
                    value={editUserForm.studentId}
                    onChange={(e) => setEditUserForm({ ...editUserForm, studentId: e.target.value })}
                    className="w-full mb-3 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/50 focus:border-blue-500 outline-none" 
                  />

                  <select 
                    value={editUserForm.classId}
                    onChange={(e) => setEditUserForm({ ...editUserForm, classId: e.target.value })}
                    className="w-full mb-3 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:border-blue-500 outline-none bg-gray-800"
                  >
                    <option value="">Select Class</option>
                    {availableClasses.map((cls: any) => (
                      <option key={cls.id} value={cls.id} className="bg-gray-900">
                        {cls.name} {cls.section && `(${cls.section})`}
                      </option>
                    ))}
                  </select>
                </>
              )}

              {(editUserForm.role === 'teacher' || editUserForm.role === 'staff') && (
                <input 
                  type="text" 
                  placeholder="Staff ID" 
                  value={editUserForm.staffId}
                  onChange={(e) => setEditUserForm({ ...editUserForm, staffId: e.target.value })}
                  className="w-full mb-3 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/50 focus:border-blue-500 outline-none" 
                />
              )}

              <div className="flex gap-2">
                <button 
                  onClick={handleUpdateUser}
                  disabled={isUpdatingUser}
                  className="flex-1 py-2 rounded-xl bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 disabled:opacity-50 transition-colors"
                >
                  {isUpdatingUser ? 'Updating...' : 'Update User'}
                </button>
                <button 
                  onClick={() => setShowEditUser(false)}
                  className="flex-1 py-2 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Fee Structure Modal */}
      <AnimatePresence>
        {showAddFeeStructure && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => {
              setShowAddFeeStructure(false);
              setSelectedAssignmentMethod('');
              setSelectedStudentMethod('');
              setSelectedParentMethod('');
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-2xl rounded-2xl bg-white/10 backdrop-blur-2xl border border-white/20 p-6 max-h-[90vh] overflow-y-auto"
            >
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-green-400" />
                Add Fee Structure
              </h3>
              <form onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                
                const assignmentMethod = formData.get('assignmentMethod');

                const data: any = {
                  name: formData.get('name'),
                  description: formData.get('description'),
                  amount: formData.get('amount'),
                  term: formData.get('term'),
                  academicYear: formData.get('academicYear'),
                  dueDate: formData.get('dueDate'),
                  isMandatory: formData.get('isMandatory') === 'on',
                  isRecurring: formData.get('isRecurring') === 'on'
                };

                // Add assignment data based on method
                if (assignmentMethod === 'all') {
                  // No additional data needed for all school
                } else if (assignmentMethod === 'class') {
                  const selectedClass = formData.get('selectedClass');
                  if (selectedClass) {
                    data.classIds = [selectedClass];
                  }
                } else if (assignmentMethod === 'student') {
                  const studentSelectionMethod = formData.get('studentSelectionMethod');
                  if (studentSelectionMethod === 'id') {
                    const studentId = formData.get('studentId');
                    if (studentId) {
                      data.studentIds = [studentId.toString().trim()];
                    }
                  } else if (studentSelectionMethod === 'name') {
                    const studentName = formData.get('studentName');
                    if (studentName) {
                      data.studentIds = [studentName.toString().trim()];
                    }
                  } else if (studentSelectionMethod === 'multiple') {
                    const selectedStudents = formData.get('selectedStudents')?.toString().split(',').map(s => s.trim()).filter(s => s) || [];
                    data.studentIds = selectedStudents;
                  }
                } else if (assignmentMethod === 'parent') {
                  const parentSelectionMethod = formData.get('parentSelectionMethod');
                  if (parentSelectionMethod === 'id') {
                    const parentId = formData.get('parentId');
                    if (parentId) {
                      data.parentIds = [parentId.toString().trim()];
                    }
                  } else if (parentSelectionMethod === 'name') {
                    const parentName = formData.get('parentName');
                    if (parentName) {
                      data.parentIds = [parentName.toString().trim()];
                    }
                  } else if (parentSelectionMethod === 'multiple') {
                    const selectedParents = formData.get('selectedParents')?.toString().split(',').map(s => s.trim()).filter(s => s) || [];
                    data.parentIds = selectedParents;
                  }
                }

                try {
                  const response = await fetch('/api/fee-structures', {
                    method: 'POST',
                    headers: getAuthHeaders(),
                    body: JSON.stringify(data)
                  });

                  if (response.ok) {
                    const result = await response.json();
                    setShowAddFeeStructure(false);
                    fetchFeeStructures();
                    alert(`Successfully created ${result.created} fee structure(s)`);
                  } else {
                    const error = await response.json();
                    alert(`Error: ${error.error || 'Failed to create fee structures'}`);
                  }
                } catch (error) {
                  console.error('Error:', error);
                  alert('Error creating fee structures');
                }
              }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <input
                    name="name"
                    type="text"
                    placeholder="Fee Name (e.g., Tuition Fee)"
                    required
                    className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:border-blue-500 outline-none"
                  />
                  <input
                    name="amount"
                    type="number"
                    step="0.01"
                    placeholder="Amount"
                    required
                    className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:border-blue-500 outline-none"
                  />
                </div>
                <textarea
                  name="description"
                  placeholder="Description (optional)"
                  rows={2}
                  className="w-full mb-4 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:border-blue-500 outline-none"
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <select
                    name="term"
                    className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:border-blue-500 outline-none"
                  >
                    <option value="First Term">First Term</option>
                    <option value="Second Term">Second Term</option>
                    <option value="Third Term">Third Term</option>
                  </select>
                  <input
                    name="academicYear"
                    type="text"
                    placeholder="Academic Year (e.g., 2024/2025)"
                    defaultValue="2024/2025"
                    className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:border-blue-500 outline-none"
                  />
                </div>
                <div className="mb-4">
                  <input
                    name="dueDate"
                    type="date"
                    required
                    className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:border-blue-500 outline-none"
                  />
                </div>

                {/* Assignment Method */}
                <div className="mb-4">
                  <label className="block text-white font-medium mb-2">Assignment Method</label>
                  <select
                    name="assignmentMethod"
                    value={selectedAssignmentMethod}
                    onChange={(e) => {
                      setSelectedAssignmentMethod(e.target.value);
                      setSelectedStudentMethod('');
                      setSelectedParentMethod('');
                    }}
                    className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:border-blue-500 outline-none"
                  >
                    <option value="">Select assignment method</option>
                    <option value="all">All School</option>
                    <option value="class">By Class</option>
                    <option value="student">By Student</option>
                    <option value="parent">By Parent</option>
                  </select>
                </div>

                {/* Class Selection */}
                {selectedAssignmentMethod === 'class' && (
                  <div className="mb-4">
                    <label className="block text-white font-medium mb-2">Select Class</label>
                    <select
                      name="selectedClass"
                      className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:border-blue-500 outline-none"
                    >
                      <option value="">Choose a class</option>
                      {classes.map(cls => (
                        <option key={cls.id} value={cls.id}>{cls.name} {cls.section}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Student Selection */}
                {selectedAssignmentMethod === 'student' && (
                  <div className="mb-4">
                    <label className="block text-white font-medium mb-2">Student Selection Method</label>
                    <select
                      name="studentSelectionMethod"
                      value={selectedStudentMethod}
                      onChange={(e) => setSelectedStudentMethod(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:border-blue-500 outline-none mb-2"
                    >
                      <option value="">Select how to identify students</option>
                      <option value="id">By Student ID</option>
                      <option value="name">By Student Name</option>
                      <option value="multiple">Multiple Students</option>
                    </select>

                    {selectedStudentMethod === 'id' && (
                      <div>
                        <label className="block text-white font-medium mb-2">Student ID</label>
                        <input
                          name="studentId"
                          type="text"
                          placeholder="Enter Student ID (e.g., STU001)"
                          className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:border-blue-500 outline-none"
                        />
                      </div>
                    )}

                    {selectedStudentMethod === 'name' && (
                      <div>
                        <label className="block text-white font-medium mb-2">Student Name</label>
                        <input
                          name="studentName"
                          type="text"
                          placeholder="Enter Student Name"
                          className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:border-blue-500 outline-none"
                        />
                      </div>
                    )}

                    {selectedStudentMethod === 'multiple' && (
                      <div>
                        <label className="block text-white font-medium mb-2">Student IDs or Names (comma-separated)</label>
                        <input
                          name="selectedStudents"
                          type="text"
                          placeholder="e.g., STU001, John Doe, STU002"
                          className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:border-blue-500 outline-none"
                        />
                        <p className="text-gray-400 text-xs mt-1">Enter student IDs or full names separated by commas</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Parent Selection */}
                {selectedAssignmentMethod === 'parent' && (
                  <div className="mb-4">
                    <label className="block text-white font-medium mb-2">Parent Selection Method</label>
                    <select
                      name="parentSelectionMethod"
                      value={selectedParentMethod}
                      onChange={(e) => setSelectedParentMethod(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:border-blue-500 outline-none mb-2"
                    >
                      <option value="">Select how to identify parents</option>
                      <option value="id">By Parent ID</option>
                      <option value="name">By Parent Name</option>
                      <option value="multiple">Multiple Parents</option>
                    </select>

                    {selectedParentMethod === 'id' && (
                      <div>
                        <label className="block text-white font-medium mb-2">Parent ID</label>
                        <input
                          name="parentId"
                          type="text"
                          placeholder="Enter Parent ID (e.g., PAR001)"
                          className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:border-blue-500 outline-none"
                        />
                      </div>
                    )}

                    {selectedParentMethod === 'name' && (
                      <div>
                        <label className="block text-white font-medium mb-2">Parent Name</label>
                        <input
                          name="parentName"
                          type="text"
                          placeholder="Enter Parent Name"
                          className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:border-blue-500 outline-none"
                        />
                      </div>
                    )}

                    {selectedParentMethod === 'multiple' && (
                      <div>
                        <label className="block text-white font-medium mb-2">Parent IDs or Names (comma-separated)</label>
                        <input
                          name="selectedParents"
                          type="text"
                          placeholder="e.g., PAR001, Jane Smith, PAR002"
                          className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:border-blue-500 outline-none"
                        />
                        <p className="text-gray-400 text-xs mt-1">Enter parent IDs or full names separated by commas. Fee will be assigned to their children.</p>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center gap-4 mb-4">
                  <label className="flex items-center gap-2 text-white text-sm">
                    <input name="isMandatory" type="checkbox" defaultChecked className="rounded" />
                    Mandatory
                  </label>
                  <label className="flex items-center gap-2 text-white text-sm">
                    <input name="isRecurring" type="checkbox" defaultChecked className="rounded" />
                    Recurring (Termly)
                  </label>
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium hover:shadow-xl transition-all"
                  >
                    Create Fee Structure(s)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddFeeStructure(false);
                      setSelectedAssignmentMethod('');
                      setSelectedStudentMethod('');
                      setSelectedParentMethod('');
                    }}
                    className="px-6 py-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>


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
            className="fixed top-20 right-4 z-50 w-80 rounded-2xl bg-white/10 backdrop-blur-2xl border border-white/20 p-4"
          >
            <h3 className="text-white font-bold mb-3">Notifications</h3>
            <div className="space-y-3">
              <div className="p-3 bg-white/5 rounded-xl">
                <p className="text-white text-sm">New user registered</p>
                <p className="text-gray-400 text-xs">2 hours ago</p>
              </div>
            </div>
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
            className="fixed top-20 right-4 z-50 w-80 rounded-2xl bg-white/10 backdrop-blur-2xl border border-white/20 p-6 text-center"
          >
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-r from-red-500 to-pink-600 flex items-center justify-center mb-3">
              <User className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-white font-bold text-lg">{user.name}</h3>
            <p className="text-gray-400 text-sm mb-4">Administrator</p>
            <button onClick={handleLogout} className="w-full py-2 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors flex items-center justify-center gap-2">
              <LogOut className="w-4 h-4" />Logout
            </button>
          </motion.div>
        )}
      </AnimatePresence>

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


