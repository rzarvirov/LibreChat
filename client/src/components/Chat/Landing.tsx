import { useMemo } from 'react';
import { EModelEndpoint, Constants } from 'librechat-data-provider';
import { useGetEndpointsQuery, useGetStartupConfig } from 'librechat-data-provider/react-query';
import { modelConfig } from '~/data/modelConfig';
import type * as t from 'librechat-data-provider';
import type { ReactNode } from 'react';
import { useChatContext, useAgentsMapContext, useAssistantsMapContext } from '~/Providers';
import { useGetAssistantDocsQuery } from '~/data-provider';
import ConvoIcon from '~/components/Endpoints/ConvoIcon';
import { getIconEndpoint, getEntity, cn } from '~/utils';
import { useLocalize, useSubmitMessage } from '~/hooks';
import { TooltipAnchor } from '~/components/ui';
import { BirthdayIcon } from '~/components/svg';
import ConvoStarter from './ConvoStarter';
import ModelDock from './ModelDock';
import { useRecoilValue } from 'recoil';
import store from '~/store';

function ModelInfo({ model }: { model: string }) {
  const modelData = modelConfig[model];
  const localize = useLocalize();
  const lang = useRecoilValue(store.lang);

  if (!modelData) {
    return null;
  }

  const description = modelData.descriptions?.[lang] || modelData.description;

  return (
    <div className="mt-2 max-w-2xl px-4 flex flex-col items-center">
      <p className="text-center text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
        {description}
      </p>
      <div className="h-28 w-full relative mt-2">
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 scale-90">
          <ModelDock features={modelData.features} />
        </div>
      </div>
    </div>
  );
}

export default function Landing({ Header }: { Header?: ReactNode }) {
  const { conversation } = useChatContext();
  const agentsMap = useAgentsMapContext();
  const assistantMap = useAssistantsMapContext();
  const { data: startupConfig } = useGetStartupConfig();
  const { data: endpointsConfig } = useGetEndpointsQuery();

  const localize = useLocalize();

  let { endpoint = '' } = conversation ?? {};

  if (
    endpoint === EModelEndpoint.chatGPTBrowser ||
    endpoint === EModelEndpoint.azureOpenAI ||
    endpoint === EModelEndpoint.gptPlugins
  ) {
    endpoint = EModelEndpoint.openAI;
  }

  const iconURL = conversation?.iconURL;
  endpoint = getIconEndpoint({ endpointsConfig, iconURL, endpoint });
  const { data: documentsMap = new Map() } = useGetAssistantDocsQuery(endpoint, {
    select: (data) => new Map(data.map((dbA) => [dbA.assistant_id, dbA])),
  });

  const { entity, isAgent, isAssistant } = getEntity({
    endpoint,
    agentsMap,
    assistantMap,
    agent_id: conversation?.agent_id,
    assistant_id: conversation?.assistant_id,
  });

  const name = entity?.name ?? '';
  const description = entity?.description ?? '';
  const avatar = isAgent
    ? (entity as t.Agent | undefined)?.avatar?.filepath ?? ''
    : ((entity as t.Assistant | undefined)?.metadata?.avatar as string | undefined) ?? '';
  const conversation_starters = useMemo(() => {
    /* The user made updates, use client-side cache, or they exist in an Agent */
    if (entity && (entity.conversation_starters?.length ?? 0) > 0) {
      return entity.conversation_starters;
    }
    if (isAgent) {
      return entity?.conversation_starters ?? [];
    }

    /* If none in cache, we use the latest assistant docs */
    const entityDocs = documentsMap.get(entity?.id ?? '');
    return entityDocs?.conversation_starters ?? [];
  }, [documentsMap, isAgent, entity]);

  const containerClassName =
    'shadow-stroke relative flex h-full items-center justify-center rounded-full bg-white text-black';

  const { submitMessage } = useSubmitMessage();
  const sendConversationStarter = (text: string) => submitMessage({ text });

  const getWelcomeMessage = () => {
    const greeting = conversation?.greeting ?? '';
    if (greeting) {
      return greeting;
    }

    if (isAssistant) {
      return localize('com_nav_welcome_assistant');
    }

    if (isAgent) {
      return localize('com_nav_welcome_agent');
    }

    return localize('com_nav_welcome_message');
  };

  return (
    <div className="relative h-full">
      <div className="absolute left-0 right-0">{Header != null ? Header : null}</div>
      <div className="flex h-full flex-col items-center justify-center">
        <div className={cn('relative h-10 w-10 sm:h-12 sm:w-12', name && avatar ? 'mb-0' : 'mb-2')}>
          <ConvoIcon
            agentsMap={agentsMap}
            assistantMap={assistantMap}
            conversation={conversation}
            endpointsConfig={endpointsConfig}
            containerClassName={containerClassName}
            context="landing"
            className="h-2/3 w-2/3"
            size={41}
          />
          {startupConfig?.showBirthdayIcon === true ? (
            <TooltipAnchor
              className="absolute bottom-6 right-2.5 scale-75 sm:bottom-8 sm:scale-100"
              description={localize('com_ui_happy_birthday')}
            >
              <BirthdayIcon />
            </TooltipAnchor>
          ) : null}
        </div>
        {name ? (
          <div className="flex flex-col items-center gap-0 p-1 sm:p-2">
            <div className="text-center text-xl font-medium dark:text-white sm:text-2xl">{name}</div>
            <div className="max-w-md text-center text-xs font-normal text-text-primary sm:text-sm">
              {description ? description : localize('com_nav_welcome_message')}
            </div>
          </div>
        ) : (
          <h2 className="mb-2 max-w-[75vh] px-4 text-center text-base font-medium dark:text-white sm:mb-5 sm:px-12 md:px-0 md:text-2xl">
            {getWelcomeMessage()}
          </h2>
        )}
        {conversation?.model && <ModelInfo model={conversation.model} />}
        <div className="mt-4 flex flex-wrap justify-center gap-2 px-2 sm:mt-8 sm:gap-3 sm:px-4">
          {conversation_starters.length > 0 &&
            conversation_starters
              .slice(0, Constants.MAX_CONVO_STARTERS)
              .map((text: string, index: number) => (
                <ConvoStarter
                  key={index}
                  text={text}
                  onClick={() => sendConversationStarter(text)}
                />
              ))}
        </div>
      </div>
    </div>
  );
}
