import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useLocalize } from '~/hooks';
import { useAuthContext } from '~/hooks/AuthContext';
import { useRecoilValue } from 'recoil';
import store from '~/store';
import ReactMarkdown from 'react-markdown';

interface News {
  _id: string;
  title: {
    en: string;
    ru: string;
  };
  content: {
    en: string;
    ru: string;
  };
}

export default function NewsAlert() {
  const [news, setNews] = useState<News | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const { user } = useAuthContext();
  const localize = useLocalize();
  const lang = useRecoilValue(store.lang);

  // Determine language based on the actual language code
  const contentLang = lang.startsWith('ru') ? 'ru' : 'en';

  useEffect(() => {
    if (!user?.id) return;

    // Fetch latest news for the user
    fetch(`/api/news/latest/${user.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          setNews(data);
          setIsVisible(true);
        }
      })
      .catch((err) => {
        console.error('Error fetching news:', err);
      });
  }, [user?.id]);

  const handleDismiss = async () => {
    if (!news || !user?.id) return;

    try {
      await fetch('/api/news/viewed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          newsId: news._id,
        }),
      });
    } catch (err) {
      console.error('Error marking news as viewed:', err);
    }

    setIsVisible(false);
  };

  if (!isVisible || !news) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop overlay with blur - clicking it will dismiss */}
      <div 
        className="fixed inset-0 bg-black/20 backdrop-blur-[2px] transition-opacity" 
        onClick={handleDismiss}
      />

      {/* Dialog positioning */}
      <div className="flex min-h-full items-center justify-center p-4 text-center">
        <div 
          className="
            w-full max-w-xl transform 
            transition-all duration-300 ease-out
            animate-in fade-in zoom-in-95 slide-in-from-bottom-4
            opacity-100
          "
        >
          <div 
            className="
              relative overflow-hidden rounded-lg 
              bg-white dark:bg-gray-800
              border border-gray-200 dark:border-gray-700
              shadow-xl
              p-6
            "
            onClick={(e) => e.stopPropagation()} // Prevent clicks inside dialog from dismissing
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-full">
                <h3 className="text-lg font-semibold leading-6 text-gray-900 dark:text-gray-100 mb-2">
                  <ReactMarkdown>{news.title[contentLang]}</ReactMarkdown>
                </h3>
                <div className="mt-2">
                  <div className="prose prose-sm dark:prose-invert max-w-none text-left text-gray-600 dark:text-gray-300">
                    <ReactMarkdown>{news.content[contentLang]}</ReactMarkdown>
                  </div>
                </div>
              </div>
              <div className="mt-5">
                <button
                  type="button"
                  onClick={handleDismiss}
                  className="
                    inline-flex justify-center rounded-md 
                    bg-green-600 dark:bg-green-700 px-4 py-2
                    text-sm font-semibold text-gray-100 dark:text-gray-100
                    hover:bg-green-500 dark:hover:bg-green-600
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500
                    focus-visible:ring-offset-2 transition-colors
                  "
                >
                  {localize('com_ui_dismiss')}
                </button>
              </div>
            </div>

            {/* Close button in the corner */}
            <button
              type="button"
              onClick={handleDismiss}
              className="
                absolute right-4 top-4
                text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400
                focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2
              "
            >
              <span className="sr-only">{localize('com_ui_dismiss')}</span>
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 