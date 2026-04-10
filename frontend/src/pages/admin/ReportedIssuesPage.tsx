import { AlertCircle, CheckCircle2, Clock, Edit3, Loader, Download } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import SummaryCard from '../../components/admin/SummaryCard';
import DataTable, { type Column } from '../../components/admin/DataTable';
import Badge from '../../components/admin/Badge';
import Modal from '../../components/admin/Modal';
import Button from '../../components/admin/Button';
import issueService, { type Issue } from '../../services/issue.service';
import { downloadIssuesReport, type IssueReportFormat } from '../../utils/downloadIssuesReport';

const COLUMNS: Column[] = [
  {
    key: 'title',
    header: 'Issue Title',
    render: (row: any) => (
      <span className="font-medium text-gray-900 dark:text-white">{row.title}</span>
    ),
  },
  {
    key: 'location',
    header: 'Location',
    render: (row: any) => <span className="text-gray-700 dark:text-gray-300">{row.location}</span>,
  },
  {
    key: 'severity',
    header: 'Severity',
    render: (row: any) => {
      const severityColors = {
        Critical: 'danger',
        High: 'warning',
        Medium: 'info',
        Low: 'success',
      } as const;
      return (
        <Badge variant={severityColors[row.severity as keyof typeof severityColors] || 'default'}>
          {row.severity}
        </Badge>
      );
    },
  },
  {
    key: 'status',
    header: 'Status',
    render: (row: any) => {
      const statusVariants = {
        Open: 'warning',
        'In Progress': 'info',
        Resolved: 'success',
      } as const;
      return (
        <Badge variant={statusVariants[row.status as keyof typeof statusVariants] || 'default'}>
          {row.status}
        </Badge>
      );
    },
  },
  {
    key: 'reporter',
    header: 'Reported By',
    render: (row: any) => <span className="text-gray-700 dark:text-gray-300">{row.reporter}</span>,
  },
  {
    key: 'createdAt',
    header: 'Date',
    render: (row: any) => (
      <span className="text-gray-700 dark:text-gray-300 text-sm">
        {row.createdAt ? new Date(row.createdAt).toLocaleDateString() : 'N/A'}
      </span>
    ),
  },
];

