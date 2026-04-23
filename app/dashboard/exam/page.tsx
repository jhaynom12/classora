'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Clock, 
  Shield, 
  Zap,
  ArrowLeft,
  Calendar,
  Monitor,
  Wifi,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';

export default function ExamPortal() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('classora_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl w-full"
      >
        <div className="relative rounded-3xl overflow-hidden bg-white/5 backdrop-blur-2xl border border-white/10 p-8 text-center">
          {/* Coming Soon Badge */}
          <div className="absolute top-4 right-4">
            <div className="px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-xs font-semibold flex items-center gap-1">
              <Zap className="w-3 h-3" />
              Coming Soon
            </div>
          </div>

          {/* Icon */}
          <div className="w-24 h-24 mx-auto rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center mb-6 shadow-2xl">
            <Monitor className="w-12 h-12 text-white" />
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-white mb-2">CBT Examination Portal</h1>
          <p className="text-gray-400 mb-6">
            Computer-Based Testing Platform
          </p>

          {/* Features Preview */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="p-3 rounded-xl bg-white/5 border border-white/10">
              <Shield className="w-6 h-6 text-blue-400 mx-auto mb-2" />
              <p className="text-white text-sm">Secure Proctoring</p>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/10">
              <Clock className="w-6 h-6 text-purple-400 mx-auto mb-2" />
              <p className="text-white text-sm">Timed Exams</p>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/10">
              <Wifi className="w-6 h-6 text-green-400 mx-auto mb-2" />
              <p className="text-white text-sm">Offline Mode</p>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/10">
              <Calendar className="w-6 h-6 text-orange-400 mx-auto mb-2" />
              <p className="text-white text-sm">Schedule Tests</p>
            </div>
          </div>

          {/* Message */}
          <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30 mb-6">
            <div className="flex items-center gap-2 justify-center mb-2">
              <AlertCircle className="w-5 h-5 text-blue-400" />
              <p className="text-blue-400 font-semibold">Under Development</p>
            </div>
            <p className="text-gray-300 text-sm">
              The CBT Examination Portal is currently being built. Features will include:
              online/offline exams, automatic grading, real-time proctoring, and detailed analytics.
            </p>
          </div>

          {/* Back Button */}
          <Link href={`/dashboard/${user?.role || 'student'}`}>
            <button className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors flex items-center gap-2 mx-auto">
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </button>
          </Link>

          {/* ETA */}
          <p className="text-gray-500 text-xs mt-6">
            Expected Launch: Q3 2026
          </p>
        </div>
      </motion.div>
    </div>
  );
}