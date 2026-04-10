import React, { useState } from 'react';
import { Search, Filter, Edit3, Trash2, Eye } from 'lucide-react';
import Button from './Button';

export interface Column {
  key: string;
  header: string;
  render?: (row: any) => React.ReactNode;
}

interface DataTableProps {
  title: string;
  columns: Column[];
  data: any[];
  onEdit?: (row: any) => void;
  onDelete?: (row: any) => void;
  onView?: (row: any) => void;
  toolbarActions?: React.ReactNode;
  searchPlaceholder?: string;
  searchTerm?: string;
  onSearchTermChange?: (value: string) => void;
  customFilter?: (row: any, searchTerm: string) => boolean;
  hideFilterButton?: boolean;
}

export default function DataTable({
  title,
  columns,
  data,
  onEdit,
  onDelete,
  onView,
  toolbarActions,
  searchPlaceholder = 'Search...',
  searchTerm,
  onSearchTermChange,
  customFilter,
  hideFilterButton = false,
}: DataTableProps) {
  const [internalSearchTerm, setInternalSearchTerm] = useState('');
  const activeSearchTerm = searchTerm ?? internalSearchTerm;
  const safeData = Array.isArray(data) ? data : [];
  const handleSearchChange = (value: string) => {
    if (onSearchTermChange) {
      onSearchTermChange(value);
      return;
    }

    setInternalSearchTerm(value);
  };

  const filteredData = safeData.filter((row) => {
    if (!activeSearchTerm.trim()) {
      return true;
    }

    if (customFilter) {
      return customFilter(row, activeSearchTerm);
    }

    return Object.values(row).some((val) =>
      String(val).toLowerCase().includes(activeSearchTerm.toLowerCase()),
    );
  });

  return (
    <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden transition-colors duration-300">
      <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white transition-colors">
          {title}
        </h2>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="group relative">
            <div className="pointer-events-none absolute inset-0 rounded-2xl bg-linear-to-r from-[#FF0080]/0 via-[#7928CA]/0 to-[#0070F3]/0 opacity-0 blur-xl transition-opacity duration-300 group-focus-within:opacity-100" />
            <Search className="absolute left-4 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-gray-400 transition-colors duration-200 group-focus-within:text-[#7928CA] dark:text-gray-500 dark:group-focus-within:text-[#38BDF8]" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={activeSearchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="relative h-11 w-full min-w-[260px] rounded-2xl border border-gray-200 bg-white/95 pl-11 pr-4 text-sm text-gray-900 shadow-[0_8px_24px_rgba(15,23,42,0.06)] outline-none transition-all duration-300 placeholder:text-gray-400 hover:border-[#7928CA]/25 hover:shadow-[0_12px_30px_rgba(121,40,202,0.10)] focus:border-[#7928CA]/35 focus:shadow-[0_0_0_4px_rgba(121,40,202,0.12),0_14px_32px_rgba(0,112,243,0.10)] dark:border-gray-700 dark:bg-gray-800/95 dark:text-white dark:placeholder:text-gray-500 dark:hover:border-[#38BDF8]/30 dark:hover:shadow-[0_12px_30px_rgba(56,189,248,0.10)] dark:focus:border-[#38BDF8]/40 dark:focus:shadow-[0_0_0_4px_rgba(56,189,248,0.12),0_14px_32px_rgba(56,189,248,0.10)] sm:w-72"
            />
          </div>
          {!hideFilterButton && (
            <Button variant="outline" className="shrink-0 p-2 h-11 w-11 rounded-2xl">
              <Filter className="h-4 w-4" />
            </Button>
          )}
          {toolbarActions}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800 transition-colors">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  {col.header}
                </th>
              ))}
              {(onEdit || onDelete || onView) && (
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800 transition-colors">
            {filteredData.length > 0 ? (
              filteredData.map((row, index) => (
                <tr
                  key={row.id || index}
                  className="hover:bg-gray-50/80 dark:hover:bg-gray-800/80 transition-colors duration-200 group"
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className="px-6 py-4 text-sm text-gray-900 dark:text-gray-300 whitespace-nowrap"
                    >
                      {col.render ? col.render(row) : row[col.key]}
                    </td>
                  ))}
                  {(onEdit || onDelete || onView) && (
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        {onView && (
                          <button
                            onClick={() => onView(row)}
                            className="text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700 p-1.5 rounded-lg transition-colors"
                            title="View"
                          >
                            <Eye size={16} />
                          </button>
                        )}
                        {onEdit && (
                          <button
                            onClick={() => onEdit(row)}
                            className="text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-gray-700 p-1.5 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit3 size={16} />
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={() => onDelete(row)}
                            className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-gray-700 p-1.5 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length + 1}
                  className="px-6 py-8 text-center text-gray-500 dark:text-gray-400 text-sm"
                >
                  No data found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 transition-colors">
        <div>Showing {filteredData.length} entries</div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            disabled
            className="rounded-full border border-gray-200 bg-white/90 px-5 py-2 text-gray-700 shadow-sm backdrop-blur-md transition-all duration-300 hover:scale-105 hover:border-[#7928CA]/20 hover:bg-linear-to-r hover:from-[#FF0080]/8 hover:via-[#7928CA]/8 hover:to-[#0070F3]/8 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:border-[#38BDF8]/20 dark:hover:bg-linear-to-r dark:hover:from-[#FF0080]/20 dark:hover:via-[#7928CA]/20 dark:hover:to-[#0070F3]/20"
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled
            className="rounded-full border border-gray-200 bg-white/90 px-5 py-2 text-gray-700 shadow-sm backdrop-blur-md transition-all duration-300 hover:scale-105 hover:border-[#7928CA]/20 hover:bg-linear-to-r hover:from-[#FF0080]/8 hover:via-[#7928CA]/8 hover:to-[#0070F3]/8 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:border-[#38BDF8]/20 dark:hover:bg-linear-to-r dark:hover:from-[#FF0080]/20 dark:hover:via-[#7928CA]/20 dark:hover:to-[#0070F3]/20"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
