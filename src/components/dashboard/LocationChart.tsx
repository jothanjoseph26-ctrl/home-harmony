import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

interface LocationChartProps {
  responses: {
    location: string | null;
  }[];
}

export function LocationChart({ responses }: LocationChartProps) {
  // Count responses by location
  const locationCounts: Record<string, number> = {};
  responses.forEach(r => {
    const location = r.location || 'Unknown';
    locationCounts[location] = (locationCounts[location] || 0) + 1;
  });

  // Convert to chart data and sort by count
  const chartData = Object.entries(locationCounts)
    .map(([location, count]) => ({ location, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8); // Top 8 locations

  const chartConfig = {
    count: {
      label: "Responses",
      color: "hsl(222, 47%, 30%)",
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display">Responses by Location</CardTitle>
        <CardDescription>Geographic distribution of respondents</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px]">
          <BarChart data={chartData} layout="vertical" margin={{ left: 80 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" horizontal={false} />
            <XAxis type="number" className="text-xs" />
            <YAxis dataKey="location" type="category" className="text-xs" width={75} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar 
              dataKey="count" 
              fill="hsl(45, 85%, 55%)" 
              radius={[0, 4, 4, 0]} 
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
