import React from 'react';
import { motion } from 'framer-motion';

interface SummaryCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  delay?: number;
}

export default function SummaryCard({ title, value, icon: Icon, delay = 0 }: SummaryCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -5 }}
      className="bg-white dark:bg-gray-900 rounded-[2rem] p-6 shadow-sm hover:shadow-xl dark:shadow-none hover:shadow-blue-500/10 transition-all duration-300 relative overflow-hidden group border border-gray-100 dark:border-gray-800"
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-brand-gradient opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="flex items-center justify-between mb-4">
        <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
          <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        </div>
      </div>

      <div>
        <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">{title}</h3>
        <p className="text-3xl font-bold text-gray-900 dark:text-white group-hover:bg-brand-gradient group-hover:text-transparent group-hover:bg-clip-text transition-all duration-300">
          {value}
        </p>
      </div>
    </motion.div>
  );
}
