'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Home,
  Users,
  School,
  Shield,
  Plus,
  Search,
  CheckCircle,
  AlertCircle,
  X,
  UserPlus,
  Mail,
  Phone,
  MapPin,
  Lock,
  ArrowRight,
  Crown,
  LogOut,
  Moon,
  Sun,
  Settings as SettingsIcon,
  Sparkles,
  Database,
  Activity,
  FileText,
  Wallet,
  Globe,
} from 'lucide-react';
import { useTheme } from '@/components/theme-provider';
import ActionButtons from '@/app/components/ActionButtons';

interface SchoolData {
  id: string;
  name: string;
  slug: string;
  address?: string;
  email?: string;
  phone?: string;
  primaryColor?: string;
}

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  schoolId: string;
}

type NewUserRole = 'admin' | 'hod' | 'staff' | 'superadmin-assistant';

export default function SuperAdminDashboard() {
  const [user, setUser] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  const [schools, setSchools] = useState<SchoolData[]>([]);
  const [users, setUsers] = useState<UserData[]>([]);
  const [activeSection, setActiveSection] = useState('schools');
  const [showSchoolModal, setShowSchoolModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [newSchool, setNewSchool] = useState({ name: '', slug: '', address: '', email: '', phone: '', primaryColor: '#6366f1' });
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'admin' as NewUserRole, schoolId: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const { theme, toggleTheme } = useTheme();

  const getAuthHeaders = () => {
    const token = document.cookie.split('; ').find(row => row.startsWith('classora_token='))?.split('=')[1];
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
  };

  const fetchSchools = async () => {
    try {
      const response = await fetch('/api/schools', {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        setSchools(data);
        if (!newUser.schoolId && data.length > 0) {
          setNewUser((prev) => ({ ...prev, schoolId: prev.schoolId || data[0].id }));
        }
      }
    } catch (error) {
      console.error('Failed to fetch schools', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users', {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Failed to fetch users', error);
    }
  };

  useEffect(() => {
    setMounted(true);
    const savedUser = localStorage.getItem('classora_user');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      setUser(parsed);
      fetchSchools();
      fetchUsers();
    } else {
      window.location.href = '/';
    }
  }, []);

  useEffect(() => {
    if (mounted && user && user.role !== 'superadmin') {
      window.location.href = '/';
    }
  }, [mounted, user]);

  const filteredSchools = schools.filter((school) =>
    school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    school.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (school.address || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAdmins = users.filter((item) =>
    item.role === 'admin' || item.role === 'superadmin-assistant' || item.role === 'hod' || item.role === 'staff'
  ).filter((userItem) =>
    userItem.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    userItem.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalSchools = schools.length;
  const totalAdmins = users.filter((item) => item.role === 'admin').length;
  const totalSupportAdmins = users.filter((item) => item.role === 'superadmin-assistant').length;
  const totalUsers = users.length;

  const handleCreateSchool = async () => {
    if (!newSchool.name.trim()) {
      setStatusMessage('Please provide a school name');
      return;
    }

    setIsSaving(true);
    setStatusMessage('Creating school...');

    try {
      const response = await fetch('/api/super-admin/schools', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(newSchool)
      });
      const data = await response.json();
      if (!response.ok) {
        setStatusMessage(data.error || 'Could not create school');
        return;
      }
      setSchools((prev) => [data, ...prev]);
      setStatusMessage('School created successfully');
      setShowSchoolModal(false);
      setNewSchool({ name: '', slug: '', address: '', email: '', phone: '', primaryColor: '#6366f1' });
      fetchUsers();
    } catch (error) {
      console.error('Create school error', error);
      setStatusMessage('Error creating school');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateUser = async () => {
    if (!newUser.name.trim() || !newUser.email.trim() || !newUser.password.trim()) {
      setStatusMessage('Please fill in all user fields');
      return;
    }
    if (!newUser.schoolId) {
      setStatusMessage('Please select a school for this user');
      return;
    }

    setIsSaving(true);
    setStatusMessage('Creating user...');

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          name: newUser.name,
          email: newUser.email,
          password: newUser.password,
          role: newUser.role,
          schoolId: newUser.schoolId
        })
      });
      const data = await response.json();
      if (!response.ok) {
        setStatusMessage(data.error || 'Could not create user');
        return;
      }
      setUsers((prev) => [data, ...prev]);
      setStatusMessage('User created successfully');
      setShowUserModal(false);
      setNewUser({ name: '', email: '', password: '', role: 'admin', schoolId: schools[0]?.id || '' });
    } catch (error) {
      console.error('Create user error', error);
      setStatusMessage('Error creating user');
    } finally {
      setIsSaving(false);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-500/20 text-red-300';
      case 'hod': return 'bg-indigo-500/20 text-indigo-300';
      case 'staff': return 'bg-purple-500/20 text-purple-300';
      case 'superadmin-assistant': return 'bg-sky-500/20 text-sky-300';
      default: return 'bg-white/10 text-gray-200';
    }
  };

  if (!mounted || !user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white">
      <ActionButtons />
      <div className="relative z-10">
        <div className="bg-white/5 backdrop-blur-xl border-b border-white/10 sticky top-0 z-20">
          <div className="container mx-auto px-4 sm:px-6 py-4 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-sky-300">Super Admin</p>
                  <h1 className="text-2xl sm:text-3xl font-semibold">Global School Management</h1>
                </div>
              </div>
              <p className="text-gray-400 max-w-2xl">Manage every school from one central control plane, create new schools, and delegate trusted assistants with reduced access.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button onClick={toggleTheme} className="px-4 py-2 rounded-2xl bg-white/5 hover:bg-white/10 transition">
                {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              </button>
              <button onClick={() => setShowSchoolModal(true)} className="px-4 py-2 rounded-2xl bg-sky-500/20 text-sky-200 hover:bg-sky-500/30 transition flex items-center gap-2">
                <Plus className="w-4 h-4" /> New School
              </button>
              <button onClick={() => setShowUserModal(true)} className="px-4 py-2 rounded-2xl bg-violet-500/20 text-violet-200 hover:bg-violet-500/30 transition flex items-center gap-2">
                <UserPlus className="w-4 h-4" /> Add Admin
              </button>
            </div>
          </div>
        </div>

        <main className="container mx-auto px-4 sm:px-6 py-8">
          <div className="grid grid-cols-1 xl:grid-cols-[1.6fr_1fr] gap-6">
            <section className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <div className="rounded-3xl bg-white/5 border border-white/10 p-6">
                  <p className="text-sm text-gray-400 uppercase tracking-[0.3em] mb-3">Schools</p>
                  <p className="text-4xl font-semibold">{totalSchools}</p>
                  <p className="text-gray-400 mt-2 text-sm">Active school communities</p>
                </div>
                <div className="rounded-3xl bg-white/5 border border-white/10 p-6">
                  <p className="text-sm text-gray-400 uppercase tracking-[0.3em] mb-3">Admins</p>
                  <p className="text-4xl font-semibold">{totalAdmins}</p>
                  <p className="text-gray-400 mt-2 text-sm">School administrators</p>
                </div>
                <div className="rounded-3xl bg-white/5 border border-white/10 p-6">
                  <p className="text-sm text-gray-400 uppercase tracking-[0.3em] mb-3">Assistants</p>
                  <p className="text-4xl font-semibold">{totalSupportAdmins}</p>
                  <p className="text-gray-400 mt-2 text-sm">Support admin roles</p>
                </div>
                <div className="rounded-3xl bg-white/5 border border-white/10 p-6">
                  <p className="text-sm text-gray-400 uppercase tracking-[0.3em] mb-3">Users</p>
                  <p className="text-4xl font-semibold">{totalUsers}</p>
                  <p className="text-gray-400 mt-2 text-sm">All users across schools</p>
                </div>
              </div>

              <div className="rounded-3xl bg-white/5 border border-white/10 p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                  <div>
                    <h2 className="text-xl font-semibold">School Directory</h2>
                    <p className="text-gray-400 text-sm">Browse school profiles and jump into school-level details.</p>
                  </div>
                  <div className="relative max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search schools or admins"
                      className="w-full pl-10 pr-4 py-2 rounded-2xl bg-slate-950 border border-white/10 text-white placeholder-gray-500 outline-none"
                    />
                  </div>
                </div>

                <div className="divide-y divide-white/10">
                  {filteredSchools.map((school) => (
                    <div key={school.id} className="py-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div>
                        <p className="text-lg font-semibold">{school.name}</p>
                        <p className="text-gray-400 text-sm">{school.slug}</p>
                        <p className="text-gray-400 text-sm mt-1">{school.address || 'No address set'}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="text-xs uppercase tracking-[0.3em] text-slate-400 bg-white/5 px-3 py-2 rounded-2xl">{school.email || 'No email'}</span>
                        <span className="text-xs uppercase tracking-[0.3em] text-slate-400 bg-white/5 px-3 py-2 rounded-2xl">{school.phone || 'No phone'}</span>
                        <Link href={`/dashboard/admin?schoolId=${school.id}`} className="px-4 py-2 rounded-2xl bg-sky-500/20 text-sky-200 hover:bg-sky-500/30 transition">
                          Manage
                        </Link>
                      </div>
                    </div>
                  ))}
                  {filteredSchools.length === 0 && (
                    <div className="py-8 text-center text-gray-400">No schools found. Create the first school to get started.</div>
                  )}
                </div>
              </div>
            </section>

            <aside className="space-y-6">
              <div className="rounded-3xl bg-white/5 border border-white/10 p-6 space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold">Quick actions</h3>
                    <p className="text-gray-400 text-sm">Create schools, assign admins, and control access.</p>
                  </div>
                </div>
                <button onClick={() => setShowSchoolModal(true)} className="w-full rounded-2xl bg-sky-500/20 text-sky-200 py-3 hover:bg-sky-500/30 transition">Create New School</button>
                <button onClick={() => setShowUserModal(true)} className="w-full rounded-2xl bg-violet-500/20 text-violet-200 py-3 hover:bg-violet-500/30 transition">Create Admin Role</button>
                <div className="rounded-2xl bg-slate-950/70 border border-white/10 p-4">
                  <p className="text-sm text-gray-400">As Super Admin, you can add staff and support admin roles. Support admins have fewer permissions than your global account.</p>
                </div>
              </div>
              <div className="rounded-3xl bg-white/5 border border-white/10 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Database className="w-5 h-5 text-cyan-300" />
                  <h3 className="text-lg font-semibold">Health snapshot</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm text-gray-300"><span>API Uptime</span><span className="text-white">99.98%</span></div>
                  <div className="flex items-center justify-between text-sm text-gray-300"><span>Database</span><span className="text-white">Connected</span></div>
                  <div className="flex items-center justify-between text-sm text-gray-300"><span>Active Schools</span><span className="text-white">{totalSchools}</span></div>
                  <div className="flex items-center justify-between text-sm text-gray-300"><span>Pending Actions</span><span className="text-yellow-300">3</span></div>
                </div>
              </div>
              <div className="rounded-3xl bg-white/5 border border-white/10 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Activity className="w-5 h-5 text-violet-300" />
                  <h3 className="text-lg font-semibold">Recent admin helpers</h3>
                </div>
                <div className="space-y-4">
                  {filteredAdmins.slice(0, 4).map((item) => (
                    <div key={item.id} className="rounded-2xl bg-slate-950/70 border border-white/10 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold text-white">{item.name}</p>
                          <p className="text-gray-400 text-sm">{item.email}</p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${getRoleBadge(item.role)}`}>{item.role}</span>
                      </div>
                    </div>
                  ))}
                  {filteredAdmins.length === 0 && <p className="text-gray-400 text-sm">No admin helpers yet.</p>}
                </div>
              </div>
            </aside>
          </div>

          {statusMessage && (
            <div className="mt-6 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-emerald-200">
              {statusMessage}
            </div>
          )}
        </main>
      </div>

      {showSchoolModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl rounded-3xl bg-slate-950 border border-white/10 p-6 relative">
            <button onClick={() => setShowSchoolModal(false)} className="absolute right-4 top-4 p-2 rounded-full bg-white/5 hover:bg-white/10">
              <X className="w-4 h-4" />
            </button>
            <h2 className="text-xl font-semibold mb-4">Create New School</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="space-y-2 text-sm text-gray-300">
                School Name
                <input value={newSchool.name} onChange={(e) => setNewSchool({ ...newSchool, name: e.target.value })} className="w-full rounded-2xl bg-slate-900 border border-white/10 px-4 py-3 text-white outline-none" />
              </label>
              <label className="space-y-2 text-sm text-gray-300">
                Slug
                <input value={newSchool.slug} onChange={(e) => setNewSchool({ ...newSchool, slug: e.target.value })} className="w-full rounded-2xl bg-slate-900 border border-white/10 px-4 py-3 text-white outline-none" placeholder="optional" />
              </label>
              <label className="space-y-2 text-sm text-gray-300">
                Address
                <input value={newSchool.address} onChange={(e) => setNewSchool({ ...newSchool, address: e.target.value })} className="w-full rounded-2xl bg-slate-900 border border-white/10 px-4 py-3 text-white outline-none" />
              </label>
              <label className="space-y-2 text-sm text-gray-300">
                Email
                <input value={newSchool.email} onChange={(e) => setNewSchool({ ...newSchool, email: e.target.value })} className="w-full rounded-2xl bg-slate-900 border border-white/10 px-4 py-3 text-white outline-none" />
              </label>
              <label className="space-y-2 text-sm text-gray-300">
                Phone
                <input value={newSchool.phone} onChange={(e) => setNewSchool({ ...newSchool, phone: e.target.value })} className="w-full rounded-2xl bg-slate-900 border border-white/10 px-4 py-3 text-white outline-none" />
              </label>
              <label className="space-y-2 text-sm text-gray-300">
                Primary Color
                <input type="color" value={newSchool.primaryColor} onChange={(e) => setNewSchool({ ...newSchool, primaryColor: e.target.value })} className="w-full h-12 rounded-2xl border border-white/10 bg-slate-900 p-2" />
              </label>
            </div>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button onClick={() => setShowSchoolModal(false)} className="rounded-2xl bg-white/5 px-5 py-3 text-sm text-gray-200 hover:bg-white/10 transition">Cancel</button>
              <button onClick={handleCreateSchool} disabled={isSaving} className="rounded-2xl bg-sky-500 px-5 py-3 text-sm text-white hover:bg-sky-600 transition disabled:opacity-50">{isSaving ? 'Creating…' : 'Create School'}</button>
            </div>
          </div>
        </div>
      )}

      {showUserModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl rounded-3xl bg-slate-950 border border-white/10 p-6 relative">
            <button onClick={() => setShowUserModal(false)} className="absolute right-4 top-4 p-2 rounded-full bg-white/5 hover:bg-white/10">
              <X className="w-4 h-4" />
            </button>
            <h2 className="text-xl font-semibold mb-4">Create Admin or Support Role</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="space-y-2 text-sm text-gray-300">
                Full Name
                <input value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} className="w-full rounded-2xl bg-slate-900 border border-white/10 px-4 py-3 text-white outline-none" />
              </label>
              <label className="space-y-2 text-sm text-gray-300">
                Email
                <input value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} className="w-full rounded-2xl bg-slate-900 border border-white/10 px-4 py-3 text-white outline-none" />
              </label>
              <label className="space-y-2 text-sm text-gray-300">
                Password
                <input type="password" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} className="w-full rounded-2xl bg-slate-900 border border-white/10 px-4 py-3 text-white outline-none" />
              </label>
              <label className="space-y-2 text-sm text-gray-300">
                Role
                <select value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value as NewUserRole })} className="w-full rounded-2xl bg-slate-900 border border-white/10 px-4 py-3 text-white outline-none">
                  <option value="admin">School Admin</option>
                  <option value="hod">HOD</option>
                  <option value="staff">Staff</option>
                  <option value="superadmin-assistant">Support Admin</option>
                </select>
              </label>
              <label className="space-y-2 text-sm text-gray-300 sm:col-span-2">
                Assigned School
                <select value={newUser.schoolId} onChange={(e) => setNewUser({ ...newUser, schoolId: e.target.value })} className="w-full rounded-2xl bg-slate-900 border border-white/10 px-4 py-3 text-white outline-none">
                  {schools.map((school) => (
                    <option key={school.id} value={school.id}>{school.name}</option>
                  ))}
                </select>
              </label>
            </div>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button onClick={() => setShowUserModal(false)} className="rounded-2xl bg-white/5 px-5 py-3 text-sm text-gray-200 hover:bg-white/10 transition">Cancel</button>
              <button onClick={handleCreateUser} disabled={isSaving} className="rounded-2xl bg-violet-500 px-5 py-3 text-sm text-white hover:bg-violet-600 transition disabled:opacity-50">{isSaving ? 'Creating…' : 'Create Role'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
