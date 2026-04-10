import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import type { Issue } from '@/services/issue.service';

export type IssueReportFormat = 'pdf' | 'csv';

const ISSUE_REPORT_HEADERS = [
  'Title',
  'Location',
  'Category',
  'Severity',
  'Status',
  'Reporter',
  'Date',
];

function getFileStamp() {
  return new Date().toISOString().slice(0, 10);
}

function normalizeIssueRow(issue: Issue) {
  return [
    issue.title?.trim() || 'Untitled issue',
    issue.location?.trim() || '-',
    issue.category?.trim() || '-',
    issue.severity || '-',
    issue.status || '-',
    issue.reporter?.trim() || 'Unknown',
    issue.createdAt ? new Date(issue.createdAt).toLocaleDateString() : '-',
  ];
}

function escapeCsvValue(value: string) {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }

  return value;
}

export function downloadIssuesPdf(issues: Issue[]) {
  const doc = new jsPDF({ orientation: 'landscape' });
  const generatedAt = new Date();

  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, 297, 210, 'F');

  doc.setFillColor(255, 0, 128);
  doc.rect(14, 14, 68, 8, 'F');
  doc.setFillColor(121, 40, 202);
  doc.rect(82, 14, 58, 8, 'F');
  doc.setFillColor(0, 112, 243);
  doc.rect(140, 14, 58, 8, 'F');
  doc.setFillColor(56, 189, 248);
  doc.rect(198, 14, 58, 8, 'F');

  doc.setTextColor(17, 24, 39);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('Accessify', 14, 34);

  doc.setTextColor(121, 40, 202);
  doc.setFontSize(12);
  doc.text('Reported Issues Report', 14, 42);

  doc.setTextColor(75, 85, 99);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Generated: ${generatedAt.toLocaleString()}`, 14, 50);
  doc.text(`Total issues: ${issues.length}`, 14, 57);

  autoTable(doc, {
    startY: 66,
    head: [ISSUE_REPORT_HEADERS],
    body: issues.map(normalizeIssueRow),
    styles: {
      fontSize: 9,
      textColor: [31, 41, 55],
      cellPadding: 4,
      lineColor: [229, 231, 235],
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: [245, 247, 255],
      textColor: [17, 24, 39],
      fontStyle: 'bold',
      lineColor: [220, 225, 235],
    },
    bodyStyles: {
      fillColor: [255, 255, 255],
    },
    alternateRowStyles: {
      fillColor: [250, 251, 255],
    },
    margin: { left: 14, right: 14, bottom: 16 },
  });

  doc.save(`issues-report-${getFileStamp()}.pdf`);
}

export function downloadIssuesCsv(issues: Issue[]) {
  const csvContent = [
    ISSUE_REPORT_HEADERS.join(','),
    ...issues.map((issue) =>
      normalizeIssueRow(issue)
        .map((value) => escapeCsvValue(value))
        .join(','),
    ),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `issues-report-${getFileStamp()}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export function downloadIssuesReport(issues: Issue[], format: IssueReportFormat) {
  if (format === 'csv') {
    downloadIssuesCsv(issues);
    return;
  }

  downloadIssuesPdf(issues);
}
