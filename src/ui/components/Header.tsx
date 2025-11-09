import React from 'react';
import { Box, Text } from 'ink';
import { colorMap } from '../colors.js';

const logo = `
 ╔═══════════════════╗
 ║  INFERRA CLI v2   ║
 ║  Local AI Server  ║
 ╚═══════════════════╝
`;

export const Header = () => {
  return (
    <>
      <Text color={colorMap.primary}>{logo}</Text>
      <Text>
        Local AI Assistant
      </Text>
    </>
  );
};