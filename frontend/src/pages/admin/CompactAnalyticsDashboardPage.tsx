import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Accessibility,
  AlertCircle,
  CalendarRange,
  ChartColumn,
  MapPinned,
  MessageSquareText,
  RefreshCcw,
  UserRound,
} from 'lucide-react';
import KpiCard from '../../components/admin/analytics/KpiCard';
import AnalyticsSelectorCard from '../../components/admin/analytics/AnalyticsSelectorCard';
import AnalyticsChartPanel from '../../components/admin/analytics/AnalyticsChartPanel';
import ChartRenderer from '../../components/admin/analytics/ChartRenderer';
import ProgressStat from '../../components/admin/analytics/ProgressStat';
import adminUserService, { type AdminUser } from '../../services/admin-user.service';
import accessFeaturesService, { type AccessFeature } from '../../services/access-features.service';
import issueService, { type Issue } from '../../services/issue.service';
import publicSpaceService from '../../services/public-space.service';
import reviewService from '../../services/review.service';
import type { PublicSpace, SpaceCategory } from '../../types/publicSpace.type';
import type { AccessibilityReview } from '../../types/review.type';

type DateRangeKey = '7d' | '30d' | '6m';
type SelectorKey = 'users' | 'spaces' | 'reviews' | 'features' | 'issues';
type SideStat = {
  label: string;
  value: string;
  progress: number;
};
type SelectorConfig = {
  title: string;
  description: string;
  progressLabel: string;
  progressValue: number;
  accent: string;
  icon: typeof UserRound;
  chartType: 'line' | 'area' | 'bar' | 'donut';
  chartData: Array<Record<string, string | number>>;
  xKey: string;
  dataKey: string;
  label: string;
  insight: string;
  sideStats: SideStat[];
  color?: string;
  colors?: string[];
};
type DashboardState = {
  users: AdminUser[];
  publicSpaces: PublicSpace[];
  reviews: AccessibilityReview[];
  accessFeatures: AccessFeature[];
  issues: Issue[];
  partialFailure: boolean;
};

const BRAND_COLORS = ['#FF0080', '#7928CA', '#0070F3', '#38BDF8', '#0EA5E9'];
const RANGE_OPTIONS: { label: string; value: DateRangeKey; days: number }[] = [
  { label: 'Last 7 days', value: '7d', days: 7 },
  { label: 'Last 30 days', value: '30d', days: 30 },
  { label: 'Last 6 months', value: '6m', days: 180 },
];
const CATEGORY_OPTIONS: Array<'All' | SpaceCategory> = ['All', 'Mall', 'Park', 'Hospital', 'Station', 'Other'];
const fallbackDate = (daysAgo: number) => new Date(Date.now() - daysAgo * 86400000).toISOString();
const clamp = (value: number) => Math.max(0, Math.min(100, Math.round(value)));
const percentChange = (current: number, previous: number) =>
  previous === 0 ? (current === 0 ? 0 : 100) : ((current - previous) / previous) * 100;
const safeDate = (value?: string) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};
const inWindow = (value: string | undefined, start: Date, end: Date) => {
  const date = safeDate(value);
  return !!date && date >= start && date <= end;
};
const formatBucket = (date: Date, monthly: boolean) =>
  new Intl.DateTimeFormat('en-US', { month: 'short', day: monthly ? undefined : 'numeric' }).format(date);

