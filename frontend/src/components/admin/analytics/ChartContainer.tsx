import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface ChartContainerProps {
  title: string;
  description?: string;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
  delay?: number;
}

export default function ChartContainer({
  title,
  description,
  children,
  action,
  className = '',
  delay = 0,
}: ChartContainerProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={`rounded-3xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md dark:border-gray-800 dark:bg-gray-900 dark:shadow-none ${className}`}
    >
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
          {description ? <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p> : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      {children}
    </motion.section>
  );
}
