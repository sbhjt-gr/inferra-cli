import React, { useState, useRef, useEffect } from 'react';
import { Box } from 'ink';

interface ScrollableBoxProps {
  children: React.ReactNode;
  height?: number;
}

export const ScrollableBox = ({ children, height = 10 }: ScrollableBoxProps) => {
  const [scrollPos, setScrollPos] = useState(0);
  const contentRef = useRef<any>(null);

  useEffect(() => {
    if (contentRef.current) {
      setScrollPos(Math.max(0, scrollPos));
    }
  }, [scrollPos]);

  return (
    <Box flexDirection="column" height={height} overflowY="hidden">
      {children}
    </Box>
  );
};
