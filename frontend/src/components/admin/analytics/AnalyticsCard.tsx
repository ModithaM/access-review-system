import type { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';

interface AnalyticsCardProps {
  title: string;
  value: string;
  trend: number;
  icon: LucideIcon;
  accent: string;
  delay?: number;
}

export default function AnalyticsCard({
  title,
  value,
  trend,
  icon: Icon,
  accent,
  delay = 0,
}: AnalyticsCardProps) {
  const isPositive = trend >= 0;
  const TrendIcon = isPositive ? ArrowUpRight : ArrowDownRight;

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
      whileHover={{ y: -6 }}
      className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-md dark:border-gray-800 dark:bg-gray-900 dark:shadow-none"
    >
      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${accent}`} />
      <div className="mb-5 flex items-start justify-between gap-4">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${accent} shadow-lg shadow-pink-100/40`}
        >
          <Icon className="h-5 w-5 text-white" />
        </div>
        <div
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
            isPositive
              ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300'
              : 'bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300'
          }`}
        >
          <TrendIcon className="h-3.5 w-3.5" />
          {Math.abs(trend).toFixed(1)}%
        </div>
      </div>

      <div className="space-y-1">
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
        <p className="text-3xl font-semibold tracking-tight text-gray-900 dark:text-white">{value}</p>
        <p className="text-xs text-gray-400 dark:text-gray-500">
          {isPositive ? 'Up from previous period' : 'Down from previous period'}
        </p>
      </div>
    </motion.article>
  );
}
