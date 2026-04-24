'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Mail, Phone, MapPin, User, BookOpen, Award, TrendingUp,
  Users, Calendar, Clock, CheckCircle, AlertCircle, Star,
  GraduationCap, BarChart3, FileText
} from 'lucide-react';

interface Subject {
  name: string;
  score: number;
  grade: string;
  trend: 'up' | 'down' | 'stable';
  teacher: string;
  improvement: number;
  remark: string;
}

interface ChildProfile {
  id: string;
  name: string;
  class: string;
  avatar: string;
  email?: string;
  admissionNo?: string;
  averageScore: number;
  predictedGrade: string;
  attendance: number;
  rank: number;
  totalStudents: number;
  teacher: string;
  teacherEmail?: string;
  teacherPhone?: string;
  subjects: Subject[];
  recentActivities?: Array<{
    id: string;
    activity: string;
    date: string;
    type: 'submission' | 'score' | 'attendance' | 'achievement';
    score?: number;
  }>;
  upcomingEvents?: Array<{
    id: string;
    title: string;
    date: string;
    type: 'exam' | 'meeting' | 'deadline';
  }>;
  feeStatus?: {
    status: 'paid' | 'partial' | 'unpaid';
    amount: number;
    paid: number;
    due: number;
  };
  results?: Array<{
    id: string;
    term: string;
    academicYear: string;
    total: number;
    average: number;
    grade: string;
    position?: number;
    outOf?: number;
    teacherComment?: string;
    principalComment?: string;
    subjectResults: Record<string, {
      ca1?: number;
      ca2?: number;
      exam?: number;
      total?: number;
      grade?: string;
    }>;
    status: string;
    publishedAt?: string;
  }>;
  achievements?: Array<{
    id: string;
    title: string;
    description: string;
    date: string;
    icon: string;
  }>;
  exams?: Array<{
    name: string;
    subject: string;
    date: string;
    time: string;
    venue: string;
    topics: string[];
    status: 'upcoming' | 'completed';
  }>;
  assignments?: Array<{
    name: string;
    subject: string;
    dueDate: string;
    status: 'pending' | 'submitted' | 'late';
    description: string;
  }>;
}

interface ViewChildProfileProps {
  isOpen: boolean;
  onClose: () => void;
  child: ChildProfile | null;
}

