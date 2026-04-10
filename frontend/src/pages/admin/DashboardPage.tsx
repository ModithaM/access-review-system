import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Accessibility,
  AlertTriangle,
  ArrowUpRight,
  Building2,
  Download,
  MapPinned,
  MoreVertical,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingUp,
  UserRound,
} from 'lucide-react';

import AuthService from '@/services/auth.service';
import accessFeaturesService, {
  type AccessFeature,
} from '@/services/access-features.service';
import issueService, { type Issue } from '@/services/issue.service';
import publicSpaceService from '@/services/public-space.service';
import reviewService from '@/services/review.service';
import usersService, { type User } from '@/services/users.service';
import type { PublicSpace } from '@/types/publicSpace.type';
import type { AccessibilityReview } from '@/types/review.type';
import { cn } from '@/lib/utils';
import { downloadReviewsReport, type ReviewReportFormat } from '@/utils/downloadReviewsReport';

type DashboardData = {
  users: User[];
  publicSpaces: PublicSpace[];
  reviews: AccessibilityReview[];
  issues: Issue[];
  accessFeatures: AccessFeature[];
};

type ChartPoint = {
  label: string;
  value: number;
};

type ActivityItem = {
  id: string;
  title: string;
  subtitle: string;
  meta: string;
  accent: string;
};

const BRAND = ['#FF0080', '#7928CA', '#0070F3', '#38BDF8'] as const;
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function DashboardCard({
  title,
  subtitle,
  children,
  className,
  action,
}: {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={cn(
        'relative overflow-hidden rounded-[1.9rem] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(15,23,42,0.12)] dark:border-slate-800 dark:bg-[linear-gradient(180deg,#111827_0%,#0f172a_100%)] dark:shadow-[0_22px_70px_rgba(2,6,23,0.42)] dark:hover:shadow-[0_28px_85px_rgba(2,6,23,0.5)]',
        className,
      )}
    >
      {(title || subtitle || action) && (
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            {title && <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>}
            {subtitle && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>}
          </div>
          {action ?? (
            <button
              type="button"
              className="rounded-xl border border-slate-200 bg-white/80 p-2 text-slate-500 transition hover:border-slate-300 hover:text-slate-700 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-400 dark:hover:border-slate-700 dark:hover:text-slate-200"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
          )}
        </div>
      )}
      {children}
    </motion.section>
  );
}

