"use client";

import { BookOpen, TrendingUp, Award, Calendar, Clock, AlertCircle } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
  action?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export function EmptyState({ title, description, action, onAction, icon }: EmptyStateProps) {
  return (
    <div className="text-center py-12">
      <div className="w-20 h-20 mx-auto rounded-full bg-white/5 flex items-center justify-center mb-4">
        {icon || <BookOpen className="w-10 h-10 text-gray-500" />}
      </div>
      <h3 className="text-white font-semibold text-lg mb-2">{title}</h3>
      <p className="text-gray-400 text-sm max-w-md mx-auto mb-4">{description}</p>
      {action && onAction && (
        <button onClick={onAction} className="px-4 py-2 rounded-xl bg-blue-500/20 text-blue-400 text-sm hover:bg-blue-500/30 transition-colors">
          {action}
        </button>
      )}
    </div>
  );
}

export function LoadingState() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      <span className="ml-3 text-gray-400">Loading data...</span>
    </div>
  );
}

export function NoDataMessage({ message, suggestion }: { message: string; suggestion?: string }) {
  return (
    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 text-center">
      <AlertCircle className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
      <p className="text-yellow-400 text-sm">{message}</p>
      {suggestion && <p className="text-gray-400 text-xs mt-1">{suggestion}</p>}
    </div>
  );
}
