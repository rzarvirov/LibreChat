// file deepcode ignore HardcodedNonCryptoSecret: No hardcoded secrets
import { ViolationTypes, ErrorTypes } from 'librechat-data-provider';
import type { TOpenAIMessage } from 'librechat-data-provider';
import type { LocalizeFunction } from '~/common';
import { formatJSON, extractJson, isJson } from '~/utils/json';
import useLocalize from '~/hooks/useLocalize';
import CodeBlock from './CodeBlock';
import SubscriptionButton from '../../Subscription/SubscriptionButton';

const localizedErrorPrefix = 'com_error';

type TConcurrent = {
  limit: number;
};

type TMessageLimit = {
  max: number;
  windowInMinutes: number;
};

type TTokenBalance = {
  type: ViolationTypes | ErrorTypes;
  balance: number;
  tokenCost: number;
  promptTokens: number;
  prev_count: number;
  violation_count: number;
  date: Date;
  generations?: TOpenAIMessage[];
};

type TExpiredKey = {
  expiredAt: string;
  endpoint: string;
};

type TInputLength = {
  info: string;
};

const errorMessages = {
  [ErrorTypes.MODERATION]: 'com_error_moderation',
  [ErrorTypes.NO_USER_KEY]: 'com_error_no_user_key',
  [ErrorTypes.INVALID_USER_KEY]: 'com_error_invalid_user_key',
  [ErrorTypes.NO_BASE_URL]: 'com_error_no_base_url',
  [ErrorTypes.INVALID_ACTION]: `com_error_${ErrorTypes.INVALID_ACTION}`,
  [ErrorTypes.INVALID_REQUEST]: `com_error_${ErrorTypes.INVALID_REQUEST}`,
  [ErrorTypes.NO_SYSTEM_MESSAGES]: `com_error_${ErrorTypes.NO_SYSTEM_MESSAGES}`,
  [ErrorTypes.EXPIRED_USER_KEY]: (json: TExpiredKey, localize: LocalizeFunction) => {
    const { expiredAt, endpoint } = json;
    return localize('com_error_expired_user_key', endpoint, expiredAt);
  },
  [ErrorTypes.INPUT_LENGTH]: (json: TInputLength, localize: LocalizeFunction) => {
    const { info } = json;
    return localize('com_error_input_length', info);
  },
  [ViolationTypes.BAN]: 'com_error_ban',
  invalid_api_key: 'com_error_invalid_api_key',
  insufficient_quota: 'com_error_insufficient_quota',
  concurrent: (json: TConcurrent, localize: LocalizeFunction) => {
    const { limit } = json;
    const plural = limit > 1 ? 's' : '';
    return localize('com_error_concurrent', String(limit), plural);
  },
  message_limit: (json: TMessageLimit, localize: LocalizeFunction) => {
    const { max, windowInMinutes } = json;
    const plural = max > 1 ? 's' : '';
    const timeframe = windowInMinutes > 1 ? `${windowInMinutes} minutes` : 'minute';
    return localize('com_error_message_limit', String(max), plural, timeframe);
  },
  token_balance: (json: TTokenBalance) => {
    const { balance, tokenCost, promptTokens, generations } = json;
    const localize = useLocalize();
    const message = localize('com_error_token_balance', 
      String(balance), 
      String(promptTokens), 
      String(tokenCost)
    );
    return (
      <div className="flex flex-col items-start gap-4">
        <div>{message}</div>
        <SubscriptionButton />
        {generations && (
          <>
            <br />
            <br />
          </>
        )}
        {generations && (
          <CodeBlock
            lang="Generations"
            error={true}
            codeChildren={formatJSON(JSON.stringify(generations))}
          />
        )}
      </div>
    );
  },
};

const Error = ({ text }: { text: string }) => {
  const localize = useLocalize();
  const jsonString = extractJson(text);
  const errorMessage = text.length > 512 && !jsonString ? text.slice(0, 512) + '...' : text;
  const defaultResponse = localize('com_error_default', errorMessage);

  if (!isJson(jsonString)) {
    return defaultResponse;
  }

  const json = JSON.parse(jsonString);
  const errorKey = json.code || json.type;
  const keyExists = errorKey && errorMessages[errorKey];

  if (keyExists && typeof errorMessages[errorKey] === 'function') {
    return errorMessages[errorKey](json, localize);
  } else if (keyExists && keyExists.startsWith(localizedErrorPrefix)) {
    return localize(errorMessages[errorKey]);
  } else if (keyExists) {
    return localize(errorMessages[errorKey]);
  } else {
    return defaultResponse;
  }
};

export default Error;
