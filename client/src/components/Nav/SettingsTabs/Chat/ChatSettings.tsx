import EnterToSend from './EnterToSend';
import EnterToSendMobile from './EnterToSendMobile';

export default function ChatSettings() {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-3 p-3">
        <EnterToSend />
        <EnterToSendMobile />
        {/* ... existing settings ... */}
      </div>
    </div>
  );
} 