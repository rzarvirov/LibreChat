import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const ScrollIndicator = () => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      
      // Hide when scrolled 10% of the page
      const hideThreshold = windowHeight * 0.1;
      
      if (scrollPosition > hideThreshold) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.div
      className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-20 hidden md:block"
      initial={{ opacity: 1 }}
      animate={{ 
        opacity: isVisible ? 1 : 0,
        y: isVisible ? [0, -10, 0] : 0,
      }}
      transition={{
        y: {
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut"
        },
        opacity: {
          duration: 0.3
        }
      }}
    >
      <button 
        className="p-2 rounded-full bg-white/80 dark:bg-gray-800/80 shadow-lg hover:bg-white dark:hover:bg-gray-700 transition-colors"
        onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
        aria-label="Scroll down"
      >
        <svg 
          className="w-6 h-6 text-gray-600 dark:text-gray-300" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M19 14l-7 7m0 0l-7-7m7 7V3" 
          />
        </svg>
      </button>
    </motion.div>
  );
};

export default ScrollIndicator; 