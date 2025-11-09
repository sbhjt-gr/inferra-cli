import React, { useState, useEffect, useMemo } from 'react';
import { Box, Text } from 'ink';
import { MainLayout } from './layouts/MainLayout.js';
import { ChatInterface } from './components/ChatInterface.js';
import { SetupFlow } from './components/SetupFlow.js';
import { UIStateProvider } from './contexts/UIStateContext.js';
import { AppConfigProvider } from './contexts/AppConfigContext.js';
import { StreamingProvider } from './contexts/StreamingContext.js';
import { colorMap } from './colors.js';

interface AppProps {
  command?: string;
  args?: any;
}

const App = ({ command, args }: AppProps) => {
  const [setupComplete, setSetupComplete] = useState(false);
  const [serverUrl, setServerUrl] = useState('');
  const [modelName, setModelName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamedContent, setStreamedContent] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string>();

  const handleSetupComplete = (url: string, model: string) => {
    setServerUrl(url);
    setModelName(model);
    setSetupComplete(true);
  };

  const appConfig = useMemo(
    () => ({
      serverUrl,
      modelName,
      isInitialized: setupComplete,
    }),
    [serverUrl, modelName, setupComplete]
  );

  const uiState = useMemo(
    () => ({
      isLoading,
      isStreaming,
      streamedContent,
      error,
      setupComplete,
    }),
    [isLoading, isStreaming, streamedContent, error, setupComplete]
  );

  const streamState = useMemo(
    () => ({
      isStreaming,
      content: streamedContent,
      done: !isStreaming,
    }),
    [isStreaming, streamedContent]
  );

  if (!setupComplete) {
    return <SetupFlow onComplete={handleSetupComplete} />;
  }

  return (
    <AppConfigProvider value={appConfig}>
      <UIStateProvider value={uiState}>
        <StreamingProvider value={streamState}>
          <MainLayout>
            {command === 'chat' || !command ? (
              <ChatInterface
                initialMessage={args?.message}
                model={modelName}
                serverUrl={serverUrl}
              />
            ) : (
              <Box flexDirection="column" justifyContent="center">
                <Text color={colorMap.primary} bold>
                  ready
                </Text>
                <Text color={colorMap.success}>model: {modelName}</Text>
              </Box>
            )}
          </MainLayout>
        </StreamingProvider>
      </UIStateProvider>
    </AppConfigProvider>
  );
};

export { App };