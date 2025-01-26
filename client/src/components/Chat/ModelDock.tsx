import {
    motion,
    MotionValue,
    useMotionValue,
    useSpring,
    useTransform,
    type SpringOptions,
    AnimatePresence,
  } from 'framer-motion';
  import {
    Children,
    cloneElement,
    createContext,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
  } from 'react';
  import {
    Brain,
    Image as ImageIcon,
    Gauge,
    ScrollText,
  } from 'lucide-react';
  import { useLocalize } from '~/hooks';
  
  const DOCK_HEIGHT = 128;
  const DEFAULT_MAGNIFICATION = 80;
  const DEFAULT_DISTANCE = 150;
  const DEFAULT_PANEL_HEIGHT = 64;
  
  interface ModelFeatures {
    speed: 'fast' | 'medium' | 'slow';
    imageSupport: boolean;
    intelligence: 'basic' | 'medium' | 'high' | 'very high';
    contextWindow: number;
  }
  
  interface ModelDockProps {
    features: ModelFeatures;
    className?: string;
    spring?: SpringOptions;
    magnification?: number;
    distance?: number;
    panelHeight?: number;
  }
  
  type DockContextType = {
    mouseX: MotionValue<number>;
    spring: SpringOptions;
    magnification: number;
    distance: number;
  };
  
  const DockContext = createContext<DockContextType | undefined>(undefined);
  
  function DockProvider({ children, value }: { children: React.ReactNode; value: DockContextType }) {
    return <DockContext.Provider value={value}>{children}</DockContext.Provider>;
  }
  
  function useDock() {
    const context = useContext(DockContext);
    if (!context) {
      throw new Error('useDock must be used within an DockProvider');
    }
    return context;
  }
  
  function DockItem({ children, className }: { children: React.ReactNode; className?: string }) {
    const ref = useRef<HTMLDivElement>(null);
    const { distance, magnification, mouseX, spring } = useDock();
    const isHovered = useMotionValue(0);
  
    const mouseDistance = useTransform(mouseX, (val) => {
      const domRect = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
      return val - domRect.x - domRect.width / 2;
    });
  
    const widthTransform = useTransform(
      mouseDistance,
      [-distance, 0, distance],
      [40, magnification, 40]
    );
  
    const width = useSpring(widthTransform, spring);
  
    return (
      <motion.div
        ref={ref}
        style={{ width }}
        onHoverStart={() => isHovered.set(1)}
        onHoverEnd={() => isHovered.set(0)}
        onFocus={() => isHovered.set(1)}
        onBlur={() => isHovered.set(0)}
        className={cn(
          'relative inline-flex items-center justify-center',
          className
        )}
        tabIndex={0}
        role="button"
        aria-haspopup="true"
      >
        {Children.map(children, (child) =>
          cloneElement(child as React.ReactElement, { width, isHovered })
        )}
      </motion.div>
    );
  }
  
  function DockLabel({ children, className, ...rest }: { children: React.ReactNode; className?: string }) {
    const restProps = rest as Record<string, unknown>;
    const isHovered = restProps['isHovered'] as MotionValue<number>;
    const [isVisible, setIsVisible] = useState(false);
  
    useEffect(() => {
      const unsubscribe = isHovered.on('change', (latest) => {
        setIsVisible(latest === 1);
      });
      return () => unsubscribe();
    }, [isHovered]);
  
    return (
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: 1, y: -10 }}
            exit={{ opacity: 0, y: 0 }}
            transition={{ duration: 0.2 }}
            className={cn(
              'absolute -top-6 left-1/2 w-fit whitespace-pre rounded-md border border-gray-200 bg-gray-100 px-2 py-0.5 text-xs text-neutral-700 dark:border-neutral-900 dark:bg-neutral-800 dark:text-white',
              className
            )}
            role="tooltip"
            style={{ x: '-50%' }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    );
  }
  
  function DockIcon({ children, className, ...rest }: { children: React.ReactNode; className?: string }) {
    const restProps = rest as Record<string, unknown>;
    const width = restProps['width'] as MotionValue<number>;
    const widthTransform = useTransform(width, (val) => val / 2);
  
    return (
      <motion.div
        style={{ width: widthTransform }}
        className={cn('flex items-center justify-center', className)}
      >
        {children}
      </motion.div>
    );
  }
  
  // Utility function for class names
  function cn(...classes: (string | undefined)[]) {
    return classes.filter(Boolean).join(' ');
  }
  
  export default function ModelDock({
    features,
    className,
    spring = { mass: 0.1, stiffness: 150, damping: 12 },
    magnification = DEFAULT_MAGNIFICATION,
    distance = DEFAULT_DISTANCE,
    panelHeight = DEFAULT_PANEL_HEIGHT,
  }: ModelDockProps) {
    const mouseX = useMotionValue(Infinity);
    const isHovered = useMotionValue(0);
    const localize = useLocalize();
  
    const maxHeight = useMemo(() => {
      return Math.max(DOCK_HEIGHT, magnification + magnification / 2 + 4);
    }, [magnification]);
  
    const heightRow = useTransform(isHovered, [0, 1], [panelHeight, maxHeight]);
    const height = useSpring(heightRow, spring);
  
    const getSpeedIcon = (speed: string) => {
      const isHighlighted = speed === 'fast';
      return (
        <Gauge 
          className={cn(
            'h-full w-full',
            isHighlighted 
              ? 'text-green-500 dark:text-green-400'
              : 'text-neutral-600 dark:text-neutral-400'
          )} 
        />
      );
    };
  
    const getIntelligenceIcon = (level: string) => {
      const isHighlighted = level === 'high' || level === 'very high';
      return (
        <Brain 
          className={cn(
            'h-full w-full',
            isHighlighted 
              ? 'text-purple-500 dark:text-purple-400'
              : 'text-neutral-600 dark:text-neutral-400'
          )}
        />
      );
    };
  
    const getContextIcon = (contextWindow: number) => {
      const isHighlighted = contextWindow > 8000;
      return (
        <ScrollText 
          className={cn(
            'h-full w-full',
            isHighlighted 
              ? 'text-orange-500 dark:text-orange-400'
              : 'text-neutral-600 dark:text-neutral-400'
          )}
        />
      );
    };
  
    const formatContextWindow = (value: number) => {
      if (value >= 1000000) return `${value / 1000000}M ${localize('com_model_features_context_window_suffix')}`;
      if (value >= 1000) return `${value / 1000}K ${localize('com_model_features_context_window_suffix')}`;
      return `${value} ${localize('com_model_features_context_window_suffix')}`;
    };
  
    const dockItems = [
      ...(features.imageSupport ? [{
        title: localize('com_model_features_image_support'),
        icon: <ImageIcon className="h-full w-full text-blue-500 dark:text-blue-400" />,
      }] : []),
      {
        title: `${localize('com_model_features_intelligence')}: ${localize(`com_model_features_intelligence_${features.intelligence.replace(' ', '_')}`)}`,
        icon: getIntelligenceIcon(features.intelligence),
      },
      {
        title: `${localize('com_model_features_context_window')}: ${formatContextWindow(features.contextWindow)}`,
        icon: getContextIcon(features.contextWindow),
      },
      {
        title: `${localize('com_model_features_speed')}: ${localize(`com_model_features_speed_${features.speed}`)}`,
        icon: getSpeedIcon(features.speed),
      },
    ];
  
    return (
      <motion.div
        style={{
          height: height,
          scrollbarWidth: 'none',
        }}
        className="mx-2 flex max-w-full items-end overflow-x-auto"
      >
        <motion.div
          onMouseMove={({ pageX }) => {
            isHovered.set(1);
            mouseX.set(pageX);
          }}
          onMouseLeave={() => {
            isHovered.set(0);
            mouseX.set(Infinity);
          }}
          className={cn(
            'mx-auto flex w-fit gap-4 rounded-2xl bg-gray-50 px-12 dark:bg-neutral-900',
            'items-end pb-3',
            className
          )}
          style={{ height: panelHeight }}
          role="toolbar"
          aria-label="Model features dock"
        >
          <DockProvider value={{ mouseX, spring, distance, magnification }}>
            {dockItems.map((item, idx) => (
              <DockItem
                key={idx}
                className="aspect-square rounded-full bg-gray-200 dark:bg-neutral-800"
              >
                <DockLabel>{item.title}</DockLabel>
                <DockIcon>{item.icon}</DockIcon>
              </DockItem>
            ))}
          </DockProvider>
        </motion.div>
      </motion.div>
    );
  }