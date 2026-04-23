'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  CheckCircle, XCircle, Clock, Eye, Send, ChevronRight,
  Users, BookOpen, Calendar, Download, Printer, Filter, Search,
  AlertCircle, UserCheck, UserX, Award, TrendingUp, Activity,
  LogOut, Moon, Sun, MessageCircle, Bell, Settings, Home, FileText,
  Plus, Edit, Trash2, MoreVertical, Mail, Phone, School, GraduationCap
} from 'lucide-react';
import { useTheme } from '@/components/theme-provider';
import ActionButtons from '@/app/components/ActionButtons';

export default function HODDashboard() {
  const [user, setUser] = useState<any>(null);
  const [schoolName, setSchoolName] = useState('Your School');
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [comment, setComment] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Mock submissions awaiting HOD approval
  const [submissions, setSubmissions] = useState([
    { id: '1', className: 'SS2 Science', term: 'First Term', teacherName: 'Mrs. Adebayo', submittedAt: '2024-04-15', status: 'pending_hod', studentCount: 45, averageScore: 74.5 },
    { id: '2', className: 'SS2 Art', term: 'First Term', teacherName: 'Mrs. Eze', submittedAt: '2024-04-14', status: 'pending_hod', studentCount: 38, averageScore: 71.2 },
    { id: '3', className: 'SS1 Science', term: 'First Term', teacherName: 'Dr. Okonkwo', submittedAt: '2024-04-13', status: 'approved', studentCount: 42, averageScore: 76.8 },
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

  const handleApprove = () => {
    if (selectedSubmission) {
      setSubmissions(submissions.map(s => 
        s.id === selectedSubmission.id ? { ...s, status: 'approved' } : s
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

  const pendingCount = submissions.filter(s => s.status === 'pending_hod').length;
  const approvedCount = submissions.filter(s => s.status === 'approved').length;

  if (!mounted || !user) return null;
  if (user.role !== 'hod' && user.role !== 'admin' && user.role !== 'admin') { window.location.href = '/'; return null; }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      <ActionButtons />
      <div className="bg-white/5 backdrop-blur-xl border-b border-white/10 sticky top-0 z-20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">C</span>
                </div>
                <span className="text-white font-semibold">Classora</span>
                <span className="text-white/30">•</span>
                <span className="text-white/80 text-sm">{schoolName}</span>
                <span className="text-orange-400 text-sm">HOD Dashboard</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={toggleTheme} className="p-2 rounded-full bg-white/5">
                {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5 text-yellow-400" />}
              </button>
              <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/20 text-red-400">
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">HOD Dashboard</h1>
            <p className="text-gray-400">Review and approve teacher result submissions (HOD Access Only)</p>
          </div>
          <div className="flex gap-4">
            <div className="bg-yellow-500/20 rounded-2xl p-4 text-center"><p className="text-2xl font-bold text-yellow-400">{pendingCount}</p><p className="text-gray-400 text-sm">Pending Review</p></div>
            <div className="bg-green-500/20 rounded-2xl p-4 text-center"><p className="text-2xl font-bold text-green-400">{approvedCount}</p><p className="text-gray-400 text-sm">Approved</p></div>
          </div>
        </div>
        <div className="rounded-2xl overflow-hidden bg-white/5 border border-white/10">
          <table className="w-full">
            <thead className="bg-white/5 border-b border-white/10">
              <tr className="text-left text-gray-400">
                <th className="p-4">Class</th><th className="p-4">Teacher</th><th className="p-4">Term</th><th className="p-4">Students</th><th className="p-4">Avg Score</th><th className="p-4">Submitted</th><th className="p-4">Status</th><th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map(s => (
                <tr key={s.id} className="border-b border-white/10 hover:bg-white/5">
                  <td className="p-4 text-white">{s.className}</td>
                  <td className="p-4 text-gray-300">{s.teacherName}</td>
                  <td className="p-4 text-gray-300">{s.term}</td>
                  <td className="p-4 text-gray-300">{s.studentCount}</td>
                  <td className="p-4 text-white">{s.averageScore}%</td>
                  <td className="p-4 text-gray-300">{s.submittedAt}</td>
                  <td className="p-4"><span className={`text-xs px-2 py-1 rounded-full ${s.status === 'pending_hod' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'}`}>{s.status === 'pending_hod' ? 'Pending' : 'Approved'}</span></td>
                  <td className="p-4">
                    {s.status === 'pending_hod' && (
                      <>
                        <button onClick={() => { setSelectedSubmission(s); setShowApproveModal(true); }} className="px-3 py-1 rounded-lg bg-green-500/20 text-green-400 mr-2">Approve</button>
                        <button onClick={() => { setSelectedSubmission(s); setShowRejectModal(true); }} className="px-3 py-1 rounded-lg bg-red-500/20 text-red-400">Reject</button>
                      </>
                    )}
                    {s.status === 'approved' && <span className="text-green-400">✓ Approved</span>}
                  </td>
                 </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <AnimatePresence>{showApproveModal && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80" onClick={() => setShowApproveModal(false)}><motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} onClick={(e) => e.stopPropagation()} className="bg-white/10 backdrop-blur-2xl rounded-2xl p-6 max-w-md w-full"><h3 className="text-xl font-bold text-white mb-4">Approve Results</h3><textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={3} placeholder="Add a comment..." className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white mb-4"></textarea><div className="flex gap-3"><button onClick={() => setShowApproveModal(false)} className="flex-1 py-2 rounded-xl bg-white/10 text-white">Cancel</button><button onClick={handleApprove} className="flex-1 py-2 rounded-xl bg-green-500/20 text-green-400">Approve</button></div></motion.div></motion.div>)}</AnimatePresence>
      <AnimatePresence>{showRejectModal && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80" onClick={() => setShowRejectModal(false)}><motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} onClick={(e) => e.stopPropagation()} className="bg-white/10 backdrop-blur-2xl rounded-2xl p-6 max-w-md w-full"><h3 className="text-xl font-bold text-white mb-4">Reject Results</h3><textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={3} placeholder="Reason for rejection..." className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white mb-4"></textarea><div className="flex gap-3"><button onClick={() => setShowRejectModal(false)} className="flex-1 py-2 rounded-xl bg-white/10 text-white">Cancel</button><button onClick={handleReject} className="flex-1 py-2 rounded-xl bg-red-500/20 text-red-400">Reject</button></div></motion.div></motion.div>)}</AnimatePresence>
    </div>
  );
}



