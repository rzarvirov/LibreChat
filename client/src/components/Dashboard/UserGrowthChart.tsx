"use client";

import { TrendingUp, TrendingDown } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface ChartData {
  date: string;
  users: number;
}

interface UserGrowthChartProps {
  data: { _id: string; count: number }[];
}

const UserGrowthChart = ({ data }: UserGrowthChartProps) => {
  // Transform data for the chart
  const chartData: ChartData[] = data.map(item => ({
    date: item._id,
    users: item.count
  }));

  // Calculate trend
  const currentMonth = chartData[chartData.length - 1]?.users || 0;
  const previousMonth = chartData[chartData.length - 2]?.users || 0;
  const trend = previousMonth ? ((currentMonth - previousMonth) / previousMonth) * 100 : 0;
  const isTrendingUp = trend >= 0;

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded shadow-lg">
          <p className="text-sm font-medium">{formatDate(label)}</p>
          <p className="text-sm text-gray-600">
            <span className="font-medium">{payload[0].value}</span> new users
          </p>
        </div>
      );
    }
    return null;
  };

  // Format date to dd-mm
  const formatDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-');
    return `${day}-${month}`;
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="mb-4">
        <h2 className="text-xl font-semibold">User Growth</h2>
        <p className="text-sm text-gray-500">
          Showing new users over the last 30 days
        </p>
      </div>
      <div className="h-[300px] sm:h-[60vh] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{
              top: 10,
              right: 0,
              left: 0,
              bottom: 0,
            }}
          >
            <defs>
              <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={formatDate}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.toLocaleString()}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="natural"
              dataKey="users"
              stroke="hsl(var(--chart-1))"
              fill="url(#colorUsers)"
              fillOpacity={1}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 flex items-start gap-2 text-sm">
        <div className="grid gap-2">
          <div className="flex items-center gap-2 font-medium leading-none">
            {isTrendingUp ? (
              <>
                Trending up by {Math.abs(trend).toFixed(1)}% this month{" "}
                <TrendingUp className="h-4 w-4 text-green-500" />
              </>
            ) : (
              <>
                Trending down by {Math.abs(trend).toFixed(1)}% this month{" "}
                <TrendingDown className="h-4 w-4 text-red-500" />
              </>
            )}
          </div>
          <div className="flex items-center gap-2 leading-none text-gray-500">
            Last 30 days
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserGrowthChart; 