'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Sparkles, ArrowRight, Loader2 } from 'lucide-react';

interface School {
  id: string;
  name: string;
  slug: string;
}

export default function LandingPage() {
  const [showModal, setShowModal] = useState(false);
  const [schools, setSchools] = useState<School[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [loading, setLoading] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    // Clear user from localStorage to ensure fresh login
    localStorage.removeItem('classora_user');
    
    // Show modal after animation
    const timer = setTimeout(() => {
      setShowModal(true);
    }, 3500); // 3.5 seconds for animation

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  useEffect(() => {
    if (showModal) {
      fetchSchools();
    }
  }, [showModal]);

  const fetchSchools = async () => {
    try {
      const response = await fetch('/api/schools');
      const data = await response.json();
      setSchools(data);
    } catch (error) {
      console.error('Failed to fetch schools:', error);
    }
  };

  const filteredSchools = schools.filter(school =>
    school.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSchoolSelect = (school: School) => {
    setSelectedSchool(school);
    localStorage.setItem('selectedSchool', JSON.stringify(school));
    setLoading(true);
    setTimeout(() => {
      router.push('/login');
    }, 800);
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      {/* Animated Background */}
      <div className="fixed inset-0">
        {/* Mouse-tracking gradient orb */}
        <div 
          className="absolute w-[600px] h-[600px] rounded-full blur-[100px] opacity-40 transition-all duration-500 ease-out pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(59,130,246,0.4) 0%, transparent 70%)',
            left: mousePosition.x - 300,
            top: mousePosition.y - 300,
          }}
        />
        
        {/* Animated gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/30 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/30 rounded-full blur-3xl animate-float-delayed" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-3xl animate-pulse-slow" />
        
        {/* Twinkling stars */}
        {[...Array(50)].map((_, i) => (
          <div
            key={`star-${i}`}
            className="absolute w-0.5 h-0.5 bg-white rounded-full animate-twinkle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              opacity: Math.random() * 0.5 + 0.2,
            }}
          />
        ))}
        
        {/* Floating particles */}
        {[...Array(20)].map((_, i) => (
          <div
            key={`particle-${i}`}
            className="absolute w-1 h-1 bg-blue-400/40 rounded-full animate-float-particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 10}s`,
              animationDuration: `${Math.random() * 10 + 10}s`,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center container mx-auto px-4">
        <AnimatePresence mode="wait">
          {!showModal ? (
            // Splash Screen
            <motion.div
              key="splash"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              {/* Animated Logo */}
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="mb-8"
              >
                <div className="inline-flex items-center justify-center mb-12">
                  <motion.div
                    animate={{ 
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, 0, -5, 0]
                    }}
                    transition={{ 
                      duration: 3, 
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="relative"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-3xl blur-2xl opacity-60 animate-pulse" />
                    <div className="w-28 h-28 bg-gradient-to-r from-blue-500 via-purple-600 to-indigo-700 rounded-3xl flex items-center justify-center shadow-2xl relative">
                      <span className="text-6xl font-bold text-white drop-shadow-lg">C</span>
                      <motion.div
                        animate={{ rotate: 360, scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute -top-4 -right-4"
                      >
                        <Sparkles className="w-8 h-8 text-yellow-300 drop-shadow-lg" />
                      </motion.div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>

              {/* Main Title */}
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.8, type: 'spring' }}
                className="text-7xl md:text-8xl font-black mb-4 tracking-tighter"
              >
                <span className="bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent drop-shadow-2xl">
                  Classora
                </span>
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2, duration: 0.8 }}
                className="text-2xl text-white/70 font-light mb-12 tracking-wide"
              >
                Smart School Management System
              </motion.p>

              {/* Animated dots */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.8, duration: 0.5 }}
                className="flex justify-center gap-3"
              >
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ delay: i * 0.2, duration: 1.5, repeat: Infinity }}
                    className="w-3 h-3 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"
                  />
                ))}
              </motion.div>
            </motion.div>
          ) : (
            // School Selection Modal
            <motion.div
              key="modal"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.5, type: 'spring' }}
              className="w-full max-w-2xl"
            >
              {/* Modal Card */}
              <div className="relative z-50 bg-white/10 backdrop-blur-3xl border border-white/20 rounded-3xl p-8 md:p-12 shadow-2xl">
                {/* Shimmer effect */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 hover:opacity-100 transition-opacity duration-1000 animate-shimmer" />

                <div className="relative z-10">
                  {/* Header */}
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-center mb-8"
                  >
                    <h2 className="text-4xl font-bold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent mb-3">
                      Welcome to Classora
                    </h2>
                    <p className="text-white/60 text-lg">Select your school to continue</p>
                  </motion.div>

                  {/* Search Box */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mb-6"
                  >
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                      <input
                        type="text"
                        placeholder="Search for your school..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 focus:outline-none text-white placeholder-white/40 transition-all"
                      />
                    </div>
                  </motion.div>

                  {/* Schools List */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="max-h-80 overflow-y-auto space-y-2 mb-6"
                  >
                    {filteredSchools.length > 0 ? (
                      filteredSchools.map((school, index) => (
                        <motion.button
                          key={school.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.4 + index * 0.05 }}
                          onClick={() => handleSchoolSelect(school)}
                          disabled={loading && selectedSchool?.id === school.id}
                          className="w-full group relative overflow-hidden"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/10 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                          <div className="relative px-4 py-3 rounded-xl bg-white/5 border border-white/10 group-hover:border-white/30 transition-all group-hover:bg-white/15">
                            <div className="flex items-center justify-between">
                              <span className="text-white group-hover:text-white font-medium transition-colors">
                                {school.name}
                              </span>
                              <motion.div
                                whileHover={{ x: 5 }}
                                className="text-white/40 group-hover:text-blue-400 transition-colors"
                              >
                                <ArrowRight className="w-5 h-5" />
                              </motion.div>
                            </div>
                          </div>
                        </motion.button>
                      ))
                    ) : (
                      <div className="text-center py-12 text-white/60">
                        <p>No schools found. Try a different search.</p>
                      </div>
                    )}
                  </motion.div>

                  {/* Loading State */}
                  {loading && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-6"
                    >
                      <div className="flex items-center justify-center gap-3 text-blue-400">
                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity }}>
                          <Loader2 className="w-6 h-6" />
                        </motion.div>
                        <span className="text-lg font-medium">Redirecting to login...</span>
                      </div>
                    </motion.div>
                  )}

                  {/* Info Text */}
                  {!loading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 }}
                      className="text-center space-y-2"
                    >
                      <p className="text-white/40 text-sm">
                        Can't find your school? Contact your administrator.
                      </p>
                      <button
                        onClick={() => router.push('/super-admin/login')}
                        className="text-sky-400 hover:text-sky-300 text-sm underline underline-offset-2 transition-colors duration-200"
                      >
                        System Administration →
                      </button>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

