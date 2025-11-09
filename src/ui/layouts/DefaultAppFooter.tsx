import React from 'react';
import { Box, Text } from 'ink';
import { colorMap } from '../colors.js';

export const DefaultAppFooter = () => {
  return (
      <Text color={colorMap.muted} dimColor>
        [Enter: send] [Ctrl+C: exit] [Ctrl+K: clear]
      </Text>
  );
};
