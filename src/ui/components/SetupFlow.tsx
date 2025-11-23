import React, { useState, useEffect } from 'react';
import { Box, Text, useInput, useApp } from 'ink';
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
  const [cursor, setCursor] = useState(0);
  const [models, setModels] = useState<any[]>([]);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { exit } = useApp();

  useEffect(() => {
    // Keep cursor in range when the URL changes
    setCursor((c) => Math.min(c, url.length));
  }, [url]);

  useEffect(() => {
    if (step === 'url') {
      setCursor(url.length);
    }
  }, [step]);

  useInput((input, key) => {
    if (step === 'url') {
      if (key.return) {
        validateAndLoadModels();
      } else if (key.leftArrow) {
        setCursor((c) => Math.max(0, c - 1));
      } else if (key.rightArrow) {
        setCursor((c) => Math.min(url.length, c + 1));
      } else if (key.backspace || (key.delete && cursor === url.length)) {
        setUrl((prev) => {
          if (cursor <= 0) return prev;
          const next = prev.slice(0, cursor - 1) + prev.slice(cursor);
          setCursor((c) => Math.max(0, c - 1));
          return next;
        });
      } else if (key.delete) {
        setUrl((prev) => prev.slice(0, cursor) + prev.slice(cursor + 1));
  } else if (!key.ctrl && input) {
        // Insert input at cursor position (handle pasted strings)
        setUrl((prev) => {
          const next = prev.slice(0, cursor) + input + prev.slice(cursor);
          setCursor((c) => c + input.length);
          return next;
        });
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
    if ((key.ctrl && input === 'c') || (key.ctrl && input === 'd')) {
      exit();
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
            <Text>
              URL:{' '}
              <Text>
                {url.slice(0, cursor)}
                <Text backgroundColor={colorMap.secondary} color="black">
                  {cursor < url.length ? url[cursor] : ' '}
                </Text>
                {url.slice(cursor + (cursor < url.length ? 1 : 0))}
              </Text>
            </Text>
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
