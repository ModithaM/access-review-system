import type { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface AnalyticsSelectorCardProps {
  title: string;
  description: string;
  progressLabel: string;
  progressValue: number;
  accent: string;
  icon: LucideIcon;
  isActive: boolean;
  onClick: () => void;
}

export default function AnalyticsSelectorCard({
  title,
  accent,
  icon: Icon,
  isActive,
  onClick,
}: AnalyticsSelectorCardProps) {
  return (
    <motion.button
      type="button"
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border transition-all duration-300 ${
        isActive
          ? 'border-blue-200 bg-gradient-to-r from-white via-sky-50 to-white shadow-md ring-2 ring-blue-100 dark:border-blue-500/20 dark:from-gray-900 dark:via-slate-800 dark:to-gray-900 dark:ring-blue-500/20'
          : 'border-gray-200 bg-white shadow-sm hover:border-gray-300 hover:shadow-sm dark:border-gray-800 dark:bg-gray-900 dark:shadow-none'
      }`}
      aria-pressed={isActive}
      aria-label={title}
      title={title}
    >
      <div
        className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${accent}`}
      >
        <Icon className="h-4.5 w-4.5 text-white" />
      </div>
    </motion.button>
  );
}