function Sparkline({
  values,
  color = '#38BDF8',
  fill = false,
  className,
}: {
  values: number[];
  color?: string;
  fill?: boolean;
  className?: string;
}) {
  const width = 220;
  const height = 88;
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;

  const points = values
    .map((value, index) => {
      const x = (index / Math.max(values.length - 1, 1)) * (width - 8) + 4;
      const y = height - ((value - min) / range) * (height - 16) - 8;
      return `${x},${y}`;
    })
    .join(' ');

  const areaPoints = `${points} ${width - 4},${height - 6} 4,${height - 6}`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className={cn('h-24 w-full', className)}>
      <defs>
        <linearGradient id={`fill-${color.replace('#', '')}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {fill && <polygon points={areaPoints} fill={`url(#fill-${color.replace('#', '')})`} />}
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {values.map((value, index) => {
        const x = (index / Math.max(values.length - 1, 1)) * (width - 8) + 4;
        const y = height - ((value - min) / range) * (height - 16) - 8;
        return <circle key={`${value}-${index}`} cx={x} cy={y} r="3" fill={color} />;
      })}
    </svg>
  );
}

function BarChartCard({
  data,
  footerValue,
  footerLabel,
}: {
  data: ChartPoint[];
  footerValue: string;
  footerLabel: string;
}) {
  const max = Math.max(...data.map((item) => item.value), 1);

  return (
    <div className="space-y-6">
      <div className="grid h-56 grid-cols-9 items-end gap-3 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/55">
        {data.map((item, index) => {
          const height = (item.value / max) * 100;
          return (
            <div key={item.label} className="flex h-full flex-col items-center justify-end gap-3">
              <div className="relative flex h-full w-full items-end justify-center">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.max(height, 10)}%` }}
                  transition={{ duration: 0.5, delay: 0.04 * index }}
                  className="w-full rounded-full bg-[linear-gradient(180deg,#38BDF8_0%,#60A5FA_45%,#34D399_100%)] shadow-[0_0_20px_rgba(56,189,248,0.18)]"
                />
              </div>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{item.label}</span>
            </div>
          );
        })}
      </div>

      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">{footerLabel}</p>
          <div className="mt-2 flex items-end gap-3">
            <span className="text-4xl font-semibold tracking-tight text-[#60A5FA]">{footerValue}</span>
            <span className="mb-1 inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-300">
              34.5%
              <ArrowUpRight className="h-3.5 w-3.5" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function DonutChart({
  items,
  centerValue,
  centerLabel,
}: {
  items: Array<{ label: string; value: number; color: string; percent: number }>;
  centerValue: string;
  centerLabel: string;
}) {
  const radius = 78;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="flex flex-col gap-5 2xl:flex-row 2xl:items-center">
      <div className="relative flex items-center justify-center 2xl:flex-shrink-0">
        <svg width="220" height="220" viewBox="0 0 220 220" className="-rotate-90">
          <circle
            cx="110"
            cy="110"
            r={radius}
            fill="none"
            strokeWidth="20"
            className="stroke-slate-200 dark:stroke-slate-800"
          />
          {items.map((item) => {
            const strokeDasharray = `${(item.percent / 100) * circumference} ${circumference}`;
            const circle = (
              <circle
                key={item.label}
                cx="110"
                cy="110"
                r={radius}
                fill="none"
                stroke={item.color}
                strokeWidth="20"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={-offset}
                strokeLinecap="round"
              />
            );
            offset += (item.percent / 100) * circumference;
            return circle;
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-4xl font-semibold text-slate-900 dark:text-white">{centerValue}</div>
          <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">{centerLabel}</div>
        </div>
      </div>

      <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2 2xl:grid-cols-1">
        {items.map((item) => (
          <div
            key={item.label}
            className="flex min-w-0 items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/55"
          >
            <div className="flex min-w-0 items-center gap-3">
              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="truncate text-sm font-medium text-slate-700 dark:text-slate-200">
                {item.label}
              </span>
            </div>
            <div className="pl-3 text-right">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">{item.percent}%</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{item.value} entries</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function GaugeCard({
  label,
  value,
  subtext,
  className,
}: {
  label: string;
  value: number;
  subtext: string;
  className?: string;
}) {
  const radius = 54;
  const circumference = Math.PI * radius;
  const progress = (value / 100) * circumference;

  return (
    <DashboardCard className={cn('min-h-[230px]', className)}>
      <div className="flex items-start justify-between">
        <div>
          <div className="text-4xl font-semibold text-slate-900 dark:text-white">{value.toFixed(1)}%</div>
          <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">{label}</div>
        </div>
        <button
          type="button"
          className="rounded-xl border border-slate-200 bg-white/80 p-2 text-slate-500 transition hover:border-slate-300 hover:text-slate-700 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-400 dark:hover:border-slate-700 dark:hover:text-slate-200"
        >
          <MoreVertical className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-3 flex items-center justify-center">
        <svg width="160" height="110" viewBox="0 0 160 110">
          <path
            d="M26 84 A54 54 0 0 1 134 84"
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="10"
            strokeLinecap="round"
          />
          <path
            d="M26 84 A54 54 0 0 1 134 84"
            fill="none"
            stroke="url(#gaugeGradient)"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={`${progress} ${circumference}`}
          />
          <defs>
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FACC15" />
              <stop offset="100%" stopColor="#FF0080" />
            </linearGradient>
          </defs>
          <text x="80" y="74" textAnchor="middle" className="fill-slate-900 dark:fill-white text-[26px] font-semibold">
            {Math.round(value)}%
          </text>
        </svg>
      </div>

      <p className="text-center text-sm text-slate-500 dark:text-slate-400">{subtext}</p>
    </DashboardCard>
  );
}

function MiniMetricCard({
  value,
  label,
  change,
  chartValues,
  color,
  className,
}: {
  value: string;
  label: string;
  change: string;
  chartValues: number[];
  color: string;
  className?: string;
}) {
  return (
    <DashboardCard className={cn('h-[160px] p-4', className)}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-3xl font-semibold text-slate-900 dark:text-white">{value}</div>
          <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">{label}</div>
        </div>
        <button
          type="button"
          className="rounded-xl border border-slate-200 bg-white/80 p-2 text-slate-500 transition hover:border-slate-300 hover:text-slate-700 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-400 dark:hover:border-slate-700 dark:hover:text-slate-200"
        >
          <MoreVertical className="h-4 w-4" />
        </button>
      </div>

      <Sparkline values={chartValues} color={color} className="mt-2 h-16" />

      <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
        <span className="font-semibold text-emerald-300">{change}</span> from last month
      </p>
    </DashboardCard>
  );
}

function PublicSpacesOverviewCard({
  totalSpaces,
  verifiedSpaces,
  recentSpaces,
  className,
}: {
  totalSpaces: number;
  verifiedSpaces: number;
  recentSpaces: number;
  className?: string;
}) {
  const pendingSpaces = Math.max(totalSpaces - verifiedSpaces, 0);
  const coverage = totalSpaces ? Math.round((verifiedSpaces / totalSpaces) * 100) : 0;

  return (
    <DashboardCard
      title="Public Spaces Overview"
      subtitle="Coverage and readiness across indexed spaces."
      className={cn('h-full', className)}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Total', value: totalSpaces, color: '#38BDF8' },
            { label: 'Verified', value: verifiedSpaces, color: '#22C55E' },
            { label: 'Recent', value: recentSpaces, color: '#FF0080' },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 dark:border-slate-800 dark:bg-slate-950/55"
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                {item.label}
              </p>
              <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">{item.value}</p>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/55">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Space verification</p>
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              {coverage}%
            </span>
          </div>
          <div className="mt-3 h-2 rounded-full bg-slate-200 dark:bg-slate-800">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-[#38BDF8] via-[#0070F3] to-[#22C55E]"
              style={{ width: `${Math.min(coverage, 100)}%` }}
            />
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>{verifiedSpaces} with mapped access features</span>
            <span>{pendingSpaces} pending enrichment</span>
          </div>
        </div>
      </div>
    </DashboardCard>
  );
}

function AreaTrendCard({
  title,
  total,
  delta,
  values,
  className,
}: {
  title: string;
  total: string;
  delta: string;
  values: number[];
  className?: string;
}) {
  return (
    <DashboardCard className={cn('h-full', className)}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-5xl font-semibold tracking-tight text-slate-900 dark:text-white">{total}</div>
          <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">{title}</div>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-3 py-1 text-sm font-semibold text-emerald-300">
          <TrendingUp className="h-4 w-4" />
          {delta}
        </span>
      </div>
      <div className="mt-6 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/55">
        <Sparkline values={values} color="#FACC15" fill className="h-36" />
      </div>
    </DashboardCard>
  );
}

function WelcomeCard({
  name,
  totalUsers,
  growthRate,
  activeUsers,
  className,
}: {
  name: string;
  totalUsers: number;
  growthRate: number;
  activeUsers: number;
  className?: string;
}) {
  return (
    <DashboardCard className={cn('min-h-[230px]', className)}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(121,40,202,0.10),transparent_30%),radial-gradient(circle_at_80%_10%,rgba(56,189,248,0.10),transparent_28%)] dark:bg-[radial-gradient(circle_at_20%_10%,rgba(121,40,202,0.18),transparent_30%),radial-gradient(circle_at_80%_10%,rgba(56,189,248,0.12),transparent_28%)]" />
      <div className="relative z-10 flex h-full flex-col justify-between gap-8 lg:flex-row lg:items-center">
        <div className="max-w-xl">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-gradient-to-br from-[#FF0080] via-[#7928CA] to-[#0070F3] p-[3px] shadow-[0_18px_40px_rgba(121,40,202,0.28)]">
              <div className="flex h-16 w-16 items-center justify-center rounded-[1rem] bg-white text-lg font-semibold text-slate-900 dark:bg-slate-950 dark:text-white">
                {name
                  .split(/\s+/)
                  .slice(0, 2)
                  .map((part) => part[0])
                  .join('')}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Welcome back</p>
              <h2 className="text-4xl font-semibold tracking-tight text-slate-900 dark:text-white">{name}!</h2>
            </div>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {[
              {
                label: 'Total Users',
                value: formatCompact(totalUsers),
                progress: Math.min(100, (activeUsers / Math.max(totalUsers, 1)) * 100),
                color: 'from-emerald-400 to-lime-300',
              },
              {
                label: 'Growth Rate',
                value: `${growthRate.toFixed(1)}%`,
                progress: Math.max(12, Math.min(100, growthRate * 3.1)),
                color: 'from-[#FF0080] to-[#F59E0B]',
              },
            ].map((metric) => (
              <div key={metric.label}>
                <div className="text-[2rem] font-semibold text-slate-900 dark:text-white">{metric.value}</div>
                <div className="mt-1 text-base text-slate-500 dark:text-slate-400">{metric.label}</div>
                <div className="mt-4 h-2 rounded-full bg-slate-200 dark:bg-slate-800">
                  <div
                    className={`h-2 rounded-full bg-gradient-to-r ${metric.color}`}
                    style={{ width: `${metric.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative hidden min-h-[170px] flex-1 items-end justify-end lg:flex">
          <div className="absolute bottom-0 right-6 h-36 w-56 rounded-[2rem] border border-slate-200 bg-white/80 shadow-[0_20px_50px_rgba(15,23,42,0.10)] dark:border-slate-700/60 dark:bg-slate-900/70 dark:shadow-[0_20px_50px_rgba(2,6,23,0.45)]" />
          <div className="absolute bottom-12 right-32 h-10 w-10 rounded-2xl bg-[#38BDF8]/15 dark:bg-[#38BDF8]/20" />
          <div className="absolute right-0 top-5 rounded-2xl bg-white p-4 shadow-[0_20px_50px_rgba(15,23,42,0.10)] dark:bg-[#111827] dark:shadow-[0_20px_50px_rgba(2,6,23,0.45)]">
            <Sparkles className="h-8 w-8 text-[#38BDF8]" />
          </div>
          <div className="absolute bottom-14 right-20 rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 dark:border-slate-700 dark:bg-slate-900/90">
            <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Pulse</p>
            <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">AccessAble analytics</p>
          </div>
          <div className="absolute right-20 top-10 h-36 w-24 rounded-t-[3rem] rounded-b-2xl bg-gradient-to-b from-[#38BDF8] via-[#22C55E] to-[#FBBF24] opacity-20 blur-2xl" />
        </div>
      </div>
    </DashboardCard>
  );
}

function ActivityList({
  title,
  items,
  className,
  action,
}: {
  title: string;
  items: ActivityItem[];
  className?: string;
  action?: React.ReactNode;
}) {
  return (
    <DashboardCard title={title} className={cn('h-full', className)} action={action}>
      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/55"
          >
            <div
              className="mt-0.5 h-10 w-10 shrink-0 rounded-2xl"
              style={{ background: `linear-gradient(135deg, ${item.accent}33, ${item.accent}11)` }}
            />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">{item.title}</p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{item.subtitle}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-500">{item.meta}</p>
            </div>
          </div>
        ))}
      </div>
    </DashboardCard>
  );
}

function formatCompact(value: number) {
  return new Intl.NumberFormat('en', {
    notation: 'compact',
    maximumFractionDigits: value >= 1000 ? 1 : 0,
  }).format(value);
}

function monthKey(date?: string) {
  if (!date) return null;
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return null;
  return `${parsed.getFullYear()}-${parsed.getMonth()}`;
}

function getRecentMonthBuckets(length = 9) {
  const now = new Date();
  return Array.from({ length }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (length - 1 - index), 1);
    return {
      key: `${date.getFullYear()}-${date.getMonth()}`,
      label: MONTHS[date.getMonth()],
      date,
    };
  });
}

