'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  CheckCircle, XCircle, Clock, Eye, Send, ChevronRight,
  Users, BookOpen, Calendar, Download, Printer, Filter, Search,
  AlertCircle, UserCheck, UserX, Award, TrendingUp, Activity,
  LogOut, Moon, Sun, MessageCircle, Bell, Settings, Home, FileText,
  Plus, Edit, Trash2, MoreVertical, Mail, Phone, School
} from 'lucide-react';
import { useTheme } from '@/components/theme-provider';
import ActionButtons from '@/app/components/ActionButtons';

interface ResultSubmission {
  id: string;
  className: string;
  term: string;
  academicYear: string;
  teacherName: string;
  teacherId: string;
  submittedAt: string;
  status: 'pending_hod' | 'hod_approved' | 'pending_admin' | 'published' | 'rejected';
  hodComment?: string;
  adminComment?: string;
  studentCount: number;
  averageScore: number;
}

interface WorkflowStep {
  id: string;
  name: string;
  role: 'teacher' | 'hod' | 'admin';
  action: string;
  status: 'pending' | 'completed' | 'rejected';
  date?: string;
  comment?: string;
}

export default function ResultsPublishing() {
  const [user, setUser] = useState<any>(null);
  const [schoolName, setSchoolName] = useState('Your School');
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedSubmission, setSelectedSubmission] = useState<ResultSubmission | null>(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [comment, setComment] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Mock submissions data
  const [submissions, setSubmissions] = useState<ResultSubmission[]>([
    {
      id: '1',
      className: 'SS2 Science',
      term: 'First Term',
      academicYear: '2024/2025',
      teacherName: 'Mrs. Adebayo',
      teacherId: 'TCH001',
      submittedAt: '2024-04-15T10:30:00',
      status: 'pending_hod',
      studentCount: 45,
      averageScore: 74.5,
    },
    {
      id: '2',
      className: 'SS2 Art',
      term: 'First Term',
      academicYear: '2024/2025',
      teacherName: 'Mrs. Eze',
      teacherId: 'TCH002',
      submittedAt: '2024-04-14T14:20:00',
      status: 'hod_approved',
      hodComment: 'Looks good. Forwarding to admin.',
      studentCount: 38,
      averageScore: 71.2,
    },
    {
      id: '3',
      className: 'SS1 Science',
      term: 'First Term',
      academicYear: '2024/2025',
      teacherName: 'Dr. Okonkwo',
      teacherId: 'TCH003',
      submittedAt: '2024-04-13T09:15:00',
      status: 'pending_admin',
      hodComment: 'Approved. Ready for publication.',
      studentCount: 42,
      averageScore: 76.8,
    },
    {
      id: '4',
      className: 'SS3 Science',
      term: 'First Term',
      academicYear: '2024/2025',
      teacherName: 'Prof. Williams',
      teacherId: 'TCH004',
      submittedAt: '2024-04-12T11:45:00',
      status: 'published',
      studentCount: 40,
      averageScore: 78.5,
    },
  ]);

  const workflowSteps: WorkflowStep[] = [
    { id: '1', name: 'Teacher Upload', role: 'teacher', action: 'Upload Marksheet', status: 'completed', date: '2024-04-15' },
    { id: '2', name: 'HOD Review', role: 'hod', action: 'Review & Approve', status: 'pending', date: undefined },
    { id: '3', name: 'Admin Review', role: 'admin', action: 'Final Approval', status: 'pending', date: undefined },
    { id: '4', name: 'Publish Results', role: 'admin', action: 'Publish to Portal', status: 'pending', date: undefined },
  ];

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

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'pending_hod': return { label: 'Pending HOD Review', color: 'bg-yellow-500/20 text-yellow-400', icon: Clock };
      case 'hod_approved': return { label: 'HOD Approved', color: 'bg-blue-500/20 text-blue-400', icon: UserCheck };
      case 'pending_admin': return { label: 'Pending Admin Review', color: 'bg-orange-500/20 text-orange-400', icon: Clock };
      case 'published': return { label: 'Published', color: 'bg-green-500/20 text-green-400', icon: CheckCircle };
      case 'rejected': return { label: 'Rejected', color: 'bg-red-500/20 text-red-400', icon: XCircle };
      default: return { label: status, color: 'bg-gray-500/20 text-gray-400', icon: AlertCircle };
    }
  };

  const getStepStatusIcon = (status: string) => {
    if (status === 'completed') return <CheckCircle className="w-5 h-5 text-green-400" />;
    if (status === 'rejected') return <XCircle className="w-5 h-5 text-red-400" />;
    return <Clock className="w-5 h-5 text-yellow-400" />;
  };

  const filteredSubmissions = submissions.filter(s => {
    if (activeTab === 'pending') return s.status === 'pending_hod' || s.status === 'pending_admin';
    if (activeTab === 'approved') return s.status === 'hod_approved';
    if (activeTab === 'published') return s.status === 'published';
    if (activeTab === 'all') return true;
    return true;
  });

  const pendingCount = submissions.filter(s => s.status === 'pending_hod' || s.status === 'pending_admin').length;
  const approvedCount = submissions.filter(s => s.status === 'hod_approved').length;
  const publishedCount = submissions.filter(s => s.status === 'published').length;

  const handleApprove = () => {
    if (selectedSubmission) {
      let newStatus: 'hod_approved' | 'pending_admin' | 'published' = 'hod_approved';
      
      if (selectedSubmission.status === 'pending_hod') {
        newStatus = 'hod_approved';
      } else if (selectedSubmission.status === 'pending_admin') {
        newStatus = 'published';
      }
      
      setSubmissions(submissions.map(s => 
        s.id === selectedSubmission.id 
          ? { ...s, status: newStatus, hodComment: comment || s.hodComment, adminComment: comment || s.adminComment }
          : s
      ));
      setShowApproveModal(false);
      setComment('');
      setSelectedSubmission(null);
    }
  };

  const handleReject = () => {
    if (selectedSubmission) {
      setSubmissions(submissions.map(s => 
        s.id === selectedSubmission.id ? { ...s, status: 'rejected' } : s
      ));
      setShowRejectModal(false);
      setComment('');
      setSelectedSubmission(null);
    }
  };

  if (!mounted || !user) return null;
  if (user.role !== 'admin') { window.location.href = '/'; return null; }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      <ActionButtons />

      {/* Header */}
      <div className="relative z-10 bg-white/5 backdrop-blur-xl border-b border-white/10 sticky top-0 z-20">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Link href="/dashboard/admin">
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
                <span className="text-purple-400 text-sm">Results Publishing</span>
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
          <h1 className="text-3xl font-bold text-white mb-2">Results Publishing Workflow</h1>
          <p className="text-gray-400">Review, approve, and publish student results</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 text-center">
            <Clock className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{pendingCount}</p>
            <p className="text-gray-400 text-sm">Pending Review</p>
          </div>
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 text-center">
            <UserCheck className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{approvedCount}</p>
            <p className="text-gray-400 text-sm">HOD Approved</p>
          </div>
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 text-center">
            <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{publishedCount}</p>
            <p className="text-gray-400 text-sm">Published</p>
          </div>
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 text-center">
            <Users className="w-8 h-8 text-purple-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{submissions.length}</p>
            <p className="text-gray-400 text-sm">Total Submissions</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-white/10 pb-4">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'pending' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : 'text-gray-400 hover:text-white'}`}
          >
            Pending ({pendingCount})
          </button>
          <button
            onClick={() => setActiveTab('approved')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'approved' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'text-gray-400 hover:text-white'}`}
          >
            HOD Approved ({approvedCount})
          </button>
          <button
            onClick={() => setActiveTab('published')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'published' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'text-gray-400 hover:text-white'}`}
          >
            Published ({publishedCount})
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'all' ? 'bg-gray-500/20 text-gray-400 border border-gray-500/30' : 'text-gray-400 hover:text-white'}`}
          >
            All Submissions
          </button>
        </div>

        {/* Submissions Table */}
        <div className="rounded-2xl overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-white/10 bg-white/5">
                <tr className="text-left text-gray-400 text-sm">
                  <th className="p-4">Class</th>
                  <th className="p-4">Term</th>
                  <th className="p-4">Teacher</th>
                  <th className="p-4">Students</th>
                  <th className="p-4">Average Score</th>
                  <th className="p-4">Submitted</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredSubmissions.map((submission) => {
                  const status = getStatusBadge(submission.status);
                  const StatusIcon = status.icon;
                  return (
                    <tr key={submission.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-4 text-white font-medium">{submission.className}</td>
                      <td className="p-4 text-gray-300">{submission.term} {submission.academicYear}</td>
                      <td className="p-4 text-gray-300">{submission.teacherName}</td>
                      <td className="p-4 text-gray-300">{submission.studentCount}</td>
                      <td className="p-4 text-white">{submission.averageScore}%</td>
                      <td className="p-4 text-gray-300">{new Date(submission.submittedAt).toLocaleDateString()}</td>
                      <td className="p-4">
                        <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 w-fit ${status.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {status.label}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedSubmission(submission)}
                            className="p-1 rounded-lg hover:bg-white/10 transition-colors"
                          >
                            <Eye className="w-4 h-4 text-blue-400" />
                          </button>
                          {(submission.status === 'pending_hod' || submission.status === 'pending_admin') && (
                            <>
                              <button
                                onClick={() => {
                                  setSelectedSubmission(submission);
                                  setShowApproveModal(true);
                                }}
                                className="p-1 rounded-lg hover:bg-green-500/20 transition-colors"
                              >
                                <CheckCircle className="w-4 h-4 text-green-400" />
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedSubmission(submission);
                                  setShowRejectModal(true);
                                }}
                                className="p-1 rounded-lg hover:bg-red-500/20 transition-colors"
                              >
                                <XCircle className="w-4 h-4 text-red-400" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* View Details Modal */}
      <AnimatePresence>
        {selectedSubmission && !showApproveModal && !showRejectModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setSelectedSubmission(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-lg rounded-2xl bg-white/10 backdrop-blur-2xl border border-white/20 p-6"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-white">Submission Details</h3>
                <button onClick={() => setSelectedSubmission(null)} className="p-1 rounded-lg hover:bg-white/10">
                  <XCircle className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between p-3 bg-white/5 rounded-xl">
                  <span className="text-gray-400">Class</span>
                  <span className="text-white">{selectedSubmission.className}</span>
                </div>
                <div className="flex justify-between p-3 bg-white/5 rounded-xl">
                  <span className="text-gray-400">Term</span>
                  <span className="text-white">{selectedSubmission.term} {selectedSubmission.academicYear}</span>
                </div>
                <div className="flex justify-between p-3 bg-white/5 rounded-xl">
                  <span className="text-gray-400">Teacher</span>
                  <span className="text-white">{selectedSubmission.teacherName}</span>
                </div>
                <div className="flex justify-between p-3 bg-white/5 rounded-xl">
                  <span className="text-gray-400">Students</span>
                  <span className="text-white">{selectedSubmission.studentCount}</span>
                </div>
                <div className="flex justify-between p-3 bg-white/5 rounded-xl">
                  <span className="text-gray-400">Average Score</span>
                  <span className="text-white">{selectedSubmission.averageScore}%</span>
                </div>
                <div className="flex justify-between p-3 bg-white/5 rounded-xl">
                  <span className="text-gray-400">Submitted</span>
                  <span className="text-white">{new Date(selectedSubmission.submittedAt).toLocaleString()}</span>
                </div>
                {selectedSubmission.hodComment && (
                  <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/30">
                    <p className="text-blue-400 text-sm mb-1">HOD Comment</p>
                    <p className="text-gray-300">{selectedSubmission.hodComment}</p>
                  </div>
                )}
                {selectedSubmission.adminComment && (
                  <div className="p-3 bg-purple-500/10 rounded-xl border border-purple-500/30">
                    <p className="text-purple-400 text-sm mb-1">Admin Comment</p>
                    <p className="text-gray-300">{selectedSubmission.adminComment}</p>
                  </div>
                )}
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setSelectedSubmission(null)} className="flex-1 py-2 rounded-xl bg-white/10 text-white">
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Approve Modal */}
      <AnimatePresence>
        {showApproveModal && selectedSubmission && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowApproveModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md rounded-2xl bg-white/10 backdrop-blur-2xl border border-white/20 p-6"
            >
              <h3 className="text-xl font-bold text-white mb-4">Approve Results</h3>
              <p className="text-gray-400 mb-4">
                {selectedSubmission.status === 'pending_hod' 
                  ? 'Approve these results to forward to Admin for final review.'
                  : 'Approve these results to publish them to student and parent portals.'}
              </p>
              <div>
                <label className="block text-gray-400 text-sm mb-2">Comment (Optional)</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                  placeholder="Add a comment..."
                  className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-blue-500 outline-none resize-none"
                />
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowApproveModal(false)} className="flex-1 py-2 rounded-xl bg-white/10 text-white">
                  Cancel
                </button>
                <button onClick={handleApprove} className="flex-1 py-2 rounded-xl bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors">
                  Approve
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reject Modal */}
      <AnimatePresence>
        {showRejectModal && selectedSubmission && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowRejectModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md rounded-2xl bg-white/10 backdrop-blur-2xl border border-white/20 p-6"
            >
              <h3 className="text-xl font-bold text-white mb-4">Reject Results</h3>
              <p className="text-gray-400 mb-4">Please provide a reason for rejection so the teacher can make corrections.</p>
              <div>
                <label className="block text-gray-400 text-sm mb-2">Reason for Rejection</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                  placeholder="Explain why these results are being rejected..."
                  className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-red-500 outline-none resize-none"
                />
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowRejectModal(false)} className="flex-1 py-2 rounded-xl bg-white/10 text-white">
                  Cancel
                </button>
                <button onClick={handleReject} className="flex-1 py-2 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors">
                  Reject
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        @keyframes float { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(30px, -30px); } }
        @keyframes float-delayed { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(-30px, 30px); } }
        .animate-float { animation: float 12s ease-in-out infinite; }
        .animate-float-delayed { animation: float-delayed 14s ease-in-out infinite; }
      `}</style>
    </div>
  );
}
