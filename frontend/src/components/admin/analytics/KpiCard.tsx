import type { LucideIcon } from 'lucide-react';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface KpiCardProps {
  title: string;
  value: string;
  trend: number;
  progress: number;
  icon: LucideIcon;
  accent: string;
  delay?: number;
}

export default function KpiCard({
  title,
  value,
  trend,
  progress,
  icon: Icon,
  accent,
  delay = 0,
}: KpiCardProps) {
  const positive = trend >= 0;
  const TrendIcon = positive ? ArrowUpRight : ArrowDownRight;

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
      whileHover={{ y: -4 }}
      className="rounded-2xl border border-gray-200 bg-white p-3.5 shadow-sm transition-all duration-300 hover:shadow-md dark:border-gray-800 dark:bg-gray-900 dark:shadow-none"
    >
      <div className="flex items-start justify-between gap-3">
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${accent}`}
        >
          <Icon className="h-4.5 w-4.5 text-white" />
        </div>
        <div
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
            positive
              ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300'
              : 'bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300'
          }`}
        >
          <TrendIcon className="h-3.5 w-3.5" />
          {Math.abs(trend).toFixed(1)}%
        </div>
      </div>

      <div className="mt-3">
        <p className="text-[13px] font-medium text-gray-600 dark:text-gray-400">{title}</p>
        <p className="mt-1 text-[1.7rem] font-semibold tracking-tight text-gray-900 dark:text-white">
          {value}
        </p>
      </div>

      <div className="mt-3">
        <div className="mb-1.5 flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400">
          <span>Progress</span>
          <span>{progress}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-gray-100 dark:bg-gray-800">
          <div
            className={`h-1.5 rounded-full bg-gradient-to-r ${accent}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </motion.article>
  );
}
