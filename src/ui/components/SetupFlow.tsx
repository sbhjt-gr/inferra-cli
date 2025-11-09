import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import Spinner from 'ink-spinner';
import { InferraClient } from '../../core/api-client.js';
import { colorMap } from '../colors.js';

interface SetupFlowProps {
  onComplete: (url: string, modelName: string) => void;
}

type SetupStep = 'url' | 'models' | 'loading' | 'complete';

export const SetupFlow = ({ onComplete }: SetupFlowProps) => {
  const [step, setStep] = useState<SetupStep>('url');
  const [url, setUrl] = useState('');
  const [models, setModels] = useState<any[]>([]);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useInput((input, key) => {
    if (step === 'url') {
      if (key.return) {
        validateAndLoadModels();
      } else if (key.backspace) {
        setUrl((prev) => prev.slice(0, -1));
      } else if (!key.ctrl && input) {
        setUrl((prev) => prev + input);
      }
    } else if (step === 'models') {
      if (key.upArrow) {
        setSelectedIdx((prev) => Math.max(0, prev - 1));
      } else if (key.downArrow) {
        setSelectedIdx((prev) => Math.min(models.length - 1, prev + 1));
      } else if (key.return) {
        selectModel();
      }
    }
  });

  const validateAndLoadModels = async () => {
    if (!url.trim()) {
      setError('url_required');
      return;
    }
    setLoading(true);
    try {
      const client = new InferraClient(url);
      const modelList = await client.listModels();
      if (modelList.length === 0) {
        setError('no_models');
      } else {
        setModels(modelList);
        setStep('models');
      }
    } catch (err) {
      setError('connect_failed');
    } finally {
      setLoading(false);
    }
  };

  const selectModel = () => {
    setStep('loading');
    onComplete(url, models[selectedIdx].name);
  };

  if (step === 'loading') {
    return (
      <Box flexDirection="column" padding={2}>
        <Text color={colorMap.primary}>
          <Spinner /> Loading...
        </Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" padding={2}>
      {step === 'url' && (
        <Box flexDirection="column">
          <Text color={colorMap.primary} bold>
            Setup - Enter Server URL
          </Text>
          <Box marginY={1} paddingX={2}>
            <Text>URL: {url}</Text>
            {loading && <Spinner />}
          </Box>
          {error && <Text color={colorMap.error}>{error}</Text>}
        </Box>
      )}

      {step === 'models' && (
        <Box flexDirection="column">
          <Text color={colorMap.primary} bold>
            Select Model
          </Text>
          <Box flexDirection="column" marginY={1} paddingX={2}>
            {models.map((m, i) => (
              <Box key={m.name} marginY={0}>
                <Text color={i === selectedIdx ? colorMap.secondary : colorMap.muted}>
                  {i === selectedIdx ? '> ' : '  '}
                  {m.name}
                </Text>
              </Box>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
};
