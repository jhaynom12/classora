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
  LogOut, Moon, Sun, Loader
} from 'lucide-react';
import { useTheme } from '@/components/theme-provider';
import ActionButtons from '@/app/components/ActionButtons';
import BulkUserManager from '@/app/components/BulkUserManager';
import Toast, { showToast } from '@/app/components/Toast';

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

  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Loading states for individual operations
  const [isAddingClass, setIsAddingClass] = useState(false);
  const [isAddingSubject, setIsAddingSubject] = useState(false);
  const [isAddingTeacher, setIsAddingTeacher] = useState(false);
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // Grading and assessment state
  const [gradingRules, setGradingRules] = useState<GradingRule[]>([
    { id: '1', grade: 'A', minScore: 70, maxScore: 100, remark: 'Excellent' },
    { id: '2', grade: 'B', minScore: 50, maxScore: 69, remark: 'Good' },
    { id: '3', grade: 'C', minScore: 0, maxScore: 49, remark: 'Pass' }
  ]);

  const [assessmentWeights, setAssessmentWeights] = useState<AssessmentWeight[]>([
    { id: '1', type: 'Test 1', percentage: 15 },
    { id: '2', type: 'Test 2', percentage: 15 },
    { id: '3', type: 'Final Exam', percentage: 70 }
  ]);

  // Form state for adding new items
  const [newClass, setNewClass] = useState({ name: '', section: '', teacher: '' });
  const [newSubject, setNewSubject] = useState({ name: '', code: '', classId: '', teacherId: '', isElective: false });
  const [newTeacher, setNewTeacher] = useState({ name: '', email: '', phone: '', subject: '' });
  const [newStudent, setNewStudent] = useState({ name: '', admissionNo: '', classId: '', parentEmail: '', parentPhone: '' });

  const getAuthHeaders = () => {
    const token = localStorage.getItem('classora_token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
  };

  useEffect(() => {
    setMounted(true);
    const savedUser = localStorage.getItem('classora_user');
    const savedSchool = localStorage.getItem('classora_school_name');
    
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      console.log('Loaded user from localStorage:', parsedUser);
      
      if (savedSchool) setSchoolName(savedSchool);
    } else {
      console.log('No saved user, redirecting to login');
      window.location.href = '/';
    }
  }, []);

  useEffect(() => {
    if (user?.schoolId) {
      console.log('User set with schoolId:', user.schoolId);
      fetchSchoolInfo();
      fetchAllData();
    }
  }, [user?.schoolId]);

  const fetchSchoolInfo = async () => {
    if (user?.schoolId) {
      try {
        const response = await fetch(`/api/school?schoolId=${user.schoolId}`, {
          headers: { ...getAuthHeaders(), 'Cache-Control': 'no-cache' }
        });
        if (response.ok) {
          const school = await response.json();
          setSchoolName(school.name);
          localStorage.setItem('classora_school_name', school.name);
        }
      } catch (error) {
        console.error('Failed to fetch school info:', error);
      }
    }
  };

  const fetchAllData = async () => {
    if (!user?.schoolId) return;
    
    setLoading(true);
    console.log('Fetching all data for school:', user.schoolId);
    try {
      await Promise.all([
        fetchClasses(),
        fetchSubjects(),
        fetchTeachers(),
        fetchStudents()
      ]);
      console.log('All data fetched successfully');
    } catch (error) {
      console.error('Failed to fetch data:', error);
      showToast('Failed to load data', 'error');
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    const response = await fetch(`/api/classes?schoolId=${user.schoolId}`, {
      headers: { ...getAuthHeaders(), 'Cache-Control': 'no-cache' }
    });
    if (response.ok) {
      const data = await response.json();
      setClasses(data.map((cls: any) => ({
        id: cls.id,
        name: cls.name,
        section: cls.section,
        students: cls._count?.enrollments || 0,
        teacher: cls.teacher?.name || 'Not assigned',
        status: cls.status
      })));
    }
  };

  const fetchSubjects = async () => {
    const response = await fetch(`/api/subjects?schoolId=${user.schoolId}`, {
      headers: { ...getAuthHeaders(), 'Cache-Control': 'no-cache' }
    });
    if (response.ok) {
      const data = await response.json();
      setSubjects(data);
    }
  };

  const fetchTeachers = async () => {
    const response = await fetch(`/api/teachers?schoolId=${user.schoolId}`, {
      headers: { ...getAuthHeaders(), 'Cache-Control': 'no-cache' }
    });
    if (response.ok) {
      const data = await response.json();
      setTeachers(data.map((teacher: any) => ({
        id: teacher.id,
        name: teacher.name,
        email: teacher.email,
        phone: teacher.phone || '',
        subject: teacher.classSubjects?.[0]?.subject?.name || 'Not assigned',
        classes: teacher.classSubjects?.map((cs: any) => cs.class.name) || [],
        status: teacher.isActive ? 'active' : 'inactive'
      })));
    }
  };

  const fetchStudents = async () => {
    const response = await fetch(`/api/students?schoolId=${user.schoolId}`, {
      headers: { ...getAuthHeaders(), 'Cache-Control': 'no-cache' }
    });
    if (response.ok) {
      const data = await response.json();
      setStudents(data.map((student: any) => ({
        id: student.id,
        name: student.name,
        admissionNo: student.studentId || '',
        classId: student.enrollments?.[0]?.classId || '',
        parentEmail: student.parentChildren?.[0]?.parent?.email || '',
        parentPhone: student.parentChildren?.[0]?.parent?.phone || '',
        status: student.isActive ? 'active' : 'inactive'
      })));
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/';
  };

  const sections = [
    { id: 'bulk', label: 'Bulk Import', icon: Upload, description: 'Import users from CSV' },
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

  const handleAddClass = async () => {
    if (!newClass.name || !newClass.section) {
      showToast('Please fill in all fields', 'warning');
      return;
    }

    setIsAddingClass(true);
    console.log('Adding class:', newClass);
    
    try {
      const response = await fetch(`/api/classes?schoolId=${user.schoolId}`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          name: newClass.name,
          section: newClass.section,
          level: 1,
          status: 'active'
        })
      });

      console.log('Add class response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Class added successfully:', data);
        showToast(`Class "${newClass.name}" added successfully!`, 'success');
        await fetchClasses();
        setShowAddModal(false);
        setNewClass({ name: '', section: '', teacher: '' });
      } else {
        const error = await response.json();
        console.error('Failed to add class:', error);
        showToast(error.error || 'Failed to add class', 'error');
      }
    } catch (error) {
      console.error('Error adding class:', error);
      showToast('Error adding class. Check console for details.', 'error');
    } finally {
      setIsAddingClass(false);
    }
  };

  const handleAddSubject = async () => {
    if (!newSubject.name || !newSubject.code) {
      showToast('Please fill in all fields', 'warning');
      return;
    }

    setIsAddingSubject(true);
    console.log('Adding subject:', newSubject);
    
    try {
      const response = await fetch(`/api/subjects?schoolId=${user.schoolId}`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          name: newSubject.name,
          code: newSubject.code,
          isElective: newSubject.isElective
        })
      });

      console.log('Add subject response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Subject added successfully:', data);
        showToast(`Subject "${newSubject.name}" added successfully!`, 'success');
        await fetchSubjects();
        setShowAddModal(false);
        setNewSubject({ name: '', code: '', classId: '', teacherId: '', isElective: false });
      } else {
        const error = await response.json();
        console.error('Failed to add subject:', error);
        showToast(error.error || 'Failed to add subject', 'error');
      }
    } catch (error) {
      console.error('Error adding subject:', error);
      showToast('Error adding subject. Check console for details.', 'error');
    } finally {
      setIsAddingSubject(false);
    }
  };

  const handleAddTeacher = async () => {
    if (!newTeacher.name || !newTeacher.email) {
      showToast('Please fill in all fields', 'warning');
      return;
    }

    setIsAddingTeacher(true);
    console.log('Adding teacher:', newTeacher);
    
    try {
      const response = await fetch(`/api/teachers?schoolId=${user.schoolId}`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          name: newTeacher.name,
          email: newTeacher.email,
          password: 'teacher123',
          phone: newTeacher.phone,
          staffId: `TCH${Date.now()}`
        })
      });

      console.log('Add teacher response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Teacher added successfully:', data);
        showToast(`Teacher "${newTeacher.name}" added successfully!`, 'success');
        await fetchTeachers();
        setShowAddModal(false);
        setNewTeacher({ name: '', email: '', phone: '', subject: '' });
      } else {
        const error = await response.json();
        console.error('Failed to add teacher:', error);
        showToast(error.error || 'Failed to add teacher', 'error');
      }
    } catch (error) {
      console.error('Error adding teacher:', error);
      showToast('Error adding teacher. Check console for details.', 'error');
    } finally {
      setIsAddingTeacher(false);
    }
  };

  const handleAddStudent = async () => {
    if (!newStudent.name || !newStudent.admissionNo || !newStudent.classId) {
      showToast('Please fill in all required fields', 'warning');
      return;
    }

    setIsAddingStudent(true);
    console.log('Adding student:', newStudent);
    
    try {
      const sanitizedName = newStudent.name.trim().toLowerCase().replace(/\s+/g, '.');
      const generatedEmail = `${sanitizedName}.${newStudent.admissionNo}@school.com`;
      const response = await fetch(`/api/students?schoolId=${user.schoolId}`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          name: newStudent.name,
          email: generatedEmail,
          password: 'student123',
          studentId: newStudent.admissionNo,
          phone: newStudent.parentPhone,
          classId: newStudent.classId,
          parentEmail: newStudent.parentEmail
        })
      });

      console.log('Add student response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Student added successfully:', data);
        showToast(`Student "${newStudent.name}" enrolled successfully!`, 'success');
        await fetchStudents();
        setShowAddModal(false);
        setNewStudent({ name: '', admissionNo: '', classId: '', parentEmail: '', parentPhone: '' });
      } else {
        const error = await response.json();
        console.error('Failed to add student:', error);
        showToast(error.error || 'Failed to add student', 'error');
      }
    } catch (error) {
      console.error('Error adding student:', error);
      showToast('Error adding student. Check console for details.', 'error');
    } finally {
      setIsAddingStudent(false);
    }
  };

  const handleDelete = async (section: string, id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) {
      return;
    }

    setIsDeleting(id);
    console.log('Deleting:', section, id);
    
    try {
      let endpoint = '';
      if (section === 'classes') endpoint = `/api/classes?classId=${id}`;
      if (section === 'subjects') endpoint = `/api/subjects?subjectId=${id}`;
      if (section === 'teachers') endpoint = `/api/teachers?teacherId=${id}`;
      if (section === 'students') endpoint = `/api/students?studentId=${id}`;

      if (endpoint) {
        const response = await fetch(endpoint, {
          method: 'DELETE',
          headers: getAuthHeaders()
        });

        console.log('Delete response status:', response.status);

        if (response.ok) {
          console.log('Item deleted successfully');
          showToast('Item deleted successfully!', 'success');
          if (section === 'classes') await fetchClasses();
          if (section === 'subjects') await fetchSubjects();
          if (section === 'teachers') await fetchTeachers();
          if (section === 'students') await fetchStudents();
        } else {
          const error = await response.json();
          console.error('Failed to delete:', error);
          showToast(error.error || 'Failed to delete item', 'error');
        }
      }
    } catch (error) {
      console.error('Error deleting:', error);
      showToast('Error deleting item. Check console for details.', 'error');
    } finally {
      setIsDeleting(null);
    }
  };

  const handleOpenEditModal = (item: any) => {
    console.log('Opening edit modal for:', item);
    setSelectedItem(item);
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedItem) return;

    setIsSavingEdit(true);
    console.log('Saving edit:', activeSection, selectedItem);

    try {
      let endpoint = '';
      let body = {};

      if (activeSection === 'classes') {
        endpoint = `/api/classes?classId=${selectedItem.id}`;
        body = { name: selectedItem.name, section: selectedItem.section };
      }
      if (activeSection === 'subjects') {
        endpoint = `/api/subjects?subjectId=${selectedItem.id}`;
        body = { name: selectedItem.name, code: selectedItem.code, isElective: selectedItem.isElective };
      }
      if (activeSection === 'teachers') {
        endpoint = `/api/teachers?teacherId=${selectedItem.id}`;
        body = { name: selectedItem.name, email: selectedItem.email, phone: selectedItem.phone };
      }
      if (activeSection === 'students') {
        endpoint = `/api/students?studentId=${selectedItem.id}`;
        body = { 
          name: selectedItem.name, 
          studentId: selectedItem.admissionNo,
          phone: selectedItem.parentPhone,
          isActive: selectedItem.status === 'active'
        };
      }

      if (endpoint) {
        const response = await fetch(endpoint, {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify(body)
        });

        console.log('Save edit response status:', response.status);

        if (response.ok) {
          const data = await response.json();
          console.log('Edit saved successfully:', data);
          showToast('Changes saved successfully!', 'success');
          if (activeSection === 'classes') await fetchClasses();
          if (activeSection === 'subjects') await fetchSubjects();
          if (activeSection === 'teachers') await fetchTeachers();
          if (activeSection === 'students') await fetchStudents();
          setShowEditModal(false);
          setSelectedItem(null);
        } else {
          const error = await response.json();
          console.error('Failed to save edit:', error);
          showToast(error.error || 'Failed to save changes', 'error');
        }
      }
    } catch (error) {
      console.error('Error saving edit:', error);
      showToast('Error saving changes. Check console for details.', 'error');
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setSelectedItem(null);
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
      <Toast />
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
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-medium hover:shadow-xl transition-all flex items-center gap-2 justify-center disabled:opacity-50"
            disabled={isAddingClass || isAddingSubject || isAddingTeacher || isAddingStudent}
          >
            <Plus className="w-4 h-4" />
            Add New {activeSection.slice(0, -1).charAt(0).toUpperCase() + activeSection.slice(0, -1).slice(1)}
          </button>
        </div>

        {/* BULK IMPORT SECTION */}
        {activeSection === 'bulk' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl p-8 bg-white/5 backdrop-blur-xl border border-white/10"
          >
            <h2 className="text-2xl font-bold text-white mb-6">Bulk User Import/Export</h2>
            <BulkUserManager schoolId={user?.schoolId || 'default-school'} onSuccess={() => setSearchTerm('')} />
          </motion.div>
        )}

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
                          <button 
                            onClick={() => handleOpenEditModal(classItem)} 
                            className="p-1 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50"
                            disabled={isSavingEdit || isDeleting === classItem.id}
                          >
                            <Edit className="w-4 h-4 text-gray-400" />
                          </button>
                          <button 
                            onClick={() => handleDelete('classes', classItem.id)} 
                            className="p-1 rounded-lg hover:bg-red-500/10 transition-colors disabled:opacity-50"
                            disabled={isDeleting === classItem.id}
                          >
                            {isDeleting === classItem.id ? <Loader className="w-4 h-4 text-red-400 animate-spin" /> : <Trash2 className="w-4 h-4 text-red-400" />}
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
                            <button 
                              onClick={() => handleOpenEditModal(subject)} 
                              className="p-1 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50"
                              disabled={isSavingEdit || isDeleting === subject.id}
                            >
                              <Edit className="w-4 h-4 text-gray-400" />
                            </button>
                            <button 
                              onClick={() => handleDelete('subjects', subject.id)} 
                              className="p-1 rounded-lg hover:bg-red-500/10 transition-colors disabled:opacity-50"
                              disabled={isDeleting === subject.id}
                            >
                              {isDeleting === subject.id ? <Loader className="w-4 h-4 text-red-400 animate-spin" /> : <Trash2 className="w-4 h-4 text-red-400" />}
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
                          <button 
                            onClick={() => handleOpenEditModal(teacher)} 
                            className="p-1 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50"
                            disabled={isSavingEdit || isDeleting === teacher.id}
                          >
                            <Edit className="w-4 h-4 text-gray-400" />
                          </button>
                          <button 
                            onClick={() => handleDelete('teachers', teacher.id)} 
                            className="p-1 rounded-lg hover:bg-red-500/10 transition-colors disabled:opacity-50"
                            disabled={isDeleting === teacher.id}
                          >
                            {isDeleting === teacher.id ? <Loader className="w-4 h-4 text-red-400 animate-spin" /> : <Trash2 className="w-4 h-4 text-red-400" />}
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
                            <button 
                              onClick={() => handleOpenEditModal(student)} 
                              className="p-1 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50"
                              disabled={isSavingEdit || isDeleting === student.id}
                            >
                              <Edit className="w-4 h-4 text-gray-400" />
                            </button>
                            <button 
                              onClick={() => handleDelete('students', student.id)} 
                              className="p-1 rounded-lg hover:bg-red-500/10 transition-colors disabled:opacity-50"
                              disabled={isDeleting === student.id}
                            >
                              {isDeleting === student.id ? <Loader className="w-4 h-4 text-red-400 animate-spin" /> : <Trash2 className="w-4 h-4 text-red-400" />}
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
                  <input type="text" placeholder="Class Name (e.g., SS1, SS2, JSS1)" value={newClass.name} onChange={(e) => setNewClass({ ...newClass, name: e.target.value })} disabled={isAddingClass} className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-blue-500 outline-none disabled:opacity-50" />
                  <input type="text" placeholder="Section (e.g., Science, Art, A, B)" value={newClass.section} onChange={(e) => setNewClass({ ...newClass, section: e.target.value })} disabled={isAddingClass} className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-blue-500 outline-none disabled:opacity-50" />
                  <select value={newClass.teacher} onChange={(e) => setNewClass({ ...newClass, teacher: e.target.value })} disabled={isAddingClass} className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:border-blue-500 outline-none disabled:opacity-50">
                    <option value="" className="bg-gray-800">Select Class Teacher</option>
                    {teachers.map(t => <option key={t.id} value={t.name} className="bg-gray-800">{t.name}</option>)}
                  </select>
                  <button 
                    onClick={handleAddClass} 
                    disabled={isAddingClass}
                    className="w-full py-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isAddingClass ? <Loader className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    {isAddingClass ? 'Creating...' : 'Create Class'}
                  </button>
                </div>
              )}

              {/* Add Subject Form */}
              {activeSection === 'subjects' && (
                <div className="space-y-4">
                  <input type="text" placeholder="Subject Name" value={newSubject.name} onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })} disabled={isAddingSubject} className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-blue-500 outline-none disabled:opacity-50" />
                  <input type="text" placeholder="Subject Code" value={newSubject.code} onChange={(e) => setNewSubject({ ...newSubject, code: e.target.value })} disabled={isAddingSubject} className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-blue-500 outline-none disabled:opacity-50" />
                  <select value={newSubject.classId} onChange={(e) => setNewSubject({ ...newSubject, classId: e.target.value })} disabled={isAddingSubject} className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:border-blue-500 outline-none disabled:opacity-50">
                    <option value="" className="bg-gray-800">Select Class</option>
                    {classes.map(c => <option key={c.id} value={c.id} className="bg-gray-800">{c.name} {c.section}</option>)}
                  </select>
                  <select value={newSubject.teacherId} onChange={(e) => setNewSubject({ ...newSubject, teacherId: e.target.value })} disabled={isAddingSubject} className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:border-blue-500 outline-none disabled:opacity-50">
                    <option value="" className="bg-gray-800">Select Teacher</option>
                    {teachers.map(t => <option key={t.id} value={t.id} className="bg-gray-800">{t.name}</option>)}
                  </select>
                  <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={newSubject.isElective} onChange={(e) => setNewSubject({ ...newSubject, isElective: e.target.checked })} disabled={isAddingSubject} className="w-4 h-4" /><span className="text-gray-300">Elective Subject</span></label>
                  <button 
                    onClick={handleAddSubject} 
                    disabled={isAddingSubject}
                    className="w-full py-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isAddingSubject ? <Loader className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    {isAddingSubject ? 'Creating...' : 'Create Subject'}
                  </button>
                </div>
              )}

              {/* Add Teacher Form */}
              {activeSection === 'teachers' && (
                <div className="space-y-4">
                  <input type="text" placeholder="Full Name" value={newTeacher.name} onChange={(e) => setNewTeacher({ ...newTeacher, name: e.target.value })} disabled={isAddingTeacher} className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-blue-500 outline-none disabled:opacity-50" />
                  <input type="email" placeholder="Email Address" value={newTeacher.email} onChange={(e) => setNewTeacher({ ...newTeacher, email: e.target.value })} disabled={isAddingTeacher} className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-blue-500 outline-none disabled:opacity-50" />
                  <input type="tel" placeholder="Phone Number" value={newTeacher.phone} onChange={(e) => setNewTeacher({ ...newTeacher, phone: e.target.value })} disabled={isAddingTeacher} className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-blue-500 outline-none disabled:opacity-50" />
                  <input type="text" placeholder="Subject Specialization" value={newTeacher.subject} onChange={(e) => setNewTeacher({ ...newTeacher, subject: e.target.value })} disabled={isAddingTeacher} className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-blue-500 outline-none disabled:opacity-50" />
                  <button 
                    onClick={handleAddTeacher} 
                    disabled={isAddingTeacher}
                    className="w-full py-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isAddingTeacher ? <Loader className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    {isAddingTeacher ? 'Adding...' : 'Add Teacher'}
                  </button>
                </div>
              )}

              {/* Add Student Form */}
              {activeSection === 'students' && (
                <div className="space-y-4">
                  <input type="text" placeholder="Full Name" value={newStudent.name} onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })} disabled={isAddingStudent} className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-blue-500 outline-none disabled:opacity-50" />
                  <input type="text" placeholder="Admission Number" value={newStudent.admissionNo} onChange={(e) => setNewStudent({ ...newStudent, admissionNo: e.target.value })} disabled={isAddingStudent} className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-blue-500 outline-none disabled:opacity-50" />
                  <select value={newStudent.classId} onChange={(e) => setNewStudent({ ...newStudent, classId: e.target.value })} disabled={isAddingStudent} className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:border-blue-500 outline-none disabled:opacity-50">
                    <option value="" className="bg-gray-800">Select Class</option>
                    {classes.map(c => <option key={c.id} value={c.id} className="bg-gray-800">{c.name} {c.section}</option>)}
                  </select>
                  <input type="email" placeholder="Parent Email" value={newStudent.parentEmail} onChange={(e) => setNewStudent({ ...newStudent, parentEmail: e.target.value })} disabled={isAddingStudent} className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-blue-500 outline-none disabled:opacity-50" />
                  <input type="tel" placeholder="Parent Phone" value={newStudent.parentPhone} onChange={(e) => setNewStudent({ ...newStudent, parentPhone: e.target.value })} disabled={isAddingStudent} className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-blue-500 outline-none disabled:opacity-50" />
                  <button 
                    onClick={handleAddStudent} 
                    disabled={isAddingStudent}
                    className="w-full py-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isAddingStudent ? <Loader className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    {isAddingStudent ? 'Enrolling...' : 'Enroll Student'}
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}

        {showEditModal && selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={handleCloseEditModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md rounded-2xl bg-white/10 backdrop-blur-2xl border border-white/20 p-6"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-white">Edit {activeSection.slice(0, -1).charAt(0).toUpperCase() + activeSection.slice(0, -1).slice(1)}</h3>
                <button onClick={handleCloseEditModal} className="p-1 rounded-lg hover:bg-white/10">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {activeSection === 'classes' && (
                <div className="space-y-4">
                  <input type="text" placeholder="Class Name" value={selectedItem.name || ''} onChange={(e) => setSelectedItem({ ...selectedItem, name: e.target.value })} className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-blue-500 outline-none" />
                  <input type="text" placeholder="Section" value={selectedItem.section || ''} onChange={(e) => setSelectedItem({ ...selectedItem, section: e.target.value })} className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-blue-500 outline-none" />
                  <input type="text" placeholder="Class Teacher" value={selectedItem.teacher || ''} onChange={(e) => setSelectedItem({ ...selectedItem, teacher: e.target.value })} className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-blue-500 outline-none" />
                  <select value={selectedItem.status || 'active'} onChange={(e) => setSelectedItem({ ...selectedItem, status: e.target.value })} className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:border-blue-500 outline-none">
                    <option value="active" className="bg-gray-800">Active</option>
                    <option value="inactive" className="bg-gray-800">Inactive</option>
                  </select>
                </div>
              )}

              {activeSection === 'subjects' && (
                <div className="space-y-4">
                  <input type="text" placeholder="Subject Name" value={selectedItem.name || ''} onChange={(e) => setSelectedItem({ ...selectedItem, name: e.target.value })} className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-blue-500 outline-none" />
                  <input type="text" placeholder="Subject Code" value={selectedItem.code || ''} onChange={(e) => setSelectedItem({ ...selectedItem, code: e.target.value })} className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-blue-500 outline-none" />
                  <select value={selectedItem.classId || ''} onChange={(e) => setSelectedItem({ ...selectedItem, classId: e.target.value })} className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:border-blue-500 outline-none">
                    <option value="" className="bg-gray-800">Select Class</option>
                    {classes.map(c => <option key={c.id} value={c.id} className="bg-gray-800">{c.name} {c.section}</option>)}
                  </select>
                  <select value={selectedItem.teacherId || ''} onChange={(e) => setSelectedItem({ ...selectedItem, teacherId: e.target.value })} className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:border-blue-500 outline-none">
                    <option value="" className="bg-gray-800">Select Teacher</option>
                    {teachers.map(t => <option key={t.id} value={t.id} className="bg-gray-800">{t.name}</option>)}
                  </select>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={selectedItem.isElective || false} onChange={(e) => setSelectedItem({ ...selectedItem, isElective: e.target.checked })} className="w-4 h-4" />
                    <span className="text-gray-300">Elective Subject</span>
                  </label>
                </div>
              )}

              {activeSection === 'teachers' && (
                <div className="space-y-4">
                  <input type="text" placeholder="Full Name" value={selectedItem.name || ''} onChange={(e) => setSelectedItem({ ...selectedItem, name: e.target.value })} className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-blue-500 outline-none" />
                  <input type="email" placeholder="Email Address" value={selectedItem.email || ''} onChange={(e) => setSelectedItem({ ...selectedItem, email: e.target.value })} className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-blue-500 outline-none" />
                  <input type="tel" placeholder="Phone Number" value={selectedItem.phone || ''} onChange={(e) => setSelectedItem({ ...selectedItem, phone: e.target.value })} className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-blue-500 outline-none" />
                  <input type="text" placeholder="Subject Specialization" value={selectedItem.subject || ''} onChange={(e) => setSelectedItem({ ...selectedItem, subject: e.target.value })} className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-blue-500 outline-none" />
                  <select value={selectedItem.status || 'active'} onChange={(e) => setSelectedItem({ ...selectedItem, status: e.target.value })} className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:border-blue-500 outline-none">
                    <option value="active" className="bg-gray-800">Active</option>
                    <option value="inactive" className="bg-gray-800">Inactive</option>
                  </select>
                </div>
              )}

              {activeSection === 'students' && (
                <div className="space-y-4">
                  <input type="text" placeholder="Full Name" value={selectedItem.name || ''} onChange={(e) => setSelectedItem({ ...selectedItem, name: e.target.value })} className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-blue-500 outline-none" />
                  <input type="text" placeholder="Admission Number" value={selectedItem.admissionNo || ''} onChange={(e) => setSelectedItem({ ...selectedItem, admissionNo: e.target.value })} className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-blue-500 outline-none" />
                  <select value={selectedItem.classId || ''} onChange={(e) => setSelectedItem({ ...selectedItem, classId: e.target.value })} className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:border-blue-500 outline-none">
                    <option value="" className="bg-gray-800">Select Class</option>
                    {classes.map(c => <option key={c.id} value={c.id} className="bg-gray-800">{c.name} {c.section}</option>)}
                  </select>
                  <input type="email" placeholder="Parent Email" value={selectedItem.parentEmail || ''} onChange={(e) => setSelectedItem({ ...selectedItem, parentEmail: e.target.value })} className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-blue-500 outline-none" />
                  <input type="tel" placeholder="Parent Phone" value={selectedItem.parentPhone || ''} onChange={(e) => setSelectedItem({ ...selectedItem, parentPhone: e.target.value })} className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-blue-500 outline-none" />
                  <select value={selectedItem.status || 'active'} onChange={(e) => setSelectedItem({ ...selectedItem, status: e.target.value })} className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:border-blue-500 outline-none">
                    <option value="active" className="bg-gray-800">Active</option>
                    <option value="inactive" className="bg-gray-800">Inactive</option>
                  </select>
                </div>
              )}

              <div className="mt-4 flex justify-end gap-3">
                <button 
                  onClick={handleCloseEditModal} 
                  disabled={isSavingEdit}
                  className="px-4 py-2 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSaveEdit} 
                  disabled={isSavingEdit}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:shadow-xl transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {isSavingEdit ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {isSavingEdit ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
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