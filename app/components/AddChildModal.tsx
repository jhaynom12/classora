'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Mail, User, BookOpen, Award, TrendingUp, Users, Calendar, CheckCircle, AlertCircle, Loader } from 'lucide-react';

interface Child {
  id: string;
  name: string;
  admissionNo?: string;
  email?: string;
  class?: string;
  averageScore?: number;
  attendance?: number;
  predictedGrade?: string;
  subjects?: Array<{
    name: string;
    score: number;
    grade: string;
    trend: 'up' | 'down' | 'stable';
  }>;
}

interface AddChildModalProps {
  isOpen: boolean;
  onClose: () => void;
  onChildAdded?: (child: Child) => void;
  parentId: string;
}

export default function AddChildModal({ isOpen, onClose, onChildAdded, parentId }: AddChildModalProps) {
  const [admissionNo, setAdmissionNo] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [searchType, setSearchType] = useState<'admission' | 'email'>('admission');

  const handleAddChild = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await fetch('/api/parent/add-child', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('classora_token')}`
        },
        body: JSON.stringify({
          parentId,
          studentAdmissionNo: searchType === 'admission' ? admissionNo : undefined,
          studentEmail: searchType === 'email' ? studentEmail : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to add child');
        return;
      }

      setSuccess(true);
      setAdmissionNo('');
      setStudentEmail('');
      
      if (onChildAdded) {
        onChildAdded(data.child);
      }

      // Close modal after 2 seconds
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      setError('An error occurred while adding child');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={onClose}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-2xl bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 border border-white/10 shadow-2xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <div>
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Plus className="w-6 h-6 text-emerald-400" />
                    Add Child
                  </h2>
                  <p className="text-gray-400 text-sm mt-1">Link your child's school account</p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                {success ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-8"
                  >
                    <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 flex items-center justify-center mb-4">
                      <CheckCircle className="w-8 h-8 text-emerald-400" />
                    </div>
                    <h3 className="text-white font-bold text-lg mb-2">Child Added Successfully!</h3>
                    <p className="text-gray-400 text-sm">Your child's account has been linked. Closing...</p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleAddChild} className="space-y-4">
                    {/* Search Type Tabs */}
                    <div className="flex gap-2 mb-4">
                      <button
                        type="button"
                        onClick={() => setSearchType('admission')}
                        className={`flex-1 px-4 py-2 rounded-xl font-medium transition-all ${
                          searchType === 'admission'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-white/5 text-gray-400 border border-white/10 hover:border-white/20'
                        }`}
                      >
                        <User className="w-4 h-4 inline mr-1" />
                        Admission No.
                      </button>
                      <button
                        type="button"
                        onClick={() => setSearchType('email')}
                        className={`flex-1 px-4 py-2 rounded-xl font-medium transition-all ${
                          searchType === 'email'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-white/5 text-gray-400 border border-white/10 hover:border-white/20'
                        }`}
                      >
                        <Mail className="w-4 h-4 inline mr-1" />
                        Email
                      </button>
                    </div>

                    {/* Input Field */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        {searchType === 'admission' ? 'Student Admission Number' : 'Student Email Address'}
                      </label>
                      <input
                        type={searchType === 'email' ? 'email' : 'text'}
                        placeholder={searchType === 'admission' ? 'e.g., STU-2024-001' : 'e.g., student@school.com'}
                        value={searchType === 'admission' ? admissionNo : studentEmail}
                        onChange={(e) => {
                          if (searchType === 'admission') {
                            setAdmissionNo(e.target.value);
                          } else {
                            setStudentEmail(e.target.value);
                          }
                        }}
                        className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 focus:bg-white/15 transition-all"
                        disabled={loading}
                      />
                    </div>

                    {/* Info Message */}
                    <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-blue-300">
                        You can find your child's admission number or email on their school ID or in the admission letter.
                      </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-2"
                      >
                        <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-red-300">{error}</p>
                      </motion.div>
                    )}

                    {/* Buttons */}
                    <div className="flex gap-3 pt-4">
                      <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 px-4 py-3 rounded-xl bg-white/5 text-gray-300 font-medium hover:bg-white/10 transition-colors disabled:opacity-50"
                        disabled={loading}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-medium hover:shadow-lg hover:shadow-emerald-500/50 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        disabled={loading || (!admissionNo && !studentEmail)}
                      >
                        {loading ? (
                          <>
                            <Loader className="w-4 h-4 animate-spin" />
                            Adding...
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4" />
                            Add Child
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
