import React, { useState, useEffect } from 'react';
import { Box, Text, useInput, useApp } from 'ink';
import Spinner from 'ink-spinner';
import { InferraClient } from '../../core/api-client.js';
import { configManager } from '../../config/config.js';
import { createInterface } from 'readline';

interface SetupProps {
  onComplete: (url: string, modelName: string) => void;
}

type SetupStep = 'url' | 'models' | 'loading';

const Setup = ({ onComplete }: SetupProps) => {
  const [step, setStep] = useState<SetupStep>('url');
  const [url, setUrl] = useState('');
  const [models, setModels] = useState<any[]>([]);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { exit } = useApp();

  useEffect(() => {
    if (!process.stdin.isTTY) {
      const rl = createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      rl.question('Enter server URL (default: http://192.168.1.105:8889): ', async (serverUrl) => {
        const finalUrl = serverUrl.trim() || 'http://192.168.1.105:8889';
        
        try {
          const client = new InferraClient(finalUrl);
          const modelList = await client.listModels();
          
          if (modelList.length === 0) {
            console.error('No models available on server');
            rl.close();
            exit();
            return;
          }

          rl.question(
            `Available models:\n${modelList.map((m: any, i: number) => `${i + 1}. ${m.name}`).join('\n')}\nSelect model (1-${modelList.length}): `,
            async (selection) => {
              const idx = parseInt(selection) - 1;
              if (idx < 0 || idx >= modelList.length) {
                console.error('Invalid selection');
                rl.close();
                exit();
                return;
              }

              try {
                const selectedModel = modelList[idx];
                if (selectedModel.model_type !== 'apple-foundation') {
                  await client.loadModel(selectedModel.name);
                }
                configManager.set('server.url', finalUrl);
                configManager.set('defaults.model', selectedModel.name);
                await configManager.save();
                rl.close();
                onComplete(finalUrl, selectedModel.name);
              } catch (err) {
                console.error('Failed to load model:', err instanceof Error ? err.message : String(err));
                rl.close();
                exit();
              }
            }
          );
        } catch (err) {
          console.error('Failed to connect to server:', err instanceof Error ? err.message : String(err));
          rl.close();
          exit();
        }
      });
    }
  }, [onComplete, exit]);

  const loadModels = async (serverUrl: string) => {
    try {
      setLoading(true);
      const client = new InferraClient(serverUrl);
      const modelList = await client.listModels();
      if (modelList.length === 0) {
        setError('No models available on server');
        return;
      }
      setModels(modelList);
      setStep('models');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load models');
    } finally {
      setLoading(false);
    }
  };

  const loadSelectedModel = async () => {
    const model = models[selectedIdx];
    if (!model) return;

    try {
      setLoading(true);
      setStep('loading');
      const client = new InferraClient(url);
      
      if (model.model_type !== 'apple-foundation') {
        await client.loadModel(model.name);
      }
      
      configManager.set('server.url', url);
      configManager.set('defaults.model', model.name);
      await configManager.save();
      onComplete(url, model.name);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load model');
      setStep('models');
    } finally {
      setLoading(false);
    }
  };

  useInput((char: string, key: any) => {
    if (step === 'url') {
      if (key.return) {
        if (url.trim()) {
          loadModels(url);
        } else {
          setError('URL cannot be empty');
        }
      } else if (key.backspace || key.delete) {
        setUrl((prev) => prev.slice(0, -1));
      } else if (!key.ctrl && !key.meta && char) {
        setUrl((prev) => prev + char);
      }
    } else if (step === 'models') {
      if (key.upArrow) {
        setSelectedIdx((prev) => (prev > 0 ? prev - 1 : models.length - 1));
      } else if (key.downArrow) {
        setSelectedIdx((prev) => (prev < models.length - 1 ? prev + 1 : 0));
      } else if (key.return) {
        loadSelectedModel();
      }
    }

    if ((key.ctrl && char === 'c') || (key.ctrl && char === 'd')) {
      exit();
    }
  });

  if (!process.stdin.isTTY) {
    return (
      <Box flexDirection="column" padding={2}>
        <Text color="cyan">Initializing...</Text>
      </Box>
    );
  }

  if (step === 'url') {
    return (
      <Box flexDirection="column" padding={2}>
        <Text bold color="cyan">
          Inferra CLI Setup
        </Text>
        <Box marginY={1}>
          <Text>Enter server URL:</Text>
        </Box>
        <Box borderStyle="single" borderColor="cyan" paddingX={2} paddingY={1}>
          <Text>{url || 'http://192.168.1.105:8889'}</Text>
        </Box>
        {error && (
          <Box marginY={1}>
            <Text color="red">{error}</Text>
          </Box>
        )}
        <Box marginY={1}>
          <Text color="gray" dimColor>
            [Press Enter to confirm]
          </Text>
        </Box>
      </Box>
    );
  }

  if (step === 'models') {
    return (
      <Box flexDirection="column" padding={2}>
        <Text bold color="cyan">
          Select Model to Load
        </Text>
        <Box marginY={1} flexDirection="column">
          {models.map((model, idx) => (
            <Box key={model.name} marginY={0.5}>
              <Text
                color={idx === selectedIdx ? 'green' : 'white'}
                bold={idx === selectedIdx}
              >
                {idx === selectedIdx ? '> ' : '  '}
                {model.name}
              </Text>
            </Box>
          ))}
        </Box>
        {error && (
          <Box marginY={1}>
            <Text color="red">{error}</Text>
          </Box>
        )}
        <Box marginY={1}>
          <Text color="gray" dimColor>
            [Up/Down to select, Enter to load]
          </Text>
        </Box>
      </Box>
    );
  }

  if (step === 'loading') {
    return (
      <Box flexDirection="column" padding={2} alignItems="center">
        <Box marginY={1} flexDirection="row">
          <Spinner type="dots" />
          <Box marginLeft={1}>
            <Text>Loading model...</Text>
          </Box>
        </Box>
      </Box>
    );
  }

  return null;
};

export { Setup };
