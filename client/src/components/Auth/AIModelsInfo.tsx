import { useLocalize } from '~/hooks';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type FAQItemProps = {
  title: string;
  content: string;
  isOpen: boolean;
  isDefault?: boolean;
  onClick: () => void;
};

const FAQItem = ({ title, content, isOpen, onClick }: FAQItemProps) => {
  return (
    <div className="border-b border-gray-200 dark:border-gray-700">
      <button
        className="w-full py-6 text-left flex justify-between items-center focus:outline-none"
        onClick={onClick}
      >
        <h4 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h4>
        <motion.span 
          className="ml-6 flex-shrink-0"
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <svg className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12M6 12h12" />
          </svg>
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ 
              height: "auto",
              opacity: 1,
              transition: {
                height: {
                  duration: 0.3,
                  ease: "easeOut"
                },
                opacity: {
                  duration: 0.2,
                  delay: 0.1
                }
              }
            }}
            exit={{ 
              height: 0,
              opacity: 0,
              transition: {
                height: {
                  duration: 0.3,
                  ease: "easeIn"
                },
                opacity: {
                  duration: 0.2
                }
              }
            }}
            className="overflow-hidden"
          >
            <div className="pb-6">
              <motion.p 
                className="text-gray-600 dark:text-gray-300"
                initial={{ y: 10 }}
                animate={{ y: 0 }}
                exit={{ y: 10 }}
              >
                {content}
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ModelCard = ({ title, description, logo }: { title: string; description: string; logo: string }) => (
  <div className="bg-white/80 dark:bg-gray-700/80 p-6 rounded-lg shadow-sm">
    <div className="flex items-center gap-3 mb-4">
      <img 
        src={`/assets/model-logos/${logo}`} 
        alt={`${title} logo`}
        className="w-8 h-8 object-contain"
      />
      <h4 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h4>
    </div>
    <p className="text-gray-600 dark:text-gray-300">
      {description}
    </p>
  </div>
);

const AIModelsInfo = () => {
  const localize = useLocalize();
  const [openFAQ, setOpenFAQ] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      
      // Show when scrolled 20% of the page
      const showThreshold = windowHeight * 0.2;
      
      if (scrollPosition > showThreshold) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const modelItems = [
    {
      title: "ChatGPT",
      description: localize('com_model_chatgpt_description'),
      logo: "chatgpt.webp"
    },
    {
      title: "Google Gemini",
      description: localize('com_model_gemini_description'),
      logo: "gemini.webp"
    },
    {
      title: "Claude",
      description: localize('com_model_claude_description'),
      logo: "claude.webp"
    },
    {
      title: "DeepSeek",
      description: localize('com_model_deepseek_description'),
      logo: "deepseek.png"
    }
  ];

  const faqItems = [
    {
      title: localize('com_faq_what_is'),
      content: localize('com_faq_what_is_content')
    },
    {
      title: localize('com_faq_what_use'),
      content: localize('com_faq_what_use_content')
    },
    {
      title: localize('com_faq_how_much'),
      content: localize('com_faq_how_much_content')
    }
  ];

  return (
    <motion.div 
      className="relative w-full"
      initial={{ opacity: 0, y: 100 }}
      animate={{ 
        opacity: isVisible ? 1 : 0,
        y: isVisible ? 0 : 100,
        transition: {
          duration: 0.5,
          ease: "easeOut"
        }
      }}
    >
      {/* Backing element with sharp corners */}
      <div className="absolute inset-x-4 md:inset-x-8 inset-y-0 bg-gray-50 dark:bg-gray-800/50 rounded-2xl"></div>
      
      {/* Main content */}
      <div className="relative mx-4 md:mx-8 h-full">
        <div className="h-full w-full overflow-hidden rounded-xl bg-white/10 dark:bg-black/10 p-6 md:p-8">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
              {localize('com_aibuddy_title')}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
              <div>
                <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  {localize('com_aibuddy_why_choose')}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {localize('com_aibuddy_why_choose_content')}
                </p>
              </div>
              <div>
                <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  {localize('com_aibuddy_power_choice')}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {localize('com_aibuddy_power_choice_content')}
                </p>
              </div>
            </div>

            <div className="space-y-12">
              <h3 className="text-2xl font-semibold text-center text-gray-900 dark:text-white mb-8">
                {localize('com_aibuddy_featured_models')}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {modelItems.map((item, index) => (
                  <ModelCard
                    key={index}
                    title={item.title}
                    description={item.description}
                    logo={item.logo}
                  />
                ))}
              </div>
            </div>

            <div className="mt-16">
              <h3 className="text-2xl font-semibold text-center text-gray-900 dark:text-white mb-8">
                {localize('com_aibuddy_faq')}
              </h3>
              
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {faqItems.map((item, index) => (
                  <FAQItem
                    key={index}
                    title={item.title}
                    content={item.content}
                    isOpen={openFAQ === index}
                    onClick={() => setOpenFAQ(openFAQ === index ? -1 : index)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AIModelsInfo; 