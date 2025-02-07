interface ModelFeatures {
  speed: 'fast' | 'medium' | 'slow';
  tiers: ('FREE' | 'BASIC' | 'PRO' | 'PROPLUS' | 'UNLIMITED')[];
  imageSupport: boolean;
  documentSupport: boolean;
  intelligence: 'basic' | 'medium' | 'high' | 'very high';
  contextWindow: number;
  maxTokens?: number;
  isLegacy?: boolean;
}

interface ModelConfig {
  [key: string]: {
    features: ModelFeatures;
    provider: string;
    description: string;
    descriptions?: {
      [key: string]: string;
    };
    shortName: string;
  };
}

export const modelConfig: ModelConfig = {
  // OpenAI Models
  'gpt-4o-mini': {
    provider: 'OpenAI',
    shortName: 'ChatGPT 4o Mini',
    features: {
      speed: 'fast',
      tiers: ['FREE', 'BASIC', 'PRO', 'PROPLUS'],
      imageSupport: true,
      documentSupport: true,
      intelligence: 'high',
      contextWindow: 128000,
      isLegacy: false
    },
    description: 'Fast and efficient GPT-4 model optimized for quick responses',
    descriptions: {
      'ru-RU': 'Умная и динамичная базовая версия ChatGPT 4, созданная для моментальных и точных ответов'
    }
  },
  'o3-mini': {
    provider: 'OpenAI',
    shortName: 'ChatGPT o3 Mini',
    features: {
      speed: 'fast',
      tiers: ['PRO', 'PROPLUS'],
      imageSupport: true,
      documentSupport: true,
      intelligence: 'very high',
      contextWindow: 200000,
    },
    description: 'Brand New ChatGPT o3 Mini',
    descriptions: {
      'ru-RU': 'Новейшая модель ChatGPT o3 Mini'
    }
  },
  'chatgpt-4o-latest': {
    provider: 'OpenAI',
    shortName: 'ChatGPT 4o',
    features: {
      speed: 'medium',
      tiers: ['PRO', 'PROPLUS'],
      imageSupport: true,
      documentSupport: true,
      intelligence: 'very high',
      contextWindow: 128000,
    },
    description: 'Latest GPT-4 model with advanced capabilities',
    descriptions: {
      'ru-RU': 'Новейшая модель GPT-4 с продвинутыми возможностями и глубоким пониманием контекста'
    }
  },
  'o1-mini': {
    provider: 'OpenAI',
    shortName: 'ChatGPT o1 Mini',
    features: {
      speed: 'fast',
      tiers: ['BASIC', 'PRO', 'PROPLUS'],
      imageSupport: true,
      documentSupport: true,
      intelligence: 'high',
      contextWindow: 128000,
    },
    description: 'Fast and efficient O1 model optimized for quick responses',
    descriptions: {
      'ru-RU': 'Быстрая и эффективная модель O1, оптимизированная для мгновенных и точных ответов'
    }
  },
  'o1': {
    provider: 'OpenAI',
    shortName: 'ChatGPT o1',
    features: {
      speed: 'medium',
      tiers: ['PRO', 'PROPLUS'],
      imageSupport: true,
      documentSupport: true,
      intelligence: 'very high',
      contextWindow: 128000,
    },
    description: 'Powerful O1 model with high accuracy and reasoning capabilities',
    descriptions: {
      'ru-RU': 'Мощная модель O1 с высокой точностью и превосходными аналитическими способностями'
    }
  },
  'gpt-4-turbo': {
    provider: 'OpenAI',
    shortName: 'ChatGPT GPT-4 Turbo',
    features: {
      speed: 'fast',
      tiers: ['PRO', 'PROPLUS'],
      imageSupport: false,
      documentSupport: false,
      intelligence: 'very high',
      contextWindow: 128000,
      isLegacy: true
    },
    description: 'Latest GPT-4 Turbo model with improved speed and capabilities',
    descriptions: {
      'ru-RU': 'Последняя версия GPT-4 Turbo с улучшенной скоростью и расширенными возможностями'
    }
  },
  'gpt-3.5-turbo': {
    provider: 'OpenAI',
    shortName: 'ChatGPT GPT-3.5',
    features: {
      speed: 'fast',
      tiers: ['FREE', 'BASIC', 'PRO', 'PROPLUS'],
      imageSupport: false,
      documentSupport: false,
      intelligence: 'medium',
      contextWindow: 4096,
      isLegacy: true
    },
    description: 'Fast and reliable model for general-purpose chat and text generation',
    descriptions: {
      'ru-RU': 'Быстрая и надёжная модель для широкого спектра задач и генерации текста'
    }
  },

  // Anthropic Models
  'claude-3-5-haiku-latest': {
    provider: 'Anthropic',
    shortName: 'Claude 3.5 Haiku',
    features: {
      speed: 'fast',
      tiers: ['FREE', 'BASIC', 'PRO', 'PROPLUS'],
      imageSupport: true,
      documentSupport: true,
      intelligence: 'medium',
      contextWindow: 200000,
    },
    description: 'Fastest Claude model optimized for quick responses',
    descriptions: {
      'ru-RU': 'Самая быстрая модель Claude, оптимизированная для молниеносных ответов'
    }
  },
  'claude-3-5-sonnet-latest': {
    provider: 'Anthropic',
    shortName: 'Claude 3.5 Sonnet',
    features: {
      speed: 'fast',
      tiers: ['PRO', 'PROPLUS'],
      imageSupport: true,
      documentSupport: true,
      intelligence: 'high',
      contextWindow: 200000,
    },
    description: 'Balanced Claude model optimized for both performance and speed',
    descriptions: {
      'ru-RU': 'Сбалансированная модель Claude, сочетающая высокую производительность и скорость'
    }
  },
  'claude-3-opus-latest': {
    provider: 'Anthropic',
    shortName: 'Claude 3 Opus',
    features: {
      speed: 'medium',
      tiers: ['PRO', 'PROPLUS'],
      imageSupport: false,
      documentSupport: false,
      intelligence: 'very high',
      contextWindow: 200000,
      isLegacy: true
    },
    description: 'Most capable Claude model with highest reasoning and analysis capabilities',
    descriptions: {
      'ru-RU': 'Самая мощная модель Claude с непревзойдёнными способностями к рассуждению и анализу'
    }
  },
  // Google Models
  'gemini-2.0-flash-001': {
    provider: 'Google',
    shortName: 'Gemini 2.0 Flash',
    features: {
      speed: 'fast',
      tiers: ['PRO', 'PROPLUS'],
      imageSupport: true,
      documentSupport: true,
      intelligence: 'high',
      contextWindow: 1000000,
    },
    description: 'Latest Gemini Flash model with advanced capabilities and massive context window',
    descriptions: {
      'ru-RU': 'Передовая модель Gemini Flash с огромным контекстным окном и продвинутыми возможностями'
    }
  },
  'gemini-2.0-flash-lite-preview-02-05': {
    provider: 'Google',
    shortName: 'Gemini 2.0 Flash Lite',
    features: {
      speed: 'fast',
      tiers: ['FREE', 'BASIC', 'PRO', 'PROPLUS'],
      imageSupport: true,
      documentSupport: true,
      intelligence: 'medium',
      contextWindow: 1000000,
    },
    description: 'Gemini 2.0 Flash Lite is a preview model with limited capabilities',
    descriptions: {
      'ru-RU': 'Gemini 2.0 Flash Lite - еще более быстрая чем Gemini 2.0 Flash'
    }
  },
  'gemini-1.5-pro': {
    provider: 'Google',
    shortName: 'Gemini 1.5 Pro',
    features: {
      speed: 'medium',
      tiers: ['PRO', 'PROPLUS'],
      imageSupport: true,
      documentSupport: true,
      intelligence: 'very high',
      contextWindow: 1000000,
    },
    description: 'Latest Gemini Pro model with advanced capabilities and massive context window',
    descriptions: {
      'ru-RU': 'Передовая модель Gemini Pro с огромным контекстным окном и продвинутыми возможностями'
    }
  },
  'gemini-1.5-flash': {
    provider: 'Google',
    shortName: 'Gemini 1.5 Flash',
    features: {
      speed: 'fast',
      tiers: ['BASIC','PRO', 'PROPLUS'],
      imageSupport: true,
      documentSupport: true,
      intelligence: 'high',
      contextWindow: 1000000,
      isLegacy: true
    },
    description: 'Ultra-fast Gemini model optimized for quick responses',
    descriptions: {
      'ru-RU': 'Сверхбыстрая модель Gemini, оптимизированная для мгновенных ответов'
    }
  },
  'gemini-1.5-flash-8b': {
    provider: 'Google',
    shortName: 'Gemini 1.5 Flash 8B',
    features: {
      speed: 'fast',
      tiers: ['FREE', 'BASIC', 'PRO', 'PROPLUS'],
      imageSupport: true,
      documentSupport: true,
      intelligence: 'medium',
      contextWindow: 1000000,
      isLegacy: true
    },
    description: 'Lightweight and fast Gemini model for efficient processing',
    descriptions: {
      'ru-RU': 'Лёгкая и быстрая модель Gemini для эффективной обработки задач'
    }
  },

  // Groq Models
  'gemma2-9b-it': {
    provider: 'Groq',
    shortName: 'Gemma 2 9B',
    features: {
      speed: 'fast',
      tiers: ['FREE', 'BASIC', 'PRO', 'PROPLUS'],
      imageSupport: false,
      documentSupport: false,
      intelligence: 'medium',
      contextWindow: 8192,
    },
    description: 'Fast and efficient Google Gemma 2 model optimized by Groq',
    descriptions: {
      'ru-RU': 'Быстрая и эффективная модель Google Gemma 2, оптимизированная Groq для максимальной производительности'
    }
  },
  'llama-3.3-70b-versatile': {
    provider: 'Groq',
    shortName: 'Llama 3.3 70B',
    features: {
      speed: 'medium',
      tiers: ['PRO', 'PROPLUS'],
      imageSupport: false,
      documentSupport: false,
      intelligence: 'very high',
      contextWindow: 128000,
      maxTokens: 32768,
    },
    description: 'Most capable Llama 3.3 model with massive context window and high output capacity',
    descriptions: {
      'ru-RU': 'Мощнейшая модель Llama 3.3 с обширным контекстным окном и высокой производительностью'
    }
  },
  'llama-3.1-8b-instant': {
    provider: 'Groq',
    shortName: 'Llama 3.1 8B',
    features: {
      speed: 'fast',
      tiers: ['FREE', 'BASIC', 'PRO', 'PROPLUS'],
      imageSupport: false,
      documentSupport: false,
      intelligence: 'medium',
      contextWindow: 128000,
      maxTokens: 8192,
      isLegacy: true
    },
    description: 'Fast and efficient Llama 3.1 model optimized for quick responses',
    descriptions: {
      'ru-RU': 'Быстрая и эффективная модель Llama 3.1 для мгновенных ответов'
    }
  },
  'llama-guard-3-8b': {
    provider: 'Groq',
    shortName: 'Llama Guard',
    features: {
      speed: 'fast',
      tiers: ['BASIC', 'PRO', 'PROPLUS'],
      imageSupport: false,
      documentSupport: false,
      intelligence: 'high',
      contextWindow: 8192,
    },
    description: 'Specialized Llama model focused on safe and controlled responses',
    descriptions: {
      'ru-RU': 'Специализированная модель Llama с фокусом на безопасности и контроле ответов'
    }
  },
  'llama3-70b-8192': {
    provider: 'Groq',
    shortName: 'Llama 3 70B',
    features: {
      speed: 'medium',
      tiers: ['PRO', 'PROPLUS'],
      imageSupport: false,
      documentSupport: false,
      intelligence: 'very high',
      contextWindow: 8192,
    },
    description: 'Powerful Llama 3 70B model with high reasoning capabilities',
    descriptions: {
      'ru-RU': 'Мощная модель Llama 3 70B с высокими способностями к рассуждению'
    }
  },
  'llama3-8b-8192': {
    provider: 'Groq',
    shortName: 'Llama 3 8B',
    features: {
      speed: 'fast',
      tiers: ['FREE', 'BASIC', 'PRO', 'PROPLUS'],
      imageSupport: false,
      documentSupport: false,
      intelligence: 'medium',
      contextWindow: 8192,
    },
    description: 'Fast and efficient Llama 3 8B model for general use',
    descriptions: {
      'ru-RU': 'Быстрая и эффективная модель Llama 3 8B для повседневных задач'
    }
  },

  // Mistral Models
  'mistral-small-latest': {
    provider: 'Mistral',
    shortName: 'Mistral Small',
    features: {
      speed: 'fast',
      tiers: ['FREE', 'BASIC', 'PRO', 'PROPLUS'],
      imageSupport: false,
      documentSupport: false,
      intelligence: 'medium',
      contextWindow: 32000,
    },
    description: 'Fast and efficient model for general use',
    descriptions: {
      'ru-RU': 'Быстрая и эффективная модель для широкого спектра задач'
    }
  },
  'mistral-large-latest': {
    provider: 'Mistral',
    shortName: 'Mistral Large',
    features: {
      speed: 'medium',
      tiers: ['PRO', 'PROPLUS'],
      imageSupport: false,
      documentSupport: false,
      intelligence: 'very high',
      contextWindow: 32000,
    },
    description: 'Most capable Mistral model with advanced reasoning',
    descriptions: {
      'ru-RU': 'Самая мощная модель Mistral с продвинутыми возможностями рассуждения'
    }
  },
  'pixtral-large-latest': {
    provider: 'Mistral',
    shortName: 'Pixtral Large',
    features: {
      speed: 'medium',
      tiers: ['PRO', 'PROPLUS'],
      imageSupport: true,
      documentSupport: true,
      intelligence: 'very high',
      contextWindow: 32000,
    },
    description: 'Vision-capable model for image understanding and analysis',
    descriptions: {
      'ru-RU': 'Модель с поддержкой зрения для глубокого анализа и понимания изображений'
    }
  },
  'codestral-latest': {
    provider: 'Mistral',
    shortName: 'Codestral',
    features: {
      speed: 'fast',
      tiers: ['PRO', 'PROPLUS'],
      imageSupport: false,
      documentSupport: false,
      intelligence: 'high',
      contextWindow: 32000,
    },
    description: 'Specialized model optimized for code understanding and generation',
    descriptions: {
      'ru-RU': 'Специализированная модель для понимания и генерации кода с высокой точностью'
    }
  },
  'pixtral-12b-2409': {
    provider: 'Mistral',
    shortName: 'Pixtral 12B',
    features: {
      speed: 'fast',
      tiers: ['FREE','BASIC', 'PRO', 'PROPLUS'],
      imageSupport: true,
      documentSupport: true,
      intelligence: 'high',
      contextWindow: 32000,
    },
    description: 'Efficient vision model balancing speed and capabilities',
    descriptions: {
      'ru-RU': 'Эффективная модель с поддержкой зрения, сочетающая скорость и широкие возможности'
    }
  },

  // DeepSeek Models
  'deepseek-chat': {
    provider: 'Deepseek',
    shortName: 'DeepSeek Chat V3',
    features: {
      speed: 'fast',
      tiers: ['FREE', 'BASIC', 'PRO', 'PROPLUS'],
      imageSupport: false,
      documentSupport: false,
      intelligence: 'high',
      contextWindow: 32000,
    },
    description: 'Fast and versatile model for general chat and text generation',
    descriptions: {
      'ru-RU': 'Быстрая и универсальная модель для общения и генерации текста'
    }
  },
  'deepseek-reasoner': {
    provider: 'Deepseek',
    shortName: 'DeepSeek Reasoner R1',
    features: {
      speed: 'medium',
      tiers: ['PRO', 'PROPLUS'],
      imageSupport: false,
      documentSupport: false,
      intelligence: 'very high',
      contextWindow: 32000,
    },
    description: 'Advanced model optimized for complex reasoning and analysis',
    descriptions: {
      'ru-RU': 'Продвинутая модель для сложного анализа и логических рассуждений'
    }
  },

  // XAI Models
  'grok-2-latest': {
    provider: 'XAI',
    shortName: 'Grok 2',
    features: {
      speed: 'fast',
      tiers: ['PRO', 'PROPLUS'],
      imageSupport: false,
      documentSupport: false,
      intelligence: 'very high',
      contextWindow: 128000,
    },
    description: 'Latest Grok 2 model with advanced reasoning and real-time knowledge',
    descriptions: {
      'ru-RU': 'Новейшая модель Grok 2 с продвинутым мышлением и актуальными знаниями'
    }
  },
  'grok-2-vision-latest': {
    provider: 'XAI',
    shortName: 'Grok 2 Vision',
    features: {
      speed: 'medium',
      tiers: ['PRO', 'PROPLUS'],
      imageSupport: true,
      documentSupport: true,
      intelligence: 'very high',
      contextWindow: 128000,
    },
    description: 'Grok 2 model with vision capabilities for image understanding and analysis',
    descriptions: {
      'ru-RU': 'Модель Grok 2 с возможностями зрения для глубокого анализа изображений'
    }
  },
};

