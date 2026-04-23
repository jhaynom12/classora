'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  FileText, Download, Eye, ChevronRight, Printer, Search, Filter,
  Calendar, Users, BookOpen, Award, TrendingUp, AlertCircle,
  CheckCircle, XCircle, Clock, Upload, Settings, Plus, Edit,
  Trash2, Save, X, ChevronDown, MoreVertical, Mail, Phone,
  School, GraduationCap, Briefcase, Target, BarChart3, PieChart,
  LineChart, Activity, Sparkles, Brain, MessageCircle, Bell,
  LogOut, Moon, Sun, Layout, FileSpreadsheet, Copy, Check
} from 'lucide-react';
import { useTheme } from '@/components/theme-provider';
import ActionButtons from '@/app/components/ActionButtons';

interface StudentResult {
  id: string;
  studentName: string;
  admissionNo: string;
  className: string;
  term: string;
  academicYear: string;
  subjects: {
    name: string;
    test1: number;
    test2: number;
    exam: number;
    total: number;
    grade: string;
    remark: string;
  }[];
  total: number;
  average: number;
  grade: string;
  position: number;
  outOf: number;
  status: 'published' | 'draft' | 'pending';
  publishedDate?: string;
  teacherComment?: string;
  principalComment?: string;
  attendance?: number;
  conduct?: string;
}

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  columns: string[];
  sampleData: any[];
  isActive: boolean;
  uploadedAt: string;
  uploadedBy: string;
}

