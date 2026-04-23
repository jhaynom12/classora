'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  UserPlus, Users, CheckCircle, XCircle, AlertCircle, Search,
  User, Mail, Phone, Calendar, BookOpen, Award, TrendingUp,
  LogOut, Moon, Sun, MessageCircle, Bell, Settings, Home, ChevronRight,
  Plus, Edit, Trash2, MoreVertical, Send, Paperclip, Star, Target, Brain
} from 'lucide-react';
import { useTheme } from '@/components/theme-provider';
import ActionButtons from '@/app/components/ActionButtons';

interface LinkedChild {
  id: string;
  name: string;
  admissionNo: string;
  class: string;
  avatar: string;
  averageScore: number;
  attendance: number;
  teacher: string;
  linkedDate: string;
  status: 'active' | 'pending' | 'rejected';
}

interface PendingRequest {
  id: string;
  childName: string;
  admissionNo: string;
  className: string;
  parentName: string;
  parentEmail: string;
  requestDate: string;
  status: 'pending' | 'approved' | 'rejected';
}

export default function LinkChildPage() {
  const [user, setUser] = useState<any>(null);
  const [schoolName, setSchoolName] = useState('Your School');
  const [activeTab, setActiveTab] = useState('myChildren');
  const [admissionNo, setAdmissionNo] = useState('');
  const [childName, setChildName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [searchResult, setSearchResult] = useState<any>(null);
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Mock linked children data
  const [linkedChildren, setLinkedChildren] = useState<LinkedChild[]>([
    {
      id: '1',
      name: 'Adeola K.',
      admissionNo: 'STU001',
      class: 'SS2 Science',
      avatar: 'AK',
      averageScore: 78,
      attendance: 95,
      teacher: 'Mrs. Adebayo',
      linkedDate: '2024-01-15',
      status: 'active'
    },
    {
      id: '2',
      name: 'Bola K.',
      admissionNo: 'STU002',
      class: 'JSS3 Art',
      avatar: 'BK',
      averageScore: 85,
      attendance: 98,
      teacher: 'Mrs. Okafor',
      linkedDate: '2024-01-20',
      status: 'active'
    }
  ]);

  // Mock pending requests (for admin view)
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([
    {
      id: '1',
      childName: 'Chidi O.',
      admissionNo: 'STU003',
      className: 'SS2 Science',
      parentName: 'Mr. Chidi Okafor',
      parentEmail: 'chidi@email.com',
      requestDate: '2024-04-18',
      status: 'pending'
    },
    {
      id: '2',
      childName: 'Esther N.',
      admissionNo: 'STU004',
      className: 'SS3 Science',
      parentName: 'Mrs. Esther Nwosu',
      parentEmail: 'esther@email.com',
      requestDate: '2024-04-17',
      status: 'pending'
    }
  ]);

  useEffect(() => {
    setMounted(true);
    const savedUser = localStorage.getItem('classora_user');
    const savedSchool = localStorage.getItem('classora_school_name');
    if (savedUser) setUser(JSON.parse(savedUser));
    else window.location.href = '/';
    if (savedSchool) setSchoolName(savedSchool);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/';
  };

  const searchStudent = () => {
    if (!admissionNo.trim()) {
      setErrorMessage('Please enter an admission number');
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
      return;
    }

    setLoading(true);
    // Simulate API search
    setTimeout(() => {
      // Mock student data
      if (admissionNo === 'STU005' || admissionNo === 'STU006') {
        setSearchResult({
          name: admissionNo === 'STU005' ? 'Faith A.' : 'George O.',
          admissionNo: admissionNo,
          class: admissionNo === 'STU005' ? 'SS2 Art' : 'SS1 Science',
          avatar: admissionNo === 'STU005' ? 'FA' : 'GO',
          teacher: admissionNo === 'STU005' ? 'Mrs. Eze' : 'Dr. Okonkwo'
        });
        setErrorMessage('');
        setShowError(false);
      } else {
        setSearchResult(null);
        setErrorMessage('Student not found. Please check the admission number.');
        setShowError(true);
        setTimeout(() => setShowError(false), 3000);
      }
      setLoading(false);
    }, 1000);
  };

  const sendLinkingRequest = () => {
    if (!searchResult) return;
    
    setLoading(true);
    setTimeout(() => {
      // Add to pending requests (would be sent to admin)
      const newRequest: PendingRequest = {
        id: (pendingRequests.length + 1).toString(),
        childName: searchResult.name,
        admissionNo: searchResult.admissionNo,
        className: searchResult.class,
        parentName: user?.name || 'Parent',
        parentEmail: user?.email || 'parent@email.com',
        requestDate: new Date().toISOString().split('T')[0],
        status: 'pending'
      };
      setPendingRequests([newRequest, ...pendingRequests]);
      setSearchResult(null);
      setAdmissionNo('');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      setLoading(false);
    }, 1000);
  };

  const approveRequest = (requestId: string) => {
    setPendingRequests(pendingRequests.map(req => 
      req.id === requestId ? { ...req, status: 'approved' } : req
    ));
    
    // Add to linked children
    const approvedRequest = pendingRequests.find(r => r.id === requestId);
    if (approvedRequest && approvedRequest.status === 'pending') {
      const newChild: LinkedChild = {
        id: (linkedChildren.length + 1).toString(),
        name: approvedRequest.childName,
        admissionNo: approvedRequest.admissionNo,
        class: approvedRequest.className,
        avatar: approvedRequest.childName.charAt(0) + approvedRequest.childName.charAt(1).toUpperCase(),
        averageScore: Math.floor(Math.random() * 30) + 65,
        attendance: Math.floor(Math.random() * 20) + 75,
        teacher: 'To be assigned',
        linkedDate: new Date().toISOString().split('T')[0],
        status: 'active'
      };
      setLinkedChildren([...linkedChildren, newChild]);
    }
  };

  const rejectRequest = (requestId: string) => {
    setPendingRequests(pendingRequests.map(req => 
      req.id === requestId ? { ...req, status: 'rejected' } : req
    ));
  };

  const getStatusColor = (status: string) => {
    if (status === 'active' || status === 'approved') return 'text-green-400 bg-green-500/20';
    if (status === 'pending') return 'text-yellow-400 bg-yellow-500/20';
    return 'text-red-400 bg-red-500/20';
  };

  const isAdmin = user?.role === 'admin';
  const isParent = user?.role === 'parent';

  if (!mounted || !user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      <ActionButtons />

      {/* Header */}
      <div className="relative z-10 bg-white/5 backdrop-blur-xl border-b border-white/10 sticky top-0 z-20">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Link href={isParent ? "/dashboard/parent" : "/dashboard/admin"}>
                <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                  <ChevronRight className="w-5 h-5 text-white rotate-180" />
                </button>
              </Link>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">C</span>
                </div>
                <span className="text-white font-semibold hidden sm:inline">Classora</span>
                <span className="text-white/30 hidden sm:inline">•</span>
                <span className="text-white/80 text-sm">{schoolName}</span>
                <span className="text-white/30 hidden sm:inline">•</span>
                <span className="text-purple-400 text-sm">Link Child</span>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <button onClick={toggleTheme} className="p-2 rounded-full bg-white/5">
                {theme === 'light' ? <Moon className="w-5 h-5 text-white/70" /> : <Sun className="w-5 h-5 text-yellow-400" />}
              </button>
              <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/20 text-red-400 text-sm hover:bg-red-500/30 transition-colors">
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            {isParent ? 'Link Your Child' : 'Manage Child Linking Requests'}
          </h1>
          <p className="text-gray-400">
            {isParent 
              ? 'Add your children to track their academic progress' 
              : 'Review and approve parent linking requests'}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-white/10 pb-4">
          {isParent ? (
            <>
              <button
                onClick={() => setActiveTab('myChildren')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'myChildren' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'text-gray-400 hover:text-white'}`}
              >
                My Children ({linkedChildren.length})
              </button>
              <button
                onClick={() => setActiveTab('linkNew')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'linkNew' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'text-gray-400 hover:text-white'}`}
              >
                Link New Child
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setActiveTab('pending')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'pending' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : 'text-gray-400 hover:text-white'}`}
              >
                Pending Requests ({pendingRequests.filter(r => r.status === 'pending').length})
              </button>
              <button
                onClick={() => setActiveTab('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'all' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'text-gray-400 hover:text-white'}`}
              >
                All Requests
              </button>
            </>
          )}
        </div>

        {/* Parent View - My Children */}
        {isParent && activeTab === 'myChildren' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {linkedChildren.map((child) => (
              <div key={child.id} className="rounded-2xl overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10 p-6 hover:border-emerald-500/30 transition-all">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-xl">
                    {child.avatar}
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-xl">{child.name}</h3>
                    <p className="text-gray-400">{child.class}</p>
                    <p className="text-gray-500 text-sm">Admission: {child.admissionNo}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center p-3 bg-white/5 rounded-xl">
                    <p className="text-2xl font-bold text-white">{child.averageScore}%</p>
                    <p className="text-gray-500 text-xs">Average</p>
                  </div>
                  <div className="text-center p-3 bg-white/5 rounded-xl">
                    <p className="text-2xl font-bold text-green-400">{child.attendance}%</p>
                    <p className="text-gray-500 text-xs">Attendance</p>
                  </div>
                  <div className="text-center p-3 bg-white/5 rounded-xl">
                    <p className="text-2xl font-bold text-blue-400">{child.teacher.split(' ')[0]}</p>
                    <p className="text-gray-500 text-xs">Teacher</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link href={`/dashboard/parent/child/${child.id}`} className="flex-1">
                    <button className="w-full py-2 rounded-xl bg-blue-500/20 text-blue-400 text-sm hover:bg-blue-500/30 transition-colors">
                      View Details
                    </button>
                  </Link>
                  <button className="px-4 py-2 rounded-xl bg-red-500/20 text-red-400 text-sm hover:bg-red-500/30 transition-colors">
                    Unlink
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Parent View - Link New Child */}
        {isParent && activeTab === 'linkNew' && (
          <div className="max-w-2xl mx-auto">
            <div className="rounded-2xl overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10 p-8">
              <div className="text-center mb-6">
                <UserPlus className="w-16 h-16 text-purple-400 mx-auto mb-3" />
                <h2 className="text-2xl font-bold text-white">Link Your Child</h2>
                <p className="text-gray-400 mt-2">Enter your child's admission number to send a linking request</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Admission Number</label>
                  <input
                    type="text"
                    value={admissionNo}
                    onChange={(e) => setAdmissionNo(e.target.value.toUpperCase())}
                    placeholder="e.g., STU001, STU002"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-purple-500 outline-none"
                  />
                </div>

                <button
                  onClick={searchStudent}
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Search className="w-5 h-5" />}
                  {loading ? 'Searching...' : 'Search Student'}
                </button>
              </div>

              {/* Search Result */}
              {searchResult && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 p-4 bg-green-500/10 rounded-xl border border-green-500/30"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold">
                      {searchResult.avatar}
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-semibold">{searchResult.name}</p>
                      <p className="text-gray-400 text-sm">{searchResult.class}</p>
                      <p className="text-gray-500 text-xs">Admission: {searchResult.admissionNo}</p>
                    </div>
                    <button
                      onClick={sendLinkingRequest}
                      className="px-4 py-2 rounded-xl bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors"
                    >
                      Send Request
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Success Message */}
              <AnimatePresence>
                {showSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-4 p-3 bg-green-500/20 rounded-xl border border-green-500/30"
                  >
                    <p className="text-green-400 text-sm flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Linking request sent! Admin will review and approve.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Error Message */}
              <AnimatePresence>
                {showError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-4 p-3 bg-red-500/20 rounded-xl border border-red-500/30"
                  >
                    <p className="text-red-400 text-sm flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      {errorMessage}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Info Box */}
              <div className="mt-6 p-4 bg-blue-500/10 rounded-xl border border-blue-500/30">
                <p className="text-blue-400 text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Need help? Contact the school admin to get your child's admission number.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Admin View - Pending Requests */}
        {isAdmin && (activeTab === 'pending' || activeTab === 'all') && (
          <div className="rounded-2xl overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-white/10 bg-white/5">
                  <tr className="text-left text-gray-400 text-sm">
                    <th className="p-4">Child Name</th>
                    <th className="p-4">Admission No</th>
                    <th className="p-4">Class</th>
                    <th className="p-4">Parent Name</th>
                    <th className="p-4">Parent Email</th>
                    <th className="p-4">Request Date</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {pendingRequests
                    .filter(r => activeTab === 'pending' ? r.status === 'pending' : true)
                    .map((request) => (
                      <tr key={request.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-4 text-white font-medium">{request.childName}</td>
                        <td className="p-4 text-gray-300">{request.admissionNo}</td>
                        <td className="p-4 text-gray-300">{request.className}</td>
                        <td className="p-4 text-gray-300">{request.parentName}</td>
                        <td className="p-4 text-gray-300">{request.parentEmail}</td>
                        <td className="p-4 text-gray-300">{request.requestDate}</td>
                        <td className="p-4">
                          <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(request.status)}`}>
                            {request.status}
                          </span>
                        </td>
                        <td className="p-4">
                          {request.status === 'pending' && (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => approveRequest(request.id)}
                                className="p-1 rounded-lg hover:bg-green-500/20 transition-colors"
                              >
                                <CheckCircle className="w-4 h-4 text-green-400" />
                              </button>
                              <button
                                onClick={() => rejectRequest(request.id)}
                                className="p-1 rounded-lg hover:bg-red-500/20 transition-colors"
                              >
                                <XCircle className="w-4 h-4 text-red-400" />
                              </button>
                            </div>
                          )}
                          {request.status !== 'pending' && (
                            <span className="text-gray-500 text-xs">
                              {request.status === 'approved' ? 'Approved' : 'Rejected'}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes float { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(30px, -30px); } }
        @keyframes float-delayed { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(-30px, 30px); } }
        .animate-float { animation: float 12s ease-in-out infinite; }
        .animate-float-delayed { animation: float-delayed 14s ease-in-out infinite; }
      `}</style>
    </div>
  );
}
