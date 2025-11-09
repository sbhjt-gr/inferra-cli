import React from 'react';
import { Box, Text } from 'ink';
import Spinner from 'ink-spinner';
import { colorMap } from '../../colors.js';

interface LoadingIndicatorProps {
  message?: string;
  type?: 'dots' | 'line' | 'pipe' | 'star' | 'star2' | 'flip' | 'hamburger' | 'growVertical' | 'growHorizontal' | 'balloon' | 'balloon2' | 'noise' | 'bounce';
}

export const LoadingIndicator = ({ message = 'Loading', type = 'dots' }: LoadingIndicatorProps) => {
  return (
    <Box flexDirection="row" gap={1}>
      <Spinner type={type} />
      <Text color={colorMap.info}>{message}</Text>
    </Box>
  );
};
