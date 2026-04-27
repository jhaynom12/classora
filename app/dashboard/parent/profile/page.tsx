"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  User, Mail, Phone, MapPin, Calendar, Users, Heart, Edit, Save, X, 
  Camera, GraduationCap, Star, LogOut, Moon, Sun, ChevronRight,
  MessageCircle, Settings, Bell, CreditCard, Wallet, Clock, CheckCircle,
  Brain, Sparkles, Briefcase
} from "lucide-react";

export default function ParentProfile() {
  const [user, setUser] = useState<any>(null);
  const [schoolName, setSchoolName] = useState("Your School");
  const [editing, setEditing] = useState(false);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [mounted, setMounted] = useState(false);
  const [children, setChildren] = useState([
    { id: "1", name: "Adeola K.", class: "SS2 Science", admissionNo: "STU001", averageScore: 78, attendance: 95 },
    { id: "2", name: "Bola K.", class: "JSS3 Art", admissionNo: "STU002", averageScore: 85, attendance: 98 }
  ]);

  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "+234 802 345 6789",
    address: "123 Knowledge Street, Lagos, Nigeria",
    occupation: "Software Engineer",
    profession: "", // Short profession tag like "Dr", "Eng", "Teacher", etc.
    emergencyContact: "+234 803 456 7890"
  });

  useEffect(() => {
    setMounted(true);
    const savedUser = localStorage.getItem("classora_user");
    const savedSchool = localStorage.getItem("classora_school_name");
    const savedAvatar = localStorage.getItem("parent_avatar");
    const savedTheme = localStorage.getItem("classora-theme");
    
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      setProfileData(prev => ({
        ...prev,
        name: parsedUser.name,
        email: parsedUser.email || "parent@classora.com",
        profession: parsedUser.profession || ""
      }));
    } else {
      window.location.href = "/";
    }
    
    if (savedSchool) setSchoolName(savedSchool);
    if (savedAvatar) setAvatar(savedAvatar);
    if (savedTheme === "light") setTheme("light");
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("classora-theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = "/";
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const avatarUrl = reader.result as string;
        setAvatar(avatarUrl);
        localStorage.setItem("parent_avatar", avatarUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      // Save to database
      const response = await fetch('/api/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('classora_token')}`
        },
        body: JSON.stringify({
          id: user.id,
          profession: profileData.profession
        })
      });
      
      if (response.ok) {
        setEditing(false);
        localStorage.setItem("parent_profile", JSON.stringify(profileData));
      // Update localStorage user data
        const updatedUser = { ...user, profession: profileData.profession, childrenCount: children.length };
        localStorage.setItem("classora_user", JSON.stringify(updatedUser));
        setUser(updatedUser);
      } else {
        alert('Failed to save profile. Please try again.');
      }
    } catch (error) {
      alert('Error saving profile. Please try again.');
    }
  };

  const avgChildrenScore = Math.round(children.reduce((sum, c) => sum + c.averageScore, 0) / children.length);
  const avgAttendance = Math.round(children.reduce((sum, c) => sum + c.attendance, 0) / children.length);

  if (!mounted || !user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      {/* Header */}
      <div className="bg-white/5 backdrop-blur-xl border-b border-white/10 sticky top-0 z-20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Link href="/dashboard/parent">
                <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10">
                  <ChevronRight className="w-5 h-5 text-white rotate-180" />
                </button>
              </Link>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">C</span>
                </div>
                <span className="text-white font-semibold">Classora</span>
                <span className="text-white/30">•</span>
                <span className="text-white/80 text-sm">{schoolName}</span>
                <span className="text-emerald-400 text-sm">My Profile</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={toggleTheme} className="p-2 rounded-full bg-white/5">
                {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5 text-yellow-400" />}
              </button>
              <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/20 text-red-400 text-sm">
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-emerald-600/20 to-teal-600/20 backdrop-blur-xl border border-white/10 p-8 mb-8">
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Avatar */}
            <div className="relative group">
              {avatar ? (
                <img src={avatar} alt="Avatar" className="w-32 h-32 rounded-full object-cover border-4 border-white/20 shadow-2xl" />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center border-4 border-white/20 shadow-2xl">
                  <User className="w-12 h-12 text-white" />
                </div>
              )}
              <label className="absolute bottom-0 right-0 p-2 rounded-full bg-emerald-500 cursor-pointer shadow-lg">
                <Camera className="w-4 h-4 text-white" />
                <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
              </label>
            </div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left">
              {editing ? (
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  className="text-2xl font-bold text-white bg-white/10 border border-white/20 rounded-lg px-3 py-1 mb-2"
                />
              ) : (
                <h1 className="text-3xl font-bold text-white mb-2">{profileData.name}</h1>
              )}
              <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-sm flex items-center gap-1">
                  <Heart className="w-3 h-3" /> Parent of {children.length} children
                </span>
                <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-400 text-sm flex items-center gap-1">
                  <Star className="w-3 h-3" /> Active Parent
                </span>
              </div>
            </div>

            {/* Edit Button */}
            {editing ? (
              <div className="flex gap-2">
                <button onClick={handleSave} className="px-4 py-2 rounded-xl bg-green-500/20 text-green-400 flex items-center gap-2">
                  <Save className="w-4 h-4" /> Save
                </button>
                <button onClick={() => setEditing(false)} className="px-4 py-2 rounded-xl bg-red-500/20 text-red-400 flex items-center gap-2">
                  <X className="w-4 h-4" /> Cancel
                </button>
              </div>
            ) : (
              <button onClick={() => setEditing(true)} className="px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center gap-2">
                <Edit className="w-4 h-4" /> Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/5 rounded-2xl p-4 text-center">
            <Users className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{children.length}</p>
            <p className="text-gray-400 text-sm">Children</p>
          </div>
          <div className="bg-white/5 rounded-2xl p-4 text-center">
            <Star className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{avgChildrenScore}%</p>
            <p className="text-gray-400 text-sm">Avg Children Score</p>
          </div>
          <div className="bg-white/5 rounded-2xl p-4 text-center">
            <Clock className="w-8 h-8 text-orange-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{avgAttendance}%</p>
            <p className="text-gray-400 text-sm">Avg Attendance</p>
          </div>
          <div className="bg-white/5 rounded-2xl p-4 text-center">
            <Wallet className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">₦0</p>
            <p className="text-gray-400 text-sm">Outstanding Fees</p>
          </div>
        </div>

        {/* My Children Section */}
        <div className="bg-white/5 rounded-2xl p-6 mb-8">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-400" /> My Children
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {children.map((child) => (
              <div key={child.id} className="flex items-center gap-4 p-4 bg-white/5 rounded-xl">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                  {child.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="text-white font-semibold">{child.name}</p>
                  <p className="text-gray-400 text-sm">{child.class} • {child.admissionNo}</p>
                </div>
                <div className="text-right">
                  <p className="text-white font-bold">{child.averageScore}%</p>
                  <p className="text-gray-400 text-xs">Average</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Personal Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white/5 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-400" /> Personal Information
            </h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                <Mail className="w-5 h-5 text-gray-400" />
                <div className="flex-1">
                  <p className="text-gray-400 text-xs">Email</p>
                  {editing ? (
                    <input type="email" value={profileData.email} onChange={(e) => setProfileData({ ...profileData, email: e.target.value })} className="w-full bg-transparent text-white outline-none" />
                  ) : (
                    <p className="text-white">{profileData.email}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                <Phone className="w-5 h-5 text-gray-400" />
                <div className="flex-1">
                  <p className="text-gray-400 text-xs">Phone</p>
                  {editing ? (
                    <input type="tel" value={profileData.phone} onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })} className="w-full bg-transparent text-white outline-none" />
                  ) : (
                    <p className="text-white">{profileData.phone}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                <Briefcase className="w-5 h-5 text-gray-400" />
                <div className="flex-1">
                  <p className="text-gray-400 text-xs">Occupation</p>
                  {editing ? (
                    <input type="text" value={profileData.occupation} onChange={(e) => setProfileData({ ...profileData, occupation: e.target.value })} className="w-full bg-transparent text-white outline-none" />
                  ) : (
                    <p className="text-white">{profileData.occupation}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                <Star className="w-5 h-5 text-gray-400" />
                <div className="flex-1">
                  <p className="text-gray-400 text-xs">Profession Tag (e.g., Dr, Eng, Teacher)</p>
                  {editing ? (
                    <input 
                      type="text" 
                      value={profileData.profession} 
                      onChange={(e) => setProfileData({ ...profileData, profession: e.target.value })} 
                      className="w-full bg-transparent text-white outline-none" 
                      placeholder="Enter short profession tag"
                      maxLength={10}
                    />
                  ) : (
                    <p className="text-white">{profileData.profession || "Not set"}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                <MapPin className="w-5 h-5 text-gray-400" />
                <div className="flex-1">
                  <p className="text-gray-400 text-xs">Address</p>
                  {editing ? (
                    <textarea value={profileData.address} onChange={(e) => setProfileData({ ...profileData, address: e.target.value })} className="w-full bg-transparent text-white outline-none" rows={2} />
                  ) : (
                    <p className="text-white">{profileData.address}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* AI Insights */}
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-emerald-600/20 to-teal-600/20 rounded-2xl p-6 border border-emerald-500/30">
              <div className="flex items-center gap-3 mb-4">
                <Brain className="w-6 h-6 text-emerald-400" />
                <h3 className="text-white font-semibold">AI Parent Insight</h3>
                <Sparkles className="w-4 h-4 text-yellow-400" />
              </div>
              <p className="text-gray-300 text-sm mb-4">
                Adeola is showing strong improvement in Mathematics. Bola is excelling in Art. Schedule parent-teacher meetings for progress review.
              </p>
              <div className="flex gap-2">
                <button className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 text-sm">View Reports</button>
                <button className="px-3 py-1.5 rounded-lg bg-purple-500/20 text-purple-400 text-sm">Message Teachers</button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white/5 rounded-2xl p-6">
              <h3 className="text-white font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <Link href="/dashboard/parent">
                  <button className="w-full flex justify-between p-3 bg-white/5 rounded-xl text-gray-300 hover:bg-white/10">Dashboard <ChevronRight className="w-4 h-4" /></button>
                </Link>
                <Link href="/dashboard/forum">
                  <button className="w-full flex justify-between p-3 bg-white/5 rounded-xl text-gray-300 hover:bg-white/10">Community Forum <MessageCircle className="w-4 h-4" /></button>
                </Link>
                <Link href="/dashboard/parent/payments">
                  <button className="w-full flex justify-between p-3 bg-white/5 rounded-xl text-gray-300 hover:bg-white/10">Make Payment <CreditCard className="w-4 h-4" /></button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
