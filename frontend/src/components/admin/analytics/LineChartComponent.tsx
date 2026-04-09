import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface LineChartComponentProps<T extends Record<string, string | number>> {
  data: T[];
  dataKey: keyof T;
  xKey: keyof T;
  color: string;
  label: string;
  variant?: 'line' | 'area';
  formatValue?: (value: number) => string;
  darkMode?: boolean;
}

const formatTooltipValue = (
  value: string | number | ReadonlyArray<string | number> | undefined,
  formatter: (value: number) => string,
) => {
  const resolved = typeof value === 'number' ? value : Number(value ?? 0);
  return formatter(Number.isNaN(resolved) ? 0 : resolved);
};

export default function LineChartComponent<T extends Record<string, string | number>>({
  data,
  dataKey,
  xKey,
  color,
  label,
  variant = 'line',
  formatValue = (value) => value.toLocaleString(),
  darkMode = false,
}: LineChartComponentProps<T>) {
  const axisColor = darkMode ? '#9CA3AF' : '#6B7280';
  const gridColor = darkMode ? '#374151' : '#E5E7EB';
  const tooltipStyle = {
    borderRadius: '16px',
    border: `1px solid ${darkMode ? '#374151' : '#E5E7EB'}`,
    boxShadow: darkMode ? '0 10px 30px rgba(0, 0, 0, 0.35)' : '0 10px 30px rgba(15, 23, 42, 0.08)',
    backgroundColor: darkMode ? '#111827' : '#FFFFFF',
    color: darkMode ? '#F3F4F6' : '#111827',
  };

  const chartContent =
    variant === 'area' ? (
      <AreaChart data={data}>
        <defs>
          <linearGradient id={`fill-${String(dataKey)}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.32} />
            <stop offset="95%" stopColor={color} stopOpacity={0.03} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke={gridColor} strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey={String(xKey)} tickLine={false} axisLine={false} tickMargin={10} tick={{ fill: axisColor, fontSize: 12 }} />
        <YAxis tickLine={false} axisLine={false} tickMargin={10} tick={{ fill: axisColor, fontSize: 12 }} />
        <Tooltip
          contentStyle={tooltipStyle}
          labelStyle={{ color: darkMode ? '#F9FAFB' : '#111827' }}
          formatter={(value) => formatTooltipValue(value, formatValue)}
        />
        <Legend wrapperStyle={{ color: axisColor }} />
        <Area
          type="monotone"
          dataKey={String(dataKey)}
          name={label}
          stroke={color}
          fill={`url(#fill-${String(dataKey)})`}
          strokeWidth={3}
          activeDot={{ r: 6 }}
        />
      </AreaChart>
    ) : (
      <LineChart data={data}>
        <CartesianGrid stroke={gridColor} strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey={String(xKey)} tickLine={false} axisLine={false} tickMargin={10} tick={{ fill: axisColor, fontSize: 12 }} />
        <YAxis tickLine={false} axisLine={false} tickMargin={10} tick={{ fill: axisColor, fontSize: 12 }} />
        <Tooltip
          contentStyle={tooltipStyle}
          labelStyle={{ color: darkMode ? '#F9FAFB' : '#111827' }}
          formatter={(value) => formatTooltipValue(value, formatValue)}
        />
        <Legend wrapperStyle={{ color: axisColor }} />
        <Line
          type="monotone"
          dataKey={String(dataKey)}
          name={label}
          stroke={color}
          strokeWidth={3}
          dot={false}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    );

  return (
    <div className="h-80" role="img" aria-label={label}>
      <ResponsiveContainer width="100%" height="100%">
        {chartContent}
      </ResponsiveContainer>
    </div>
  );
}
