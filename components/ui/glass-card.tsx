'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export function GlassCard({ children, className, hover = true, onClick }: GlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={hover ? { y: -4 } : {}}
      onClick={onClick}
      className={cn(
        'glass-card p-6 cursor-pointer',
        hover && 'transition-all duration-300',
        className
      )}
    >
      <div className="brand-overlay absolute inset-0 rounded-2xl" />
      {children}
    </motion.div>
  );
}