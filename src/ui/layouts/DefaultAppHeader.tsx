import React from 'react';
import { Box, Text } from 'ink';
import Gradient from 'ink-gradient';
import { colorMap } from '../colors.js';

const logo = `
 ╔═══════════════════╗
 ║ INFERRLM CLI v2   ║
 ║  Local AI Server  ║
 ╚═══════════════════╝
`;

export const DefaultAppHeader = () => {
  return (
    <Box>
      <Text color={colorMap.primary}>{logo}</Text>
    </Box>
  );
};
