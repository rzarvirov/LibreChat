import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import useLocalize from '~/hooks/useLocalize';

// Animation variants for the carousel
export const carouselVariants = {
  enter: {
    opacity: 0
  },
  center: {
    opacity: 1
  },
  exit: {
    opacity: 0
  }
};

// Animation configuration
export const animationConfig = {
  swipeConfidenceThreshold: 10000,
  slideInterval: 8000,
  transition: {
    opacity: { duration: 0.8, ease: "easeInOut" }
  },
  titleAnimation: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: "easeOut" }
  },
  bubbleAnimation: {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: {
      duration: 0.4,
      ease: "easeOut"
    }
  },
  dotAnimation: {
    hover: { scale: 1.2 },
    tap: { scale: 0.9 }
  }
};

// Helper functions
export const swipePower = (offset: number, velocity: number) => {
  return Math.abs(offset) * velocity;
};

// ChatBubble Component
export const ChatBubble = ({ 
  message, 
  isAI = false, 
  index = 0, 
  avatar,
  responseImage 
}: { 
  message: string; 
  isAI?: boolean; 
  index?: number;
  avatar?: string;
  responseImage?: string;
}) => (
  <motion.div
    initial={animationConfig.bubbleAnimation.initial}
    animate={animationConfig.bubbleAnimation.animate}
    transition={{
      ...animationConfig.bubbleAnimation.transition,
      delay: isAI ? 1 + index * 0.3 : index * 0.3
    }}
    className="relative"
  >
    {!isAI ? (
      <motion.div className="flex justify-end mb-6">
        <div className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2.5 rounded-2xl max-w-[80%]">
          {avatar && (
            <div className="flex-shrink-0 w-6 h-6 rounded-full overflow-hidden">
              <img src={avatar} alt="User Avatar" className="w-full h-full object-cover" />
            </div>
          )}
          <span className="text-sm">{message}</span>
        </div>
      </motion.div>
    ) : (
      <div>
        <div className="flex justify-start">
          <div className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-4 py-2.5 rounded-2xl max-w-[85%] text-sm relative z-10">
            {message}
          </div>
        </div>
        {responseImage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5 + index * 0.3, duration: 0.6, ease: "easeOut" }}
            className="relative -mt-3 ml-8 w-3/4"
          >
            <div className="relative">
              <div className="rounded-2xl overflow-hidden shadow-lg bg-white dark:bg-gray-800">
                <img 
                  src={responseImage} 
                  alt="Response visualization" 
                  className="w-full h-auto"
                />
              </div>
            </div>
          </motion.div>
        )}
      </div>
    )}
  </motion.div>
);

// Navigation Components
export const NavigationDot = ({ isActive, onClick }: { isActive: boolean; onClick: () => void }) => (
  <motion.button
    whileHover={animationConfig.dotAnimation.hover}
    whileTap={animationConfig.dotAnimation.tap}
    className={`h-2.5 w-2.5 rounded-full transition-colors duration-200 ${
      isActive ? 'bg-green-600 w-4' : 'bg-gray-300 dark:bg-gray-600'
    }`}
    onClick={onClick}
  />
);

// Carousel slide data
export const carouselSlides = [
  {
    title: "com_carousel_title_creative_writing",
    messages: [
      { 
        text: "com_carousel_story_request", 
        isAI: false,
        avatar: "/assets/carousel/avatars/writer.png"
      },
      { 
        text: "com_carousel_story_response", 
        isAI: true,
        avatar: "/assets/carousel/avatars/writer.png",
        responseImage: "/assets/carousel/responses/story.png"
      },
    ],
  },
  {
    title: "com_carousel_title_problem_solving",
    messages: [
      { 
        text: "com_carousel_business_request", 
        isAI: false,
        avatar: "/assets/carousel/avatars/analyst.png"
      },
      { 
        text: "com_carousel_business_response", 
        isAI: true,
        avatar: "/assets/carousel/avatars/analyst.png",
        responseImage: "/assets/carousel/responses/funnel.png"
      },
    ],
  },
  {
    title: "com_carousel_title_fitness_coach",
    messages: [
      { 
        text: "com_carousel_fitness_request", 
        isAI: false,
        avatar: "/assets/carousel/avatars/trainer.png"
      },
      { 
        text: "com_carousel_fitness_response", 
        isAI: true,
        avatar: "/assets/carousel/avatars/trainer.png",
        responseImage: "/assets/carousel/responses/workout.png"
      },
    ],
  },
  {
    title: "com_carousel_title_code_assistant",
    messages: [
      { 
        text: "com_carousel_code_request", 
        isAI: false,
        avatar: "/assets/carousel/avatars/developer.png"
      },
      { 
        text: "com_carousel_code_response", 
        isAI: true,
        avatar: "/assets/carousel/avatars/developer.png",
        responseImage: "/assets/carousel/responses/performance.png"
      },
    ],
  },
];

