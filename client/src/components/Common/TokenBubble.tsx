import { FC, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Brain, MessageSquare, Image } from 'lucide-react';
import { useLocalize } from '~/hooks';

interface TokenBubbleProps {
  isOpen: boolean;
  onClose: () => void;
  anchorPosition: { x: number; y: number };
}

const TokenBubble: FC<TokenBubbleProps> = ({ isOpen, onClose, anchorPosition }) => {
  const localize = useLocalize();
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [arrowOffset, setArrowOffset] = useState(0);

  useEffect(() => {
    if (!isOpen) return;

    const bubbleWidth = 288; // w-72 = 18rem = 288px
    const bubbleHeight = 220; // approximate height of the bubble
    const margin = 20; // minimum margin from viewport edges
    const arrowOffset = 16; // distance arrow can move from center

    let x = anchorPosition.x;
    let y = anchorPosition.y;
    let newArrowOffset = 0;

    // Handle horizontal positioning
    const maxX = window.innerWidth - margin;
    const minX = margin;
    const halfWidth = bubbleWidth / 2;

    if (x - halfWidth < minX) {
      newArrowOffset = (x - halfWidth - minX);
      x = minX + halfWidth;
    } else if (x + halfWidth > maxX) {
      newArrowOffset = (x + halfWidth - maxX);
      x = maxX - halfWidth;
    }

    // Handle vertical positioning
    const spaceAbove = anchorPosition.y;
    const spaceBelow = window.innerHeight - anchorPosition.y;

    // If not enough space above, show below
    if (spaceAbove < bubbleHeight + margin && spaceBelow > bubbleHeight + margin) {
      y = anchorPosition.y + 20; // Show below with margin
      setPosition({ x, y: y + margin });
    } else {
      // Show above (default)
      setPosition({ x, y });
    }

    // Clamp arrow offset
    setArrowOffset(Math.max(-arrowOffset, Math.min(arrowOffset, newArrowOffset)));
  }, [isOpen, anchorPosition]);

  if (!isOpen) return null;

  const content = (
    <>
      {/* Backdrop for closing when clicking outside */}
      <div 
        className="fixed inset-0 z-[100]" 
        onClick={onClose}
      />
      
      {/* Bubble container */}
      <div 
        className="fixed z-[101] w-72"
        style={{ 
          left: `${position.x}px`,
          top: `${position.y}px`,
          transform: 'translate(-50%, calc(-100% - 20px))'
        }}
      >
        <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 border border-gray-200 dark:border-gray-600">
          {/* Arrow */}
          <div 
            className="absolute -bottom-2 w-4 h-4 rotate-45 bg-white dark:bg-gray-800 border-r border-b border-gray-200 dark:border-gray-600"
            style={{
              left: `calc(50% - 8px + ${arrowOffset}px)`,
            }}
          />
          
          {/* Content */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
              {localize('com_token_what_are_tokens')}
            </h3>
            
            {/* Token explanation items */}
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <Brain className="w-8 h-8 text-blue-500 mt-1" />
                <p className="text-xs text-gray-600 dark:text-gray-300">
                  {localize('com_token_explanation_brain')}
                </p>
              </div>
              
              <div className="flex items-start gap-2">
                <MessageSquare className="w-8 h-8 text-green-500 mt-1" />
                <p className="text-xs text-gray-600 dark:text-gray-300">
                  {localize('com_token_explanation_chat')}
                </p>
              </div>
              
              <div className="flex items-start gap-2">
                <Image className="w-8 h-8 text-purple-500 mt-1" />
                <p className="text-xs text-gray-600 dark:text-gray-300">
                  {localize('com_token_explanation_image')}
                </p>
              </div>
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </>
  );

  return createPortal(content, document.body);
};

export default TokenBubble; 