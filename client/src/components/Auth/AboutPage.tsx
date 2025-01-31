import { useNavigate } from 'react-router-dom';
import { useLocalize } from '~/hooks';
import { Carousel } from './animations/CarouselAnimations';
import AIModelsInfo from './AIModelsInfo';
import ScrollIndicator from './ScrollIndicator';

const AboutPage = () => {
  const navigate = useNavigate();
  const localize = useLocalize();

  const CallToAction = ({ className = '' }: { className?: string }) => (
    <div className={`flex justify-center ${className}`}>
      <button
        onClick={() => navigate('/c/new')}
        className="px-8 py-4 bg-green-600 text-white text-lg font-semibold rounded-lg hover:bg-green-700 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-transform"
      >
        {localize('com_ui_about_cta')}
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-16">
        <h1 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-8">
          {localize('com_ui_about_title')}
        </h1>
        
        <CallToAction />
        
        <div className="h-[600px]">
          <Carousel />
        </div>

        <section>
          <h2 className="text-3xl font-semibold text-center text-gray-800 dark:text-gray-200 mb-8">
            {localize('com_ui_about_models_title')}
          </h2>
          <AIModelsInfo />
        </section>

        <CallToAction className="mt-16" />
      </div>
      <ScrollIndicator />
    </div>
  );
};

export default AboutPage; 
