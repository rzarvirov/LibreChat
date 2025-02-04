import { TrendingUp, TrendingDown } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis, ResponsiveContainer } from "recharts";

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

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="mb-4">
        <h2 className="text-xl font-semibold">User Growth</h2>
        <p className="text-sm text-gray-500">
          Showing new users over the last 30 days
        </p>
      </div>
      <div className="h-[60vh]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{
              top: 10,
              right: 30,
              left: 0,
              bottom: 0,
            }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(5)} // Show only MM-DD
            />
            <Area
              type="natural"
              dataKey="users"
              stroke="#3b82f6"
              fill="#3b82f6"
              fillOpacity={0.2}
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