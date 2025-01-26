import { useRecoilState } from 'recoil';
import * as Select from '@ariakit/react/select';
import { Fragment, useState, memo } from 'react';
import { FileText, LogOut, Coins } from 'lucide-react';
import { useGetUserBalance, useGetStartupConfig } from 'librechat-data-provider/react-query';
import { LinkIcon, GearIcon, DropdownMenuSeparator } from '~/components';
import FilesView from '~/components/Chat/Input/Files/FilesView';
import SubscriptionManagePopup from '~/components/Subscription/SubscriptionManagePopup';
import SubscriptionPopup from '~/components/Subscription/SubscriptionPopup';
import TokenBubble from '~/components/Common/TokenBubble';
import { useAuthContext } from '~/hooks/AuthContext';
import useAvatar from '~/hooks/Messages/useAvatar';
import { UserIcon } from '~/components/svg';
import { useLocalize } from '~/hooks';
import Settings from './Settings';
import store from '~/store';
import TierBadge from '~/components/Subscription/TierBadge';

interface ExtendedUser {
  subscriptionTier?: string;
  subscriptionStatus?: string;
  subscriptionEndDate?: string;
  subscriptionCanceled?: boolean;
}

function AccountSettings() {
  const localize = useLocalize();
  const { user, isAuthenticated, logout } = useAuthContext();
  const extendedUser = user as ExtendedUser;
  const { data: startupConfig } = useGetStartupConfig();
  const balanceQuery = useGetUserBalance({
    enabled: !!isAuthenticated && startupConfig?.checkBalance,
  });
  const [showSettings, setShowSettings] = useState(false);
  const [showFiles, setShowFiles] = useRecoilState(store.showFiles);
  const [showSubscriptionManage, setShowSubscriptionManage] = useState(false);
  const [showSubscriptionPlans, setShowSubscriptionPlans] = useState(false);
  const [showTokenInfo, setShowTokenInfo] = useState(false);
  const [tokenBubblePosition, setTokenBubblePosition] = useState({ x: 0, y: 0 });

  const avatarSrc = useAvatar(user);
  const name = user?.avatar ?? user?.username ?? '';

  const handleSubscriptionClick = () => {
    if (extendedUser?.subscriptionTier === 'FREE') {
      setShowSubscriptionPlans(true);
    } else {
      setShowSubscriptionManage(true);
    }
  };

  const handleTokenIconClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setTokenBubblePosition({
      x: rect.left + rect.width / 2,
      y: rect.top
    });
    setShowTokenInfo(!showTokenInfo);
  };

  return (
    <Select.SelectProvider>
      <Select.Select
        aria-label={localize('com_nav_account_settings')}
        data-testid="nav-user"
        className="mt-text-sm flex h-auto w-full items-center gap-2 rounded-xl p-2 text-sm transition-colors duration-200 hover:bg-surface-hover"
      >
        <div className="-ml-0.9 -mt-0.8 h-8 w-8 flex-shrink-0">
          <div className="relative flex">
            {name.length === 0 ? (
              <div
                style={{
                  backgroundColor: 'rgb(121, 137, 255)',
                  width: '32px',
                  height: '32px',
                  boxShadow: 'rgba(240, 246, 252, 0.1) 0px 0px 0px 1px',
                }}
                className="relative flex items-center justify-center rounded-full p-1 text-text-primary"
                aria-hidden="true"
              >
                <UserIcon />
              </div>
            ) : (
              <img
                className="rounded-full"
                src={(user?.avatar ?? '') || avatarSrc}
                alt={`${name}'s avatar`}
              />
            )}
          </div>
        </div>
        <div
          className="mt-2 grow overflow-hidden text-ellipsis whitespace-nowrap text-left text-text-primary"
          style={{ marginTop: '0', marginLeft: '0' }}
        >
          <div className="flex items-center gap-2">
            <span>{user?.name ?? user?.username ?? localize('com_nav_user')}</span>
            {extendedUser?.subscriptionTier && (
              <TierBadge tier={extendedUser.subscriptionTier} onClick={handleSubscriptionClick} />
            )}
          </div>
        </div>
      </Select.Select>
      {startupConfig?.checkBalance === true &&
        balanceQuery.data != null &&
        !isNaN(parseFloat(balanceQuery.data)) && (
          <div 
            className="flex w-full cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-sm text-token-text-secondary transition-colors duration-200 hover:bg-surface-hover hover:text-text-primary" 
            role="button"
            onClick={handleSubscriptionClick}
          >
            <div 
              onClick={handleTokenIconClick}
              className="cursor-help rounded-lg p-1 hover:bg-surface-tertiary"
            >
              <Coins className="w-4 h-4 text-yellow-500" />
            </div>
            <span className="underline-offset-2">
              {localize('com_subscription_balance')}: {parseFloat(balanceQuery.data).toLocaleString('en-US', { maximumFractionDigits: 0 })}
            </span>
          </div>
        )}
      <Select.SelectPopover
        className="popover-ui w-[235px]"
        style={{
          transformOrigin: 'bottom',
          marginRight: '0px',
          translate: '0px',
        }}
      >
        <div className="text-token-text-secondary ml-3 mr-2 py-2 text-sm" role="note">
          {user?.email ?? localize('com_nav_user')}
        </div>
        <DropdownMenuSeparator />
        <Select.SelectItem
          value=""
          onClick={() => setShowFiles(true)}
          className="select-item text-sm"
        >
          <FileText className="icon-md" aria-hidden="true" />
          {localize('com_nav_my_files')}
        </Select.SelectItem>
        {startupConfig?.helpAndFaqURL !== '/' && (
          <Select.SelectItem
            value=""
            onClick={() => window.open(startupConfig?.helpAndFaqURL, '_blank')}
            className="select-item text-sm"
          >
            <LinkIcon aria-hidden="true" />
            {localize('com_nav_help_faq')}
          </Select.SelectItem>
        )}
        <Select.SelectItem
          value=""
          onClick={() => setShowSettings(true)}
          className="select-item text-sm"
        >
          <GearIcon className="icon-md" aria-hidden="true" />
          {localize('com_nav_settings')}
        </Select.SelectItem>
        <DropdownMenuSeparator />
        <Select.SelectItem
          aria-selected={true}
          onClick={() => logout()}
          value="logout"
          className="select-item text-sm"
        >
          <LogOut className="icon-md" />
          {localize('com_nav_log_out')}
        </Select.SelectItem>
      </Select.SelectPopover>
      {showFiles && <FilesView open={showFiles} onOpenChange={setShowFiles} />}
      {showSettings && <Settings open={showSettings} onOpenChange={setShowSettings} />}
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
      {showSubscriptionPlans && (
        <SubscriptionPopup
          isOpen={showSubscriptionPlans}
          onClose={() => setShowSubscriptionPlans(false)}
        />
      )}
      <TokenBubble 
        isOpen={showTokenInfo} 
        onClose={() => setShowTokenInfo(false)}
        anchorPosition={tokenBubblePosition}
      />
    </Select.SelectProvider>
  );
}

export default memo(AccountSettings);
