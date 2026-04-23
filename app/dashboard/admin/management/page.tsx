'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Plus, Edit, Trash2, Save, X, Search, Filter, ChevronRight,
  BookOpen, Users, GraduationCap, Briefcase, Settings as SettingsIcon,
  School, Calendar, Clock, Award, Target, Bell, MessageCircle,
  Upload, Download, Eye, CheckCircle, AlertCircle, XCircle,
  ChevronDown, MoreVertical, Mail, Phone, MapPin, UserPlus,
  UserCheck, UserX, RefreshCw, Shield, Database, Server, Cpu,
  LogOut, Moon, Sun
} from 'lucide-react';
import { useTheme } from '@/components/theme-provider';
import ActionButtons from '@/app/components/ActionButtons';

// Types
interface Class {
  id: string;
  name: string;
  section: string;
  students: number;
  teacher: string;
  status: 'active' | 'inactive';
}

interface Subject {
  id: string;
  name: string;
  code: string;
  classId: string;
  teacherId: string;
  isElective: boolean;
}

interface Teacher {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  classes: string[];
  status: 'active' | 'inactive';
}

interface Student {
  id: string;
  name: string;
  admissionNo: string;
  classId: string;
  parentEmail: string;
  parentPhone: string;
  status: 'active' | 'inactive';
}

interface GradingRule {
  id: string;
  grade: string;
  minScore: number;
  maxScore: number;
  remark: string;
}

interface AssessmentWeight {
  id: string;
  type: string;
  percentage: number;
}

