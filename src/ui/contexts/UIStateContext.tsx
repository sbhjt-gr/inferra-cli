import React, { createContext, ReactNode } from 'react';

export type UIState = {
  isLoading: boolean;
  isStreaming: boolean;
  streamedContent: string;
  error?: string;
  setupComplete: boolean;
};

export const UIStateContext = createContext<UIState>({
  isLoading: false,
  isStreaming: false,
  streamedContent: '',
  setupComplete: false,
});

export const UIStateProvider = ({ children, value }: { children: ReactNode; value: UIState }) => (
  <UIStateContext.Provider value={value}>{children}</UIStateContext.Provider>
);
