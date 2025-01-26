import { FC, useState } from 'react';
import useLocalize from '~/hooks/useLocalize';
import { useAuthContext } from '~/hooks/AuthContext';
import { useGetUserBalance, useGetStartupConfig } from 'librechat-data-provider/react-query';
import SubscriptionPopup from './SubscriptionPopup';
import SubscriptionManagePopup from './SubscriptionManagePopup';

const SubscriptionButton: FC = () => {
  const [showSubscriptionPlans, setShowSubscriptionPlans] = useState(false);
  const [showSubscriptionManage, setShowSubscriptionManage] = useState(false);
  const localize = useLocalize();
  const { user, isAuthenticated } = useAuthContext();
  const { data: startupConfig } = useGetStartupConfig();
  const balanceQuery = useGetUserBalance({
    enabled: !!isAuthenticated && startupConfig?.checkBalance,
  });
  const extendedUser = user as { subscriptionTier?: string; subscriptionStatus?: string; subscriptionEndDate?: string; subscriptionCanceled?: boolean };

  const handleClick = () => {
    if (extendedUser?.subscriptionTier === 'FREE') {
      setShowSubscriptionPlans(true);
    } else {
      setShowSubscriptionManage(true);
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
      >
        {localize('com_subscription_button')}
      </button>
      
      <SubscriptionPopup 
        isOpen={showSubscriptionPlans}
        onClose={() => setShowSubscriptionPlans(false)}
      />

      {showSubscriptionManage && (
        <SubscriptionManagePopup
          isOpen={showSubscriptionManage}
          onClose={() => setShowSubscriptionManage(false)}
          subscriptionData={{
            tier: extendedUser?.subscriptionTier || 'FREE',
            status: extendedUser?.subscriptionStatus,
            balance: parseFloat(balanceQuery.data || '0'),
            endDate: extendedUser?.subscriptionEndDate || new Date().toISOString(),
            canceled: extendedUser?.subscriptionCanceled,
          }}
        />
      )}
    </>
  );
};

export default SubscriptionButton; 