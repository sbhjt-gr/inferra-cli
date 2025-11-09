import React, { useState, useEffect, useRef, useContext } from 'react';
import { Box, Text, useInput, useApp } from 'ink';
import Spinner from 'ink-spinner';
import { InferraClient } from '../../core/api-client.js';
import { StreamingContext } from '../contexts/StreamingContext.js';
import { colorMap } from '../colors.js';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatInterfaceProps {
  initialMessage?: string;
  model: string;
  serverUrl: string;
  onExit?: () => void;
}

export const ChatInterface = ({ initialMessage, model, serverUrl, onExit }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState(initialMessage || '');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const { exit } = useApp();
  const clientRef = useRef<InferraClient | null>(null);

  useEffect(() => {
    clientRef.current = new InferraClient(serverUrl);
  }, [serverUrl]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setInput('');
    setIsLoading(true);
    setIsStreaming(true);
    setStreamingContent('');

    const history = [...messages, userMsg];
    setMessages(history);

    try {
      if (!clientRef.current) {
        throw new Error('client_init_failed');
      }

      if (!history || history.length === 0) {
        throw new Error('conv_empty');
      }

      const conv = history.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      const stream = await clientRef.current.chat({
        model,
        messages: conv,
        stream: true,
      });

      let content = '';
      for await (const chunk of stream) {
        if (!chunk) continue;
        if (chunk.response) {
          content += chunk.response;
          setStreamingContent(content);
        }
        if (chunk.done) break;
      }

      if (!content) {
        content = 'no_response';
      }

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error || 'error');
      const parts = errMsg.split(':');
      const firstPart = parts[0] || errMsg;
      const lines = firstPart.split('\n');
      const firstLine = lines[0] || firstPart;
      const shortMsg = firstLine.slice(0, 30);
      const errResponse: Message = {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        content: `error: ${shortMsg}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errResponse]);
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
      setStreamingContent('');
    }
  };

  useInput((inputChar: string, key: any) => {
    if (key.return) {
      sendMessage();
    } else if (key.ctrl && inputChar === 'c') {
      if (onExit) onExit();
      else exit();
    } else if (key.ctrl && inputChar === 'k') {
      setMessages([]);
    } else if (key.backspace || key.delete) {
      setInput((prev) => prev.slice(0, -1));
    } else if (!key.ctrl && !key.meta && inputChar) {
      setInput((prev) => prev + inputChar);
    }
  });

  const renderMsg = (msg: Message) => {
    const isUser = msg.role === 'user';
    const color = isUser ? colorMap.primary : colorMap.success;
    const label = isUser ? 'You' : 'Assistant';

    return (
      <Box key={msg.id} flexDirection="column" marginY={1}>
        <Text color={color} bold>
          {label}
        </Text>
        <Box marginLeft={2}>
          <Text>{msg.content}</Text>
        </Box>
      </Box>
    );
  };

  return (
    <Box flexDirection="column" height="100%">
      <Box flexDirection="column" flexGrow={1} paddingX={1} overflowY="hidden">
        {messages.map(renderMsg)}

        {isStreaming && (
          <Box flexDirection="column" marginY={1}>
            <Text color={colorMap.success} bold>
              Assistant
            </Text>
            <Box marginLeft={2}>
              <Text>{streamingContent}</Text>
              <Text color={colorMap.info}>
                <Spinner type="dots" />
              </Text>
            </Box>
          </Box>
        )}
      </Box>

      <Box flexDirection="column" borderStyle="round" borderColor={colorMap.primary} paddingX={2} paddingY={1} marginX={1}>
        <Box flexDirection="row" marginBottom={1}>
          <Text color={colorMap.secondary} bold>
            ▶
          </Text>
          <Box marginLeft={1}>
            <Text color={colorMap.muted} dimColor>
              Type message
            </Text>
          </Box>
          {isLoading && !isStreaming && (
            <Box marginLeft={1}>
              <Text color={colorMap.info}>
                <Spinner type="dots" />
              </Text>
            </Box>
          )}
        </Box>
        <Box paddingX={1} borderStyle="single" borderColor={colorMap.muted}>
          <Text color={input ? 'white' : colorMap.muted}>
            {input || '...'}
          </Text>
        </Box>
      </Box>
    </Box>
  );
};