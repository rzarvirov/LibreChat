import { FC, useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '~/hooks/AuthContext';
import useLocalize from '~/hooks/useLocalize';

const ManualSubscription: FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const { isAuthenticated, token } = useAuthContext();
  const navigate = useNavigate();
  const localize = useLocalize();
  const requestInProgress = useRef(false);

  useEffect(() => {
    const activateSubscription = async () => {
      if (!isAuthenticated) {
        setError(localize('com_subscription_auth_required'));
        setLoading(false);
        return;
      }

      // Prevent duplicate requests
      if (requestInProgress.current) {
        return;
      }
      requestInProgress.current = true;

      try {
        const linkId = window.location.pathname.split('/').pop();
        
        const response = await fetch(`/api/stripe/manual-subscribe/${linkId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          }
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to activate subscription');
        }

        // Set success and wait before redirecting
        setSuccess(true);
        setTimeout(() => {
          navigate('/');
        }, 3000); // Wait 3 seconds before redirecting
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to activate subscription');
      } finally {
        setLoading(false);
        requestInProgress.current = false;
      }
    };

    if (isAuthenticated && token) {
      activateSubscription();
    }
  }, [isAuthenticated, token, navigate, localize]);

  if (loading || success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
        {success && (
          <div className="text-center">
            <h2 className="text-xl font-semibold text-green-600 dark:text-green-400 mb-2">
              {localize('com_subscription_activated')}
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              {localize('com_subscription_redirecting')}
            </p>
          </div>
        )}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 px-4 py-3 rounded relative max-w-md w-full">
          <h2 className="font-bold text-lg mb-2">{localize('com_subscription_error')}</h2>
          <p className="mt-2">{error}</p>
          {!isAuthenticated && (
            <button
              onClick={() => navigate('/login')}
              className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full"
            >
              {localize('com_auth_login')}
            </button>
          )}
        </div>
      </div>
    );
  }

  return null;
};

export default ManualSubscription; 