import React, { createContext, ReactNode } from 'react';

export type AppConfig = {
  serverUrl: string;
  modelName: string;
  isInitialized: boolean;
};

export const AppConfigContext = createContext<AppConfig>({
  serverUrl: '',
  modelName: '',
  isInitialized: false,
});

export const AppConfigProvider = ({ children, value }: { children: ReactNode; value: AppConfig }) => (
  <AppConfigContext.Provider value={value}>{children}</AppConfigContext.Provider>
);
