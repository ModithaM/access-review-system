import LineChartComponent from './LineChartComponent';
import BarChartComponent from './BarChartComponent';
import PieChartComponent from './PieChartComponent';

interface ChartRendererProps {
  chartType: 'line' | 'area' | 'bar' | 'donut';
  data: Array<Record<string, string | number>>;
  label: string;
  xKey: string;
  dataKey: string;
  color?: string;
  colors?: string[];
  yKey?: string;
  darkMode?: boolean;
}

export default function ChartRenderer({
  chartType,
  data,
  label,
  xKey,
  dataKey,
  color = '#0070F3',
  colors,
  yKey,
  darkMode = false,
}: ChartRendererProps) {
  if (chartType === 'bar') {
    return (
      <BarChartComponent
        data={data}
        dataKey={dataKey}
        xKey={xKey}
        yKey={yKey}
        label={label}
        colors={colors}
        darkMode={darkMode}
      />
    );
  }

  if (chartType === 'donut') {
    return (
      <PieChartComponent
        data={data}
        dataKey={dataKey}
        nameKey={xKey}
        colors={colors}
        label={label}
        darkMode={darkMode}
      />
    );
  }

  return (
    <LineChartComponent
      data={data}
      dataKey={dataKey}
      xKey={xKey}
      label={label}
      color={color}
      variant={chartType === 'area' ? 'area' : 'line'}
      darkMode={darkMode}
    />
  );
}
