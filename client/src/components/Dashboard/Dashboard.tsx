import { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface TokenStat {
  _id: {
    date: string;
    model: string;
  };
  totalTokens: number;
}

const Dashboard = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [stats, setStats] = useState<{ _id: string; count: number }[]>([]);
  const [tokenStats, setTokenStats] = useState<TokenStat[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [error, setError] = useState('');

  const authenticate = async () => {
    try {
      const response = await fetch('/api/dashboard/user-stats', {
        headers: {
          'x-dashboard-password': password
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.dailyStats);
        setTokenStats(data.tokenStats);
        setTotalUsers(data.totalUsers);
        setIsAuthenticated(true);
        setError('');
      } else {
        setError('Invalid password');
      }
    } catch (err) {
      setError('Failed to authenticate');
    }
  };

  const processTokenStats = () => {
    // Get unique dates and models
    const dates = [...new Set(tokenStats.map(stat => stat._id.date))].sort();
    const models = [...new Set(tokenStats.map(stat => stat._id.model))];

    // Create datasets for each model
    const datasets = models.map(model => {
      const modelData = dates.map(date => {
        const stat = tokenStats.find(s => s._id.date === date && s._id.model === model);
        return stat ? stat.totalTokens : 0;
      });

      return {
        label: model,
        data: modelData,
        fill: false,
        borderColor: `hsl(${Math.random() * 360}, 70%, 50%)`,
        tension: 0.1
      };
    });

    return {
      labels: dates,
      datasets
    };
  };

  const userChartData = {
    labels: stats.map(stat => stat._id),
    datasets: [
      {
        label: 'New Users',
        data: stats.map(stat => stat.count),
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'User Growth Over Time (Since Jan 27, 2025)'
      }
    }
  };

  const tokenChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Token Usage by Model Over Time (Since Jan 27, 2025)'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Token Usage'
        }
      }
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <div className="p-8 bg-white rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-4">Dashboard Login</h1>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter dashboard password"
            className="w-full p-2 border rounded mb-4"
          />
          <button
            onClick={authenticate}
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">User Statistics Dashboard</h1>
      
      <div className="mb-8 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-2">Total Users</h2>
        <p className="text-4xl font-bold text-blue-600">{totalUsers.toLocaleString()}</p>
      </div>

      <div className="grid gap-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <Line data={userChartData} options={chartOptions} />
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <Line data={processTokenStats()} options={tokenChartOptions} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 