export default function ReportedIssuesPage() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [downloadModalOpen, setDownloadModalOpen] = useState(false);
  const [reportFormat, setReportFormat] = useState<IssueReportFormat>('pdf');
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<Issue>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [issuesRes, statsRes] = await Promise.all([
        issueService.getAllIssues(1, 100),
        issueService.getStats(),
      ]);
      setIssues(issuesRes.data.result.data || []);
      setStats(statsRes.data.result);
    } catch (err: any) {
      console.error('Failed to load issues:', err);
      setError('Failed to load issues. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewIssue = (issue: Issue) => {
    setSelectedIssue(issue);
    setViewModalOpen(true);
  };

  const handleEditIssue = (issue: Issue) => {
    setSelectedIssue(issue);
    setEditFormData(issue);
    setEditModalOpen(true);
  };

  const handleDeleteIssue = (issue: Issue) => {
    setSelectedIssue(issue);
    setDeleteModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedIssue?._id) return;
    setIsSubmitting(true);
    try {
      const response = await issueService.updateIssue(selectedIssue._id, {
        status: editFormData.status || selectedIssue.status,
        severity: editFormData.severity || selectedIssue.severity,
        adminNotes: editFormData.adminNotes,
      });

      setIssues(
        issues.map((issue) => (issue._id === selectedIssue._id ? response.data.result : issue)),
      );
      setEditModalOpen(false);
      setSelectedIssue(null);
      setEditFormData({});
      // Refresh stats
      await loadData();
    } catch (err: any) {
      console.error('Failed to update issue:', err);
      setError('Failed to update issue. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedIssue?._id) return;
    setIsSubmitting(true);
    try {
      await issueService.deleteIssue(selectedIssue._id);
      setIssues(issues.filter((issue) => issue._id !== selectedIssue._id));
      setDeleteModalOpen(false);
      setSelectedIssue(null);
      // Refresh stats
      await loadData();
    } catch (err: any) {
      console.error('Failed to delete issue:', err);
      setError('Failed to delete issue. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadReport = () => {
    downloadIssuesReport(issues, reportFormat);
    setDownloadModalOpen(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
          <Loader className="w-8 h-8 text-blue-600 dark:text-blue-400" />
        </motion.div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-8">
        {/* Error Alert */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-xl flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-900 dark:text-red-200">{error}</p>
              <Button
                onClick={loadData}
                className="mt-2 px-3 py-1 text-sm bg-red-600 text-white hover:bg-red-700 rounded-lg"
              >
                Retry
              </Button>
            </div>
          </motion.div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <SummaryCard
            title="Total Issues"
            value={stats?.summary?.total || 0}
            icon={AlertCircle}
            delay={0.1}
          />
          <SummaryCard
            title="Open Issues"
            value={stats?.summary?.open || 0}
            icon={Clock}
            delay={0.2}
          />
          <SummaryCard
            title="In Progress"
            value={stats?.summary?.inProgress || 0}
            icon={Edit3}
            delay={0.3}
          />
          <SummaryCard
            title="Resolved"
            value={stats?.summary?.resolved || 0}
            icon={CheckCircle2}
            delay={0.4}
          />
        </div>

        {/* Data Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <DataTable
            title="Reported Issues"
            columns={COLUMNS}
            data={issues}
            onView={handleViewIssue}
            onEdit={handleEditIssue}
            onDelete={handleDeleteIssue}
            toolbarActions={
              <button
                onClick={() => setDownloadModalOpen(true)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-colors text-sm font-medium"
                title="Download report"
                aria-label="Download PDF"
              >
                <Download size={14} />
                Download
              </button>
            }
          />
        </motion.div>

        {/* Issue Statistics Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="bg-white dark:bg-gray-900 rounded-[2rem] p-8 shadow-sm border border-gray-100 dark:border-gray-800 transition-colors duration-300"
        >
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6 transition-colors duration-300">
            Issue Distribution
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Severity Distribution */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                By Severity
              </h3>
              <div className="space-y-3">
                {[
                  {
                    label: 'Critical',
                    count: stats?.bySeverity?.Critical || 0,
                    color: 'bg-red-500',
                  },
                  {
                    label: 'High',
                    count: stats?.bySeverity?.High || 0,
                    color: 'bg-orange-500',
                  },
                  {
                    label: 'Medium',
                    count: stats?.bySeverity?.Medium || 0,
                    color: 'bg-yellow-500',
                  },
                  {
                    label: 'Low',
                    count: stats?.bySeverity?.Low || 0,
                    color: 'bg-green-500',
                  },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${item.color}`} />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{item.label}</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {item.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Status Distribution */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                By Status
              </h3>
              <div className="space-y-3">
                {[
                  {
                    label: 'Open',
                    count: stats?.summary?.open || 0,
                    color: 'bg-blue-500',
                  },
                  {
                    label: 'In Progress',
                    count: stats?.summary?.inProgress || 0,
                    color: 'bg-purple-500',
                  },
                  {
                    label: 'Resolved',
                    count: stats?.summary?.resolved || 0,
                    color: 'bg-green-500',
                  },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${item.color}`} />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{item.label}</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {item.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Response Time */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                Response Time (ms)
              </h3>
              <div className="space-y-3">
                {[
                  {
                    label: 'Average',
                    time: stats?.responseMetrics?.avgResponseTime?.toLocaleString() || 'N/A',
                  },
                  {
                    label: 'Min',
                    time: stats?.responseMetrics?.minResponseTime?.toLocaleString() || 'N/A',
                  },
                  {
                    label: 'Max',
                    time: stats?.responseMetrics?.maxResponseTime?.toLocaleString() || 'N/A',
                  },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300">{item.label}</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {item.time}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* View Issue Modal */}
      <Modal
        isOpen={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        title={selectedIssue?.title || 'View Issue'}
        size="lg"
      >
        {selectedIssue && (
          <div className="space-y-6">
            {/* Header with Status */}
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {selectedIssue.title}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">{selectedIssue.location}</p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <Badge
                  variant={
                    selectedIssue.severity === 'Critical'
                      ? 'danger'
                      : selectedIssue.severity === 'High'
                        ? 'warning'
                        : 'info'
                  }
                >
                  {selectedIssue.severity}
                </Badge>
                <Badge
                  variant={
                    selectedIssue.status === 'Resolved'
                      ? 'success'
                      : selectedIssue.status === 'In Progress'
                        ? 'info'
                        : 'warning'
                  }
                >
                  {selectedIssue.status}
                </Badge>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Reported By
                </p>
                <p className="text-gray-900 dark:text-white font-semibold">
                  {selectedIssue.reporter}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Reported Date
                </p>
                <p className="text-gray-900 dark:text-white font-semibold">
                  {selectedIssue.createdAt
                    ? new Date(selectedIssue.createdAt).toLocaleDateString()
                    : 'N/A'}
                </p>
              </div>
              {selectedIssue.reporterEmail && (
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Email</p>
                  <p className="text-gray-900 dark:text-white font-semibold">
                    {selectedIssue.reporterEmail}
                  </p>
                </div>
              )}
              {selectedIssue.category && (
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Category
                  </p>
                  <p className="text-gray-900 dark:text-white font-semibold">
                    {selectedIssue.category}
                  </p>
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                Description
              </p>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {selectedIssue.description}
              </p>
            </div>

            {/* Admin Notes */}
            {selectedIssue.adminNotes && (
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800/30">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-2">
                  Admin Notes
                </p>
                <p className="text-blue-800 dark:text-blue-300 text-sm">
                  {selectedIssue.adminNotes}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
              <Button
                onClick={() => {
                  setViewModalOpen(false);
                  handleEditIssue(selectedIssue);
                }}
                className="flex-1 h-10 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-all"
              >
                Edit Issue
              </Button>
              <Button
                onClick={() => setViewModalOpen(false)}
                className="flex-1 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Issue Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit Issue"
        size="md"
      >
        {selectedIssue && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSaveEdit();
            }}
            className="space-y-4"
          >
            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <select
                value={editFormData.status || selectedIssue.status || 'Open'}
                onChange={(e) =>
                  setEditFormData({
                    ...editFormData,
                    status: e.target.value as Issue['status'],
                  })
                }
                className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white dark:focus:bg-gray-700 transition-all text-gray-900 dark:text-white"
              >
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>

            {/* Severity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Severity
              </label>
              <select
                value={editFormData.severity || selectedIssue.severity || 'Medium'}
                onChange={(e) =>
                  setEditFormData({
                    ...editFormData,
                    severity: e.target.value as Issue['severity'],
                  })
                }
                className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white dark:focus:bg-gray-700 transition-all text-gray-900 dark:text-white"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>

            {/* Admin Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Admin Notes
              </label>
              <textarea
                value={editFormData.adminNotes || ''}
                onChange={(e) => setEditFormData({ ...editFormData, adminNotes: e.target.value })}
                placeholder="Add internal notes about this issue..."
                rows={4}
                className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white dark:focus:bg-gray-700 transition-all text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 resize-none"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 h-10 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50 transition-all"
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button
                type="button"
                onClick={() => setEditModalOpen(false)}
                className="flex-1 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
              >
                Cancel
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Issue"
        size="sm"
      >
        {selectedIssue && (
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Delete Issue Report?
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Are you sure you want to delete this issue report? This action cannot be undone.
                </p>
              </div>
            </div>

            {/* Issue Details */}
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                {selectedIssue.title}
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300">{selectedIssue.location}</p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleConfirmDelete}
                disabled={isSubmitting}
                className="flex-1 h-10 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 disabled:opacity-50 transition-all"
              >
                {isSubmitting ? 'Deleting...' : 'Delete'}
              </Button>
              <Button
                onClick={() => setDeleteModalOpen(false)}
                className="flex-1 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Download Report Modal */}
      <Modal
        isOpen={downloadModalOpen}
        onClose={() => setDownloadModalOpen(false)}
        title="Download Issues Report"
        size="sm"
      >
        <div className="space-y-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Choose a format to download the issues report with {issues.length} issue
            {issues.length !== 1 ? 's' : ''}.
          </p>

          <div className="space-y-3">
            <label className="flex items-center p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <input
                type="radio"
                name="format"
                value="pdf"
                checked={reportFormat === 'pdf'}
                onChange={(e) => setReportFormat(e.target.value as IssueReportFormat)}
                className="w-4 h-4 text-blue-600 dark:text-blue-400"
              />
              <div className="ml-3 flex-1">
                <p className="font-medium text-gray-900 dark:text-white text-sm">PDF Document</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Professional formatted report with branding
                </p>
              </div>
            </label>

            <label className="flex items-center p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <input
                type="radio"
                name="format"
                value="csv"
                checked={reportFormat === 'csv'}
                onChange={(e) => setReportFormat(e.target.value as IssueReportFormat)}
                className="w-4 h-4 text-blue-600 dark:text-blue-400"
              />
              <div className="ml-3 flex-1">
                <p className="font-medium text-gray-900 dark:text-white text-sm">CSV Spreadsheet</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Comma-separated values for spreadsheet applications
                </p>
              </div>
            </label>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
            <Button
              onClick={handleDownloadReport}
              className="flex-1 h-10 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
            >
              <Download size={16} />
              Download
            </Button>
            <Button
              onClick={() => setDownloadModalOpen(false)}
              className="flex-1 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
