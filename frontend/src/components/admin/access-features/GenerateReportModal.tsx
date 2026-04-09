import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FileSpreadsheet, X } from 'lucide-react';

import type { AccessFeature } from '@/services/access-features.service';
import { downloadAccessFeaturesReport } from '@/utils/downloadAccessFeaturesReport';
import {
  DEFAULT_REPORT_OPTIONS,
  filterAndSortAccessFeatures,
  getReportSummary,
  type AccessFeatureReportOptions,
} from '@/utils/reportUtils';
import ReportOptionsForm from './ReportOptionsForm';

interface GenerateReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  features: AccessFeature[];
}

export default function GenerateReportModal({
  isOpen,
  onClose,
  features,
}: GenerateReportModalProps) {
  const [options, setOptions] = useState<AccessFeatureReportOptions>(DEFAULT_REPORT_OPTIONS);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setOptions(DEFAULT_REPORT_OPTIONS);
      setIsDownloading(false);
    }
  }, [isOpen]);

  const preparedFeatures = useMemo(
    () => filterAndSortAccessFeatures(features, options),
    [features, options],
  );

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      await Promise.resolve();
      downloadAccessFeaturesReport(preparedFeatures, options);
      onClose();
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm dark:bg-black/60"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 12 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-3xl -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[28px] border border-white/60 bg-white/95 shadow-[0_24px_80px_rgba(15,23,42,0.18)] transition-colors dark:border-gray-800/80 dark:bg-gray-900/95"
            role="dialog"
            aria-modal="true"
            aria-labelledby="generate-report-title"
          >
            <div className="border-b border-gray-100 bg-linear-to-r from-[#FF0080]/[0.03] via-[#7928CA]/[0.04] to-[#0070F3]/[0.03] px-6 py-5 dark:border-gray-800 dark:from-[#FF0080]/[0.06] dark:via-[#7928CA]/[0.08] dark:to-[#0070F3]/[0.06]">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-11 w-11 items-center justify-center rounded-2xl bg-linear-to-br from-[#FF0080]/12 via-[#7928CA]/12 to-[#0070F3]/12 text-[#7928CA] dark:text-[#38BDF8]">
                    <FileSpreadsheet className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-gray-400 dark:text-gray-500">
                      AccessAble Reports
                    </p>
                    <h3
                      id="generate-report-title"
                      className="mt-1 text-xl font-bold text-gray-900 dark:text-white"
                    >
                      Access Features Report
                    </h3>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      Customize your export and download a polished report for admin review.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-2xl border border-gray-200/80 bg-white/80 p-2.5 text-gray-400 shadow-sm transition-all duration-200 hover:border-[#7928CA]/20 hover:bg-white hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7928CA]/20 dark:border-gray-700 dark:bg-gray-900/80 dark:text-gray-500 dark:hover:border-[#38BDF8]/20 dark:hover:bg-gray-800 dark:hover:text-gray-300 dark:focus-visible:ring-[#38BDF8]/20"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="max-h-[80vh] overflow-y-auto p-6">
              <div className="mb-5 rounded-2xl border border-gray-200 bg-white/80 px-4 py-3 text-sm text-gray-600 shadow-sm dark:border-gray-800 dark:bg-gray-900/70 dark:text-gray-300">
                <div className="font-medium text-gray-900 dark:text-white">
                  Report preview
                </div>
                <div className="mt-1">
                  {getReportSummary(options)} | Records ready: {preparedFeatures.length}
                </div>
              </div>

              <ReportOptionsForm
                options={options}
                onChange={setOptions}
                onDownload={handleDownload}
                onCancel={onClose}
                isDownloading={isDownloading}
              />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
