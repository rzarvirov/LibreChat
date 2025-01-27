import { FC, useState } from 'react';
import { createPortal } from 'react-dom';
import { HelpCircle } from 'lucide-react';
import useLocalize from '~/hooks/useLocalize';
import { useAuthContext } from '~/hooks/AuthContext';
import TokenBubble from '~/components/Common/TokenBubble';
import { useRecoilValue } from 'recoil';
import store from '~/store';

interface SubscriptionPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onPlanSelect?: (priceId: string) => Promise<void>;
  currentPlan?: string;
}

interface SubscriptionTier {
  name: string;
  price: string;
  priceId?: string;
  features: React.ReactNode[];
}

const SubscriptionPopup: FC<SubscriptionPopupProps> = ({ isOpen, onClose, onPlanSelect, currentPlan }) => {
  const localize = useLocalize();
  const { isAuthenticated, token } = useAuthContext();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showTokenInfo, setShowTokenInfo] = useState(false);
  const [tokenBubblePosition, setTokenBubblePosition] = useState({ x: 0, y: 0 });
  const lang = useRecoilValue(store.lang);

  if (!isOpen) return null;

  // Log environment variables for debugging
  console.log('Price IDs:', {
    basic: import.meta.env.VITE_STRIPE_PRICE_BASIC_EN,
    pro: import.meta.env.VITE_STRIPE_PRICE_PRO_EN,
    proplus: import.meta.env.VITE_STRIPE_PRICE_PROPLUS_EN
  });

  const handleHelpClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setTokenBubblePosition({
      x: rect.left + rect.width / 2,
      y: rect.top
    });
    setShowTokenInfo(!showTokenInfo);
  };

  const tiers: SubscriptionTier[] = [
    {
      name: localize('com_subscription_basic'),
      price: localize('com_subscription_basic_price'),
      priceId: 'price_1QldvlDtQYIReEjOqushTtME',
      features: [
        <div key="tokens" className="flex items-center gap-1">
          <span>{localize('com_subscription_token_credits').replace('{0}', localize('com_subscription_basic_tokens'))}</span>
          <button onClick={handleHelpClick} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>,
        localize('com_subscription_basic_feature_1'),
        localize('com_subscription_basic_feature_2'),
        localize('com_subscription_basic_feature_3')
      ]
    },
    {
      name: localize('com_subscription_pro'),
      price: localize('com_subscription_pro_price'),
      priceId: 'price_1QldxzDtQYIReEjOXx8aNtXX',
      features: [
        <div key="tokens" className="flex items-center gap-1">
          <span>{localize('com_subscription_token_credits').replace('{0}', localize('com_subscription_pro_tokens'))}</span>
          <button onClick={handleHelpClick} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>,
        localize('com_subscription_pro_feature_1'),
        localize('com_subscription_pro_feature_2'),
        localize('com_subscription_pro_feature_3'),
        localize('com_subscription_pro_feature_4')
      ]
    },
    {
      name: localize('com_subscription_proplus'),
      price: localize('com_subscription_proplus_price'),
      priceId: 'price_1Qle5DDtQYIReEjOg395QNMO',
      features: [
        <div key="tokens" className="flex items-center gap-1">
          <span>{localize('com_subscription_token_credits').replace('{0}', localize('com_subscription_proplus_tokens'))}</span>
          <button onClick={handleHelpClick} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>,
        localize('com_subscription_proplus_feature_1'),
        localize('com_subscription_proplus_feature_2'),
        localize('com_subscription_proplus_feature_3'),
        localize('com_subscription_proplus_feature_4'),
        localize('com_subscription_proplus_feature_5')
      ]
    }
  ];

  const handleSubscribe = async (priceId: string) => {
    if (!isAuthenticated) {
      setError('Please log in to subscribe');
      return;
    }

    console.log('Requesting subscription with price ID:', priceId);
    setError(null);
    setIsLoading(true);

    try {
      if (onPlanSelect) {
        await onPlanSelect(priceId);
        // Close the popup on successful plan change
        onClose();
        return;
      }

      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ priceId }),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create checkout session');
      }

      const { url } = await response.json();
      if (url) {
        window.location.href = url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Error handling subscription:', error);
      setError(error instanceof Error ? error.message : 'Failed to process subscription request');
    } finally {
      setIsLoading(false);
    }
  };

  const popupContent = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50" 
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full mx-4 p-4 sm:p-6 z-[101] overflow-y-auto max-h-[90vh]">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 sm:top-4 sm:right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            {localize('com_subscription_title')}
          </h2>
          <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-300">
            {localize('com_subscription_subtitle')}
          </p>
          {error && (
            <p className="mt-2 text-red-500 dark:text-red-400">
              {error}
            </p>
          )}
        </div>

        {/* Subscription tiers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`border border-gray-200 dark:border-gray-700 rounded-lg p-4 sm:p-6 hover:shadow-lg transition-shadow ${
                currentPlan === tier.name ? 'border-blue-500 dark:border-blue-400 border-2' : ''
              }`}
            >
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">
                {tier.name}
                {currentPlan === tier.name && (
                  <span className="ml-2 text-xs sm:text-sm text-blue-600 dark:text-blue-400">(Current)</span>
                )}
              </h3>
              <p className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400 mb-4">{tier.price}</p>
              <ul className="space-y-2 sm:space-y-3 mb-4 sm:mb-6 text-sm sm:text-base">
                {tier.features.map((feature, index) => (
                  <li key={index} className="flex items-start text-gray-600 dark:text-gray-300">
                    <svg className="w-5 h-5 text-green-500 shrink-0 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm leading-tight">{feature}</span>
                  </li>
                ))}
              </ul>
              <button
                className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm sm:text-base ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                onClick={() => tier.priceId && handleSubscribe(tier.priceId)}
                disabled={!tier.priceId || isLoading}
              >
                {isLoading ? localize('com_ui_loading') : localize('com_subscription_subscribe')}
              </button>
              <div className="text-center mt-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {localize('com_subscription_or')}
                </span>
                <a
                  href={tier.name === localize('com_subscription_basic') 
                    ? 'https://boosty.to/aibuddy/purchase/3188277?ssource=DIRECT&share=subscription_link'
                    : tier.name === localize('com_subscription_pro')
                    ? 'https://boosty.to/aibuddy/purchase/1628030?ssource=DIRECT&share=subscription_link'
                    : 'https://boosty.to/aibuddy/purchase/1572088?ssource=DIRECT&share=subscription_link'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block mt-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors underline"
                >
                  <span>{localize('com_subscription_via')}</span>{' '}
                  <span className="font-bold text-orange-500 hover:text-orange-600">
                    {localize('com_subscription_boosty')}
                  </span>
                </a>
              </div>
            </div>
          ))}
        </div>
        
        {/* Cancellation notice */}
        <div className="text-center mt-6 text-sm text-gray-500 dark:text-gray-400">
          {localize('com_subscription_cancel_notice')}
        </div>
      </div>
      <TokenBubble 
        isOpen={showTokenInfo} 
        onClose={() => setShowTokenInfo(false)}
        anchorPosition={tokenBubblePosition}
      />
    </div>
  );

  return createPortal(popupContent, document.body);
};

export default SubscriptionPopup; 