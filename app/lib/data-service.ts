// Data service for handling empty states and real data
export interface StudentData {
  id: string;
  name: string;
  email: string;
  class: string;
  admissionNo: string;
  subjects: SubjectData[];
  averageScore: number;
  attendance: number;
  rank: number;
  totalStudents: number;
  achievements: Achievement[];
  teacher: string;
  guardianName: string;
  guardianEmail: string;
  guardianPhone: string;
}

export interface SubjectData {
  name: string;
  score: number;
  grade: string;
  teacher: string;
  trend: 'up' | 'down' | 'stable';
  improvement: number;
  remark: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  date: string;
  icon: string;
}

export interface Exam {
  id: string;
  name: string;
  subject: string;
  date: string;
  time: string;
  venue: string;
  topics: string[];
}

export interface Assignment {
  id: string;
  name: string;
  subject: string;
  dueDate: string;
  status: 'pending' | 'submitted' | 'late';
  description: string;
}

// Get student data by ID
export async function getStudentData(studentId: string): Promise<StudentData | null> {
  // This will connect to your API/database
  // For now, returns demo data if student exists
  const demoStudents: Record<string, StudentData> = {
    'STU001': {
      id: 'STU001',
      name: 'Adeola K.',
      email: 'adeola@classora.com',
      class: 'SS2 Science',
      admissionNo: 'STU001',
      averageScore: 78,
      attendance: 95,
      rank: 8,
      totalStudents: 45,
      teacher: 'Mrs. Adebayo',
      guardianName: 'Mr. & Mrs. K.',
      guardianEmail: 'parent@classora.com',
      guardianPhone: '+234 802 345 6789',
      subjects: [
        { name: 'Mathematics', score: 85, grade: 'A', teacher: 'Mrs. Adebayo', trend: 'up' as const, improvement: 8, remark: 'Excellent progress' },
        { name: 'English', score: 78, grade: 'B+', teacher: 'Mr. Johnson', trend: 'stable' as const, improvement: 2, remark: 'Good performance' },
        { name: 'Physics', score: 72, grade: 'B', teacher: 'Dr. Okonkwo', trend: 'up' as const, improvement: 5, remark: 'Improved in mechanics' },
        { name: 'Chemistry', score: 68, grade: 'B-', teacher: 'Mrs. Eze', trend: 'down' as const, improvement: -4, remark: 'Needs focus' },
        { name: 'Biology', score: 82, grade: 'A-', teacher: 'Prof. Williams', trend: 'up' as const, improvement: 7, remark: 'Excellent in practicals' }
      ],
      achievements: [
        { id: '1', title: 'Top Performer - Mathematics', description: 'Highest score in class test', date: '2024-04-01', icon: '🏆' },
        { id: '2', title: 'Perfect Attendance', description: '100% attendance for March', date: '2024-03-31', icon: '⭐' }
      ]
    }
  };
  
  return demoStudents[studentId as keyof typeof demoStudents] || null;
}

// Get AI prediction for a student
export async function getAIPrediction(studentId: string, subject?: string) {
  // This will call your AI model
  return {
    predictedGrade: 'B+',
    confidence: 85,
    recommendedFocus: ['Chemistry', 'Physics'],
    studyHours: 30,
    riskLevel: 'low',
    insights: [
      'Strong improvement in Mathematics',
      'Chemistry needs additional practice',
      'Consistent performance in English'
    ]
  };
}

// Get School Guardian AI response
export async function getSchoolGuardianResponse(userRole: string, query: string, context: any) {
  // This will call your AI API
  const responses = {
    parent: `As your AI assistant, I can help you track ${context.childName || 'your child'}'s progress. Currently, they are performing well in Mathematics but need improvement in Chemistry. Would you like specific study recommendations?`,
    student: `Based on your performance, you're doing great in Mathematics and Biology! Focus on Chemistry practice problems for the next 2 weeks to improve your score by 10-15%.`,
    teacher: `Your class average is 74%. Chidi O. and David E. are at risk. Consider scheduling extra help sessions for Chemistry.`
  };
  
  return responses[userRole as keyof typeof responses] || responses.student;
}