const FALLBACK_DATA: DashboardState = {
  users: [
    { _id: 'u1', name: 'Maya', surname: 'Fernando', email: 'maya@accessable.app', userType: 'admin', createdAt: fallbackDate(160) },
    { _id: 'u2', name: 'Kamal', surname: 'Perera', email: 'kamal@accessable.app', userType: 'user', createdAt: fallbackDate(120) },
    { _id: 'u3', name: 'Nethmi', surname: 'Silva', email: 'nethmi@accessable.app', userType: 'user', createdAt: fallbackDate(65) },
    { _id: 'u4', name: 'Sahan', surname: 'Jayasuriya', email: 'sahan@accessable.app', userType: 'user', createdAt: fallbackDate(20) },
  ],
  publicSpaces: [
    { _id: 'ps1', name: 'City Mall', category: 'Mall', locationDetails: { address: 'Colombo 03', coordinates: { lat: 6.9, lng: 79.8 } }, createdAt: fallbackDate(150) },
    { _id: 'ps2', name: 'Central Park', category: 'Park', locationDetails: { address: 'Kandy', coordinates: { lat: 7.2, lng: 80.6 } }, createdAt: fallbackDate(90) },
    { _id: 'ps3', name: 'Metro Station', category: 'Station', locationDetails: { address: 'Galle', coordinates: { lat: 6, lng: 80.2 } }, createdAt: fallbackDate(45) },
    { _id: 'ps4', name: 'General Hospital', category: 'Hospital', locationDetails: { address: 'Jaffna', coordinates: { lat: 9.6, lng: 80 } }, createdAt: fallbackDate(15) },
  ],
  reviews: [
    { _id: 'r1', spaceId: { _id: 'ps1', name: 'City Mall', category: 'Mall' }, userId: 'u1', rating: 5, comment: 'Excellent access', createdAt: fallbackDate(28), features: [{ featureName: 'Wheelchair Ramp', available: true, condition: 'excellent' }] },
    { _id: 'r2', spaceId: { _id: 'ps1', name: 'City Mall', category: 'Mall' }, userId: 'u2', rating: 4, comment: 'Good elevators', createdAt: fallbackDate(18), features: [{ featureName: 'Elevator Access', available: true, condition: 'good' }] },
    { _id: 'r3', spaceId: { _id: 'ps2', name: 'Central Park', category: 'Park' }, userId: 'u3', rating: 4, comment: 'Helpful signage', createdAt: fallbackDate(8), features: [{ featureName: 'Braille Signage', available: true, condition: 'good' }] },
    { _id: 'r4', spaceId: { _id: 'ps4', name: 'General Hospital', category: 'Hospital' }, userId: 'u4', rating: 5, comment: 'Very accessible', createdAt: fallbackDate(3), features: [{ featureName: 'Audio Guidance', available: true, condition: 'excellent' }] },
  ],
  accessFeatures: [
    { _id: 'f1', name: 'Wheelchair Ramp', description: 'Ramp access', category: 'Mobility', isActive: true },
    { _id: 'f2', name: 'Braille Signage', description: 'Braille signs', category: 'Visual', isActive: true },
    { _id: 'f3', name: 'Audio Guidance', description: 'Audio guidance', category: 'Auditory', isActive: true },
    { _id: 'f4', name: 'Quiet Room', description: 'Quiet room', category: 'Cognitive', isActive: true },
  ],
  issues: [
    { _id: 'i1', title: 'Ramp blocked', location: 'City Mall', description: 'Ramp blocked by stock', reporter: 'Ravi', severity: 'High', status: 'Open', category: 'Mobility Access', createdAt: fallbackDate(17) },
    { _id: 'i2', title: 'Lift outage', location: 'Metro Station', description: 'Lift unavailable', reporter: 'Anu', severity: 'Critical', status: 'In Progress', category: 'Elevators', createdAt: fallbackDate(9) },
    { _id: 'i3', title: 'Sign missing', location: 'Central Park', description: 'Braille sign missing', reporter: 'Devi', severity: 'Medium', status: 'Resolved', category: 'Signage', createdAt: fallbackDate(2) },
  ],
  partialFailure: false,
};

