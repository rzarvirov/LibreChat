import { useState, useEffect } from 'react';

interface UserData {
  email: string;
  tier: string;
  balance: number;
}

interface UserManagementProps {
  initialEmail?: string;
}

const TIERS = ['FREE', 'BASIC', 'PRO', 'PROPLUS'];

const UserManagement = ({ initialEmail = '' }: UserManagementProps) => {
  const [searchEmail, setSearchEmail] = useState(initialEmail);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [newTier, setNewTier] = useState('');
  const [newBalance, setNewBalance] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (initialEmail) {
      setSearchEmail(initialEmail);
      handleSearch(initialEmail);
    }
  }, [initialEmail]);

  const handleSearch = async (emailToSearch = searchEmail) => {
    try {
      setError('');
      setSuccess('');
      setUserData(null);

      const response = await fetch('/api/dashboard/user-lookup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-dashboard-password': localStorage.getItem('dashboard_password') || ''
        },
        body: JSON.stringify({ email: emailToSearch })
      });

      if (!response.ok) {
        throw new Error('User not found');
      }

      const data = await response.json();
      setUserData(data);
      setNewTier(data.tier);
      setNewBalance(data.balance.toString());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to find user');
    }
  };

  const handleUpdate = async () => {
    try {
      setError('');
      setSuccess('');

      const response = await fetch('/api/dashboard/update-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-dashboard-password': localStorage.getItem('dashboard_password') || ''
        },
        body: JSON.stringify({
          email: searchEmail,
          tier: newTier,
          balance: parseInt(newBalance)
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update user');
      }

      setSuccess('User updated successfully');
      handleSearch(); // Refresh user data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user');
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">User Management</h2>
      
      <div className="flex gap-4 mb-6">
        <input
          type="email"
          placeholder="Enter user email"
          value={searchEmail}
          onChange={(e) => setSearchEmail(e.target.value)}
          className="flex-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={() => handleSearch(searchEmail)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Search
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
          {success}
        </div>
      )}

      {userData && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Tier: {userData.tier}
              </label>
              <select
                value={newTier}
                onChange={(e) => setNewTier(e.target.value)}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {TIERS.map((tier) => (
                  <option key={tier} value={tier}>
                    {tier}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Balance: {userData.balance}
              </label>
              <input
                type="number"
                value={newBalance}
                onChange={(e) => setNewBalance(e.target.value)}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <button
            onClick={handleUpdate}
            className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
          >
            Update User
          </button>
        </div>
      )}
    </div>
  );
};

export default UserManagement; 
