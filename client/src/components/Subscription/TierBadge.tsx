import { FC } from 'react';

interface TierBadgeProps {
  tier: string;
  onClick?: () => void;
}

const TierBadge: FC<TierBadgeProps> = ({ tier, onClick }) => {
  const isFree = tier === 'FREE';
  
  const formatTier = (tier: string) => {
    switch (tier.toUpperCase()) {
      case 'FREE':
        return 'free';
      case 'BASIC':
        return 'basic';
      case 'PRO':
        return 'pro';
      case 'PROPLUS':
        return 'pro+';
      default:
        return tier.toLowerCase();
    }
  };

  return (
    <button
      onClick={onClick}
      className={`
        inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
        ${isFree 
          ? 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600' 
          : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900 dark:text-yellow-300 dark:hover:bg-yellow-800'
        }
        transition-colors cursor-pointer
      `}
    >
      {formatTier(tier)}
    </button>
  );
};

export default TierBadge; 