"use client"

import { useState } from 'react';
import { Pie, PieChart, ResponsiveContainer, Cell, Legend, Tooltip } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui";

interface TokenUsageData {
  name: string;
  value: number;
  fill: string;
}

interface TokenUsagePieChartProps {
  tokenTable: any[];
  models: string[];
}

const CHART_COLORS = [
  '#8B5CF6', // Vibrant purple
  '#3B82F6', // Bright blue
  '#10B981', // Emerald green
  '#F59E0B', // Warm amber
  '#EF4444', // Bright red
  '#EC4899', // Pink
  '#6366F1', // Indigo
  '#14B8A6', // Teal
  '#F97316', // Orange
  '#8B5CF6', // Light purple
];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card px-3 py-2 rounded-lg shadow-lg border border-border">
        <p className="font-medium text-card-foreground">{payload[0].name}</p>
        <p className="text-muted-foreground">
          {payload[0].value.toLocaleString()} tokens
        </p>
      </div>
    );
  }
  return null;
};

const TokenUsagePieChart = ({ tokenTable, models }: TokenUsagePieChartProps) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'24h' | '7d' | '30d'>('24h');

  const calculatePeriodData = () => {
    if (!tokenTable || tokenTable.length === 0) return [];

    let periodData: { [key: string]: number } = {};
    let startIndex = 0;

    if (selectedPeriod === '24h') {
      startIndex = tokenTable.length - 2;
    } else if (selectedPeriod === '7d') {
      startIndex = Math.max(0, tokenTable.length - 8);
    }

    for (let i = startIndex; i < tokenTable.length - 1; i++) {
      const day = tokenTable[i];
      models.forEach(model => {
        periodData[model] = (periodData[model] || 0) + (day[model] || 0);
      });
    }

    return models
      .map((model, index) => ({
        name: model,
        value: periodData[model] || 0,
        fill: CHART_COLORS[index % CHART_COLORS.length]
      }))
      .filter(item => item.value > 0)
      .sort((a, b) => b.value - a.value);
  };

  const chartData = calculatePeriodData();
  const totalTokens = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card className="flex flex-col bg-white shadow-md">
      <CardHeader className="space-y-1.5">
        <div className="flex items-center justify-end gap-2">
          {[
            { value: '24h', label: 'Last 24h' },
            { value: '7d', label: 'Last Week' },
            { value: '30d', label: 'Last 30 Days' }
          ].map((period) => (
            <button
              key={period.value}
              onClick={() => setSelectedPeriod(period.value as '24h' | '7d' | '30d')}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                selectedPeriod === period.value
                  ? 'bg-blue-100 text-blue-800 border-2 border-blue-300'
                  : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:border-gray-300'
              }`}
            >
              {period.label}
            </button>
          ))}
        </div>
        <CardTitle className="text-xl">Token Usage by Model</CardTitle>
        <CardDescription>
          {selectedPeriod === '24h' ? 'Last 24 Hours' :
           selectedPeriod === '7d' ? 'Last 7 Days' :
           'Last 30 Days'} Token Usage
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="mx-auto aspect-square w-full max-h-[350px] relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius="60%"
                outerRadius="80%"
                paddingAngle={3}
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.fill}
                    stroke="hsl(var(--background))"
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="middle"
                align="right"
                layout="vertical"
                iconType="circle"
                wrapperStyle={{
                  paddingLeft: '2rem',
                  fontSize: '0.875rem',
                }}
                formatter={(value: string) => (
                  <span className="text-muted-foreground hover:text-foreground transition-colors">
                    {value}
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 text-center">
          <div className="text-2xl font-semibold text-gray-700">
            {totalTokens.toLocaleString()}
          </div>
          <div className="text-sm text-gray-500">
            Total Tokens
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TokenUsagePieChart; 