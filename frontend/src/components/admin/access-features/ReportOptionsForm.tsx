import { Check, Download, FileText, Search, SlidersHorizontal, Tags } from 'lucide-react';

import type { AccessFeature } from '@/services/access-features.service';
import {
  REPORT_FIELD_LABELS,
  type AccessFeatureReportOptions,
  type ReportField,
} from '@/utils/reportUtils';

interface ReportOptionsFormProps {
  options: AccessFeatureReportOptions;
  onChange: (next: AccessFeatureReportOptions) => void;
  onDownload: () => void;
  onCancel: () => void;
  isDownloading: boolean;
}

const categories: Array<'All' | AccessFeature['category']> = [
  'All',
  'Mobility',
  'Visual',
  'Auditory',
  'Cognitive',
  'Other',
];

const sortOptions = [
  { value: 'name-asc', label: 'Name A-Z' },
  { value: 'name-desc', label: 'Name Z-A' },
  { value: 'recently-added', label: 'Recently added' },
  { value: 'category', label: 'Category' },
] as const;

const formatOptions = [
  { value: 'pdf', label: 'PDF' },
  { value: 'csv', label: 'CSV' },
] as const;

const fieldOptions: ReportField[] = ['name', 'category', 'description', 'createdAt', 'status'];

const inputClassName =
  'h-11 w-full rounded-2xl border border-gray-200 bg-white/95 px-4 text-sm text-gray-900 shadow-[0_8px_24px_rgba(15,23,42,0.06)] outline-none transition-all duration-300 hover:border-[#7928CA]/25 hover:shadow-[0_12px_30px_rgba(121,40,202,0.10)] focus:border-[#7928CA]/35 focus:shadow-[0_0_0_4px_rgba(121,40,202,0.12),0_14px_32px_rgba(0,112,243,0.10)] dark:border-gray-700 dark:bg-gray-800/95 dark:text-white dark:hover:border-[#38BDF8]/30 dark:hover:shadow-[0_12px_30px_rgba(56,189,248,0.10)] dark:focus:border-[#38BDF8]/40 dark:focus:shadow-[0_0_0_4px_rgba(56,189,248,0.12),0_14px_32px_rgba(56,189,248,0.10)]';