export default function CompactAnalyticsDashboardPage() {
  const [dateRange, setDateRange] = useState<DateRangeKey>('30d');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [activeSelector, setActiveSelector] = useState<SelectorKey>('users');
  const [data, setData] = useState<DashboardState>(FALLBACK_DATA);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const loadDashboard = useCallback(async (manual = false) => {
    manual ? setIsRefreshing(true) : setIsLoading(true);
    try {
      const [users, spaces, reviews, features, issues] = await Promise.allSettled([
        adminUserService.getUsers(1, 500),
        publicSpaceService.getAllPublicSpaces(),
        reviewService.getAllReviews(1, 500),
        accessFeaturesService.getAllAccessFeatures(),
        issueService.getAllIssues(1, 500),
      ]);

      setData({
        users: users.status === 'fulfilled' ? (users.value.data.result ?? []) : FALLBACK_DATA.users,
        publicSpaces: spaces.status === 'fulfilled' ? spaces.value : FALLBACK_DATA.publicSpaces,
        reviews: reviews.status === 'fulfilled' ? (reviews.value.data.result ?? []) : FALLBACK_DATA.reviews,
        accessFeatures: features.status === 'fulfilled' ? (features.value.data.data ?? []) : FALLBACK_DATA.accessFeatures,
        issues: issues.status === 'fulfilled' ? (issues.value.data.result.data ?? []) : FALLBACK_DATA.issues,
        partialFailure: [users, spaces, reviews, features, issues].some((result) => result.status === 'rejected'),
      });
      setError([users, spaces, reviews, features, issues].some((result) => result.status === 'rejected') ? 'Some analytics are using fallback values because one or more APIs were unavailable.' : null);
    } catch {
      setData(FALLBACK_DATA);
      setError('Analytics data could not be loaded. Showing fallback insights.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  useEffect(() => {
    const root = document.documentElement;
    const updateTheme = () => setIsDarkMode(root.classList.contains('dark'));
    updateTheme();
    const observer = new MutationObserver(updateTheme);
    observer.observe(root, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const analytics = useMemo(() => {
    const range = RANGE_OPTIONS.find((option) => option.value === dateRange) ?? RANGE_OPTIONS[1];
    const monthly = dateRange === '6m';
    const end = new Date();
    const start = new Date(end.getTime() - range.days * 86400000);
    const prevStart = new Date(start.getTime() - range.days * 86400000);
    const spaceLookup = new Map(data.publicSpaces.map((space) => [space._id, space]));
    const getCategory = (review: AccessibilityReview) =>
      typeof review.spaceId === 'object'
        ? ((review.spaceId.category as SpaceCategory) ?? null)
        : (spaceLookup.get(review.spaceId)?.category ?? null);
    const getName = (review: AccessibilityReview) =>
      typeof review.spaceId === 'object' ? (review.spaceId.name ?? 'Unknown space') : (spaceLookup.get(review.spaceId)?.name ?? 'Unknown space');
    const spaces = categoryFilter === 'All' ? data.publicSpaces : data.publicSpaces.filter((space) => space.category === categoryFilter);
    const reviews = data.reviews.filter((review) => categoryFilter === 'All' || getCategory(review) === categoryFilter);
    const issues = categoryFilter === 'All' ? data.issues : data.issues.filter((issue) => spaces.some((space) => issue.location?.toLowerCase().includes(space.name.toLowerCase())));
    const countWindow = (items: Array<{ createdAt?: string }>) => ({
      current: items.filter((item) => inWindow(item.createdAt, start, end)).length,
      previous: items.filter((item) => inWindow(item.createdAt, prevStart, start)).length,
    });
    const bucketCount = monthly ? 6 : Math.min(10, range.days);
    const bucketSize = Math.max(1, Math.ceil(range.days / bucketCount));
    const buckets = Array.from({ length: bucketCount }, (_, index) => {
      const bucketStart = new Date(start.getTime() + index * bucketSize * 86400000);
      const bucketEnd = new Date(Math.min(end.getTime(), bucketStart.getTime() + bucketSize * 86400000));
      return { label: formatBucket(bucketStart, monthly), start: bucketStart, end: bucketEnd };
    });

    let runningUsers = data.users.filter((user) => {
      const created = safeDate(user.createdAt);
      return !!created && created < start;
    }).length;
    const userGrowthData = buckets.map((bucket) => {
      runningUsers += data.users.filter((user) => inWindow(user.createdAt, bucket.start, bucket.end)).length;
      return { label: bucket.label, users: runningUsers };
    });
    const reviewTrendData = buckets.map((bucket) => ({ label: bucket.label, reviews: reviews.filter((review) => inWindow(review.createdAt, bucket.start, bucket.end)).length }));
    const issueTrendData = buckets.map((bucket) => ({ label: bucket.label, issues: issues.filter((issue) => inWindow(issue.createdAt, bucket.start, bucket.end)).length }));
    const publicSpaceDistribution = CATEGORY_OPTIONS.filter((category) => category !== 'All').map((category) => ({ name: category, count: spaces.filter((space) => space.category === category).length })).filter((item) => item.count > 0);
    const accessFeatureDistribution = ['Mobility', 'Visual', 'Auditory', 'Cognitive'].map((category) => ({ name: category, value: data.accessFeatures.filter((feature) => feature.category === category).length })).filter((item) => item.value > 0);
    const featureUsage = new Map<string, number>();
    reviews.forEach((review) => review.features?.forEach((feature) => feature.available && featureUsage.set(feature.featureName, (featureUsage.get(feature.featureName) ?? 0) + 1)));
    const topFeatures = Array.from(featureUsage.entries()).map(([name, usage]) => ({ name, usage })).sort((a, b) => b.usage - a.usage).slice(0, 5);
    const ratings = new Map<string, { name: string; ratingTotal: number; reviewCount: number }>();
    reviews.forEach((review) => {
      const name = getName(review);
      const current = ratings.get(name) ?? { name, ratingTotal: 0, reviewCount: 0 };
      current.ratingTotal += review.rating;
      current.reviewCount += 1;
      ratings.set(name, current);
    });
    const topRated = Array.from(ratings.values()).map((item) => ({ ...item, averageRating: item.ratingTotal / item.reviewCount })).sort((a, b) => b.averageRating - a.averageRating || b.reviewCount - a.reviewCount).slice(0, 3);
    const resolvedIssues = issues.filter((issue) => issue.status === 'Resolved').length;
    const activeFeatures = data.accessFeatures.filter((feature) => feature.isActive).length;
    const occupiedCategories = publicSpaceDistribution.length;
    const kpis = [
      { title: 'Total Users', value: data.users.length.toLocaleString(), trend: percentChange(countWindow(data.users).current, countWindow(data.users).previous), progress: clamp((countWindow(data.users).current / Math.max(data.users.length, 1)) * 100), icon: UserRound, accent: 'from-[#FF0080] via-[#7928CA] to-[#0070F3]' },
      { title: 'Total Public Spaces', value: spaces.length.toLocaleString(), trend: percentChange(countWindow(spaces).current, countWindow(spaces).previous), progress: clamp((occupiedCategories / 5) * 100), icon: MapPinned, accent: 'from-[#7928CA] via-[#0070F3] to-[#38BDF8]' },
      { title: 'Total Reviews', value: reviews.length.toLocaleString(), trend: percentChange(countWindow(reviews).current, countWindow(reviews).previous), progress: clamp((countWindow(reviews).current / Math.max(reviews.length, 1)) * 100), icon: MessageSquareText, accent: 'from-[#0070F3] via-[#38BDF8] to-[#0EA5E9]' },
      { title: 'Total Access Features', value: data.accessFeatures.length.toLocaleString(), trend: percentChange(countWindow(data.accessFeatures as Array<{ createdAt?: string }>).current, countWindow(data.accessFeatures as Array<{ createdAt?: string }>).previous), progress: clamp((activeFeatures / Math.max(data.accessFeatures.length, 1)) * 100), icon: Accessibility, accent: 'from-[#FF0080] via-[#7928CA] to-[#38BDF8]' },
      { title: 'Reported Issues', value: issues.length.toLocaleString(), trend: percentChange(countWindow(issues).current, countWindow(issues).previous), progress: clamp((resolvedIssues / Math.max(issues.length, 1)) * 100), icon: AlertCircle, accent: 'from-[#FF0080] via-[#0070F3] to-[#38BDF8]' },
    ];

    return {
      kpis,
      topRated,
      topFeatures,
      selectors: {
        users: { title: 'User Growth', description: 'Track member growth and adoption velocity', progressLabel: 'Growth', progressValue: clamp(Math.abs(percentChange(countWindow(data.users).current, countWindow(data.users).previous))), accent: 'from-[#FF0080] via-[#7928CA] to-[#0070F3]', icon: UserRound, chartType: 'line' as const, chartData: userGrowthData, xKey: 'label', dataKey: 'users', label: 'Users', color: '#0070F3', insight: `${countWindow(data.users).current} new users in ${range.label.toLowerCase()}`, sideStats: [{ label: 'New users', value: countWindow(data.users).current.toLocaleString(), progress: clamp((countWindow(data.users).current / Math.max(data.users.length, 1)) * 100) }, { label: 'Admin share', value: `${clamp((data.users.filter((user) => user.userType === 'admin').length / Math.max(data.users.length, 1)) * 100)}%`, progress: clamp((data.users.filter((user) => user.userType === 'admin').length / Math.max(data.users.length, 1)) * 100) }, { label: 'Guest share', value: `${clamp((data.users.filter((user) => user.userType === 'guest').length / Math.max(data.users.length, 1)) * 100)}%`, progress: clamp((data.users.filter((user) => user.userType === 'guest').length / Math.max(data.users.length, 1)) * 100) }] },
        spaces: { title: 'Public Space Distribution', description: 'See how mapped spaces are distributed across categories', progressLabel: 'Coverage', progressValue: clamp((occupiedCategories / 5) * 100), accent: 'from-[#7928CA] via-[#0070F3] to-[#38BDF8]', icon: MapPinned, chartType: 'bar' as const, chartData: publicSpaceDistribution, xKey: 'name', dataKey: 'count', label: 'Spaces', colors: BRAND_COLORS, insight: `${occupiedCategories} of 5 core categories represented`, sideStats: [{ label: 'Mapped spaces', value: spaces.length.toLocaleString(), progress: clamp((spaces.length / Math.max(data.publicSpaces.length, 1)) * 100) }, { label: 'Category coverage', value: `${clamp((occupiedCategories / 5) * 100)}%`, progress: clamp((occupiedCategories / 5) * 100) }, { label: 'Top category', value: publicSpaceDistribution[0]?.name ?? 'N/A', progress: publicSpaceDistribution[0] ? clamp((publicSpaceDistribution[0].count / Math.max(spaces.length, 1)) * 100) : 0 }] },
        reviews: { title: 'Review Trends', description: 'Monitor review activity and feedback momentum', progressLabel: 'Activity', progressValue: clamp((countWindow(reviews).current / Math.max(reviews.length, 1)) * 100), accent: 'from-[#0070F3] via-[#38BDF8] to-[#0EA5E9]', icon: MessageSquareText, chartType: 'area' as const, chartData: reviewTrendData, xKey: 'label', dataKey: 'reviews', label: 'Reviews', color: '#38BDF8', insight: `${reviews.length} reviews in the current filtered scope`, sideStats: [{ label: 'Review density', value: (reviews.length / Math.max(spaces.length, 1)).toFixed(1), progress: clamp((reviews.length / Math.max(spaces.length * 3, 1)) * 100) }, { label: 'Top rating', value: topRated[0] ? topRated[0].averageRating.toFixed(1) : 'N/A', progress: topRated[0] ? clamp((topRated[0].averageRating / 5) * 100) : 0 }, { label: 'Recent activity', value: `${countWindow(reviews).current}`, progress: clamp((countWindow(reviews).current / Math.max(reviews.length, 1)) * 100) }] },
        features: { title: 'Access Feature Breakdown', description: 'Understand accessibility support across feature types', progressLabel: 'Completion', progressValue: clamp((activeFeatures / Math.max(data.accessFeatures.length, 1)) * 100), accent: 'from-[#FF0080] via-[#7928CA] to-[#38BDF8]', icon: Accessibility, chartType: 'donut' as const, chartData: accessFeatureDistribution, xKey: 'name', dataKey: 'value', label: 'Access features', colors: BRAND_COLORS, insight: `${activeFeatures} active features shaping the review experience`, sideStats: [{ label: 'Active features', value: activeFeatures.toLocaleString(), progress: clamp((activeFeatures / Math.max(data.accessFeatures.length, 1)) * 100) }, { label: 'Top feature', value: topFeatures[0]?.name ?? 'N/A', progress: topFeatures[0] ? clamp((topFeatures[0].usage / Math.max(reviews.length, 1)) * 100) : 0 }, { label: 'Category balance', value: `${accessFeatureDistribution.length} groups`, progress: clamp((accessFeatureDistribution.length / 4) * 100) }] },
        issues: { title: 'Reported Issues Trend', description: 'Track issue intake and operational resolution progress', progressLabel: 'Resolved', progressValue: clamp((resolvedIssues / Math.max(issues.length, 1)) * 100), accent: 'from-[#FF0080] via-[#0070F3] to-[#38BDF8]', icon: AlertCircle, chartType: 'line' as const, chartData: issueTrendData, xKey: 'label', dataKey: 'issues', label: 'Issues', color: '#FF0080', insight: `${resolvedIssues} of ${issues.length} issues resolved`, sideStats: [{ label: 'Resolved issues', value: resolvedIssues.toLocaleString(), progress: clamp((resolvedIssues / Math.max(issues.length, 1)) * 100) }, { label: 'Critical share', value: `${issues.filter((issue) => issue.severity === 'Critical').length}`, progress: clamp((issues.filter((issue) => issue.severity === 'Critical').length / Math.max(issues.length, 1)) * 100) }, { label: 'Open issues', value: `${issues.filter((issue) => issue.status === 'Open').length}`, progress: clamp((issues.filter((issue) => issue.status === 'Open').length / Math.max(issues.length, 1)) * 100) }] },
      } as Record<SelectorKey, SelectorConfig>,
    };
  }, [categoryFilter, data, dateRange]);

  const active = analytics.selectors[activeSelector];

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }} className="rounded-full border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 dark:shadow-none">
          <RefreshCcw className="h-6 w-6 text-[#0070F3]" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error ? <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">{error}</div> : null}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_310px] xl:items-start">
        <div className="space-y-6">
          <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 dark:shadow-none">
            <div className="mb-4 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex items-center gap-2">
                <ChartColumn className="h-4.5 w-4.5 text-[#0070F3]" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Analytics Views</h2>
              </div>
              <div className="flex flex-col gap-3 rounded-3xl border border-gray-200 bg-white p-3 shadow-sm dark:border-gray-800 dark:bg-gray-950 dark:shadow-none md:flex-row md:flex-wrap md:items-center">
                <label className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600 shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:shadow-none">
                  <CalendarRange className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                  <span className="font-medium text-gray-900 dark:text-white">Range</span>
                  <select
                    value={dateRange}
                    onChange={(event) => setDateRange(event.target.value as DateRangeKey)}
                    className="bg-transparent text-sm text-gray-600 outline-none dark:text-gray-300"
                    aria-label="Filter analytics by date range"
                  >
                    {RANGE_OPTIONS.map((option) => (
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
                    onChange={(event) => setCategoryFilter(event.target.value)}
                    className="bg-transparent text-sm text-gray-600 outline-none dark:text-gray-300"
                    aria-label="Filter analytics by space category"
                  >
                    {CATEGORY_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>

                <button
                  type="button"
                  onClick={() => loadDashboard(true)}
                  disabled={isRefreshing}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition-all duration-300 hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
                >
                  <RefreshCcw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {(Object.entries(analytics.selectors) as Array<[SelectorKey, (typeof analytics.selectors)[SelectorKey]]>).map(([key, item]) => (
                <AnalyticsSelectorCard key={key} title={item.title} description={item.description} progressLabel={item.progressLabel} progressValue={item.progressValue} accent={item.accent} icon={item.icon} isActive={activeSelector === key} onClick={() => setActiveSelector(key)} />
              ))}
            </div>
          </section>

          <AnalyticsChartPanel
            chartKey={activeSelector}
            title={active.title}
            description={active.description}
            insight={active.insight}
            chart={<ChartRenderer chartType={active.chartType} data={active.chartData} xKey={active.xKey} dataKey={active.dataKey} label={active.label} color={active.color} colors={active.colors} darkMode={isDarkMode} />}
            sideContent={
              <>
                {active.sideStats.map((stat) => <ProgressStat key={stat.label} label={stat.label} value={stat.value} progress={stat.progress} accent={active.accent} />)}
                <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 dark:shadow-none">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Quick context</h3>
                  <div className="mt-3 space-y-3">
                    {activeSelector === 'reviews' && analytics.topRated.map((space) => (
                      <div key={space.name} className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{space.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{space.reviewCount} reviews</p>
                        </div>
                        <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700 dark:bg-gray-800 dark:text-gray-200">{space.averageRating.toFixed(1)}</span>
                      </div>
                    ))}
                    {activeSelector === 'features' && analytics.topFeatures.map((feature) => (
                      <div key={feature.name} className="flex items-center justify-between gap-3">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{feature.name}</p>
                        <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700 dark:bg-gray-800 dark:text-gray-200">{feature.usage}</span>
                      </div>
                    ))}
                    {activeSelector !== 'reviews' && activeSelector !== 'features' ? <p className="text-sm leading-6 text-gray-600 dark:text-gray-400">This focused panel keeps analytics compact by showing one chart at a time while the supporting metrics stay visible beside it.</p> : null}
                  </div>
                </div>
              </>
            }
          />
        </div>

        <aside className="xl:sticky xl:top-24">
          <section className="rounded-3xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 dark:shadow-none">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">Key Metrics</h2>
              <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">Live</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {analytics.kpis.map((kpi, index) => <KpiCard key={kpi.title} {...kpi} delay={index * 0.05} />)}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
