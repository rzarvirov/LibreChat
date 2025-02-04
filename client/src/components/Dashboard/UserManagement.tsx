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
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (initialEmail) {
      setSearchEmail(initialEmail);
      handleSearch(initialEmail);
    }
  }, [initialEmail]);

  const handleSearch = async (emailToSearch = searchEmail) => {
    try {
      setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 sm:p-8">
          <h2 className="text-2xl font-bold mb-6">User Management</h2>
          
          <div className="space-y-6">
            {/* Search Section */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <input
                  type="email"
                  placeholder="Enter user email"
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                />
                <button
                  onClick={() => handleSearch(searchEmail)}
                  disabled={isLoading}
                  className={`px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors ${
                    isLoading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isLoading ? 'Searching...' : 'Search'}
                </button>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600">{error}</p>
                </div>
              )}

              {success && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-600">{success}</p>
                </div>
              )}
            </div>

            {/* User Details Section */}
            {userData && (
              <div className="space-y-6 pt-6 border-t">
                <h3 className="text-lg font-semibold">User Details</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Subscription Tier
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {TIERS.map((tier) => (
                        <button
                          key={tier}
                          onClick={() => setNewTier(tier)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            newTier === tier
                              ? 'bg-blue-100 text-blue-800 border-2 border-blue-300'
                              : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:border-gray-300'
                          }`}
                        >
                          {tier}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Token Balance
                    </label>
                    <input
                      type="number"
                      value={newBalance}
                      onChange={(e) => setNewBalance(e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                    />
                  </div>
                </div>

                <div className="pt-6">
                  <button
                    onClick={handleUpdate}
                    disabled={isLoading}
                    className={`w-full px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors ${
                      isLoading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {isLoading ? 'Updating...' : 'Update User'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement; 
