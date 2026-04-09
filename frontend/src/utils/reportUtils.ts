import type { AccessFeature } from '@/services/access-features.service';

export type ReportFormat = 'pdf' | 'csv';
export type ReportSortOption = 'name-asc' | 'name-desc' | 'recently-added' | 'category';
export type ReportField = 'name' | 'category' | 'description' | 'createdAt' | 'status';

export interface AccessFeatureReportOptions {
  includeAll: boolean;
  category: 'All' | AccessFeature['category'];
  searchTerm: string;
  sortBy: ReportSortOption;
  selectedFields: ReportField[];
  format: ReportFormat;
}

export const DEFAULT_REPORT_FIELDS: ReportField[] = [
  'name',
  'category',
  'description',
  'createdAt',
  'status',
];

export const DEFAULT_REPORT_OPTIONS: AccessFeatureReportOptions = {
  includeAll: true,
  category: 'All',
  searchTerm: '',
  sortBy: 'name-asc',
  selectedFields: DEFAULT_REPORT_FIELDS,
  format: 'pdf',
};

export const REPORT_FIELD_LABELS: Record<ReportField, string> = {
  name: 'Feature Name',
  category: 'Category',
  description: 'Description',
  createdAt: 'Created Date',
  status: 'Status',
};

export function filterAndSortAccessFeatures(
  features: AccessFeature[],
  options: AccessFeatureReportOptions,
) {
  const search = options.searchTerm.trim().toLowerCase();

  const filtered = features.filter((feature) => {
    if (options.includeAll) {
      return true;
    }

    const matchesCategory =
      options.category === 'All' || feature.category === options.category;
    const matchesSearch =
      !search || feature.name.toLowerCase().includes(search);

    return matchesCategory && matchesSearch;
  });

  return [...filtered].sort((a, b) => {
    switch (options.sortBy) {
      case 'name-desc':
        return b.name.localeCompare(a.name);
      case 'recently-added':
        return (
          new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        );
      case 'category':
        return a.category.localeCompare(b.category) || a.name.localeCompare(b.name);
      case 'name-asc':
      default:
        return a.name.localeCompare(b.name);
    }
  });
}

export function getReportSummary(options: AccessFeatureReportOptions) {
  if (options.includeAll) {
    return 'All access features included';
  }

  const summary: string[] = [];

  if (options.category !== 'All') {
    summary.push(`Category: ${options.category}`);
  }

  if (options.searchTerm.trim()) {
    summary.push(`Search: "${options.searchTerm.trim()}"`);
  }

  const sortLabel =
    {
      'name-asc': 'Name A-Z',
      'name-desc': 'Name Z-A',
      'recently-added': 'Recently added',
      category: 'Category',
    }[options.sortBy] || 'Name A-Z';

  summary.push(`Sort: ${sortLabel}`);

  return summary.join(' | ');
}

export function formatFeatureValue(feature: AccessFeature, field: ReportField) {
  switch (field) {
    case 'name':
      return feature.name;
    case 'category':
      return feature.category;
    case 'description':
      return feature.description;
    case 'createdAt':
      return feature.createdAt
        ? new Date(feature.createdAt).toLocaleDateString()
        : '-';
    case 'status':
      return feature.isActive ? 'Active' : 'Inactive';
    default:
      return '';
  }
}