export default function ViewChildProfile({ isOpen, onClose, child }: ViewChildProfileProps) {
  if (!child) return null;

  const getGradeColor = (grade: string) => {
    if (grade.startsWith('A')) return 'text-green-400 bg-green-500/10';
    if (grade.startsWith('B')) return 'text-blue-400 bg-blue-500/10';
    if (grade.startsWith('C')) return 'text-yellow-400 bg-yellow-500/10';
    return 'text-red-400 bg-red-500/10';
  };

  const getTrendIcon = (trend: string) => {
    if (trend === 'up') return <TrendingUp className="w-4 h-4 text-green-400" />;
    if (trend === 'down') return <TrendingUp className="w-4 h-4 text-red-400 rotate-180" />;
    return <div className="w-4 h-4 bg-gray-400 rounded-full" />;
  };

  const getFeeStatusColor = (status: string) => {
    if (status === 'paid') return 'text-green-400 bg-green-500/10';
    if (status === 'partial') return 'text-yellow-400 bg-yellow-500/10';
    return 'text-red-400 bg-red-500/10';
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={onClose}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 border border-white/10 shadow-2xl"
            >
              {/* Header */}
              <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-white/10 bg-gradient-to-r from-slate-900/90 to-purple-900/90 backdrop-blur-xl">
                <div>
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <GraduationCap className="w-6 h-6 text-emerald-400" />
                    {child.name} - Full Profile
                  </h2>
                  <p className="text-gray-400 text-sm mt-1">{child.class}</p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Student Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Basic Info */}
                  <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
                    <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                      <User className="w-5 h-5 text-emerald-400" />
                      Basic Information
                    </h3>
                    <div className="space-y-4">
                      {child.admissionNo && (
                        <div>
                          <p className="text-gray-400 text-sm">Admission Number</p>
                          <p className="text-white font-medium">{child.admissionNo}</p>
                        </div>
                      )}
                      {child.email && (
                        <div>
                          <p className="text-gray-400 text-sm">Email</p>
                          <p className="text-white font-medium flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            {child.email}
                          </p>
                        </div>
                      )}
                      <div>
                        <p className="text-gray-400 text-sm">Class</p>
                        <p className="text-white font-medium">{child.class}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Class Teacher</p>
                        <p className="text-white font-medium">{child.teacher}</p>
                      </div>
                    </div>
                  </div>

                  {/* Academic Performance */}
                  <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
                    <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-blue-400" />
                      Academic Performance
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <p className="text-3xl font-bold text-white">{child.averageScore}%</p>
                        <p className="text-gray-400 text-sm">Average Score</p>
                      </div>
                      <div className="text-center">
                        <p className={`text-3xl font-bold ${getGradeColor(child.predictedGrade).split(' ')[0]}`}>
                          {child.predictedGrade}
                        </p>
                        <p className="text-gray-400 text-sm">Predicted Grade</p>
                      </div>
                      <div className="text-center">
                        <p className="text-3xl font-bold text-green-400">{child.attendance}%</p>
                        <p className="text-gray-400 text-sm">Attendance</p>
                      </div>
                      <div className="text-center">
                        <p className="text-3xl font-bold text-yellow-400">#{child.rank}</p>
                        <p className="text-gray-400 text-sm">Class Rank</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Subjects Performance */}
                <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
                  <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-purple-400" />
                    Subject Performance ({child.subjects.length} Subjects)
                  </h3>
                  <div className="space-y-4">
                    {child.subjects.map((subject, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-white font-semibold">{subject.name}</p>
                              <div className="flex items-center gap-2">
                                {getTrendIcon(subject.trend)}
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getGradeColor(subject.grade)}`}>
                                  {subject.grade} ({subject.score}%)
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
                              <span>{subject.teacher}</span>
                              <span className={subject.improvement > 0 ? 'text-green-400' : 'text-red-400'}>
                                {subject.improvement > 0 ? '+' : ''}{subject.improvement}%
                              </span>
                            </div>
                            <p className="text-xs text-gray-400">{subject.remark}</p>
                            <div className="w-full bg-white/10 rounded-full h-1.5 mt-2">
                              <div
                                className="h-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"
                                style={{ width: `${subject.score}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Recent Activities */}
                {child.recentActivities && child.recentActivities.length > 0 && (
                  <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
                    <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-green-400" />
                      Recent Activities
                    </h3>
                    <div className="space-y-3">
                      {child.recentActivities.map((activity) => (
                        <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                          <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                            {activity.type === 'submission' && <CheckCircle className="w-4 h-4 text-emerald-400" />}
                            {activity.type === 'score' && <Star className="w-4 h-4 text-yellow-400" />}
                            {activity.type === 'attendance' && <Calendar className="w-4 h-4 text-blue-400" />}
                            {activity.type === 'achievement' && <Award className="w-4 h-4 text-purple-400" />}
                          </div>
                          <div className="flex-1">
                            <p className="text-white text-sm">{activity.activity}</p>
                            {activity.score && <p className="text-emerald-400 text-sm font-semibold">{activity.score}%</p>}
                            <p className="text-gray-500 text-xs">{activity.date}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Upcoming Events */}
                {child.upcomingEvents && child.upcomingEvents.length > 0 && (
                  <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
                    <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-blue-400" />
                      Upcoming Events
                    </h3>
                    <div className="space-y-2">
                      {child.upcomingEvents.map((event) => (
                        <div key={event.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                          <div>
                            <p className="text-white font-medium">{event.title}</p>
                            <p className="text-gray-400 text-sm">{event.date}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            event.type === 'exam' ? 'bg-red-500/20 text-red-400' :
                            event.type === 'meeting' ? 'bg-blue-500/20 text-blue-400' :
                            'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {event.type}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Fee Status */}
                {child.feeStatus && (
                  <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
                    <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-yellow-400" />
                      Fee Status
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <p className="text-gray-400 text-sm">Total Amount</p>
                        <p className="text-white font-bold">₦{child.feeStatus.amount.toLocaleString()}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-400 text-sm">Amount Paid</p>
                        <p className="text-green-400 font-bold">₦{child.feeStatus.paid.toLocaleString()}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-400 text-sm">Amount Due</p>
                        <p className="text-red-400 font-bold">₦{child.feeStatus.due.toLocaleString()}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-400 text-sm">Status</p>
                        <p className={`font-bold capitalize ${getFeeStatusColor(child.feeStatus.status).split(' ')[0]}`}>
                          {child.feeStatus.status}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Report Card / Results */}
                {child.results && child.results.length > 0 && (
                  <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
                    <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-purple-400" />
                      Report Card ({child.results.length} Terms)
                    </h3>
                    <div className="space-y-6">
                      {child.results.map((result, index) => (
                        <motion.div
                          key={result.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="border border-white/10 rounded-xl p-4"
                        >
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h4 className="text-white font-semibold text-lg">
                                {result.term} - {result.academicYear}
                              </h4>
                              <p className="text-gray-400 text-sm">
                                Published: {result.publishedAt ? new Date(result.publishedAt).toLocaleDateString() : 'Not published'}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold text-white">{result.average.toFixed(1)}%</p>
                              <p className={`text-sm font-medium ${getGradeColor(result.grade)}`}>
                                Grade: {result.grade}
                              </p>
                              {result.position && result.outOf && (
                                <p className="text-gray-400 text-sm">
                                  Position: {result.position} of {result.outOf}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Subject Results */}
                          <div className="space-y-3">
                            <h5 className="text-white font-medium text-sm mb-2">Subject Breakdown</h5>
                            {Object.entries(result.subjectResults).map(([subject, scores]) => (
                              <div key={subject} className="bg-white/5 rounded-lg p-3">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-white font-medium">{subject}</span>
                                  <div className="flex items-center gap-2">
                                    {scores.total && (
                                      <span className="text-emerald-400 font-semibold">{scores.total}%</span>
                                    )}
                                    {scores.grade && (
                                      <span className={`px-2 py-1 rounded text-xs font-medium ${getGradeColor(scores.grade)}`}>
                                        {scores.grade}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="grid grid-cols-3 gap-2 text-xs text-gray-400">
                                  {scores.ca1 !== undefined && (
                                    <div>CA1: <span className="text-white">{scores.ca1}%</span></div>
                                  )}
                                  {scores.ca2 !== undefined && (
                                    <div>CA2: <span className="text-white">{scores.ca2}%</span></div>
                                  )}
                                  {scores.exam !== undefined && (
                                    <div>Exam: <span className="text-white">{scores.exam}%</span></div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Comments */}
                          {(result.teacherComment || result.principalComment) && (
                            <div className="mt-4 pt-4 border-t border-white/10">
                              {result.teacherComment && (
                                <div className="mb-2">
                                  <p className="text-blue-400 text-sm font-medium">Teacher's Comment:</p>
                                  <p className="text-gray-300 text-sm">{result.teacherComment}</p>
                                </div>
                              )}
                              {result.principalComment && (
                                <div>
                                  <p className="text-purple-400 text-sm font-medium">Principal's Comment:</p>
                                  <p className="text-gray-300 text-sm">{result.principalComment}</p>
                                </div>
                              )}
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Achievements */}
                {child.achievements && child.achievements.length > 0 && (
                  <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
                    <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                      <Award className="w-5 h-5 text-yellow-400" />
                      Achievements ({child.achievements.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {child.achievements.map((achievement) => (
                        <div key={achievement.id} className="p-3 rounded-lg bg-white/5 border border-white/10">
                          <div className="flex items-start gap-3">
                            <span className="text-2xl">{achievement.icon}</span>
                            <div className="flex-1">
                              <p className="text-white font-medium text-sm">{achievement.title}</p>
                              <p className="text-gray-400 text-xs">{achievement.description}</p>
                              <p className="text-gray-500 text-xs mt-1">{achievement.date}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Exams */}
                {child.exams && child.exams.length > 0 && (
                  <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
                    <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-red-400" />
                      Upcoming Exams ({child.exams.length})
                    </h3>
                    <div className="space-y-3">
                      {child.exams.map((exam) => (
                        <div key={`${exam.name}-${exam.date}`} className="p-4 rounded-lg bg-white/5 border border-white/10">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-white font-medium">{exam.name}</h4>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              exam.status === 'upcoming' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'
                            }`}>
                              {exam.status}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-gray-400">Subject</p>
                              <p className="text-white">{exam.subject}</p>
                            </div>
                            <div>
                              <p className="text-gray-400">Date & Time</p>
                              <p className="text-white">{exam.date} at {exam.time}</p>
                            </div>
                            <div>
                              <p className="text-gray-400">Venue</p>
                              <p className="text-white">{exam.venue}</p>
                            </div>
                            <div>
                              <p className="text-gray-400">Topics</p>
                              <p className="text-white text-xs">{exam.topics.join(', ')}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Assignments */}
                {child.assignments && child.assignments.length > 0 && (
                  <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
                    <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      Assignments ({child.assignments.length})
                    </h3>
                    <div className="space-y-3">
                      {child.assignments.map((assignment) => (
                        <div key={`${assignment.name}-${assignment.dueDate}`} className="p-4 rounded-lg bg-white/5 border border-white/10">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-white font-medium">{assignment.name}</h4>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              assignment.status === 'submitted' ? 'bg-green-500/20 text-green-400' :
                              assignment.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-red-500/20 text-red-400'
                            }`}>
                              {assignment.status}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-gray-400">Subject</p>
                              <p className="text-white">{assignment.subject}</p>
                            </div>
                            <div>
                              <p className="text-gray-400">Due Date</p>
                              <p className="text-white">{assignment.dueDate}</p>
                            </div>
                          </div>
                          <p className="text-gray-400 text-sm mt-2">{assignment.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
