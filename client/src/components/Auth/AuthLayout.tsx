import { useLocalize } from '~/hooks';
import { BlinkAnimation } from './BlinkAnimation';
import { TStartupConfig } from 'librechat-data-provider';
import SocialLoginRender from './SocialLoginRender';
import { ThemeSelector } from '~/components/ui';
import { Banner } from '../Banners';
import Footer from './Footer';
import { motion, Variants } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Carousel } from './animations/CarouselAnimations';

// Typewriter component implementation
const Typewriter = ({
  text,
  speed = 50,
  initialDelay = 0,
  waitTime = 2000,
  deleteSpeed = 30,
  loop = true,
  className,
  showCursor = true,
  hideCursorOnType = false,
  cursorChar = "|",
  cursorClassName = "ml-1",
  cursorAnimationVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        duration: 0.01,
        repeat: Infinity,
        repeatDelay: 0.4,
        repeatType: "mirror",
      },
    },
  } as Variants,
}) => {
  const [displayText, setDisplayText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);

  const texts = Array.isArray(text) ? text : [text];

  useEffect(() => {
    let timeout;

    const currentText = texts[currentTextIndex];

    const startTyping = () => {
      if (isDeleting) {
        if (displayText === "") {
          setIsDeleting(false);
          if (currentTextIndex === texts.length - 1 && !loop) {
            return;
          }
          setCurrentTextIndex((prev) => (prev + 1) % texts.length);
          setCurrentIndex(0);
          timeout = setTimeout(() => {}, waitTime);
        } else {
          timeout = setTimeout(() => {
            setDisplayText((prev) => prev.slice(0, -1));
          }, deleteSpeed);
        }
      } else {
        if (currentIndex < currentText.length) {
          timeout = setTimeout(() => {
            setDisplayText((prev) => prev + currentText[currentIndex]);
            setCurrentIndex((prev) => prev + 1);
          }, speed);
        } else if (texts.length > 1) {
          timeout = setTimeout(() => {
            setIsDeleting(true);
          }, waitTime);
        }
      }
    };

    if (currentIndex === 0 && !isDeleting && displayText === "") {
      timeout = setTimeout(startTyping, initialDelay);
    } else {
      startTyping();
    }

    return () => clearTimeout(timeout);
  }, [currentIndex, displayText, isDeleting, speed, deleteSpeed, waitTime, texts, currentTextIndex, loop]);

  return (
    <div className={`inline whitespace-pre-wrap tracking-tight ${className}`}>
      <span>{displayText}</span>
      {showCursor && (
        <motion.span
          variants={cursorAnimationVariants}
          className={`${cursorClassName} ${
            hideCursorOnType &&
            (currentIndex < texts[currentTextIndex].length || isDeleting)
              ? "hidden"
              : ""
          }`}
          initial="initial"
          animate="animate"
        >
          {cursorChar}
        </motion.span>
      )}
    </div>
  );
};

const ErrorRender = ({ children }: { children: React.ReactNode }) => (
  <div className="mt-16 flex justify-center">
    <div
      role="alert"
      aria-live="assertive"
      className="rounded-md border border-red-500 bg-red-500/10 px-3 py-2 text-sm text-gray-600 dark:text-gray-200"
    >
      {children}
    </div>
  </div>
);

function AuthLayout({
  children,
  header,
  isFetching,
  startupConfig,
  startupConfigError,
  pathname,
  error,
}: {
  children: React.ReactNode;
  header: React.ReactNode;
  isFetching: boolean;
  startupConfig: TStartupConfig | null | undefined;
  startupConfigError: unknown | null | undefined;
  pathname: string;
  error: string | null;
}) {
  const localize = useLocalize();

  const hasStartupConfigError = startupConfigError !== null && startupConfigError !== undefined;
  const DisplayError = () => {
    if (hasStartupConfigError) {
      return <ErrorRender>{localize('com_auth_error_login_server')}</ErrorRender>;
    } else if (error === 'com_auth_error_invalid_reset_token') {
      return (
        <ErrorRender>
          {localize('com_auth_error_invalid_reset_token')}{' '}
          <a className="font-semibold text-green-600 hover:underline" href="/forgot-password">
            {localize('com_auth_click_here')}
          </a>{' '}
          {localize('com_auth_to_try_again')}
        </ErrorRender>
      );
    } else if (error != null && error) {
      return <ErrorRender>{localize(error)}</ErrorRender>;
    }
    return null;
  };

  return (
    <div className="relative flex min-h-screen flex-col bg-white dark:bg-gray-900">
      <Banner />
      <div className="flex flex-col md:flex-row flex-grow md:min-h-[calc(100vh-8rem)]">
        {/* Left side - Auth form */}
        <div className="flex w-full md:w-1/2 flex-col">
          {/* Logo and Brand Section */}
          <div className="flex flex-col items-center justify-center p-8">
            <BlinkAnimation active={isFetching}>
              <div className="h-16 w-16 bg-cover">
                <img
                  src="/assets/logo.svg"
                  className="h-full w-full object-contain"
                  alt={localize('com_ui_logo', startupConfig?.appTitle ?? 'LibreChat')}
                />
              </div>
            </BlinkAnimation>
            <h2 className="mt-4 text-3xl font-semibold text-green-600 dark:text-green-500">
              AiBuddy
            </h2>
          </div>

          <div className="w-full md:text-3xl lg:text-4xl sm:text-2xl text-xl flex flex-row items-start justify-start font-normal overflow-hidden p-6 md:p-12 md:pt-4 pt-8">
            <p className="whitespace-pre-wrap text-center w-full min-h-[2.5em] md:min-h-[2em] flex flex-col items-center justify-center">
              <span className="text-black dark:text-white">{localize('com_ui_typewriter_help_me')}</span>
              <span className="min-h-[1.25em] md:min-h-[1em] flex items-center">
                <Typewriter
                  text={[
                    localize('com_ui_typewriter_write_text'),
                    localize('com_ui_typewriter_analyze_images'),
                    localize('com_ui_typewriter_solve_problems'),
                    localize('com_ui_typewriter_make_decisions'),
                    localize('com_ui_typewriter_create_better_world'),
                  ]}
                  speed={70}
                  className="text-green-600 dark:text-green-500"
                  waitTime={1500}
                  deleteSpeed={40}
                  cursorChar={"_"}
                />
              </span>
            </p>
          </div>

          <DisplayError />

          <div className="flex flex-grow items-center justify-center px-6">
            <div className="w-full max-w-md overflow-hidden bg-white px-6 py-4 dark:bg-gray-900 sm:rounded-lg">
              {!hasStartupConfigError && !isFetching && (
                <h1
                  className="mb-4 text-center text-3xl font-semibold text-black dark:text-white"
                  style={{ userSelect: 'none' }}
                >
                  {header}
                </h1>
              )}
              {(pathname.includes('login') || pathname.includes('register')) && (
                <SocialLoginRender startupConfig={startupConfig} />
              )}
              {children}
            </div>
          </div>
        </div>

        {/* Right side - Carousel */}
        <div className="relative w-full md:w-1/2 mt-8 md:mt-0 pb-16 md:py-8">
          <div className="h-full">
            <Carousel />
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 md:m-4 z-10">
        <ThemeSelector />
      </div>

      <Footer startupConfig={startupConfig} />
    </div>
  );
}

export default AuthLayout;
