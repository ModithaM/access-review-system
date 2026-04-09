import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Accessibility,
  AlertCircle,
  Building2,
  MapPinned,
  MessageSquareText,
  RefreshCcw,
  UserRound,
} from 'lucide-react';
import DashboardHeader from '../../components/admin/analytics/DashboardHeader';
import AnalyticsCard from '../../components/admin/analytics/AnalyticsCard';
import ChartContainer from '../../components/admin/analytics/ChartContainer';
import LineChartComponent from '../../components/admin/analytics/LineChartComponent';
import BarChartComponent from '../../components/admin/analytics/BarChartComponent';
import PieChartComponent from '../../components/admin/analytics/PieChartComponent';
import adminUserService, { type AdminUser } from '../../services/admin-user.service';
import accessFeaturesService, { type AccessFeature } from '../../services/access-features.service';
import issueService, { type Issue } from '../../services/issue.service';
import publicSpaceService from '../../services/public-space.service';
import reviewService from '../../services/review.service';
import type { PublicSpace, SpaceCategory } from '../../types/publicSpace.type';
import type { AccessibilityReview } from '../../types/review.type';

type DateRangeKey = '7d' | '30d' | '6m';
type TrendChartType = 'line' | 'area';
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
const CATEGORY_OPTIONS: Array<'All' | SpaceCategory> = [
  'All',
  'Mall',
  'Park',
  'Hospital',
  'Station',
  'Other',
];

const fallbackDate = (daysAgo: number) => new Date(Date.now() - daysAgo * 86400000).toISOString();

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

