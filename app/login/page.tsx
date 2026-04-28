'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GraduationCap, 
  Users, 
  Heart, 
  Crown,
  ArrowRight,
  Moon,
  Sun,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  Settings
} from 'lucide-react';
import { useTheme } from '@/components/theme-provider';

type Role = 'student' | 'teacher' | 'parent' | 'admin';

const roles = [
  { 
    id: 'student', 
    name: 'Student', 
    icon: GraduationCap, 
    gradient: 'from-blue-500 via-blue-600 to-indigo-700',
    glow: '0 0 40px rgba(59,130,246,0.5)',
    color: '#3b82f6',
  },
  { 
    id: 'teacher', 
    name: 'Teacher', 
    icon: Users, 
    gradient: 'from-orange-500 via-orange-600 to-red-700',
    glow: '0 0 40px rgba(249,115,22,0.5)',
    color: '#f97316',
  },
  { 
    id: 'parent', 
    name: 'Parent', 
    icon: Heart, 
    gradient: 'from-emerald-500 via-emerald-600 to-green-700',
    glow: '0 0 40px rgba(16,185,129,0.5)',
    color: '#10b981',
  },
  { 
    id: 'admin', 
    name: 'Admin', 
    icon: Crown, 
    gradient: 'from-red-500 via-red-600 to-pink-700',
    glow: '0 0 40px rgba(239,68,68,0.5)',
    color: '#ef4444',
  },
];