export default function ResultPortal() {
  const [user, setUser] = useState<any>(null);
  const [schoolName, setSchoolName] = useState('Your School');
  const [activeTab, setActiveTab] = useState('results');
  const [selectedTerm, setSelectedTerm] = useState('First Term');
  const [selectedYear, setSelectedYear] = useState('2024/2025');
  const [selectedClass, setSelectedClass] = useState('SS2 Science');
  const [showResultModal, setShowResultModal] = useState(false);
  const [selectedResult, setSelectedResult] = useState<StudentResult | null>(null);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<any[]>([]);
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Report Templates (CSV/Excel structure)
  const [templates, setTemplates] = useState<ReportTemplate[]>([
    {
      id: '1',
      name: 'Standard Report Card',
      description: 'Includes Test 1, Test 2, and Exam scores',
      columns: ['Student Name', 'Admission No', 'Test 1', 'Test 2', 'Exam'],
      sampleData: [
        { 'Student Name': 'Adeola K.', 'Admission No': 'STU001', 'Test 1': 85, 'Test 2': 82, 'Exam': 88 },
        { 'Student Name': 'Bola T.', 'Admission No': 'STU002', 'Test 1': 72, 'Test 2': 75, 'Exam': 70 },
      ],
      isActive: true,
      uploadedAt: '2024-01-01',
      uploadedBy: 'Admin'
    },
    {
      id: '2',
      name: 'Simple Report Card',
      description: 'Only total score per subject',
      columns: ['Student Name', 'Admission No', 'Subject', 'Score'],
      sampleData: [
        { 'Student Name': 'Adeola K.', 'Admission No': 'STU001', 'Subject': 'Mathematics', 'Score': 85 },
        { 'Student Name': 'Adeola K.', 'Admission No': 'STU001', 'Subject': 'English', 'Score': 78 },
      ],
      isActive: false,
      uploadedAt: '2024-01-15',
      uploadedBy: 'Admin'
    }
  ]);

  // Mock Results Data
  const [results, setResults] = useState<StudentResult[]>([
    {
      id: '1',
      studentName: 'Adeola K.',
      admissionNo: 'STU001',
      className: 'SS2 Science',
      term: 'First Term',
      academicYear: '2024/2025',
      subjects: [
        { name: 'Mathematics', test1: 85, test2: 82, exam: 88, total: 85, grade: 'A', remark: 'Excellent' },
        { name: 'English', test1: 78, test2: 75, exam: 80, total: 78, grade: 'B+', remark: 'Good' },
        { name: 'Physics', test1: 72, test2: 70, exam: 75, total: 72, grade: 'B', remark: 'Satisfactory' },
        { name: 'Chemistry', test1: 68, test2: 65, exam: 70, total: 68, grade: 'B-', remark: 'Needs Improvement' },
        { name: 'Biology', test1: 82, test2: 80, exam: 85, total: 82, grade: 'A-', remark: 'Very Good' },
      ],
      total: 385,
      average: 77,
      grade: 'B+',
      position: 8,
      outOf: 45,
      status: 'published',
      publishedDate: '2024-04-15',
      teacherComment: 'Adeola has shown great improvement this term.',
      principalComment: 'Well done! Continue to strive for excellence.',
      attendance: 95,
      conduct: 'Good'
    },
    {
      id: '2',
      studentName: 'Esther N.',
      admissionNo: 'STU004',
      className: 'SS2 Science',
      term: 'First Term',
      academicYear: '2024/2025',
      subjects: [
        { name: 'Mathematics', test1: 92, test2: 88, exam: 94, total: 91, grade: 'A+', remark: 'Outstanding' },
        { name: 'English', test1: 85, test2: 82, exam: 88, total: 85, grade: 'A', remark: 'Excellent' },
        { name: 'Physics', test1: 88, test2: 85, exam: 90, total: 88, grade: 'A', remark: 'Excellent' },
        { name: 'Chemistry', test1: 82, test2: 80, exam: 85, total: 82, grade: 'A-', remark: 'Very Good' },
        { name: 'Biology', test1: 90, test2: 88, exam: 92, total: 90, grade: 'A+', remark: 'Outstanding' },
      ],
      total: 436,
      average: 87,
      grade: 'A',
      position: 1,
      outOf: 45,
      status: 'published',
      publishedDate: '2024-04-15',
      teacherComment: 'Esther is an exceptional student.',
      principalComment: 'Outstanding performance! You are a role model.',
      attendance: 98,
      conduct: 'Excellent'
    },
  ]);

  const classes = ['SS1 Science', 'SS1 Art', 'SS2 Science', 'SS2 Art', 'SS3 Science'];
  const terms = ['First Term', 'Second Term', 'Third Term'];
  const years = ['2023/2024', '2024/2025', '2025/2026'];

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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      
      // Parse CSV preview
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        const lines = text.split('\n');
        const headers = lines[0].split(',');
        const preview = lines.slice(1, 4).map(line => {
          const values = line.split(',');
          const row: any = {};
          headers.forEach((header, idx) => {
            row[header.trim()] = values[idx]?.trim();
          });
          return row;
        });
        setUploadPreview(preview);
      };
      reader.readAsText(file);
    }
  };

  const saveTemplate = () => {
    if (!uploadedFile || !templateName) return;
    
    const newTemplate: ReportTemplate = {
      id: Date.now().toString(),
      name: templateName,
      description: templateDescription || 'Custom template uploaded by admin',
      columns: uploadPreview.length > 0 ? Object.keys(uploadPreview[0]) : [],
      sampleData: uploadPreview,
      isActive: false,
      uploadedAt: new Date().toISOString().split('T')[0],
      uploadedBy: user?.name || 'Admin'
    };
    
    setTemplates([...templates, newTemplate]);
    setShowTemplateModal(false);
    setUploadedFile(null);
    setUploadPreview([]);
    setTemplateName('');
    setTemplateDescription('');
  };

  const activateTemplate = (templateId: string) => {
    setTemplates(templates.map(t => ({ ...t, isActive: t.id === templateId })));
  };

  const getGradeColor = (grade: string) => {
    if (grade.startsWith('A')) return 'text-green-400';
    if (grade.startsWith('B')) return 'text-blue-400';
    if (grade.startsWith('C')) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getStatusColor = (status: string) => {
    if (status === 'published') return 'bg-green-500/20 text-green-400';
    if (status === 'draft') return 'bg-yellow-500/20 text-yellow-400';
    return 'bg-orange-500/20 text-orange-400';
  };

  const activeTemplate = templates.find(t => t.isActive) || templates[0];
  const filteredResults = results.filter(r => 
    r.className === selectedClass && 
    r.term === selectedTerm && 
    r.academicYear === selectedYear
  );

  if (!mounted || !user) return null;
  if (user.role !== 'admin' && user.role !== 'teacher') { 
    window.location.href = '/'; 
    return null; 
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      <ActionButtons />

      {/* Header */}
      <div className="relative z-10 bg-white/5 backdrop-blur-xl border-b border-white/10 sticky top-0 z-20">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Link href={user?.role === 'admin' ? "/dashboard/admin" : "/dashboard/teacher"}>
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
              <button onClick={() => setShowTemplateModal(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-500/20 text-purple-400 text-sm hover:bg-purple-500/30 transition-colors">
                <Upload className="w-4 h-4" />
                Upload Template
              </button>
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
        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-white/10 pb-4">
          <button
            onClick={() => setActiveTab('results')}
            className={`px-6 py-2 rounded-xl transition-all ${activeTab === 'results' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'text-gray-400 hover:text-white'}`}
          >
            <FileText className="w-4 h-4 inline mr-2" />
            Results
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`px-6 py-2 rounded-xl transition-all ${activeTab === 'templates' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'text-gray-400 hover:text-white'}`}
          >
            <Layout className="w-4 h-4 inline mr-2" />
            Templates
          </button>
        </div>

        {/* RESULTS TAB */}
        {activeTab === 'results' && (
          <>
            {/* Active Template Info */}
            <div className="bg-purple-500/10 rounded-2xl p-4 mb-6 border border-purple-500/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="w-5 h-5 text-purple-400" />
                <div>
                  <p className="text-white text-sm">Active Marksheet Template</p>
                  <p className="text-purple-400 text-sm font-semibold">{activeTemplate.name}</p>
                  <p className="text-gray-400 text-xs">Columns: {activeTemplate.columns.join(', ')}</p>
                </div>
              </div>
              <button onClick={() => setActiveTab('templates')} className="text-purple-400 text-sm hover:text-purple-300">
                Change Template →
              </button>
            </div>

            {/* Filters */}
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Class</label>
                  <select 
                    value={selectedClass} 
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:border-blue-500 outline-none"
                  >
                    {classes.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Term</label>
                  <select 
                    value={selectedTerm} 
                    onChange={(e) => setSelectedTerm(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:border-blue-500 outline-none"
                  >
                    {terms.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Academic Year</label>
                  <select 
                    value={selectedYear} 
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:border-blue-500 outline-none"
                  >
                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <div className="flex items-end">
                  <button 
                    onClick={() => setShowGenerateModal(true)}
                    className="w-full px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium hover:shadow-xl transition-all flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Generate Results
                  </button>
                </div>
              </div>
            </div>

            {/* Results Table */}
            <div className="rounded-2xl overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10">
              <div className="p-6 border-b border-white/10 flex justify-between items-center flex-wrap gap-4">
                <h2 className="text-xl font-bold text-white">Student Results</h2>
                <div className="flex gap-2">
                  <button className="px-4 py-2 rounded-xl bg-white/5 text-gray-300 text-sm hover:bg-white/10 transition-colors flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Export CSV
                  </button>
                  <button className="px-4 py-2 rounded-xl bg-white/5 text-gray-300 text-sm hover:bg-white/10 transition-colors flex items-center gap-2">
                    <Printer className="w-4 h-4" />
                    Print All
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-white/10 bg-white/5">
                    <tr className="text-left text-gray-400 text-sm">
                      <th className="p-4">Student Name</th>
                      <th className="p-4">Admission No</th>
                      <th className="p-4">Total</th>
                      <th className="p-4">Average</th>
                      <th className="p-4">Grade</th>
                      <th className="p-4">Position</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {filteredResults.map((result) => (
                      <tr key={result.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-4 text-white font-medium">{result.studentName}</td>
                        <td className="p-4 text-gray-300">{result.admissionNo}</td>
                        <td className="p-4 text-white font-semibold">{result.total}</td>
                        <td className="p-4 text-white">{result.average}%</td>
                        <td className={`p-4 font-semibold ${getGradeColor(result.grade)}`}>{result.grade}</td>
                        <td className="p-4 text-gray-300">{result.position}/{result.outOf}</td>
                        <td className="p-4">
                          <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(result.status)}`}>
                            {result.status}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => {
                                setSelectedResult(result);
                                setShowResultModal(true);
                              }}
                              className="p-1 rounded-lg hover:bg-white/10 transition-colors"
                            >
                              <Eye className="w-4 h-4 text-blue-400" />
                            </button>
                            <button className="p-1 rounded-lg hover:bg-white/10 transition-colors">
                              <Download className="w-4 h-4 text-green-400" />
                            </button>
                            <button className="p-1 rounded-lg hover:bg-white/10 transition-colors">
                              <Printer className="w-4 h-4 text-gray-400" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* AI Insight */}
            <div className="mt-8 rounded-2xl overflow-hidden bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-xl border border-blue-500/30 p-6">
              <div className="flex items-center gap-3 mb-4">
                <Brain className="w-6 h-6 text-blue-400" />
                <h3 className="text-white font-semibold text-lg">AI Result Analysis</h3>
                <Sparkles className="w-4 h-4 text-yellow-400" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-white/5 rounded-xl">
                  <p className="text-gray-400 text-sm">Class Average</p>
                  <p className="text-2xl font-bold text-white">74.5%</p>
                  <p className="text-green-400 text-sm mt-1">↑ 5% from last term</p>
                </div>
                <div className="p-4 bg-white/5 rounded-xl">
                  <p className="text-gray-400 text-sm">Top Performer</p>
                  <p className="text-2xl font-bold text-white">Esther N.</p>
                  <p className="text-blue-400 text-sm mt-1">87% Average</p>
                </div>
                <div className="p-4 bg-white/5 rounded-xl">
                  <p className="text-gray-400 text-sm">At-Risk Students</p>
                  <p className="text-2xl font-bold text-yellow-400">3 Students</p>
                  <p className="text-yellow-400 text-sm mt-1">Below 60%</p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* TEMPLATES TAB */}
        {activeTab === 'templates' && (
          <div className="space-y-6">
            <div className="bg-blue-500/10 rounded-2xl p-4 border border-blue-500/30">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-blue-500/20">
                  <FileSpreadsheet className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">How Marksheet Templates Work</p>
                  <p className="text-gray-400 text-sm mt-1">
                    1. Admin uploads a CSV/Excel template defining the column structure<br />
                    2. Teachers use that template to upload student marks<br />
                    3. Results are automatically calculated based on the template format
                  </p>
                </div>
              </div>
            </div>

            <h2 className="text-white font-bold text-lg mb-4">Available Templates</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className={`rounded-2xl overflow-hidden bg-white/5 backdrop-blur-xl border-2 transition-all ${
                    template.isActive ? 'border-green-500 shadow-lg shadow-green-500/20' : 'border-white/10'
                  }`}
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <FileSpreadsheet className={`w-6 h-6 ${template.isActive ? 'text-green-400' : 'text-gray-400'}`} />
                        <div>
                          <h3 className="text-white font-bold text-lg">{template.name}</h3>
                          <p className="text-gray-400 text-sm">{template.description}</p>
                        </div>
                      </div>
                      {template.isActive && (
                        <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Active
                        </span>
                      )}
                    </div>
                    
                    <div className="mb-4">
                      <p className="text-gray-400 text-sm mb-2">Expected Columns:</p>
                      <div className="flex flex-wrap gap-2">
                        {template.columns.map((col, idx) => (
                          <span key={idx} className="text-xs px-2 py-1 rounded-full bg-white/10 text-gray-300">
                            {col}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="mb-4 p-3 bg-white/5 rounded-xl">
                      <p className="text-gray-400 text-xs mb-2">Sample Preview:</p>
                      <pre className="text-xs text-gray-500 overflow-x-auto">
                        {JSON.stringify(template.sampleData[0], null, 2)}
                      </pre>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
                      <span>Uploaded: {template.uploadedAt}</span>
                      <span>By: {template.uploadedBy}</span>
                    </div>

                    {!template.isActive && (
                      <button
                        onClick={() => activateTemplate(template.id)}
                        className="mt-4 w-full py-2 rounded-xl bg-blue-500/20 text-blue-400 text-sm hover:bg-blue-500/30 transition-colors"
                      >
                        Use This Template
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Upload Template Modal */}
      <AnimatePresence>
        {showTemplateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowTemplateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl bg-white/10 backdrop-blur-2xl border border-white/20 p-6"
            >
              <h3 className="text-xl font-bold text-white mb-4">Upload Marksheet Template</h3>
              <p className="text-gray-400 text-sm mb-4">Upload a CSV file that defines the structure teachers will use</p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Template Name</label>
                  <input
                    type="text"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    placeholder="e.g., Standard Marksheet 2024"
                    className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Description (Optional)</label>
                  <input
                    type="text"
                    value={templateDescription}
                    onChange={(e) => setTemplateDescription(e.target.value)}
                    placeholder="Describe when to use this template"
                    className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">CSV/Excel File</label>
                  <div
                    className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                      uploadedFile ? 'border-green-500 bg-green-500/10' : 'border-white/20 hover:border-blue-500/50'
                    }`}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input ref={fileInputRef} type="file" accept=".csv,.xlsx,.xls" onChange={handleFileUpload} className="hidden" />
                    {uploadedFile ? (
                      <div>
                        <CheckCircle className="w-10 h-10 text-green-400 mx-auto mb-2" />
                        <p className="text-green-400">{uploadedFile.name}</p>
                        <p className="text-gray-500 text-sm mt-1">Click to change file</p>
                      </div>
                    ) : (
                      <div>
                        <Upload className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                        <p className="text-white">Click or drag to upload</p>
                        <p className="text-gray-500 text-sm mt-1">CSV or Excel files only</p>
                      </div>
                    )}
                  </div>
                </div>

                {uploadPreview.length > 0 && (
                  <div className="p-4 bg-white/5 rounded-xl">
                    <p className="text-green-400 text-sm mb-2">Preview (first 3 rows):</p>
                    <pre className="text-xs text-gray-300 overflow-x-auto">
                      {JSON.stringify(uploadPreview, null, 2)}
                    </pre>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button onClick={() => setShowTemplateModal(false)} className="flex-1 py-2 rounded-xl bg-white/10 text-white">Cancel</button>
                  <button onClick={saveTemplate} disabled={!uploadedFile || !templateName} className="flex-1 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold disabled:opacity-50">
                    Save Template
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Result Detail Modal */}
      <AnimatePresence>
        {showResultModal && selectedResult && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowResultModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-4xl max-h-[85vh] overflow-y-auto rounded-2xl bg-white/10 backdrop-blur-2xl border border-white/20"
            >
              <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold">{selectedResult.studentName}</h2>
                    <p className="opacity-90">{selectedResult.admissionNo} • {selectedResult.className}</p>
                    <p className="text-sm opacity-80 mt-1">{selectedResult.term} {selectedResult.academicYear}</p>
                  </div>
                  <button onClick={() => setShowResultModal(false)} className="p-2 rounded-lg hover:bg-white/20">
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                  <div className="p-4 bg-white/5 rounded-xl text-center">
                    <p className="text-gray-400 text-sm">Total Score</p>
                    <p className="text-2xl font-bold text-white">{selectedResult.total}</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-xl text-center">
                    <p className="text-gray-400 text-sm">Average</p>
                    <p className="text-2xl font-bold text-white">{selectedResult.average}%</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-xl text-center">
                    <p className="text-gray-400 text-sm">Grade</p>
                    <p className={`text-2xl font-bold ${getGradeColor(selectedResult.grade)}`}>{selectedResult.grade}</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-xl text-center">
                    <p className="text-gray-400 text-sm">Position</p>
                    <p className="text-2xl font-bold text-white">{selectedResult.position}/{selectedResult.outOf}</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-xl text-center">
                    <p className="text-gray-400 text-sm">Status</p>
                    <p className="text-2xl font-bold text-green-400">Published</p>
                  </div>
                </div>

                <h3 className="text-white font-bold text-lg mb-4">Subject Performance</h3>
                <div className="rounded-xl overflow-hidden bg-white/5 border border-white/10">
                  <table className="w-full">
                    <thead className="bg-white/5 border-b border-white/10">
                      <tr className="text-left text-gray-400 text-sm">
                        <th className="p-3">Subject</th>
                        <th className="p-3">Test 1</th>
                        <th className="p-3">Test 2</th>
                        <th className="p-3">Exam</th>
                        <th className="p-3">Total</th>
                        <th className="p-3">Grade</th>
                        <th className="p-3">Remark</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {selectedResult.subjects.map((subject, idx) => (
                        <tr key={idx} className="hover:bg-white/5">
                          <td className="p-3 text-white">{subject.name}</td>
                          <td className="p-3 text-gray-300">{subject.test1}%</td>
                          <td className="p-3 text-gray-300">{subject.test2}%</td>
                          <td className="p-3 text-gray-300">{subject.exam}%</td>
                          <td className="p-3 text-white font-semibold">{subject.total}%</td>
                          <td className={`p-3 font-semibold ${getGradeColor(subject.grade)}`}>{subject.grade}</td>
                          <td className="p-3 text-gray-300">{subject.remark}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex gap-3 mt-6">
                  <button className="flex-1 py-3 rounded-xl bg-blue-500/20 text-blue-400 font-semibold hover:bg-blue-500/30 transition-colors flex items-center justify-center gap-2">
                    <Download className="w-4 h-4" /> Download PDF
                  </button>
                  <button className="flex-1 py-3 rounded-xl bg-green-500/20 text-green-400 font-semibold hover:bg-green-500/30 transition-colors flex items-center justify-center gap-2">
                    <Printer className="w-4 h-4" /> Print
                  </button>
                  <button className="flex-1 py-3 rounded-xl bg-purple-500/20 text-purple-400 font-semibold hover:bg-purple-500/30 transition-colors flex items-center justify-center gap-2">
                    <Mail className="w-4 h-4" /> Send to Parent
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Generate Results Modal */}
      <AnimatePresence>
        {showGenerateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowGenerateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md rounded-2xl bg-white/10 backdrop-blur-2xl border border-white/20 p-6"
            >
              <h3 className="text-xl font-bold text-white mb-4">Generate Results</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Class</label>
                  <select className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white">
                    <option>SS2 Science</option>
                    <option>SS2 Art</option>
                    <option>SS1 Science</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Term</label>
                  <select className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white">
                    <option>First Term</option>
                    <option>Second Term</option>
                    <option>Third Term</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Academic Year</label>
                  <select className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white">
                    <option>2024/2025</option>
                    <option>2023/2024</option>
                  </select>
                </div>
                <div className="flex gap-3 pt-4">
                  <button onClick={() => setShowGenerateModal(false)} className="flex-1 py-2 rounded-xl bg-white/10 text-white">Cancel</button>
                  <button className="flex-1 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold">Generate</button>
                </div>
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
