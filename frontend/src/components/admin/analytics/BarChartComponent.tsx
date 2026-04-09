import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface BarChartComponentProps<T extends Record<string, string | number>> {
  data: T[];
  dataKey: keyof T;
  xKey: keyof T;
  yKey?: keyof T;
  label: string;
  colors?: string[];
  horizontal?: boolean;
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

export default function BarChartComponent<T extends Record<string, string | number>>({
  data,
  dataKey,
  xKey,
  yKey,
  label,
  colors = ['#FF0080', '#7928CA', '#0070F3', '#38BDF8', '#0EA5E9'],
  horizontal = false,
  formatValue = (value) => value.toLocaleString(),
  darkMode = false,
}: BarChartComponentProps<T>) {
  const axisColor = darkMode ? '#9CA3AF' : '#6B7280';
  const gridColor = darkMode ? '#374151' : '#E5E7EB';
  const tooltipStyle = {
    borderRadius: '16px',
    border: `1px solid ${darkMode ? '#374151' : '#E5E7EB'}`,
    boxShadow: darkMode ? '0 10px 30px rgba(0, 0, 0, 0.35)' : '0 10px 30px rgba(15, 23, 42, 0.08)',
    backgroundColor: darkMode ? '#111827' : '#FFFFFF',
    color: darkMode ? '#F3F4F6' : '#111827',
  };

  return (
    <div className="h-80" role="img" aria-label={label}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout={horizontal ? 'vertical' : 'horizontal'}>
          <CartesianGrid stroke={gridColor} strokeDasharray="3 3" vertical={!horizontal} />
          <Tooltip
            contentStyle={tooltipStyle}
            labelStyle={{ color: darkMode ? '#F9FAFB' : '#111827' }}
            formatter={(value) => formatTooltipValue(value, formatValue)}
          />
          <Legend wrapperStyle={{ color: axisColor }} />
          {horizontal ? (
            <>
              <XAxis type="number" tickLine={false} axisLine={false} tick={{ fill: axisColor, fontSize: 12 }} />
              <YAxis
                type="category"
                dataKey={String(yKey ?? xKey)}
                tickLine={false}
                axisLine={false}
                width={100}
                tick={{ fill: axisColor, fontSize: 12 }}
              />
            </>
          ) : (
            <>
              <XAxis dataKey={String(xKey)} tickLine={false} axisLine={false} tickMargin={10} tick={{ fill: axisColor, fontSize: 12 }} />
              <YAxis tickLine={false} axisLine={false} tickMargin={10} tick={{ fill: axisColor, fontSize: 12 }} />
            </>
          )}
          <Bar
            dataKey={String(dataKey)}
            name={label}
            radius={horizontal ? [0, 14, 14, 0] : [14, 14, 0, 0]}
            animationDuration={700}
          >
            {data.map((entry, index) => (
              <Cell
                key={`${String(xKey)}-${String(entry[xKey])}-${index}`}
                fill={colors[index % colors.length]}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