function countByRecentMonths(items: Array<{ createdAt?: string }>, length = 9) {
  const buckets = getRecentMonthBuckets(length);
  const counts = new Map(buckets.map((bucket) => [bucket.key, 0]));

  items.forEach((item) => {
    const key = monthKey(item.createdAt);
    if (key && counts.has(key)) {
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  });

  return buckets.map((bucket) => ({
    label: bucket.label,
    value: counts.get(bucket.key) ?? 0,
  }));
}

function getCurrentVsPrevious(items: Array<{ createdAt?: string }>, days = 30) {
  const now = Date.now();
  const currentStart = now - days * 24 * 60 * 60 * 1000;
  const previousStart = now - days * 2 * 24 * 60 * 60 * 1000;

  let current = 0;
  let previous = 0;

  items.forEach((item) => {
    if (!item.createdAt) return;
    const time = new Date(item.createdAt).getTime();
    if (Number.isNaN(time)) return;
    if (time >= currentStart) current += 1;
    else if (time >= previousStart) previous += 1;
  });

  const change = previous === 0 ? current * 100 : ((current - previous) / previous) * 100;
  return { current, previous, change };
}

export default function DashboardPage() {
  const currentUser = AuthService.getCurrentUser()?.user;
  const [data, setData] = useState<DashboardData>({
    users: [],
    publicSpaces: [],
    reviews: [],
    issues: [],
    accessFeatures: [],
  });
  const [loading, setLoading] = useState(true);
  const [reportFormat, setReportFormat] = useState<ReviewReportFormat>('pdf');

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      try {
        const [usersRes, spacesRes, reviewsRes, issuesRes, featuresRes] = await Promise.all([
          usersService.listUsers({ page: 1, items: 200 }),
          publicSpaceService.getAllPublicSpaces(),
          reviewService.getAllReviews(1, 200),
          issueService.getAllIssues(1, 200),
          accessFeaturesService.getAllAccessFeatures(),
        ]);

        if (!active) return;

        setData({
          users: usersRes.data.result ?? [],
          publicSpaces: spacesRes ?? [],
          reviews: reviewsRes.data.result ?? [],
          issues: issuesRes.data.result.data ?? [],
          accessFeatures: featuresRes.data.data ?? [],
        });
      } catch (loadError) {
        console.error(loadError);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadDashboard();

    return () => {
      active = false;
    };
  }, []);

  const analytics = useMemo(() => {
    const totalUsers = data.users.length;
    const totalSpaces = data.publicSpaces.length;
    const totalReviews = data.reviews.length;
    const totalIssues = data.issues.length;
    const totalFeatures = data.accessFeatures.length;
    const activeUsers = data.users.filter((user) => user.enabled !== false).length || Math.round(totalUsers * 0.78);

    const userGrowth = getCurrentVsPrevious(data.users);
    const reviewGrowth = getCurrentVsPrevious(data.reviews);
    const issueGrowth = getCurrentVsPrevious(data.issues);
    const spaceGrowth = getCurrentVsPrevious(data.publicSpaces);
    const verifiedSpaces = data.publicSpaces.filter((space) => (space.accessFeatures?.length ?? 0) > 0).length;

    const monthlyActivity = countByRecentMonths(
      [
        ...data.users.map((item) => ({ createdAt: item.createdAt })),
        ...data.reviews.map((item) => ({ createdAt: item.createdAt })),
        ...data.publicSpaces.map((item) => ({ createdAt: item.createdAt })),
      ],
      9,
    );

    const reviewSeries = countByRecentMonths(data.reviews, 7).map((item) => item.value);
    const issueSeries = countByRecentMonths(data.issues, 7).map((item) => item.value);
    const userSeries = countByRecentMonths(data.users, 7).map((item) => item.value);
    const combinedSeries = countByRecentMonths(
      [
        ...data.users.map((item) => ({ createdAt: item.createdAt })),
        ...data.reviews.map((item) => ({ createdAt: item.createdAt })),
        ...data.issues.map((item) => ({ createdAt: item.createdAt })),
      ],
      9,
    ).map((item) => item.value);

    const categoryMap = new Map<string, number>();
    data.accessFeatures.forEach((feature) => {
      categoryMap.set(feature.category, (categoryMap.get(feature.category) ?? 0) + 1);
    });

    const donutItems = Array.from(categoryMap.entries())
      .map(([label, value], index) => ({
        label,
        value,
        color: BRAND[index % BRAND.length],
        percent: totalFeatures ? Math.round((value / totalFeatures) * 100) : 0,
      }))
      .sort((a, b) => b.value - a.value);

    const resolvedIssues = data.issues.filter((issue) => issue.status === 'Resolved').length;
    const openIssues = data.issues.filter((issue) => issue.status !== 'Resolved').length;

    const recentReviews: ActivityItem[] = data.reviews
      .slice(0, 4)
      .map((review, index) => ({
        id: review._id ?? `review-${index}`,
        title: review.title || 'Accessibility review submitted',
        subtitle: typeof review.spaceId === 'object' ? review.spaceId.name || 'Unnamed space' : 'Public space review',
        meta: new Date(review.createdAt || Date.now()).toLocaleDateString(),
        accent: BRAND[index % BRAND.length],
      }));

    const recentIssues: ActivityItem[] = data.issues
      .slice(0, 4)
      .map((issue, index) => ({
        id: issue._id ?? `issue-${index}`,
        title: issue.title,
        subtitle: `${issue.severity} severity • ${issue.status ?? 'Open'}`,
        meta: issue.location,
        accent: issue.severity === 'Critical' ? '#FF0080' : issue.severity === 'High' ? '#F97316' : '#38BDF8',
      }));

    const recentSpaces: ActivityItem[] = data.publicSpaces
      .slice(0, 4)
      .map((space, index) => ({
        id: space._id,
        title: space.name,
        subtitle: `${space.category} • ${space.locationDetails?.address ?? 'No address'}`,
        meta: space.createdAt ? new Date(space.createdAt).toLocaleDateString() : 'Recently added',
        accent: BRAND[index % BRAND.length],
      }));

    return {
      totalUsers,
      totalSpaces,
      verifiedSpaces,
      totalReviews,
      totalIssues,
      totalFeatures,
      activeUsers,
      resolvedIssues,
      openIssues,
      monthlyActivity,
      donutItems,
      reviewSeries,
      issueSeries,
      userSeries,
      combinedSeries,
      recentReviews,
      recentIssues,
      recentSpaces,
      growthRate: userGrowth.change,
      reviewChange: reviewGrowth.change,
      issueChange: issueGrowth.change,
      spaceChange: spaceGrowth.change,
      recentSpacesAdded: spaceGrowth.current,
      utilizationRate: totalUsers ? (activeUsers / totalUsers) * 100 : 0,
      engagementRate: totalUsers ? (totalReviews / totalUsers) * 100 : 0,
    };
  }, [data]);

  const handleDownloadReviewReport = () => {
    downloadReviewsReport(data.reviews, reportFormat);
  };

  if (loading) {
    return (
      <div className="grid gap-5 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className={cn(
              'animate-pulse rounded-[1.9rem] border border-slate-200 bg-white/90 shadow-[0_20px_45px_rgba(15,23,42,0.08)] dark:border-slate-800 dark:bg-slate-900/80 dark:shadow-none',
              index === 0 ? 'h-[230px] lg:col-span-2' : 'h-[230px]',
            )}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-5 text-slate-900 dark:text-white">
      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-12 xl:col-span-8">
          <WelcomeCard
            name={currentUser?.name ? `${currentUser.name} ${currentUser.surname ?? ''}`.trim() : 'Admin'}
            totalUsers={analytics.totalUsers}
            growthRate={analytics.growthRate}
            activeUsers={analytics.activeUsers}
            className="h-full"
          />
        </div>

        <div className="col-span-12 grid gap-5 sm:grid-cols-2 xl:col-span-4 xl:grid-cols-2">
          <MiniMetricCard
            value={formatCompact(analytics.totalUsers)}
            label="Total Users"
            change={`${analytics.growthRate.toFixed(1)}%`}
            chartValues={analytics.userSeries}
            color="#4ADE80"
            className="h-full min-h-[230px] sm:min-h-[180px] xl:min-h-[230px]"
          />
          <MiniMetricCard
            value={formatCompact(analytics.totalReviews)}
            label="Total Reviews"
            change={`${analytics.reviewChange.toFixed(1)}%`}
            chartValues={analytics.reviewSeries}
            color="#F472B6"
            className="h-full min-h-[230px] sm:min-h-[180px] xl:min-h-[230px]"
          />
        </div>
      </div>

      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-12 md:col-span-6 xl:col-span-4">
          <GaugeCard
            label="Active Users"
            value={analytics.utilizationRate}
            subtext={`${formatCompact(analytics.activeUsers)} users active this month`}
            className="h-full min-h-[230px]"
          />
        </div>

        <div className="col-span-12 md:col-span-6 xl:col-span-4">
          <PublicSpacesOverviewCard
            totalSpaces={analytics.totalSpaces}
            verifiedSpaces={analytics.verifiedSpaces}
            recentSpaces={analytics.recentSpacesAdded}
            className="min-h-[230px]"
          />
        </div>

        <div className="col-span-12 md:col-span-6 xl:col-span-4">
          <MiniMetricCard
            value={formatCompact(analytics.totalIssues)}
            label="Reported Issues"
            change={`${analytics.issueChange.toFixed(1)}%`}
            chartValues={analytics.issueSeries}
            color="#A855F7"
            className="h-full min-h-[230px]"
          />
        </div>
      </div>

      <div className="grid grid-cols-12 gap-5">
        <DashboardCard
          title="Monthly Activity"
          subtitle="Users, reviews, and spaces created across recent months."
          className="col-span-12 lg:col-span-6 xl:col-span-5"
        >
          <BarChartCard
            data={analytics.monthlyActivity}
            footerValue={`${analytics.engagementRate.toFixed(1)}%`}
            footerLabel="Average contribution rate per user"
          />
        </DashboardCard>

        <DashboardCard
          title="Access Feature Distribution"
          subtitle="Category mix from your live accessibility feature catalog."
          className="col-span-12 lg:col-span-6 xl:col-span-4"
        >
          <DonutChart
            items={analytics.donutItems}
            centerValue={`${analytics.totalFeatures}`}
            centerLabel="Feature signals"
          />
        </DashboardCard>

        <div className="col-span-12 xl:col-span-3">
          <AreaTrendCard
            title="Platform Activity"
            total={formatCompact(analytics.totalUsers + analytics.totalReviews + analytics.totalSpaces)}
            delta={`${analytics.spaceChange.toFixed(1)}%`}
            values={analytics.combinedSeries}
            className="min-h-[230px]"
          />
        </div>
      </div>

      <div className="grid grid-cols-12 gap-5">
        <ActivityList
          title="Recent Reviews"
          items={analytics.recentReviews}
          className="col-span-12 lg:col-span-6 xl:col-span-4"
          action={
            <div className="flex items-center gap-2">
              <select
                value={reportFormat}
                onChange={(event) => setReportFormat(event.target.value as ReviewReportFormat)}
                className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 transition hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#7928CA]/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                aria-label="Report format"
              >
                <option value="pdf">PDF</option>
                <option value="csv">CSV</option>
              </select>
              <button
                type="button"
                onClick={handleDownloadReviewReport}
                disabled={data.reviews.length === 0}
                className="inline-flex h-9 items-center rounded-xl bg-linear-to-r from-[#FF0080] via-[#7928CA] to-[#0070F3] px-3 text-xs font-semibold text-white shadow-[0_12px_28px_rgba(121,40,202,0.18)] transition hover:shadow-[0_16px_34px_rgba(121,40,202,0.24)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Download className="mr-1.5 h-3.5 w-3.5" />
                Export
              </button>
            </div>
          }
        />
        <ActivityList
          title="Reported Issues"
          items={analytics.recentIssues}
          className="col-span-12 lg:col-span-6 xl:col-span-4"
        />

        <DashboardCard
          title="Contribution Pulse"
          subtitle="Key platform health metrics and density."
          className="col-span-12 xl:col-span-4"
        >
          <div className="space-y-4">
            {[
              {
                label: 'Spaces indexed',
                value: analytics.totalSpaces,
                total: Math.max(analytics.totalSpaces + 20, 50),
                color: 'from-[#38BDF8] to-[#0070F3]',
              },
              {
                label: 'Resolved issues',
                value: analytics.resolvedIssues,
                total: Math.max(analytics.totalIssues || 1, analytics.resolvedIssues || 1),
                color: 'from-emerald-400 to-lime-300',
              },
              {
                label: 'Review coverage',
                value: analytics.totalReviews,
                total: Math.max(analytics.totalUsers || 1, analytics.totalReviews || 1),
                color: 'from-[#FF0080] to-[#7928CA]',
              },
            ].map((metric) => {
              const percent = Math.round((metric.value / Math.max(metric.total, 1)) * 100);
              return (
                <div
                  key={metric.label}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/55"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{metric.label}</p>
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
                      {percent}%
                    </span>
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-slate-200 dark:bg-slate-800">
                    <div
                      className={`h-2 rounded-full bg-gradient-to-r ${metric.color}`}
                      style={{ width: `${Math.min(percent, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}

            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Open Issues', value: analytics.openIssues, icon: AlertTriangle, color: '#FF0080' },
                { label: 'Feature Library', value: analytics.totalFeatures, icon: Accessibility, color: '#38BDF8' },
                { label: 'Public Spaces', value: analytics.totalSpaces, icon: MapPinned, color: '#22C55E' },
                { label: 'Users', value: analytics.totalUsers, icon: UserRound, color: '#F59E0B' },
              ].map((metric) => (
                <div
                  key={metric.label}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/55"
                >
                  <metric.icon className="h-5 w-5" style={{ color: metric.color }} />
                  <div className="mt-3 text-2xl font-semibold text-slate-900 dark:text-white">
                    {formatCompact(metric.value)}
                  </div>
                  <div className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">
                    {metric.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DashboardCard>
      </div>

      <div className="grid grid-cols-12 gap-5">
        <ActivityList
          title="Newly Added Public Spaces"
          items={analytics.recentSpaces}
          className="col-span-12 xl:col-span-8"
        />

        <DashboardCard
          title="Admin Snapshot"
          subtitle="Live operating signal for the AccessAble platform."
          className="col-span-12 xl:col-span-4"
        >
          <div className="space-y-4">
            {[
              { label: 'Verified roles', value: `${analytics.totalUsers} accounts`, icon: ShieldCheck, color: '#38BDF8' },
              { label: 'Community reviews', value: `${analytics.totalReviews} submissions`, icon: Star, color: '#F472B6' },
              { label: 'Accessible locations', value: `${analytics.totalSpaces} indexed`, icon: Building2, color: '#22C55E' },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 dark:border-slate-800 dark:bg-slate-950/55"
              >
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-2xl"
                  style={{ backgroundColor: `${item.color}22`, color: item.color }}
                >
                  <item.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{item.label}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </DashboardCard>
      </div>
    </div>
  );
}
