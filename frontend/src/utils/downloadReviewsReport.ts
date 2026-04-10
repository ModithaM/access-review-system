import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import type { AccessibilityReview } from '@/types/review.type';

export type ReviewReportFormat = 'pdf' | 'csv';

const REVIEW_REPORT_HEADERS = [
  'Title',
  'Public Space',
  'Reviewer',
  'Rating',
  'Comment',
  'Submitted At',
];

function getFileStamp() {
  return new Date().toISOString().slice(0, 10);
}

function getUserLabel(reviewer: AccessibilityReview['userId']) {
  if (typeof reviewer === 'string') {
    return reviewer;
  }

  const fullName = [reviewer?.name, reviewer?.surname].filter(Boolean).join(' ').trim();
  return fullName || reviewer?.email || 'Unknown user';
}

function getSpaceLabel(space: AccessibilityReview['spaceId']) {
  if (typeof space === 'string') {
    return space;
  }

  return space?.name || space?.location || space?.category || 'Unknown space';
}

function normalizeReviewRow(review: AccessibilityReview) {
  return [
    review.title?.trim() || 'Untitled review',
    getSpaceLabel(review.spaceId),
    getUserLabel(review.userId),
    String(review.rating),
    review.comment?.trim() || '-',
    review.createdAt ? new Date(review.createdAt).toLocaleString() : '-',
  ];
}

function escapeCsvValue(value: string) {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }

  return value;
}

export function downloadReviewsPdf(reviews: AccessibilityReview[]) {
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
  doc.text('AccessAble', 14, 34);

  doc.setTextColor(121, 40, 202);
  doc.setFontSize(12);
  doc.text('Accessibility Reviews Report', 14, 42);

  doc.setTextColor(75, 85, 99);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Generated: ${generatedAt.toLocaleString()}`, 14, 50);
  doc.text(`Total reviews: ${reviews.length}`, 14, 57);

  autoTable(doc, {
    startY: 66,
    head: [REVIEW_REPORT_HEADERS],
    body: reviews.map(normalizeReviewRow),
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

  doc.save(`reviews-report-${getFileStamp()}.pdf`);
}

export function downloadReviewsCsv(reviews: AccessibilityReview[]) {
  const csvContent = [
    REVIEW_REPORT_HEADERS.join(','),
    ...reviews.map((review) =>
      normalizeReviewRow(review)
        .map((value) => escapeCsvValue(value))
        .join(','),
    ),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `reviews-report-${getFileStamp()}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export function downloadReviewsReport(reviews: AccessibilityReview[], format: ReviewReportFormat) {
  if (format === 'csv') {
    downloadReviewsCsv(reviews);
    return;
  }

  downloadReviewsPdf(reviews);
}
