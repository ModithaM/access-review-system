interface ProgressStatProps {
  label: string;
  value: string;
  progress: number;
  accent: string;
}

export default function ProgressStat({ label, value, progress, accent }: ProgressStatProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 dark:shadow-none">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{label}</p>
        <span className="text-sm font-semibold text-gray-900 dark:text-white">{value}</span>
      </div>
      <div className="mt-3 h-2 rounded-full bg-gray-100 dark:bg-gray-800">
        <div
          className={`h-2 rounded-full bg-gradient-to-r ${accent}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
