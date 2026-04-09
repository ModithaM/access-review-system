import { AnimatePresence, motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface AnalyticsChartPanelProps {
  title: string;
  description: string;
  insight: string;
  chartKey: string;
  chart: ReactNode;
  sideContent: ReactNode;
}

export default function AnalyticsChartPanel({
  title,
  description,
  insight,
  chartKey,
  chart,
  sideContent,
}: AnalyticsChartPanelProps) {
  return (
    <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 dark:shadow-none lg:p-6">
      <div className="mb-5 flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{description}</p>
        </div>
        <div className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">
          {insight}
        </div>
      </div>

      <div className="space-y-5">
        <div className="rounded-3xl border border-gray-200 bg-white/80 p-3 dark:border-gray-800 dark:bg-gray-950/40">
          <AnimatePresence mode="wait">
            <motion.div
              key={chartKey}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.25 }}
            >
              {chart}
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 2xl:grid-cols-4">{sideContent}</div>
      </div>
    </section>
  );
}
