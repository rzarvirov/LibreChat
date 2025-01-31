import { useRecoilValue } from 'recoil';
import { useState, useEffect } from 'react';
import { useAuthContext } from '~/hooks/AuthContext';
import useLocalize from '~/hooks/useLocalize';
import store from '~/store';
import SubscriptionPopup from '../Subscription/SubscriptionPopup';

interface ExtendedUser {
  subscriptionTier?: string;
}

function CountdownTimer({ onExpired, lang }: { onExpired: () => void; lang: string }) {
  const [timeLeft, setTimeLeft] = useState('');
  const localize = useLocalize();

  useEffect(() => {
    const targetDate = new Date('2025-02-05T23:59:59');

    const calculateTimeLeft = () => {
      const now = new Date();
      const difference = targetDate.getTime() - now.getTime();

      if (difference <= 0) {
        onExpired();
        return '00:00:00';
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      const parts = [
        { value: days, label: lang === 'ru-RU' ? 'д' : 'd' },
        { value: hours, label: lang === 'ru-RU' ? 'ч' : 'h' },
        { value: minutes, label: lang === 'ru-RU' ? 'м' : 'm' },
        { value: seconds, label: lang === 'ru-RU' ? 'с' : 's' }
      ].map(({ value, label }) => `${value.toString().padStart(2, '0')}${label}`);

      return parts.join(' ');
    };

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    setTimeLeft(calculateTimeLeft());

    return () => clearInterval(timer);
  }, [onExpired, lang]);

  return timeLeft;
}

export default function PromoBanner() {
  const lang = useRecoilValue(store.lang);
  const localize = useLocalize();
  const [isVisible, setIsVisible] = useState(true);
  const [isExpired, setIsExpired] = useState(false);
  const [showSubscriptionPopup, setShowSubscriptionPopup] = useState(false);
  const { user } = useAuthContext();
  const extendedUser = user as ExtendedUser;

  // Don't show banner if:
  // 1. Banner was dismissed
  // 2. Timer expired
  // 3. User is not on FREE tier
  if (
    !isVisible || 
    isExpired || 
    (extendedUser?.subscriptionTier && extendedUser.subscriptionTier !== 'FREE')
  ) {
    return null;
  }

  const handleDismiss = () => {
    setIsVisible(false);
  };

  const handleExpired = () => {
    setIsExpired(true);
  };

  const handlePromoClick = () => {
    if (lang === 'ru-RU') {
      window.open('https://boosty.to/aibuddy/subscription-level/1628030/promo/84163?linkId=5bc49dc3f2d7118b794c1f712a43b676', '_blank');
    } else {
      setShowSubscriptionPopup(true);
    }
  };

  const isRussian = lang === 'ru-RU';

  return (
    <>
      <div className="relative flex flex-col items-center py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-center">
        <button
          type="button"
          className="absolute right-2 top-2 text-white/80 hover:text-white transition-colors"
          onClick={handleDismiss}
        >
          <span className="sr-only">{isRussian ? 'Закрыть' : 'Close'}</span>
          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
          </svg>
        </button>
        
        <div className="flex items-center gap-2 text-lg font-medium">
          <span>🎁</span>
          <span>{isRussian ? 'Специальное предложение!' : 'Special Offer!'}</span>
        </div>
        
        <div className="mt-1 text-sm">
          {isRussian ? 'До конца акции: ' : 'Offer ends in: '}
          <span className="font-mono"><CountdownTimer onExpired={handleExpired} lang={lang} /></span>
        </div>
        
        <div className="mt-1 text-sm">
          {isRussian ? 'Дарим PRO доступ на 30 дней' : 'Get 30 days of PRO access with code: 30DAYS'}
        </div>

        <button
          onClick={handlePromoClick}
          className="mt-2 inline-block rounded-full bg-white/10 hover:bg-white/20 px-6 py-1.5 text-sm font-medium text-white transition-colors"
        >
          {isRussian ? 'Получить PRO доступ' : 'Get PRO Access'}
        </button>
      </div>

      <SubscriptionPopup 
        isOpen={showSubscriptionPopup}
        onClose={() => setShowSubscriptionPopup(false)}
      />
    </>
  );
} 
