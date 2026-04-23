"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { 
  User, Mail, Phone, MapPin, Calendar, Award, Target, TrendingUp,
  Edit, Save, X, Camera, GraduationCap, Star, LogOut, Moon, Sun, ChevronRight,
  Brain, Sparkles, MessageCircle, Download, CheckCircle, BookOpen, Clock,
  Users, Heart, Activity, BarChart3, PieChart, Calendar as CalendarIcon,
  FileText, AlertCircle, ThumbsUp, Zap, Settings, Bell, CreditCard
} from "lucide-react";

export default function StudentProfile() {
  const params = useParams();
  const [user, setUser] = useState<any>(null);
  const [viewingStudentId, setViewingStudentId] = useState<string | null>(null);
  const [schoolName, setSchoolName] = useState("Your School");
  const [editing, setEditing] = useState(false);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [viewerRole, setViewerRole] = useState<string>("");

  // Student data - will come from API/database
  const [studentData, setStudentData] = useState<any>({
    id: "STU001",
    name: "",
    email: "",
    phone: "+234 802 345 6789",
    address: "123 Knowledge Street, Lagos, Nigeria",
    dateOfBirth: "2008-05-15",
    bloodGroup: "O+",
    emergencyContact: "+234 803 456 7890",
    bio: "Passionate about mathematics and science. Aspiring engineer.",
    class: "SS2 Science",
    admissionYear: "2023",
    guardianName: "Mr. & Mrs. K.",
    guardianPhone: "+234 802 345 6789",
    guardianEmail: "parent@classora.com"
  });

  // Academic data
  const [academicData, setAcademicData] = useState({
    subjects: [
      { name: "Mathematics", score: 85, grade: "A", teacher: "Mrs. Adebayo", attendance: 95, trend: "up" },
      { name: "English", score: 78, grade: "B+", teacher: "Mr. Johnson", attendance: 92, trend: "stable" },
      { name: "Physics", score: 72, grade: "B", teacher: "Dr. Okonkwo", attendance: 88, trend: "up" },
      { name: "Chemistry", score: 68, grade: "B-", teacher: "Mrs. Eze", attendance: 85, trend: "down" },
      { name: "Biology", score: 82, grade: "A-", teacher: "Prof. Williams", attendance: 96, trend: "up" }
    ],
    averageScore: 77,
    predictedGrade: "B+",
    classRank: 8,
    totalStudents: 45,
    attendance: 93,
    studyStreak: 15,
    achievements: 8
  });

  // Exams and assignments
  const [exams, setExams] = useState([
    { name: "Mid-Term Examination", subject: "Mathematics", date: "2024-04-20", time: "10:00 AM", venue: "Hall A", status: "upcoming" },
    { name: "Practical Test", subject: "Physics", date: "2024-04-22", time: "2:00 PM", venue: "Lab 2", status: "upcoming" },
    { name: "Essay Writing", subject: "English", date: "2024-04-25", time: "9:00 AM", venue: "Hall B", status: "upcoming" }
  ]);

  const [assignments, setAssignments] = useState([
    { name: "Algebra Worksheet", subject: "Mathematics", dueDate: "2024-04-18", status: "pending", description: "Complete questions 1-15" },
    { name: "Lab Report", subject: "Chemistry", dueDate: "2024-04-19", status: "pending", description: "Write up titration experiment" },
    { name: "Essay: Climate Change", subject: "English", dueDate: "2024-04-17", status: "submitted", description: "500-word essay" }
  ]);

  const [achievements, setAchievements] = useState([
    { title: "Top Performer - Mathematics", date: "March 2024", icon: "🏆" },
    { title: "Perfect Attendance", date: "February 2024", icon: "⭐" },
    { title: "Science Quiz Winner", date: "January 2024", icon: "🔬" }
  ]);

  useEffect(() => {
    setMounted(true);
    const savedUser = localStorage.getItem("classora_user");
    const savedSchool = localStorage.getItem("classora_school_name");
    const savedAvatar = localStorage.getItem("student_avatar");
    const savedTheme = localStorage.getItem("classora-theme");
    
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      setViewerRole(parsedUser.role);
      setStudentData((prev: any) => ({
        ...prev,
        name: parsedUser.name,
        email: parsedUser.email || "student@classora.com"
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
        localStorage.setItem("student_avatar", avatarUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    setEditing(false);
    localStorage.setItem("student_profile", JSON.stringify(studentData));
  };

  const getGradeColor = (grade: string) => {
    if (grade.startsWith("A")) return "text-green-400";
    if (grade.startsWith("B")) return "text-blue-400";
    if (grade.startsWith("C")) return "text-yellow-400";
    return "text-red-400";
  };

  const canEdit = viewerRole === "student" || viewerRole === "admin";
  const canMessage = viewerRole === "parent" || viewerRole === "teacher" || viewerRole === "admin";

  if (!mounted || !user) return null;

  // Different back link based on role
  const getBackLink = () => {
    if (viewerRole === "parent") return "/dashboard/parent";
    if (viewerRole === "teacher") return "/dashboard/teacher";
    return "/dashboard/student";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      {/* Header */}
      <div className="bg-white/5 backdrop-blur-xl border-b border-white/10 sticky top-0 z-20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Link href={getBackLink()}>
                <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10">
                  <ChevronRight className="w-5 h-5 text-white rotate-180" />
                </button>
              </Link>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">C</span>
                </div>
                <span className="text-white font-semibold">Classora</span>
                <span className="text-white/30">•</span>
                <span className="text-white/80 text-sm">{schoolName}</span>
                <span className="text-blue-400 text-sm">
                  {viewerRole === "student" ? "My Profile" : `${studentData.name}'s Profile`}
                </span>
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
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-xl border border-white/10 p-8 mb-8">
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Avatar */}
            <div className="relative group">
              {avatar ? (
                <img src={avatar} alt="Avatar" className="w-32 h-32 rounded-full object-cover border-4 border-white/20 shadow-2xl" />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center border-4 border-white/20 shadow-2xl">
                  <User className="w-12 h-12 text-white" />
                </div>
              )}
              {canEdit && (
                <label className="absolute bottom-0 right-0 p-2 rounded-full bg-blue-500 cursor-pointer shadow-lg">
                  <Camera className="w-4 h-4 text-white" />
                  <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                </label>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left">
              {editing && canEdit ? (
                <input
                  type="text"
                  value={studentData.name}
                  onChange={(e) => setStudentData({ ...studentData, name: e.target.value })}
                  className="text-2xl font-bold text-white bg-white/10 border border-white/20 rounded-lg px-3 py-1 mb-2"
                />
              ) : (
                <h1 className="text-3xl font-bold text-white mb-2">{studentData.name}</h1>
              )}
              <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-sm flex items-center gap-1">
                  <GraduationCap className="w-3 h-3" /> {studentData.class}
                </span>
                <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-400 text-sm flex items-center gap-1">
                  <Star className="w-3 h-3" /> Class of {studentData.admissionYear}
                </span>
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-sm flex items-center gap-1">
                  <Users className="w-3 h-3" /> ID: {studentData.id}
                </span>
              </div>
            </div>

            {/* Edit/Save Buttons */}
            {canEdit && (
              editing ? (
                <div className="flex gap-2">
                  <button onClick={handleSave} className="px-4 py-2 rounded-xl bg-green-500/20 text-green-400 flex items-center gap-2">
                    <Save className="w-4 h-4" /> Save
                  </button>
                  <button onClick={() => setEditing(false)} className="px-4 py-2 rounded-xl bg-red-500/20 text-red-400 flex items-center gap-2">
                    <X className="w-4 h-4" /> Cancel
                  </button>
                </div>
              ) : (
                <button onClick={() => setEditing(true)} className="px-4 py-2 rounded-xl bg-blue-500/20 text-blue-400 flex items-center gap-2">
                  <Edit className="w-4 h-4" /> Edit Profile
                </button>
              )
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 border-b border-white/10 pb-4">
          <button onClick={() => setActiveTab("overview")} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "overview" ? "bg-blue-500/20 text-blue-400 border border-blue-500/30" : "text-gray-400 hover:text-white"}`}>
            Overview
          </button>
          <button onClick={() => setActiveTab("academic")} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "academic" ? "bg-purple-500/20 text-purple-400 border border-purple-500/30" : "text-gray-400 hover:text-white"}`}>
            Academic
          </button>
          <button onClick={() => setActiveTab("exams")} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "exams" ? "bg-orange-500/20 text-orange-400 border border-orange-500/30" : "text-gray-400 hover:text-white"}`}>
            Exams & Assignments
          </button>
          <button onClick={() => setActiveTab("achievements")} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "achievements" ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30" : "text-gray-400 hover:text-white"}`}>
            Achievements
          </button>
          <button onClick={() => setActiveTab("personal")} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "personal" ? "bg-green-500/20 text-green-400 border border-green-500/30" : "text-gray-400 hover:text-white"}`}>
            Personal Info
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/5 rounded-2xl p-4 text-center">
                <Award className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{academicData.averageScore}%</p>
                <p className="text-gray-400 text-sm">Average Score</p>
              </div>
              <div className="bg-white/5 rounded-2xl p-4 text-center">
                <Target className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{academicData.attendance}%</p>
                <p className="text-gray-400 text-sm">Attendance</p>
              </div>
              <div className="bg-white/5 rounded-2xl p-4 text-center">
                <TrendingUp className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">#{academicData.classRank}</p>
                <p className="text-gray-400 text-sm">Class Rank</p>
              </div>
              <div className="bg-white/5 rounded-2xl p-4 text-center">
                <Star className="w-8 h-8 text-orange-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{academicData.studyStreak}</p>
                <p className="text-gray-400 text-sm">Day Streak</p>
              </div>
            </div>

            {/* Recent Performance */}
            <div className="bg-white/5 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-400" /> Recent Performance
              </h2>
              <div className="space-y-4">
                {academicData.subjects.slice(0, 3).map((subject) => (
                  <div key={subject.name}>
                    <div className="flex justify-between mb-1">
                      <span className="text-white">{subject.name}</span>
                      <span className={`font-semibold ${getGradeColor(subject.grade)}`}>{subject.grade}</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600" style={{ width: `${subject.score}%` }} />
                    </div>
                    <p className="text-gray-400 text-xs mt-1">Teacher: {subject.teacher}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Insight */}
            <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-2xl p-6 border border-blue-500/30">
              <div className="flex items-center gap-3 mb-4">
                <Brain className="w-6 h-6 text-blue-400" />
                <h3 className="text-white font-semibold">AI Learning Insight</h3>
                <Sparkles className="w-4 h-4 text-yellow-400" />
              </div>
              <p className="text-gray-300 text-sm mb-4">
                Based on performance, {studentData.name} is showing strong improvement in Mathematics. 
                Focus on Chemistry practice problems to raise the score by 10-15%.
              </p>
              <div className="flex gap-2">
                <button className="px-3 py-1.5 rounded-lg bg-blue-500/20 text-blue-400 text-sm">Study Plan</button>
                <button className="px-3 py-1.5 rounded-lg bg-purple-500/20 text-purple-400 text-sm">Recommendations</button>
              </div>
            </div>

            {/* Quick Actions for Parents/Teachers */}
            {canMessage && (
              <div className="bg-white/5 rounded-2xl p-6">
                <h3 className="text-white font-semibold mb-4">Quick Actions</h3>
                <div className="flex gap-3 flex-wrap">
                  <button className="px-4 py-2 rounded-xl bg-blue-500/20 text-blue-400 text-sm flex items-center gap-2">
                    <MessageCircle className="w-4 h-4" /> Message Student
                  </button>
                  <button className="px-4 py-2 rounded-xl bg-purple-500/20 text-purple-400 text-sm flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4" /> Schedule Meeting
                  </button>
                  <button className="px-4 py-2 rounded-xl bg-green-500/20 text-green-400 text-sm flex items-center gap-2">
                    <Download className="w-4 h-4" /> Download Report
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Academic Tab */}
        {activeTab === "academic" && (
          <div className="bg-white/5 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">Subject Performance</h2>
            <div className="space-y-6">
              {academicData.subjects.map((subject) => (
                <div key={subject.name}>
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <span className="text-white font-semibold">{subject.name}</span>
                      <p className="text-gray-400 text-xs">Teacher: {subject.teacher}</p>
                    </div>
                    <div className="text-right">
                      <span className={`font-bold ${getGradeColor(subject.grade)}`}>{subject.grade}</span>
                      <p className="text-gray-400 text-xs">{subject.score}%</p>
                    </div>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2 mb-2">
                    <div className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600" style={{ width: `${subject.score}%` }} />
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Attendance: {subject.attendance}%</span>
                    {subject.trend === "up" && <span className="text-green-400">↑ Improving</span>}
                    {subject.trend === "down" && <span className="text-red-400">↓ Needs attention</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Exams & Assignments Tab */}
        {activeTab === "exams" && (
          <div className="space-y-6">
            <div className="bg-white/5 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-orange-400" /> Upcoming Exams
              </h2>
              <div className="space-y-3">
                {exams.map((exam, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                    <div>
                      <p className="text-white font-medium">{exam.name}</p>
                      <p className="text-gray-400 text-sm">{exam.subject} • {exam.venue}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white text-sm">{exam.date}</p>
                      <p className="text-gray-400 text-xs">{exam.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/5 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-400" /> Assignments
              </h2>
              <div className="space-y-3">
                {assignments.map((assignment, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                    <div>
                      <p className="text-white font-medium">{assignment.name}</p>
                      <p className="text-gray-400 text-sm">{assignment.subject}</p>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs px-2 py-1 rounded-full ${assignment.status === "submitted" ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"}`}>
                        {assignment.status}
                      </span>
                      <p className="text-gray-400 text-xs mt-1">Due: {assignment.dueDate}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Achievements Tab */}
        {activeTab === "achievements" && (
          <div className="bg-white/5 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-400" /> Achievements & Awards
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {achievements.map((achievement, idx) => (
                <div key={idx} className="flex items-center gap-4 p-4 bg-white/5 rounded-xl">
                  <div className="text-3xl">{achievement.icon}</div>
                  <div>
                    <p className="text-white font-medium">{achievement.title}</p>
                    <p className="text-gray-400 text-sm">{achievement.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Personal Info Tab */}
        {activeTab === "personal" && (
          <div className="bg-white/5 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-400" /> Personal Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                <Mail className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-gray-400 text-xs">Email</p>
                  <p className="text-white">{studentData.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                <Phone className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-gray-400 text-xs">Phone</p>
                  <p className="text-white">{studentData.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-gray-400 text-xs">Date of Birth</p>
                  <p className="text-white">{new Date(studentData.dateOfBirth).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                <Heart className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-gray-400 text-xs">Blood Group</p>
                  <p className="text-white">{studentData.bloodGroup}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                <Users className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-gray-400 text-xs">Guardian</p>
                  <p className="text-white">{studentData.guardianName}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                <Phone className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-gray-400 text-xs">Emergency Contact</p>
                  <p className="text-white">{studentData.emergencyContact}</p>
                </div>
              </div>
              <div className="md:col-span-2 flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                <MapPin className="w-5 h-5 text-gray-400" />
                <div className="flex-1">
                  <p className="text-gray-400 text-xs">Address</p>
                  <p className="text-white">{studentData.address}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
