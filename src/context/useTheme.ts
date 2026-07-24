import { useContext } from 'react';
import { ThemeContext } from './ThemeContext';
import type { ThemeContextType } from './ThemeContext';

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);

  // ThemeProvider లేకుండా useTheme వాడితే clear error message వస్తుంది
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
};
