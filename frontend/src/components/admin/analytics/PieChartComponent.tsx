import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

interface PieChartComponentProps<T extends Record<string, string | number>> {
  data: T[];
  dataKey: keyof T;
  nameKey: keyof T;
  colors?: string[];
  label: string;
  darkMode?: boolean;
}

export default function PieChartComponent<T extends Record<string, string | number>>({
  data,
  dataKey,
  nameKey,
  colors = ['#FF0080', '#7928CA', '#0070F3', '#38BDF8', '#0EA5E9'],
  label,
  darkMode = false,
}: PieChartComponentProps<T>) {
  const axisColor = darkMode ? '#9CA3AF' : '#6B7280';
  return (
    <div className="h-80" role="img" aria-label={label}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Tooltip
            contentStyle={{
              borderRadius: '16px',
              border: `1px solid ${darkMode ? '#374151' : '#E5E7EB'}`,
              boxShadow: darkMode ? '0 10px 30px rgba(0, 0, 0, 0.35)' : '0 10px 30px rgba(15, 23, 42, 0.08)',
              backgroundColor: darkMode ? '#111827' : '#FFFFFF',
              color: darkMode ? '#F3F4F6' : '#111827',
            }}
          />
          <Legend wrapperStyle={{ color: axisColor }} />
          <Pie
            data={data}
            dataKey={String(dataKey)}
            nameKey={String(nameKey)}
            innerRadius={72}
            outerRadius={108}
            paddingAngle={3}
            animationDuration={700}
            label={({ name, percent }) => `${name} ${(((percent ?? 0) as number) * 100).toFixed(0)}%`}
          >
            {data.map((entry, index) => (
              <Cell
                key={`${String(nameKey)}-${String(entry[nameKey])}-${index}`}
                fill={colors[index % colors.length]}
              />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
