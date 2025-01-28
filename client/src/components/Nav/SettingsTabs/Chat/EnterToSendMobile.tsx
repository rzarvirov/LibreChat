import { useRecoilState } from 'recoil';
import HoverCardSettings from '../HoverCardSettings';
import { Switch } from '~/components/ui/Switch';
import useLocalize from '~/hooks/useLocalize';
import store from '~/store';

export default function SendMessageKeyEnterMobile({
  onCheckedChange,
}: {
  onCheckedChange?: (value: boolean) => void;
}) {
  const [enterToSendMobile, setEnterToSendMobile] = useRecoilState<boolean>(store.enterToSendMobile);
  const localize = useLocalize();

  const handleCheckedChange = (value: boolean) => {
    setEnterToSendMobile(value);
    if (onCheckedChange) {
      onCheckedChange(value);
    }
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <div>{localize('com_nav_enter_to_send_mobile')}</div>
        <HoverCardSettings side="bottom" text="com_nav_info_enter_to_send_mobile" />
      </div>
      <Switch
        id="enterToSendMobile"
        checked={enterToSendMobile}
        onCheckedChange={handleCheckedChange}
        className="ml-4"
        data-testid="enterToSendMobile"
      />
    </div>
  );
} 