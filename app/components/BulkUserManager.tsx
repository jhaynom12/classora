'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Download, Upload, FileSpreadsheet, CheckCircle, AlertCircle,
  Loader, Users, GraduationCap, Heart, X, Eye
} from 'lucide-react';

interface BulkManagerProps {
  schoolId: string;
  onSuccess?: () => void;
}

export default function BulkUserManager({ schoolId, onSuccess }: BulkManagerProps) {
  const [selectedType, setSelectedType] = useState<'students' | 'teachers' | 'parents' | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<any[]>([]);

  const typeConfig = {
    students: {
      label: 'Students',
      icon: GraduationCap,
      color: 'from-blue-500 to-blue-600',
      description: 'Bulk upload students with their IDs, emails, classes, and parent contact info',
    },
    teachers: {
      label: 'Teachers',
      icon: Users,
      color: 'from-orange-500 to-orange-600',
      description: 'Bulk upload teachers with their staff IDs and subject assignments',
    },
    parents: {
      label: 'Parents',
      icon: Heart,
      color: 'from-green-500 to-green-600',
      description: 'Bulk upload parents linked to their students',
    },
  };

  const downloadTemplate = async (type: 'students' | 'teachers' | 'parents') => {
    try {
      const response = await fetch(`/api/bulk/template?type=${type}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `classora_${type}_template.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      alert('Failed to download template');
    }
  };

  const exportUsers = async (type: 'students' | 'teachers' | 'parents') => {
    try {
      const response = await fetch(`/api/bulk/export?type=${type}&schoolId=${schoolId}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `classora_${type}_export.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      alert('Failed to export data');
    }
  };

  const handleFileSelect = async (file: File) => {
    if (!selectedType) return;

    setIsUploading(true);
    try {
      // Preview the file
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim() && !line.trim().startsWith('Instructions'));
      const headers = lines[0].split(',').map(h => h.trim());
      const preview = lines.slice(1, 4).map(line => {
        const values = line.split(',').map(v => v.trim().replace(/^"/, '').replace(/"$/, ''));
        const row: any = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });
        return row;
      });
      setPreviewData(preview);
      setShowPreview(true);

      // Upload the file
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', selectedType);
      formData.append('schoolId', schoolId);
      formData.append('type', selectedType);
      formData.append('schoolId', schoolId);

      const response = await fetch('/api/bulk/import', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('classora_token')}`
        },
        body: formData,
      });

      const data = await response.json();
      setUploadResult(data);

      if (data.success) {
        onSuccess?.();
      }
    } catch (error: any) {
      setUploadResult({
        success: false,
        error: error.message,
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Type Selection */}
      {!selectedType && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(Object.entries(typeConfig) as [string, any][]).map(([type, config]) => {
            const Icon = config.icon;
            return (
              <motion.div
                key={type}
                whileHover={{ scale: 1.05 }}
                onClick={() => setSelectedType(type as any)}
                className="cursor-pointer p-6 rounded-xl border-2 border-dashed border-gray-300 hover:border-blue-500 transition-all bg-gradient-to-br hover:from-blue-50 hover:to-blue-100 dark:hover:from-blue-900/20 dark:hover:to-blue-900/30"
              >
                <Icon className={`w-8 h-8 mb-3 bg-gradient-to-r ${config.color} bg-clip-text text-transparent`} />
                <h3 className="font-bold text-lg mb-1">{config.label}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{config.description}</p>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Selected Type - Upload Interface */}
      {selectedType && !uploadResult && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">Upload {typeConfig[selectedType].label}</h3>
            <button
              onClick={() => setSelectedType(null)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Template Download */}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-blue-900 dark:text-blue-100 mb-1">Step 1: Download Template</p>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Download the CSV template to see the required format.
                </p>
              </div>
              <button
                onClick={() => downloadTemplate(selectedType)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition whitespace-nowrap"
              >
                <Download className="w-4 h-4" />
                Download Template
              </button>
            </div>
          </div>

          {/* Export Existing */}
          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-purple-900 dark:text-purple-100 mb-1">Or Export Existing</p>
                <p className="text-sm text-purple-700 dark:text-purple-300">
                  Export your current {typeConfig[selectedType].label.toLowerCase()} to update and re-upload.
                </p>
              </div>
              <button
                onClick={() => exportUsers(selectedType)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition whitespace-nowrap"
              >
                <FileSpreadsheet className="w-4 h-4" />
                Export Data
              </button>
            </div>
          </div>

          {/* File Upload */}
          <div className="bg-gray-50 dark:bg-gray-900/20 p-4 rounded-lg border border-gray-200 dark:border-gray-800">
            <p className="font-semibold mb-3">Step 2: Fill & Upload CSV</p>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`relative p-8 border-2 border-dashed rounded-lg transition-all ${
                isDragging
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800'
              }`}
            >
              <input
                type="file"
                accept=".csv"
                onChange={handleFileInput}
                disabled={isUploading}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="text-center">
                <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="font-semibold mb-1">Drag and drop your CSV file here</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">or click to browse</p>
                {isUploading && <Loader className="w-5 h-5 mx-auto mt-2 animate-spin" />}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Preview */}
      {showPreview && previewData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-50 dark:bg-gray-900/20 p-4 rounded-lg border border-gray-200 dark:border-gray-800"
        >
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Preview (First 3 rows)
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <tbody>
                {previewData.map((row, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-100 dark:bg-gray-900'}>
                    {Object.values(row).map((val: any, i) => (
                      <td key={i} className="px-3 py-2 truncate">
                        {val}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Upload Result */}
      {uploadResult && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div
            className={`p-4 rounded-lg border-2 ${
              uploadResult.success
                ? 'bg-green-50 dark:bg-green-900/20 border-green-500 text-green-900 dark:text-green-100'
                : 'bg-red-50 dark:bg-red-900/20 border-red-500 text-red-900 dark:text-red-100'
            }`}
          >
            <div className="flex items-start gap-3">
              {uploadResult.success ? (
                <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <p className="font-semibold">{uploadResult.message || uploadResult.error}</p>
                {uploadResult.results && (
                  <div className="mt-2 text-sm space-y-1">
                    <p>✅ Created: {uploadResult.results.created}</p>
                    <p>❌ Failed: {uploadResult.results.failed}</p>
                    {uploadResult.results.errors.length > 0 && (
                      <div className="mt-2">
                        <p className="font-semibold">Errors:</p>
                        <ul className="list-disc list-inside mt-1">
                          {uploadResult.results.errors.slice(0, 5).map((error: string, i: number) => (
                            <li key={i} className="text-xs">
                              {error}
                            </li>
                          ))}
                          {uploadResult.results.errors.length > 5 && (
                            <li className="text-xs">+ {uploadResult.results.errors.length - 5} more errors</li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              setUploadResult(null);
              setSelectedType(null);
              setShowPreview(false);
              setPreviewData([]);
            }}
            className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition"
          >
            Upload Another File
          </button>
        </motion.div>
      )}
    </div>
  );
}
