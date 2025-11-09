import React, { ReactNode } from 'react';
import { Box } from 'ink';
import { DefaultAppHeader } from './DefaultAppHeader.js';
import { DefaultAppFooter } from './DefaultAppFooter.js';

interface MainLayoutProps {
  children: ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <Box flexDirection="column" height="100%">
      <DefaultAppHeader />
      <Box flexDirection="column" flexGrow={1} paddingX={2} paddingY={1} overflowY="hidden">
        {children}
      </Box>
      <DefaultAppFooter />
    </Box>
  );
};
