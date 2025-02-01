import { useEffect, useState, useRef } from 'react';
import { useRecoilValue } from 'recoil';
import { motion, AnimatePresence } from 'framer-motion';
import store from '~/store';
import { promptExamples } from '~/data/promptExamples';

// Fisher-Yates shuffle algorithm
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export default function PromptSuggestion() {
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [isVisible, setIsVisible] = useState(true);
  const lang = useRecoilValue(store.lang);
  const promptQueueRef = useRef<string[]>([]);
  const lastPromptRef = useRef<string>('');

  useEffect(() => {
    const getNextPrompt = () => {
      const langKey = lang.startsWith('ru') ? 'ru' : 'en';
      
      // If queue is empty, generate a new shuffled queue
      if (promptQueueRef.current.length === 0) {
        promptQueueRef.current = shuffleArray(promptExamples).map(p => p[langKey]);
      }

      // Get next prompt from queue
      let nextPrompt = promptQueueRef.current.pop() as string;
      
      // If we somehow got the same prompt, and we have more options, get another one
      if (nextPrompt === lastPromptRef.current && promptQueueRef.current.length > 0) {
        promptQueueRef.current.unshift(nextPrompt);
        nextPrompt = promptQueueRef.current.pop() as string;
      }

      lastPromptRef.current = nextPrompt;
      return nextPrompt;
    };

    const updatePrompt = () => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentPrompt(getNextPrompt());
        setIsVisible(true);
      }, 500);
    };

    // Initialize first prompt
    setCurrentPrompt(getNextPrompt());
    const interval = setInterval(updatePrompt, 8000);

    return () => clearInterval(interval);
  }, [lang]);

  return (
    <div className="h-16 sm:h-12 relative w-full pointer-events-none">
      <div className="absolute inset-0 flex items-center justify-center px-4 sm:px-8">
        <AnimatePresence mode="wait">
          {isVisible && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 0.8, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ 
                duration: 0.8,
                ease: "easeOut"
              }}
              className="max-w-3xl w-full text-center text-sm text-gray-500 dark:text-gray-400 italic bg-gradient-to-b from-transparent via-white/5 to-white/10 dark:via-black/5 dark:to-black/10 px-6 py-3 rounded-lg backdrop-blur-sm"
            >
              {currentPrompt}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
} 
