import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { PieChart, Pie, Cell } from 'recharts';

interface SourceChartProps {
  responses: {
    source: string | null;
  }[];
}

const COLORS = ['hsl(222, 47%, 30%)', 'hsl(45, 85%, 55%)', 'hsl(222, 40%, 50%)', 'hsl(40, 80%, 45%)', 'hsl(200, 50%, 50%)', 'hsl(160, 50%, 45%)'];

export function SourceChart({ responses }: SourceChartProps) {
  // Count responses by source
  const sourceCounts: Record<string, number> = {};
  responses.forEach(r => {
    const source = r.source || 'Direct';
    sourceCounts[source] = (sourceCounts[source] || 0) + 1;
  });

  // Convert to chart data
  const chartData = Object.entries(sourceCounts)
    .map(([name, value], index) => ({ 
      name, 
      value,
      fill: COLORS[index % COLORS.length]
    }))
    .sort((a, b) => b.value - a.value);

  const chartConfig = {
    value: {
      label: "Responses",
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display">Traffic Sources</CardTitle>
        <CardDescription>Where respondents came from</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px]">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={3}
              dataKey="value"
              label={({ name, value }) => `${name}: ${value}`}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <ChartTooltip content={<ChartTooltipContent />} />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
