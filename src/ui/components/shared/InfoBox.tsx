import React from 'react';
import { Box, Text } from 'ink';
import { colorMap } from '../../colors.js';

interface BoxProps {
  children: React.ReactNode;
  title?: string;
  type?: 'info' | 'success' | 'error' | 'warning';
}

const typeMap = {
  info: colorMap.info,
  success: colorMap.success,
  error: colorMap.error,
  warning: colorMap.warning,
};

export const InfoBox = ({ children, title, type = 'info' }: BoxProps) => {
  const color = typeMap[type];

  return (
    <Box flexDirection="column" borderStyle="single" borderColor={color} paddingX={1} paddingY={1} marginY={1}>
      {title && (
        <Text color={color} bold>
          {title}
        </Text>
      )}
      <Text>{children}</Text>
    </Box>
  );
};
