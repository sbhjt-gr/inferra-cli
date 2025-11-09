import { useContext } from 'react';
import { AppConfigContext } from '../contexts/AppConfigContext.js';

export const useAppConfig = () => {
  const context = useContext(AppConfigContext);
  if (!context) {
    throw new Error('useAppConfig must be used within AppConfigProvider');
  }
  return context;
};
