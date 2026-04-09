import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import type { AccessFeature } from '@/services/access-features.service';
import {
  formatFeatureValue,
  getReportSummary,
  REPORT_FIELD_LABELS,
  type AccessFeatureReportOptions,
} from './reportUtils';

function getFileStamp() {
  return new Date().toISOString().slice(0, 10);
}

function escapeCsvValue(value: string) {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }

  return value;
}

export function downloadAccessFeaturesPdf(
  features: AccessFeature[],
  options: AccessFeatureReportOptions,
) {
  const doc = new jsPDF({ orientation: 'landscape' });
  const generatedAt = new Date();
  const summary = getReportSummary(options);
  const selectedFields = options.selectedFields;

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
  doc.text('AccessAble', 14, 34);

  doc.setTextColor(121, 40, 202);
  doc.setFontSize(12);
  doc.text('Access Features Report', 14, 42);

  doc.setTextColor(75, 85, 99);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Generated: ${generatedAt.toLocaleString()}`, 14, 50);
  doc.text(summary, 14, 57);
  doc.text(`Total records: ${features.length}`, 14, 64);

  autoTable(doc, {
    startY: 74,
    head: [selectedFields.map((field) => REPORT_FIELD_LABELS[field])],
    body: features.map((feature) =>
      selectedFields.map((field) => formatFeatureValue(feature, field)),
    ),
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

  doc.save(`access-features-report-${getFileStamp()}.pdf`);
}

export function downloadAccessFeaturesCsv(
  features: AccessFeature[],
  options: AccessFeatureReportOptions,
) {
  const header = options.selectedFields.map((field) => REPORT_FIELD_LABELS[field]).join(',');
  const rows = features.map((feature) =>
    options.selectedFields
      .map((field) => escapeCsvValue(formatFeatureValue(feature, field)))
      .join(','),
  );

  const csvContent = [header, ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `access-features-report-${getFileStamp()}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export function downloadAccessFeaturesReport(
  features: AccessFeature[],
  options: AccessFeatureReportOptions,
) {
  if (options.format === 'csv') {
    downloadAccessFeaturesCsv(features, options);
    return;
  }

  downloadAccessFeaturesPdf(features, options);
}
