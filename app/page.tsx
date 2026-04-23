'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users,
  ArrowRight,
  Moon,
  Sun,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Settings
} from 'lucide-react';
import { useTheme } from '@/components/theme-provider';

type Role = 'student' | 'teacher' | 'parent' | 'admin';

export default function Home() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role | ''>('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [schoolName, setSchoolName] = useState('Your School');
  const [editingSchool, setEditingSchool] = useState(false);
  const [tempSchoolName, setTempSchoolName] = useState('');
  const [loggedInUser, setLoggedInUser] = useState<{ role: Role; name: string } | null>(null);
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setMounted(true);

    const savedSchoolName = localStorage.getItem('classora_school_name');
    if (savedSchoolName) {
      setSchoolName(savedSchoolName);
    }

    const savedUser = localStorage.getItem('classora_user');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      setLoggedInUser(user);
    }

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  if (!mounted) return null;

  const handleLogin = async () => {
    if (!email.trim()) {
      setError('Please enter your email');
      return;
    }

    if (!password.trim()) {
      setError('Please enter your password');
      return;
    }

    if (!role) {
      setError('Please select your role');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          password: password.trim(),
          role: role
        })
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data.error || 'Login failed';
        setError(errorMsg);
        return;
      }

      // Save token in cookie for middleware and localStorage for client
      document.cookie = `classora_token=${data.token}; path=/; max-age=604800`; // 7 days
      localStorage.setItem('classora_token', data.token);
      localStorage.setItem('classora_user', JSON.stringify(data.user));
      if (data.school) {
        localStorage.setItem('classora_school_name', data.school.name);
      }

      // Redirect to dashboard
      window.location.href = `/dashboard/${role}`;
    } catch (error) {
      console.error('Login error:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    // Clear token cookie
    document.cookie = 'classora_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    localStorage.removeItem('classora_token');
    localStorage.removeItem('classora_user');
    localStorage.removeItem('classora_school_name');
    setLoggedInUser(null);
    setEmail('');
    setPassword('');
    setRole('');
    setError('');
  };

  const saveSchoolName = () => {
    if (tempSchoolName.trim()) {
      setSchoolName(tempSchoolName);
      localStorage.setItem('classora_school_name', tempSchoolName);
      setEditingSchool(false);
    }
  };

  const isAdmin = loggedInUser?.role === 'admin';

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      {/* Animated Background */}
      <div className="fixed inset-0">
        <div 
          className="absolute w-[600px] h-[600px] rounded-full blur-[100px] opacity-40 transition-all duration-500 ease-out pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(59,130,246,0.4) 0%, transparent 70%)',
            left: mousePosition.x - 300,
            top: mousePosition.y - 300,
          }}
        />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/30 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/30 rounded-full blur-3xl animate-float-delayed" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-3xl animate-pulse-slow" />
        
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-0.5 h-0.5 bg-white rounded-full animate-twinkle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              opacity: Math.random() * 0.5 + 0.2,
            }}
          />
        ))}
        
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
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

      {/* Theme Toggle */}
      <motion.button
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
        onClick={toggleTheme}
        className="fixed top-6 right-6 z-50 p-3 rounded-full bg-white/5 backdrop-blur-2xl shadow-2xl transition-all hover:scale-110 border border-white/10 hover:border-white/20 group"
      >
        {theme === 'light' ? (
          <Moon className="w-5 h-5 text-white" />
        ) : (
          <Sun className="w-5 h-5 text-yellow-400 group-hover:rotate-90 transition-transform duration-500" />
        )}
      </motion.button>

      {/* Logout Button */}
      {loggedInUser && (
        <motion.button
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          onClick={handleLogout}
          className="fixed top-6 right-24 z-50 p-3 rounded-full bg-white/5 backdrop-blur-2xl shadow-2xl transition-all hover:scale-110 border border-white/10 hover:border-red-500/30 group"
        >
          <span className="text-white/70 text-sm group-hover:text-red-400 transition-colors">Logout</span>
        </motion.button>
      )}

      <div className="relative z-10 container mx-auto px-4 py-12 min-h-screen flex items-center justify-center">
        <div className="max-w-6xl w-full">
          {/* Logo with School Name */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, type: 'spring' }}
            className="mb-20 flex justify-center"
          >
            <div className="inline-flex items-center gap-3 bg-white/5 backdrop-blur-2xl px-6 py-3 rounded-2xl border border-white/10 shadow-2xl relative group">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 animate-shimmer" />
              
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg relative">
                <span className="text-white font-bold text-lg">C</span>
              </div>
              
              <span className="text-white font-bold text-xl tracking-tight bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
                Classora
              </span>
              
              <span className="text-white/30 text-xl font-light">•</span>
              
              <div className="flex items-center gap-2 group/school">
                {editingSchool && isAdmin ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={tempSchoolName}
                      onChange={(e) => setTempSchoolName(e.target.value)}
                      placeholder="Enter school name"
                      className="bg-white/10 border border-white/20 rounded-lg px-3 py-1 text-white text-lg font-semibold outline-none focus:border-blue-500"
                      autoFocus
                      onKeyPress={(e) => e.key === 'Enter' && saveSchoolName()}
                    />
                    <button onClick={saveSchoolName} className="px-3 py-1 bg-green-500/20 hover:bg-green-500/30 rounded-lg text-green-400 text-sm">Save</button>
                    <button onClick={() => setEditingSchool(false)} className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-400 text-sm">Cancel</button>
                  </div>
                ) : (
                  <>
                    <span className="text-white/90 font-semibold text-lg tracking-tight">
                      {schoolName}
                    </span>
                    {isAdmin && (
                      <button
                        onClick={() => {
                          setTempSchoolName(schoolName);
                          setEditingSchool(true);
                        }}
                        className="opacity-0 group-hover/school:opacity-100 transition-opacity"
                      >
                        <Settings className="w-4 h-4 text-white/50 hover:text-white/80 transition-colors" />
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </motion.div>

          {/* Login Form */}
          {!loggedInUser ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="max-w-md mx-auto"
            >
              <div className="relative rounded-2xl overflow-hidden backdrop-blur-2xl bg-white/5 border border-white/10 shadow-2xl">
                <div className="relative p-6 border-b border-white/10">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mb-4 shadow-2xl">
                      <Lock className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
                    <p className="text-gray-400 text-sm">Sign in to your account</p>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <div className="relative group">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type="email"
                      placeholder="Email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-blue-500 outline-none text-white placeholder-gray-500 transition-colors"
                      onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                    />
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-12 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-blue-500 outline-none text-white placeholder-gray-500 transition-colors"
                      onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                    />
                    <button
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <div className="relative group">
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value as Role)}
                      className="w-full pl-4 pr-10 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-blue-500 outline-none text-white appearance-none transition-colors"
                    >
                      <option value="" className="bg-gray-800 text-white">Select your role</option>
                      <option value="student" className="bg-gray-800 text-white">Student</option>
                      <option value="teacher" className="bg-gray-800 text-white">Teacher</option>
                      <option value="parent" className="bg-gray-800 text-white">Parent</option>
                      <option value="admin" className="bg-gray-800 text-white">Administrator</option>
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                  {error && (
                    <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-3">
                      <p className="text-red-400 text-sm text-center">{error}</p>
                    </div>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleLogin}
                    disabled={loading}
                    className="relative w-full py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2 overflow-hidden group shadow-2xl"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Signing in...</span>
                      </>
                    ) : (
                      <>
                        <span>Sign In</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-2xl mx-auto text-center"
            >
              <div className="rounded-2xl overflow-hidden backdrop-blur-2xl bg-white/5 border border-white/10 shadow-2xl p-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.2 }}
                  className="w-24 h-24 mx-auto rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mb-6 shadow-2xl"
                >
                  <Users className="w-12 h-12 text-white" />
                </motion.div>
                <h2 className="text-3xl font-bold text-white mb-2">Welcome back, {loggedInUser.name}!</h2>
                <p className="text-gray-400 mb-6">You are logged in as <span className="text-white font-semibold capitalize">{loggedInUser.role}</span></p>
                <div className="bg-white/5 rounded-xl p-4 mb-6">
                  <p className="text-gray-300 text-sm">🎓 {schoolName} • Classora Portal</p>
                  <p className="text-gray-500 text-xs mt-2">Redirecting to dashboard...</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleLogout}
                  className="px-6 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 font-semibold transition-colors"
                >
                  Logout
                </motion.button>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes float { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(30px, -30px); } }
        @keyframes float-delayed { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(-30px, 30px); } }
        @keyframes pulse-slow { 0%, 100% { opacity: 0.2; transform: scale(1); } 50% { opacity: 0.5; transform: scale(1.2); } }
        @keyframes twinkle { 0%, 100% { opacity: 0; transform: scale(1); } 50% { opacity: 1; transform: scale(1.5); } }
        @keyframes float-particle { 0%, 100% { transform: translateY(0) translateX(0); opacity: 0; } 50% { opacity: 0.5; } 100% { transform: translateY(-100px) translateX(50px); opacity: 0; } }
        @keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
        .animate-float { animation: float 12s ease-in-out infinite; }
        .animate-float-delayed { animation: float-delayed 14s ease-in-out infinite; }
        .animate-pulse-slow { animation: pulse-slow 8s ease-in-out infinite; }
        .animate-twinkle { animation: twinkle 3s ease-in-out infinite; }
        .animate-float-particle { animation: float-particle 15s ease-in-out infinite; }
        .animate-shimmer { animation: shimmer 2s infinite; }
        .perspective-1000 { perspective: 1000px; }
      `}</style>
    </div>
  );
}