export default function Home() {
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
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
    if (!username || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: username, password, role: selectedRole }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Login failed');
        return;
      }
      const userWithSchoolId = {
        ...data.user,
        schoolId: data.user.schoolId || data.school?.id
      };
      localStorage.setItem('classora_token', data.token);
      localStorage.setItem('classora_user', JSON.stringify(userWithSchoolId));
      setLoggedInUser(userWithSchoolId);
      const dashboardMap: { [key: string]: string } = {
        student: '/dashboard/student',
        teacher: '/dashboard/teacher',
        parent: '/dashboard/parent',
        admin: '/dashboard/admin',
      };
      window.location.href = dashboardMap[selectedRole || 'student'] || '/';
    } catch (error) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('classora_user');
    setLoggedInUser(null);
    setSelectedRole(null);
    setUsername('');
    setPassword('');
    setError('');
  };

  const saveSchoolName = () => {
    if (tempSchoolName.trim()) {
      setSchoolName(tempSchoolName);
      localStorage.setItem('classora_school_name', tempSchoolName);
      setEditingSchool(false);
    }
  };

  const getRoleColor = () => {
    return roles.find(r => r.id === selectedRole)?.color || '#3b82f6';
  };

  const getRoleGradient = () => {
    return roles.find(r => r.id === selectedRole)?.gradient || 'from-blue-500 to-indigo-600';
  };

  const getRoleIcon = () => {
    const Icon = roles.find(r => r.id === selectedRole)?.icon;
    return Icon ? <Icon className="w-7 h-7 text-white" /> : null;
  };

  const getRoleName = () => {
    return roles.find(r => r.id === selectedRole)?.name || '';
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
                <Sparkles className="absolute -top-2 -right-2 w-4 h-4 text-yellow-400 animate-pulse" />
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

          {/* Role Cards - 4 cards now */}
          {!loggedInUser ? (
            !selectedRole ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-5xl mx-auto"
              >
                {roles.map((role, index) => (
                  <motion.div
                    key={role.id}
                    initial={{ opacity: 0, scale: 0.8, rotateY: 90 }}
                    animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                    transition={{ delay: index * 0.15, type: 'spring', stiffness: 200 }}
                    onClick={() => setSelectedRole(role.id as Role)}
                    className="group cursor-pointer perspective-1000"
                  >
                    <motion.div
                      whileHover={{ scale: 1.08, y: -12, rotateX: 5 }}
                      className="relative rounded-2xl overflow-hidden backdrop-blur-xl bg-white/5 border border-white/10 shadow-2xl"
                    >
                      <div 
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                        style={{ background: `radial-gradient(circle at 50% 0%, ${role.color}40, transparent 70%)` }}
                      />
                      <motion.div 
                        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl"
                        style={{ background: `linear-gradient(180deg, ${role.color}, ${role.color}00)` }}
                        whileHover={{ width: 3 }}
                      />
                      <div className="relative p-8 text-center z-10">
                        <motion.div
                          whileHover={{ scale: 1.15, rotate: 8 }}
                          className={`w-24 h-24 mx-auto rounded-2xl bg-gradient-to-br ${role.gradient} flex items-center justify-center mb-6 shadow-2xl relative`}
                          style={{ boxShadow: role.glow }}
                        >
                          <role.icon className="w-12 h-12 text-white drop-shadow-lg" />
                          <motion.div 
                            className="absolute -top-2 -right-2 w-4 h-4 bg-yellow-400 rounded-full"
                            animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          />
                        </motion.div>
                        <h3 className="text-2xl font-bold text-white mb-3">{role.name}</h3>
                        <motion.div whileHover={{ x: 8 }} className="inline-flex items-center gap-2 text-sm text-gray-400 group-hover:text-white">
                          <span>Enter Portal</span>
                          <ArrowRight className="w-4 h-4" />
                        </motion.div>
                      </div>
                    </motion.div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key="login"
                  initial={{ opacity: 0, scale: 0.9, y: 30 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -30 }}
                  className="max-w-md mx-auto"
                >
                  <div className="relative rounded-2xl overflow-hidden backdrop-blur-2xl bg-white/5 border border-white/10 shadow-2xl">
                    <div className="absolute left-0 top-0 bottom-0 w-1" style={{ background: `linear-gradient(180deg, ${getRoleColor()}, ${getRoleColor()}00)` }} />
                    <div className="relative p-6 border-b border-white/10">
                      <button onClick={() => { setSelectedRole(null); setError(''); setUsername(''); setPassword(''); }} className="text-gray-400 hover:text-white flex items-center gap-2 text-sm mb-4 group">
                        <ArrowRight className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Back to portals
                      </button>
                      <div className="flex items-center gap-4">
                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.5 }} className={`w-14 h-14 rounded-xl bg-gradient-to-br ${getRoleGradient()} flex items-center justify-center shadow-2xl`} style={{ boxShadow: roles.find(r => r.id === selectedRole)?.glow }}>
                          {getRoleIcon()}
                        </motion.div>
                        <div>
                          <h2 className="text-2xl font-bold text-white">{getRoleName()} Access</h2>
                          <p className="text-gray-400 text-sm">Enter your credentials</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-6 space-y-4">
                      <div className="relative group">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <input type="text" placeholder="Username / Email / ID" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-blue-500 outline-none text-white placeholder-gray-500" onKeyDown={(e) => e.key === 'Enter' && handleLogin()} />
                      </div>
                      <div className="relative group">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <input type={showPassword ? 'text' : 'password'} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-10 pr-12 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-blue-500 outline-none text-white placeholder-gray-500" onKeyDown={(e) => e.key === 'Enter' && handleLogin()} />
                        <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2">
                          {showPassword ? <EyeOff className="w-5 h-5 text-gray-400" /> : <Eye className="w-5 h-5 text-gray-400" />}
                        </button>
                      </div>
                      {error && <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-3"><p className="text-red-400 text-sm text-center">{error}</p></div>}
                      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleLogin} disabled={loading} className={`relative w-full py-3.5 rounded-xl font-bold text-white bg-gradient-to-r ${getRoleGradient()} transition-all disabled:opacity-50 flex items-center justify-center gap-2 overflow-hidden group shadow-2xl`} style={{ boxShadow: roles.find(r => r.id === selectedRole)?.glow }}>
                        <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                        {loading ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /><span>Authenticating...</span></> : <><span>Access Portal</span><Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" /></>}
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            )
          ) : (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-2xl mx-auto text-center">
              <div className="rounded-2xl overflow-hidden backdrop-blur-2xl bg-white/5 border border-white/10 shadow-2xl p-8">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }} className={`w-24 h-24 mx-auto rounded-2xl bg-gradient-to-br ${roles.find(r => r.id === loggedInUser.role)?.gradient} flex items-center justify-center mb-6 shadow-2xl`} style={{ boxShadow: roles.find(r => r.id === loggedInUser.role)?.glow }}>
                  {(() => { const Icon = roles.find(r => r.id === loggedInUser.role)?.icon; return Icon ? <Icon className="w-12 h-12 text-white" /> : null; })()}
                </motion.div>
                <h2 className="text-3xl font-bold text-white mb-2">Welcome back, {loggedInUser.name}!</h2>
                <p className="text-gray-400 mb-6">You are logged in as <span className="text-white font-semibold">{loggedInUser.role}</span></p>
                <div className="bg-white/5 rounded-xl p-4 mb-6"><p className="text-gray-300 text-sm">🎓 {schoolName} • Classora Portal</p><p className="text-gray-500 text-xs mt-2">Redirecting to dashboard...</p></div>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleLogout} className="px-6 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 font-semibold">Logout</motion.button>
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
