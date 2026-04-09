import { CalendarRange, RefreshCcw } from 'lucide-react';

type RangeOption = {
  label: string;
  value: string;
};

interface AnalyticsHeaderProps {
  dateRange: string;
  onDateRangeChange: (value: string) => void;
  rangeOptions: RangeOption[];
  categoryFilter: string;
  onCategoryFilterChange: (value: string) => void;
  categoryOptions: string[];
  isRefreshing: boolean;
  onRefresh: () => void;
}

export default function AnalyticsHeader({
  dateRange,
  onDateRangeChange,
  rangeOptions,
  categoryFilter,
  onCategoryFilterChange,
  categoryOptions,
  isRefreshing,
  onRefresh,
}: AnalyticsHeaderProps) {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 dark:shadow-none lg:p-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,0,128,0.10),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(56,189,248,0.14),_transparent_35%)]" />
      <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
        <div className="max-w-2xl">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white/90 px-3 py-1 text-xs font-medium text-gray-600 backdrop-blur dark:border-gray-700 dark:bg-gray-800/80 dark:text-gray-300">
            <CalendarRange className="h-3.5 w-3.5" />
            Compact analytics
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900 dark:text-white lg:text-4xl">
            Analytics Dashboard
          </h1>
          <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 lg:text-base">
            Monitor platform performance and accessibility insights without leaving the page
          </p>
        </div>

        <div className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center md:justify-end">
          <label className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600 shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:shadow-none">
            <span className="font-medium text-gray-900 dark:text-white">Range</span>
            <select
              value={dateRange}
              onChange={(event) => onDateRangeChange(event.target.value)}
              className="bg-transparent text-sm text-gray-600 outline-none dark:text-gray-300"
              aria-label="Filter analytics by date range"
            >
              {rangeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600 shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:shadow-none">
            <span className="font-medium text-gray-900 dark:text-white">Category</span>
            <select
              value={categoryFilter}
              onChange={(event) => onCategoryFilterChange(event.target.value)}
              className="bg-transparent text-sm text-gray-600 outline-none dark:text-gray-300"
              aria-label="Filter analytics by space category"
            >
              {categoryOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition-all duration-300 hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
          >
            <RefreshCcw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>
    </section>
  );
}
