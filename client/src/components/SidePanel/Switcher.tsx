import { isAssistantsEndpoint, isAgentsEndpoint } from 'librechat-data-provider';
import type { SwitcherProps } from '~/common';
import AssistantSwitcher from './AssistantSwitcher';
import AgentSwitcher from './AgentSwitcher';
import ModelSwitcher from './ModelSwitcher';

export default function Switcher(props: SwitcherProps) {
  if (isAssistantsEndpoint(props.endpoint) && props.endpointKeyProvided) {
    return <AssistantSwitcher {...props} />;
  } else if (isAgentsEndpoint(props.endpoint) && props.endpointKeyProvided) {
  // return <AgentSwitcher {...props} />;  - old code, below return was added
    return (
      <>
        <AgentSwitcher {...props} />
      </>
    );
  } else if (isAssistantsEndpoint(props.endpoint)) {
    return null;
  }

  // Old code - keeping for reference, return null replaced it
  // return <ModelSwitcher {...props} />;
  return null;
}
