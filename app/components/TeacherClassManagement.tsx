'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Plus, Users, Upload, Download, Search, Edit, Trash2,
  GraduationCap, Mail, Phone, FileText, CheckCircle
} from 'lucide-react';

interface TeacherClassManagementProps {
  teacherId?: string;
  onRefresh?: () => void;
}

export default function TeacherClassManagement({ teacherId, onRefresh }: TeacherClassManagementProps) {
  const [activeTab, setActiveTab] = useState<'classes' | 'students' | 'bulk'>('classes');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Mock assigned classes data
  const [assignedClasses] = useState([
    { id: '1', name: 'SS2 Science', section: 'A', students: 32, subject: 'Mathematics', academicYear: '2024/2025' },
    { id: '2', name: 'SS2 Art', section: 'B', students: 28, subject: 'Mathematics', academicYear: '2024/2025' },
  ]);

  // Mock students in selected class
  const [classStudents] = useState([
    { id: 'STU001', name: 'Adeola Kamara', email: 'adeola.kamara@school.com', phone: '+234 802 345 6789', parentEmail: 'parent@email.com', status: 'active' },
    { id: 'STU002', name: 'Bola Taiwo', email: 'bola.taiwo@school.com', phone: '+234 803 456 7890', parentEmail: 'parent@email.com', status: 'active' },
    { id: 'STU003', name: 'Chidi Okafor', email: 'chidi.okafor@school.com', phone: '+234 804 567 8901', parentEmail: 'parent@email.com', status: 'active' },
  ]);

  const exportClassList = async () => {
    if (!selectedClass) {
      alert('Please select a class first');
      return;
    }

    let csvContent = 'Student Name,Email,Phone,Parent Email,Date Added\n';
    classStudents.forEach(student => {
      csvContent += `"${student.name}","${student.email}","${student.phone}","${student.parentEmail}","2024-04-15"\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedClass.name}_students.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const bulkAddStudents = async (file: File) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('classId', selectedClass.id);

      const response = await fetch('/api/teacher/add-students', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        alert(`✅ Added ${data.count} students to ${selectedClass.name}`);
        onRefresh?.();
      } else {
        alert(`❌ Error: ${data.error}`);
      }
    } catch (error: any) {
      alert('Failed to add students');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10">
        {[
          { id: 'classes', label: '📚 My Classes', icon: '📚' },
          { id: 'students', label: '👥 Class Students', icon: '👥' },
          { id: 'bulk', label: '📤 Bulk Add Students', icon: '📤' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'border-b-2 border-blue-500 text-blue-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Classes Tab */}
      {activeTab === 'classes' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-900 dark:text-blue-100">
              📌 <strong>Your Classes:</strong> These are the classes assigned to you by the school admin. Click to manage students and upload marks.
            </p>
          </div>

          <div className="grid gap-4">
            {assignedClasses.map(cls => (
              <motion.div
                key={cls.id}
                whileHover={{ scale: 1.02 }}
                onClick={() => {
                  setSelectedClass(cls);
                  setActiveTab('students');
                }}
                className="cursor-pointer p-6 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 transition-all bg-white dark:bg-gray-900"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      {cls.name} - Section {cls.section}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Subject: <strong>{cls.subject}</strong> • {cls.students} Students
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-full text-xs font-medium">
                    {cls.academicYear}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Students Tab */}
      {activeTab === 'students' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          {!selectedClass ? (
            <div className="text-center py-12 text-gray-500">
              <p>Select a class to view students</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">
                  {selectedClass.name} - {classStudents.length} Students
                </h3>
                <button
                  onClick={exportClassList}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition"
                >
                  <Download className="w-4 h-4" />
                  Export List
                </button>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:border-blue-500 outline-none"
                />
              </div>

              {/* Students Table */}
              <div className="rounded-lg overflow-hidden border border-gray-700">
                <table className="w-full text-sm">
                  <thead className="bg-gray-900 border-b border-gray-700">
                    <tr className="text-gray-400">
                      <th className="p-4 text-left">Student Name</th>
                      <th className="p-4 text-left">Email</th>
                      <th className="p-4 text-left">Phone</th>
                      <th className="p-4 text-left">Status</th>
                      <th className="p-4 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {classStudents.map((student, idx) => (
                      <tr key={student.id} className={idx % 2 === 0 ? 'bg-gray-950' : 'bg-gray-900'}>
                        <td className="p-4 text-white">{student.name}</td>
                        <td className="p-4 text-gray-400">{student.email}</td>
                        <td className="p-4 text-gray-400">{student.phone}</td>
                        <td className="p-4">
                          <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs font-medium">
                            {student.status}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <button className="p-1 hover:bg-gray-800 rounded transition">
                              <Mail className="w-4 h-4 text-gray-400" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </motion.div>
      )}

      {/* Bulk Add Tab */}
      {activeTab === 'bulk' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          {!selectedClass ? (
            <div className="text-center py-12 text-gray-500">
              <p>Select a class first to bulk add students</p>
            </div>
          ) : (
            <>
              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                <p className="text-sm text-purple-900 dark:text-purple-100">
                  ✏️ <strong>Adding to: {selectedClass.name}</strong><br/>
                  Upload a CSV file with student details to add multiple students at once.
                </p>
              </div>

              <div className="p-8 border-2 border-dashed border-gray-600 rounded-lg text-center cursor-pointer hover:border-blue-500 transition-all">
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      bulkAddStudents(e.target.files[0]);
                    }
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  style={{ position: 'absolute' }}
                />
                <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="font-semibold text-white">Drag and drop CSV file or click to browse</p>
                <p className="text-xs text-gray-400 mt-1">CSV Format: Name, Email, Student ID, Phone</p>
                {loading && <p className="text-blue-400 mt-2">⏳ Uploading...</p>}
              </div>

              <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
                <p className="text-xs text-gray-400 mb-2 font-semibold">Sample CSV Format:</p>
                <pre className="text-xs text-gray-500 overflow-x-auto">
                  {`Name,Email,StudentID,Phone
Adeola Kamara,adeola@school.com,STU001,+234 802 345 6789
Bola Taiwo,bola@school.com,STU002,+234 803 456 7890`}
                </pre>
              </div>
            </>
          )}
        </motion.div>
      )}
    </div>
  );
}
