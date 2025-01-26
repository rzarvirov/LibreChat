import { memo, useMemo, useEffect } from 'react';
import { useRecoilValue } from 'recoil';
import {
  supportsFiles,
  mergeFileConfig,
  isAgentsEndpoint,
  EndpointFileConfig,
  fileConfig as defaultFileConfig,
} from 'librechat-data-provider';
import type { TFile } from 'librechat-data-provider';
import { useGetFileConfig } from '~/data-provider';
import { modelConfig } from '~/data/modelConfig';
import AttachFileMenu from './AttachFileMenu';
import { useChatContext } from '~/Providers';
import { useFileHandling } from '~/hooks';
import AttachFile from './AttachFile';
import FileRow from './FileRow';
import store from '~/store';

function FileFormWrapper({
  children,
  disableInputs,
  onUploadActiveChange,
}: {
  disableInputs: boolean;
  children?: React.ReactNode;
  onUploadActiveChange?: (active: boolean) => void;
}) {
  const chatDirection = useRecoilValue(store.chatDirection).toLowerCase();
  const { files, setFiles, conversation, setFilesLoading } = useChatContext();
  const { endpoint: _endpoint, endpointType, model } = conversation ?? { endpoint: null };
  const isAgents = useMemo(() => isAgentsEndpoint(_endpoint), [_endpoint]);

  const { handleFileChange, abortUpload } = useFileHandling();

  const { data: fileConfig = defaultFileConfig } = useGetFileConfig({
    select: (data) => mergeFileConfig(data),
  });

  const isRTL = chatDirection === 'rtl';

  const endpointFileConfig = fileConfig.endpoints[_endpoint ?? ''] as
    | EndpointFileConfig
    | undefined;

  const endpointSupportsFiles: boolean = supportsFiles[endpointType ?? _endpoint ?? ''] ?? false;
  const isUploadDisabled = (disableInputs || endpointFileConfig?.disabled) ?? false;
  
  // Check if current model supports images
  const modelSupportsImages = useMemo(() => {
    if (!model) return false;
    return modelConfig[model]?.features?.imageSupport ?? false;
  }, [model]);

  // Calculate if file upload is active
  const isUploadActive = useMemo(() => {
    if (!modelSupportsImages) return false;
    if (isAgents) return true;
    return endpointSupportsFiles && !isUploadDisabled;
  }, [modelSupportsImages, isAgents, endpointSupportsFiles, isUploadDisabled]);

  // Notify parent of upload active state changes
  useEffect(() => {
    onUploadActiveChange?.(isUploadActive);
  }, [isUploadActive, onUploadActiveChange]);

  const renderAttachFile = () => {
    if (!isUploadActive) return null;
    
    if (isAgents) {
      return (
        <AttachFileMenu
          isRTL={isRTL}
          disabled={disableInputs}
          handleFileChange={handleFileChange}
        />
      );
    }
    return (
      <AttachFile isRTL={isRTL} disabled={disableInputs} handleFileChange={handleFileChange} />
    );
  };

  return (
    <>
      <FileRow
        files={files}
        setFiles={setFiles}
        abortUpload={abortUpload}
        setFilesLoading={setFilesLoading}
        isRTL={isRTL}
        Wrapper={({ children }) => <div className="mx-2 mt-2 flex flex-wrap gap-2">{children}</div>}
      />
      {children}
      {renderAttachFile()}
    </>
  );
}

export default memo(FileFormWrapper);
