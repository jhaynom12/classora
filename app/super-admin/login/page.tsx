'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  UserPlus,
  ArrowRight,
  Moon,
  Sun,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  Settings,
  Megaphone,
  Headphones
} from 'lucide-react';
import { useTheme } from '@/components/theme-provider';

type Role = 'superadmin' | 'superadmin-assistant' | 'marketing' | 'customer-care';

type RoleCard = {
  id: Role;
  name: string;
  icon: typeof Shield;
  gradient: string;
  glow: string;
  color: string;
  description: string;
};

const roles: RoleCard[] = [
  {
    id: 'superadmin',
    name: 'Super Admin',
    icon: Shield,
    gradient: 'from-sky-500 via-cyan-600 to-indigo-700',
    glow: '0 0 40px rgba(56,189,248,0.5)',
    color: '#38bdf8',
    description: 'Global system administration'
  },
  {
    id: 'superadmin-assistant',
    name: 'Support Admin',
    icon: UserPlus,
    gradient: 'from-violet-500 via-fuchsia-600 to-pink-700',
    glow: '0 0 40px rgba(139,92,246,0.5)',
    color: '#a78bfa',
    description: 'Administrative support'
  },
  {
    id: 'marketing',
    name: 'Marketing',
    icon: Megaphone,
    gradient: 'from-purple-500 via-purple-600 to-indigo-700',
    glow: '0 0 40px rgba(147,51,234,0.5)',
    color: '#9333ea',
    description: 'Marketing and promotions'
  },
  {
    id: 'customer-care',
    name: 'Customer Care',
    icon: Headphones,
    gradient: 'from-teal-500 via-cyan-600 to-blue-700',
    glow: '0 0 40px rgba(20,184,166,0.5)',
    color: '#14b8a6',
    description: 'Customer support services'
  },
];

export default function SuperAdminLogin() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState<{ role: Role; name: string } | null>(null);
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setMounted(true);

    const urlParams = new URLSearchParams(window.location.search);
    const roleFromUrl = urlParams.get('role') as Role | null;
    if (roleFromUrl && roles.some((role) => role.id === roleFromUrl)) {
      setSelectedRole(roleFromUrl);
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
      localStorage.setItem('classora_token', data.token);
      localStorage.setItem('classora_user', JSON.stringify(data.user));
      setLoggedInUser(data.user);
      const dashboardMap: { [key: string]: string } = {
        superadmin: '/dashboard/super-admin',
        'superadmin-assistant': '/dashboard/admin',
        marketing: '/dashboard/admin', // Marketing uses admin dashboard for now
        'customer-care': '/dashboard/admin', // Customer care uses admin dashboard for now
      };
      window.location.href = dashboardMap[selectedRole || 'superadmin'] || '/dashboard/super-admin';
    } catch (error) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('classora_token');
    localStorage.removeItem('classora_user');
    setLoggedInUser(null);
    setSelectedRole(null);
    setUsername('');
    setPassword('');
    setError('');
  };

  if (loggedInUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 shadow-2xl max-w-md w-full text-center"
        >
          <div className="w-16 h-16 bg-gradient-to-r from-sky-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Welcome back!</h2>
          <p className="text-white/80 mb-6">
            Logged in as <span className="font-semibold text-sky-300">{loggedInUser.name}</span>
          </p>
          <div className="space-y-3">
            <button
              onClick={() => window.location.href = '/dashboard/super-admin'}
              className="w-full bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              Go to Dashboard
            </button>
            <button
              onClick={handleLogout}
              className="w-full bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 border border-white/20"
            >
              Logout
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000" />

      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="absolute top-6 right-6 z-50 p-3 bg-white/10 backdrop-blur-xl rounded-full border border-white/20 hover:bg-white/20 transition-all duration-200"
      >
        {theme === 'dark' ? <Sun className="w-5 h-5 text-white" /> : <Moon className="w-5 h-5 text-white" />}
      </button>

      <div className="w-full max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-sky-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Classora Admin
            </h1>
          </div>
          <p className="text-white/80 text-lg">Global System Administration Portal</p>
        </motion.div>

        <div className="space-y-8">
          {!selectedRole ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-8"
            >
              {roles.map((role) => {
                const Icon = role.icon;
                return (
                  <motion.button
                    key={role.id}
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setSelectedRole(role.id);
                      router.push(`/super-admin/login?role=${role.id}`);
                      setError('');
                      setUsername('');
                      setPassword('');
                    }}
                    className={`w-full p-6 rounded-3xl border-2 transition-all duration-300 text-left group cursor-pointer ${
                      selectedRole === role.id
                        ? 'border-white/50 bg-white/10 shadow-2xl'
                        : 'border-white/20 bg-white/5 hover:bg-white/10 hover:border-white/30'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-14 h-14 rounded-3xl bg-gradient-to-r ${role.gradient} flex items-center justify-center shadow-2xl`}
                        style={{ boxShadow: role.glow }}
                      >
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-semibold text-white mb-2">{role.name}</h3>
                        <p className="text-white/60 text-sm">{role.description}</p>
                        <div className="mt-5 inline-flex items-center gap-2 text-sky-300 font-medium">
                          <span>Continue to login</span>
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl max-w-2xl mx-auto"
            >
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-r from-sky-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-2xl">
                  {selectedRole === 'superadmin' ? <Shield className="w-10 h-10 text-white" /> : selectedRole === 'superadmin-assistant' ? <UserPlus className="w-10 h-10 text-white" /> : selectedRole === 'marketing' ? <Megaphone className="w-10 h-10 text-white" /> : <Headphones className="w-10 h-10 text-white" />}
                </div>
                <h3 className="text-3xl font-bold text-white mb-2">{roles.find(r => r.id === selectedRole)?.name} Login</h3>
                <p className="text-white/80">Enter your credentials to continue</p>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }} className="space-y-6">
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
                    <input
                      type="email"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-12 pr-12 py-3 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white/80 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-500/20 border border-red-500/30 rounded-2xl p-4"
                  >
                    <p className="text-red-300 text-sm">{error}</p>
                  </motion.div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 disabled:from-gray-500 disabled:to-gray-600 text-white font-semibold py-3 px-6 rounded-2xl transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100 shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      <ArrowRight className="w-5 h-5" />
                      Sign In
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRole(null);
                    router.push('/super-admin/login');
                  }}
                  className="text-white/60 hover:text-white/80 text-sm transition-colors"
                >
                  ← Back to role selection
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}