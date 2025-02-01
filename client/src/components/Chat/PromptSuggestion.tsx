import { useEffect, useState, useRef, useCallback } from 'react';
import { useRecoilValue } from 'recoil';
import { motion, AnimatePresence } from 'framer-motion';
import store from '~/store';
import { promptExamples } from '~/data/promptExamples';

// Improved secure random number generation
const getSecureRandom = () => {
  if (typeof window !== 'undefined' && window.crypto) {
    const randArray = new Uint32Array(1);
    window.crypto.getRandomValues(randArray);
    return randArray[0] / (0xffffffff + 1);
  }
  return Math.random();
};

// Multi-pass Fisher-Yates shuffle with entropy
const shuffleArray = <T,>(array: T[], passes = 3): T[] => {
  let shuffled = [...array];
  
  // Multiple passes for better randomization
  for (let pass = 0; pass < passes; pass++) {
    for (let i = shuffled.length - 1; i > 0; i--) {
      // Add entropy by using multiple random values
      const r1 = getSecureRandom();
      const r2 = getSecureRandom();
      const entropy = (r1 + r2) / 2;
      
      const j = Math.floor(entropy * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
  }
  return shuffled;
};

interface PromptHistory {
  prompt: string;
  lastShown: number;
  timesShown: number;
}

export default function PromptSuggestion() {
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [isVisible, setIsVisible] = useState(true);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const lang = useRecoilValue(store.lang);
  const promptQueueRef = useRef<string[]>([]);
  const lastPromptRef = useRef<string>('');
  const intervalRef = useRef<NodeJS.Timeout>();
  const historyRef = useRef<Map<string, PromptHistory>>(new Map());
  
  // Initialize or update prompt history
  const updateHistory = (prompt: string) => {
    const now = Date.now();
    const history = historyRef.current.get(prompt) || {
      prompt,
      lastShown: 0,
      timesShown: 0
    };
    
    history.lastShown = now;
    history.timesShown += 1;
    historyRef.current.set(prompt, history);
  };

  // Calculate weight for prompt based on history
  const getPromptWeight = (prompt: string): number => {
    const history = historyRef.current.get(prompt);
    if (!history) return 1;

    const timeSinceLastShown = Date.now() - history.lastShown;
    const hoursSinceLastShown = timeSinceLastShown / (1000 * 60 * 60);
    
    // Reduce weight for recently shown prompts
    // Weight increases as time passes and decreases with number of shows
    return Math.min(1, (hoursSinceLastShown / 24) * (1 / Math.sqrt(history.timesShown)));
  };

  const getNextPrompt = useCallback(() => {
    const langKey = lang.startsWith('ru') ? 'ru' : 'en';
    
    // Refill queue if needed
    if (promptQueueRef.current.length < 2) {
      const allPrompts = promptExamples.map(p => p[langKey]);
      
      // Sort prompts by weight and add entropy
      const weightedPrompts = allPrompts
        .map(prompt => ({
          prompt,
          weight: getPromptWeight(prompt) * (0.5 + getSecureRandom() * 0.5) // Add randomness to weight
        }))
        .sort((a, b) => b.weight - a.weight);

      // Take top 70% of weighted prompts and shuffle them
      const topPrompts = weightedPrompts
        .slice(0, Math.ceil(weightedPrompts.length * 0.7))
        .map(wp => wp.prompt);

      promptQueueRef.current = shuffleArray(topPrompts);
    }

    // Get next prompt from queue
    let nextPrompt = promptQueueRef.current.pop() as string;
    
    // Ensure we don't repeat the last prompt
    if (nextPrompt === lastPromptRef.current && promptQueueRef.current.length > 0) {
      promptQueueRef.current.unshift(nextPrompt);
      nextPrompt = promptQueueRef.current.pop() as string;
    }

    lastPromptRef.current = nextPrompt;
    updateHistory(nextPrompt);
    return nextPrompt;
  }, [lang]);

  const showNextPrompt = useCallback(() => {
    setIsVisible(false);
    // Reset the interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    setTimeout(() => {
      setCurrentPrompt(getNextPrompt());
      setIsVisible(true);
      // Start a new interval
      intervalRef.current = setInterval(showNextPrompt, 12000);
    }, 1000);
  }, [getNextPrompt]);

  useEffect(() => {
    // Initialize first prompt
    setCurrentPrompt(getNextPrompt());
    intervalRef.current = setInterval(showNextPrompt, 12000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [getNextPrompt, showNextPrompt]);

  // Handle click
  const handleClick = () => {
    showNextPrompt();
  };

  // Handle touch events for swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart) return;

    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;

    // If the swipe is more than 50px, show next prompt
    if (Math.abs(diff) > 50) {
      showNextPrompt();
    }

    setTouchStart(null);
  };

  return (
    <div className="h-24 sm:h-20 relative w-full mb-4">
      <div className="absolute inset-0 flex items-center justify-center px-4 sm:px-8">
        <AnimatePresence>
          {isVisible && (
            <motion.div
              key={currentPrompt}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 0.8, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ 
                duration: 1.2,
                ease: [0.4, 0, 0.2, 1]
              }}
              className="max-w-3xl w-full text-center text-sm text-gray-500 dark:text-gray-400 italic bg-gradient-to-b from-transparent via-white/5 to-white/10 dark:via-black/5 dark:to-black/10 px-6 py-4 rounded-lg backdrop-blur-sm cursor-pointer select-none hover:opacity-100 transition-opacity"
              onClick={handleClick}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              {currentPrompt}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
} 
