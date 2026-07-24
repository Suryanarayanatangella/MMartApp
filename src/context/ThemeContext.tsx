import { createContext, useState } from 'react';
import type { ReactNode } from 'react';

// Theme రెండే values మాత్రమే — 'light' లేదా 'dark'
export type Theme = 'light' | 'dark';

// Context లో ఉండే data యొక్క shape define చేయడం
export interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

// createContext కి default value ఇవ్వడం
// undefined గా పెట్టాం — ThemeProvider లేకుండా వాడితే runtime error వస్తుంది
export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [theme, setTheme] = useState<Theme>('light');

  const toggleTheme = (): void => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
