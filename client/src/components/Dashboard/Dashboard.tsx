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

interface TokenTableRow {
  date: string;
  total: number;
  [key: string]: number | string;
}

const DASHBOARD_PASSWORD_KEY = 'dashboard_password';

const Dashboard = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [stats, setStats] = useState<{ _id: string; count: number }[]>([]);
  const [tokenTable, setTokenTable] = useState<TokenTableRow[]>([]);
  const [models, setModels] = useState<string[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [last24hUsers, setLast24hUsers] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    const savedPassword = localStorage.getItem(DASHBOARD_PASSWORD_KEY);
    if (savedPassword) {
      setPassword(savedPassword);
      authenticateWithPassword(savedPassword);
    }
  }, []);

  const authenticateWithPassword = async (pwd: string) => {
    try {
      const response = await fetch('/api/dashboard/user-stats', {
        headers: {
          'x-dashboard-password': pwd
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.dailyStats);
        setTokenTable(data.tokenTable);
        setModels(data.models);
        setTotalUsers(data.totalUsers);
        setLast24hUsers(data.last24hUsers);
        setIsAuthenticated(true);
        setError('');
        localStorage.setItem(DASHBOARD_PASSWORD_KEY, pwd);
      } else {
        setError('Invalid password');
        localStorage.removeItem(DASHBOARD_PASSWORD_KEY);
      }
    } catch (err) {
      setError('Failed to authenticate');
      localStorage.removeItem(DASHBOARD_PASSWORD_KEY);
    }
  };

  const authenticate = () => {
    authenticateWithPassword(password);
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
        text: 'User Growth (Last 30 Days)'
      }
    }
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString(undefined, { maximumFractionDigits: 0 });
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
      <div className="mb-6 bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold">User Statistics Dashboard</h1>
      </div>
      
      <div className="mb-8 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-2">Total Users</h2>
        <div className="flex items-center">
          <p className="text-4xl font-bold text-blue-600">{totalUsers.toLocaleString()}</p>
          {last24hUsers > 0 && (
            <span className="ml-4 px-2 py-1 bg-green-100 text-green-800 rounded">
              +{last24hUsers} in last 24h
            </span>
          )}
        </div>
      </div>

      <div className="grid gap-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <Line data={userChartData} options={chartOptions} />
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
          <h2 className="text-xl font-semibold mb-4">Token Usage by Model (Last 30 Days)</h2>
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-2 text-left">Date</th>
                {models.map(model => (
                  <th key={model} className="px-4 py-2 text-right">{model}</th>
                ))}
                <th className="px-4 py-2 text-right font-bold">Total</th>
              </tr>
            </thead>
            <tbody>
              {tokenTable.map((row, index) => (
                <tr 
                  key={row.date}
                  className={`
                    ${index === tokenTable.length - 1 ? 'font-bold bg-gray-50' : 'hover:bg-gray-50'}
                    ${index === tokenTable.length - 1 ? 'border-t-2' : 'border-t'}
                  `}
                >
                  <td className="px-4 py-2">{row.date}</td>
                  {models.map(model => (
                    <td key={model} className="px-4 py-2 text-right">
                      {formatNumber(row[model] as number)}
                    </td>
                  ))}
                  <td className="px-4 py-2 text-right">{formatNumber(row.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 