// Helper function to get models by tier
export const getModelsByTier = (tier: ModelFeatures['tiers'][0]) => {
  return Object.entries(modelConfig)
    .filter(([_, config]) => config.features.tiers.includes(tier))
    .map(([modelName]) => modelName);
};

// Helper function to get models by provider
export const getModelsByProvider = (provider: string) => {
  return Object.entries(modelConfig)
    .filter(([_, config]) => config.provider === provider)
    .map(([modelName]) => modelName);
};

// Helper function to get models with image support
export const getModelsWithImageSupport = () => {
  return Object.entries(modelConfig)
    .filter(([_, config]) => config.features.imageSupport)
    .map(([modelName]) => modelName);
};

// Helper function to get models by speed
export const getModelsBySpeed = (speed: ModelFeatures['speed']) => {
  return Object.entries(modelConfig)
    .filter(([_, config]) => config.features.speed === speed)
    .map(([modelName]) => modelName);
};

// Helper function to get models available in multiple tiers
export const getModelsByTiers = (tiers: ModelFeatures['tiers']) => {
  return Object.entries(modelConfig)
    .filter(([_, config]) => 
      tiers.every(tier => config.features.tiers.includes(tier))
    )
    .map(([modelName]) => modelName);
};

// Helper function to determine if a model needs a PRO badge
export const shouldShowProBadge = (modelName: string): boolean => {
  // If model is not in config, don't show badge
  if (!modelConfig[modelName]) {
    return false;
  }

  const model = modelConfig[modelName];
  // Show PRO badge if model is not available in FREE or BASIC tiers
  return !model.features.tiers.includes('FREE') && !model.features.tiers.includes('BASIC');
};

// Helper function to determine if a model is legacy
export const isModelLegacy = (modelName: string): boolean => {
  // If model is not in config, consider it non-legacy
  if (!modelConfig[modelName]) {
    return false;
  }

  return !!modelConfig[modelName].features.isLegacy;
};

// Helper function to get the display name for a model
export const getModelDisplayName = (modelName: string): string => {
  if (!modelConfig[modelName]) {
    return modelName;
  }
  return modelConfig[modelName].shortName;
};

// Helper function to get models by legacy status
export const getModelsByLegacyStatus = (isLegacy: boolean) => {
  return Object.entries(modelConfig)
    .filter(([_, config]) => config.features.isLegacy === isLegacy)
    .map(([modelName]) => modelName);
};

// Helper function to get models with document support
export const getModelsWithDocumentSupport = () => {
  return Object.entries(modelConfig)
    .filter(([_, config]) => config.features.documentSupport)
    .map(([modelName]) => modelName);
}; 