export default function AdminManagement() {
  const [user, setUser] = useState<any>(null);
  const [schoolName, setSchoolName] = useState('Your School');
  const [activeSection, setActiveSection] = useState('classes');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Mock Data - Classes
  const [classes, setClasses] = useState<Class[]>([
    { id: '1', name: 'SS1', section: 'Science', students: 45, teacher: 'Mrs. Adebayo', status: 'active' },
    { id: '2', name: 'SS1', section: 'Art', students: 38, teacher: 'Mr. Johnson', status: 'active' },
    { id: '3', name: 'SS2', section: 'Science', students: 42, teacher: 'Dr. Okonkwo', status: 'active' },
    { id: '4', name: 'SS2', section: 'Art', students: 35, teacher: 'Mrs. Eze', status: 'active' },
    { id: '5', name: 'SS3', section: 'Science', students: 40, teacher: 'Prof. Williams', status: 'active' },
    { id: '6', name: 'JSS1', section: 'A', students: 50, teacher: 'Mr. Adele', status: 'active' },
    { id: '7', name: 'JSS1', section: 'B', students: 48, teacher: 'Mrs. Okafor', status: 'active' },
  ]);

  // Mock Data - Subjects
  const [subjects, setSubjects] = useState<Subject[]>([
    { id: '1', name: 'Mathematics', code: 'MTH101', classId: '1', teacherId: '1', isElective: false },
    { id: '2', name: 'English', code: 'ENG101', classId: '1', teacherId: '2', isElective: false },
    { id: '3', name: 'Physics', code: 'PHY101', classId: '1', teacherId: '3', isElective: false },
    { id: '4', name: 'Chemistry', code: 'CHM101', classId: '1', teacherId: '4', isElective: false },
    { id: '5', name: 'Biology', code: 'BIO101', classId: '1', teacherId: '5', isElective: false },
    { id: '6', name: 'Economics', code: 'ECO101', classId: '2', teacherId: '6', isElective: true },
  ]);

  // Mock Data - Teachers
  const [teachers, setTeachers] = useState<Teacher[]>([
    { id: '1', name: 'Mrs. Adebayo', email: 'adebayo@school.com', phone: '+234 802 345 6789', subject: 'Mathematics', classes: ['SS1 Science'], status: 'active' },
    { id: '2', name: 'Mr. Johnson', email: 'johnson@school.com', phone: '+234 803 456 7890', subject: 'English', classes: ['SS1 Art'], status: 'active' },
    { id: '3', name: 'Dr. Okonkwo', email: 'okonkwo@school.com', phone: '+234 804 567 8901', subject: 'Physics', classes: ['SS2 Science'], status: 'active' },
    { id: '4', name: 'Mrs. Eze', email: 'eze@school.com', phone: '+234 805 678 9012', subject: 'Chemistry', classes: ['SS2 Art'], status: 'active' },
    { id: '5', name: 'Prof. Williams', email: 'williams@school.com', phone: '+234 806 789 0123', subject: 'Biology', classes: ['SS3 Science'], status: 'active' },
  ]);

  // Mock Data - Students
  const [students, setStudents] = useState<Student[]>([
    { id: '1', name: 'Adeola K.', admissionNo: 'STU001', classId: '1', parentEmail: 'parent.adeola@email.com', parentPhone: '+234 802 345 6789', status: 'active' },
    { id: '2', name: 'Bola T.', admissionNo: 'STU002', classId: '1', parentEmail: 'parent.bola@email.com', parentPhone: '+234 803 456 7890', status: 'active' },
    { id: '3', name: 'Chidi O.', admissionNo: 'STU003', classId: '3', parentEmail: 'parent.chidi@email.com', parentPhone: '+234 804 567 8901', status: 'active' },
    { id: '4', name: 'Esther N.', admissionNo: 'STU004', classId: '3', parentEmail: 'parent.esther@email.com', parentPhone: '+234 805 678 9012', status: 'active' },
    { id: '5', name: 'Faith A.', admissionNo: 'STU005', classId: '2', parentEmail: 'parent.faith@email.com', parentPhone: '+234 806 789 0123', status: 'active' },
  ]);

  // Mock Data - Grading Rules
  const [gradingRules, setGradingRules] = useState<GradingRule[]>([
    { id: '1', grade: 'A', minScore: 70, maxScore: 100, remark: 'Excellent' },
    { id: '2', grade: 'B', minScore: 50, maxScore: 69, remark: 'Good' },
    { id: '3', grade: 'C', minScore: 40, maxScore: 49, remark: 'Average' },
    { id: '4', grade: 'D', minScore: 30, maxScore: 39, remark: 'Pass' },
    { id: '5', grade: 'F', minScore: 0, maxScore: 29, remark: 'Fail' },
  ]);

  // Mock Data - Assessment Weights
  const [assessmentWeights, setAssessmentWeights] = useState<AssessmentWeight[]>([
    { id: '1', type: 'Test 1', percentage: 15 },
    { id: '2', type: 'Test 2', percentage: 15 },
    { id: '3', type: 'Exam', percentage: 70 },
  ]);

  // Form state for adding new items
  const [newClass, setNewClass] = useState({ name: '', section: '', teacher: '' });
  const [newSubject, setNewSubject] = useState({ name: '', code: '', classId: '', teacherId: '', isElective: false });
  const [newTeacher, setNewTeacher] = useState({ name: '', email: '', phone: '', subject: '' });
  const [newStudent, setNewStudent] = useState({ name: '', admissionNo: '', classId: '', parentEmail: '', parentPhone: '' });

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

  const sections = [
    { id: 'classes', label: 'Classes', icon: School, description: 'Manage classes and sections' },
    { id: 'subjects', label: 'Subjects', icon: BookOpen, description: 'Manage subjects and curriculum' },
    { id: 'teachers', label: 'Teachers', icon: Briefcase, description: 'Manage teacher profiles' },
    { id: 'students', label: 'Students', icon: GraduationCap, description: 'Manage student enrollment' },
    { id: 'grading', label: 'Grading Rules', icon: Award, description: 'Configure grade scales' },
    { id: 'weights', label: 'Assessment Weights', icon: Target, description: 'Set assessment percentages' },
  ];

  const filteredClasses = classes.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.section.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.teacher.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSubjects = subjects.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTeachers = teachers.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.admissionNo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddClass = () => {
    const newId = (classes.length + 1).toString();
    setClasses([...classes, { ...newClass, id: newId, students: 0, status: 'active' }]);
    setShowAddModal(false);
    setNewClass({ name: '', section: '', teacher: '' });
  };

  const handleAddSubject = () => {
    const newId = (subjects.length + 1).toString();
    setSubjects([...subjects, { ...newSubject, id: newId }]);
    setShowAddModal(false);
    setNewSubject({ name: '', code: '', classId: '', teacherId: '', isElective: false });
  };

  const handleAddTeacher = () => {
    const newId = (teachers.length + 1).toString();
    setTeachers([...teachers, { ...newTeacher, id: newId, classes: [], status: 'active' }]);
    setShowAddModal(false);
    setNewTeacher({ name: '', email: '', phone: '', subject: '' });
  };

  const handleAddStudent = () => {
    const newId = (students.length + 1).toString();
    setStudents([...students, { ...newStudent, id: newId, status: 'active' }]);
    setShowAddModal(false);
    setNewStudent({ name: '', admissionNo: '', classId: '', parentEmail: '', parentPhone: '' });
  };

  const handleDelete = (section: string, id: string) => {
    if (section === 'classes') setClasses(classes.filter(c => c.id !== id));
    if (section === 'subjects') setSubjects(subjects.filter(s => s.id !== id));
    if (section === 'teachers') setTeachers(teachers.filter(t => t.id !== id));
    if (section === 'students') setStudents(students.filter(s => s.id !== id));
  };

  const handleUpdateGradingRule = (id: string, field: string, value: number) => {
    setGradingRules(gradingRules.map(rule => 
      rule.id === id ? { ...rule, [field]: value } : rule
    ));
  };

  const handleUpdateWeight = (id: string, percentage: number) => {
    setAssessmentWeights(assessmentWeights.map(weight =>
      weight.id === id ? { ...weight, percentage } : weight
    ));
  };

  if (!mounted || !user) return null;
  if (user.role !== 'admin') { window.location.href = '/'; return null; }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      <ActionButtons />

      {/* Header */}
      <div className="relative z-10 bg-white/5 backdrop-blur-xl border-b border-white/10 sticky top-0 z-20">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Link href="/dashboard/admin">
                <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                  <ChevronRight className="w-5 h-5 text-white rotate-180" />
                </button>
              </Link>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">C</span>
                </div>
                <span className="text-white font-semibold hidden sm:inline">Classora</span>
                <span className="text-white/30 hidden sm:inline">•</span>
                <span className="text-white/80 text-sm">{schoolName}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <button onClick={toggleTheme} className="p-2 rounded-full bg-white/5">
                {theme === 'light' ? <Moon className="w-5 h-5 text-white/70" /> : <Sun className="w-5 h-5 text-yellow-400" />}
              </button>
              <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/20 text-red-400 text-sm hover:bg-red-500/30 transition-colors">
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">School Management</h1>
          <p className="text-gray-400">Configure classes, subjects, teachers, students, and academic rules</p>
        </div>

        {/* Section Navigation Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`p-4 rounded-2xl text-center transition-all ${
                activeSection === section.id
                  ? 'bg-gradient-to-r from-blue-600/30 to-indigo-600/30 border border-blue-500/50'
                  : 'bg-white/5 border border-white/10 hover:bg-white/10'
              }`}
            >
              <section.icon className={`w-8 h-8 mx-auto mb-2 ${activeSection === section.id ? 'text-blue-400' : 'text-gray-400'}`} />
              <p className={`text-sm font-medium ${activeSection === section.id ? 'text-white' : 'text-gray-400'}`}>{section.label}</p>
              <p className="text-xs text-gray-500 mt-1 hidden lg:block">{section.description}</p>
            </button>
          ))}
        </div>

        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={`Search ${activeSection}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-blue-500 outline-none"
            />
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-medium hover:shadow-xl transition-all flex items-center gap-2 justify-center"
          >
            <Plus className="w-4 h-4" />
            Add New {activeSection.slice(0, -1).charAt(0).toUpperCase() + activeSection.slice(0, -1).slice(1)}
          </button>
        </div>

        {/* CLASSES SECTION */}
        {activeSection === 'classes' && (
          <div className="rounded-2xl overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-white/10 bg-white/5">
                  <tr className="text-left text-gray-400 text-sm">
                    <th className="p-4">Class Name</th>
                    <th className="p-4">Section</th>
                    <th className="p-4">Students</th>
                    <th className="p-4">Class Teacher</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {filteredClasses.map((classItem) => (
                    <tr key={classItem.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-4 text-white font-medium">{classItem.name}</td>
                      <td className="p-4 text-gray-300">{classItem.section}</td>
                      <td className="p-4 text-gray-300">{classItem.students}</td>
                      <td className="p-4 text-gray-300">{classItem.teacher}</td>
                      <td className="p-4">
                        <span className={`text-xs px-2 py-1 rounded-full ${classItem.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                          {classItem.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <button className="p-1 rounded-lg hover:bg-white/10 transition-colors">
                            <Edit className="w-4 h-4 text-gray-400" />
                          </button>
                          <button onClick={() => handleDelete('classes', classItem.id)} className="p-1 rounded-lg hover:bg-red-500/10 transition-colors">
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SUBJECTS SECTION */}
        {activeSection === 'subjects' && (
          <div className="rounded-2xl overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-white/10 bg-white/5">
                  <tr className="text-left text-gray-400 text-sm">
                    <th className="p-4">Subject Name</th>
                    <th className="p-4">Subject Code</th>
                    <th className="p-4">Class</th>
                    <th className="p-4">Teacher</th>
                    <th className="p-4">Type</th>
                    <th className="p-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {filteredSubjects.map((subject) => {
                    const className = classes.find(c => c.id === subject.classId);
                    const teacherName = teachers.find(t => t.id === subject.teacherId);
                    return (
                      <tr key={subject.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-4 text-white font-medium">{subject.name}</td>
                        <td className="p-4 text-gray-300">{subject.code}</td>
                        <td className="p-4 text-gray-300">{className ? `${className.name} ${className.section}` : '-'}</td>
                        <td className="p-4 text-gray-300">{teacherName?.name || '-'}</td>
                        <td className="p-4">
                          <span className={`text-xs px-2 py-1 rounded-full ${subject.isElective ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'}`}>
                            {subject.isElective ? 'Elective' : 'Core'}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <button className="p-1 rounded-lg hover:bg-white/10 transition-colors">
                              <Edit className="w-4 h-4 text-gray-400" />
                            </button>
                            <button onClick={() => handleDelete('subjects', subject.id)} className="p-1 rounded-lg hover:bg-red-500/10 transition-colors">
                              <Trash2 className="w-4 h-4 text-red-400" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TEACHERS SECTION */}
        {activeSection === 'teachers' && (
          <div className="rounded-2xl overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-white/10 bg-white/5">
                  <tr className="text-left text-gray-400 text-sm">
                    <th className="p-4">Teacher Name</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Phone</th>
                    <th className="p-4">Subject</th>
                    <th className="p-4">Classes</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {filteredTeachers.map((teacher) => (
                    <tr key={teacher.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-4 text-white font-medium">{teacher.name}</td>
                      <td className="p-4 text-gray-300">{teacher.email}</td>
                      <td className="p-4 text-gray-300">{teacher.phone}</td>
                      <td className="p-4 text-gray-300">{teacher.subject}</td>
                      <td className="p-4 text-gray-300">{teacher.classes.join(', ')}</td>
                      <td className="p-4">
                        <span className={`text-xs px-2 py-1 rounded-full ${teacher.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                          {teacher.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <button className="p-1 rounded-lg hover:bg-white/10 transition-colors">
                            <Edit className="w-4 h-4 text-gray-400" />
                          </button>
                          <button onClick={() => handleDelete('teachers', teacher.id)} className="p-1 rounded-lg hover:bg-red-500/10 transition-colors">
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </button>
                        </div>
                       </td>
                     </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* STUDENTS SECTION */}
        {activeSection === 'students' && (
          <div className="rounded-2xl overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-white/10 bg-white/5">
                  <tr className="text-left text-gray-400 text-sm">
                    <th className="p-4">Student Name</th>
                    <th className="p-4">Admission No</th>
                    <th className="p-4">Class</th>
                    <th className="p-4">Parent Email</th>
                    <th className="p-4">Parent Phone</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Actions</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {filteredStudents.map((student) => {
                    const className = classes.find(c => c.id === student.classId);
                    return (
                      <tr key={student.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-4 text-white font-medium">{student.name}</td>
                        <td className="p-4 text-gray-300">{student.admissionNo}</td>
                        <td className="p-4 text-gray-300">{className ? `${className.name} ${className.section}` : '-'}</td>
                        <td className="p-4 text-gray-300">{student.parentEmail}</td>
                        <td className="p-4 text-gray-300">{student.parentPhone}</td>
                        <td className="p-4">
                          <span className={`text-xs px-2 py-1 rounded-full ${student.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                            {student.status}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <button className="p-1 rounded-lg hover:bg-white/10 transition-colors">
                              <Edit className="w-4 h-4 text-gray-400" />
                            </button>
                            <button onClick={() => handleDelete('students', student.id)} className="p-1 rounded-lg hover:bg-red-500/10 transition-colors">
                              <Trash2 className="w-4 h-4 text-red-400" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* GRADING RULES SECTION */}
        {activeSection === 'grading' && (
          <div className="rounded-2xl overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10">
            <div className="p-6 border-b border-white/10">
              <h2 className="text-xl font-bold text-white">Grade Scale Configuration</h2>
              <p className="text-gray-400 text-sm mt-1">Set the minimum and maximum scores for each grade</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-white/10 bg-white/5">
                  <tr className="text-left text-gray-400 text-sm">
                    <th className="p-4">Grade</th>
                    <th className="p-4">Minimum Score (%)</th>
                    <th className="p-4">Maximum Score (%)</th>
                    <th className="p-4">Remark</th>
                    <th className="p-4">Actions</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {gradingRules.map((rule) => (
                    <tr key={rule.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-4 text-white font-bold text-lg">{rule.grade}</td>
                      <td className="p-4">
                        <input
                          type="number"
                          value={rule.minScore}
                          onChange={(e) => handleUpdateGradingRule(rule.id, 'minScore', parseInt(e.target.value))}
                          className="w-24 px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-white focus:border-blue-500 outline-none"
                        />
                      </td>
                      <td className="p-4">
                        <input
                          type="number"
                          value={rule.maxScore}
                          onChange={(e) => handleUpdateGradingRule(rule.id, 'maxScore', parseInt(e.target.value))}
                          className="w-24 px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-white focus:border-blue-500 outline-none"
                        />
                      </td>
                      <td className="p-4 text-gray-300">{rule.remark}</td>
                      <td className="p-4">
                        <button className="p-1 rounded-lg hover:bg-green-500/20 transition-colors">
                          <Save className="w-4 h-4 text-green-400" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-4 bg-blue-500/10 border-t border-blue-500/30">
              <p className="text-blue-400 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Note: Grades are automatically calculated based on these rules after marksheet upload
              </p>
            </div>
          </div>
        )}

        {/* ASSESSMENT WEIGHTS SECTION */}
        {activeSection === 'weights' && (
          <div className="rounded-2xl overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10">
            <div className="p-6 border-b border-white/10">
              <h2 className="text-xl font-bold text-white">Assessment Weights</h2>
              <p className="text-gray-400 text-sm mt-1">Configure how different assessments contribute to final grades</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-white/10 bg-white/5">
                  <tr className="text-left text-gray-400 text-sm">
                    <th className="p-4">Assessment Type</th>
                    <th className="p-4">Percentage (%)</th>
                    <th className="p-4">Actions</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {assessmentWeights.map((weight) => (
                    <tr key={weight.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-4 text-white font-medium">{weight.type}</td>
                      <td className="p-4">
                        <input
                          type="number"
                          value={weight.percentage}
                          onChange={(e) => handleUpdateWeight(weight.id, parseInt(e.target.value))}
                          className="w-24 px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-white focus:border-blue-500 outline-none"
                        />
                      </td>
                      <td className="p-4">
                        <button className="p-1 rounded-lg hover:bg-green-500/20 transition-colors">
                          <Save className="w-4 h-4 text-green-400" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-4 bg-yellow-500/10 border-t border-yellow-500/30">
              <p className="text-yellow-400 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Total percentage should equal 100%. Current total: {assessmentWeights.reduce((sum, w) => sum + w.percentage, 0)}%
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Add Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md rounded-2xl bg-white/10 backdrop-blur-2xl border border-white/20 p-6"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-white">
                  Add New {activeSection.slice(0, -1).charAt(0).toUpperCase() + activeSection.slice(0, -1).slice(1)}
                </h3>
                <button onClick={() => setShowAddModal(false)} className="p-1 rounded-lg hover:bg-white/10">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Add Class Form */}
              {activeSection === 'classes' && (
                <div className="space-y-4">
                  <input type="text" placeholder="Class Name (e.g., SS1, SS2, JSS1)" value={newClass.name} onChange={(e) => setNewClass({ ...newClass, name: e.target.value })} className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-blue-500 outline-none" />
                  <input type="text" placeholder="Section (e.g., Science, Art, A, B)" value={newClass.section} onChange={(e) => setNewClass({ ...newClass, section: e.target.value })} className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-blue-500 outline-none" />
                  <select value={newClass.teacher} onChange={(e) => setNewClass({ ...newClass, teacher: e.target.value })} className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:border-blue-500 outline-none">
                    <option value="">Select Class Teacher</option>
                    {teachers.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
                  </select>
                  <button onClick={handleAddClass} className="w-full py-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold">Create Class</button>
                </div>
              )}

              {/* Add Subject Form */}
              {activeSection === 'subjects' && (
                <div className="space-y-4">
                  <input type="text" placeholder="Subject Name" value={newSubject.name} onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })} className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-blue-500 outline-none" />
                  <input type="text" placeholder="Subject Code" value={newSubject.code} onChange={(e) => setNewSubject({ ...newSubject, code: e.target.value })} className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-blue-500 outline-none" />
                  <select value={newSubject.classId} onChange={(e) => setNewSubject({ ...newSubject, classId: e.target.value })} className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:border-blue-500 outline-none">
                    <option value="">Select Class</option>
                    {classes.map(c => <option key={c.id} value={c.id}>{c.name} {c.section}</option>)}
                  </select>
                  <select value={newSubject.teacherId} onChange={(e) => setNewSubject({ ...newSubject, teacherId: e.target.value })} className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:border-blue-500 outline-none">
                    <option value="">Select Teacher</option>
                    {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                  <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={newSubject.isElective} onChange={(e) => setNewSubject({ ...newSubject, isElective: e.target.checked })} className="w-4 h-4" /><span className="text-gray-300">Elective Subject</span></label>
                  <button onClick={handleAddSubject} className="w-full py-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold">Create Subject</button>
                </div>
              )}

              {/* Add Teacher Form */}
              {activeSection === 'teachers' && (
                <div className="space-y-4">
                  <input type="text" placeholder="Full Name" value={newTeacher.name} onChange={(e) => setNewTeacher({ ...newTeacher, name: e.target.value })} className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-blue-500 outline-none" />
                  <input type="email" placeholder="Email Address" value={newTeacher.email} onChange={(e) => setNewTeacher({ ...newTeacher, email: e.target.value })} className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-blue-500 outline-none" />
                  <input type="tel" placeholder="Phone Number" value={newTeacher.phone} onChange={(e) => setNewTeacher({ ...newTeacher, phone: e.target.value })} className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-blue-500 outline-none" />
                  <input type="text" placeholder="Subject Specialization" value={newTeacher.subject} onChange={(e) => setNewTeacher({ ...newTeacher, subject: e.target.value })} className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-blue-500 outline-none" />
                  <button onClick={handleAddTeacher} className="w-full py-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold">Add Teacher</button>
                </div>
              )}

              {/* Add Student Form */}
              {activeSection === 'students' && (
                <div className="space-y-4">
                  <input type="text" placeholder="Full Name" value={newStudent.name} onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })} className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-blue-500 outline-none" />
                  <input type="text" placeholder="Admission Number" value={newStudent.admissionNo} onChange={(e) => setNewStudent({ ...newStudent, admissionNo: e.target.value })} className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-blue-500 outline-none" />
                  <select value={newStudent.classId} onChange={(e) => setNewStudent({ ...newStudent, classId: e.target.value })} className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:border-blue-500 outline-none">
                    <option value="">Select Class</option>
                    {classes.map(c => <option key={c.id} value={c.id}>{c.name} {c.section}</option>)}
                  </select>
                  <input type="email" placeholder="Parent Email" value={newStudent.parentEmail} onChange={(e) => setNewStudent({ ...newStudent, parentEmail: e.target.value })} className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-blue-500 outline-none" />
                  <input type="tel" placeholder="Parent Phone" value={newStudent.parentPhone} onChange={(e) => setNewStudent({ ...newStudent, parentPhone: e.target.value })} className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-blue-500 outline-none" />
                  <button onClick={handleAddStudent} className="w-full py-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold">Enroll Student</button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        @keyframes float { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(30px, -30px); } }
        @keyframes float-delayed { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(-30px, 30px); } }
        .animate-float { animation: float 12s ease-in-out infinite; }
        .animate-float-delayed { animation: float-delayed 14s ease-in-out infinite; }
      `}</style>
    </div>
  );
}