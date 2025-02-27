import { useState, useEffect } from 'react';
import UserManagement from './UserManagement';
import UserGrowthChart from './UserGrowthChart';
import TokenUsagePieChart from './TokenUsagePieChart';
import NewsManagement from '../News/NewsManagement';

interface TokenTableRow {
  date: string;
  total: number;
  [key: string]: number | string;
}

interface Message {
  messageId: string;
  text: string;
  createdAt: string;
  conversationId: string;
  model: string;
  tokenCount: number;
}

interface ModelStats {
  model: string;
  tokens30Days: number;
  tokens24Hours: number;
}

interface TopUser {
  email: string;
  tier: string;
  transactionCount: number;
  totalTokens: number;
  balance: number;
}

const DASHBOARD_PASSWORD_KEY = 'dashboard_password';

const Dashboard = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('stats');
  const [selectedEmail, setSelectedEmail] = useState('');
  const [password, setPassword] = useState('');
  const [stats, setStats] = useState<{ _id: string; count: number }[]>([]);
  const [tokenTable, setTokenTable] = useState<TokenTableRow[]>([]);
  const [modelStats, setModelStats] = useState<ModelStats[]>([]);
  const [models, setModels] = useState<string[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [last24hUsers, setLast24hUsers] = useState(0);
  const [topUsers, setTopUsers] = useState<TopUser[]>([]);
  const [lastMessages, setLastMessages] = useState<Message[]>([]);
  const [error, setError] = useState('');
  const [selectedTiers, setSelectedTiers] = useState<string[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<'24h' | '7d' | '30d'>('30d');

  useEffect(() => {
    const savedPassword = localStorage.getItem(DASHBOARD_PASSWORD_KEY);
    if (savedPassword) {
      setPassword(savedPassword);
      authenticateWithPassword(savedPassword);
    }
  }, []);

  const processModelStats = (tokenTable: TokenTableRow[], models: string[]) => {
    const last30Days = tokenTable.slice(0, -1); // Exclude the total row
    const last24Hours = tokenTable[tokenTable.length - 2]; // Get the last day's data
    
    const stats: ModelStats[] = models.map(model => {
      // Calculate total tokens
      const tokens30Days = last30Days.reduce((sum, day) => sum + (day[model] as number || 0), 0);
      const tokens24Hours = last24Hours[model] as number || 0;

      return {
        model,
        tokens30Days,
        tokens24Hours,
      };
    });

    // Sort by 30-day token usage
    return stats.sort((a, b) => b.tokens30Days - a.tokens30Days);
  };

  const authenticateWithPassword = async (pwd: string) => {
    try {
      const response = await fetch(`/api/dashboard/user-stats?period=${selectedPeriod}`, {
        headers: {
          'x-dashboard-password': pwd
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('API Response:', data);
        setStats(data.dailyStats);
        setTokenTable(data.tokenTable);
        setModels(data.models);
        setModelStats(processModelStats(data.tokenTable, data.models));
        setTotalUsers(data.totalUsers);
        setLast24hUsers(data.last24hUsers);
        setTopUsers(data.topUsers);
        setLastMessages(data.lastMessages || []);
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

  const refreshTopUsers = async () => {
    try {
      const response = await fetch(`/api/dashboard/user-stats?period=${selectedPeriod}`, {
        headers: {
          'x-dashboard-password': localStorage.getItem(DASHBOARD_PASSWORD_KEY) || ''
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTopUsers(data.topUsers);
      }
    } catch (err) {
      console.error('Failed to refresh top users:', err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      refreshTopUsers();
    }
  }, [selectedPeriod, isAuthenticated]);

  const authenticate = () => {
    authenticateWithPassword(password);
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString(undefined, { maximumFractionDigits: 0 });
  };

  const handleEmailClick = (email: string) => {
    setSelectedEmail(email);
    setActiveTab('users');
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
        <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-4 py-2 rounded transition-colors ${
              activeTab === 'stats'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            Statistics
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded transition-colors ${
              activeTab === 'users'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            User Management
          </button>
          <button
            onClick={() => setActiveTab('news')}
            className={`px-4 py-2 rounded transition-colors ${
              activeTab === 'news'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            News Management
          </button>
        </div>
      </div>

      {activeTab === 'stats' ? (
        <>
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

          <div className="grid grid-cols-1 gap-8">
            <UserGrowthChart data={stats} />

            <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                  <h2 className="text-xl font-semibold">Top 50 Users</h2>
                  <div className="flex gap-2">
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
                </div>
                <div className="relative w-full sm:w-auto">
                  <div className="flex flex-wrap gap-2">
                    {['FREE', 'BASIC', 'PRO', 'PROPLUS'].map((tier) => (
                      <button
                        key={tier}
                        onClick={() => {
                          setSelectedTiers(prev => 
                            prev.includes(tier)
                              ? prev.filter(t => t !== tier)
                              : [...prev, tier]
                          );
                        }}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                          selectedTiers.includes(tier)
                            ? 'bg-blue-100 text-blue-800 border-2 border-blue-300'
                            : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:border-gray-300'
                        }`}
                      >
                        {tier}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2 text-left">Email</th>
                    <th className="px-4 py-2 text-center">Tier</th>
                    <th className="px-4 py-2 text-right">Transactions</th>
                    <th className="px-4 py-2 text-right">Total Tokens</th>
                    <th className="px-4 py-2 text-right">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {topUsers
                    .filter(user => selectedTiers.length === 0 || selectedTiers.includes(user.tier))
                    .slice(0, 50)
                    .map((user, index) => (
                      <tr 
                        key={user.email}
                        className="border-t hover:bg-gray-50"
                      >
                        <td className="px-4 py-2">
                          <button
                            onClick={() => handleEmailClick(user.email)}
                            className="text-blue-600 hover:text-blue-800 hover:underline text-left"
                          >
                            {user.email}
                          </button>
                        </td>
                        <td className="px-4 py-2 text-center">
                          <span className={`px-2 py-1 rounded text-sm ${
                            user.tier === 'FREE' ? 'bg-gray-100 text-gray-800' :
                            user.tier === 'BASIC' ? 'bg-blue-100 text-blue-800' :
                            user.tier === 'PRO' ? 'bg-purple-100 text-purple-800' :
                            user.tier === 'PROPLUS' ? 'bg-indigo-100 text-indigo-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {user.tier}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-right">{formatNumber(user.transactionCount)}</td>
                        <td className="px-4 py-2 text-right">{formatNumber(Math.round(user.totalTokens))}</td>
                        <td className="px-4 py-2 text-right">{formatNumber(Math.round(user.balance))}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            <TokenUsagePieChart tokenTable={tokenTable} models={models} />

            <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
              <h2 className="text-xl font-semibold mb-4">Last 30 User Messages</h2>
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2 text-left">Message</th>
                    <th className="px-4 py-2 text-right">Tokens</th>
                    <th className="px-4 py-2 text-right">Created At</th>
                  </tr>
                </thead>
                <tbody>
                  {lastMessages.map((message) => (
                    <tr 
                      key={message.messageId}
                      className="border-t hover:bg-gray-50"
                    >
                      <td className="px-4 py-2">
                        <div className="whitespace-pre-wrap">{message.text}</div>
                      </td>
                      <td className="px-4 py-2 text-right">{formatNumber(message.tokenCount)}</td>
                      <td className="px-4 py-2 text-right">
                        {new Date(message.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : activeTab === 'users' ? (
        <UserManagement initialEmail={selectedEmail} />
      ) : activeTab === 'news' ? (
        <NewsManagement />
      ) : null}
    </div>
  );
};

export default Dashboard; 