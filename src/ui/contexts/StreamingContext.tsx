import React, { createContext, ReactNode } from 'react';

export type StreamingState = {
  isStreaming: boolean;
  content: string;
  done: boolean;
};

export const StreamingContext = createContext<StreamingState>({
  isStreaming: false,
  content: '',
  done: false,
});

export const StreamingProvider = ({ children, value }: { children: ReactNode; value: StreamingState }) => (
  <StreamingContext.Provider value={value}>{children}</StreamingContext.Provider>
);
