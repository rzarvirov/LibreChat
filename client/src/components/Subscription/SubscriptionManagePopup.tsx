import { FC, useState } from 'react';
import { createPortal } from 'react-dom';
import useLocalize from '~/hooks/useLocalize';
import { useAuthContext } from '~/hooks/AuthContext';
import SubscriptionPopup from './SubscriptionPopup';

interface SubscriptionManagePopupProps {
  isOpen: boolean;
  onClose: () => void;
  subscriptionData: {
    tier: string;
    balance: number;
    endDate: string;
    status?: string;
    canceled?: boolean;
  };
}

const SubscriptionManagePopup: FC<SubscriptionManagePopupProps> = ({ isOpen, onClose, subscriptionData }) => {
  const localize = useLocalize();
  const { isAuthenticated, token } = useAuthContext();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showSubscriptionPlans, setShowSubscriptionPlans] = useState<boolean>(false);
  const [changingPlan, setChangingPlan] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleCancelSubscription = async () => {
    if (!isAuthenticated) {
      setError(localize('com_subscription_login_required'));
      return;
    }

    setError(null);
    setIsLoading(true);
    try {
      const response = await fetch('/api/stripe/cancel-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || localize('com_subscription_no_active'));
      }

      setSuccessMessage(localize('com_subscription_cancel_success'));
      setShowConfirmation(false);
      // Close the popup after 2 seconds
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Error canceling subscription:', error);
      setError(error instanceof Error ? error.message : localize('com_subscription_error_cancel'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleReactivateSubscription = async () => {
    if (!isAuthenticated) {
      setError(localize('com_subscription_login_required'));
      return;
    }

    setError(null);
    setIsLoading(true);
    try {
      const response = await fetch('/api/stripe/reactivate-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || localize('com_subscription_error_reactivate'));
      }

      setSuccessMessage(localize('com_subscription_reactivated'));
      // Close the popup after 2 seconds
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Error reactivating subscription:', error);
      setError(error instanceof Error ? error.message : localize('com_subscription_error_reactivate'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePlan = async (priceId: string) => {
    if (!isAuthenticated) {
      setError(localize('com_subscription_login_change'));
      return;
    }

    setError(null);
    setIsLoading(true);
    try {
      const response = await fetch('/api/stripe/change-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ priceId }),
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || localize('com_subscription_error_change'));
      }

      if (data.url) {
        // If we got a checkout URL, redirect to it
        window.location.href = data.url;
      } else {
        // If the change was processed directly
        setSuccessMessage(data.message);
        setTimeout(() => {
          onClose();
        }, 2000);
      }
    } catch (error) {
      console.error('Error changing subscription:', error);
      setError(error instanceof Error ? error.message : localize('com_subscription_error_change'));
    } finally {
      setIsLoading(false);
    }
  };

  if (showSubscriptionPlans) {
    return (
      <SubscriptionPopup
        isOpen={showSubscriptionPlans}
        onClose={() => setShowSubscriptionPlans(false)}
        onPlanSelect={handleChangePlan}
        currentPlan={subscriptionData.tier}
      />
    );
  }

  const getStatusColor = (status?: string, canceled?: boolean) => {
    if (canceled) {
      return 'text-orange-500 dark:text-orange-400';
    }
    switch (status) {
      case 'ACTIVE':
        return 'text-green-500 dark:text-green-400';
      case 'CANCELED':
        return 'text-red-500 dark:text-red-400';
      case 'EXPIRED':
        return 'text-gray-500 dark:text-gray-400';
      default:
        return 'text-gray-500 dark:text-gray-400';
    }
  };

  const getDisplayStatus = (status?: string, canceled?: boolean) => {
    if (canceled) {
      return 'Active until end of period';
    }
    switch (status) {
      case 'ACTIVE':
        return 'Active';
      case 'CANCELED':
        return 'Canceled';
      case 'EXPIRED':
        return 'Expired';
      default:
        return 'Free';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const popupContent = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50" 
        onClick={() => {
          if (!isLoading) {
            onClose();
          }
        }}
      />
      
      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 p-6 z-[101]">
        {/* Close button */}
        <button
          onClick={() => {
            if (!isLoading) {
              onClose();
            }
          }}
          disabled={isLoading}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            {localize('com_subscription_manage')}
          </h2>
          {error && (
            <p className="mt-2 text-red-500 dark:text-red-400">
              {error}
            </p>
          )}
          {successMessage && (
            <p className="mt-2 text-green-500 dark:text-green-400">
              {successMessage}
            </p>
          )}
        </div>

        {/* Subscription Details */}
        <div className="space-y-4 mb-8">
          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-300">{localize('com_subscription_current_plan')}:</span>
            <span className="font-semibold text-gray-900 dark:text-white">{subscriptionData.tier}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-300">{localize('com_subscription_balance')}:</span>
            <span className="font-semibold text-gray-900 dark:text-white">{Math.floor(subscriptionData.balance)}</span>
          </div>
          {subscriptionData.canceled ? (
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center mb-2">
                <svg className="w-5 h-5 text-orange-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span className="font-medium text-gray-900 dark:text-white">{localize('com_subscription_canceling')}</span>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                {localize('com_subscription_active_until').replace('{0}', subscriptionData.tier).replace('{1}', formatDate(subscriptionData.endDate))}
              </p>
              <button
                className={`mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                onClick={handleReactivateSubscription}
                disabled={isLoading}
              >
                {isLoading ? localize('com_ui_loading') : localize('com_subscription_keep')}
              </button>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-300">{localize('com_subscription_status')}:</span>
                <span className={`font-semibold ${getStatusColor(subscriptionData.status, subscriptionData.canceled)}`}>
                  {getDisplayStatus(subscriptionData.status, subscriptionData.canceled)}
                </span>
              </div>
              {subscriptionData.status === 'ACTIVE' && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-300">{localize('com_subscription_next_payment')}:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {formatDate(subscriptionData.endDate)}
                  </span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          {subscriptionData.status === 'ACTIVE' && !subscriptionData.canceled && (
            <>
              <button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                onClick={() => setShowSubscriptionPlans(true)}
                disabled={isLoading}
              >
                {localize('com_subscription_change_plan')}
              </button>
              {!showConfirmation ? (
                <button
                  className={`w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors ${
                    isLoading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  onClick={() => setShowConfirmation(true)}
                  disabled={isLoading}
                >
                  {localize('com_subscription_cancel')}
                </button>
              ) : (
                <div className="flex gap-4">
                  <button
                    className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                    onClick={() => setShowConfirmation(false)}
                    disabled={isLoading}
                  >
                    {localize('com_ui_cancel')}
                  </button>
                  <button
                    className={`flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors ${
                      isLoading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    onClick={handleCancelSubscription}
                    disabled={isLoading}
                  >
                    {isLoading ? localize('com_ui_loading') : localize('com_subscription_cancel')}
                  </button>
                </div>
              )}
            </>
          )}
          {(!subscriptionData.status || subscriptionData.status !== 'ACTIVE' || subscriptionData.canceled) && (
            <button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              onClick={() => setShowSubscriptionPlans(true)}
            >
              {localize('com_subscription_view_plans')}
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(popupContent, document.body);
};

export default SubscriptionManagePopup; 