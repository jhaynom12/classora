/**
 * Performance Insights Component
 * Displays AI-generated suggestions for students, parents, and teachers
 */
'use client';

import { useState, useEffect } from 'react';
import { analyzeStudentPerformance, getPerformanceColor, getTrendEmoji } from '@/lib/performance-analyzer';

interface PerformanceInsightsProps {
  studentId: string;
  userRole: 'student' | 'parent' | 'teacher';
  studentName?: string;
}

export default function PerformanceInsights({
  studentId,
  userRole,
  studentName = 'Student'
}: PerformanceInsightsProps) {
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        setLoading(true);
        const data = await analyzeStudentPerformance(studentId, userRole);
        setAnalysis(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load performance insights');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (studentId) {
      fetchAnalysis();
    }
  }, [studentId, userRole]);

  if (loading) {
    return (
      <div className="p-6 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg border border-indigo-200">
        <div className="flex items-center justify-center gap-3">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600"></div>
          <span className="text-indigo-600">Analyzing performance...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 rounded-lg border border-red-200">
        <p className="text-red-800 font-semibold">⚠️ {error}</p>
      </div>
    );
  }

  if (!analysis) {
    return null;
  }

  const { performanceMetrics, subjectsBreakdown, suggestions } = analysis;
  const struct = suggestions.structured;

  return (
    <div className="space-y-4">
      {/* Performance Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard
          label="Average Score"
          value={`${performanceMetrics.averageScore}%`}
          color={getPerformanceColor(performanceMetrics.averageScore)}
        />
        <MetricCard
          label="Attendance"
          value={`${performanceMetrics.attendance}%`}
          color={performanceMetrics.attendance >= 75 ? '#22c55e' : '#ef4444'}
        />
        {performanceMetrics.rank > 0 && (
          <MetricCard
            label="Rank"
            value={`${performanceMetrics.rank}/${performanceMetrics.totalStudents}`}
            color="#3b82f6"
          />
        )}
        <MetricCard
          label="Trend"
          value={getTrendEmoji(performanceMetrics.recentTrend)}
          subtitle={performanceMetrics.recentTrend}
          color="#f59e0b"
        />
      </div>

      {/* Subjects Breakdown */}
      <SubjectsCard subjects={subjectsBreakdown} />

      {/* AI Suggestions */}
      <div className="space-y-3">
        {struct.summary.length > 0 && (
          <SectionCard
            title="📊 Performance Summary"
            items={struct.summary}
            isExpanded={expandedSection === 'summary'}
            onToggle={() => setExpandedSection(expandedSection === 'summary' ? null : 'summary')}
          />
        )}

        {struct.strengths.length > 0 && (
          <SectionCard
            title="⭐ Strengths"
            items={struct.strengths}
            bgColor="bg-green-50"
            borderColor="border-green-200"
            isExpanded={expandedSection === 'strengths'}
            onToggle={() => setExpandedSection(expandedSection === 'strengths' ? null : 'strengths')}
          />
        )}

        {struct.improvements.length > 0 && (
          <SectionCard
            title="🎯 Areas for Improvement"
            items={struct.improvements}
            bgColor="bg-amber-50"
            borderColor="border-amber-200"
            isExpanded={expandedSection === 'improvements'}
            onToggle={() => setExpandedSection(expandedSection === 'improvements' ? null : 'improvements')}
          />
        )}

        {struct.actions.length > 0 && (
          <SectionCard
            title="✅ Recommended Actions"
            items={struct.actions}
            bgColor="bg-blue-50"
            borderColor="border-blue-200"
            isExpanded={expandedSection === 'actions'}
            onToggle={() => setExpandedSection(expandedSection === 'actions' ? null : 'actions')}
          />
        )}

        {struct.motivational.length > 0 && (
          <SectionCard
            title="💪 Motivation"
            items={struct.motivational}
            bgColor="bg-purple-50"
            borderColor="border-purple-200"
            isExpanded={expandedSection === 'motivation'}
            onToggle={() => setExpandedSection(expandedSection === 'motivation' ? null : 'motivation')}
          />
        )}

        {/* Full AI Analysis */}
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <button
            onClick={() => setExpandedSection(expandedSection === 'full' ? null : 'full')}
            className="flex items-center justify-between w-full text-left font-semibold text-gray-700 hover:text-gray-900"
          >
            <span>🤖 Full AI Analysis</span>
            <span className="text-xl">{expandedSection === 'full' ? '▼' : '▶'}</span>
          </button>
          {expandedSection === 'full' && (
            <div className="mt-3 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
              {suggestions.analysis}
            </div>
          )}
        </div>
      </div>

      {/* Generated Info */}
      <div className="text-xs text-gray-500 text-center pt-2 border-t border-gray-200">
        Generated on {new Date(analysis.generatedAt).toLocaleDateString()} at{' '}
        {new Date(analysis.generatedAt).toLocaleTimeString()}
      </div>
    </div>
  );
}

interface MetricCardProps {
  label: string;
  value: string;
  subtitle?: string;
  color: string;
}

function MetricCard({ label, value, subtitle, color }: MetricCardProps) {
  return (
    <div
      className="p-4 rounded-lg border-2 text-center"
      style={{
        borderColor: color,
        backgroundColor: color + '15'
      }}
    >
      <p className="text-xs text-gray-600 font-medium">{label}</p>
      <p className="text-2xl font-bold mt-1" style={{ color }}>
        {value}
      </p>
      {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
    </div>
  );
}

interface SubjectsCardProps {
  subjects: Array<{
    name: string;
    score: number;
    grade: string;
    teacher: string;
    trend: string;
  }>;
}

function SubjectsCard({ subjects }: SubjectsCardProps) {
  return (
    <div className="p-4 bg-white rounded-lg border border-gray-200">
      <h3 className="font-semibold text-gray-900 mb-3">📚 Subject Performance</h3>
      <div className="space-y-2">
        {subjects.map((subject, idx) => (
          <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-900">{subject.name}</span>
              <span className="text-sm font-semibold px-2 py-1 rounded bg-blue-100 text-blue-800">
                {subject.grade}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">{subject.score}%</span>
              <span className="text-lg">{getTrendEmoji(subject.trend)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface SectionCardProps {
  title: string;
  items: string[];
  bgColor?: string;
  borderColor?: string;
  isExpanded: boolean;
  onToggle: () => void;
}

function SectionCard({
  title,
  items,
  bgColor = 'bg-indigo-50',
  borderColor = 'border-indigo-200',
  isExpanded,
  onToggle
}: SectionCardProps) {
  return (
    <div className={`p-4 rounded-lg border ${bgColor} ${borderColor}`}>
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full text-left font-semibold text-gray-900 hover:text-gray-700"
      >
        <span>{title}</span>
        <span className="text-xl">{isExpanded ? '▼' : '▶'}</span>
      </button>
      {isExpanded && (
        <ul className="mt-3 space-y-2">
          {items.map((item, idx) => (
            <li key={idx} className="flex gap-2 text-sm text-gray-700">
              <span className="text-base">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
