import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface PerformanceData {
  studentName: string;
  subjects: {
    name: string;
    score: number;
    grade: string;
    teacher: string;
    trend: string;
  }[];
  averageScore: number;
  attendance: number;
  rank: number;
  totalStudents: number;
  recentTrend: string;
}

export async function POST(request: Request) {
  try {
    const { studentId, role, parentId } = await request.json();

    if (!studentId) {
      return NextResponse.json({
        error: 'Student ID is required',
        suggestions: []
      }, { status: 400 });
    }

    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        error: 'API key not configured',
        suggestions: []
      }, { status: 500 });
    }

    // Fetch student performance data
    console.log(`📊 Fetching performance data for student: ${studentId}`);
    
    const student = await prisma.user.findUnique({
      where: { id: studentId },
      include: {
        marks: {
          include: {
            classSubject: {
              include: {
                subject: true,
                teacher: true
              }
            }
          }
        },
        results: {
          orderBy: { publishedAt: 'desc' },
          take: 5
        },
        enrollments: {
          include: { class: true }
        }
      }
    });

    if (!student) {
      return NextResponse.json({
        error: 'Student not found',
        suggestions: []
      }, { status: 404 });
    }

    // Prepare performance data for AI analysis
    const performanceData = preparePerformanceData(student);

    console.log('✅ Performance data prepared:', performanceData);

    // Generate AI analysis and suggestions
    const suggestions = await generateAISuggestions(
      performanceData,
      role || 'student',
      apiKey
    );

    return NextResponse.json({
      studentName: performanceData.studentName,
      performanceMetrics: {
        averageScore: performanceData.averageScore,
        attendance: performanceData.attendance,
        rank: performanceData.rank,
        totalStudents: performanceData.totalStudents,
        recentTrend: performanceData.recentTrend
      },
      subjectsBreakdown: performanceData.subjects,
      suggestions: suggestions,
      generatedAt: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('❌ Performance analysis error:', error?.message || error);
    return NextResponse.json({
      error: 'Failed to analyze performance',
      suggestions: [],
      message: error?.message
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

function preparePerformanceData(student: any): PerformanceData {
  const marks = student.marks || [];
  const results = student.results || [];

  // Group marks by subject
  const subjectScores: { [key: string]: number[] } = {};
  const subjectTeachers: { [key: string]: string } = {};

  marks.forEach((mark: any) => {
    const subjectName = mark.classSubject?.subject?.name || 'Unknown';
    const teacherName = mark.classSubject?.teacher?.name || 'Unknown';
    
    if (!subjectScores[subjectName]) {
      subjectScores[subjectName] = [];
    }
    subjectScores[subjectName].push(mark.score);
    subjectTeachers[subjectName] = teacherName;
  });

  // Calculate averages and trends
  const subjects = Object.entries(subjectScores).map(([name, scores]) => {
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    const recent = scores.slice(-3);
    const trend = recent.length > 1
      ? recent[recent.length - 1] > recent[0] ? 'up' : 
        recent[recent.length - 1] < recent[0] ? 'down' : 'stable'
      : 'stable';
    
    return {
      name,
      score: Math.round(avg),
      grade: scoreToGrade(avg),
      teacher: subjectTeachers[name],
      trend
    };
  });

  const averageScore = subjects.length > 0
    ? Math.round(subjects.reduce((a, b) => a + b.score, 0) / subjects.length)
    : 0;

  // Get latest result for additional metrics
  const latestResult = results[0];
  const attendance = 85; // Mock value - should be fetched from database
  const rank = latestResult?.position || 0;
  const totalStudents = latestResult?.outOf || 0;

  // Determine overall trend
  const recentTrend = subjects.length > 0
    ? subjects.filter(s => s.trend === 'up').length > subjects.length / 2 ? 'improving' : 'needs attention'
    : 'unknown';

  return {
    studentName: student.name,
    subjects: subjects.sort((a, b) => b.score - a.score),
    averageScore,
    attendance,
    rank,
    totalStudents,
    recentTrend
  };
}

function scoreToGrade(score: number): string {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B+';
  if (score >= 70) return 'B';
  if (score >= 60) return 'C+';
  if (score >= 50) return 'C';
  return 'D';
}

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function generateAISuggestions(
  performanceData: PerformanceData,
  role: string,
  apiKey: string
): Promise<any> {
  const genAI = new GoogleGenerativeAI(apiKey);
  
  const performanceContext = `
Student: ${performanceData.studentName}
Average Score: ${performanceData.averageScore}%
Attendance: ${performanceData.attendance}%
Rank: ${performanceData.rank} out of ${performanceData.totalStudents}
Overall Trend: ${performanceData.recentTrend}

Subject Performance:
${performanceData.subjects.map(s => 
  `- ${s.name}: ${s.score}% (Grade: ${s.grade}, Trend: ${s.trend}, Teacher: ${s.teacher})`
).join('\n')}
`;

  const systemPrompts = {
    student: `You are School Guardian, an AI educational advisor for students. Analyze the student's performance data and provide:
1. Key strengths (2-3 subjects where they excel)
2. Areas needing improvement (2-3 subjects that need attention)
3. Specific actionable study strategies for the next 2 weeks
4. Motivational insights and encouragement
Keep responses concise, practical, and motivating for a student.`,
    
    parent: `You are School Guardian, an AI educational advisor for parents. Analyze the student's performance data and provide:
1. Overall academic performance summary
2. Strengths and achievements to celebrate
3. Areas requiring parental support and intervention
4. Specific recommendations for home study support
5. Communication suggestions with teachers
Keep responses professional, constructive, and actionable for parents.`,
    
    teacher: `You are School Guardian, an AI educational advisor for teachers. Analyze the student's performance data and provide:
1. Individual student performance analysis
2. Recommended teaching adjustments
3. Peer collaboration opportunities
4. Assessment and support strategies
5. Integration with classroom dynamics
Keep responses focused on pedagogical best practices.`
  };

  const systemPrompt = systemPrompts[role as keyof typeof systemPrompts] || systemPrompts.student;

  const models = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-2.0-flash-lite'];
  let lastError: any = null;
  
  // Try each model with retry logic
  for (const modelName of models) {
    for (let retryAttempt = 0; retryAttempt < 3; retryAttempt++) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent([
          systemPrompt,
          `Analyze this student performance and provide suggestions:\n\n${performanceContext}`
        ]);
        
        const aiResponse = result.response.text();
        
        // Parse AI response into structured suggestions
        const suggestions = parseAISuggestions(aiResponse, role);
        
        return {
          analysis: aiResponse,
          structured: suggestions,
          role: role,
          generatedAt: new Date().toISOString()
        };
      } catch (error: any) {
        lastError = error;
        const errorMessage = error?.message || '';
        
        // Check for rate limiting or service unavailable errors
        if (errorMessage.includes('503') || errorMessage.includes('429') || errorMessage.includes('high demand')) {
          console.warn(`⚠️ Model ${modelName} attempt ${retryAttempt + 1}/3: Service unavailable or rate limited. Waiting before retry...`);
          // Exponential backoff: 2s, 4s, 8s
          await sleep(Math.pow(2, retryAttempt + 1) * 1000);
          continue;
        }
        
        console.warn(`⚠️ Model ${modelName} failed:`, errorMessage);
        break; // Don't retry on other errors, try next model
      }
    }
  }
  
  console.error('❌ AI generation failed after all retries:', lastError?.message);
  return {
    analysis: '⚠️ AI service is currently experiencing high demand. Please try again in a moment. Using local analysis instead.',
    structured: generateBasicSuggestions(performanceData, role),
    error: true,
    errorMessage: lastError?.message
  };
}

function parseAISuggestions(response: string, role: string): any {
  // Extract key sections from AI response
  return {
    summary: extractSection(response, 'summary|overall|performance'),
    strengths: extractBulletPoints(response, 'strength|excel|good|strong|excellent'),
    improvements: extractBulletPoints(response, 'improve|focus|need|attention|weak'),
    actions: extractBulletPoints(response, 'should|recommend|action|strategy|study|practice'),
    motivational: extractSection(response, 'motivat|encourag|inspire|positive')
  };
}

function extractSection(text: string, keywords: string): string[] {
  const lines = text.split('\n');
  const results: string[] = [];
  const keywordRegex = new RegExp(keywords, 'i');
  
  let captureNext = false;
  for (const line of lines) {
    if (keywordRegex.test(line)) {
      captureNext = true;
      results.push(line.replace(/^[*•-\s]+/, ''));
    } else if (captureNext && line.trim().startsWith('•') || line.trim().startsWith('-')) {
      results.push(line.replace(/^[*•-\s]+/, ''));
    } else if (captureNext && !line.trim()) {
      break;
    }
  }
  
  return results.filter(r => r.length > 0);
}

function extractBulletPoints(text: string, keywords: string): string[] {
  const keywordRegex = new RegExp(keywords, 'i');
  const lines = text.split('\n');
  
  return lines
    .filter(line => (line.includes('•') || line.includes('-') || line.includes('*')) && keywordRegex.test(text.substring(Math.max(0, text.indexOf(line) - 100))))
    .map(line => line.replace(/^[*•-\s]+/, '').trim())
    .filter(line => line.length > 0)
    .slice(0, 5);
}

function generateBasicSuggestions(performanceData: PerformanceData, role: string): any {
  const topSubjects = performanceData.subjects.slice(0, 2);
  const bottomSubjects = performanceData.subjects.slice(-2);
  
  return {
    summary: [`Average score: ${performanceData.averageScore}%`, `Overall trend: ${performanceData.recentTrend}`],
    strengths: topSubjects.map(s => `Strong performance in ${s.name} (${s.score}%)`),
    improvements: bottomSubjects.map(s => `Focus on ${s.name} (${s.score}%)`),
    actions: [
      `Dedicate 30 mins daily to ${bottomSubjects[0]?.name || 'challenging subjects'}`,
      `Review class notes within 24 hours of lessons`,
      `Join study groups for subjects with downward trend`
    ],
    motivational: ['You have strong foundational knowledge', 'Consistent effort will lead to improvement']
  };
}
