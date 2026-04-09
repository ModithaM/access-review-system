import { FileText } from 'lucide-react';

import Button from '@/components/admin/Button';

interface GenerateReportButtonProps {
  onClick: () => void;
}

export default function GenerateReportButton({ onClick }: GenerateReportButtonProps) {
  return (
    <Button
      type="button"
      variant="outline"
      onClick={onClick}
      className="rounded-2xl border-gray-200 bg-white/90 px-5 shadow-[0_10px_28px_rgba(15,23,42,0.06)] hover:border-[#7928CA]/25 hover:bg-white hover:shadow-[0_14px_34px_rgba(121,40,202,0.10)] dark:border-gray-700 dark:bg-gray-800/90 dark:hover:border-[#38BDF8]/25 dark:hover:bg-gray-800"
    >
      <FileText size={18} className="mr-2 text-[#7928CA] dark:text-[#38BDF8]" />
      Generate Report
    </Button>
  );
}
