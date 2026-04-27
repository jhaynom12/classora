// Utility for AI performance analysis
export interface PerformanceAnalysis {
  studentName: string;
  performanceMetrics: {
    averageScore: number;
    attendance: number;
    rank: number;
    totalStudents: number;
    recentTrend: string;
  };
  subjectsBreakdown: Array<{
    name: string;
    score: number;
    grade: string;
    teacher: string;
    trend: string;
  }>;
  suggestions: {
    analysis: string;
    structured: {
      summary: string[];
      strengths: string[];
      improvements: string[];
      actions: string[];
      motivational: string[];
    };
    role: string;
  };
  generatedAt: string;
}

export async function analyzeStudentPerformance(
  studentId: string,
  role: 'student' | 'parent' | 'teacher' = 'student'
): Promise<PerformanceAnalysis> {
  try {
    const response = await fetch('/api/ai/analyze-performance', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('classora_token')}`
      },
      body: JSON.stringify({
        studentId,
        role,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to analyze performance');
    }

    return await response.json();
  } catch (error) {
    console.error('Performance analysis error:', error);
    throw error;
  }
}

// Format suggestions for display
export function formatSuggestionsForDisplay(suggestions: PerformanceAnalysis['suggestions']) {
  return {
    summary: suggestions.structured.summary.join('\n'),
    strengths: suggestions.structured.strengths,
    improvements: suggestions.structured.improvements,
    actionItems: suggestions.structured.actions,
    motivation: suggestions.structured.motivational.join('\n'),
    fullAnalysis: suggestions.analysis
  };
}

// Get color for performance metric
export function getPerformanceColor(score: number): string {
  if (score >= 85) return '#22c55e'; // Green - Excellent
  if (score >= 75) return '#3b82f6'; // Blue - Good
  if (score >= 65) return '#f59e0b'; // Amber - Fair
  if (score >= 50) return '#ef4444'; // Red - Needs Attention
  return '#6b7280'; // Gray - Critical
}

// Get trend emoji
export function getTrendEmoji(trend: string): string {
  if (trend === 'up' || trend === 'improving') return '📈';
  if (trend === 'down') return '📉';
  return '➡️';
}
