import { FC, useState } from 'react';
import useLocalize from '~/hooks/useLocalize';
import SubscriptionPopup from './SubscriptionPopup';

const SubscriptionButton: FC = () => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const localize = useLocalize();

  return (
    <>
      <button
        onClick={() => setIsPopupOpen(true)}
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
      >
        {localize('com_subscription_button')}
      </button>
      
      <SubscriptionPopup 
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
      />
    </>
  );
};

export default SubscriptionButton; 