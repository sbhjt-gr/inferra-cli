import { useContext } from 'react';
import { StreamingContext } from '../contexts/StreamingContext.js';

export const useStreaming = () => {
  const context = useContext(StreamingContext);
  if (!context) {
    throw new Error('useStreaming must be used within StreamingProvider');
  }
  return context;
};