// Hook for carousel state management
export const useCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [[page, direction], setPage] = useState([0, 0]);

  const paginate = (newDirection: number) => {
    const newPage = page + newDirection;
    const wrappedPage = ((newPage % carouselSlides.length) + carouselSlides.length) % carouselSlides.length;
    setPage([wrappedPage, newDirection]);
    setCurrentSlide(wrappedPage);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      paginate(1);
    }, animationConfig.slideInterval);
    return () => clearInterval(timer);
  }, [page]);

  return {
    currentSlide,
    page,
    direction,
    paginate,
    setPage,
    setCurrentSlide
  };
};

// Carousel Component
export const Carousel = () => {
  const { currentSlide, page, direction, paginate, setPage, setCurrentSlide } = useCarousel();
  const localize = useLocalize();

  const getLocalizedText = (key: string) => {
    const localizedText = localize(key);
    // If the key is returned as is, it means no translation was found
    return localizedText === key ? key.split('.').pop() || key : localizedText;
  };

  return (
    <div className="relative h-full w-full">
      {/* Backing element with sharp corners */}
      <div className="absolute inset-x-4 md:inset-x-8 inset-y-0 bg-gray-50 dark:bg-gray-800/50 rounded-2xl"></div>
      
      {/* Carousel content */}
      <div className="relative mx-4 md:mx-8 h-full">
        <div className="h-full w-full overflow-hidden rounded-xl bg-white/10 dark:bg-black/10 p-6 pb-16 md:p-8 md:pb-16">
          <div className="h-full flex flex-col justify-center">
            <motion.h3 
              initial={animationConfig.titleAnimation.initial}
              animate={animationConfig.titleAnimation.animate}
              transition={animationConfig.titleAnimation.transition}
              className="mb-8 text-2xl font-semibold text-gray-800 dark:text-white"
            >
              {getLocalizedText(carouselSlides[currentSlide].title)}
            </motion.h3>

            <motion.div
              key={page}
              variants={carouselVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={animationConfig.transition}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={1}
              onDragEnd={(e, { offset, velocity }) => {
                const swipe = swipePower(offset.x, velocity.x);
                if (swipe < -animationConfig.swipeConfidenceThreshold) {
                  paginate(1);
                } else if (swipe > animationConfig.swipeConfidenceThreshold) {
                  paginate(-1);
                }
              }}
              className="flex-1 min-h-0 -mx-2 px-2 flex items-center"
            >
              <div className="w-full">
                <div className="space-y-6">
                  {carouselSlides[currentSlide].messages.map((message, idx) => (
                    <ChatBubble 
                      key={`${currentSlide}-${idx}`}
                      message={getLocalizedText(message.text)} 
                      isAI={message.isAI} 
                      index={idx}
                      avatar={message.avatar}
                      responseImage={message.responseImage}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Navigation dots */}
          <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
            {carouselSlides.map((_, idx) => (
              <NavigationDot
                key={idx}
                isActive={currentSlide === idx}
                onClick={() => {
                  const direction = idx > currentSlide ? 1 : -1;
                  setPage([idx, direction]);
                  setCurrentSlide(idx);
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}; 