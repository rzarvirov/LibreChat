interface ModelFeatures {
  speed: 'fast' | 'medium' | 'slow';
  tiers: ('FREE' | 'BASIC' | 'PRO' | 'PROPLUS' | 'UNLIMITED')[];
  imageSupport: boolean;
  intelligence: 'basic' | 'medium' | 'high' | 'very high';
  contextWindow: number;
  maxTokens?: number;
}

interface ModelConfig {
  [key: string]: {
    features: ModelFeatures;
    provider: string;
    description: string;
  };
}

export const modelConfig: ModelConfig = {
  // OpenAI Models
  'gpt-4o-mini': {
    provider: 'OpenAI',
    features: {
      speed: 'fast',
      tiers: ['FREE', 'BASIC', 'PRO', 'PROPLUS'],
      imageSupport: false,
      intelligence: 'high',
      contextWindow: 128000,
    },
    description: 'Fast and efficient GPT-4 model optimized for quick responses',
  },
  'gpt-4o': {
    provider: 'OpenAI',
    features: {
      speed: 'medium',
      tiers: ['PRO', 'PROPLUS'],
      imageSupport: false,
      intelligence: 'very high',
      contextWindow: 128000,
    },
    description: 'Powerful GPT-4 model with high accuracy and reasoning capabilities',
  },
  'gpt-4-vision-preview': {
    provider: 'OpenAI',
    features: {
      speed: 'medium',
      tiers: ['PROPLUS'],
      imageSupport: true,
      intelligence: 'very high',
      contextWindow: 128000,
    },
    description: 'GPT-4 model with vision capabilities for image analysis and understanding',
  },
  'gpt-4-turbo-preview': {
    provider: 'OpenAI',
    features: {
      speed: 'fast',
      tiers: ['PRO', 'PROPLUS'],
      imageSupport: true,
      intelligence: 'very high',
      contextWindow: 128000,
    },
    description: 'Latest GPT-4 Turbo model with improved speed and capabilities',
  },
  'gpt-3.5-turbo': {
    provider: 'OpenAI',
    features: {
      speed: 'fast',
      tiers: ['FREE', 'BASIC', 'PRO', 'PROPLUS'],
      imageSupport: false,
      intelligence: 'medium',
      contextWindow: 4096,
    },
    description: 'Fast and reliable model for general-purpose chat and text generation',
  },
  'gpt-3.5-turbo-16k': {
    provider: 'OpenAI',
    features: {
      speed: 'fast',
      tiers: ['FREE', 'BASIC', 'PRO', 'PROPLUS'],
      imageSupport: false,
      intelligence: 'medium',
      contextWindow: 16384,
    },
    description: 'GPT-3.5 model with extended context window for longer conversations',
  },

  // Anthropic Models
  'claude-3-opus-20240229': {
    provider: 'Anthropic',
    features: {
      speed: 'medium',
      tiers: ['PROPLUS'],
      imageSupport: true,
      intelligence: 'very high',
      contextWindow: 200000,
    },
    description: 'Most capable Claude model with highest reasoning and analysis capabilities',
  },
  'claude-3-sonnet-20240229': {
    provider: 'Anthropic',
    features: {
      speed: 'fast',
      tiers: ['PRO', 'PROPLUS'],
      imageSupport: true,
      intelligence: 'high',
      contextWindow: 200000,
    },
    description: 'Balanced Claude model optimized for both performance and speed',
  },
  'claude-3-haiku-20240307': {
    provider: 'Anthropic',
    features: {
      speed: 'fast',
      tiers: ['FREE', 'BASIC', 'PRO', 'PROPLUS'],
      imageSupport: true,
      intelligence: 'medium',
      contextWindow: 200000,
    },
    description: 'Fastest Claude model optimized for quick responses',
  },
  'claude-2.1': {
    provider: 'Anthropic',
    features: {
      speed: 'medium',
      tiers: ['FREE', 'BASIC', 'PRO', 'PROPLUS'],
      imageSupport: false,
      intelligence: 'high',
      contextWindow: 100000,
    },
    description: 'Previous generation Claude model with strong reasoning capabilities',
  },
  'claude-instant-1': {
    provider: 'Anthropic',
    features: {
      speed: 'fast',
      tiers: ['FREE', 'BASIC', 'PRO', 'PROPLUS'],
      imageSupport: false,
      intelligence: 'medium',
      contextWindow: 100000,
    },
    description: 'Fast, cost-effective Claude model for simpler tasks',
  },

  // Google Models
  'gemini-1.5-pro-latest': {
    provider: 'Google',
    features: {
      speed: 'medium',
      tiers: ['PRO', 'PROPLUS'],
      imageSupport: true,
      intelligence: 'high',
      contextWindow: 1000000,
    },
    description: 'Latest Gemini Pro model with advanced capabilities and massive context window',
  },
  'gemini-1.0-pro': {
    provider: 'Google',
    features: {
      speed: 'fast',
      tiers: ['FREE', 'BASIC', 'PRO', 'PROPLUS'],
      imageSupport: false,
      intelligence: 'medium',
      contextWindow: 32000,
    },
    description: 'Standard Gemini model for general-purpose use',
  },
  'gemini-pro-vision': {
    provider: 'Google',
    features: {
      speed: 'medium',
      tiers: ['PRO', 'PROPLUS'],
      imageSupport: true,
      intelligence: 'high',
      contextWindow: 32000,
    },
    description: 'Gemini model specialized in image understanding and analysis',
  },
  'gemini-2.0-flash-exp': {
    provider: 'Google',
    features: {
      speed: 'fast',
      tiers: ['PROPLUS'],
      imageSupport: true,
      intelligence: 'very high',
      contextWindow: 128000,
    },
    description: 'Experimental Gemini model focused on ultra-fast responses',
  },

  // Groq Models
  'llama3-70b-8192': {
    provider: 'Groq',
    features: {
      speed: 'fast',
      tiers: ['PRO', 'PROPLUS'],
      imageSupport: false,
      intelligence: 'high',
      contextWindow: 8192,
    },
    description: 'Ultra-fast Llama 3 70B model optimized by Groq',
  },
  'mixtral-8x7b-32768': {
    provider: 'Groq',
    features: {
      speed: 'fast',
      tiers: ['FREE', 'BASIC', 'PRO', 'PROPLUS'],
      imageSupport: false,
      intelligence: 'medium',
      contextWindow: 32768,
    },
    description: 'Fast Mixtral model with good balance of speed and capabilities',
  },

  // Mistral Models
  'mistral-medium': {
    provider: 'Mistral',
    features: {
      speed: 'medium',
      tiers: ['PRO', 'PROPLUS'],
      imageSupport: false,
      intelligence: 'high',
      contextWindow: 32000,
    },
    description: 'Most capable Mistral model with advanced reasoning',
  },
  'mistral-small': {
    provider: 'Mistral',
    features: {
      speed: 'fast',
      tiers: ['FREE', 'BASIC', 'PRO', 'PROPLUS'],
      imageSupport: false,
      intelligence: 'medium',
      contextWindow: 32000,
    },
    description: 'Balanced Mistral model for general use',
  },
  'mistral-tiny': {
    provider: 'Mistral',
    features: {
      speed: 'fast',
      tiers: ['FREE', 'BASIC', 'PRO', 'PROPLUS'],
      imageSupport: false,
      intelligence: 'basic',
      contextWindow: 32000,
    },
    description: 'Fast and efficient Mistral model for simple tasks',
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