export default function ReportOptionsForm({
  options,
  onChange,
  onDownload,
  onCancel,
  isDownloading,
}: ReportOptionsFormProps) {
  const updateField = <K extends keyof AccessFeatureReportOptions>(
    key: K,
    value: AccessFeatureReportOptions[K],
  ) => onChange({ ...options, [key]: value });

  const toggleSelectedField = (field: ReportField) => {
    const exists = options.selectedFields.includes(field);
    const selectedFields = exists
      ? options.selectedFields.filter((item) => item !== field)
      : [...options.selectedFields, field];

    if (selectedFields.length === 0) {
      return;
    }

    updateField('selectedFields', selectedFields);
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-5 md:grid-cols-2">
        <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-linear-to-r from-white to-[#F8FAFF] px-4 py-3 shadow-sm transition-all duration-300 hover:border-[#7928CA]/20 hover:shadow-[0_12px_30px_rgba(121,40,202,0.08)] dark:border-gray-700 dark:from-gray-800/95 dark:to-gray-900 dark:hover:border-[#38BDF8]/20 dark:hover:shadow-[0_12px_30px_rgba(56,189,248,0.08)] md:col-span-2">
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              Include all access features
            </p>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Leave this enabled to download the full report with no filters.
            </p>
          </div>
          <div className="relative inline-flex items-center">
            <input
              type="checkbox"
              checked={options.includeAll}
              onChange={(event) => updateField('includeAll', event.target.checked)}
              className="peer sr-only"
            />
            <div className="h-7 w-12 rounded-full bg-gray-200 transition-all duration-300 peer-checked:bg-linear-to-r peer-checked:from-[#FF0080] peer-checked:via-[#7928CA] peer-checked:to-[#0070F3] dark:bg-gray-700" />
            <div className="absolute left-1 h-5 w-5 rounded-full bg-white shadow-sm transition-all duration-300 peer-checked:translate-x-5" />
          </div>
        </label>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Filter by category
          </label>
          <div className="relative">
            <Tags className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
            <select
              value={options.category}
              onChange={(event) => updateField('category', event.target.value as AccessFeatureReportOptions['category'])}
              disabled={options.includeAll}
              className={`${inputClassName} appearance-none pl-11 disabled:cursor-not-allowed disabled:opacity-60`}
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category === 'All' ? 'All Categories' : category}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Search by feature name
          </label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
            <input
              value={options.searchTerm}
              onChange={(event) => updateField('searchTerm', event.target.value)}
              disabled={options.includeAll}
              placeholder="e.g., Wheelchair Ramp"
              className={`${inputClassName} pl-11 disabled:cursor-not-allowed disabled:opacity-60`}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Sort by
          </label>
          <div className="relative">
            <SlidersHorizontal className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
            <select
              value={options.sortBy}
              onChange={(event) => updateField('sortBy', event.target.value as AccessFeatureReportOptions['sortBy'])}
              className={`${inputClassName} appearance-none pl-11`}
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Report format
          </label>
          <div className="grid grid-cols-2 gap-2">
            {formatOptions.map((format) => {
              const isSelected = options.format === format.value;

              return (
                <button
                  key={format.value}
                  type="button"
                  onClick={() => updateField('format', format.value)}
                  className={`flex h-11 items-center justify-center rounded-2xl border text-sm font-medium transition-all duration-200 ${
                    isSelected
                      ? 'border-[#7928CA]/20 bg-linear-to-r from-[#FF0080]/8 via-[#7928CA]/10 to-[#0070F3]/8 text-[#7928CA] shadow-[0_10px_28px_rgba(121,40,202,0.10)] dark:border-[#38BDF8]/20 dark:text-[#38BDF8]'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-[#7928CA]/20 hover:text-gray-900 dark:border-gray-700 dark:bg-gray-800/90 dark:text-gray-300 dark:hover:border-[#38BDF8]/20 dark:hover:text-white'
                  }`}
                >
                  {format.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-gray-200 bg-white/90 p-5 shadow-[0_14px_40px_rgba(15,23,42,0.06)] dark:border-gray-800 dark:bg-gray-900/90">
        <div className="mb-4 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-linear-to-br from-[#FF0080]/10 via-[#7928CA]/10 to-[#0070F3]/10 text-[#7928CA] dark:text-[#38BDF8]">
            <FileText className="h-4 w-4" />
          </span>
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
              Report fields
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Choose which columns appear in the downloaded report.
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {fieldOptions.map((field) => {
            const isSelected = options.selectedFields.includes(field);

            return (
              <button
                key={field}
                type="button"
                onClick={() => toggleSelectedField(field)}
                className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-left transition-all duration-200 ${
                  isSelected
                    ? 'border-[#7928CA]/20 bg-linear-to-r from-[#FF0080]/8 via-[#7928CA]/10 to-[#0070F3]/8 text-gray-900 shadow-[0_10px_28px_rgba(121,40,202,0.10)] dark:border-[#38BDF8]/20 dark:text-white'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-[#7928CA]/20 hover:text-gray-900 dark:border-gray-700 dark:bg-gray-800/90 dark:text-gray-300 dark:hover:border-[#38BDF8]/20 dark:hover:text-white'
                }`}
              >
                <span className="font-medium">{REPORT_FIELD_LABELS[field]}</span>
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full transition-all duration-200 ${
                    isSelected
                      ? 'bg-linear-to-r from-[#FF0080] via-[#7928CA] to-[#0070F3] text-white'
                      : 'bg-gray-100 text-transparent dark:bg-gray-700'
                  }`}
                >
                  <Check className="h-3.5 w-3.5" />
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {options.includeAll && (
        <div className="rounded-2xl border border-[#7928CA]/10 bg-linear-to-r from-[#FF0080]/6 via-[#7928CA]/6 to-[#0070F3]/6 px-4 py-3 text-sm text-gray-600 dark:border-[#38BDF8]/10 dark:text-gray-300">
          No filters selected. The full access features report will be downloaded.
        </div>
      )}

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-2xl border border-gray-200 bg-white/90 px-5 py-2.5 text-sm font-medium text-gray-700 transition-all duration-200 hover:border-[#7928CA]/25 hover:bg-white dark:border-gray-700 dark:bg-gray-800/90 dark:text-gray-300 dark:hover:border-[#38BDF8]/25"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onDownload}
          disabled={isDownloading}
          className="inline-flex items-center rounded-2xl bg-linear-to-r from-[#FF0080] via-[#7928CA] to-[#0070F3] px-5 py-2.5 text-sm font-medium text-white shadow-[0_14px_30px_rgba(121,40,202,0.18)] transition-all duration-200 hover:shadow-[0_18px_36px_rgba(121,40,202,0.24)] disabled:cursor-not-allowed disabled:opacity-70"
        >
          <Download className="mr-2 h-4 w-4" />
          {isDownloading ? 'Generating...' : 'Download'}
        </button>
      </div>
    </div>
  );
}