const getSafeDate = (value?: string) => {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const isInWindow = (value: string | undefined, start: Date, end: Date) => {
  const date = getSafeDate(value);
  return !!date && date >= start && date <= end;
};

const percentChange = (current: number, previous: number) => {
  if (previous === 0) return current === 0 ? 0 : 100;
  return ((current - previous) / previous) * 100;
};

const getSpaceCategory = (review: AccessibilityReview, lookup: Map<string, PublicSpace>) => {
  if (typeof review.spaceId === 'object') return (review.spaceId.category as SpaceCategory) ?? null;
  return lookup.get(review.spaceId)?.category ?? null;
};

const getSpaceName = (review: AccessibilityReview, lookup: Map<string, PublicSpace>) => {
  if (typeof review.spaceId === 'object') return review.spaceId.name ?? 'Unknown space';
  return lookup.get(review.spaceId)?.name ?? 'Unknown space';
};

const formatBucket = (date: Date, monthly: boolean) =>
  new Intl.DateTimeFormat('en-US', { month: 'short', day: monthly ? undefined : 'numeric' }).format(date);

export default function AnalyticsDashboardPage() {
  const [dateRange, setDateRange] = useState<DateRangeKey>('30d');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [trendChartType, setTrendChartType] = useState<TrendChartType>('line');
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

      const nextData: DashboardState = {
        users: users.status === 'fulfilled' ? (users.value.data.result ?? []) : FALLBACK_DATA.users,
        publicSpaces: spaces.status === 'fulfilled' ? spaces.value : FALLBACK_DATA.publicSpaces,
        reviews: reviews.status === 'fulfilled' ? (reviews.value.data.result ?? []) : FALLBACK_DATA.reviews,
        accessFeatures:
          features.status === 'fulfilled' ? (features.value.data.data ?? []) : FALLBACK_DATA.accessFeatures,
        issues: issues.status === 'fulfilled' ? (issues.value.data.result.data ?? []) : FALLBACK_DATA.issues,
        partialFailure: [users, spaces, reviews, features, issues].some((result) => result.status === 'rejected'),
      };

      setData(nextData);
      setError(
        nextData.partialFailure
          ? 'Some widgets are using fallback analytics because one or more module APIs were unavailable.'
          : null,
      );
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
    const updateTheme = () => {
      setIsDarkMode(root.classList.contains('dark'));
    };

    updateTheme();

    const observer = new MutationObserver(updateTheme);
    observer.observe(root, { attributes: true, attributeFilter: ['class'] });

    return () => observer.disconnect();
  }, []);

  const analytics = useMemo(() => {
    const rangeConfig = RANGE_OPTIONS.find((option) => option.value === dateRange) ?? RANGE_OPTIONS[1];
    const monthly = dateRange === '6m';
    const end = new Date();
    const start = new Date(end.getTime() - rangeConfig.days * 86400000);
    const previousStart = new Date(start.getTime() - rangeConfig.days * 86400000);
    const lookup = new Map(data.publicSpaces.map((space) => [space._id, space]));

    const spaces =
      categoryFilter === 'All'
        ? data.publicSpaces
        : data.publicSpaces.filter((space) => space.category === categoryFilter);
    const reviews = data.reviews.filter(
      (review) => categoryFilter === 'All' || getSpaceCategory(review, lookup) === categoryFilter,
    );
    const issues =
      categoryFilter === 'All'
        ? data.issues
        : data.issues.filter((issue) =>
            spaces.some((space) => issue.location?.toLowerCase().includes(space.name.toLowerCase())),
          );

    const bucketCount = monthly ? 6 : Math.min(10, rangeConfig.days);
    const bucketSize = Math.max(1, Math.ceil(rangeConfig.days / bucketCount));
    const buckets = Array.from({ length: bucketCount }, (_, index) => {
      const bucketStart = new Date(start.getTime() + index * bucketSize * 86400000);
      const bucketEnd = new Date(
        Math.min(end.getTime(), bucketStart.getTime() + bucketSize * 86400000),
      );
      return { label: formatBucket(bucketStart, monthly), start: bucketStart, end: bucketEnd };
    });

    const beforeStartUsers = data.users.filter((user) => {
      const date = getSafeDate(user.createdAt);
      return !!date && date < start;
    }).length;
    let runningUsers = beforeStartUsers;

    const userGrowthData = buckets.map((bucket) => {
      runningUsers += data.users.filter((user) => isInWindow(user.createdAt, bucket.start, bucket.end)).length;
      return { label: bucket.label, users: runningUsers };
    });

    const reviewActivityData = buckets.map((bucket) => ({
      label: bucket.label,
      reviews: reviews.filter((review) => isInWindow(review.createdAt, bucket.start, bucket.end)).length,
    }));

    const issueTrendData = buckets.map((bucket) => ({
      label: bucket.label,
      issues: issues.filter((issue) => isInWindow(issue.createdAt, bucket.start, bucket.end)).length,
    }));

    const countWindow = (items: Array<{ createdAt?: string }>) => ({
      current: items.filter((item) => isInWindow(item.createdAt, start, end)).length,
      previous: items.filter((item) => isInWindow(item.createdAt, previousStart, start)).length,
    });

    const kpis = [
      {
        title: 'Total Users',
        value: data.users.length.toLocaleString(),
        trend: percentChange(countWindow(data.users).current, countWindow(data.users).previous),
        icon: UserRound,
        accent: 'from-[#FF0080] via-[#7928CA] to-[#0070F3]',
      },
      {
        title: 'Total Public Spaces',
        value: spaces.length.toLocaleString(),
        trend: percentChange(countWindow(spaces).current, countWindow(spaces).previous),
        icon: MapPinned,
        accent: 'from-[#7928CA] via-[#0070F3] to-[#38BDF8]',
      },
      {
        title: 'Total Reviews',
        value: reviews.length.toLocaleString(),
        trend: percentChange(countWindow(reviews).current, countWindow(reviews).previous),
        icon: MessageSquareText,
        accent: 'from-[#0070F3] via-[#38BDF8] to-[#0EA5E9]',
      },
      {
        title: 'Total Access Features',
        value: data.accessFeatures.length.toLocaleString(),
        trend: percentChange(
          countWindow(data.accessFeatures as Array<{ createdAt?: string }>).current,
          countWindow(data.accessFeatures as Array<{ createdAt?: string }>).previous,
        ),
        icon: Accessibility,
        accent: 'from-[#FF0080] via-[#7928CA] to-[#38BDF8]',
      },
      {
        title: 'Reported Issues',
        value: issues.length.toLocaleString(),
        trend: percentChange(countWindow(issues).current, countWindow(issues).previous),
        icon: AlertCircle,
        accent: 'from-[#FF0080] via-[#0070F3] to-[#38BDF8]',
      },
    ];

    const publicSpaceDistribution = CATEGORY_OPTIONS.filter((category) => category !== 'All')
      .map((category) => ({
        name: category,
        count: spaces.filter((space) => space.category === category).length,
      }))
      .filter((item) => item.count > 0);

    const accessFeatureDistribution = ['Mobility', 'Visual', 'Auditory', 'Cognitive']
      .map((category) => ({
        name: category,
        value: data.accessFeatures.filter((feature) => feature.category === category).length,
      }))
      .filter((item) => item.value > 0);

    const issueSeverityData = ['Low', 'Medium', 'High', 'Critical']
      .map((severity) => ({
        name: severity,
        value: issues.filter((issue) => issue.severity === severity).length,
      }))
      .filter((item) => item.value > 0);

    const featureUsage = new Map<string, number>();
    reviews.forEach((review) => {
      review.features?.forEach((feature) => {
        if (feature.available) {
          featureUsage.set(feature.featureName, (featureUsage.get(feature.featureName) ?? 0) + 1);
        }
      });
    });

    const mostUsedAccessFeatures =
      Array.from(featureUsage.entries())
        .map(([name, usage]) => ({ name, usage }))
        .sort((left, right) => right.usage - left.usage)
        .slice(0, 6) ||
      [];

    const reviewGroups = new Map<string, { name: string; ratingTotal: number; reviewCount: number }>();
    reviews.forEach((review) => {
      const name = getSpaceName(review, lookup);
      const current = reviewGroups.get(name) ?? { name, ratingTotal: 0, reviewCount: 0 };
      current.ratingTotal += review.rating;
      current.reviewCount += 1;
      reviewGroups.set(name, current);
    });

    const topRatedPublicSpaces = Array.from(reviewGroups.values())
      .map((space) => ({
        ...space,
        averageRating: space.ratingTotal / space.reviewCount,
      }))
      .sort((left, right) => right.averageRating - left.averageRating || right.reviewCount - left.reviewCount)
      .slice(0, 4);

    return {
      kpis,
      userGrowthData,
      reviewActivityData,
      issueTrendData,
      publicSpaceDistribution,
      accessFeatureDistribution,
      issueSeverityData,
      mostUsedAccessFeatures:
        mostUsedAccessFeatures.length > 0
          ? mostUsedAccessFeatures
          : data.accessFeatures.slice(0, 4).map((feature, index) => ({ name: feature.name, usage: 4 - index })),
      topRatedPublicSpaces,
      rangeLabel: rangeConfig.label,
      spaceCount: spaces.length,
      reviewCount: reviews.length,
      featureCount: data.accessFeatures.length,
    };
  }, [categoryFilter, data, dateRange]);

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
          className="rounded-full border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 dark:shadow-none"
        >
          <RefreshCcw className="h-6 w-6 text-[#0070F3]" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <DashboardHeader
        dateRange={dateRange}
        onDateRangeChange={(value) => setDateRange(value as DateRangeKey)}
        rangeOptions={RANGE_OPTIONS}
        categoryFilter={categoryFilter}
        onCategoryFilterChange={setCategoryFilter}
        categoryOptions={CATEGORY_OPTIONS}
        isRefreshing={isRefreshing}
        onRefresh={() => loadDashboard(true)}
        trendChartType={trendChartType}
        onTrendChartTypeChange={setTrendChartType}
      />

      {error ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
          {error}
        </div>
      ) : null}

      <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-5">
        {analytics.kpis.map((kpi, index) => (
          <AnalyticsCard key={kpi.title} {...kpi} delay={index * 0.06} />
        ))}
      </section>

      <section className="grid grid-cols-1 gap-6 2xl:grid-cols-2">
        <ChartContainer title="User Growth" description={`${analytics.rangeLabel} cumulative member growth`}>
          <LineChartComponent data={analytics.userGrowthData} dataKey="users" xKey="label" label="Users" color="#0070F3" variant={trendChartType} darkMode={isDarkMode} />
        </ChartContainer>
        <ChartContainer title="Public Space Distribution" description="Count by mapped space category">
          <BarChartComponent data={analytics.publicSpaceDistribution} dataKey="count" xKey="name" label="Spaces" colors={BRAND_COLORS} darkMode={isDarkMode} />
        </ChartContainer>
        <ChartContainer title="Review Activity" description="Review submissions across the selected window">
          <LineChartComponent data={analytics.reviewActivityData} dataKey="reviews" xKey="label" label="Reviews" color="#38BDF8" variant="area" darkMode={isDarkMode} />
        </ChartContainer>
        <ChartContainer title="Access Feature Distribution" description="Configured accessibility categories">
          <PieChartComponent data={analytics.accessFeatureDistribution} dataKey="value" nameKey="name" colors={BRAND_COLORS} label="Access feature distribution" darkMode={isDarkMode} />
        </ChartContainer>
        <ChartContainer title="Reported Issues Trend" description="Issue reports entering the admin queue" className="2xl:col-span-2">
          <LineChartComponent data={analytics.issueTrendData} dataKey="issues" xKey="label" label="Issues" color="#FF0080" darkMode={isDarkMode} />
        </ChartContainer>
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <ChartContainer title="Top Rated Public Spaces" description="Highest rated spaces by review score">
          <div className="space-y-3">
            {analytics.topRatedPublicSpaces.length > 0 ? (
              analytics.topRatedPublicSpaces.map((space, index) => (
                <div key={space.name} className="rounded-2xl border border-gray-200 bg-gradient-to-r from-white via-white to-sky-50 p-4 dark:border-gray-700 dark:from-gray-900 dark:via-gray-900 dark:to-slate-800">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{space.name}</p>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{space.reviewCount} reviews</p>
                    </div>
                    <span className="rounded-full bg-gray-900 px-2.5 py-1 text-xs font-semibold text-white dark:bg-white dark:text-gray-900">#{index + 1}</span>
                  </div>
                  <p className="mt-4 text-2xl font-semibold text-gray-900 dark:text-white">{space.averageRating.toFixed(1)}</p>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-gray-200 p-8 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
                No review insights are available for this filter yet.
              </div>
            )}
          </div>
        </ChartContainer>
        <ChartContainer title="Most Used Access Features" description="Feature mentions marked available in reviews">
          <BarChartComponent data={analytics.mostUsedAccessFeatures} dataKey="usage" xKey="name" yKey="name" label="Usage" colors={BRAND_COLORS} horizontal darkMode={isDarkMode} />
        </ChartContainer>
        <ChartContainer title="Issue Severity Breakdown" description="Open, resolved, and critical issue mix">
          <PieChartComponent data={analytics.issueSeverityData} dataKey="value" nameKey="name" colors={['#38BDF8', '#0070F3', '#7928CA', '#FF0080']} label="Issue severity breakdown" darkMode={isDarkMode} />
        </ChartContainer>
      </section>

      <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {[
          {
            title: 'Accessibility coverage',
            value: `${Math.round((analytics.featureCount / Math.max(analytics.spaceCount, 1)) * 100)}%`,
            description: 'Configured access features relative to mapped spaces',
            icon: Accessibility,
          },
          {
            title: 'Review density',
            value: (analytics.reviewCount / Math.max(analytics.spaceCount, 1)).toFixed(1),
            description: 'Average reviews per public space',
            icon: MessageSquareText,
          },
          {
            title: 'Spaces monitored',
            value: analytics.spaceCount.toLocaleString(),
            description: 'Locations included in the current dashboard scope',
            icon: Building2,
          },
        ].map((item) => (
          <div key={item.title} className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md dark:border-gray-800 dark:bg-gray-900 dark:shadow-none">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FF0080] via-[#7928CA] to-[#38BDF8]">
              <item.icon className="h-5 w-5 text-white" />
            </div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{item.title}</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-gray-900 dark:text-white">{item.value}</p>
            <p className="mt-2 text-sm text-gray-400 dark:text-gray-500">{item.description}</p>
          </div>
        ))}
      </motion.section>
    </div>
  );
}
