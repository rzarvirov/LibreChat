import { useRecoilValue } from 'recoil';
import { useState, useEffect } from 'react';
import { useAuthContext } from '~/hooks/AuthContext';
import store from '~/store';

interface ExtendedUser {
  subscriptionTier?: string;
}

function CountdownTimer({ onExpired }: { onExpired: () => void }) {
  const [timeLeft, setTimeLeft] = useState('');

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
        { value: days, label: 'д' },
        { value: hours, label: 'ч' },
        { value: minutes, label: 'м' },
        { value: seconds, label: 'с' }
      ].map(({ value, label }) => `${value.toString().padStart(2, '0')}${label}`);

      return parts.join(' ');
    };

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    setTimeLeft(calculateTimeLeft());

    return () => clearInterval(timer);
  }, [onExpired]);

  return timeLeft;
}

export default function PromoBanner() {
  const lang = useRecoilValue(store.lang);
  const [isVisible, setIsVisible] = useState(true);
  const [isExpired, setIsExpired] = useState(false);
  const { user } = useAuthContext();
  const extendedUser = user as ExtendedUser;

  // Don't show banner if:
  // 1. Not Russian locale
  // 2. Banner was dismissed
  // 3. Timer expired
  // 4. User is not on FREE tier
  if (
    lang !== 'ru-RU' || 
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

  return (
    <div className="relative flex flex-col items-center py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-center">
      <button
        type="button"
        className="absolute right-2 top-2 text-white/80 hover:text-white transition-colors"
        onClick={handleDismiss}
      >
        <span className="sr-only">Закрыть</span>
        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
        </svg>
      </button>
      
      <div className="flex items-center gap-2 text-lg font-medium">
        <span>🎁</span>
        <span>Специальное предложение!</span>
      </div>
      
      <div className="mt-1 text-sm">
        До конца акции: <span className="font-mono"><CountdownTimer onExpired={handleExpired} /></span>
      </div>
      
      <div className="mt-1 text-sm">
        Дарим PRO доступ на 30 дней
      </div>

      <a
        href="https://boosty.to/aibuddy/subscription-level/1628030/promo/84163?linkId=5bc49dc3f2d7118b794c1f712a43b676"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 inline-block rounded-full bg-white/10 hover:bg-white/20 px-6 py-1.5 text-sm font-medium text-white transition-colors"
      >
        Получить PRO доступ
      </a>
    </div>
  );
} 
